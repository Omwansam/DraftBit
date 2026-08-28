import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowUpRight, Briefcase, Eye, FileText, Inbox, MailOpen, PenLine,
  Plus, Sparkles, Users,
} from 'lucide-react'
import PageHeader from '../components/ui/PageHeader'
import StatTile from '../components/ui/StatTile'
import Button from '../components/ui/Button'
import Card, { CardHeader } from '../components/ui/Card'
import { StatusBadge } from '../components/ui/Badge'
import EmptyState from '../components/ui/EmptyState'
import { CardSkeleton } from '../components/ui/Skeleton'
import ChartCard, { ChartTable } from '../components/charts/ChartCard'
import TimeSeriesChart from '../components/charts/TimeSeriesChart'
import ColumnChart from '../components/charts/ColumnChart'
import StackedShareBar from '../components/charts/StackedShareBar'
import { seriesColor } from '../components/charts/chartTheme'
import { useData } from '../context/DataContext'
import { useAuth } from '../context/AuthContext'
import { formatDate, formatNumber, formatRelative, initials, truncate } from '../lib/format'

const RANGES = [
  { id: 7, label: '7 days' },
  { id: 30, label: '30 days' },
  { id: 90, label: '90 days' },
]

const greeting = () => {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

export default function Dashboard() {
  const { user } = useAuth()
  const {
    ready, derived, traffic, trafficSources, messages, activity,
    projects, insights, careers, testimonials,
  } = useData()
  const [range, setRange] = useState(30)

  const window_ = useMemo(() => traffic.slice(-range), [traffic, range])

  /* Enquiries roll up to weekly buckets — 90 daily columns of 0–3 would be
     noise, and the weekly rhythm is what anyone actually reads here. */
  const enquiriesByWeek = useMemo(() => {
    const buckets = []
    for (let i = 0; i < window_.length; i += 7) {
      const chunk = window_.slice(i, i + 7)
      if (!chunk.length) break
      buckets.push({
        label: formatDate(chunk[0].date, { day: 'numeric', month: 'short', year: undefined }),
        value: chunk.reduce((sum, d) => sum + d.enquiries, 0),
      })
    }
    return buckets.slice(-8)
  }, [window_])

  const visitorTrend = useMemo(
    () => traffic.slice(-12).map((d) => d.visitors),
    [traffic],
  )
  const viewsTrend = useMemo(
    () => traffic.slice(-12).map((d) => d.pageViews),
    [traffic],
  )
  const enquiryTrend = useMemo(
    () => traffic.slice(-12).map((d) => d.enquiries),
    [traffic],
  )

  const recentMessages = useMemo(
    () => [...messages]
      .filter((m) => m.status !== 'spam')
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5),
    [messages],
  )

  const contentSummary = [
    { label: 'Projects', published: projects.filter((p) => p.status === 'published').length, total: projects.length, to: '/projects', icon: Briefcase },
    { label: 'Insights', published: insights.filter((i) => i.status === 'published').length, total: insights.length, to: '/insights', icon: FileText },
    { label: 'Open roles', published: careers.filter((c) => c.status === 'open').length, total: careers.length, to: '/careers', icon: Users },
    { label: 'Testimonials', published: testimonials.filter((t) => t.status === 'published').length, total: testimonials.length, to: '/testimonials', icon: Sparkles },
  ]

  if (!ready) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader eyebrow="Overview" title="Dashboard" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
        <CardSkeleton className="h-72" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Overview"
        title={`${greeting()}, ${(user?.name ?? '').split(' ')[0] || 'there'}`}
        description="Traffic, enquiries and the state of everything published on draftbit.com."
        actions={
          <>
            <Button variant="outline" to="/insights/new">
              <PenLine className="h-4 w-4" /> Write an insight
            </Button>
            <Button to="/projects/new">
              <Plus className="h-4 w-4" /> New project
            </Button>
          </>
        }
      />

      {/* KPI row */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label="Visitors"
          value={derived.visitors30}
          delta={derived.visitorsDelta}
          trend={visitorTrend}
          icon={Users}
        />
        <StatTile
          label="Page views"
          value={derived.pageViews30}
          delta={derived.pageViewsDelta}
          trend={viewsTrend}
          icon={Eye}
        />
        <StatTile
          label="Enquiries"
          value={derived.enquiries30}
          delta={derived.enquiriesDelta}
          trend={enquiryTrend}
          icon={MailOpen}
        />
        <StatTile
          label="Unread messages"
          value={derived.unreadMessages}
          deltaLabel=""
          icon={Inbox}
        />
      </div>

      {/* One filter row above everything it scopes — both charts below redraw
          against the same slice. */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[0.8125rem] text-muted-foreground">
          Showing the last <span className="font-medium text-foreground">{range} days</span>
        </p>
        <div className="flex rounded-lg border border-border p-0.5" role="group" aria-label="Date range">
          {RANGES.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setRange(r.id)}
              aria-pressed={range === r.id}
              className={`rounded-md px-3 py-1.5 text-[0.8125rem] font-medium transition-colors ${
                range === r.id
                  ? 'bg-foreground/8 text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <ChartCard
          className="xl:col-span-2"
          title="Site visitors"
          subtitle={`Daily unique visitors over the last ${range} days`}
          table={
            <ChartTable
              columns={[
                { key: 'date', header: 'Date' },
                { key: 'visitors', header: 'Visitors', align: 'right' },
                { key: 'pageViews', header: 'Page views', align: 'right' },
              ]}
              rows={[...window_].reverse().map((d) => ({
                key: d.date,
                date: formatDate(d.date),
                visitors: formatNumber(d.visitors),
                pageViews: formatNumber(d.pageViews),
              }))}
            />
          }
        >
          <TimeSeriesChart
            data={window_}
            series={[{ key: 'visitors', label: 'Visitors' }]}
            height={252}
            labelFor={(row) => formatDate(row.date, { day: 'numeric', month: 'short', year: undefined })}
          />
        </ChartCard>

        <ChartCard
          title="Where visitors come from"
          subtitle="Share of sessions by channel, last 90 days"
          table={
            <ChartTable
              columns={[
                { key: 'source', header: 'Channel' },
                { key: 'visitors', header: 'Visitors', align: 'right' },
              ]}
              rows={trafficSources.map((s) => ({
                key: s.source,
                source: s.source,
                visitors: formatNumber(s.visitors),
              }))}
            />
          }
        >
          <div className="px-3 pb-2 pt-3">
            <StackedShareBar data={trafficSources.map((s) => ({ label: s.source, value: s.visitors }))} />
          </div>
        </ChartCard>
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <ChartCard
          title="Enquiries per week"
          subtitle="Contact form submissions, grouped by week"
          table={
            <ChartTable
              columns={[
                { key: 'label', header: 'Week of' },
                { key: 'value', header: 'Enquiries', align: 'right' },
              ]}
              rows={enquiriesByWeek.map((b) => ({ key: b.label, ...b }))}
            />
          }
        >
          <div className="px-3 pt-2">
            <ColumnChart data={enquiriesByWeek} height={216} color={seriesColor(0)} />
          </div>
        </ChartCard>

        {/* Recent messages */}
        <Card className="xl:col-span-2">
          <CardHeader
            title="Latest enquiries"
            subtitle={
              derived.unreadMessages > 0
                ? `${derived.unreadMessages} unread`
                : 'Everything has been read'
            }
            actions={
              <Button variant="ghost" size="sm" to="/messages">
                Open inbox <ArrowUpRight className="h-3.5 w-3.5" />
              </Button>
            }
          />
          {recentMessages.length === 0 ? (
            <EmptyState
              icon={Inbox}
              title="No enquiries yet"
              message="Submissions from the contact form on the public site land here."
            />
          ) : (
            <ul className="divide-y divide-border">
              {recentMessages.map((msg) => (
                <li key={msg.id}>
                  <Link
                    to={`/messages?open=${msg.id}`}
                    className="flex items-start gap-3 px-5 py-3.5 transition-colors hover:bg-foreground/[0.03]"
                  >
                    <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-secondary/15 text-[0.6875rem] font-bold text-secondary">
                      {initials(msg.name)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className={`truncate text-sm ${msg.read ? 'font-medium text-foreground' : 'font-semibold text-foreground'}`}>
                          {msg.subject || 'No subject'}
                        </span>
                        {!msg.read && (
                          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-label="Unread" />
                        )}
                      </span>
                      <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                        {msg.name} · {truncate(msg.message, 68)}
                      </span>
                    </span>
                    <span className="shrink-0 whitespace-nowrap pt-0.5 text-xs text-subtle-foreground">
                      {formatRelative(msg.createdAt)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Content at a glance */}
        <Card>
          <CardHeader title="Content" subtitle="Published against total, by collection" />
          <ul className="divide-y divide-border">
            {contentSummary.map((row) => (
              <li key={row.label}>
                <Link
                  to={row.to}
                  className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-foreground/[0.03]"
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-foreground/5 text-muted-foreground">
                    <row.icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1 text-sm font-medium text-foreground">{row.label}</span>
                  <span className="tnum shrink-0 text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">{row.published}</span>
                    {' / '}
                    {row.total}
                  </span>
                  <ArrowUpRight className="h-4 w-4 shrink-0 text-subtle-foreground" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </Card>

        {/* Activity feed */}
        <Card>
          <CardHeader title="Recent activity" subtitle="Who changed what, most recent first" />
          <ol className="divide-y divide-border">
            {activity.map((item) => (
              <li key={item.id} className="flex items-start gap-3 px-5 py-3.5">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                <p className="min-w-0 flex-1 text-[0.8125rem] leading-relaxed text-muted-foreground">
                  <span className="font-medium text-foreground">{item.actor}</span>{' '}
                  {item.action}{' '}
                  <span className="font-medium text-foreground">{item.target}</span>
                </p>
                <span className="shrink-0 whitespace-nowrap pt-0.5 text-xs text-subtle-foreground">
                  {formatRelative(item.at)}
                </span>
              </li>
            ))}
          </ol>
        </Card>
      </div>

      {/* Needs attention */}
      {(derived.draftCount > 0 || derived.pendingTestimonials > 0) && (
        <Card>
          <CardHeader title="Needs attention" subtitle="Items waiting on someone" />
          <ul className="divide-y divide-border">
            {derived.draftCount > 0 && (
              <li className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5">
                <span className="flex items-center gap-2.5 text-sm text-foreground">
                  <StatusBadge status="draft" />
                  {derived.draftCount} unpublished {derived.draftCount === 1 ? 'draft' : 'drafts'} across projects and insights
                </span>
                <Button variant="ghost" size="sm" to="/insights">Review</Button>
              </li>
            )}
            {derived.pendingTestimonials > 0 && (
              <li className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5">
                <span className="flex items-center gap-2.5 text-sm text-foreground">
                  <StatusBadge status="pending" />
                  {derived.pendingTestimonials} testimonial
                  {derived.pendingTestimonials === 1 ? '' : 's'} awaiting approval
                </span>
                <Button variant="ghost" size="sm" to="/testimonials">Review</Button>
              </li>
            )}
          </ul>
        </Card>
      )}
    </div>
  )
}
