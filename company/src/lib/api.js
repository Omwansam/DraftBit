/**
 * Client for the public surface of the DraftBit API in ../backend.
 *
 * Everything here is unauthenticated: the marketing site reads published
 * content and writes exactly two things, an enquiry and a page view.
 *
 * When VITE_API_URL is empty the site runs entirely from src/data/site.js, so
 * it stays fully renderable with no backend at all.
 */

/*
 * VITE_API_URL is accepted in either form:
 *   http://localhost:5000          a bare origin, as in local development
 *   /api/v1                        same-origin behind nginx, as in Docker
 * The version prefix is appended here, so a value that already names it is
 * trimmed rather than doubled into /api/v1/api/v1.
 */
const RAW = (import.meta.env.VITE_API_URL ?? '').trim()
const ROOT = RAW.replace(/\/+$/, '').replace(/\/api\/v1$/, '')
const BASE = `${ROOT}/api/v1/public`

/** With no value the site runs entirely from src/data/site.js. */
export const apiEnabled = RAW !== ''

/** Requests are abandoned rather than left to hang a first paint indefinitely. */
const TIMEOUT_MS = 8000

async function request(path, { method = 'GET', body } = {}) {
  if (!BASE) throw new Error('No API configured')

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const res = await fetch(`${BASE}${path}`, {
      method,
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    })

    const isJson = res.headers.get('content-type')?.includes('application/json')
    const payload = isJson ? await res.json().catch(() => null) : null

    if (!res.ok) throw new Error(payload?.error || res.statusText)
    return payload
  } finally {
    clearTimeout(timer)
  }
}

/** The whole site in one round trip — settings plus every published collection. */
export const fetchSite = () => request('/site')

export const fetchCollection = (name) => request(`/${name}`)

export const submitEnquiry = (data) => request('/contact', { method: 'POST', body: data })

/**
 * Page-view beacon. Deliberately never rejects: analytics failing is not worth
 * a console error on a visitor's browser, let alone a broken page.
 */
export const trackPageView = (data) =>
  request('/track', { method: 'POST', body: data }).catch(() => null)
