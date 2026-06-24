import React, { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, ArrowRight, FileText, Briefcase, Users, Mail, Home, BookOpen } from 'lucide-react'
import { allProjects, blogPosts, careers } from '../../data/site'

const staticPages = [
  { label: 'Home', to: '/', icon: Home, group: 'Pages' },
  { label: 'About', to: '/about', icon: Users, group: 'Pages' },
  { label: 'Services', to: '/services', icon: Briefcase, group: 'Pages' },
  { label: 'Projects', to: '/projects', icon: Briefcase, group: 'Pages' },
  { label: 'Insights', to: '/insights', icon: BookOpen, group: 'Pages' },
  { label: 'Careers', to: '/careers', icon: Users, group: 'Pages' },
  { label: 'Contact', to: '/contact', icon: Mail, group: 'Pages' },
]

const CommandPalette = () => {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  const allItems = useMemo(() => [
    ...staticPages,
    ...allProjects.map((p) => ({ label: p.title, to: `/projects/${p.slug}`, icon: Briefcase, group: 'Projects', hint: p.category })),
    ...blogPosts.map((p) => ({ label: p.title, to: `/insights/${p.slug}`, icon: FileText, group: 'Insights', hint: p.category })),
    ...careers.map((c) => ({ label: c.title, to: `/contact?role=${c.slug}`, icon: Users, group: 'Careers', hint: c.department })),
  ], [])

  const filtered = query
    ? allItems.filter((item) =>
        item.label.toLowerCase().includes(query.toLowerCase()) ||
        item.group?.toLowerCase().includes(query.toLowerCase())
      )
    : allItems.slice(0, 8)

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen((o) => !o)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const go = (to) => {
    navigate(to)
    setOpen(false)
    setQuery('')
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 text-muted-foreground hover:text-foreground hover:border-white/20 transition-colors md:text-xs"
        aria-label="Search"
      >
        <Search className="w-4 h-4 md:w-3.5 md:h-3.5" />
        <span className="hidden md:inline">Search</span>
        <kbd className="hidden md:inline ml-2 px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[10px]">⌘K</kbd>
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -20 }}
              transition={{ duration: 0.2 }}
              className="fixed top-[20%] left-1/2 -translate-x-1/2 z-[201] w-[calc(100%-2rem)] max-w-xl rounded-2xl border border-white/10 bg-background shadow-2xl overflow-hidden"
            >
              <div className="flex items-center gap-3 px-4 border-b border-white/10">
                <Search className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search pages, projects, articles..."
                  className="flex-1 py-4 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
                <kbd className="text-[10px] px-1.5 py-0.5 rounded border border-white/10 text-muted-foreground">ESC</kbd>
              </div>
              <ul className="max-h-80 overflow-y-auto py-2">
                {filtered.length === 0 ? (
                  <li className="px-4 py-8 text-center text-sm text-muted-foreground">No results found</li>
                ) : (
                  filtered.map((item) => {
                    const Icon = item.icon
                    return (
                      <li key={item.to + item.label}>
                        <button
                          type="button"
                          onClick={() => go(item.to)}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left group"
                        >
                          <Icon className="w-4 h-4 text-muted-foreground group-hover:text-primary flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{item.label}</p>
                            {item.hint && <p className="text-xs text-muted-foreground">{item.hint}</p>}
                          </div>
                          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{item.group}</span>
                          <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      </li>
                    )
                  })
                )}
              </ul>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

export default CommandPalette
