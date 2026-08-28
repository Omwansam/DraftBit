/**
 * Site settings - one row, id "site".
 *
 * Read by anyone signed in (the console shows the form read-only to Viewers);
 * written only with manage_settings, which is where the public site's contact
 * details and SEO copy actually live.
 */

const { prisma } = require('../config/db');
const { asyncHandler } = require('../utils/errors.util');
const { parse, line, text, url, email, json } = require('../utils/validate.util');
const { logFor } = require('../utils/activity.util');
const { serializeSettings } = require('../utils/serialize.util');

const SETTINGS_ID = 'site';

const updateSchema = {
    name: line(120),
    tagline: line(200),
    description: text(1000),
    email: email({ lower: true }),
    phone: line(40),
    location: line(200),
    address: line(300),
    mapUrl: url(),
    mission: text(2000),
    vision: text(2000),
    // Grouped sub-objects the console edits as a unit. They stay JSON because
    // they are read and written whole; splitting them into columns would mean
    // a migration every time a social link is added.
    social: json(),
    stats: json(),
    businessHours: json(),
    seo: json(),
    features: json(),
};

/** Reading settings must never 404 on a fresh database. */
async function readSettings() {
    const row = await prisma.siteSetting.upsert({
        where: { id: SETTINGS_ID },
        update: {},
        create: { id: SETTINGS_ID },
    });
    return serializeSettings(row);
}

const get = asyncHandler(async (_req, res) => {
    res.json(await readSettings());
});

const save = asyncHandler(async (req, res) => {
    const patch = parse(updateSchema, req.body, { partial: true });
    const data = { ...patch, updatedById: req.user.id };

    const row = await prisma.siteSetting.upsert({
        where: { id: SETTINGS_ID },
        update: data,
        create: { id: SETTINGS_ID, ...data },
    });

    logFor(req, 'updated site settings', Object.keys(patch).join(', '), 'edit');
    res.json(serializeSettings(row));
});

module.exports = { get, save, readSettings, SETTINGS_ID };
