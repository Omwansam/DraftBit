import { Link, useLocation } from 'react-router-dom'
import { ChevronRight, Menu, Search } from 'lucide-react'
import ThemeToggle from '../ui/ThemeToggle'
import { labelForPath } from './navigation'
import { useAuth } from '../../context/AuthContext'

export default function Topbar({ onMenuClick, onSearchClick }) {
  const { pathname } = useLocation()
  const { demoMode } = useAuth()
  const crumb = labelForPath(pathname)

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b border-border bg-background/85 px-4 backdrop-blur sm:px-6">
      <button
        type="button"
        onClick={onMenuClick}
        className="rounded-lg p-2 text-muted-foreground hover:bg-foreground/8 hover:text-foreground lg:hidden"
        aria-label="Open navigation"
      >
        <Menu className="h-5 w-5" />
      </button>

      <nav aria-label="Breadcrumb" className="hidden min-w-0 items-center gap-1.5 text-[0.8125rem] sm:flex">
        <Link to="/" className="text-muted-foreground transition-colors hover:text-foreground">
          Console
        </Link>
        {crumb && (
          <>
            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-subtle-foreground" aria-hidden="true" />
            <span className="truncate font-medium text-foreground">{crumb}</span>
          </>
        )}
      </nav>

      <div className="flex flex-1 items-center justify-end gap-2">
        {demoMode && (
          <span
            className="hidden items-center gap-1.5 rounded-full border border-warning/35 bg-warning/12 px-2.5 py-1 text-[0.6875rem] font-medium text-warning md:inline-flex"
            title="No VITE_API_URL is set — data is seeded locally and saved to this browser."
          >
            Demo data
          </span>
        )}

        <button
          type="button"
          onClick={onSearchClick}
          className="inline-flex h-9 items-center gap-2 rounded-lg border border-border px-3 text-[0.8125rem] text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground"
        >
          <Search className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="hidden sm:inline">Search…</span>
          <kbd className="ml-1 hidden rounded border border-border px-1.5 py-0.5 text-[0.6875rem] sm:inline">
            ⌘K
          </kbd>
        </button>

        <ThemeToggle />
      </div>
    </header>
  )
}
