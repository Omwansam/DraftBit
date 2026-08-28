import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Archive, ArrowLeft, Ban, CheckCheck, Inbox, Mail, MailOpen, Reply,
  Search, Star, Trash2, X,
} from 'lucide-react'
import PageHeader from '../components/ui/PageHeader'
import Button from '../components/ui/Button'
import Tabs from '../components/ui/Tabs'
import EmptyState from '../components/ui/EmptyState'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import { StatusBadge } from '../components/ui/Badge'
import { useData } from '../context/DataContext'
import { useToast } from '../components/ui/Toast'
import { formatDateTime, formatRelative, initials, truncate } from '../lib/format'

const FILTERS = [
  { id: 'inbox', label: 'Inbox' },
  { id: 'unread', label: 'Unread' },
  { id: 'starred', label: 'Starred' },
  { id: 'replied', label: 'Replied' },
  { id: 'archived', label: 'Archived' },
  { id: 'spam', label: 'Spam' },
]

const matchesFilter = (msg, filter) => {
  switch (filter) {
    case 'unread': return !msg.read && msg.status !== 'spam'
    case 'starred': return msg.starred && msg.status !== 'spam'
    case 'replied': return msg.status === 'replied'
    case 'archived': return msg.status === 'archived'
    case 'spam': return msg.status === 'spam'
    default: return msg.status !== 'archived' && msg.status !== 'spam'
  }
}

