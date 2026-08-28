import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Briefcase, Copy, ExternalLink, Eye, Pencil, Plus, Search, Star, Trash2,
} from 'lucide-react'
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
import { uniqueSlug } from '../lib/slug'
import { PROJECT_CATEGORIES } from '../data/seed'

const SITE_URL = import.meta.env.VITE_SITE_URL || 'http://localhost:5173'

export default function Projects() {
  const { projects, ready, create, update, remove } = useData()
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
    return projects
      .filter((p) => tab === 'all' || p.status === tab)
      .filter((p) => category === 'all' || p.category === category)
      .filter((p) =>
        !q || `${p.title} ${p.client} ${p.tags.join(' ')}`.toLowerCase().includes(q),
      )
  }, [projects, tab, category, query])

  const counts = {
    all: projects.length,
    published: projects.filter((p) => p.status === 'published').length,
    draft: projects.filter((p) => p.status === 'draft').length,
  }

  const duplicate = (project) => {
    const copy = create('projects', {
      ...project,
      id: undefined,
      title: `${project.title} (copy)`,
      slug: uniqueSlug(`${project.title} copy`, projects),
      status: 'draft',
      featured: false,
      views: 0,
    })
    toast('Project duplicated as a draft.', {
      action: { label: 'Open', onClick: () => navigate(`/projects/${copy.id}`) },
    })
  }

  const deleteRows = () => {
    const ids = confirm === 'bulk' ? selected : [confirm]
    remove('projects', ids)
    setSelected([])
    toast(`${ids.length} ${ids.length === 1 ? 'project' : 'projects'} deleted.`, { tone: 'info' })
  }

  const columns = [
    {
      key: 'title',
      header: 'Project',
      sortValue: (row) => row.title,
      render: (row) => (
        <div className="flex items-center gap-3">
          <div
            className="h-9 w-9 shrink-0 overflow-hidden rounded-lg border border-border bg-surface-2"
            aria-hidden="true"
          >
            {row.image && (
              <img
                src={row.image}
                alt=""
                loading="lazy"
                className="h-full w-full object-cover"
                onError={(e) => { e.currentTarget.style.display = 'none' }}
              />
            )}
          </div>
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 truncate font-medium text-foreground">
              {row.title}
              {row.featured && (
                <Star className="h-3.5 w-3.5 shrink-0 fill-warning text-warning" aria-label="Featured" />
              )}
            </p>
            <p className="truncate text-xs text-muted-foreground">{row.client || '—'}</p>
          </div>
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
      render: (row) => (
        <span className="tnum text-muted-foreground">{formatNumber(row.views ?? 0)}</span>
      ),
    },
    {
      key: 'updatedAt',
      header: 'Updated',
      align: 'right',
      hideBelow: 'sm',
      sortValue: (row) => new Date(row.updatedAt).getTime(),
      render: (row) => (
        <span className="whitespace-nowrap text-xs text-muted-foreground">
          {formatDate(row.updatedAt)}
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
              href={`${SITE_URL}/projects/${row.slug}`}
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
            onClick={() => navigate(`/projects/${row.id}`)}
            title="Edit"
            aria-label={`Edit ${row.title}`}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-foreground/8 hover:text-foreground"
          >
            <Pencil className="h-4 w-4" />
          </button>
          {writable && (
            <>
              <button
                type="button"
                onClick={() => duplicate(row)}
                title="Duplicate"
                aria-label={`Duplicate ${row.title}`}
                className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-foreground/8 hover:text-foreground"
              >
                <Copy className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setConfirm(row.id)}
                title="Delete"
                aria-label={`Delete ${row.title}`}
                className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-critical/10 hover:text-critical"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Content"
        title="Projects"
        description="Case studies and portfolio entries shown on the public site."
        actions={
          writable && (
            <Button to="/projects/new">
              <Plus className="h-4 w-4" /> New project
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

      {/* One filter row above the table it scopes. */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[14rem] flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle-foreground"
            aria-hidden="true"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search title, client or tech…"
            aria-label="Search projects"
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
          {PROJECT_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {selected.length > 0 && writable && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-primary/30 bg-primary/[0.07] px-3 py-2">
          <span className="tnum mr-auto text-[0.8125rem] font-medium text-foreground">
            {selected.length} selected
          </span>
          <Button size="sm" variant="ghost" onClick={() => {
            selected.forEach((id) => update('projects', id, { status: 'published' }))
            toast(`${selected.length} published.`)
            setSelected([])
          }}>
            <Eye className="h-3.5 w-3.5" /> Publish
          </Button>
          <Button size="sm" variant="ghost" onClick={() => {
            selected.forEach((id) => update('projects', id, { status: 'draft' }))
            toast(`${selected.length} moved to drafts.`)
            setSelected([])
          }}>
            Unpublish
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
        onRowClick={(row) => navigate(`/projects/${row.id}`)}
        initialSort={{ key: 'updatedAt', dir: 'desc' }}
        pageSize={10}
        empty={
          <EmptyState
            icon={query || category !== 'all' ? Search : Briefcase}
            title={query || category !== 'all' ? 'No matching projects' : 'No projects yet'}
            message={
              query || category !== 'all'
                ? 'Try a different search term or clear the category filter.'
                : 'Add your first case study and it will appear on the public projects page.'
            }
            action={
              query || category !== 'all' ? (
                <Button variant="outline" onClick={() => { setQuery(''); setCategory('all') }}>
                  Clear filters
                </Button>
              ) : writable ? (
                <Button to="/projects/new"><Plus className="h-4 w-4" /> New project</Button>
              ) : null
            }
          />
        }
      />

      <ConfirmDialog
        open={Boolean(confirm)}
        onClose={() => setConfirm(null)}
        onConfirm={deleteRows}
        title={confirm === 'bulk' ? `Delete ${selected.length} projects?` : 'Delete this project?'}
        message="The case study will be removed from the public site immediately. This cannot be undone."
      />
    </div>
  )
}
