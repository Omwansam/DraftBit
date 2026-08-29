import { useState } from 'react'
import { Github, Linkedin, Mail, Pencil, Plus, Trash2, Users } from 'lucide-react'
import PageHeader from '../components/ui/PageHeader'
import Button from '../components/ui/Button'
import Card, { CardBody } from '../components/ui/Card'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import EmptyState from '../components/ui/EmptyState'
import { StatusBadge } from '../components/ui/Badge'
import { Input, Select, Textarea } from '../components/ui/Field'
import { useData } from '../context/DataContext'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/ui/Toast'
import { formatDate, initials } from '../lib/format'

const BLANK = {
  name: '', role: '', focus: '', email: '', linkedin: '', github: '',
  status: 'active', order: 99, joinedAt: new Date().toISOString(),
}

export default function Team() {
  const { team, create, update, remove } = useData()
  const { can } = useAuth()
  const { toast } = useToast()

  const [editing, setEditing] = useState(null) // record | 'new' | null
  const [form, setForm] = useState(BLANK)
  const [errors, setErrors] = useState({})
  const [confirmDelete, setConfirmDelete] = useState(null)

  const writable = can('write')
  const members = [...team].sort((a, b) => (a.order ?? 99) - (b.order ?? 99))

  const openEditor = (member) => {
    setErrors({})
    setForm(member === 'new' ? { ...BLANK, order: team.length + 1 } : member)
    setEditing(member)
  }

  const save = () => {
    const next = {}
    if (!form.name.trim()) next.name = 'A name is required'
    if (!form.role.trim()) next.role = 'A role is required'
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) next.email = 'Enter a valid email'
    setErrors(next)
    if (Object.keys(next).length) return

    if (editing === 'new') {
      create('team', form)
      toast(`${form.name} added to the team.`)
    } else {
      update('team', editing.id, form)
      toast('Team member updated.')
    }
    setEditing(null)
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="People"
        title="Team"
        description="The people shown on the about page."
        actions={
          writable && (
            <Button onClick={() => openEditor('new')}>
              <Plus className="h-4 w-4" /> Add member
            </Button>
          )
        }
      />

      {members.length === 0 ? (
        <Card>
          <EmptyState
            icon={Users}
            title="No team members yet"
            message="Add the people you want featured on the about page."
            action={writable ? <Button onClick={() => openEditor('new')}><Plus className="h-4 w-4" /> Add member</Button> : null}
          />
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {members.map((member) => (
            <Card key={member.id} className="flex flex-col">
              <CardBody className="flex flex-1 flex-col">
                <div className="flex items-start gap-3.5">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-secondary/15 font-display text-sm font-bold text-secondary">
                    {initials(member.name)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h2 className="truncate font-display text-base font-bold text-foreground">
                      {member.name}
                    </h2>
                    <p className="truncate text-[0.8125rem] text-primary">{member.role}</p>
                  </div>
                  <StatusBadge status={member.status} />
                </div>

                <p className="mt-3.5 flex-1 text-[0.8125rem] leading-relaxed text-muted-foreground">
                  {member.focus}
                </p>

                <div className="mt-4 flex items-center gap-1 border-t border-border pt-3.5">
                  {member.email && (
                    <a
                      href={`mailto:${member.email}`}
                      title={member.email}
                      aria-label={`Email ${member.name}`}
                      className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-foreground/8 hover:text-foreground"
                    >
                      <Mail className="h-4 w-4" />
                    </a>
                  )}
                  {member.linkedin && (
                    <a
                      href={member.linkedin}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`${member.name} on LinkedIn`}
                      className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-foreground/8 hover:text-foreground"
                    >
                      <Linkedin className="h-4 w-4" />
                    </a>
                  )}
                  {member.github && (
                    <a
                      href={member.github}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`${member.name} on GitHub`}
                      className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-foreground/8 hover:text-foreground"
                    >
                      <Github className="h-4 w-4" />
                    </a>
                  )}
                  <span className="ml-auto text-xs text-subtle-foreground">
                    Joined {formatDate(member.joinedAt, { day: undefined })}
                  </span>
                  {writable && (
                    <>
                      <button
                        type="button"
                        onClick={() => openEditor(member)}
                        title="Edit"
                        aria-label={`Edit ${member.name}`}
                        className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-foreground/8 hover:text-foreground"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(member)}
                        title="Remove"
                        aria-label={`Remove ${member.name}`}
                        className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-critical/10 hover:text-critical"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title={editing === 'new' ? 'Add team member' : 'Edit team member'}
        description="These details appear on the public about page."
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={save}>{editing === 'new' ? 'Add member' : 'Save changes'}</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Input
            label="Full name"
            required
            data-autofocus
            value={form.name}
            error={errors.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Alex Kimani"
          />
          <Input
            label="Role"
            required
            value={form.role}
            error={errors.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            placeholder="Founder & Lead Engineer"
          />
          <Textarea
            label="Focus"
            rows={2}
            value={form.focus}
            onChange={(e) => setForm({ ...form, focus: e.target.value })}
            placeholder="Architecture, backend, and delivery."
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Email"
              type="email"
              value={form.email}
              error={errors.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="alex@draftbitlabs.tech"
            />
            <Select
              label="Status"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              options={[
                { value: 'active', label: 'Active — shown on the site' },
                { value: 'archived', label: 'Archived — hidden' },
              ]}
            />
          </div>
          <Input
            label="LinkedIn URL"
            value={form.linkedin}
            onChange={(e) => setForm({ ...form, linkedin: e.target.value })}
            placeholder="https://linkedin.com/in/…"
          />
          <Input
            label="GitHub URL"
            value={form.github}
            onChange={(e) => setForm({ ...form, github: e.target.value })}
            placeholder="https://github.com/…"
          />
          <Input
            label="Display order"
            type="number"
            hint="Lower numbers appear first on the about page."
            value={form.order}
            onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
          />
        </div>
      </Modal>

      <ConfirmDialog
        open={Boolean(confirmDelete)}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => {
          remove('team', confirmDelete.id)
          toast(`${confirmDelete.name} removed from the team.`, { tone: 'info' })
        }}
        title={`Remove ${confirmDelete?.name}?`}
        message="They will no longer appear on the about page. This cannot be undone."
        confirmLabel="Remove"
      />
    </div>
  )
}
