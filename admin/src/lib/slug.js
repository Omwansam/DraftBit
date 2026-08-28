/** URL-safe slug from a title, matching the slugs used on the public site. */
export function slugify(value = '') {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

/** Appends -2, -3 … until the slug is unique within `existing`. */
export function uniqueSlug(value, existing = [], ignoreId = null) {
  const base = slugify(value) || 'untitled'
  const taken = new Set(
    existing.filter((item) => item.id !== ignoreId).map((item) => item.slug),
  )
  if (!taken.has(base)) return base

  let n = 2
  while (taken.has(`${base}-${n}`)) n += 1
  return `${base}-${n}`
}
