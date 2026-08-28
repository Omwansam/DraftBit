import { useEffect, useRef, useState } from 'react'

/**
 * Shared chart plumbing: the categorical slot order, scales, tick logic and the
 * path builders for marks.
 *
 * Colors are referenced as CSS custom properties rather than literals so the
 * light and dark steps — validated separately against their own surfaces —
 * swap with the theme class without any JS.
 */

/** Categorical slots, assigned in fixed order and never cycled. */
export const SERIES = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
  'var(--chart-6)',
]

/** Slot for series index `i`. Past the 6th slot the caller must fold the tail
 *  into "Other" or facet — a generated 7th hue would collapse under CVD. */
export const seriesColor = (i) => SERIES[i] ?? 'var(--de-emphasis)'

export const INK = {
  primary: 'var(--foreground)',
  secondary: 'var(--muted-foreground)',
  muted: 'var(--subtle-foreground)',
  grid: 'var(--grid)',
  axis: 'var(--axis)',
  surface: 'var(--surface)',
  deEmphasis: 'var(--de-emphasis)',
}

/**
 * Tracks a container's width so the SVG can be sized in real pixels rather than
 * scaled through a viewBox — scaling would stretch the type with the chart.
 *
 * The container the ref lands on must be able to shrink independently of the
 * SVG it holds. A grid or flex item defaults to `min-width: auto`, which floors
 * it at its content's min-content width — the SVG's own width — so the chart
 * measures wide, renders wide, and props its column open at every viewport
 * below that. Every consumer therefore renders the ref onto a
 * `w-full min-w-0` element, and the charts' own grid items carry `min-w-0` too.
 */
export function useChartWidth() {
  const ref = useRef(null)
  /* Starts at 0 deliberately. Seeding a guessed width makes the first paint
     render an SVG at that intrinsic size, which props the container open before
     the observer can report the real one; callers hold back the SVG until this
     is non-zero and reserve the height instead. */
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const node = ref.current
    if (!node) return undefined

    const observer = new ResizeObserver(([entry]) => {
      const next = entry.contentRect.width
      if (next > 0) setWidth(next)
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return [ref, width]
}

/** Rounds a domain maximum up to a clean axis number (0 / 500 / 1,000 …). */
export function niceMax(value) {
  if (value <= 0) return 1
  const exponent = Math.floor(Math.log10(value))
  const magnitude = 10 ** exponent
  const normalized = value / magnitude
  const step = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 2.5 ? 2.5 : normalized <= 5 ? 5 : 10
  return step * magnitude
}

/** Evenly spaced clean tick values from 0 to `max`. */
export function ticksFor(max, count = 4) {
  const top = niceMax(max)
  return Array.from({ length: count + 1 }, (_, i) => (top / count) * i)
}

/**
 * Path for a bar with its *data end* rounded and its baseline end square.
 * `orientation` is 'up' (columns) or 'right' (horizontal bars).
 */
export function barPath({ x, y, width, height, radius = 4, orientation = 'up' }) {
  const r = Math.max(0, Math.min(radius, orientation === 'up' ? height : width, (orientation === 'up' ? width : height) / 2))
  if (r === 0 || height <= 0 || width <= 0) {
    return `M${x},${y}h${width}v${height}h${-width}Z`
  }

  if (orientation === 'up') {
    // Rounded at the top (the data end), square where it meets the baseline.
    return [
      `M${x},${y + height}`,
      `V${y + r}`,
      `Q${x},${y} ${x + r},${y}`,
      `H${x + width - r}`,
      `Q${x + width},${y} ${x + width},${y + r}`,
      `V${y + height}`,
      'Z',
    ].join(' ')
  }

  // Rounded at the right (the data end), square at the left baseline.
  return [
    `M${x},${y}`,
    `H${x + width - r}`,
    `Q${x + width},${y} ${x + width},${y + r}`,
    `V${y + height - r}`,
    `Q${x + width},${y + height} ${x + width - r},${y + height}`,
    `H${x}`,
    'Z',
  ].join(' ')
}

/** Smooth-ish polyline through points using a monotone-safe cubic. */
export function linePath(points) {
  if (!points.length) return ''
  if (points.length < 3) {
    return points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')
  }

  let d = `M${points[0].x},${points[0].y}`
  for (let i = 0; i < points.length - 1; i += 1) {
    const p0 = points[i === 0 ? 0 : i - 1]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[i + 2] ?? p2
    const t = 0.18 // low tension — keeps the line honest, no invented overshoot
    const c1x = p1.x + (p2.x - p0.x) * t
    const c1y = p1.y + (p2.y - p0.y) * t
    const c2x = p2.x - (p3.x - p1.x) * t
    const c2y = p2.y - (p3.y - p1.y) * t
    d += ` C${c1x},${c1y} ${c2x},${c2y} ${p2.x},${p2.y}`
  }
  return d
}

/** Compact axis tick label: 1200 -> "1.2k". */
export function tickLabel(value) {
  const n = Number(value)
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}m`
  if (Math.abs(n) >= 1000) return `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k`
  return String(Math.round(n))
}
