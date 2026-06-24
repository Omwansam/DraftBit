import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowUp } from 'lucide-react'
import Logo from '../ui/Logo'
import { siteConfig, socialLinks } from '../../data/site'

const footerLinks = {
  explore: [
    { to: '/about', label: 'About' },
    { to: '/services', label: 'Services' },
    { to: '/projects', label: 'Projects' },
    { to: '/insights', label: 'Insights' },
    { to: '/careers', label: 'Careers' },
  ],
  connect: [
    { to: '/contact', label: 'Contact' },
    { to: '/#faq', label: 'FAQ' },
    { to: '/privacy', label: 'Privacy' },
    { to: '/terms', label: 'Terms' },
  ],
}

const Footer = () => {
  const year = new Date().getFullYear()
  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  return (
    <footer className="border-t border-white/5 bg-background">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          <div className="md:col-span-5">
            <Logo className="h-8" />
            <p className="text-sm text-muted-foreground max-w-sm mt-4 mb-6 leading-relaxed">
              {siteConfig.description}
            </p>
            <a href={`mailto:${siteConfig.email}`} className="text-sm text-primary hover:underline">
              {siteConfig.email}
            </a>
          </div>

          <div className="md:col-span-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground mb-4">Explore</h3>
            <ul className="space-y-2">
              {footerLinks.explore.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="text-sm text-muted-foreground hover:text-primary transition-colors">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground mb-4">Connect</h3>
            <ul className="space-y-2">
              {footerLinks.connect.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="text-sm text-muted-foreground hover:text-primary transition-colors">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground mb-4">Social</h3>
            <ul className="space-y-2">
              {socialLinks.map((link) => (
                <li key={link.label}>
                  <a href={link.href} target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-primary transition-colors">{link.label}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">&copy; {year} {siteConfig.name}. All rights reserved.</p>
          <button type="button" onClick={scrollTop} className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors" aria-label="Back to top">
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>
      </div>
    </footer>
  )
}

export default Footer
