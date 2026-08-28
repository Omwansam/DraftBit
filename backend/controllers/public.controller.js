/**
 * The unauthenticated surface: what the marketing site reads, plus the two
 * things it writes (an enquiry, and a page view).
 *
 * Nothing here requires a token, so every route is either a published-only
 * projection of a collection or a narrowly shaped, rate-limited write. Draft
 * content is filtered in the query, not in the response - a `status` field the
 * client is trusted to ignore is not a filter.
 */

const { prisma } = require('../config/db');
const { ApiError, asyncHandler } = require('../utils/errors.util');
const { parse, line, text, url, email, int, bool } = require('../utils/validate.util');
const { logActivity } = require('../utils/activity.util');
const { bumpDaily, classifyReferrer, dayKey } = require('../utils/analytics.util');
const { resources } = require('../config/resources');
const { readSettings } = require('./settings.controller');

/** Columns that exist for the console's benefit and mean nothing publicly. */
const HIDDEN = new Set(['status', 'views', 'order', 'applicants', 'createdAt', 'updatedAt']);

const strip = (row) => Object.fromEntries(Object.entries(row).filter(([key]) => !HIDDEN.has(key)));

const contactSchema = {
    name: line(120, { required: true, min: 1, message: 'Please tell us your name.' }),
    email: email({ required: true, lower: true }),
    subject: line(200, { default: '' }),
    message: text(5000, { required: true, min: 10, message: 'Please give us a little more detail.' }),
    source: line(60, { default: 'Contact form' }),
    // Honeypot: a field styled out of sight that only a bot fills in. Cheap,
    // invisible to real users, and catches most drive-by form spam.
    website: line(200),
};

const trackSchema = {
    path: line(300, { required: true, min: 1 }),
    title: line(200, { default: '' }),
    /** Anonymous, client-generated, rotated by the site - never a user id. */
    visitorId: line(64, { required: true, min: 8 }),
    referrer: url({ default: '' }),
    seconds: int({ min: 0, max: 3600, default: 0 }),
    bounced: bool({ default: false }),
};

/* ------------------------------- Whole site ------------------------------- */

/** One round trip for a cold page load, instead of eight. */
const site = asyncHandler(async (_req, res) => {
    const names = Object.keys(resources);
    const [settings, ...collections] = await Promise.all([
        readSettings(),
        ...Object.values(resources).map((config) =>
            prisma[config.model].findMany({ where: config.publicWhere, orderBy: config.publicOrderBy }),
        ),
    ]);

    const payload = { settings };
    names.forEach((name, i) => {
        payload[name] = collections[i].map(strip);
    });

    res.json(payload);
});

/* --------------------------- One per collection --------------------------- */

const listCollection = (config) =>
    asyncHandler(async (_req, res) => {
        const rows = await prisma[config.model].findMany({
            where: config.publicWhere,
            orderBy: config.publicOrderBy,
        });
        res.json(rows.map(strip));
    });

const getBySlug = (config) =>
    asyncHandler(async (req, res) => {
        const row = await prisma[config.model].findFirst({
            where: { slug: String(req.params.slug), ...config.publicWhere },
        });
        if (!row) throw ApiError.notFound(`No ${config.noun} at that address.`);

        // View counting is best-effort: a failed increment must not turn a
        // readable page into an error.
        prisma[config.model]
            .update({ where: { id: row.id }, data: { views: { increment: 1 } } })
            .catch(() => {});

        res.json(strip(row));
    });

/* ------------------------------ Contact form ------------------------------ */

const contact = asyncHandler(async (req, res) => {
    const { website, ...data } = parse(contactSchema, req.body);

    if (website) {
        // Answer exactly as if it worked: telling a bot it was caught only tells
        // whoever wrote it which field to leave alone next time.
        return res.status(201).json({ ok: true });
    }

    const message = await prisma.message.create({
        data: {
            ...data,
            ip: req.ip,
            userAgent: req.get('user-agent')?.slice(0, 255) ?? null,
        },
    });

    await bumpDaily('enquiries');
    logActivity({
        actor: data.name,
        action: 'sent an enquiry',
        target: data.subject || data.email,
        type: 'message',
        meta: { id: message.id },
    });

    res.status(201).json({ ok: true, id: message.id });
});

/* ------------------------------ Page tracking ----------------------------- */

const track = asyncHandler(async (req, res) => {
    const { path, title, visitorId, referrer, seconds, bounced } = parse(trackSchema, req.body);
    const date = dayKey();

    await bumpDaily('pageViews');

    // The row's existence is what makes this a new visitor. Letting the unique
    // constraint decide is race-free; a read-then-write would double-count two
    // tabs opened at once.
    let firstToday = true;
    try {
        await prisma.visitorDay.create({ data: { date, visitorKey: visitorId } });
    } catch (err) {
        if (err?.code !== 'P2002') throw err;
        firstToday = false;
    }

    if (firstToday) {
        await bumpDaily('visitors');
        const source = classifyReferrer(referrer, req.hostname);
        await prisma.trafficSource.upsert({
            where: { source },
            update: { visitors: { increment: 1 } },
            create: { source, visitors: 1 },
        });
    }

    await prisma.pageStat.upsert({
        where: { path },
        update: {
            views: { increment: 1 },
            totalSeconds: { increment: seconds },
            bounces: { increment: bounced ? 1 : 0 },
            ...(title ? { title } : {}),
        },
        create: { path, title, views: 1, totalSeconds: seconds, bounces: bounced ? 1 : 0 },
    });

    res.status(202).json({ ok: true });
});

module.exports = { site, listCollection, getBySlug, contact, track };
