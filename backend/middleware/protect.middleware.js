const jwt = require('jsonwebtoken');
const config = require('../config/env');
const { prisma } = require('../config/db');

/** Columns safe to attach to req.user — never the password or invite hashes. */
const SAFE_USER = {
    id: true,
    username: true,
    name: true,
    email: true,
    role: true,
    status: true,
    avatarUrl: true,
    lastActive: true,
    createdAt: true,
};

const readToken = (req) => {
    const header = req.headers.authorization;
    if (header && header.startsWith('Bearer ')) return header.slice(7);
    // The console holds the access token in memory and sends it as a bearer;
    // the cookie is the fallback for same-site requests.
    if (req.cookies && req.cookies.token) return req.cookies.token;
    return null;
};

const protect = async (req, res, next) => {
    try {
        const token = readToken(req);
        if (!token) {
            return res.status(401).json({ success: false, error: 'Please sign in to continue.' });
        }

        const decoded = jwt.verify(token, config.JWT_SECRET);
        const user = await prisma.user.findUnique({ where: { id: decoded.id }, select: SAFE_USER });

        if (!user) {
            return res.status(401).json({ success: false, error: 'That account no longer exists.' });
        }

        // A suspended account keeps its rows and its history, but every live
        // token stops working the moment the status changes — otherwise
        // suspending someone would not take effect until their token expired.
        if (user.status !== 'active') {
            return res.status(403).json({
                success: false,
                error:
                    user.status === 'invited'
                        ? 'Accept your invitation before signing in.'
                        : 'This account has been suspended.',
            });
        }

        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ success: false, error: 'Your session expired. Please sign in again.' });
        }
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ success: false, error: 'Invalid session. Please sign in again.' });
        }
        next(error);
    }
};

module.exports = protect;
module.exports.SAFE_USER = SAFE_USER;
