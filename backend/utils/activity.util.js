const { prisma } = require('../config/db');

/**
 * Append to the activity feed.
 *
 * Deliberately fire-and-forget: the feed is a convenience, and a failed insert
 * must never turn a successful save into an error the user sees. Failures are
 * logged for operators instead of propagating.
 */
function logActivity({ actor, actorId = null, action, target = '', type = 'edit', meta = null }) {
    return prisma.activityLog
        .create({ data: { actor, actorId, action, target, type, meta } })
        .catch((error) => {
            console.error('[activity] could not record entry:', error.message);
        });
}

/** The same, with the acting user taken from the request. */
function logFor(req, action, target = '', type = 'edit', meta = null) {
    return logActivity({
        actor: req.user?.name ?? 'System',
        actorId: req.user?.id ?? null,
        action,
        target,
        type,
        meta,
    });
}

module.exports = { logActivity, logFor };
