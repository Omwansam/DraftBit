import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const ScrollToHash = () => {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (!hash) return
    const id = hash.replace('#', '')
    const timer = setTimeout(() => {
      const el = document.getElementById(id)
      if (el) el.scrollIntoView({ behavior: 'smooth' })
    }, 100)
    return () => clearTimeout(timer)
  }, [pathname, hash])

  return null
}

export default ScrollToHash
