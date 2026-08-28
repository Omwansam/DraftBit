import { useMemo, useState } from 'react'
import {
  ChevronDown, ChevronLeft, ChevronRight, ChevronsUpDown, ChevronUp, Inbox,
} from 'lucide-react'
import EmptyState from './EmptyState'
import { TableSkeleton } from './Skeleton'

/**
 * Sortable, selectable, paginated table.
 *
 * `columns` entries:
 *   key        unique id, also the default accessor
 *   header     column label
 *   render     (row) => node          — optional custom cell
 *   sortValue  (row) => string|number — optional sort accessor
 *   sortable   defaults to true when a sortValue or plain key exists
 *   align      'left' | 'right'
 *   width      any CSS width for the <col>
 *   hideBelow  'sm' | 'md' | 'lg'     — drops the column on narrow screens
 */
export default function DataTable({
  columns,
  rows,
  loading = false,
  getRowId = (row) => row.id,
  onRowClick,
  selectable = false,
  selected = [],
  onSelectionChange,
  pageSize = 10,
  initialSort,
  empty,
  className = '',
}) {
  const [sort, setSort] = useState(initialSort ?? null)
  const [page, setPage] = useState(1)

  // Filtering or re-sorting reshuffles which rows land on which page, so the
  // current page number stops meaning anything — go back to the first.
  const signature = `${rows.length}|${sort?.key ?? ''}|${sort?.dir ?? ''}`
  const [prevSignature, setPrevSignature] = useState(signature)
  if (prevSignature !== signature) {
    setPrevSignature(signature)
    setPage(1)
  }

  const sorted = useMemo(() => {
    if (!sort) return rows
    const column = columns.find((c) => c.key === sort.key)
    if (!column) return rows

    const accessor = column.sortValue ?? ((row) => row[column.key])
    const factor = sort.dir === 'asc' ? 1 : -1

    return [...rows].sort((a, b) => {
      const av = accessor(a)
      const bv = accessor(b)
      if (av == null && bv == null) return 0
      if (av == null) return 1
      if (bv == null) return -1
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * factor
      return String(av).localeCompare(String(bv), undefined, { numeric: true }) * factor
    })
  }, [rows, sort, columns])

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const current = Math.min(page, totalPages)
  const paged = sorted.slice((current - 1) * pageSize, current * pageSize)

  const pageIds = paged.map(getRowId)
  const allOnPageSelected = pageIds.length > 0 && pageIds.every((id) => selected.includes(id))

  const toggleAll = () => {
    if (allOnPageSelected) {
      onSelectionChange(selected.filter((id) => !pageIds.includes(id)))
    } else {
      onSelectionChange([...new Set([...selected, ...pageIds])])
    }
  }

  const toggleOne = (id) => {
    onSelectionChange(
      selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id],
    )
  }

  const requestSort = (key) => {
    setSort((prev) => {
      if (prev?.key !== key) return { key, dir: 'asc' }
      if (prev.dir === 'asc') return { key, dir: 'desc' }
      return null
    })
  }

  const hideClass = {
    sm: 'hidden sm:table-cell',
    md: 'hidden md:table-cell',
    lg: 'hidden lg:table-cell',
  }

  if (loading) {
    return (
      <div className={`overflow-hidden rounded-xl border border-border bg-surface ${className}`}>
        <TableSkeleton rows={pageSize > 6 ? 6 : pageSize} columns={Math.min(columns.length, 5)} />
      </div>
    )
  }

  if (!rows.length) {
    return (
      <div className={`overflow-hidden rounded-xl border border-border bg-surface ${className}`}>
        {empty ?? <EmptyState icon={Inbox} title="No records" />}
      </div>
    )
  }

  return (
    <div className={`overflow-hidden rounded-xl border border-border bg-surface ${className}`}>
      <div className="scroll-slim overflow-x-auto">
        <table className="w-full min-w-[38rem] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-2/60">
              {selectable && (
                <th scope="col" className="w-10 px-4 py-2.5">
                  <input
                    type="checkbox"
                    checked={allOnPageSelected}
                    onChange={toggleAll}
                    aria-label="Select all rows on this page"
                    className="h-4 w-4 cursor-pointer rounded border-border-strong bg-input accent-[var(--primary)]"
                  />
                </th>
              )}
              {columns.map((col) => {
                const sortable = col.sortable !== false
                const isSorted = sort?.key === col.key
                return (
                  <th
                    key={col.key}
                    scope="col"
                    style={col.width ? { width: col.width } : undefined}
                    aria-sort={isSorted ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}
                    className={`px-4 py-2.5 text-[0.6875rem] font-semibold uppercase tracking-wider text-muted-foreground ${
                      col.align === 'right' ? 'text-right' : 'text-left'
                    } ${col.hideBelow ? hideClass[col.hideBelow] : ''}`}
                  >
                    {sortable ? (
                      <button
                        type="button"
                        onClick={() => requestSort(col.key)}
                        className={`inline-flex items-center gap-1 uppercase tracking-wider transition-colors hover:text-foreground ${
                          col.align === 'right' ? 'flex-row-reverse' : ''
                        }`}
                      >
                        {col.header}
                        {isSorted ? (
                          sort.dir === 'asc'
                            ? <ChevronUp className="h-3.5 w-3.5 text-primary" />
                            : <ChevronDown className="h-3.5 w-3.5 text-primary" />
                        ) : (
                          <ChevronsUpDown className="h-3.5 w-3.5 opacity-40" />
                        )}
                      </button>
                    ) : (
                      col.header
                    )}
                  </th>
                )
              })}
            </tr>
          </thead>

          <tbody className="divide-y divide-border">
            {paged.map((row) => {
              const id = getRowId(row)
              const isSelected = selected.includes(id)
              return (
                <tr
                  key={id}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={`transition-colors ${
                    isSelected ? 'bg-primary/[0.06]' : 'hover:bg-foreground/[0.03]'
                  } ${onRowClick ? 'cursor-pointer' : ''}`}
                >
                  {selectable && (
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleOne(id)}
                        aria-label="Select row"
                        className="h-4 w-4 cursor-pointer rounded border-border-strong bg-input accent-[var(--primary)]"
                      />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`px-4 py-3 align-middle ${
                        col.align === 'right' ? 'text-right' : 'text-left'
                      } ${col.hideBelow ? hideClass[col.hideBelow] : ''}`}
                    >
                      {col.render ? col.render(row) : (
                        <span className="text-foreground">{row[col.key]}</span>
                      )}
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {sorted.length > pageSize && (
        <div className="flex items-center justify-between gap-3 border-t border-border px-4 py-2.5">
          <p className="tnum text-xs text-muted-foreground">
            {(current - 1) * pageSize + 1}–{Math.min(current * pageSize, sorted.length)} of {sorted.length}
          </p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={current === 1}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40 disabled:hover:text-muted-foreground"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="tnum px-2 text-xs text-muted-foreground">
              {current} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={current === totalPages}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40 disabled:hover:text-muted-foreground"
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
