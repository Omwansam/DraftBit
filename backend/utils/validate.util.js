/**
 * Request validation, hand-rolled — no zod.
 *
 * A schema is a plain object of `field -> descriptor`, where a descriptor is
 * built by one of the helpers below. `parse()` walks it and returns a new
 * object containing only declared fields, coerced to the right type. Anything
 * the client sent that the schema does not mention is dropped, so a caller
 * cannot smuggle `role: "Owner"` into a profile update by adding it to the
 * body.
 *
 * Two modes:
 *   parse(schema, input)                 - create. Applies defaults, enforces required.
 *   parse(schema, input, { partial: true }) - update. Absent fields stay absent,
 *                                             no defaults, nothing is required;
 *                                             a PATCH must not blank the columns
 *                                             it did not mention.
 */

const { ApiError } = require('./errors.util');

/* ------------------------------- Descriptors ------------------------------ */

const descriptor = (type, opts = {}) => ({ type, ...opts });

const str = (opts = {}) => descriptor('string', opts);
const text = (max = 5000, opts = {}) => descriptor('string', { max, ...opts });
const line = (max = 200, opts = {}) => descriptor('string', { max, ...opts });
const int = (opts = {}) => descriptor('int', opts);
const num = (opts = {}) => descriptor('number', opts);
const bool = (opts = {}) => descriptor('boolean', opts);
const arr = (of, opts = {}) => descriptor('array', { of, ...opts });
const enumOf = (values, opts = {}) => descriptor('enum', { values, ...opts });
const json = (opts = {}) => descriptor('json', opts);
const date = (opts = {}) => descriptor('date', opts);
const email = (opts = {}) => descriptor('email', { max: 200, ...opts });
const url = (opts = {}) => descriptor('url', { max: 500, ...opts });
const id = (opts = {}) => descriptor('string', { min: 1, max: 40, ...opts });

/* --------------------------------- Coercion -------------------------------- */

const EMAIL_RE = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/;

/** Accepts an absolute http(s) URL or a site-relative path; rejects javascript:. */
const isSafeUrl = (value) => {
    if (value.startsWith('/')) return true;
    try {
        const parsed = new URL(value);
        return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
        return false;
    }
};

function coerce(field, raw, rule) {
    const fail = (message) => {
        throw ApiError.badRequest(message, { field });
    };

    switch (rule.type) {
        case 'string':
        case 'email':
        case 'url': {
            if (typeof raw === 'number' || typeof raw === 'boolean') raw = String(raw);
            if (typeof raw !== 'string') fail(`${field} must be text.`);

            let value = rule.trim === false ? raw : raw.trim();
            if (rule.lower) value = value.toLowerCase();

            if (rule.min != null && value.length < rule.min) {
                fail(rule.message || `${field} must be at least ${rule.min} character${rule.min === 1 ? '' : 's'}.`);
            }
            if (rule.max != null && value.length > rule.max) {
                fail(`${field} must be ${rule.max} characters or fewer.`);
            }
            if (rule.pattern && value && !rule.pattern.test(value)) {
                fail(rule.message || `${field} is not in the expected format.`);
            }
            if (rule.type === 'email' && value && !EMAIL_RE.test(value)) {
                fail('Enter a valid email address.');
            }
            if (rule.type === 'url' && value && !isSafeUrl(value)) {
                fail(`${field} must be a valid http(s) URL.`);
            }
            return value;
        }

        case 'int':
        case 'number': {
            const value = typeof raw === 'string' ? Number(raw.trim()) : Number(raw);
            if (!Number.isFinite(value)) fail(`${field} must be a number.`);
            if (rule.type === 'int' && !Number.isInteger(value)) fail(`${field} must be a whole number.`);
            if (rule.min != null && value < rule.min) fail(`${field} must be at least ${rule.min}.`);
            if (rule.max != null && value > rule.max) fail(`${field} must be at most ${rule.max}.`);
            return value;
        }

        case 'boolean': {
            if (typeof raw === 'boolean') return raw;
            // Query strings only ever carry text, so "true"/"false" have to work.
            if (raw === 'true' || raw === '1') return true;
            if (raw === 'false' || raw === '0') return false;
            return fail(`${field} must be true or false.`);
        }

        case 'enum': {
            const value = typeof raw === 'string' ? raw.trim() : raw;
            if (!rule.values.includes(value)) {
                fail(`${field} must be one of: ${rule.values.join(', ')}.`);
            }
            return value;
        }

        case 'array': {
            // `?ids=a,b,c` is accepted alongside a real JSON array, because some
            // clients drop the body on DELETE.
            let items = raw;
            if (typeof raw === 'string') items = raw.split(',').map((s) => s.trim()).filter(Boolean);
            if (!Array.isArray(items)) fail(`${field} must be a list.`);
            if (rule.max != null && items.length > rule.max) {
                fail(`${field} cannot have more than ${rule.max} items.`);
            }
            if (rule.min != null && items.length < rule.min) {
                fail(`${field} needs at least ${rule.min} item${rule.min === 1 ? '' : 's'}.`);
            }
            return rule.of ? items.map((item, i) => coerce(`${field}[${i}]`, item, rule.of)) : items;
        }

        case 'json': {
            if (raw === null) return null;
            if (typeof raw !== 'object') fail(`${field} must be an object.`);
            return raw;
        }

        case 'date': {
            const value = raw instanceof Date ? raw : new Date(raw);
            if (Number.isNaN(value.getTime())) fail(`${field} must be a valid date.`);
            return value;
        }

        default:
            throw new Error(`Unknown validator type: ${rule.type}`);
    }
}

/* ---------------------------------- parse --------------------------------- */

function parse(schema, input, { partial = false } = {}) {
    const source = input && typeof input === 'object' ? input : {};
    const out = {};

    for (const [field, rule] of Object.entries(schema)) {
        const raw = source[field];
        const missing = raw === undefined || raw === null || raw === '';

        if (missing) {
            // An explicit empty string is a real value for an optional text
            // column — it is how the console clears a field.
            if (raw === '' && !partial && rule.default === undefined && !rule.required) {
                continue;
            }
            if (partial) continue;
            if (rule.required) throw ApiError.badRequest(rule.message || `${field} is required.`, { field });
            if (rule.default !== undefined) {
                out[field] = typeof rule.default === 'function' ? rule.default() : rule.default;
            }
            continue;
        }

        out[field] = coerce(field, raw, rule);
    }

    return out;
}

/**
 * Express middleware. Validated output replaces req.body and lands on
 * req.query2 for queries — Express 5 makes req.query a getter-only property,
 * so the coerced version cannot be assigned back over it.
 */
const validate = ({ body, query, params } = {}) => (req, _res, next) => {
    try {
        if (body) req.body = parse(body, req.body, { partial: req.method === 'PATCH' && body.__partial !== false });
        if (query) req.query2 = parse(query, req.query);
        if (params) req.params2 = parse(params, req.params);
        next();
    } catch (err) {
        next(err);
    }
};

module.exports = {
    parse, validate,
    str, text, line, int, num, bool, arr, enumOf, json, date, email, url, id,
};
