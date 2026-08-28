const { can } = require('../utils/permissions.util');

/**
 * Gate a route on a capability rather than on a role name.
 *
 * Routes say what they need ("write", "publish"), not who is allowed — so
 * adding a role means editing utils/permissions.util.js once instead of hunting for
 * every `authorize('Admin', 'Editor')` in the codebase.
 */
const requirePermission = (permission) => (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ success: false, error: 'Please sign in to continue.' });
    }
    if (!can(req.user.role, permission)) {
        return res.status(403).json({
            success: false,
            error: `Your role (${req.user.role}) cannot ${permission.replace('_', ' ')}.`,
        });
    }
    next();
};

module.exports = requirePermission;
