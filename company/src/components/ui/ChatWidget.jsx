import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { MessageCircle, X, Mail, Phone } from 'lucide-react'
import { useSiteData } from '../../context/SiteDataContext'

const ChatWidget = () => {
  const { siteConfig } = useSiteData()

  const [open, setOpen] = useState(false)

  return (
    <div className="fixed bottom-6 right-6 z-[80] flex flex-col items-end gap-3">
      {open && (
        <div className="w-72 p-5 rounded-2xl border border-white/10 bg-background/95 backdrop-blur-xl shadow-2xl animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <p className="font-display font-bold text-foreground">Let&apos;s talk</p>
            <button type="button" onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground" aria-label="Close">
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Have a question? We typically respond within 24 hours.
          </p>
          <div className="space-y-2">
            <Link
              to="/contact"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 w-full p-3 rounded-xl border border-white/10 hover:border-primary/30 hover:bg-white/5 transition-colors text-sm"
            >
              <MessageCircle className="w-4 h-4 text-primary" />
              Send a message
            </Link>
            <a
              href={`mailto:${siteConfig.email}`}
              className="flex items-center gap-3 w-full p-3 rounded-xl border border-white/10 hover:border-primary/30 hover:bg-white/5 transition-colors text-sm"
            >
              <Mail className="w-4 h-4 text-primary" />
              {siteConfig.email}
            </a>
            <a
              href={siteConfig.phoneHref}
              className="flex items-center gap-3 w-full p-3 rounded-xl border border-white/10 hover:border-primary/30 hover:bg-white/5 transition-colors text-sm"
            >
              <Phone className="w-4 h-4 text-primary" />
              {siteConfig.phone}
            </a>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 hover:glow transition-all flex items-center justify-center"
        aria-label="Open chat"
        aria-expanded={open}
      >
        {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>
    </div>
  )
}

export default ChatWidget
