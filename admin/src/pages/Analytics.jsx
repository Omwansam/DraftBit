import { useMemo, useState } from 'react'
import { Eye, MailOpen, MousePointerClick, Users } from 'lucide-react'
import PageHeader from '../components/ui/PageHeader'
import StatTile from '../components/ui/StatTile'
import Card, { CardHeader } from '../components/ui/Card'
import { CardSkeleton } from '../components/ui/Skeleton'
import ChartCard, { ChartTable } from '../components/charts/ChartCard'
import TimeSeriesChart from '../components/charts/TimeSeriesChart'
import ColumnChart from '../components/charts/ColumnChart'
import BarChart from '../components/charts/BarChart'
import { seriesColor } from '../components/charts/chartTheme'
import { useData } from '../context/DataContext'
import { formatDate, formatNumber, siteHost } from '../lib/format'

const RANGES = [
  { id: 7, label: '7 days' },
  { id: 30, label: '30 days' },
  { id: 90, label: '90 days' },
]

export default function Analytics() {
  const { ready, traffic, trafficSources, topPages } = useData()
  const [range, setRange] = useState(30)

  const window_ = useMemo(() => traffic.slice(-range), [traffic, range])
  const previous = useMemo(
    () => traffic.slice(-range * 2, -range),
    [traffic, range],
  )

  const totals = useMemo(() => {
    const sum = (rows, key) => rows.reduce((acc, r) => acc + r[key], 0)
    /* With no prior window to compare against — a 90-day range over 90 days of
       history — return undefined so the tile omits the delta rather than
       claiming "no change". */
    const pct = (curr, prev) => (previous.length === 0 || prev === 0
      ? undefined
      : ((curr - prev) / prev) * 100)

    const visitors = sum(window_, 'visitors')
    const pageViews = sum(window_, 'pageViews')
    const enquiries = sum(window_, 'enquiries')

    return {
      visitors,
      pageViews,
      enquiries,
      // Enquiries per 100 visitors — the number that actually matters here.
      conversion: visitors === 0 ? 0 : (enquiries / visitors) * 100,
      visitorsDelta: pct(visitors, sum(previous, 'visitors')),
      pageViewsDelta: pct(pageViews, sum(previous, 'pageViews')),
      enquiriesDelta: pct(enquiries, sum(previous, 'enquiries')),
      pagesPerVisit: visitors === 0 ? 0 : pageViews / visitors,
    }
  }, [window_, previous])

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

  if (!ready) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader eyebrow="Overview" title="Analytics" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
        <CardSkeleton className="h-80" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Overview"
        title="Analytics"
        description={`How people find ${siteHost}, what they read, and how often they get in touch.`}
      />

      {/* One filter row scoping every chart below it. */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
        <p className="text-[0.8125rem] text-muted-foreground">
          {previous.length > 0 ? (
            <>
              Comparing the last <span className="font-medium text-foreground">{range} days</span>{' '}
              against the {range} before that
            </>
          ) : (
            <>
              Showing the last <span className="font-medium text-foreground">{range} days</span> —
              no earlier period to compare against
            </>
          )}
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

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label="Visitors"
          value={totals.visitors}
          delta={totals.visitorsDelta}
          deltaLabel={`vs previous ${range} days`}
          icon={Users}
        />
        <StatTile
          label="Page views"
          value={totals.pageViews}
          delta={totals.pageViewsDelta}
          deltaLabel={`vs previous ${range} days`}
          icon={Eye}
        />
        <StatTile
          label="Enquiries"
          value={totals.enquiries}
          delta={totals.enquiriesDelta}
          deltaLabel={`vs previous ${range} days`}
          icon={MailOpen}
        />
        <StatTile
          label="Enquiry rate"
          value={`${totals.conversion.toFixed(2)}%`}
          deltaLabel=""
          icon={MousePointerClick}
        />
      </div>

      {/* Two series, one axis. Page views run roughly 2–3x visitors, which the
          shared scale shows honestly; a second y-axis would invent a
          relationship that is not in the data. */}
      <ChartCard
        title="Traffic"
        subtitle={`Daily visitors and page views over the last ${range} days`}
        legend={[
          { label: 'Visitors', color: seriesColor(0) },
          { label: 'Page views', color: seriesColor(1) },
        ]}
        table={
          <ChartTable
            columns={[
              { key: 'date', header: 'Date' },
              { key: 'visitors', header: 'Visitors', align: 'right' },
              { key: 'pageViews', header: 'Page views', align: 'right' },
              { key: 'enquiries', header: 'Enquiries', align: 'right' },
            ]}
            rows={[...window_].reverse().map((d) => ({
              key: d.date,
              date: formatDate(d.date),
              visitors: formatNumber(d.visitors),
              pageViews: formatNumber(d.pageViews),
              enquiries: formatNumber(d.enquiries),
            }))}
          />
        }
      >
        <TimeSeriesChart
          data={window_}
          series={[
            { key: 'visitors', label: 'Visitors' },
            { key: 'pageViews', label: 'Page views' },
          ]}
          height={300}
          labelFor={(row) => formatDate(row.date, { day: 'numeric', month: 'short', year: undefined })}
        />
      </ChartCard>

      <div className="grid gap-5 lg:grid-cols-2">
        <ChartCard
          title="Acquisition channels"
          subtitle="Visitors by source, last 90 days"
          table={
            <ChartTable
              columns={[
                { key: 'source', header: 'Channel' },
                { key: 'visitors', header: 'Visitors', align: 'right' },
                { key: 'share', header: 'Share', align: 'right' },
              ]}
              rows={(() => {
                const total = trafficSources.reduce((s, r) => s + r.visitors, 0)
                return trafficSources.map((s) => ({
                  key: s.source,
                  source: s.source,
                  visitors: formatNumber(s.visitors),
                  share: `${((s.visitors / total) * 100).toFixed(1)}%`,
                }))
              })()}
            />
          }
        >
          <div className="px-3 pt-2">
            <BarChart
              data={trafficSources.map((s) => ({ label: s.source, value: s.visitors }))}
            />
          </div>
        </ChartCard>

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
            <ColumnChart data={enquiriesByWeek} height={230} />
          </div>
        </ChartCard>
      </div>

      <Card>
        <CardHeader
          title="Top pages"
          subtitle={`Most-viewed pages · ${totals.pagesPerVisit.toFixed(1)} pages per visit on average`}
        />
        <div className="scroll-slim overflow-x-auto">
          <table className="w-full min-w-[34rem] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-2/60">
                <th scope="col" className="px-5 py-2.5 text-left text-[0.6875rem] font-semibold uppercase tracking-wider text-muted-foreground">
                  Page
                </th>
                <th scope="col" className="px-5 py-2.5 text-right text-[0.6875rem] font-semibold uppercase tracking-wider text-muted-foreground">
                  Views
                </th>
                <th scope="col" className="px-5 py-2.5 text-right text-[0.6875rem] font-semibold uppercase tracking-wider text-muted-foreground">
                  Avg. time
                </th>
                <th scope="col" className="px-5 py-2.5 text-right text-[0.6875rem] font-semibold uppercase tracking-wider text-muted-foreground">
                  Bounce
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {topPages.map((page) => (
                <tr key={page.path} className="transition-colors hover:bg-foreground/[0.03]">
                  <td className="px-5 py-3">
                    <p className="font-medium text-foreground">{page.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{page.path}</p>
                  </td>
                  <td className="tnum px-5 py-3 text-right text-foreground">
                    {formatNumber(page.views)}
                  </td>
                  <td className="tnum px-5 py-3 text-right text-muted-foreground">
                    {page.avgTime}
                  </td>
                  <td className="px-5 py-3 text-right">
                    {/* Meter: fill and track are steps of one hue, so the state
                        reads across the whole bar. */}
                    <span className="inline-flex items-center justify-end gap-2">
                      <span
                        className="h-1.5 w-16 overflow-hidden rounded-full"
                        style={{ backgroundColor: 'color-mix(in srgb, var(--chart-1) 18%, transparent)' }}
                      >
                        <span
                          className="block h-full rounded-full"
                          style={{
                            width: `${page.bounce}%`,
                            backgroundColor: 'var(--chart-1)',
                          }}
                        />
                      </span>
                      <span className="tnum w-9 text-right text-[0.8125rem] text-muted-foreground">
                        {page.bounce}%
                      </span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
