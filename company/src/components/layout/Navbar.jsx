import React, { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import Logo from '../ui/Logo'
import ThemeToggle from '../ui/ThemeToggle'
import CommandPalette from '../ui/CommandPalette'

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/services', label: 'Services' },
  { to: '/projects', label: 'Projects' },
  { to: '/insights', label: 'Insights' },
  { to: '/careers', label: 'Careers' },
]

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setIsMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isMenuOpen])

  const isActive = (link) => {
    if (link.to === '/projects') return location.pathname.startsWith('/projects')
    if (link.to === '/about') return location.pathname === '/about'
    if (link.to === '/services') return location.pathname === '/services'
    if (link.to === '/insights') return location.pathname.startsWith('/insights')
    if (link.to === '/careers') return location.pathname === '/careers'
    return location.pathname === link.to
  }

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-background/90 backdrop-blur-xl border-b border-white/5'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex items-center justify-between h-16 md:h-20">
            <Logo className="h-8" />

            <div className="hidden lg:flex items-center gap-4 xl:gap-6">
              {navLinks.slice(1, 6).map((link) => (
                <Link
                  key={link.label}
                  to={link.to}
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    isActive(link) ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              <CommandPalette />
              <ThemeToggle />

              <Link
                to="/contact"
                className="text-sm font-semibold uppercase tracking-wider text-primary-foreground bg-primary px-6 py-2.5 rounded-full hover:bg-primary/90 transition-colors"
              >
                Get In Touch
              </Link>
            </div>

            <div className="flex lg:hidden items-center gap-2">
              <CommandPalette />
              <ThemeToggle />
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex flex-col gap-1.5 p-2"
                aria-label="Toggle menu"
                aria-expanded={isMenuOpen}
              >
                <span className={`block w-6 h-0.5 bg-foreground transition-all ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
                <span className={`block w-6 h-0.5 bg-foreground transition-all ${isMenuOpen ? 'opacity-0' : ''}`} />
                <span className={`block w-6 h-0.5 bg-foreground transition-all ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Full-screen menu — agency style */}
      <div
        className={`fixed inset-0 z-40 bg-background transition-all duration-500 ${
          isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
        }`}
      >
        <div className="flex flex-col justify-center h-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pt-20">
          <nav className="space-y-2">
            {navLinks.map((link, i) => (
              <motion.div
                key={link.label}
                initial={false}
                animate={isMenuOpen ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                transition={{ delay: isMenuOpen ? i * 0.06 : 0, duration: 0.4 }}
              >
                <Link
                  to={link.to}
                  onClick={() => setIsMenuOpen(false)}
                  className="block text-4xl sm:text-5xl md:text-6xl font-display font-bold text-foreground hover:text-primary transition-colors py-2"
                >
                  {link.label}
                </Link>
              </motion.div>
            ))}
          </nav>

          <div className="mt-12 pt-8 border-t border-white/10 flex items-center justify-between">
            <Link
              to="/contact"
              onClick={() => setIsMenuOpen(false)}
              className="inline-flex text-lg font-semibold uppercase tracking-wider text-primary"
            >
              Get In Touch →
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </>
  )
}

export default Navbar
