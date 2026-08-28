/**
 * Thin client for the Flask API in ../BACKEND.
 *
 * The console is designed to run with or without that backend. When
 * VITE_API_URL is empty the app switches to demo mode: DataContext seeds itself
 * from the public site's content and persists to localStorage, so every screen
 * stays fully usable. Point VITE_API_URL at the Flask server and the same
 * screens read and write through these calls instead.
 */

const BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')
const TOKEN_KEY = 'draftbit-admin-token'

/** True when a backend URL is configured. */
export const apiEnabled = Boolean(BASE)

export const getToken = () => localStorage.getItem(TOKEN_KEY)
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token)
export const clearToken = () => localStorage.removeItem(TOKEN_KEY)

export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function request(path, { method = 'GET', body, signal } = {}) {
  if (!BASE) throw new ApiError('No API configured', 0)

  const token = getToken()
  const res = await fetch(`${BASE}${path}`, {
    method,
    signal,
    headers: {
      Accept: 'application/json',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })

  if (res.status === 401) {
    clearToken()
    throw new ApiError('Session expired. Please sign in again.', 401)
  }

  const isJson = res.headers.get('content-type')?.includes('application/json')
  const payload = isJson ? await res.json().catch(() => null) : null

  if (!res.ok) {
    throw new ApiError(payload?.message || payload?.error || res.statusText, res.status)
  }
  return payload
}

export const api = {
  get: (path, opts) => request(path, opts),
  post: (path, body, opts) => request(path, { ...opts, method: 'POST', body }),
  put: (path, body, opts) => request(path, { ...opts, method: 'PUT', body }),
  patch: (path, body, opts) => request(path, { ...opts, method: 'PATCH', body }),
  delete: (path, opts) => request(path, { ...opts, method: 'DELETE' }),
}

/** Endpoints the console expects, kept in one place for the backend to mirror. */
export const endpoints = {
  login: '/auth/login',
  me: '/auth/me',
  contacts: '/contacts',
  contact: (id) => `/contacts/${id}`,
  users: '/users',
  user: (id) => `/users/${id}`,
  collection: (name) => `/${name}`,
  resource: (name, id) => `/${name}/${id}`,
}
