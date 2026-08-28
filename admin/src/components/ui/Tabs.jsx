/**
 * Segmented tab bar. `tabs` is [{ id, label, count? }]; the active tab is
 * controlled by the caller so it can live in the URL or in page state.
 */
export default function Tabs({ tabs, active, onChange, className = '' }) {
  return (
    <div
      role="tablist"
      className={`scroll-slim flex min-w-0 gap-1 overflow-x-auto border-b border-border ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === active
        return (
          <button
            key={tab.id}
            role="tab"
            type="button"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={`-mb-px flex shrink-0 items-center gap-2 border-b-2 px-3.5 py-2.5 text-[0.8125rem] font-medium transition-colors ${
              isActive
                ? 'border-primary text-foreground'
                : 'border-transparent text-muted-foreground hover:border-border-strong hover:text-foreground'
            }`}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span
                className={`tnum rounded-full px-1.5 py-0.5 text-[0.6875rem] font-semibold ${
                  isActive ? 'bg-primary/15 text-primary' : 'bg-foreground/8 text-muted-foreground'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
