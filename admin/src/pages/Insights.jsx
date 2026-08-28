import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ExternalLink, FileText, Pencil, PenLine, Search, Trash2 } from 'lucide-react'
import PageHeader from '../components/ui/PageHeader'
import Button from '../components/ui/Button'
import DataTable from '../components/ui/DataTable'
import Tabs from '../components/ui/Tabs'
import EmptyState from '../components/ui/EmptyState'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import Badge, { StatusBadge } from '../components/ui/Badge'
import { useData } from '../context/DataContext'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/ui/Toast'
import { formatDate, formatNumber } from '../lib/format'
import { INSIGHT_CATEGORIES } from '../data/seed'

const SITE_URL = import.meta.env.VITE_SITE_URL || 'http://localhost:5173'

export default function Insights() {
  const { insights, ready, update, remove } = useData()
  const { can } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  const [tab, setTab] = useState('all')
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [selected, setSelected] = useState([])
  const [confirm, setConfirm] = useState(null)

  const writable = can('write')

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    return insights
      .filter((p) => tab === 'all' || p.status === tab)
      .filter((p) => category === 'all' || p.category === category)
      .filter((p) => !q || `${p.title} ${p.excerpt} ${p.author}`.toLowerCase().includes(q))
  }, [insights, tab, category, query])

  const counts = {
    all: insights.length,
    published: insights.filter((p) => p.status === 'published').length,
    draft: insights.filter((p) => p.status === 'draft').length,
  }

  const columns = [
    {
      key: 'title',
      header: 'Article',
      render: (row) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-foreground">{row.title}</p>
          <p className="truncate text-xs text-muted-foreground">{row.excerpt}</p>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      hideBelow: 'md',
      render: (row) => <Badge tone="accent">{row.category}</Badge>,
    },
    {
      key: 'author',
      header: 'Author',
      hideBelow: 'lg',
      render: (row) => <span className="whitespace-nowrap text-muted-foreground">{row.author}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'views',
      header: 'Views',
      align: 'right',
      hideBelow: 'lg',
      sortValue: (row) => row.views ?? 0,
      render: (row) => <span className="tnum text-muted-foreground">{formatNumber(row.views ?? 0)}</span>,
    },
    {
      key: 'publishedAt',
      header: 'Published',
      align: 'right',
      hideBelow: 'sm',
      sortValue: (row) => (row.publishedAt ? new Date(row.publishedAt).getTime() : 0),
      render: (row) => (
        <span className="whitespace-nowrap text-xs text-muted-foreground">
          {row.publishedAt ? formatDate(row.publishedAt) : '—'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      sortable: false,
      width: '1%',
      render: (row) => (
        <div className="flex items-center justify-end gap-0.5" onClick={(e) => e.stopPropagation()}>
          {row.status === 'published' && (
            <a
              href={`${SITE_URL}/insights/${row.slug}`}
              target="_blank"
              rel="noreferrer"
              title="View on site"
              aria-label={`View ${row.title} on the live site`}
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-foreground/8 hover:text-foreground"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
          <button
            type="button"
            onClick={() => navigate(`/insights/${row.id}`)}
            title="Edit"
            aria-label={`Edit ${row.title}`}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-foreground/8 hover:text-foreground"
          >
            <Pencil className="h-4 w-4" />
          </button>
          {writable && (
            <button
              type="button"
              onClick={() => setConfirm(row.id)}
              title="Delete"
              aria-label={`Delete ${row.title}`}
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-critical/10 hover:text-critical"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Content"
        title="Insights"
        description="Articles published to the DraftBit blog."
        actions={
          writable && (
            <Button to="/insights/new">
              <PenLine className="h-4 w-4" /> Write an insight
            </Button>
          )
        }
      />

      <Tabs
        tabs={[
          { id: 'all', label: 'All', count: counts.all },
          { id: 'published', label: 'Published', count: counts.published },
          { id: 'draft', label: 'Drafts', count: counts.draft },
        ]}
        active={tab}
        onChange={(id) => { setTab(id); setSelected([]) }}
      />

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[14rem] flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle-foreground"
            aria-hidden="true"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search title, excerpt or author…"
            aria-label="Search insights"
            className="h-10 w-full rounded-lg border border-border bg-input pl-10 pr-3 text-sm text-foreground placeholder:text-subtle-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25"
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          aria-label="Filter by category"
          className="h-10 rounded-lg border border-border bg-input px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25"
        >
          <option value="all">All categories</option>
          {INSIGHT_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {selected.length > 0 && writable && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-primary/30 bg-primary/[0.07] px-3 py-2">
          <span className="tnum mr-auto text-[0.8125rem] font-medium text-foreground">
            {selected.length} selected
          </span>
          <Button size="sm" variant="ghost" onClick={() => {
            selected.forEach((id) => update('insights', id, {
              status: 'published',
              publishedAt: insights.find((i) => i.id === id)?.publishedAt ?? new Date().toISOString(),
            }))
            toast(`${selected.length} published.`)
            setSelected([])
          }}>
            Publish
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setConfirm('bulk')}>
            <Trash2 className="h-3.5 w-3.5 text-critical" /> Delete
          </Button>
        </div>
      )}

      <DataTable
        columns={columns}
        rows={rows}
        loading={!ready}
        selectable={writable}
        selected={selected}
        onSelectionChange={setSelected}
        onRowClick={(row) => navigate(`/insights/${row.id}`)}
        initialSort={{ key: 'publishedAt', dir: 'desc' }}
        empty={
          <EmptyState
            icon={query || category !== 'all' ? Search : FileText}
            title={query || category !== 'all' ? 'No matching articles' : 'No insights yet'}
            message={
              query || category !== 'all'
                ? 'Try a different search term or clear the category filter.'
                : 'Publish your first article and it will appear on the insights page.'
            }
            action={
              query || category !== 'all' ? (
                <Button variant="outline" onClick={() => { setQuery(''); setCategory('all') }}>
                  Clear filters
                </Button>
              ) : writable ? (
                <Button to="/insights/new"><PenLine className="h-4 w-4" /> Write an insight</Button>
              ) : null
            }
          />
        }
      />

      <ConfirmDialog
        open={Boolean(confirm)}
        onClose={() => setConfirm(null)}
        onConfirm={() => {
          const ids = confirm === 'bulk' ? selected : [confirm]
          remove('insights', ids)
          setSelected([])
          toast(`${ids.length} ${ids.length === 1 ? 'article' : 'articles'} deleted.`, { tone: 'info' })
        }}
        title={confirm === 'bulk' ? `Delete ${selected.length} articles?` : 'Delete this article?'}
        message="The article will be removed from the public site immediately. This cannot be undone."
      />
    </div>
  )
}
