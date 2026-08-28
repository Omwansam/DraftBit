/**
 * Staff accounts.
 *
 * Creating a user does not set a password — it mints a single-use invite token
 * and returns the link. Whoever accepts it chooses their own password, so no
 * administrator ever knows another person's credentials.
 */

const { prisma } = require('../config/db');
const config = require('../config/env');
const { ApiError, asyncHandler } = require('../utils/errors.util');
const { parse, line, email: emailField, enumOf, url, bool } = require('../utils/validate.util');
const { serializeUser, serializeUsers } = require('../utils/serialize.util');
const { logFor } = require('../utils/activity.util');
const { randomToken, sha256 } = require('../utils/tokens.util');
const { SAFE_USER } = require('../middleware/protect.middleware');

const ROLES = ['Owner', 'Admin', 'Editor', 'Viewer'];
const STATUSES = ['active', 'invited', 'suspended'];

const INVITE_TTL_DAYS = 7;

const createSchema = {
    name: line(120, { required: true }),
    email: emailField({ required: true, lower: true }),
    username: line(40, { pattern: /^[a-z0-9._-]+$/i, message: 'Usernames can use letters, numbers, dots, dashes and underscores.' }),
    role: enumOf(ROLES, { default: 'Editor' }),
    avatarUrl: url(),
};

const updateSchema = {
    name: line(120),
    email: emailField({ lower: true }),
    username: line(40, { pattern: /^[a-z0-9._-]+$/i }),
    role: enumOf(ROLES),
    status: enumOf(STATUSES),
    avatarUrl: url(),
};

const listSchema = {
    role: enumOf(ROLES),
    status: enumOf(STATUSES),
    q: line(200),
};

/** Derive a unique username from an email local-part when none was supplied. */
async function deriveUsername(email, preferred) {
    const base = (preferred || email.split('@')[0]).toLowerCase().replace(/[^a-z0-9._-]/g, '') || 'user';
    for (let n = 0; ; n += 1) {
        const candidate = n === 0 ? base : `${base}${n}`;
        const clash = await prisma.user.findUnique({ where: { username: candidate }, select: { id: true } });
        if (!clash) return candidate;
    }
}

/**
 * The console must never be left without an Owner — otherwise nobody can
 * manage users or settings and the only fix is a database edit.
 */
async function assertNotLastOwner(userId, { becoming } = {}) {
    const target = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
    if (target?.role !== 'Owner') return;
    if (becoming === 'Owner') return;

    const owners = await prisma.user.count({ where: { role: 'Owner', status: 'active' } });
    if (owners <= 1) {
        throw ApiError.badRequest('This is the last Owner. Promote someone else before changing this account.');
    }
}

const buildInviteLink = (token) => {
    const base = (config.ADMIN_URL || config.FRONTEND_URL || 'http://localhost:5174').replace(/\/$/, '');
    return `${base}/accept-invite?token=${token}`;
};

/* ---------------------------------- Read ---------------------------------- */

const list = asyncHandler(async (req, res) => {
    const { role, status, q } = parse(listSchema, req.query);

    const users = await prisma.user.findMany({
        where: {
            ...(role ? { role } : {}),
            ...(status ? { status } : {}),
            ...(q
                ? { OR: ['name', 'email', 'username'].map((field) => ({ [field]: { contains: q, mode: 'insensitive' } })) }
                : {}),
        },
        orderBy: [{ createdAt: 'desc' }],
        select: SAFE_USER,
    });

    res.json(serializeUsers(users));
});

const getOne = asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({ where: { id: req.params.id }, select: SAFE_USER });
    if (!user) throw ApiError.notFound('That account no longer exists.');
    res.json(serializeUser(user));
});

/* --------------------------------- Invite --------------------------------- */

const create = asyncHandler(async (req, res) => {
    const data = parse(createSchema, req.body);

    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw ApiError.conflict('Someone with that email address already has an account.');

    const token = randomToken();

    const user = await prisma.user.create({
        data: {
            ...data,
            username: await deriveUsername(data.email, data.username),
            status: 'invited',
            inviteTokenHash: sha256(token),
            inviteExpiresAt: new Date(Date.now() + INVITE_TTL_DAYS * 24 * 60 * 60 * 1000),
        },
        select: SAFE_USER,
    });

    logFor(req, 'invited', `${user.name} (${user.role})`, 'user', { id: user.id });

    // The raw token is returned exactly once and never stored — only its hash
    // is kept, so this response is the only chance to deliver the link.
    res.status(201).json({ ...serializeUser(user), inviteLink: buildInviteLink(token) });
});

const resendInvite = asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) throw ApiError.notFound('That account no longer exists.');
    if (user.status !== 'invited') throw ApiError.badRequest('That account has already been activated.');

    const token = randomToken();
    await prisma.user.update({
        where: { id: user.id },
        data: {
            inviteTokenHash: sha256(token),
            inviteExpiresAt: new Date(Date.now() + INVITE_TTL_DAYS * 24 * 60 * 60 * 1000),
        },
    });

    logFor(req, 'reissued the invitation for', user.name, 'user', { id: user.id });
    res.json({ success: true, inviteLink: buildInviteLink(token) });
});

/* --------------------------------- Update --------------------------------- */

const update = asyncHandler(async (req, res) => {
    const data = parse(updateSchema, req.body, { partial: true });

    const existing = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!existing) throw ApiError.notFound('That account no longer exists.');

    if (data.role && data.role !== existing.role) {
        await assertNotLastOwner(existing.id, { becoming: data.role });
    }
    if (data.status && data.status !== 'active' && existing.role === 'Owner') {
        await assertNotLastOwner(existing.id);
    }
    if (data.email && data.email !== existing.email) {
        const clash = await prisma.user.findUnique({ where: { email: data.email } });
        if (clash) throw ApiError.conflict('Another account already uses that email address.');
    }

    const user = await prisma.user.update({ where: { id: existing.id }, data, select: SAFE_USER });

    logFor(req, 'updated the account for', user.name, 'user', { id: user.id, fields: Object.keys(data) });
    res.json(serializeUser(user));
});

/* --------------------------------- Delete --------------------------------- */

const remove = asyncHandler(async (req, res) => {
    const existing = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!existing) throw ApiError.notFound('That account no longer exists.');

    // Deleting yourself would sign you out mid-request and, if you were the
    // only Owner, lock the console permanently.
    if (existing.id === req.user.id) {
        throw ApiError.badRequest('You cannot delete your own account.');
    }
    await assertNotLastOwner(existing.id);

    await prisma.user.delete({ where: { id: existing.id } });

    logFor(req, 'deleted the account for', existing.name, 'delete', { id: existing.id });
    res.status(204).end();
});

/* --------------------------------- Profile -------------------------------- */

/** The signed-in user editing themselves: name and avatar only, never role. */
const updateProfile = asyncHandler(async (req, res) => {
    const data = parse({ name: line(120), avatarUrl: url() }, req.body, { partial: true });

    const user = await prisma.user.update({ where: { id: req.user.id }, data, select: SAFE_USER });
    res.json(serializeUser(user));
});

module.exports = { list, getOne, create, resendInvite, update, remove, updateProfile };
