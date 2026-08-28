/**
 * Traffic aggregation for the dashboard.
 *
 * Counters are rolled up per day on write (POST /public/track) rather than
 * scanned at read time — drawing a 90-day line from raw hits would mean
 * touching every event ever recorded on every dashboard load.
 */

const { prisma } = require('../config/db');

/** Midnight UTC for a given day, matching the @db.Date column. */
function dayKey(when = new Date()) {
    return new Date(Date.UTC(when.getUTCFullYear(), when.getUTCMonth(), when.getUTCDate()));
}

/** Increment one counter on today's rollup row, creating it on first hit. */
function bumpDaily(field, amount = 1) {
    const date = dayKey();
    return prisma.dailyTraffic.upsert({
        where: { date },
        update: { [field]: { increment: amount } },
        create: { date, [field]: amount },
    });
}

/**
 * Bucket a referrer into the handful of sources the dashboard charts.
 * Anything from our own hostname is Direct, not a referral from ourselves.
 */
function classifyReferrer(referrer, selfHost) {
    if (!referrer) return 'Direct';

    let host;
    try {
        host = new URL(referrer).hostname.replace(/^www\./, '').toLowerCase();
    } catch {
        return 'Direct';
    }

    if (selfHost && host === String(selfHost).replace(/^www\./, '').toLowerCase()) return 'Direct';
    if (/(google|bing|duckduckgo|yahoo|ecosia|brave)\./.test(host)) return 'Organic search';
    if (/(linkedin|twitter|x\.com|facebook|instagram|youtube|tiktok|reddit|threads)\./.test(host)) return 'Social';
    if (/(mail\.|outlook|gmail)/.test(host)) return 'Email';
    return 'Referral';
}

/**
 * A dense day-by-day series: days with no traffic come back as zeroes rather
 * than gaps, so the chart draws a continuous line instead of interpolating
 * across a quiet weekend.
 */
async function trafficSeries(days = 90) {
    const end = dayKey();
    const start = new Date(end);
    start.setUTCDate(start.getUTCDate() - (days - 1));

    const rows = await prisma.dailyTraffic.findMany({
        where: { date: { gte: start, lte: end } },
        orderBy: { date: 'asc' },
    });

    const byDate = new Map(rows.map((row) => [row.date.toISOString().slice(0, 10), row]));
    const series = [];

    for (let i = 0; i < days; i += 1) {
        const cursor = new Date(start);
        cursor.setUTCDate(cursor.getUTCDate() + i);
        const key = cursor.toISOString().slice(0, 10);
        const row = byDate.get(key);

        series.push({
            date: key,
            visitors: row?.visitors ?? 0,
            pageViews: row?.pageViews ?? 0,
            enquiries: row?.enquiries ?? 0,
        });
    }

    return series;
}

async function trafficSources() {
    const rows = await prisma.trafficSource.findMany({ orderBy: { visitors: 'desc' } });
    const total = rows.reduce((sum, row) => sum + row.visitors, 0);

    return rows.map((row) => ({
        source: row.source,
        visitors: row.visitors,
        share: total === 0 ? 0 : (row.visitors / total) * 100,
    }));
}

/** avgTime and bounce rate are derived here so both stay right as counters grow. */
async function topPages(limit = 10) {
    const rows = await prisma.pageStat.findMany({ orderBy: { views: 'desc' }, take: limit });

    return rows.map((row) => ({
        path: row.path,
        title: row.title,
        views: row.views,
        avgTime: row.views === 0 ? 0 : Math.round(row.totalSeconds / row.views),
        bounceRate: row.views === 0 ? 0 : (row.bounces / row.views) * 100,
    }));
}

module.exports = { dayKey, bumpDaily, classifyReferrer, trafficSeries, trafficSources, topPages };
