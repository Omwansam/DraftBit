/**
 * Database shapes -> API shapes.
 *
 * Only one field actually needs translating: MessageStatus.in_progress cannot
 * be spelled "in-progress" in a Prisma enum, and the console spells it with a
 * hyphen everywhere. Doing the swap here keeps every route and both frontends
 * free of the underscore.
 */

const messageStatusToApi = (status) => (status === 'in_progress' ? 'in-progress' : status);
const messageStatusToDb = (status) => (status === 'in-progress' ? 'in_progress' : status);

/** `ip` and `userAgent` are captured for abuse triage and never leave the server. */
const serializeMessage = (row) => {
    if (!row) return row;
    const { ip, userAgent, ...rest } = row;
    return { ...rest, status: messageStatusToApi(row.status) };
};

const serializeMessages = (rows) => rows.map(serializeMessage);

/** The console edits settings as one object; the id column is noise to it. */
const serializeSettings = (row) => {
    if (!row) return row;
    const { id, updatedById, ...rest } = row;
    return rest;
};

/** Never let a password hash or an invite token reach a response. */
const serializeUser = (row) => {
    if (!row) return row;
    const { passwordHash, inviteTokenHash, inviteExpiresAt, ...rest } = row;
    return rest;
};

const serializeUsers = (rows) => rows.map(serializeUser);

module.exports = {
    messageStatusToApi,
    messageStatusToDb,
    serializeMessage,
    serializeMessages,
    serializeSettings,
    serializeUser,
    serializeUsers,
};
