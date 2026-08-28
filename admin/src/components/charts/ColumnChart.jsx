import { useState } from 'react'
import { barPath, INK, niceMax, seriesColor, tickLabel, ticksFor, useChartWidth } from './chartTheme'
import { formatNumber } from '../../lib/format'

const PAD = { top: 14, right: 8, bottom: 28, left: 40 }
const MAX_BAR = 24 // cap the mark; never fill the whole band

/**
 * Vertical columns for one measure across a small set of categories.
 *
 * `data`: [{ label, value }]
 */
export default function ColumnChart({
  data,
  height = 220,
  valueFormat = formatNumber,
  color = seriesColor(0),
}) {
  const [ref, width] = useChartWidth()
  const [hover, setHover] = useState(null)

  const plotW = Math.max(0, width - PAD.left - PAD.right)
  const plotH = Math.max(0, height - PAD.top - PAD.bottom)

  const peak = Math.max(1, ...data.map((d) => d.value))
  const max = niceMax(peak)
  const ticks = ticksFor(peak, 4)

  const band = data.length ? plotW / data.length : plotW
  // A 2px surface gap does the separating between neighbours — never a stroke.
  const barW = Math.min(MAX_BAR, Math.max(6, band - 12))

  if (!width) return <div ref={ref} className="w-full min-w-0" style={{ height }} />

  return (
    <div ref={ref} className="relative w-full min-w-0">
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="Value by category"
        className="block"
      >
        <g transform={`translate(${PAD.left},${PAD.top})`}>
          {ticks.map((t) => {
            const y = plotH - (t / max) * plotH
            return (
              <g key={t}>
                <line
                  x1={0} x2={plotW} y1={y} y2={y}
                  stroke={t === 0 ? INK.axis : INK.grid}
                  strokeWidth="1"
                  shapeRendering="crispEdges"
                />
                <text
                  x={-8} y={y} dy="0.32em" textAnchor="end"
                  fill={INK.muted} fontSize="10.5" className="tnum"
                >
                  {tickLabel(t)}
                </text>
              </g>
            )
          })}

          {data.map((row, i) => {
            const h = Math.max(2, (row.value / max) * plotH)
            const x = i * band + (band - barW) / 2
            const isHovered = hover === i

            return (
              <g
                key={row.label}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
              >
                <rect x={i * band} y={0} width={band} height={plotH} fill="transparent" />
                <path
                  d={barPath({ x, y: plotH - h, width: barW, height: h, radius: 4, orientation: 'up' })}
                  fill={color}
                  opacity={hover == null || isHovered ? 1 : 0.55}
                  style={{ transition: 'opacity 120ms' }}
                />
                {isHovered && (
                  <text
                    x={x + barW / 2}
                    y={plotH - h - 7}
                    textAnchor="middle"
                    fill={INK.primary}
                    fontSize="11"
                    fontWeight="600"
                    className="tnum"
                  >
                    {valueFormat(row.value)}
                  </text>
                )}
                <text
                  x={x + barW / 2}
                  y={plotH + 16}
                  textAnchor="middle"
                  fill={isHovered ? INK.secondary : INK.muted}
                  fontSize="10.5"
                >
                  {row.label}
                </text>
              </g>
            )
          })}
        </g>
      </svg>
    </div>
  )
}
