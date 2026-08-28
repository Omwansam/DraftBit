import { useState } from 'react'
import { seriesColor, useChartWidth } from './chartTheme'
import { formatNumber } from '../../lib/format'

const HEIGHT = 22
const GAP = 2 // surface-coloured gap; never a stroke around a segment

/**
 * Part-to-whole as a single horizontal stacked bar.
 *
 * A stacked bar rather than a donut: segments share a common baseline, so close
 * values stay comparable and long category names have somewhere to live. Cap is
 * six segments — past that the tail folds into "Other".
 *
 * `data`: [{ label, value }]
 */
export default function StackedShareBar({ data, valueFormat = formatNumber }) {
  const [ref, width] = useChartWidth()
  const [hover, setHover] = useState(null)

  const total = data.reduce((sum, d) => sum + d.value, 0) || 1
  const gaps = GAP * Math.max(0, data.length - 1)
  const usable = Math.max(0, width - gaps)

  /* Running offset built with an explicit reduce: each segment starts where the
     previous one ended, plus the surface gap. */
  const segments = data.reduce((acc, row, i) => {
    const previous = acc[i - 1]
    const width = (row.value / total) * usable
    acc.push({
      ...row,
      x: previous ? previous.x + previous.width + GAP : 0,
      width,
      color: seriesColor(i),
      share: (row.value / total) * 100,
    })
    return acc
  }, [])

  if (!width) return <div ref={ref} className="w-full min-w-0" style={{ height: HEIGHT }} />

  return (
    <div ref={ref} className="w-full min-w-0">
      <svg
        width={width}
        height={HEIGHT}
        viewBox={`0 0 ${width} ${HEIGHT}`}
        role="img"
        aria-label="Share by category"
        className="block"
      >
        {segments.map((seg, i) => (
          <g
            key={seg.label}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
          >
            <rect
              x={seg.x}
              y={0}
              width={Math.max(1, seg.width)}
              height={HEIGHT}
              fill={seg.color}
              opacity={hover == null || hover === i ? 1 : 0.45}
              rx={i === 0 || i === segments.length - 1 ? 4 : 0}
              style={{ transition: 'opacity 120ms' }}
            />
          </g>
        ))}
      </svg>

      {/* Legend doubles as the readout: label, value and share per segment.
          Every number here is visible without hovering anything.

          One column, not two: a media-query column split keys off the viewport,
          but this bar usually sits in a narrow dashboard card, so at desktop
          widths two columns are what clipped "Organic search" to "Org…". */}
      <ul className="mt-3.5 flex flex-col gap-y-1.5">
        {segments.map((seg, i) => (
          <li
            key={seg.label}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
            className={`flex items-center justify-between gap-3 rounded-md px-1.5 py-0.5 transition-colors ${
              hover === i ? 'bg-foreground/5' : ''
            }`}
          >
            <span className="flex min-w-0 items-center gap-2">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-sm"
                style={{ backgroundColor: seg.color }}
                aria-hidden="true"
              />
              <span className="truncate text-[0.8125rem] text-muted-foreground">{seg.label}</span>
            </span>
            <span className="tnum shrink-0 text-[0.8125rem] font-medium text-foreground">
              {valueFormat(seg.value)}
              <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                {seg.share.toFixed(0)}%
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
