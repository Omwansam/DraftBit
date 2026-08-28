/**
 * Password hashing and the refresh-token family.
 *
 * Access tokens are short-lived JWTs the console holds in memory. Refresh
 * tokens are opaque random strings kept in an httpOnly cookie; only their
 * SHA-256 is stored, so a database leak does not hand over live sessions.
 */

const crypto = require('node:crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/env');
const { prisma } = require('../config/db');

// ~250ms on commodity hardware: expensive enough to make offline cracking of a
// stolen hash costly, cheap enough not to be a DoS vector on the login path.
const BCRYPT_ROUNDS = 12;

const REFRESH_TTL_DAYS = Number.parseInt(process.env.REFRESH_TTL_DAYS || '30', 10);

/**
 * A real hash compared against when the email does not exist, so the "unknown
 * account" and "wrong password" paths burn comparable CPU. Without it, response
 * timing tells an attacker which addresses are registered.
 */
const DUMMY_HASH = bcrypt.hashSync('draftbit-timing-equalizer-not-a-real-password', BCRYPT_ROUNDS);

const hashPassword = (plain) => bcrypt.hash(plain, BCRYPT_ROUNDS);

/** Always runs a compare, even with no stored hash, to keep timing flat. */
const verifyPassword = (plain, hash) => bcrypt.compare(plain, hash || DUMMY_HASH);

const signAccessToken = (user) =>
    jwt.sign({ id: user.id, role: user.role }, config.JWT_SECRET, { expiresIn: config.JWT_EXPIRES_IN });

const sha256 = (value) => crypto.createHash('sha256').update(value).digest('hex');

/** Opaque, 256 bits of entropy — never a JWT, so it carries no readable claims. */
const randomToken = () => crypto.randomBytes(32).toString('hex');

async function issueRefreshToken(user, req, replacedFrom = null) {
    const token = randomToken();
    const expiresAt = new Date(Date.now() + REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000);

    await prisma.refreshToken.create({
        data: {
            userId: user.id,
            tokenHash: sha256(token),
            expiresAt,
            userAgent: req.get('user-agent')?.slice(0, 255) ?? null,
            ip: req.ip ?? null,
            ...(replacedFrom ? { replacedBy: replacedFrom } : {}),
        },
    });

    return { token, expiresAt };
}

/**
 * Exchange a refresh token for its record, or null.
 *
 * A token that exists but is already revoked is treated as a replay: the whole
 * family is killed, because the legitimate holder and an attacker cannot both
 * be trusted once one token has been used twice.
 */
async function consumeRefreshToken(token) {
    if (typeof token !== 'string' || !/^[a-f0-9]{64}$/i.test(token)) return null;

    const record = await prisma.refreshToken.findUnique({
        where: { tokenHash: sha256(token) },
        include: { user: true },
    });
    if (!record) return null;

    if (record.revokedAt) {
        await prisma.refreshToken.updateMany({
            where: { userId: record.userId, revokedAt: null },
            data: { revokedAt: new Date() },
        });
        return null;
    }

    if (record.expiresAt <= new Date()) return null;

    await prisma.refreshToken.update({
        where: { id: record.id },
        data: { revokedAt: new Date() },
    });

    return record;
}

const revokeAllForUser = (userId) =>
    prisma.refreshToken.updateMany({ where: { userId, revokedAt: null }, data: { revokedAt: new Date() } });

/** Cookie attributes shared by set and clear — they must match or the browser keeps both. */
const refreshCookieOptions = () => ({
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    ...(config.NODE_ENV === 'production' ? { secure: true } : {}),
});

module.exports = {
    BCRYPT_ROUNDS,
    REFRESH_TTL_DAYS,
    hashPassword,
    verifyPassword,
    signAccessToken,
    sha256,
    randomToken,
    issueRefreshToken,
    consumeRefreshToken,
    revokeAllForUser,
    refreshCookieOptions,
};
