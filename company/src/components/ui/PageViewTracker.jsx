import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { apiEnabled, trackPageView } from '../../lib/api'

const VISITOR_KEY = 'draftbit-visitor'

/**
 * A stable, anonymous id for this browser.
 *
 * Random and stored locally — it identifies a browser across a visit so two
 * page loads are not counted as two visitors. It is never derived from
 * anything about the person, and the API only ever uses it to deduplicate a
 * day's first hit.
 */
function visitorId() {
  try {
    let id = localStorage.getItem(VISITOR_KEY)
    if (!id) {
      id = `v-${crypto.randomUUID?.() ?? Math.random().toString(36).slice(2)}${Date.now().toString(36)}`
      localStorage.setItem(VISITOR_KEY, id)
    }
    return id
  } catch {
    // Private mode or blocked storage: still countable as a page view, just
    // never as a returning visitor.
    return `v-anon-${Date.now().toString(36)}`
  }
}

/**
 * Reports a page view on each navigation, and how long the previous page was
 * read for.
 *
 * The beacon is sent on leaving a page rather than on arriving, because the
 * dwell time is only known once the visitor has moved on. A single-page visit
 * therefore reports on unload.
 */
const PageViewTracker = () => {
  const location = useLocation()
  const previous = useRef(null)

  useEffect(() => {
    if (!apiEnabled) return

    const now = Date.now()
    const last = previous.current

    if (last) {
      trackPageView({
        path: last.path,
        title: last.title,
        visitorId: visitorId(),
        referrer: last.referrer,
        seconds: Math.min(3600, Math.round((now - last.at) / 1000)),
        // One page and gone is a bounce; the second view retires the flag.
        bounced: false,
      })
    }

    previous.current = {
      path: location.pathname,
      title: document.title,
      referrer: last ? '' : document.referrer,
      at: now,
    }
  }, [location.pathname])

  /* The last page of a visit would otherwise never be reported, since there is
     no next navigation to trigger it. */
  useEffect(() => {
    if (!apiEnabled) return

    const flush = () => {
      const last = previous.current
      if (!last) return
      trackPageView({
        path: last.path,
        title: last.title || document.title,
        visitorId: visitorId(),
        referrer: last.referrer,
        seconds: Math.min(3600, Math.round((Date.now() - last.at) / 1000)),
        bounced: true,
      })
      previous.current = null
    }

    // visibilitychange fires reliably on mobile, where unload often does not.
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') flush()
    })
    window.addEventListener('pagehide', flush)

    return () => {
      window.removeEventListener('pagehide', flush)
    }
  }, [])

  return null
}

export default PageViewTracker
