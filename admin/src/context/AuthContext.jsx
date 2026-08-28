import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { api, apiEnabled, clearToken, endpoints, getToken, setToken } from '../lib/api'
import { users as seedUsers } from '../data/seed'

const AuthContext = createContext(null)
const SESSION_KEY = 'draftbit-admin-session'

/* Demo credentials, used only when no VITE_API_URL is configured. They exist so
   the console is explorable out of the box; with a backend wired up this branch
   is never reached and the Flask JWT is the only way in. */
const DEMO_PASSWORD = 'draftbit'

/** Capability matrix. The UI hides what a role cannot do; a real backend must
    enforce the same rules server-side — this is presentation, not security. */
const PERMISSIONS = {
  Owner: ['read', 'write', 'publish', 'delete', 'manage_users', 'manage_settings'],
  Admin: ['read', 'write', 'publish', 'delete', 'manage_users', 'manage_settings'],
  Editor: ['read', 'write', 'publish'],
  Viewer: ['read'],
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [status, setStatus] = useState('loading') // loading | authenticated | anonymous
  const [error, setError] = useState(null)

  /* Restore an existing session on mount. */
  useEffect(() => {
    let cancelled = false

    async function restore() {
      if (apiEnabled) {
        if (!getToken()) {
          setStatus('anonymous')
          return
        }
        try {
          const me = await api.get(endpoints.me)
          if (cancelled) return
          setUser(me)
          setStatus('authenticated')
        } catch {
          if (cancelled) return
          clearToken()
          setStatus('anonymous')
        }
        return
      }

      const stored = localStorage.getItem(SESSION_KEY)
      if (stored) {
        try {
          setUser(JSON.parse(stored))
          setStatus('authenticated')
          return
        } catch {
          localStorage.removeItem(SESSION_KEY)
        }
      }
      setStatus('anonymous')
    }

    restore()
    return () => { cancelled = true }
  }, [])

  const login = useCallback(async ({ email, password, remember = true }) => {
    setError(null)

    if (apiEnabled) {
      const res = await api.post(endpoints.login, { email, password })
      if (!res?.access_token) throw new Error('Malformed login response')
      setToken(res.access_token)
      const me = res.user ?? (await api.get(endpoints.me))
      setUser(me)
      setStatus('authenticated')
      return me
    }

    // Demo mode.
    await new Promise((r) => setTimeout(r, 600))
    const match = seedUsers.find(
      (u) => u.email.toLowerCase() === String(email).trim().toLowerCase(),
    )
    if (!match || password !== DEMO_PASSWORD) {
      const err = new Error('Incorrect email or password.')
      setError(err.message)
      throw err
    }
    if (match.status === 'invited') {
      const err = new Error('That invitation has not been accepted yet.')
      setError(err.message)
      throw err
    }

    const session = { ...match, lastActive: new Date().toISOString() }
    setUser(session)
    setStatus('authenticated')
    if (remember) localStorage.setItem(SESSION_KEY, JSON.stringify(session))
    return session
  }, [])

  const logout = useCallback(() => {
    clearToken()
    localStorage.removeItem(SESSION_KEY)
    setUser(null)
    setStatus('anonymous')
  }, [])

  const can = useCallback(
    (permission) => {
      if (!user) return false
      return (PERMISSIONS[user.role] ?? PERMISSIONS.Viewer).includes(permission)
    },
    [user],
  )

  const value = useMemo(
    () => ({
      user,
      status,
      error,
      isAuthenticated: status === 'authenticated',
      demoMode: !apiEnabled,
      demoPassword: DEMO_PASSWORD,
      login,
      logout,
      can,
    }),
    [user, status, error, login, logout, can],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
