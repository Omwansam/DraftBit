import { useMemo, useState } from 'react'
import { Search, Shield, Trash2, UserPlus, UserX } from 'lucide-react'
import PageHeader from '../components/ui/PageHeader'
import Button from '../components/ui/Button'
import DataTable from '../components/ui/DataTable'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import EmptyState from '../components/ui/EmptyState'
import Card, { CardBody, CardHeader } from '../components/ui/Card'
import Badge, { StatusBadge } from '../components/ui/Badge'
import { Input, Select } from '../components/ui/Field'
import { useData } from '../context/DataContext'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/ui/Toast'
import { formatDate, formatRelative, initials } from '../lib/format'
import { ROLES } from '../data/seed'

const ROLE_SUMMARY = [
  { role: 'Owner', blurb: 'Full access, including billing and transfer of ownership.' },
  { role: 'Admin', blurb: 'Everything except ownership: content, users and site settings.' },
  { role: 'Editor', blurb: 'Create, edit and publish content. No user or settings access.' },
  { role: 'Viewer', blurb: 'Read-only. Can see the console but change nothing.' },
]

export default function Users() {
  const { users, ready, create, update, remove } = useData()
  const { user: currentUser } = useAuth()
  const { toast } = useToast()

  const [query, setQuery] = useState('')
  const [inviteOpen, setInviteOpen] = useState(false)
  const [invite, setInvite] = useState({ name: '', email: '', role: 'Editor' })
  const [errors, setErrors] = useState({})
  const [confirm, setConfirm] = useState(null)

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    return users.filter((u) => !q || `${u.name} ${u.email} ${u.role}`.toLowerCase().includes(q))
  }, [users, query])

  const owners = users.filter((u) => u.role === 'Owner')

  /** Guards that keep an account from locking everyone out of the console. */
  const guard = (target, action) => {
    if (target.id === currentUser?.id) {
      toast(`You cannot ${action} your own account.`, { tone: 'warning' })
      return false
    }
    if (target.role === 'Owner' && owners.length === 1) {
      toast('There must always be at least one Owner.', { tone: 'warning' })
      return false
    }
    return true
  }

  const sendInvite = () => {
    const next = {}
    if (!invite.name.trim()) next.name = 'A name is required'
    if (!/^\S+@\S+\.\S+$/.test(invite.email)) next.email = 'Enter a valid email address'
    if (users.some((u) => u.email.toLowerCase() === invite.email.trim().toLowerCase())) {
      next.email = 'Someone with that email already has access'
    }
    setErrors(next)
    if (Object.keys(next).length) return

    create('users', {
      ...invite,
      email: invite.email.trim().toLowerCase(),
      username: invite.email.split('@')[0],
      status: 'invited',
      lastActive: null,
    })
    toast(`Invitation sent to ${invite.email}.`)
    setInvite({ name: '', email: '', role: 'Editor' })
    setInviteOpen(false)
  }

  const columns = [
    {
      key: 'name',
      header: 'User',
      render: (row) => (
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-secondary/15 text-[0.6875rem] font-bold text-secondary">
            {initials(row.name)}
          </span>
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 truncate font-medium text-foreground">
              {row.name}
              {row.id === currentUser?.id && (
                <span className="rounded bg-primary/12 px-1.5 py-0.5 text-[0.625rem] font-semibold uppercase tracking-wide text-primary">
                  You
                </span>
              )}
            </p>
            <p className="truncate text-xs text-muted-foreground">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      render: (row) => (
        <div onClick={(e) => e.stopPropagation()}>
          <select
            value={row.role}
            aria-label={`Role for ${row.name}`}
            disabled={row.id === currentUser?.id}
            onChange={(e) => {
              if (!guard(row, 'change the role of')) return
              update('users', row.id, { role: e.target.value })
              toast(`${row.name} is now ${e.target.value}.`)
            }}
            className="h-8 rounded-md border border-border bg-input px-2 text-[0.8125rem] text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'lastActive',
      header: 'Last active',
      align: 'right',
      hideBelow: 'md',
      sortValue: (row) => (row.lastActive ? new Date(row.lastActive).getTime() : 0),
      render: (row) => (
        <span className="whitespace-nowrap text-xs text-muted-foreground">
          {row.lastActive ? formatRelative(row.lastActive) : 'Never'}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Added',
      align: 'right',
      hideBelow: 'lg',
      sortValue: (row) => new Date(row.createdAt).getTime(),
      render: (row) => (
        <span className="whitespace-nowrap text-xs text-muted-foreground">
          {formatDate(row.createdAt)}
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
          <button
            type="button"
            onClick={() => {
              if (!guard(row, 'suspend')) return
              const status = row.status === 'suspended' ? 'active' : 'suspended'
              update('users', row.id, { status })
              toast(status === 'suspended' ? `${row.name} suspended.` : `${row.name} reactivated.`)
            }}
            title={row.status === 'suspended' ? 'Reactivate' : 'Suspend'}
            aria-label={row.status === 'suspended' ? `Reactivate ${row.name}` : `Suspend ${row.name}`}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-foreground/8 hover:text-foreground"
          >
            <UserX className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => { if (guard(row, 'remove')) setConfirm(row) }}
            title="Remove access"
            aria-label={`Remove access for ${row.name}`}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-critical/10 hover:text-critical"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="People"
        title="Admin users"
        description="Who can sign in to this console, and what they are allowed to do."
        actions={
          <Button onClick={() => setInviteOpen(true)}>
            <UserPlus className="h-4 w-4" /> Invite user
          </Button>
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
          placeholder="Search name, email or role…"
          aria-label="Search users"
          className="h-10 w-full rounded-lg border border-border bg-input pl-10 pr-3 text-sm text-foreground placeholder:text-subtle-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25"
        />
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        loading={!ready}
        selected={[]}
        onSelectionChange={() => {}}
        pageSize={10}
        initialSort={{ key: 'name', dir: 'asc' }}
        empty={
          <EmptyState
            icon={Search}
            title="No matching users"
            message={`Nothing matches “${query}”.`}
            action={<Button variant="outline" onClick={() => setQuery('')}>Clear search</Button>}
          />
        }
      />

      <Card>
        <CardHeader
          title="What each role can do"
          subtitle="The console hides what a role cannot do; the API enforces the same rules."
        />
        <CardBody>
          <ul className="flex flex-col gap-3">
            {ROLE_SUMMARY.map((r) => (
              <li key={r.role} className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <Badge tone={r.role === 'Owner' ? 'info' : 'neutral'} icon={Shield}>
                  {r.role}
                </Badge>
                <span className="flex-1 text-[0.8125rem] text-muted-foreground">{r.blurb}</span>
              </li>
            ))}
          </ul>
        </CardBody>
      </Card>

      <Modal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        size="sm"
        title="Invite a user"
        description="They will receive an email with a link to set their password."
        footer={
          <>
            <Button variant="ghost" onClick={() => setInviteOpen(false)}>Cancel</Button>
            <Button onClick={sendInvite}>Send invitation</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Input
            label="Full name"
            required
            data-autofocus
            value={invite.name}
            error={errors.name}
            onChange={(e) => setInvite({ ...invite, name: e.target.value })}
            placeholder="Brian Otieno"
          />
          <Input
            label="Email address"
            type="email"
            required
            value={invite.email}
            error={errors.email}
            onChange={(e) => setInvite({ ...invite, email: e.target.value })}
            placeholder="brian@draftbit.com"
          />
          <Select
            label="Role"
            hint={ROLE_SUMMARY.find((r) => r.role === invite.role)?.blurb}
            value={invite.role}
            onChange={(e) => setInvite({ ...invite, role: e.target.value })}
            options={ROLES}
          />
        </div>
      </Modal>

      <ConfirmDialog
        open={Boolean(confirm)}
        onClose={() => setConfirm(null)}
        onConfirm={() => {
          remove('users', confirm.id)
          toast(`${confirm.name} no longer has access.`, { tone: 'info' })
        }}
        title={`Remove access for ${confirm?.name}?`}
        message="They will be signed out and will not be able to sign back in. Content they created is not affected."
        confirmLabel="Remove access"
      />
    </div>
  )
}
