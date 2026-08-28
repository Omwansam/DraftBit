/** Formatting helpers shared by tables, stat tiles and charts. */

const NUMBER = new Intl.NumberFormat('en-US')

/** 1284 -> "1,284" */
export const formatNumber = (n) => NUMBER.format(Number(n) || 0)

/** Compact form for stat tiles: 1284 -> "1,284", 12900 -> "12.9K". */
export function formatCompact(n) {
  const value = Number(n) || 0
  const abs = Math.abs(value)
  if (abs >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`
  if (abs >= 10_000) return `${(value / 1000).toFixed(1).replace(/\.0$/, '')}K`
  return NUMBER.format(value)
}

export function formatCurrency(n, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(Number(n) || 0)
}

/** Signed percentage for deltas: 12.4 -> "+12.4%" */
export const formatDelta = (n) => `${n > 0 ? '+' : ''}${Number(n).toFixed(1)}%`

export function formatDate(value, opts = {}) {
  if (!value) return '—'
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...opts,
  })
}

export function formatDateTime(value) {
  if (!value) return '—'
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return `${formatDate(date)} · ${date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  })}`
}

/** "3 hours ago" / "in 2 days" — falls back to an absolute date past a month. */
export function formatRelative(value) {
  if (!value) return '—'
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return '—'

  const seconds = Math.round((date.getTime() - Date.now()) / 1000)
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
  const units = [
    ['second', 60],
    ['minute', 60],
    ['hour', 24],
    ['day', 7],
    ['week', 4.35],
  ]

  let duration = seconds
  for (const [unit, step] of units) {
    if (Math.abs(duration) < step) return rtf.format(Math.round(duration), unit)
    duration /= step
  }
  return formatDate(date)
}

/** Initials for avatar chips: "Alex Kimani" -> "AK". */
export function initials(name = '') {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

/** Trim a long string to a word boundary. */
export function truncate(text = '', max = 90) {
  if (text.length <= max) return text
  return `${text.slice(0, text.lastIndexOf(' ', max)).trimEnd()}…`
}
