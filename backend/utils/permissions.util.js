/**
 * Capability matrix. The admin console hides what a role cannot do, but that is
 * presentation only — this is the copy that actually decides, and it has to
 * stay in step with admin/src/context/AuthContext.jsx.
 */
const PERMISSIONS = {
    Owner: ['read', 'write', 'publish', 'delete', 'manage_users', 'manage_settings'],
    Admin: ['read', 'write', 'publish', 'delete', 'manage_users', 'manage_settings'],
    Editor: ['read', 'write', 'publish'],
    Viewer: ['read'],
};

/** Unknown roles fall back to Viewer rather than to full access. */
const can = (role, permission) => (PERMISSIONS[role] ?? PERMISSIONS.Viewer).includes(permission);

module.exports = { PERMISSIONS, can };
