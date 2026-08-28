/**
 * One CRUD implementation, built per collection from config/resources.js.
 *
 * Beyond the obvious verbs it covers the three things the console does that
 * plain REST does not: bulk patch (select rows, archive them), bulk delete, and
 * reorder (drag a service up the list). Doing those one request per row would
 * be N round trips and N activity-log entries for a single user gesture.
 */

const { prisma } = require('../config/db');
const { ApiError, asyncHandler } = require('../utils/errors.util');
const { parse, line, int, bool, arr, str } = require('../utils/validate.util');
const { logFor } = require('../utils/activity.util');
const { uniqueSlug } = require('../utils/slug.util');
const { can } = require('../utils/permissions.util');

const listSchema = {
    status: line(40),
    q: line(200),
    featured: bool(),
    limit: int({ min: 1, max: 500 }),
    offset: int({ min: 0 }),
};

const idsSchema = { ids: arr(str({ min: 1, max: 40 }), { min: 1, max: 500, required: true }) };

/** Values that mean "the public can see this". */
const PUBLISHED = new Set(['published', 'open']);

function resourceController(name, config) {
    const delegate = () => prisma[config.model];
    const labelOf = (record) => record?.[config.label] ?? record?.id ?? '';

    /**
     * Publishing is a separate capability from editing, so a role that may
     * draft but not publish cannot reach the public site by sending `status`
     * directly in the body.
     */
    const assertPublishAllowed = (req, data) => {
        if (!data || !('status' in data)) return;
        if (!PUBLISHED.has(data.status)) return;
        if (can(req.user?.role, 'publish')) return;
        throw ApiError.forbidden(`Your role (${req.user?.role ?? 'Viewer'}) cannot publish.`);
    };

    const prepare = async (data, existing, req) => {
        assertPublishAllowed(req, data);
        let next = { ...data };

        if (config.slugFrom) {
            if (next.slug) {
                next.slug = await uniqueSlug(config.model, next.slug, existing?.id ?? null);
            } else if (!existing) {
                // Only mint a slug on create. Re-slugging on every rename would
                // break every public URL the moment someone fixes a typo.
                next.slug = await uniqueSlug(config.model, next[config.slugFrom] ?? 'untitled');
            }
        }

        if (config.beforeWrite) next = config.beforeWrite(next, existing);
        return next;
    };

    const requireExisting = async (id) => {
        const record = await delegate().findUnique({ where: { id } });
        if (!record) throw ApiError.notFound(`That ${config.noun} no longer exists.`);
        return record;
    };

    /* --------------------------------- Read -------------------------------- */

    const list = asyncHandler(async (req, res) => {
        const { status, q, featured, limit, offset } = parse(listSchema, req.query);

        const rows = await delegate().findMany({
            where: {
                ...(status ? { status } : {}),
                ...(featured !== undefined ? { featured } : {}),
                ...(q && config.searchFields?.length
                    ? { OR: config.searchFields.map((field) => ({ [field]: { contains: q, mode: 'insensitive' } })) }
                    : {}),
            },
            orderBy: config.orderBy,
            ...(limit ? { take: limit } : {}),
            ...(offset ? { skip: offset } : {}),
        });

        res.json(rows);
    });

    const getOne = asyncHandler(async (req, res) => {
        res.json(await requireExisting(req.params.id));
    });

    /* -------------------------------- Create ------------------------------- */

    const create = asyncHandler(async (req, res) => {
        const data = await prepare(parse(config.create, req.body), null, req);
        const record = await delegate().create({ data });

        logFor(req, `created the ${config.noun}`, labelOf(record), 'create', { id: record.id, collection: name });
        res.status(201).json(record);
    });

    /* -------------------------------- Update ------------------------------- */

    const update = asyncHandler(async (req, res) => {
        const existing = await requireExisting(req.params.id);
        const patch = parse(config.update, req.body, { partial: true });
        const data = await prepare(patch, existing, req);

        const record = await delegate().update({ where: { id: existing.id }, data });

        const published = PUBLISHED.has(patch.status) && !PUBLISHED.has(existing.status);
        logFor(
            req,
            published ? `published the ${config.noun}` : `updated the ${config.noun}`,
            labelOf(record),
            published ? 'publish' : 'edit',
            { id: record.id, collection: name },
        );

        res.json(record);
    });

    const bulkUpdate = asyncHandler(async (req, res) => {
        const { ids } = parse(idsSchema, req.body);
        const patch = parse(config.update, req.body.patch, { partial: true });
        assertPublishAllowed(req, patch);

        const result = await delegate().updateMany({ where: { id: { in: ids } }, data: patch });
        const rows = await delegate().findMany({ where: { id: { in: ids } }, orderBy: config.orderBy });

        logFor(req, `updated ${result.count} ${config.noun}${result.count === 1 ? '' : 's'}`, '', 'edit', {
            collection: name, ids, patch,
        });
        res.json({ count: result.count, records: rows });
    });

    /* -------------------------------- Delete ------------------------------- */

    const remove = asyncHandler(async (req, res) => {
        const existing = await requireExisting(req.params.id);
        await delegate().delete({ where: { id: existing.id } });

        logFor(req, `deleted the ${config.noun}`, labelOf(existing), 'delete', { id: existing.id, collection: name });
        res.status(204).end();
    });

    const bulkRemove = asyncHandler(async (req, res) => {
        // `?ids=a,b,c` as well as a body, because some clients drop the body on DELETE.
        const source = req.query.ids ? req.query : req.body;
        const { ids } = parse(idsSchema, source);

        const rows = await delegate().findMany({ where: { id: { in: ids } } });
        const result = await delegate().deleteMany({ where: { id: { in: ids } } });

        logFor(
            req,
            `deleted ${result.count} ${config.noun}${result.count === 1 ? '' : 's'}`,
            rows.map(labelOf).slice(0, 3).join(', '),
            'delete',
            { collection: name, ids },
        );
        res.json({ count: result.count });
    });

    /* ------------------------------- Reorder ------------------------------- */

    const reorder = asyncHandler(async (req, res) => {
        const { ids } = parse(idsSchema, req.body);

        // One transaction: a half-applied reorder leaves two rows claiming the
        // same position and the list renders in an order nobody chose.
        await prisma.$transaction(
            ids.map((id, index) => delegate().update({ where: { id }, data: { order: index } })),
        );

        const rows = await delegate().findMany({ orderBy: config.orderBy });
        logFor(req, `reordered ${name}`, '', 'edit', { collection: name });
        res.json(rows);
    });

    return { list, getOne, create, update, bulkUpdate, remove, bulkRemove, reorder };
}

module.exports = resourceController;
