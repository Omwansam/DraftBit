import { useMemo, useState } from 'react'
import { INK, linePath, niceMax, seriesColor, tickLabel, ticksFor, useChartWidth } from './chartTheme'
import { formatNumber } from '../../lib/format'

const PAD = { top: 12, right: 16, bottom: 26, left: 44 }

/**
 * Multi-series line chart with an area wash under a single series.
 *
 * One y-axis, always. Two measures of different magnitude belong in two charts,
 * never on a second scale — a dual axis invents a correlation that is not in
 * the data.
 *
 * `series`: [{ key, label }]  ·  `data`: [{ date, [key]: number }]
 */
export default function TimeSeriesChart({
  data,
  series,
  height = 240,
  valueFormat = formatNumber,
  labelFor = (row) => row.date,
}) {
  const [ref, width] = useChartWidth()
  const [hover, setHover] = useState(null)

  const plotW = Math.max(0, width - PAD.left - PAD.right)
  const plotH = Math.max(0, height - PAD.top - PAD.bottom)

  const { max, ticks, points } = useMemo(() => {
    const peak = Math.max(
      1,
      ...data.flatMap((row) => series.map((s) => Number(row[s.key]) || 0)),
    )
    const top = niceMax(peak)
    const xFor = (i) => (data.length <= 1 ? plotW / 2 : (i / (data.length - 1)) * plotW)
    const yFor = (v) => plotH - (v / top) * plotH

    return {
      max: top,
      ticks: ticksFor(peak, 4),
      points: series.map((s, si) => ({
        ...s,
        color: seriesColor(si),
        pts: data.map((row, i) => ({
          x: xFor(i),
          y: yFor(Number(row[s.key]) || 0),
          value: Number(row[s.key]) || 0,
          row,
        })),
      })),
    }
  }, [data, series, plotW, plotH])

  const single = series.length === 1

  /* Nearest-index lookup: the hit area is the full plot height at each x, so
     the reader never has to land on a 4px dot. */
  const handleMove = (event) => {
    if (!data.length || plotW <= 0) return
    const rect = event.currentTarget.getBoundingClientRect()
    const x = event.clientX - rect.left - PAD.left
    const ratio = Math.max(0, Math.min(1, x / plotW))
    setHover(Math.round(ratio * (data.length - 1)))
  }

  const hoveredRow = hover != null ? data[hover] : null
  const hoverX = hover != null && data.length > 1 ? (hover / (data.length - 1)) * plotW : 0

  // Reserve the height until the container has been measured, so the card's
  // layout is settled before the chart draws into it.
  if (!width) return <div ref={ref} className="w-full min-w-0" style={{ height }} />

  return (
    <div ref={ref} className="relative w-full min-w-0">
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={`${series.map((s) => s.label).join(' and ')} over time`}
        onMouseMove={handleMove}
        onMouseLeave={() => setHover(null)}
        className="block touch-none"
      >
        <g transform={`translate(${PAD.left},${PAD.top})`}>
          {/* Gridlines: solid hairlines one step off the surface, never dashed. */}
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
                  x={-10} y={y} dy="0.32em" textAnchor="end"
                  fill={INK.muted} fontSize="10.5" className="tnum"
                >
                  {tickLabel(t)}
                </text>
              </g>
            )
          })}

          {/* Area wash — single series only, ~10% opacity so it never reads as
              a saturated block. */}
          {single && points[0].pts.length > 1 && (
            <path
              d={`${linePath(points[0].pts)} L${points[0].pts.at(-1).x},${plotH} L${points[0].pts[0].x},${plotH} Z`}
              fill={points[0].color}
              opacity="0.1"
            />
          )}

          {points.map((s) => (
            <path
              key={s.key}
              d={linePath(s.pts)}
              fill="none"
              stroke={s.color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}

          {/* Crosshair + markers on hover. */}
          {hover != null && (
            <>
              <line
                x1={hoverX} x2={hoverX} y1={0} y2={plotH}
                stroke={INK.axis} strokeWidth="1" shapeRendering="crispEdges"
              />
              {points.map((s) => {
                const p = s.pts[hover]
                if (!p) return null
                return (
                  <circle
                    key={s.key}
                    cx={p.x} cy={p.y} r="4.5"
                    fill={s.color}
                    stroke={INK.surface}
                    strokeWidth="2"
                  />
                )
              })}
            </>
          )}

          {/* Direct end-label for a single series: the one value worth naming
              on the mark itself. Multi-series relies on the legend + tooltip so
              converging labels never pile up at the right edge. */}
          {single && points[0].pts.length > 0 && hover == null && (
            <circle
              cx={points[0].pts.at(-1).x}
              cy={points[0].pts.at(-1).y}
              r="4"
              fill={points[0].color}
              stroke={INK.surface}
              strokeWidth="2"
            />
          )}

          {/* X labels: first, middle and last only — enough to orient without
              crowding the axis. */}
          {data.length > 0 && [0, Math.floor(data.length / 2), data.length - 1]
            .filter((i, idx, arr) => arr.indexOf(i) === idx)
            .map((i) => (
              <text
                key={i}
                x={data.length <= 1 ? plotW / 2 : (i / (data.length - 1)) * plotW}
                y={plotH + 17}
                textAnchor={i === 0 ? 'start' : i === data.length - 1 ? 'end' : 'middle'}
                fill={INK.muted}
                fontSize="10.5"
              >
                {labelFor(data[i])}
              </text>
            ))}
        </g>
      </svg>

      {/* Tooltip enhances; every value is also in the card's table view. */}
      {hoveredRow && (
        <div
          className="pointer-events-none absolute z-10 min-w-[9rem] rounded-lg border border-border bg-surface px-3 py-2 shadow-xl"
          style={{
            left: Math.min(Math.max(PAD.left + hoverX - 70, 4), Math.max(4, width - 148)),
            top: 4,
          }}
          role="status"
        >
          <p className="mb-1.5 text-[0.6875rem] font-medium uppercase tracking-wide text-muted-foreground">
            {labelFor(hoveredRow)}
          </p>
          {points.map((s) => (
            <div key={s.key} className="flex items-center justify-between gap-4 py-0.5">
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="h-2 w-2 rounded-sm" style={{ backgroundColor: s.color }} />
                {s.label}
              </span>
              <span className="tnum text-xs font-semibold text-foreground">
                {valueFormat(hoveredRow[s.key])}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
