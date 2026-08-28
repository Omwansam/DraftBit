/**
 * Seeds the database with the real DraftBit content.
 *
 *   npm run seed          add or refresh content, leave everything else alone
 *   npm run seed -- --reset   wipe the seeded tables first
 *
 * Idempotent by design: every write is an upsert keyed on something stable (a
 * slug, an email, a path), so re-running after editing seed-data.js updates the
 * rows in place instead of duplicating them. That matters because this is the
 * fastest way to reset a development database to a known state, and it should
 * not be a destructive act.
 *
 * Content comes from prisma/seed-data.js, transcribed from the marketing site's
 * own src/data/site.js.
 */

require('dotenv').config();

const { prisma, disconnectDB } = require('../config/db');
const { hashPassword } = require('../utils/tokens.util');
const { sha256, randomToken } = require('../utils/tokens.util');
const { SETTINGS_ID } = require('../controllers/settings.controller');
const data = require('./seed-data');

const RESET = process.argv.includes('--reset');

const OWNER_EMAIL = (process.env.SEED_OWNER_EMAIL || 'owner@draftbit.com').toLowerCase();
const OWNER_PASSWORD = process.env.SEED_OWNER_PASSWORD || 'draftbit-owner-2026';

// The fallback above is a convenience for a local database. In production it
// would be a published password on a public host, so refuse rather than seed a
// front door whose key is in the repository.
if (process.env.NODE_ENV === 'production' && !process.env.SEED_OWNER_PASSWORD) {
    console.error(
        '\nRefusing to seed: SEED_OWNER_PASSWORD is not set and NODE_ENV=production.\n' +
        'The default password is published in this repository. Set SEED_OWNER_PASSWORD\n' +
        'in .env and run again.\n',
    );
    process.exit(1);
}
const OWNER_NAME = process.env.SEED_OWNER_NAME || 'DraftBit Owner';
/** Staff accounts all share this so every role is testable straight away. */
const STAFF_PASSWORD = process.env.SEED_STAFF_PASSWORD || OWNER_PASSWORD;

const daysAgo = (days) => new Date(Date.now() - days * 86400000);

/** MessageStatus cannot spell "in-progress"; the API serialises it back. */
const toDbStatus = (status) => (status === 'in-progress' ? 'in_progress' : status);

/* -------------------------------------------------------------------------- */

async function reset() {
    // Order matters only where a foreign key exists: ActivityLog points at User.
    await prisma.activityLog.deleteMany();
    await prisma.refreshToken.deleteMany();
    await prisma.message.deleteMany();
    await prisma.project.deleteMany();
    await prisma.insight.deleteMany();
    await prisma.career.deleteMany();
    await prisma.teamMember.deleteMany();
    await prisma.testimonial.deleteMany();
    await prisma.service.deleteMany();
    await prisma.client.deleteMany();
    await prisma.dailyTraffic.deleteMany();
    await prisma.visitorDay.deleteMany();
    await prisma.trafficSource.deleteMany();
    await prisma.pageStat.deleteMany();
    await prisma.user.deleteMany();
    await prisma.siteSetting.deleteMany();
    console.log('  cleared existing rows');
}

async function seedUsers() {
    const passwordHash = await hashPassword(OWNER_PASSWORD);
    const staffHash = await hashPassword(STAFF_PASSWORD);

    const owner = await prisma.user.upsert({
        where: { email: OWNER_EMAIL },
        update: { passwordHash, role: 'Owner', status: 'active' },
        create: {
            email: OWNER_EMAIL,
            username: OWNER_EMAIL.split('@')[0],
            name: OWNER_NAME,
            passwordHash,
            role: 'Owner',
            status: 'active',
            lastActive: new Date(),
        },
    });

    const staff = [];
    for (const person of data.users) {
        if (person.email.toLowerCase() === OWNER_EMAIL) continue;

        // An invited account has no password by design - it cannot be signed
        // into until the invite is accepted, which is the point of the flow.
        const invited = person.status === 'invited';
        const inviteToken = invited ? randomToken() : null;

        const row = await prisma.user.upsert({
            where: { email: person.email },
            update: {
                name: person.name,
                role: person.role,
                status: person.status,
                ...(invited ? {} : { passwordHash: staffHash }),
            },
            create: {
                username: person.username,
                name: person.name,
                email: person.email,
                role: person.role,
                status: person.status,
                ...(invited
                    ? {
                          inviteTokenHash: sha256(inviteToken),
                          inviteExpiresAt: new Date(Date.now() + 7 * 86400000),
                      }
                    : { passwordHash: staffHash, lastActive: daysAgo(Math.random() * 3) }),
            },
        });
        staff.push({ ...row, inviteToken });
    }

    return { owner, staff };
}

/** Upsert a collection keyed on a unique column. */
async function seedCollection(label, delegate, rows, key) {
    for (const row of rows) {
        await delegate.upsert({
            where: { [key]: row[key] },
            update: row,
            create: row,
        });
    }
    console.log(`  ${label.padEnd(13)} ${rows.length}`);
}

async function seedMessages() {
    // Messages have no natural unique key, so they are replaced wholesale.
    // Anything a person triaged in the console is seeded data anyway.
    await prisma.message.deleteMany({ where: { source: 'Contact form' } });

    for (const item of data.messages) {
        const { daysAgo: age, repliedDaysAgo, status, ...rest } = item;
        const createdAt = daysAgo(age);

        await prisma.message.create({
            data: {
                ...rest,
                status: toDbStatus(status),
                source: item.source ?? 'Contact form',
                createdAt,
                ...(repliedDaysAgo ? { repliedAt: daysAgo(repliedDaysAgo) } : {}),
            },
        });
    }
    console.log(`  messages      ${data.messages.length}`);
}

