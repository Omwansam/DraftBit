import { useMemo, useState } from 'react'
import { Check, MessageSquareQuote, Pencil, Plus, Quote, Star, Trash2, X } from 'lucide-react'
import PageHeader from '../components/ui/PageHeader'
import Button from '../components/ui/Button'
import Card, { CardBody } from '../components/ui/Card'
import Modal from '../components/ui/Modal'
import Tabs from '../components/ui/Tabs'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import EmptyState from '../components/ui/EmptyState'
import { StatusBadge } from '../components/ui/Badge'
import { Input, Select, Textarea } from '../components/ui/Field'
import { useData } from '../context/DataContext'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/ui/Toast'
import { formatDate, initials } from '../lib/format'

const BLANK = {
  quote: '', author: '', role: '', company: '', rating: 5, status: 'pending',
}

/** Rating is ordinal, so the filled stars carry the value; the number stays
    visible as text for anyone who cannot see the difference. */
function Rating({ value }) {
  return (
    <span className="flex items-center gap-0.5" aria-label={`${value} out of 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${i < value ? 'fill-warning text-warning' : 'text-border-strong'}`}
          aria-hidden="true"
        />
      ))}
      <span className="tnum ml-1 text-xs text-muted-foreground">{value}.0</span>
    </span>
  )
}

export default function Testimonials() {
  const { testimonials, create, update, remove } = useData()
  const { can } = useAuth()
  const { toast } = useToast()

  const [tab, setTab] = useState('all')
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(BLANK)
  const [errors, setErrors] = useState({})
  const [confirmDelete, setConfirmDelete] = useState(null)

  const writable = can('write')

  const rows = useMemo(
    () => testimonials
      .filter((t) => tab === 'all' || t.status === tab)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [testimonials, tab],
  )

  const counts = {
    all: testimonials.length,
    published: testimonials.filter((t) => t.status === 'published').length,
    pending: testimonials.filter((t) => t.status === 'pending').length,
  }

  const openEditor = (record) => {
    setErrors({})
    setForm(record === 'new' ? BLANK : record)
    setEditing(record)
  }

  const save = () => {
    const next = {}
    if (!form.quote.trim()) next.quote = 'The quote is required'
    if (!form.author.trim()) next.author = 'Who said it?'
    setErrors(next)
    if (Object.keys(next).length) return

    if (editing === 'new') {
      create('testimonials', form)
      toast('Testimonial added.')
    } else {
      update('testimonials', editing.id, form)
      toast('Testimonial updated.')
    }
    setEditing(null)
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Content"
        title="Testimonials"
        description="Client quotes shown across the site. Only published quotes are visible publicly."
        actions={
          writable && (
            <Button onClick={() => openEditor('new')}>
              <Plus className="h-4 w-4" /> Add testimonial
            </Button>
          )
        }
      />

      <Tabs
        tabs={[
          { id: 'all', label: 'All', count: counts.all },
          { id: 'published', label: 'Published', count: counts.published },
          { id: 'pending', label: 'Pending', count: counts.pending },
        ]}
        active={tab}
        onChange={setTab}
      />

      {rows.length === 0 ? (
        <Card>
          <EmptyState
            icon={MessageSquareQuote}
            title={tab === 'pending' ? 'Nothing awaiting approval' : 'No testimonials yet'}
            message={
              tab === 'pending'
                ? 'New submissions land here for review before they go live.'
                : 'Add a client quote and publish it to show it on the site.'
            }
            action={writable && tab !== 'pending' ? (
              <Button onClick={() => openEditor('new')}><Plus className="h-4 w-4" /> Add testimonial</Button>
            ) : null}
          />
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {rows.map((item) => (
            <Card key={item.id} className="flex min-w-0 flex-col">
              <CardBody className="flex flex-1 flex-col">
                <div className="flex items-start justify-between gap-3">
                  <Quote className="h-5 w-5 shrink-0 text-primary/60" aria-hidden="true" />
                  <StatusBadge status={item.status} />
                </div>

                <blockquote className="mt-3 flex-1 text-[0.9375rem] leading-relaxed text-foreground">
                  “{item.quote}”
                </blockquote>

                <div className="mt-4 flex items-center gap-3 border-t border-border pt-3.5">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-secondary/15 text-[0.6875rem] font-bold text-secondary">
                    {initials(item.author)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[0.8125rem] font-medium text-foreground">{item.author}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {item.role}{item.company ? ` · ${item.company}` : ''}
                    </p>
                  </div>
                  <Rating value={item.rating} />
                </div>

                <div className="mt-3 flex items-center gap-1">
                  <span className="mr-auto text-xs text-subtle-foreground">
                    Added {formatDate(item.createdAt)}
                  </span>
                  {writable && item.status === 'pending' && (
                    <Button
                      size="sm"
                      variant="subtle"
                      onClick={() => {
                        update('testimonials', item.id, { status: 'published' })
                        toast('Testimonial published.')
                      }}
                    >
                      <Check className="h-3.5 w-3.5" /> Approve
                    </Button>
                  )}
                  {writable && item.status === 'published' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        update('testimonials', item.id, { status: 'pending' })
                        toast('Testimonial unpublished.', { tone: 'info' })
                      }}
                    >
                      <X className="h-3.5 w-3.5" /> Unpublish
                    </Button>
                  )}
                  {writable && (
                    <>
                      <button
                        type="button"
                        onClick={() => openEditor(item)}
                        title="Edit"
                        aria-label={`Edit testimonial from ${item.author}`}
                        className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-foreground/8 hover:text-foreground"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(item)}
                        title="Delete"
                        aria-label={`Delete testimonial from ${item.author}`}
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
        title={editing === 'new' ? 'Add testimonial' : 'Edit testimonial'}
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={save}>{editing === 'new' ? 'Add' : 'Save changes'}</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Textarea
            label="Quote"
            required
            rows={4}
            data-autofocus
            value={form.quote}
            error={errors.quote}
            onChange={(e) => setForm({ ...form, quote: e.target.value })}
            placeholder="What did the client say?"
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Author"
              required
              value={form.author}
              error={errors.author}
              onChange={(e) => setForm({ ...form, author: e.target.value })}
              placeholder="Sarah M."
            />
            <Input
              label="Company"
              value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
              placeholder="Northwind SaaS"
            />
          </div>
          <Input
            label="Role"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            placeholder="Product Lead, SaaS Company"
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Rating"
              value={String(form.rating)}
              onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
              options={[5, 4, 3, 2, 1].map((n) => ({ value: String(n), label: `${n} star${n === 1 ? '' : 's'}` }))}
            />
            <Select
              label="Status"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              options={[
                { value: 'pending', label: 'Pending — awaiting approval' },
                { value: 'published', label: 'Published — live on the site' },
              ]}
            />
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={Boolean(confirmDelete)}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => {
          remove('testimonials', confirmDelete.id)
          toast('Testimonial deleted.', { tone: 'info' })
        }}
        title={`Delete the quote from ${confirmDelete?.author}?`}
        message="This cannot be undone."
      />
    </div>
  )
}
