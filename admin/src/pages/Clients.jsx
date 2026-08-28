import { useMemo, useState } from 'react'
import { Building2, ExternalLink, Pencil, Plus, Search, Star, Trash2 } from 'lucide-react'
import PageHeader from '../components/ui/PageHeader'
import Button from '../components/ui/Button'
import DataTable from '../components/ui/DataTable'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import EmptyState from '../components/ui/EmptyState'
import Badge from '../components/ui/Badge'
import { Input, Switch } from '../components/ui/Field'
import { useData } from '../context/DataContext'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/ui/Toast'

const BLANK = { name: '', industry: '', website: '', featured: false }

export default function Clients() {
  const { clients, ready, create, update, remove } = useData()
  const { can } = useAuth()
  const { toast } = useToast()

  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(BLANK)
  const [errors, setErrors] = useState({})
  const [selected, setSelected] = useState([])
  const [confirm, setConfirm] = useState(null)

  const writable = can('write')

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    return clients.filter((c) => !q || `${c.name} ${c.industry}`.toLowerCase().includes(q))
  }, [clients, query])

  const openEditor = (record) => {
    setErrors({})
    setForm(record === 'new' ? BLANK : record)
    setEditing(record)
  }

  const save = () => {
    const next = {}
    if (!form.name.trim()) next.name = 'A client name is required'
    if (form.website && !/^https?:\/\//.test(form.website)) {
      next.website = 'Include the protocol, e.g. https://'
    }
    setErrors(next)
    if (Object.keys(next).length) return

    if (editing === 'new') {
      create('clients', form)
      toast('Client added.')
    } else {
      update('clients', editing.id, form)
      toast('Client updated.')
    }
    setEditing(null)
  }

  const columns = [
    {
      key: 'name',
      header: 'Client',
      render: (row) => (
        <span className="flex items-center gap-2 font-medium text-foreground">
          {row.name}
          {row.featured && (
            <Star className="h-3.5 w-3.5 shrink-0 fill-warning text-warning" aria-label="Featured" />
          )}
        </span>
      ),
    },
    {
      key: 'industry',
      header: 'Industry',
      render: (row) => (row.industry ? <Badge tone="accent">{row.industry}</Badge> : <span className="text-subtle-foreground">—</span>),
    },
    {
      key: 'website',
      header: 'Website',
      hideBelow: 'sm',
      render: (row) =>
        row.website ? (
          <a
            href={row.website}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1.5 text-[0.8125rem] text-primary hover:underline"
          >
            {row.website.replace(/^https?:\/\//, '')}
            <ExternalLink className="h-3 w-3 shrink-0" aria-hidden="true" />
          </a>
        ) : (
          <span className="text-subtle-foreground">—</span>
        ),
    },
    {
      key: 'actions',
      header: '',
      sortable: false,
      width: '1%',
      render: (row) => (
        writable && (
          <div className="flex items-center justify-end gap-0.5" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => openEditor(row)}
              title="Edit"
              aria-label={`Edit ${row.name}`}
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-foreground/8 hover:text-foreground"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setConfirm(row.id)}
              title="Delete"
              aria-label={`Delete ${row.name}`}
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-critical/10 hover:text-critical"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Content"
        title="Clients"
        description="Names shown in the logo marquee on the homepage."
        actions={
          writable && (
            <Button onClick={() => openEditor('new')}>
              <Plus className="h-4 w-4" /> Add client
            </Button>
          )
        }
      />

      <div className="relative max-w-md">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle-foreground"
          aria-hidden="true"
        />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search clients…"
          aria-label="Search clients"
          className="h-10 w-full rounded-lg border border-border bg-input pl-10 pr-3 text-sm text-foreground placeholder:text-subtle-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25"
        />
      </div>

      {selected.length > 0 && writable && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-primary/30 bg-primary/[0.07] px-3 py-2">
          <span className="tnum mr-auto text-[0.8125rem] font-medium text-foreground">
            {selected.length} selected
          </span>
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
        pageSize={12}
        initialSort={{ key: 'name', dir: 'asc' }}
        empty={
          <EmptyState
            icon={query ? Search : Building2}
            title={query ? 'No matching clients' : 'No clients listed'}
            message={
              query
                ? `Nothing matches “${query}”.`
                : 'Add the companies you want named in the homepage marquee.'
            }
            action={
              query ? (
                <Button variant="outline" onClick={() => setQuery('')}>Clear search</Button>
              ) : writable ? (
                <Button onClick={() => openEditor('new')}><Plus className="h-4 w-4" /> Add client</Button>
              ) : null
            }
          />
        }
      />

      <Modal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        size="sm"
        title={editing === 'new' ? 'Add client' : 'Edit client'}
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={save}>{editing === 'new' ? 'Add client' : 'Save changes'}</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Input
            label="Client name"
            required
            data-autofocus
            value={form.name}
            error={errors.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Safaricom"
          />
          <Input
            label="Industry"
            value={form.industry}
            onChange={(e) => setForm({ ...form, industry: e.target.value })}
            placeholder="Telecom"
          />
          <Input
            label="Website"
            value={form.website}
            error={errors.website}
            onChange={(e) => setForm({ ...form, website: e.target.value })}
            placeholder="https://example.com"
          />
          <Switch
            label="Featured"
            description="Featured clients appear first in the marquee."
            checked={form.featured}
            onChange={(featured) => setForm({ ...form, featured })}
          />
        </div>
      </Modal>

      <ConfirmDialog
        open={Boolean(confirm)}
        onClose={() => setConfirm(null)}
        onConfirm={() => {
          const ids = confirm === 'bulk' ? selected : [confirm]
          remove('clients', ids)
          setSelected([])
          toast(`${ids.length} ${ids.length === 1 ? 'client' : 'clients'} deleted.`, { tone: 'info' })
        }}
        title={confirm === 'bulk' ? `Delete ${selected.length} clients?` : 'Delete this client?'}
        message="The name will no longer appear in the homepage marquee."
      />
    </div>
  )
}
