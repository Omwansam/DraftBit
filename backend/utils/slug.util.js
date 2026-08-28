const { prisma } = require('../config/db');

/** Lowercase, hyphenated, ASCII-safe. Diacritics are stripped, not dropped. */
const slugify = (value) =>
    String(value ?? '')
        .normalize('NFKD')
        .replace(/[̀-ͯ]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 80) || 'untitled';

/**
 * A slug no other row is using. Collisions get `-2`, `-3`, and so on.
 *
 * `excludeId` is the record being edited, so saving a project without renaming
 * it does not bump its own slug to `about-2` by colliding with itself.
 */
async function uniqueSlug(model, source, excludeId = null) {
    const base = slugify(source);
    let candidate = base;

    for (let n = 2; ; n += 1) {
        const clash = await prisma[model].findFirst({
            where: { slug: candidate, ...(excludeId ? { id: { not: excludeId } } : {}) },
            select: { id: true },
        });
        if (!clash) return candidate;
        candidate = `${base}-${n}`;
    }
}

module.exports = { slugify, uniqueSlug };
