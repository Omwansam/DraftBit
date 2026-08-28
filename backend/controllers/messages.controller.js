/**
 * The enquiry inbox.
 *
 * Reading is a read; triage (star, archive, mark read, spam) is a write;
 * deleting is a delete. A Viewer can therefore see the inbox but cannot
 * quietly mark everything read, which is what the console's UI already implies.
 */

const { prisma } = require('../config/db');
const { ApiError, asyncHandler } = require('../utils/errors.util');
const { parse, line, int, bool, enumOf, arr, str } = require('../utils/validate.util');
const { logFor } = require('../utils/activity.util');
const { messageStatusToDb, serializeMessage, serializeMessages } = require('../utils/serialize.util');

const API_STATUSES = ['new', 'in-progress', 'replied', 'archived', 'spam', 'closed'];

const listSchema = {
    status: enumOf(API_STATUSES),
    read: bool(),
    starred: bool(),
    q: line(200),
    limit: int({ min: 1, max: 1000 }),
};

const patchSchema = {
    read: bool(),
    starred: bool(),
    status: enumOf(API_STATUSES),
};

const idsSchema = { ids: arr(str({ min: 1, max: 40 }), { min: 1, max: 500, required: true }) };

/** API shape -> database shape, plus the timestamp a reply implies. */
function toDbPatch(patch) {
    const data = { ...patch };
    if (patch.status) {
        data.status = messageStatusToDb(patch.status);
        // A reply is a fact with a time; the inbox shows "replied" but the row
        // should be able to say when.
        if (patch.status === 'replied') data.repliedAt = new Date();
    }
    return data;
}

/* ---------------------------------- Read ---------------------------------- */

const list = asyncHandler(async (req, res) => {
    const { status, read, starred, q, limit } = parse(listSchema, req.query);

    const rows = await prisma.message.findMany({
        where: {
            ...(status ? { status: messageStatusToDb(status) } : {}),
            ...(read !== undefined ? { read } : {}),
            ...(starred !== undefined ? { starred } : {}),
            ...(q
                ? {
                      OR: ['name', 'email', 'subject', 'message'].map((field) => ({
                          [field]: { contains: q, mode: 'insensitive' },
                      })),
                  }
                : {}),
        },
        orderBy: { createdAt: 'desc' },
        ...(limit ? { take: limit } : {}),
    });

    res.json(serializeMessages(rows));
});

/** Unread count for the sidebar badge, without shipping the whole inbox. */
const unreadCount = asyncHandler(async (_req, res) => {
    const count = await prisma.message.count({ where: { read: false, status: { not: 'spam' } } });
    res.json({ count });
});

const getOne = asyncHandler(async (req, res) => {
    const found = await prisma.message.findUnique({ where: { id: req.params.id } });
    if (!found) throw ApiError.notFound('That message no longer exists.');
    res.json(serializeMessage(found));
});

/* --------------------------------- Triage --------------------------------- */

const update = asyncHandler(async (req, res) => {
    const existing = await prisma.message.findUnique({ where: { id: req.params.id } });
    if (!existing) throw ApiError.notFound('That message no longer exists.');

    const patch = parse(patchSchema, req.body, { partial: true });
    const data = toDbPatch(patch);

    const updated = await prisma.message.update({ where: { id: existing.id }, data });

    // Opening a message marks it read, which would otherwise fill the activity
    // feed with noise. Only a real triage decision is worth logging.
    if (data.status && data.status !== existing.status) {
        logFor(
            req,
            `marked the enquiry from ${existing.name} as ${data.status.replace('_', ' ')}`,
            existing.subject,
            'message',
            { id: existing.id },
        );
    }

    res.json(serializeMessage(updated));
});

const bulkUpdate = asyncHandler(async (req, res) => {
    const { ids } = parse(idsSchema, req.body);
    const data = toDbPatch(parse(patchSchema, req.body.patch, { partial: true }));

    const result = await prisma.message.updateMany({ where: { id: { in: ids } }, data });
    const rows = await prisma.message.findMany({ where: { id: { in: ids } }, orderBy: { createdAt: 'desc' } });

    if (data.status) {
        logFor(
            req,
            `moved ${result.count} enquir${result.count === 1 ? 'y' : 'ies'} to ${data.status.replace('_', ' ')}`,
            '',
            'message',
            { ids },
        );
    }

    res.json({ count: result.count, records: serializeMessages(rows) });
});

/* --------------------------------- Delete --------------------------------- */

const remove = asyncHandler(async (req, res) => {
    const existing = await prisma.message.findUnique({ where: { id: req.params.id } });
    if (!existing) throw ApiError.notFound('That message no longer exists.');

    await prisma.message.delete({ where: { id: existing.id } });
    logFor(req, 'deleted the enquiry from', existing.name, 'delete', { id: existing.id });

    res.status(204).end();
});

const bulkRemove = asyncHandler(async (req, res) => {
    const { ids } = parse(idsSchema, req.query.ids ? req.query : req.body);
    const result = await prisma.message.deleteMany({ where: { id: { in: ids } } });

    logFor(req, `deleted ${result.count} enquir${result.count === 1 ? 'y' : 'ies'}`, '', 'delete', { ids });
    res.json({ count: result.count });
});

module.exports = { list, unreadCount, getOne, update, bulkUpdate, remove, bulkRemove };
