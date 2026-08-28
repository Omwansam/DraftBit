/**
 * Client for the DraftBit API in ../backend.
 *
 * The console runs with or without that backend. When VITE_API_URL is empty the
 * app stays in demo mode: DataContext seeds itself from the public site's
 * content and persists to localStorage, so every screen is fully usable. Point
 * VITE_API_URL at the API and the same screens read and write through here.
 *
 * The version prefix is added once, in BASE, so callers name plain paths like
 * '/projects' and never repeat '/api/v1'.
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
const BASE = `${ROOT}/api/v1`

const TOKEN_KEY = 'draftbit-admin-token'

/** True when a backend is configured. An empty value means demo mode. */
export const apiEnabled = RAW !== ''

/* Access tokens are short-lived and kept in localStorage so a reload does not
   sign you out. The refresh token is an httpOnly cookie the JS never sees. */
export const getToken = () => localStorage.getItem(TOKEN_KEY)
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token)
export const clearToken = () => localStorage.removeItem(TOKEN_KEY)

export class ApiError extends Error {
  constructor(message, status, details) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
  }
}

/** Fired when refreshing fails, so AuthContext can drop the session exactly once. */
const onSessionLost = new Set()
export const subscribeSessionLost = (fn) => {
  onSessionLost.add(fn)
  return () => onSessionLost.delete(fn)
}

/**
 * A single in-flight refresh shared by every 401.
 *
 * Without this, a dashboard that fires eight parallel requests on load would
 * kick off eight refreshes; the first rotates the token and the other seven
 * replay a spent one, which the API treats as theft and revokes the family.
 */
let refreshing = null

async function refreshSession() {
  refreshing ??= fetch(`${BASE}/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
    headers: { Accept: 'application/json' },
  })
    .then(async (res) => {
      if (!res.ok) throw new ApiError('Session expired', 401)
      const payload = await res.json()
      setToken(payload.token)
      return payload
    })
    .finally(() => {
      refreshing = null
    })

  return refreshing
}

async function send(path, { method = 'GET', body, signal } = {}) {
  const token = getToken()
  return fetch(`${BASE}${path}`, {
    method,
    signal,
    // Carries the refresh cookie. The API's CORS allow-list is exact, which is
    // what keeps this from being a CSRF vector.
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  })
}

async function request(path, opts = {}) {
  if (!BASE) throw new ApiError('No API configured', 0)

  let res = await send(path, opts)

  /* One transparent retry: the access token is short-lived, so an expiry in the
     middle of a session should be invisible rather than a surprise sign-out. */
  if (res.status === 401 && path !== '/auth/refresh' && path !== '/auth/login') {
    try {
      await refreshSession()
      res = await send(path, opts)
    } catch {
      clearToken()
      onSessionLost.forEach((fn) => fn())
      throw new ApiError('Your session expired. Please sign in again.', 401)
    }
  }

  if (res.status === 204) return null

  const isJson = res.headers.get('content-type')?.includes('application/json')
  const payload = isJson ? await res.json().catch(() => null) : null

  if (!res.ok) {
    throw new ApiError(
      payload?.error || payload?.message || res.statusText,
      res.status,
      payload?.details,
    )
  }
  return payload
}

export const api = {
  get: (path, opts) => request(path, opts),
  post: (path, body, opts) => request(path, { ...opts, method: 'POST', body }),
  put: (path, body, opts) => request(path, { ...opts, method: 'PUT', body }),
  patch: (path, body, opts) => request(path, { ...opts, method: 'PATCH', body }),
  delete: (path, body, opts) => request(path, { ...opts, method: 'DELETE', body }),
}

/**
 * Every endpoint the console uses, in one place. Paths are relative to
 * /api/v1 — BASE supplies the prefix.
 */
export const endpoints = {
  login: '/auth/login',
  logout: '/auth/logout',
  refresh: '/auth/refresh',
  me: '/auth/me',
  changePassword: '/auth/change-password',
  checkInvite: (token) => `/auth/invite?token=${encodeURIComponent(token)}`,
  acceptInvite: '/auth/invite/accept',

  users: '/users',
  user: (id) => `/users/${id}`,
  resendInvite: (id) => `/users/${id}/resend-invite`,
  profile: '/users/me',

  messages: '/messages',
  message: (id) => `/messages/${id}`,
  unreadCount: '/messages/unread-count',

  settings: '/settings',
  activity: '/activity',

  analytics: '/analytics',
  analyticsSummary: '/analytics/summary',
  traffic: '/analytics/traffic',
  trafficSources: '/analytics/sources',
  topPages: '/analytics/pages',

  collection: (name) => `/${name}`,
  resource: (name, id) => `/${name}/${id}`,
  reorder: (name) => `/${name}/reorder`,
}

/** Collections served by the generic CRUD router, in the console's order. */
export const API_COLLECTIONS = [
  'projects', 'insights', 'careers', 'team', 'testimonials', 'services', 'clients',
]
