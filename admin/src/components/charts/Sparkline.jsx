import { linePath, seriesColor } from './chartTheme'

/**
 * 12-point trend line for stat tiles. Decorative context, not a readable chart:
 * no axes, no labels — the tile's value and delta carry the numbers.
 */
export default function Sparkline({
  values,
  width = 96,
  height = 28,
  color = seriesColor(0),
  filled = true,
}) {
  if (!values?.length) return null

  const max = Math.max(...values)
  const min = Math.min(...values)
  const span = max - min || 1

  const points = values.map((v, i) => ({
    x: (i / Math.max(1, values.length - 1)) * width,
    y: height - ((v - min) / span) * (height - 4) - 2,
  }))

  const d = linePath(points)
  const last = points.at(-1)

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="block overflow-visible"
      aria-hidden="true"
      focusable="false"
    >
      {filled && (
        <path d={`${d} L${width},${height} L0,${height} Z`} fill={color} opacity="0.1" />
      )}
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx={last.x}
        cy={last.y}
        r="2.5"
        fill={color}
        stroke="var(--surface)"
        strokeWidth="1.5"
      />
    </svg>
  )
}
