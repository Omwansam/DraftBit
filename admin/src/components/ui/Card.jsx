export function Card({ className = '', children, ...props }) {
  return (
    <div
      className={`rounded-xl border border-border bg-surface ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ title, subtitle, actions, className = '' }) {
  return (
    <div className={`flex flex-wrap items-start justify-between gap-3 border-b border-border px-5 py-4 ${className}`}>
      <div className="min-w-0">
        <h2 className="text-[0.9375rem] font-semibold leading-tight text-foreground">{title}</h2>
        {subtitle && <p className="mt-1 text-[0.8125rem] text-muted-foreground">{subtitle}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  )
}

export function CardBody({ className = '', children }) {
  return <div className={`px-5 py-4 ${className}`}>{children}</div>
}

export function CardFooter({ className = '', children }) {
  return (
    <div className={`flex items-center justify-between gap-3 border-t border-border px-5 py-3 ${className}`}>
      {children}
    </div>
  )
}

export default Card
