import { ArrowDownRight, ArrowRight, ArrowUpRight } from 'lucide-react'
import Sparkline from '../charts/Sparkline'
import { formatCompact, formatDelta } from '../../lib/format'

/**
 * Label · value · delta · optional sparkline.
 *
 * A single headline number is a tile, not a one-bar bar chart. The value keeps
 * proportional figures — tabular-nums makes a large standalone number look
 * loose — and the delta colour follows direction × whether up is good.
 */
export default function StatTile({
  label,
  value,
  delta,
  deltaLabel = 'vs previous 30 days',
  upIsGood = true,
  trend,
  icon: Icon,
  format = formatCompact,
  className = '',
}) {
  const hasDelta = typeof delta === 'number' && Number.isFinite(delta)
  const flat = hasDelta && Math.abs(delta) < 0.05
  const good = hasDelta && (delta > 0) === upIsGood

  const DeltaIcon = flat ? ArrowRight : delta > 0 ? ArrowUpRight : ArrowDownRight
  const deltaTone = flat
    ? 'text-muted-foreground'
    : good
      ? 'text-success'
      : 'text-critical'

  return (
    <div className={`rounded-xl border border-border bg-surface p-4 sm:p-5 ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-[0.8125rem] font-medium text-muted-foreground">{label}</p>
        {Icon && (
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="h-4 w-4" aria-hidden="true" />
          </span>
        )}
      </div>

      <p className="mt-2.5 font-display text-[1.75rem] font-bold leading-none text-foreground">
        {typeof value === 'number' ? format(value) : value}
      </p>

      <div className="mt-3 flex items-end justify-between gap-3">
        {hasDelta ? (
          <p className={`flex items-center gap-1 text-xs font-medium ${deltaTone}`}>
            <DeltaIcon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span className="tnum">{flat ? 'No change' : formatDelta(delta)}</span>
            <span className="font-normal text-muted-foreground">{deltaLabel}</span>
          </p>
        ) : (
          <span />
        )}
        {trend?.length > 1 && <Sparkline values={trend} width={84} height={26} />}
      </div>
    </div>
  )
}
