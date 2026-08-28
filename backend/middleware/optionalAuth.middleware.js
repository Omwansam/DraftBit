const jwt = require('jsonwebtoken');
const config = require('../config/env');
const { prisma } = require('../config/db');
const { SAFE_USER } = require('./protect.middleware');

/**
 * Attach req.user when a valid token is present, and carry on when it is not.
 *
 * For endpoints whose response changes with who is asking rather than whose
 * access does. A bad or expired token is treated as no token: this never
 * rejects, so a stale session degrades to the public view instead of erroring.
 */
const optionalAuth = async (req, _res, next) => {
    try {
        const header = req.headers.authorization;
        const token = header && header.startsWith('Bearer ')
            ? header.slice(7)
            : req.cookies?.token;

        if (!token) return next();

        const decoded = jwt.verify(token, config.JWT_SECRET);
        const user = await prisma.user.findUnique({ where: { id: decoded.id }, select: SAFE_USER });
        if (user && user.status === 'active') req.user = user;
    } catch {
        // Deliberately swallowed: an unreadable token is simply an anonymous
        // visitor here.
    }
    next();
};

module.exports = optionalAuth;