export default function Messages() {
  const { messages, update, updateMany, remove } = useData()
  const { toast } = useToast()
  const [params, setParams] = useSearchParams()

  const [filter, setFilter] = useState('inbox')
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState([])
  const [confirmDelete, setConfirmDelete] = useState(null)

  const activeId = params.get('open')
  const active = messages.find((m) => m.id === activeId) ?? null

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return messages
      .filter((m) => matchesFilter(m, filter))
      .filter((m) =>
        !q ||
        `${m.name} ${m.email} ${m.subject} ${m.message}`.toLowerCase().includes(q),
      )
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }, [messages, filter, query])

  const counts = useMemo(
    () => Object.fromEntries(
      FILTERS.map((f) => [f.id, messages.filter((m) => matchesFilter(m, f.id)).length]),
    ),
    [messages],
  )

  /* Opening a message marks it read — the same gesture, one less click. */
  useEffect(() => {
    if (active && !active.read) update('messages', active.id, { read: true })
  }, [active, update])

  const openMessage = (id) => {
    setParams(id ? { open: id } : {}, { replace: true })
  }

  const bulk = (patch, verb) => {
    updateMany('messages', selected, patch)
    toast(`${selected.length} ${selected.length === 1 ? 'message' : 'messages'} ${verb}.`)
    setSelected([])
  }

  const deleteSelected = () => {
    const ids = confirmDelete === 'bulk' ? selected : [confirmDelete]
    remove('messages', ids)
    if (ids.includes(activeId)) openMessage(null)
    setSelected([])
    toast(`${ids.length} ${ids.length === 1 ? 'message' : 'messages'} deleted.`, { tone: 'info' })
  }

  const allVisibleSelected = visible.length > 0 && visible.every((m) => selected.includes(m.id))

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Overview"
        title="Messages"
        description="Every enquiry submitted through the contact form on the public site."
        actions={
          counts.unread > 0 ? (
            <Button
              variant="outline"
              onClick={() => {
                const unread = messages.filter((m) => !m.read && m.status !== 'spam').map((m) => m.id)
                updateMany('messages', unread, { read: true })
                toast('All messages marked as read.')
              }}
            >
              <CheckCheck className="h-4 w-4" /> Mark all read
            </Button>
          ) : null
        }
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        {/* ---- List pane ---- */}
        <div className={`min-w-0 flex-col gap-3 ${active ? 'hidden lg:flex' : 'flex'}`}>
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle-foreground"
              aria-hidden="true"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, email or message…"
              aria-label="Search messages"
              className="h-10 w-full rounded-lg border border-border bg-input pl-10 pr-9 text-sm text-foreground placeholder:text-subtle-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground hover:text-foreground"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <Tabs
            tabs={FILTERS.map((f) => ({ ...f, count: counts[f.id] }))}
            active={filter}
            onChange={(id) => { setFilter(id); setSelected([]) }}
          />

          {/* Bulk action bar appears only when there is a selection. */}
          {selected.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 rounded-lg border border-primary/30 bg-primary/[0.07] px-3 py-2">
              <span className="tnum mr-auto text-[0.8125rem] font-medium text-foreground">
                {selected.length} selected
              </span>
              <Button size="sm" variant="ghost" onClick={() => bulk({ read: true }, 'marked as read')}>
                <MailOpen className="h-3.5 w-3.5" /> Read
              </Button>
              <Button size="sm" variant="ghost" onClick={() => bulk({ status: 'archived' }, 'archived')}>
                <Archive className="h-3.5 w-3.5" /> Archive
              </Button>
              <Button size="sm" variant="ghost" onClick={() => bulk({ status: 'spam', read: true }, 'marked as spam')}>
                <Ban className="h-3.5 w-3.5" /> Spam
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setConfirmDelete('bulk')}>
                <Trash2 className="h-3.5 w-3.5 text-critical" /> Delete
              </Button>
            </div>
          )}

          <div className="overflow-hidden rounded-xl border border-border bg-surface">
            {visible.length === 0 ? (
              <EmptyState
                icon={query ? Search : Inbox}
                title={query ? 'No matches' : 'Nothing here'}
                message={
                  query
                    ? `No message matches “${query}” in this folder.`
                    : 'Messages sent through the contact form will appear here.'
                }
                action={query ? <Button variant="outline" onClick={() => setQuery('')}>Clear search</Button> : null}
              />
            ) : (
              <>
                <div className="flex items-center gap-3 border-b border-border bg-surface-2/60 px-4 py-2">
                  <input
                    type="checkbox"
                    checked={allVisibleSelected}
                    onChange={() =>
                      setSelected(allVisibleSelected ? [] : visible.map((m) => m.id))
                    }
                    aria-label="Select all messages"
                    className="h-4 w-4 cursor-pointer rounded border-border-strong bg-input accent-[var(--primary)]"
                  />
                  <span className="tnum text-xs text-muted-foreground">
                    {visible.length} {visible.length === 1 ? 'message' : 'messages'}
                  </span>
                </div>

                <ul className="scroll-slim max-h-[34rem] divide-y divide-border overflow-y-auto">
                  {visible.map((msg) => (
                    <li key={msg.id} className="flex items-start gap-2.5 px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selected.includes(msg.id)}
                        onChange={() =>
                          setSelected((prev) =>
                            prev.includes(msg.id)
                              ? prev.filter((id) => id !== msg.id)
                              : [...prev, msg.id],
                          )
                        }
                        aria-label={`Select message from ${msg.name}`}
                        className="mt-2 h-4 w-4 shrink-0 cursor-pointer rounded border-border-strong bg-input accent-[var(--primary)]"
                      />
                      <button
                        type="button"
                        onClick={() => openMessage(msg.id)}
                        className={`min-w-0 flex-1 rounded-lg px-2 py-1 text-left transition-colors ${
                          activeId === msg.id ? 'bg-primary/[0.08]' : 'hover:bg-foreground/[0.03]'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-secondary/15 text-[0.625rem] font-bold text-secondary">
                            {initials(msg.name)}
                          </span>
                          <span className={`min-w-0 flex-1 truncate text-[0.8125rem] ${msg.read ? 'text-muted-foreground' : 'font-semibold text-foreground'}`}>
                            {msg.name}
                          </span>
                          {msg.starred && (
                            <Star className="h-3.5 w-3.5 shrink-0 fill-warning text-warning" aria-label="Starred" />
                          )}
                          {!msg.read && (
                            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-label="Unread" />
                          )}
                          <span className="shrink-0 whitespace-nowrap text-[0.6875rem] text-subtle-foreground">
                            {formatRelative(msg.createdAt)}
                          </span>
                        </span>
                        <span className={`mt-1 block truncate text-sm ${msg.read ? 'text-foreground' : 'font-semibold text-foreground'}`}>
                          {msg.subject || 'No subject'}
                        </span>
                        <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                          {truncate(msg.message, 80)}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>

        {/* ---- Detail pane ---- */}
        <div className={`min-w-0 ${active ? 'block' : 'hidden lg:block'}`}>
          {active ? (
            <article className="flex flex-col overflow-hidden rounded-xl border border-border bg-surface">
              <header className="flex flex-wrap items-start justify-between gap-3 border-b border-border px-5 py-4">
                <div className="flex min-w-0 items-start gap-3">
                  <button
                    type="button"
                    onClick={() => openMessage(null)}
                    className="rounded-lg p-1.5 text-muted-foreground hover:bg-foreground/8 hover:text-foreground lg:hidden"
                    aria-label="Back to list"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-secondary/15 text-xs font-bold text-secondary">
                    {initials(active.name)}
                  </span>
                  <div className="min-w-0">
                    <h2 className="truncate text-base font-semibold text-foreground">{active.name}</h2>
                    <a
                      href={`mailto:${active.email}`}
                      className="block truncate text-[0.8125rem] text-primary hover:underline"
                    >
                      {active.email}
                    </a>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => update('messages', active.id, { starred: !active.starred })}
                    className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-foreground/8 hover:text-warning"
                    aria-label={active.starred ? 'Remove star' : 'Star message'}
                    title={active.starred ? 'Remove star' : 'Star message'}
                  >
                    <Star className={`h-4 w-4 ${active.starred ? 'fill-warning text-warning' : ''}`} />
                  </button>
                  <button
                    type="button"
                    onClick={() => update('messages', active.id, { read: !active.read })}
                    className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-foreground/8 hover:text-foreground"
                    aria-label={active.read ? 'Mark as unread' : 'Mark as read'}
                    title={active.read ? 'Mark as unread' : 'Mark as read'}
                  >
                    {active.read ? <Mail className="h-4 w-4" /> : <MailOpen className="h-4 w-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      update('messages', active.id, { status: 'archived' })
                      toast('Message archived.')
                    }}
                    className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-foreground/8 hover:text-foreground"
                    aria-label="Archive message"
                    title="Archive"
                  >
                    <Archive className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(active.id)}
                    className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-critical/10 hover:text-critical"
                    aria-label="Delete message"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </header>

              <div className="border-b border-border px-5 py-3">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                  <StatusBadge status={active.status} />
                  <span className="text-xs text-muted-foreground">{formatDateTime(active.createdAt)}</span>
                  <span className="text-xs text-subtle-foreground">via {active.source}</span>
                </div>
              </div>

              <div className="px-5 py-5">
                <h3 className="font-display text-lg font-bold text-foreground">
                  {active.subject || 'No subject'}
                </h3>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                  {active.message}
                </p>
              </div>

              <footer className="flex flex-wrap items-center gap-2 border-t border-border px-5 py-3.5">
                <Button
                  href={`mailto:${active.email}?subject=${encodeURIComponent(`Re: ${active.subject || 'Your enquiry'}`)}`}
                  onClick={() => update('messages', active.id, { status: 'replied' })}
                >
                  <Reply className="h-4 w-4" /> Reply by email
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    update('messages', active.id, {
                      status: active.status === 'in-progress' ? 'new' : 'in-progress',
                    })
                  }}
                >
                  {active.status === 'in-progress' ? 'Clear in progress' : 'Mark in progress'}
                </Button>
                <Button
                  variant="ghost"
                  className="ml-auto"
                  onClick={() => {
                    update('messages', active.id, { status: 'spam', read: true })
                    toast('Marked as spam.', { tone: 'info' })
                    openMessage(null)
                  }}
                >
                  <Ban className="h-4 w-4" /> Spam
                </Button>
              </footer>
            </article>
          ) : (
            <div className="hidden h-full min-h-[24rem] items-center justify-center rounded-xl border border-dashed border-border bg-surface/50 lg:flex">
              <EmptyState
                icon={Mail}
                title="No message selected"
                message="Pick an enquiry from the list to read it and reply."
              />
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(confirmDelete)}
        onClose={() => setConfirmDelete(null)}
        onConfirm={deleteSelected}
        title={confirmDelete === 'bulk' ? `Delete ${selected.length} messages?` : 'Delete this message?'}
        message="This permanently removes the enquiry, including the sender's contact details. It cannot be undone."
      />
    </div>
  )
}
