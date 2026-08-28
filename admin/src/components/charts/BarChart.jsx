import { useState } from 'react'
import { barPath, INK, niceMax, seriesColor, useChartWidth } from './chartTheme'
import { formatNumber } from '../../lib/format'

const ROW_HEIGHT = 34
const BAR_THICKNESS = 18 // capped well under 24px; the band's leftover is air
const LABEL_W = 116
const VALUE_W = 56

/**
 * Horizontal bars for one measure across nominal categories.
 *
 * All bars take the *same* slot-1 hue: the categories have no natural order, and
 * colouring each bar by its own value would re-encode length as hue and spend
 * the identity channel on information the bar already shows. One series means
 * no legend box either — the card title names what is plotted.
 *
 * `data`: [{ label, value }]
 */
export default function BarChart({
  data,
  valueFormat = formatNumber,
  color = seriesColor(0),
  emphasisIndex = null,
}) {
  const [ref, width] = useChartWidth()
  const [hover, setHover] = useState(null)

  const max = niceMax(Math.max(1, ...data.map((d) => d.value)))
  const height = data.length * ROW_HEIGHT + 8
  const trackW = Math.max(24, width - LABEL_W - VALUE_W)

  if (!width) return <div ref={ref} className="w-full min-w-0" style={{ height }} />

  return (
    <div ref={ref} className="w-full min-w-0">
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="Value by category"
        className="block"
      >
        {data.map((row, i) => {
          const y = i * ROW_HEIGHT + 4
          const w = Math.max(2, (row.value / max) * trackW)
          // Emphasis: when one row is the story, the rest recede to gray.
          const fill = emphasisIndex == null || emphasisIndex === i ? color : INK.deEmphasis
          const isHovered = hover === i

          return (
            <g
              key={row.label}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
            >
              {/* Hit target spans the whole row, not just the bar. */}
              <rect x="0" y={y} width={width} height={ROW_HEIGHT} fill="transparent" />
              <text
                x="0"
                y={y + ROW_HEIGHT / 2}
                dy="0.32em"
                fill={isHovered ? INK.primary : INK.secondary}
                fontSize="11.5"
                style={{ transition: 'fill 120ms' }}
              >
                {row.label}
              </text>
              <path
                d={barPath({
                  x: LABEL_W,
                  y: y + (ROW_HEIGHT - BAR_THICKNESS) / 2,
                  width: w,
                  height: BAR_THICKNESS,
                  radius: 4,
                  orientation: 'right',
                })}
                fill={fill}
                opacity={isHovered ? 1 : 0.92}
              />
              {/* Value at the tip. A list this short carries every label
                  without becoming noise. */}
              <text
                x={LABEL_W + w + 8}
                y={y + ROW_HEIGHT / 2}
                dy="0.32em"
                fill={INK.secondary}
                fontSize="11"
                className="tnum"
              >
                {valueFormat(row.value)}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
