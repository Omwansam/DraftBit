/**
 * Sign-in, session refresh, and the invite hand-off.
 *
 * There is no public signup: this is a staff console. Accounts are created by
 * someone with manage_users (see user.controller.js), which mints an invite
 * token; accepting that invite is the only way an account gets a password.
 */

const { prisma } = require('../config/db');
const { ApiError, asyncHandler } = require('../utils/errors.util');
const { parse, str, email: emailField } = require('../utils/validate.util');
const { validatePassword } = require('../utils/password-policy.util');
const { serializeUser } = require('../utils/serialize.util');
const { logActivity } = require('../utils/activity.util');
const { SAFE_USER } = require('../middleware/protect.middleware');
const {
    hashPassword,
    verifyPassword,
    signAccessToken,
    sha256,
    issueRefreshToken,
    consumeRefreshToken,
    revokeAllForUser,
    refreshCookieOptions,
} = require('../utils/tokens.util');

const REFRESH_COOKIE = 'draftbit_refresh';

const loginSchema = {
    email: emailField({ required: true, lower: true }),
    password: str({ required: true, max: 200, trim: false }),
};

const acceptInviteSchema = {
    token: str({ required: true, min: 64, max: 64, pattern: /^[a-f0-9]{64}$/i, message: 'That invitation link is not valid.' }),
    password: str({ required: true, max: 200, trim: false }),
};

const changePasswordSchema = {
    currentPassword: str({ required: true, max: 200, trim: false }),
    newPassword: str({ required: true, max: 200, trim: false }),
};

/** One place that builds the authenticated response, so login and refresh agree. */
async function sendSession(user, req, res, statusCode = 200) {
    const { token: refreshToken } = await issueRefreshToken(user, req);
    const accessToken = signAccessToken(user);

    res.status(statusCode)
        .cookie(REFRESH_COOKIE, refreshToken, {
            ...refreshCookieOptions(),
            maxAge: 30 * 24 * 60 * 60 * 1000,
        })
        .json({ success: true, token: accessToken, user: serializeUser(user) });
}

/* --------------------------------- Sign in -------------------------------- */

const login = asyncHandler(async (req, res) => {
    const { email, password } = parse(loginSchema, req.body);

    const user = await prisma.user.findUnique({ where: { email } });

    // The compare runs even with no user, so response timing does not reveal
    // which addresses are registered.
    const ok = await verifyPassword(password, user?.passwordHash);

    // One message for "no such account", "wrong password" and "never accepted
    // the invite" — anything more specific enumerates staff accounts.
    if (!user || !ok || !user.passwordHash) {
        throw ApiError.unauthorized('Incorrect email or password.');
    }
    if (user.status === 'invited') {
        throw ApiError.unauthorized('That invitation has not been accepted yet.');
    }
    if (user.status !== 'active') {
        throw ApiError.forbidden('This account has been suspended.');
    }

    // Feeds the console's "last active" column. A failure here must not cost
    // the user their sign-in.
    prisma.user
        .update({ where: { id: user.id }, data: { lastActive: new Date() } })
        .catch((error) => console.error('[auth] could not stamp last active:', error.message));

    await sendSession(user, req, res);
});

/* --------------------------------- Refresh -------------------------------- */

/**
 * Rotate the refresh token. The old one is spent on use, so a stolen copy is
 * only good until the real holder next refreshes — at which point the replay
 * is detected and the whole family is revoked.
 */
const refresh = asyncHandler(async (req, res) => {
    const presented = req.cookies?.[REFRESH_COOKIE];
    const record = await consumeRefreshToken(presented);

    if (!record) {
        res.clearCookie(REFRESH_COOKIE, refreshCookieOptions());
        throw ApiError.unauthorized('Your session has expired. Please sign in again.');
    }
    if (record.user.status !== 'active') {
        res.clearCookie(REFRESH_COOKIE, refreshCookieOptions());
        throw ApiError.forbidden('This account is no longer active.');
    }

    await sendSession(record.user, req, res);
});

/* --------------------------------- Sign out ------------------------------- */

const logout = asyncHandler(async (req, res) => {
    const presented = req.cookies?.[REFRESH_COOKIE];
    if (presented) {
        await prisma.refreshToken
            .updateMany({ where: { tokenHash: sha256(presented), revokedAt: null }, data: { revokedAt: new Date() } })
            .catch(() => {});
    }

    res.clearCookie(REFRESH_COOKIE, refreshCookieOptions());
    res.json({ success: true, message: 'Signed out.' });
});

/* ----------------------------------- Me ----------------------------------- */

const me = asyncHandler(async (req, res) => {
    res.json({ success: true, user: req.user });
});

/* ------------------------------ Invite hand-off --------------------------- */

/** Lets the invite page tell a live link from a stale one before showing the form. */
const checkInvite = asyncHandler(async (req, res) => {
    const token = String(req.query.token || '');
    if (!/^[a-f0-9]{64}$/i.test(token)) throw ApiError.badRequest('That invitation link is not valid.');

    const user = await prisma.user.findUnique({ where: { inviteTokenHash: sha256(token) } });
    if (!user || !user.inviteExpiresAt || user.inviteExpiresAt <= new Date()) {
        throw ApiError.badRequest('That invitation has expired. Ask an administrator to send a new one.');
    }

    res.json({ success: true, email: user.email, name: user.name });
});

const acceptInvite = asyncHandler(async (req, res) => {
    const { token, password } = parse(acceptInviteSchema, req.body);

    const user = await prisma.user.findUnique({ where: { inviteTokenHash: sha256(token) } });
    if (!user || !user.inviteExpiresAt || user.inviteExpiresAt <= new Date()) {
        throw ApiError.badRequest('That invitation has expired. Ask an administrator to send a new one.');
    }

    const check = validatePassword(password, { email: user.email, name: user.name });
    if (!check.ok) throw ApiError.badRequest(check.error);

    const updated = await prisma.user.update({
        where: { id: user.id },
        data: {
            passwordHash: await hashPassword(password),
            status: 'active',
            // Single use: the token dies with the acceptance.
            inviteTokenHash: null,
            inviteExpiresAt: null,
            lastActive: new Date(),
        },
    });

    logActivity({ actor: updated.name, actorId: updated.id, action: 'accepted their invitation', type: 'user' });
    await sendSession(updated, req, res);
});

/* ----------------------------- Change password ---------------------------- */

const changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = parse(changePasswordSchema, req.body);

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!(await verifyPassword(currentPassword, user.passwordHash))) {
        throw ApiError.badRequest('Your current password is not right.');
    }

    const check = validatePassword(newPassword, { email: user.email, name: user.name });
    if (!check.ok) throw ApiError.badRequest(check.error);

    if (await verifyPassword(newPassword, user.passwordHash)) {
        throw ApiError.badRequest('Choose a password you have not used before.');
    }

    await prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: await hashPassword(newPassword) },
    });

    // Every other session dies with the change — this is what makes a password
    // change actually evict someone who already holds a token.
    await revokeAllForUser(user.id);

    logFor(req);
    await sendSession({ ...user, ...req.user }, req, res);
});

// Small local helper kept out of the flow above for readability.
function logFor(req) {
    logActivity({
        actor: req.user.name,
        actorId: req.user.id,
        action: 'changed their password',
        type: 'user',
    });
}

module.exports = { login, refresh, logout, me, checkInvite, acceptInvite, changePassword, REFRESH_COOKIE, SAFE_USER };
