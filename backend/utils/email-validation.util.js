/**
 * Email admission checks shared by the auth controller and the rate limiters.
 *
 * Three layers, cheapest first:
 *   normalizeEmail        — canonical form, safe to use as a map/limiter key
 *   isPlausibleEmail      — pure syntax, no I/O
 *   validateEmailForSignup — syntax + disposable blocklist + MX lookup (async)
 *
 * Only the first two are on the request-rate path, so neither does I/O: a
 * limiter that awaited DNS would hand an attacker a way to stall the event loop
 * simply by posting unusual addresses.
 */

const dns = require('node:dns').promises;

/**
 * Deliberately stricter than RFC 5322 (which permits quoted strings and
 * comments) and looser than a deliverability check. It exists to reject typos
 * and junk before they reach the database, not to be a parser.
 */
const EMAIL_RE = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/;

/** Local-part length cap from RFC 5321 §4.5.3.1; the whole address caps at 254. */
const MAX_LOCAL = 64;
const MAX_TOTAL = 254;

/**
 * Domains that accept mail but hand out throwaway inboxes. Signups from these
 * pass an MX check yet cannot be contacted later, so a password reset or an
 * ownership notice would silently go nowhere.
 */
const DISPOSABLE_DOMAINS = new Set([
    '10minutemail.com', 'guerrillamail.com', 'guerrillamail.net', 'sharklasers.com',
    'mailinator.com', 'tempmail.com', 'temp-mail.org', 'throwawaymail.com',
    'yopmail.com', 'trashmail.com', 'getnada.com', 'dispostable.com',
    'fakeinbox.com', 'maildrop.cc', 'mintemail.com', 'mohmal.com',
    'spamgourmet.com', 'tempinbox.com', 'emailondeck.com', 'burnermail.io',
]);

/**
 * Reserved by RFC 2606/6761 for documentation and testing. They will never have
 * a real MX, so they are named here to produce a clear error instead of a
 * generic DNS failure.
 */
const PLACEHOLDER_DOMAINS = new Set([
    'example.com', 'example.net', 'example.org', 'example.edu',
    'test.com', 'test', 'invalid', 'localhost', 'local',
]);

/**
 * Canonical form for storage, lookup and limiter keys.
 *
 * Case-folds the whole address. The local part is technically case-sensitive
 * per RFC 5321, but no mainstream provider treats it that way, and folding it
 * is what stops `User@x.com` and `user@x.com` from registering as two accounts.
 * Returns '' for anything non-string so callers can use it without guarding.
 */
function normalizeEmail(value) {
    if (typeof value !== 'string') return '';
    return value.trim().toLowerCase();
}

/** Syntax only. No I/O — safe to call on every request. */
function isPlausibleEmail(value) {
    const email = normalizeEmail(value);
    if (!email || email.length > MAX_TOTAL) return false;
    if (!EMAIL_RE.test(email)) return false;
    const [local] = email.split('@');
    return local.length <= MAX_LOCAL;
}

function domainOf(email) {
    return email.slice(email.lastIndexOf('@') + 1);
}

/**
 * Does this domain accept mail at all?
 *
 * A domain with no MX but a valid A/AAAA record is still deliverable — RFC 5321
 * §5.1 says senders fall back to the address record — so the A lookup is a
 * second chance, not a formality.
 *
 * A DNS outage must not become a signup outage, so anything other than a
 * definitive "no such domain" resolves to accepted.
 */
async function domainAcceptsMail(domain) {
    try {
        const mx = await dns.resolveMx(domain);
        if (mx && mx.length > 0) return { ok: true };
    } catch (err) {
        if (err.code !== 'ENOTFOUND' && err.code !== 'ENODATA') {
            return { ok: true, unverified: true };
        }
    }

    try {
        const records = await dns.resolve4(domain);
        if (records && records.length > 0) return { ok: true };
    } catch (err) {
        if (err.code !== 'ENOTFOUND' && err.code !== 'ENODATA') {
            return { ok: true, unverified: true };
        }
    }

    return { ok: false };
}

/**
 * Full admission check for registration.
 *
 * Resolves to { ok: true, email } with the normalized address the caller should
 * persist, or { ok: false, error } with a message safe to show the user.
 */
async function validateEmailForSignup(value) {
    const email = normalizeEmail(value);

    if (!email) {
        return { ok: false, error: 'Email is required' };
    }
    if (!isPlausibleEmail(email)) {
        return { ok: false, error: 'Enter a valid email address' };
    }

    const domain = domainOf(email);

    if (PLACEHOLDER_DOMAINS.has(domain)) {
        return { ok: false, error: 'Enter a real email address you can receive mail at' };
    }
    if (DISPOSABLE_DOMAINS.has(domain)) {
        return { ok: false, error: 'Disposable email addresses are not accepted. Use a permanent address.' };
    }

    const deliverable = await domainAcceptsMail(domain);
    if (!deliverable.ok) {
        return { ok: false, error: `No mail server found for "${domain}". Check the address for a typo.` };
    }

    return { ok: true, email };
}

module.exports = {
    normalizeEmail,
    isPlausibleEmail,
    validateEmailForSignup,
    DISPOSABLE_DOMAINS,
    PLACEHOLDER_DOMAINS,
};
