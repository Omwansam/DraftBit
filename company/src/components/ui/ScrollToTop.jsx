import React, { useEffect, useState } from 'react'
import { ArrowUp } from 'lucide-react'

const ScrollToTop = () => {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (!visible) return null

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-6 left-6 z-50 w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 hover:glow transition-all flex items-center justify-center"
      aria-label="Scroll to top"
    >
      <ArrowUp className="w-5 h-5" />
    </button>
  )
}

export default ScrollToTop