async function seedAnalytics() {
    const rows = data.trafficHistory(120);

    for (const row of rows) {
        await prisma.dailyTraffic.upsert({
            where: { date: row.date },
            update: { visitors: row.visitors, pageViews: row.pageViews, enquiries: row.enquiries },
            create: row,
        });
    }

    for (const source of data.trafficSources) {
        await prisma.trafficSource.upsert({
            where: { source: source.source },
            update: { visitors: source.visitors },
            create: source,
        });
    }

    for (const page of data.pageStats) {
        await prisma.pageStat.upsert({ where: { path: page.path }, update: page, create: page });
    }

    console.log(`  traffic       ${rows.length} days, ${data.trafficSources.length} sources, ${data.pageStats.length} pages`);
}

/** A plausible recent history, attributed to the seeded staff. */
async function seedActivity(staff) {
    const byName = (name) => staff.find((person) => person.name === name);

    const entries = [
        { actor: 'Alex Kimani', action: 'published the project', target: 'FIBI', type: 'publish', hours: 5 },
        { actor: 'Sarah Mwangi', action: 'replied to', target: 'Lucy Njeri — School management portal', type: 'message', hours: 29 },
        { actor: 'James Ochieng', action: 'updated the project', target: 'ShoeLocker', type: 'edit', hours: 34 },
        { actor: 'Sarah Mwangi', action: 'published the insight', target: 'Building for Africa, Competing Globally', type: 'publish', hours: 52 },
        { actor: 'Grace Wanjiku', action: 'opened the role', target: 'DevOps Engineer', type: 'create', hours: 79 },
        { actor: 'Alex Kimani', action: 'invited', target: 'brian@draftbit.com', type: 'user', hours: 126 },
        { actor: 'Sarah Mwangi', action: 'archived the enquiry from', target: 'Victor Kiplagat', type: 'archive', hours: 172 },
        { actor: 'James Ochieng', action: 'updated site settings', target: 'contact details', type: 'edit', hours: 200 },
    ];

    await prisma.activityLog.deleteMany();
    for (const entry of entries) {
        await prisma.activityLog.create({
            data: {
                actor: entry.actor,
                actorId: byName(entry.actor)?.id ?? null,
                action: entry.action,
                target: entry.target,
                type: entry.type,
                at: new Date(Date.now() - entry.hours * 3600000),
            },
        });
    }
    console.log(`  activity      ${entries.length}`);
}

/* -------------------------------------------------------------------------- */

async function main() {
    console.log(`\nSeeding DraftBit${RESET ? ' (reset)' : ''}...\n`);

    if (RESET) await reset();

    await prisma.siteSetting.upsert({
        where: { id: SETTINGS_ID },
        update: data.settings,
        create: { id: SETTINGS_ID, ...data.settings },
    });
    console.log('  settings      1');

    const { owner, staff } = await seedUsers();
    console.log(`  users         ${staff.length + 1}`);

    await seedCollection('projects', prisma.project, data.projects, 'slug');
    await seedCollection('insights', prisma.insight, data.insights, 'slug');
    await seedCollection('careers', prisma.career, data.careers, 'slug');
    await seedCollection('team', prisma.teamMember, data.team, 'email');

    // Testimonials, services and clients have no natural key, so they are
    // matched on the text a person would recognise them by.
    for (const row of data.testimonials) {
        const found = await prisma.testimonial.findFirst({ where: { quote: row.quote } });
        found
            ? await prisma.testimonial.update({ where: { id: found.id }, data: row })
            : await prisma.testimonial.create({ data: row });
    }
    console.log(`  testimonials  ${data.testimonials.length}`);

    for (const row of data.services) {
        const found = await prisma.service.findFirst({ where: { title: row.title } });
        found
            ? await prisma.service.update({ where: { id: found.id }, data: row })
            : await prisma.service.create({ data: row });
    }
    console.log(`  services      ${data.services.length}`);

    for (const row of data.clients) {
        const found = await prisma.client.findFirst({ where: { name: row.name } });
        found
            ? await prisma.client.update({ where: { id: found.id }, data: row })
            : await prisma.client.create({ data: row });
    }
    console.log(`  clients       ${data.clients.length}`);

    await seedMessages();
    await seedAnalytics();
    await seedActivity(staff);

    const invited = staff.filter((person) => person.inviteToken);

    console.log('\nSign in at the admin console:');
    console.log(`  ${owner.email.padEnd(24)} ${OWNER_PASSWORD}   (Owner)`);
    for (const person of staff.filter((p) => !p.inviteToken)) {
        console.log(`  ${person.email.padEnd(24)} ${STAFF_PASSWORD}   (${person.role})`);
    }
    if (invited.length) {
        console.log('\nOutstanding invitation (single use, 7 days):');
        for (const person of invited) {
            console.log(`  ${person.email} -> ${process.env.ADMIN_URL || 'http://localhost:5174'}/accept-invite?token=${person.inviteToken}`);
        }
    }
    console.log('\nChange these passwords before this is reachable from anywhere real.\n');
}

main()
    .catch((error) => {
        console.error('\nSeed failed:', error.message);
        process.exitCode = 1;
    })
    .finally(disconnectDB);
