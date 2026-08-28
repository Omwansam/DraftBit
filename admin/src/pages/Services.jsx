import { useMemo, useState } from 'react'
import { ArrowDown, ArrowUp, Pencil, Plus, Sparkles, Trash2 } from 'lucide-react'
import PageHeader from '../components/ui/PageHeader'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import EmptyState from '../components/ui/EmptyState'
import { StatusBadge } from '../components/ui/Badge'
import { Input, ListEditor, Select, Textarea } from '../components/ui/Field'
import { useData } from '../context/DataContext'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/ui/Toast'
import Icon from '../components/ui/Icon'
import { ICON_OPTIONS } from '../data/seed'

const BLANK = {
  icon: 'Code', title: '', description: '', features: [], status: 'published', order: 99,
}

export default function Services() {
  const { services, create, update, remove } = useData()
  const { can } = useAuth()
  const { toast } = useToast()

  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(BLANK)
  const [errors, setErrors] = useState({})
  const [confirmDelete, setConfirmDelete] = useState(null)

  const writable = can('write')
  const ordered = useMemo(
    () => [...services].sort((a, b) => (a.order ?? 99) - (b.order ?? 99)),
    [services],
  )

  const move = (index, direction) => {
    const target = index + direction
    if (target < 0 || target >= ordered.length) return
    const a = ordered[index]
    const b = ordered[target]
    update('services', a.id, { order: b.order })
    update('services', b.id, { order: a.order })
  }

  const openEditor = (record) => {
    setErrors({})
    setForm(record === 'new' ? { ...BLANK, order: services.length + 1 } : record)
    setEditing(record)
  }

  const save = () => {
    const next = {}
    if (!form.title.trim()) next.title = 'A title is required'
    if (!form.description.trim()) next.description = 'Describe what this service covers'
    setErrors(next)
    if (Object.keys(next).length) return

    if (editing === 'new') {
      create('services', form)
      toast('Service added.')
    } else {
      update('services', editing.id, form)
      toast('Service updated.')
    }
    setEditing(null)
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Content"
        title="Services"
        description="What DraftBit offers, in the order shown on the services page."
        actions={
          writable && (
            <Button onClick={() => openEditor('new')}>
              <Plus className="h-4 w-4" /> Add service
            </Button>
          )
        }
      />

      {ordered.length === 0 ? (
        <Card>
          <EmptyState
            icon={Sparkles}
            title="No services listed"
            message="Add the services you want on the public services page."
            action={writable ? <Button onClick={() => openEditor('new')}><Plus className="h-4 w-4" /> Add service</Button> : null}
          />
        </Card>
      ) : (
        <Card>
          <ul className="divide-y divide-border">
            {ordered.map((service, index) => (
                <li key={service.id} className="flex flex-wrap items-start gap-4 px-5 py-4">
                  {writable && (
                    <div className="flex shrink-0 flex-col gap-0.5 pt-0.5">
                      <button
                        type="button"
                        onClick={() => move(index, -1)}
                        disabled={index === 0}
                        aria-label={`Move ${service.title} up`}
                        className="rounded p-1 text-muted-foreground transition-colors hover:bg-foreground/8 hover:text-foreground disabled:opacity-30 disabled:hover:bg-transparent"
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => move(index, 1)}
                        disabled={index === ordered.length - 1}
                        aria-label={`Move ${service.title} down`}
                        className="rounded p-1 text-muted-foreground transition-colors hover:bg-foreground/8 hover:text-foreground disabled:opacity-30 disabled:hover:bg-transparent"
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}

                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                    <Icon name={service.icon} className="h-5 w-5" aria-hidden="true" />
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-[0.9375rem] font-semibold text-foreground">{service.title}</h2>
                      <StatusBadge status={service.status} />
                    </div>
                    <p className="mt-1 text-[0.8125rem] leading-relaxed text-muted-foreground">
                      {service.description}
                    </p>
                    {service.features?.length > 0 && (
                      <ul className="mt-2.5 flex flex-wrap gap-1.5">
                        {service.features.map((f) => (
                          <li
                            key={f}
                            className="rounded-md bg-foreground/5 px-2 py-0.5 text-xs text-muted-foreground"
                          >
                            {f}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {writable && (
                    <div className="flex shrink-0 items-center gap-0.5">
                      <button
                        type="button"
                        onClick={() => openEditor(service)}
                        title="Edit"
                        aria-label={`Edit ${service.title}`}
                        className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-foreground/8 hover:text-foreground"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(service)}
                        title="Delete"
                        aria-label={`Delete ${service.title}`}
                        className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-critical/10 hover:text-critical"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </li>
            ))}
          </ul>
        </Card>
      )}

      <Modal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title={editing === 'new' ? 'Add service' : 'Edit service'}
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={save}>{editing === 'new' ? 'Add service' : 'Save changes'}</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3 rounded-lg border border-border bg-surface-2 p-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
              <Icon name={form.icon} className="h-5 w-5" aria-hidden="true" />
            </span>
            <p className="text-xs text-muted-foreground">
              Icon preview — this is what appears on the services card.
            </p>
          </div>

          <Input
            label="Title"
            required
            data-autofocus
            value={form.title}
            error={errors.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Custom Software"
          />
          <Textarea
            label="Description"
            required
            rows={3}
            value={form.description}
            error={errors.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Tailor-made applications designed to solve…"
          />
          <ListEditor
            label="Features"
            hint="Bullets listed under the description."
            value={form.features}
            onChange={(features) => setForm({ ...form, features })}
            placeholder="e.g. API development"
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Icon"
              value={form.icon}
              onChange={(e) => setForm({ ...form, icon: e.target.value })}
              options={ICON_OPTIONS}
            />
            <Select
              label="Status"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              options={[
                { value: 'published', label: 'Published — live' },
                { value: 'draft', label: 'Draft — hidden' },
              ]}
            />
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={Boolean(confirmDelete)}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => {
          remove('services', confirmDelete.id)
          toast('Service deleted.', { tone: 'info' })
        }}
        title={`Delete “${confirmDelete?.title}”?`}
        message="This removes the service from the public services page. It cannot be undone."
      />
    </div>
  )
}
