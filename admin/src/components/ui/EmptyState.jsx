import { Inbox } from 'lucide-react'

/**
 * Shown when a list has no rows. Distinguishes "nothing here yet" from
 * "nothing matched your filters" — those need different next actions.
 */
export default function EmptyState({
  icon: Icon = Inbox,
  title = 'Nothing here yet',
  message,
  action,
  className = '',
}) {
  return (
    <div className={`flex flex-col items-center justify-center px-6 py-16 text-center ${className}`}>
      <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-surface-2 text-muted-foreground">
        <Icon className="h-5.5 w-5.5" style={{ height: 22, width: 22 }} aria-hidden="true" />
      </span>
      <h3 className="text-[0.9375rem] font-semibold text-foreground">{title}</h3>
      {message && <p className="mt-1.5 max-w-sm text-[0.8125rem] leading-relaxed text-muted-foreground">{message}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
