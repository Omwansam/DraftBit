import { useState } from 'react'
import { BarChart3, Table2 } from 'lucide-react'

/**
 * Frame every chart sits in: title, optional actions, legend, and the
 * chart/table toggle.
 *
 * The table view is not a nicety — it is the WCAG-clean twin of the chart, so
 * no value is ever reachable only by hovering a mark or matching a color.
 */
export default function ChartCard({
  title,
  subtitle,
  legend,
  actions,
  table,
  children,
  className = '',
}) {
  const [view, setView] = useState('chart')

  return (
    /* min-w-0 lets the card shrink below its chart's rendered width; without it
       a grid item floors at the SVG's intrinsic size and never narrows. */
    <section className={`flex min-w-0 flex-col rounded-xl border border-border bg-surface ${className}`}>
      <header className="flex flex-wrap items-start justify-between gap-3 px-5 pb-3 pt-4">
        <div className="min-w-0">
          <h2 className="text-[0.9375rem] font-semibold leading-tight text-foreground">{title}</h2>
          {subtitle && <p className="mt-1 text-[0.8125rem] text-muted-foreground">{subtitle}</p>}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {actions}
          {table && (
            <div
              className="flex rounded-lg border border-border p-0.5"
              role="group"
              aria-label="Chart or table view"
            >
              <button
                type="button"
                onClick={() => setView('chart')}
                aria-pressed={view === 'chart'}
                title="Chart view"
                className={`inline-flex h-7 w-7 items-center justify-center rounded-md transition-colors ${
                  view === 'chart' ? 'bg-foreground/8 text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <BarChart3 className="h-3.5 w-3.5" />
                <span className="sr-only">Chart view</span>
              </button>
              <button
                type="button"
                onClick={() => setView('table')}
                aria-pressed={view === 'table'}
                title="Table view"
                className={`inline-flex h-7 w-7 items-center justify-center rounded-md transition-colors ${
                  view === 'table' ? 'bg-foreground/8 text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Table2 className="h-3.5 w-3.5" />
                <span className="sr-only">Table view</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* A legend is always present for two or more series — identity never
          rests on color-matching alone. */}
      {legend && view === 'chart' && (
        <ul className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-5 pb-2">
          {legend.map((item) => (
            <li key={item.label} className="flex items-center gap-1.5">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-sm"
                style={{ backgroundColor: item.color }}
                aria-hidden="true"
              />
              <span className="text-xs text-muted-foreground">{item.label}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="min-w-0 flex-1 px-2 pb-3">
        {view === 'chart' ? children : <div className="px-3 pb-1 pt-1">{table}</div>}
      </div>
    </section>
  )
}

/** Standard table twin for chart data. */
export function ChartTable({ columns, rows }) {
  return (
    <div className="scroll-slim max-h-72 overflow-auto rounded-lg border border-border">
      <table className="w-full border-collapse text-sm">
        <thead className="sticky top-0 bg-surface-2">
          <tr className="border-b border-border">
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className={`px-3 py-2 text-[0.6875rem] font-semibold uppercase tracking-wider text-muted-foreground ${
                  col.align === 'right' ? 'text-right' : 'text-left'
                }`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((row, i) => (
            <tr key={row.key ?? i}>
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={`px-3 py-1.5 text-[0.8125rem] text-foreground ${
                    col.align === 'right' ? 'tnum text-right' : 'text-left'
                  }`}
                >
                  {row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
