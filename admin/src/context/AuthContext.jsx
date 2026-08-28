import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import {
  api, apiEnabled, clearToken, endpoints, getToken, setToken, subscribeSessionLost,
} from '../lib/api'
import { users as seedUsers } from '../data/seed'

const AuthContext = createContext(null)
const SESSION_KEY = 'draftbit-admin-session'

/* Demo credentials, used only when no VITE_API_URL is configured. They exist so
   the console is explorable out of the box; with a backend wired up this branch
   is never reached and the API is the only way in. */
const DEMO_PASSWORD = 'draftbit'

/** Capability matrix. This mirrors backend/utils/permissions.util.js, which is
    the copy that actually decides — this one only hides what a role cannot do. */
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
        try {
          /* With no access token there may still be a live refresh cookie —
             the usual case after a browser restart — so try to refresh before
             concluding the visitor is signed out. */
          if (!getToken()) {
            const refreshed = await api.post(endpoints.refresh)
            setToken(refreshed.token)
            if (cancelled) return
            setUser(refreshed.user)
            setStatus('authenticated')
            return
          }

          const { user: me } = await api.get(endpoints.me)
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

  /* A refresh that fails anywhere in the app ends the session here, once,
     rather than each screen discovering it separately. */
  useEffect(() => subscribeSessionLost(() => {
    setUser(null)
    setStatus('anonymous')
  }), [])

  const login = useCallback(async ({ email, password, remember = true }) => {
    setError(null)

    if (apiEnabled) {
      try {
        const res = await api.post(endpoints.login, { email, password })
        setToken(res.token)
        setUser(res.user)
        setStatus('authenticated')
        return res.user
      } catch (err) {
        setError(err.message)
        throw err
      }
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

  const logout = useCallback(async () => {
    // Revokes the refresh token server-side; a failure here must still sign the
    // user out locally, or a network blip would trap them in the console.
    if (apiEnabled) await api.post(endpoints.logout).catch(() => {})

    clearToken()
    localStorage.removeItem(SESSION_KEY)
    setUser(null)
    setStatus('anonymous')
  }, [])

  const changePassword = useCallback(async ({ currentPassword, newPassword }) => {
    const res = await api.post(endpoints.changePassword, { currentPassword, newPassword })
    // Changing a password revokes every session including this one, so the API
    // hands back a fresh pair to keep the current tab signed in.
    setToken(res.token)
    setUser(res.user)
    return res.user
  }, [])

  /** Reflects a profile edit made elsewhere without a round trip to /auth/me. */
  const patchUser = useCallback((patch) => {
    setUser((current) => (current ? { ...current, ...patch } : current))
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
      changePassword,
      patchUser,
      can,
    }),
    [user, status, error, login, logout, changePassword, patchUser, can],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
