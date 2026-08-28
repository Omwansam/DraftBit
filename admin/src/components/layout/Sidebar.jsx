import { NavLink } from 'react-router-dom'
import { ExternalLink, LogOut, X } from 'lucide-react'
import { NAV_SECTIONS } from './navigation'
import { useAuth } from '../../context/AuthContext'
import { useData } from '../../context/DataContext'
import { initials } from '../../lib/format'

const SITE_URL = import.meta.env.VITE_SITE_URL || 'http://localhost:5173'

function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary font-display text-base font-extrabold text-primary-foreground">
        D
      </span>
      <span className="min-w-0">
        <span className="block font-display text-[0.9375rem] font-bold leading-none text-foreground">
          DraftBit
        </span>
        <span className="mt-0.5 block text-[0.6875rem] uppercase tracking-widest text-muted-foreground">
          Admin
        </span>
      </span>
    </div>
  )
}

export default function Sidebar({ open, onClose }) {
  const { user, logout, can } = useAuth()
  const { derived } = useData()

  return (
    <>
      {/* Scrim, mobile only. */}
      {open && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Close navigation"
          className="fixed inset-0 z-40 bg-[var(--overlay)] backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[17rem] flex-col border-r border-border bg-surface transition-transform duration-200 lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Main navigation"
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-border px-5">
          <Logo />
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-foreground/8 hover:text-foreground lg:hidden"
            aria-label="Close navigation"
          >
            <X className="h-4.5 w-4.5" style={{ height: 18, width: 18 }} />
          </button>
        </div>

        <nav className="scroll-slim flex-1 overflow-y-auto px-3 py-4">
          {NAV_SECTIONS.map((section) => {
            const items = section.items.filter(
              (item) => !item.permission || can(item.permission),
            )
            if (!items.length) return null

            return (
              <div key={section.label} className="mb-5 last:mb-0">
                <p className="mb-1.5 px-2.5 text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-subtle-foreground">
                  {section.label}
                </p>
                <ul className="flex flex-col gap-0.5">
                  {items.map((item) => {
                    const count = item.badge ? derived[item.badge] : 0
                    return (
                      <li key={item.to}>
                        <NavLink
                          to={item.to}
                          end={item.end}
                          onClick={onClose}
                          className={({ isActive }) =>
                            `group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[0.8125rem] font-medium transition-colors ${
                              isActive
                                ? 'bg-primary/10 text-primary'
                                : 'text-muted-foreground hover:bg-foreground/5 hover:text-foreground'
                            }`
                          }
                        >
                          {({ isActive }) => (
                            <>
                              <item.icon
                                className={`h-4 w-4 shrink-0 ${isActive ? 'text-primary' : ''}`}
                                aria-hidden="true"
                              />
                              <span className="flex-1 truncate">{item.label}</span>
                              {count > 0 && (
                                <span className="tnum rounded-full bg-primary px-1.5 py-0.5 text-[0.6875rem] font-semibold leading-none text-primary-foreground">
                                  {count}
                                </span>
                              )}
                            </>
                          )}
                        </NavLink>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )
          })}
        </nav>

        <div className="shrink-0 border-t border-border p-3">
          <a
            href={SITE_URL}
            target="_blank"
            rel="noreferrer"
            className="mb-2 flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[0.8125rem] font-medium text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
          >
            <ExternalLink className="h-4 w-4 shrink-0" aria-hidden="true" />
            View live site
          </a>

          <div className="flex items-center gap-2.5 rounded-lg border border-border bg-surface-2 p-2.5">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-secondary/15 text-[0.6875rem] font-bold text-secondary">
              {initials(user?.name ?? user?.username ?? '')}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[0.8125rem] font-medium text-foreground">
                {user?.name ?? user?.username}
              </span>
              <span className="block truncate text-[0.6875rem] text-muted-foreground">
                {user?.role}
              </span>
            </span>
            <button
              type="button"
              onClick={logout}
              title="Sign out"
              aria-label="Sign out"
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-foreground/8 hover:text-critical"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
