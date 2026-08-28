/**
 * Seeds the first Owner, so there is a way into the console on a fresh
 * database. Idempotent: re-running it updates the existing account rather than
 * failing on the unique email.
 *
 *   npm run seed
 *
 * Credentials come from SEED_OWNER_EMAIL / SEED_OWNER_PASSWORD.
 */

require('dotenv').config();
const { prisma, disconnectDB } = require('../config/db');
const { hashPassword } = require('../utils/tokens.util');

const EMAIL = process.env.SEED_OWNER_EMAIL || 'owner@draftbit.com';
const PASSWORD = process.env.SEED_OWNER_PASSWORD || 'draftbit-owner-2026';
const NAME = process.env.SEED_OWNER_NAME || 'DraftBit Owner';

async function main() {
    const passwordHash = await hashPassword(PASSWORD);

    const owner = await prisma.user.upsert({
        where: { email: EMAIL.toLowerCase() },
        update: { passwordHash, role: 'Owner', status: 'active' },
        create: {
            email: EMAIL.toLowerCase(),
            username: EMAIL.split('@')[0].toLowerCase(),
            name: NAME,
            passwordHash,
            role: 'Owner',
            status: 'active',
        },
    });

    // The settings row is upserted on first read too, but seeding it here means
    // a fresh database has one before anyone opens the console.
    await prisma.siteSetting.upsert({
        where: { id: 'site' },
        update: {},
        create: { id: 'site', name: 'DraftBit' },
    });

    console.log(`Seeded Owner: ${owner.email}`);
    console.log(`Password:     ${PASSWORD}`);
    console.log('\nChange it after your first sign-in.');
}

main()
    .catch((error) => {
        console.error('Seed failed:', error.message);
        process.exitCode = 1;
    })
    .finally(disconnectDB);
