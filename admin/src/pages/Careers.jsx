import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Briefcase, ExternalLink, Pencil, Plus, Search, Trash2, Users } from 'lucide-react'
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
import { DEPARTMENTS } from '../data/seed'

const SITE_URL = import.meta.env.VITE_SITE_URL || 'http://localhost:5173'

export default function Careers() {
  const { careers, ready, remove } = useData()
  const { can } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  const [tab, setTab] = useState('all')
  const [query, setQuery] = useState('')
  const [department, setDepartment] = useState('all')
  const [selected, setSelected] = useState([])
  const [confirm, setConfirm] = useState(null)

  const writable = can('write')

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    return careers
      .filter((c) => tab === 'all' || c.status === tab)
      .filter((c) => department === 'all' || c.department === department)
      .filter((c) => !q || `${c.title} ${c.location} ${c.description}`.toLowerCase().includes(q))
  }, [careers, tab, department, query])

  const counts = {
    all: careers.length,
    open: careers.filter((c) => c.status === 'open').length,
    closed: careers.filter((c) => c.status === 'closed').length,
  }

  const columns = [
    {
      key: 'title',
      header: 'Role',
      render: (row) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-foreground">{row.title}</p>
          <p className="truncate text-xs text-muted-foreground">{row.location}</p>
        </div>
      ),
    },
    {
      key: 'department',
      header: 'Department',
      hideBelow: 'md',
      render: (row) => <Badge tone="accent">{row.department}</Badge>,
    },
    {
      key: 'type',
      header: 'Type',
      hideBelow: 'lg',
      render: (row) => <span className="whitespace-nowrap text-muted-foreground">{row.type}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'applicants',
      header: 'Applicants',
      align: 'right',
      hideBelow: 'sm',
      sortValue: (row) => row.applicants ?? 0,
      render: (row) => (
        <span className="tnum inline-flex items-center gap-1.5 text-muted-foreground">
          <Users className="h-3.5 w-3.5" aria-hidden="true" />
          {formatNumber(row.applicants ?? 0)}
        </span>
      ),
    },
    {
      key: 'postedAt',
      header: 'Posted',
      align: 'right',
      hideBelow: 'lg',
      sortValue: (row) => new Date(row.postedAt).getTime(),
      render: (row) => (
        <span className="whitespace-nowrap text-xs text-muted-foreground">
          {formatDate(row.postedAt)}
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
          {row.status === 'open' && (
            <a
              href={`${SITE_URL}/careers`}
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
            onClick={() => navigate(`/careers/${row.id}`)}
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
        eyebrow="People"
        title="Careers"
        description="Open roles listed on the public careers page."
        actions={
          writable && (
            <Button to="/careers/new">
              <Plus className="h-4 w-4" /> New role
            </Button>
          )
        }
      />

      <Tabs
        tabs={[
          { id: 'all', label: 'All', count: counts.all },
          { id: 'open', label: 'Open', count: counts.open },
          { id: 'closed', label: 'Closed', count: counts.closed },
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
            placeholder="Search role or location…"
            aria-label="Search roles"
            className="h-10 w-full rounded-lg border border-border bg-input pl-10 pr-3 text-sm text-foreground placeholder:text-subtle-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25"
          />
        </div>
        <select
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          aria-label="Filter by department"
          className="h-10 rounded-lg border border-border bg-input px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25"
        >
          <option value="all">All departments</option>
          {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        loading={!ready}
        selectable={writable}
        selected={selected}
        onSelectionChange={setSelected}
        onRowClick={(row) => navigate(`/careers/${row.id}`)}
        initialSort={{ key: 'postedAt', dir: 'desc' }}
        empty={
          <EmptyState
            icon={query || department !== 'all' ? Search : Briefcase}
            title={query || department !== 'all' ? 'No matching roles' : 'No open roles'}
            message={
              query || department !== 'all'
                ? 'Try a different search term or clear the department filter.'
                : 'Post a role and it will appear on the careers page.'
            }
            action={
              query || department !== 'all' ? (
                <Button variant="outline" onClick={() => { setQuery(''); setDepartment('all') }}>
                  Clear filters
                </Button>
              ) : writable ? (
                <Button to="/careers/new"><Plus className="h-4 w-4" /> New role</Button>
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
          remove('careers', ids)
          setSelected([])
          toast(`${ids.length} ${ids.length === 1 ? 'role' : 'roles'} deleted.`, { tone: 'info' })
        }}
        title="Delete this role?"
        message="The listing will be removed from the careers page. Applicant counts are lost. This cannot be undone."
      />
    </div>
  )
}
