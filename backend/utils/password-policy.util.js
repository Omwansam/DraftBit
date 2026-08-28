/**
 * Password admission. Length is the dominant factor in resistance to offline
 * cracking, so the floor is 10 rather than a shorter length propped up by
 * character-class rules that mostly produce "Password1!".
 */
const MIN_LENGTH = 10;
const MAX_LENGTH = 200;

const COMMON = new Set([
    'password', 'password1', 'password123', '12345678', '123456789', 'qwertyuiop',
    'letmein123', 'welcome123', 'admin12345', 'draftbit123', 'changeme123',
]);

function validatePassword(password, { email = '', name = '' } = {}) {
    if (typeof password !== 'string' || !password) {
        return { ok: false, error: 'Choose a password.' };
    }
    if (password.length < MIN_LENGTH) {
        return { ok: false, error: `Use at least ${MIN_LENGTH} characters.` };
    }
    if (password.length > MAX_LENGTH) {
        return { ok: false, error: `Keep it under ${MAX_LENGTH} characters.` };
    }
    if (COMMON.has(password.toLowerCase())) {
        return { ok: false, error: 'That password is too common. Pick something less predictable.' };
    }

    // A password built from the account it protects is the first thing anyone
    // targeting this person would try.
    const lower = password.toLowerCase();
    const localPart = String(email).split('@')[0]?.toLowerCase();
    if (localPart && localPart.length >= 3 && lower.includes(localPart)) {
        return { ok: false, error: 'Do not build your password out of your email address.' };
    }
    for (const part of String(name).toLowerCase().split(/\s+/)) {
        if (part.length >= 4 && lower.includes(part)) {
            return { ok: false, error: 'Do not build your password out of your name.' };
        }
    }

    return { ok: true };
}

module.exports = { validatePassword, MIN_LENGTH };
