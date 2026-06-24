import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { X } from 'lucide-react'

const STORAGE_KEY = 'draftbit-cookie-consent'

const CookieConsent = () => {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      const timer = setTimeout(() => setVisible(true), 2000)
      return () => clearTimeout(timer)
    }
  }, [])

  const accept = () => {
    localStorage.setItem(STORAGE_KEY, 'accepted')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[90] w-[calc(100%-2rem)] max-w-lg animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-5 rounded-2xl border border-white/10 bg-background/95 backdrop-blur-xl shadow-2xl">
        <p className="text-sm text-muted-foreground flex-1">
          We use cookies to improve your experience. By continuing, you agree to our{' '}
          <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
        </p>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={accept}
            className="px-5 py-2 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            Accept
          </button>
          <button type="button" onClick={() => setVisible(false)} className="p-2 text-muted-foreground hover:text-foreground" aria-label="Dismiss">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default CookieConsent
