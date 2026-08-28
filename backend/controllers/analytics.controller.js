/**
 * Traffic figures for the dashboard and the analytics screen.
 *
 * The console does its own windowing and delta maths over the raw series, so
 * these hand back plain arrays rather than pre-aggregating into a shape only
 * one chart can use.
 */

const { prisma } = require('../config/db');
const { asyncHandler } = require('../utils/errors.util');
const { parse, int } = require('../utils/validate.util');
const { topPages, trafficSeries, trafficSources } = require('../utils/analytics.util');

const daysSchema = { days: int({ min: 1, max: 365, default: 90 }) };

const overview = asyncHandler(async (req, res) => {
    const { days } = parse(daysSchema, req.query);
    const [traffic, sources, pages] = await Promise.all([trafficSeries(days), trafficSources(), topPages()]);
    res.json({ traffic, trafficSources: sources, topPages: pages });
});

const traffic = asyncHandler(async (req, res) => {
    const { days } = parse(daysSchema, req.query);
    res.json(await trafficSeries(days));
});

const sources = asyncHandler(async (_req, res) => {
    res.json(await trafficSources());
});

const pages = asyncHandler(async (_req, res) => {
    res.json(await topPages());
});

/**
 * The dashboard's stat tiles: current window, the previous window of equal
 * length for the deltas, and the counts the sidebar badges show.
 */
const summary = asyncHandler(async (req, res) => {
    const requested = parse(daysSchema, req.query).days;
    // Two windows are fetched, so cap the half at 180 to bound the query.
    const days = Math.min(requested, 180);
    const series = await trafficSeries(days * 2);

    const current = series.slice(-days);
    const previous = series.slice(0, days);

    const sum = (rows, key) => rows.reduce((acc, row) => acc + row[key], 0);
    // A percentage change from zero is undefined, not infinite - the console
    // renders null as "no comparison" rather than a misleading spike.
    const delta = (curr, prev) => (prev === 0 ? null : ((curr - prev) / prev) * 100);

    const visitors = sum(current, 'visitors');
    const pageViews = sum(current, 'pageViews');
    const enquiries = sum(current, 'enquiries');

    const [unreadMessages, openRoles, publishedProjects, draftProjects, draftInsights, pendingTestimonials] =
        await Promise.all([
            prisma.message.count({ where: { read: false, status: { not: 'spam' } } }),
            prisma.career.count({ where: { status: 'open' } }),
            prisma.project.count({ where: { status: 'published' } }),
            prisma.project.count({ where: { status: 'draft' } }),
            prisma.insight.count({ where: { status: 'draft' } }),
            prisma.testimonial.count({ where: { status: 'pending' } }),
        ]);

    res.json({
        days,
        visitors,
        pageViews,
        enquiries,
        conversion: visitors === 0 ? 0 : (enquiries / visitors) * 100,
        pagesPerVisit: visitors === 0 ? 0 : pageViews / visitors,
        visitorsDelta: delta(visitors, sum(previous, 'visitors')),
        pageViewsDelta: delta(pageViews, sum(previous, 'pageViews')),
        enquiriesDelta: delta(enquiries, sum(previous, 'enquiries')),
        unreadMessages,
        openRoles,
        publishedProjects,
        draftCount: draftProjects + draftInsights,
        pendingTestimonials,
    });
});

module.exports = { overview, traffic, sources, pages, summary };
