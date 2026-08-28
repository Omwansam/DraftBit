import { AlertTriangle, Archive, CheckCircle2, CircleDot, FileText, Mail, XCircle } from 'lucide-react'

/**
 * Status pills.
 *
 * Status colors are reserved and always ship with an icon plus a text label, so
 * meaning never rests on hue alone — that matters for colorblind readers and
 * for the light theme, where warning and serious sit below 3:1 on white.
 */
const TONES = {
  neutral: 'bg-foreground/8 text-muted-foreground border-border',
  good: 'bg-success/12 text-success border-success/30',
  info: 'bg-primary/12 text-primary border-primary/30',
  warning: 'bg-warning/12 text-warning border-warning/35',
  serious: 'bg-serious/12 text-serious border-serious/35',
  critical: 'bg-critical/12 text-critical border-critical/35',
  accent: 'bg-secondary/12 text-secondary border-secondary/30',
}

/** Maps a record's status string onto a tone + icon. */
export const STATUS_MAP = {
  published: { tone: 'good', icon: CheckCircle2, label: 'Published' },
  draft: { tone: 'neutral', icon: FileText, label: 'Draft' },
  scheduled: { tone: 'info', icon: CircleDot, label: 'Scheduled' },
  archived: { tone: 'neutral', icon: Archive, label: 'Archived' },
  open: { tone: 'good', icon: CheckCircle2, label: 'Open' },
  closed: { tone: 'neutral', icon: XCircle, label: 'Closed' },
  active: { tone: 'good', icon: CheckCircle2, label: 'Active' },
  invited: { tone: 'warning', icon: AlertTriangle, label: 'Invited' },
  suspended: { tone: 'critical', icon: XCircle, label: 'Suspended' },
  new: { tone: 'info', icon: Mail, label: 'New' },
  replied: { tone: 'good', icon: CheckCircle2, label: 'Replied' },
  'in-progress': { tone: 'warning', icon: CircleDot, label: 'In progress' },
  pending: { tone: 'warning', icon: AlertTriangle, label: 'Pending' },
  spam: { tone: 'critical', icon: XCircle, label: 'Spam' },
}

export function Badge({ tone = 'neutral', icon: Icon, children, className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${TONES[tone]} ${className}`}
    >
      {Icon && <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />}
      {children}
    </span>
  )
}

export function StatusBadge({ status, className = '' }) {
  const config = STATUS_MAP[status] ?? { tone: 'neutral', icon: CircleDot, label: status }
  return (
    <Badge tone={config.tone} icon={config.icon} className={className}>
      {config.label}
    </Badge>
  )
}

export default Badge
