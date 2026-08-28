import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { CornerDownLeft, Search } from 'lucide-react'
import { ALL_NAV_ITEMS } from '../layout/navigation'
import { useData } from '../../context/DataContext'
import { useAuth } from '../../context/AuthContext'

/**
 * ⌘K palette. Searches navigation plus every content record, so any project,
 * insight, role or message is two keystrokes away from anywhere in the console.
 */
export default function CommandPalette({ open, onClose }) {
  const navigate = useNavigate()
  const { can } = useAuth()
  const { projects, insights, careers, messages, team } = useData()
  const [query, setQuery] = useState('')
  const [cursor, setCursor] = useState(0)
  const inputRef = useRef(null)
  const listRef = useRef(null)

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()

    const nav = ALL_NAV_ITEMS
      .filter((item) => !item.permission || can(item.permission))
      .map((item) => ({
        id: `nav-${item.to}`,
        group: 'Navigate',
        title: item.label,
        subtitle: item.section,
        icon: item.icon,
        to: item.to,
      }))

    const records = [
      ...projects.map((p) => ({
        id: `prj-${p.id}`, group: 'Projects', title: p.title,
        subtitle: `${p.category} · ${p.status}`, to: `/projects/${p.id}`,
      })),
      ...insights.map((i) => ({
        id: `ins-${i.id}`, group: 'Insights', title: i.title,
        subtitle: `${i.category} · ${i.status}`, to: `/insights/${i.id}`,
      })),
      ...careers.map((c) => ({
        id: `job-${c.id}`, group: 'Careers', title: c.title,
        subtitle: `${c.department} · ${c.status}`, to: `/careers/${c.id}`,
      })),
      ...messages.map((m) => ({
        id: `msg-${m.id}`, group: 'Messages', title: m.subject || `Message from ${m.name}`,
        subtitle: m.name, to: `/messages?open=${m.id}`,
      })),
      ...team.map((t) => ({
        id: `tm-${t.id}`, group: 'Team', title: t.name, subtitle: t.role, to: '/team',
      })),
    ]

    const pool = [...nav, ...records]
    if (!q) return nav.slice(0, 8)

    return pool
      .filter((item) =>
        `${item.title} ${item.subtitle ?? ''}`.toLowerCase().includes(q),
      )
      .slice(0, 12)
  }, [query, projects, insights, careers, messages, team, can])

  /* Keep the highlight on the first result as the query narrows, and clear the
     box each time the palette opens — both derived from a change the component
     can see during render, so neither needs an effect. */
  const [prevQuery, setPrevQuery] = useState(query)
  if (prevQuery !== query) {
    setPrevQuery(query)
    setCursor(0)
  }

  const [wasOpen, setWasOpen] = useState(open)
  if (wasOpen !== open) {
    setWasOpen(open)
    if (open) setQuery('')
  }

  useEffect(() => {
    if (!open) return undefined
    const t = setTimeout(() => inputRef.current?.focus(), 40)
    return () => clearTimeout(t)
  }, [open])

  /* Keep the highlighted row inside the scroll viewport. */
  useEffect(() => {
    listRef.current
      ?.querySelector(`[data-index="${cursor}"]`)
      ?.scrollIntoView({ block: 'nearest' })
  }, [cursor])

  const select = (item) => {
    if (!item) return
    navigate(item.to)
    onClose()
  }

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setCursor((c) => (c + 1) % Math.max(1, results.length))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setCursor((c) => (c - 1 + results.length) % Math.max(1, results.length))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      select(results[cursor])
    } else if (e.key === 'Escape') {
      onClose()
    }
  }

  let lastGroup = null

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[70] flex items-start justify-center p-4 pt-[12vh]">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            onClick={onClose}
            className="fixed inset-0 bg-[var(--overlay)] backdrop-blur-sm"
            aria-hidden="true"
          />
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
            className="relative w-full max-w-xl overflow-hidden rounded-xl border border-border bg-surface shadow-2xl"
          >
            <div className="flex items-center gap-3 border-b border-border px-4">
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Search pages, projects, insights, messages…"
                aria-label="Search"
                className="h-12 flex-1 bg-transparent text-sm text-foreground placeholder:text-subtle-foreground focus:outline-none"
              />
              <kbd className="hidden shrink-0 rounded border border-border px-1.5 py-0.5 text-[0.6875rem] text-muted-foreground sm:block">
                Esc
              </kbd>
            </div>

            <div ref={listRef} className="scroll-slim max-h-80 overflow-y-auto py-2">
              {results.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                  No matches for “{query}”
                </p>
              ) : (
                results.map((item, i) => {
                  const showGroup = item.group !== lastGroup
                  lastGroup = item.group
                  return (
                    <div key={item.id}>
                      {showGroup && (
                        <p className="px-4 pb-1 pt-2.5 text-[0.6875rem] font-semibold uppercase tracking-widest text-subtle-foreground">
                          {item.group}
                        </p>
                      )}
                      <button
                        type="button"
                        data-index={i}
                        onMouseEnter={() => setCursor(i)}
                        onClick={() => select(item)}
                        className={`flex w-full items-center gap-3 px-4 py-2 text-left transition-colors ${
                          cursor === i ? 'bg-primary/10' : ''
                        }`}
                      >
                        {item.icon ? (
                          <item.icon className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                        ) : (
                          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-border-strong" aria-hidden="true" />
                        )}
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm text-foreground">{item.title}</span>
                          {item.subtitle && (
                            <span className="block truncate text-xs text-muted-foreground">
                              {item.subtitle}
                            </span>
                          )}
                        </span>
                        {cursor === i && (
                          <CornerDownLeft className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
                        )}
                      </button>
                    </div>
                  )
                })
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
