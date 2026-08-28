import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import CommandPalette from '../ui/CommandPalette'

export default function AdminLayout() {
  const [navOpen, setNavOpen] = useState(false)
  const [paletteOpen, setPaletteOpen] = useState(false)
  const { pathname } = useLocation()
  const [navPath, setNavPath] = useState(pathname)

  /* A route change should never leave the mobile drawer hanging open — this
     covers back/forward too, which a link's own onClick does not. */
  if (navPath !== pathname) {
    setNavPath(pathname)
    setNavOpen(false)
  }

  /* Global ⌘K / Ctrl+K. Registered once here rather than per page. */
  useEffect(() => {
    const onKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setPaletteOpen((v) => !v)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[80] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground"
      >
        Skip to content
      </a>

      <Sidebar open={navOpen} onClose={() => setNavOpen(false)} />

      <div className="lg:pl-[17rem]">
        <Topbar
          onMenuClick={() => setNavOpen(true)}
          onSearchClick={() => setPaletteOpen(true)}
        />
        <main id="main" className="px-4 py-6 sm:px-6 sm:py-8">
          <div className="mx-auto max-w-[84rem]">
            <Outlet />
          </div>
        </main>
      </div>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </div>
  )
}
