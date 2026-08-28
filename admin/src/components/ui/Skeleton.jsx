export function Skeleton({ className = '', style }) {
  return <div className={`skeleton rounded-md ${className}`} style={style} aria-hidden="true" />
}

/**
 * Placeholder rows sized like the real table's, so the layout does not shift
 * when data arrives. The first column is wide; the rest share the remainder.
 */
export function TableSkeleton({ rows = 6, columns = 4 }) {
  return (
    <div className="divide-y divide-border" aria-busy="true" aria-label="Loading rows">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex items-center gap-4 px-5 py-4">
          {Array.from({ length: columns }).map((__, c) => (
            <Skeleton
              key={c}
              className="h-3.5"
              style={{ flex: c === 0 ? 3 : 1, opacity: 1 - r * 0.08 }}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

export function CardSkeleton({ className = '' }) {
  return (
    <div className={`rounded-xl border border-border bg-surface p-5 ${className}`} aria-busy="true">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="mt-3.5 h-7 w-32" />
      <Skeleton className="mt-4 h-9 w-full" />
    </div>
  )
}

export default Skeleton
