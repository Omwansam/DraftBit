import {
  createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState,
} from 'react'
import seedData from '../data/seed'
import { api, apiEnabled, endpoints, API_COLLECTIONS } from '../lib/api'
import { useAuth } from './AuthContext'

const DataContext = createContext(null)
const STORAGE_KEY = 'draftbit-admin-data'
const STORAGE_VERSION = 1

/** Collections that behave as editable lists of records with an `id`. */
export const COLLECTIONS = [
  'projects', 'insights', 'careers', 'team', 'testimonials',
  'services', 'clients', 'users', 'messages',
]

/** Where each collection lives on the API. Most are the generic CRUD router. */
const PATH = Object.fromEntries(COLLECTIONS.map((name) => [name, `/${name}`]))

/* Explicit per-collection prefixes so generated ids read the same as the seeded
   ones. Slicing the collection name instead would mint `pro-`/`car-`/`tea-`
   against the seed's `prj-`/`job-`/`tm-`, which makes ids in logs and URLs
   look like they come from two different systems. */
const ID_PREFIX = {
  projects: 'prj',
  insights: 'ins',
  careers: 'job',
  team: 'tm',
  testimonials: 'tst',
  services: 'svc',
  clients: 'cl',
  users: 'usr',
  messages: 'msg',
}

const newId = (collection) =>
  `${ID_PREFIX[collection] ?? collection.slice(0, 3)}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`

function loadInitial() {
  // With a backend configured the seed is only a shape to render against until
  // the first fetch lands; nothing is read from or written to localStorage.
  if (apiEnabled) return structuredClone(seedData)

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return structuredClone(seedData)
    const parsed = JSON.parse(raw)
    if (parsed.__version !== STORAGE_VERSION) return structuredClone(seedData)
    // Merge so a seed addition (a new collection) shows up for existing users
    // instead of rendering an empty screen.
    return { ...structuredClone(seedData), ...parsed.data }
  } catch {
    return structuredClone(seedData)
  }
}

function reducer(state, action) {
  switch (action.type) {
    case 'create': {
      const { collection, record } = action
      return { ...state, [collection]: [record, ...(state[collection] ?? [])] }
    }
    case 'update': {
      const { collection, id, patch } = action
      return {
        ...state,
        [collection]: (state[collection] ?? []).map((item) =>
          item.id === id ? { ...item, ...patch, updatedAt: new Date().toISOString() } : item,
        ),
      }
    }
    case 'updateMany': {
      const { collection, ids, patch } = action
      const set = new Set(ids)
      return {
        ...state,
        [collection]: (state[collection] ?? []).map((item) =>
          set.has(item.id) ? { ...item, ...patch, updatedAt: new Date().toISOString() } : item,
        ),
      }
    }
    case 'remove': {
      const { collection, ids } = action
      const set = new Set(ids)
      return {
        ...state,
        [collection]: (state[collection] ?? []).filter((item) => !set.has(item.id)),
      }
    }
    case 'reorder': {
      const { collection, ids } = action
      const byId = new Map((state[collection] ?? []).map((item) => [item.id, item]))
      return { ...state, [collection]: ids.map((id) => byId.get(id)).filter(Boolean) }
    }
    case 'settings':
      return { ...state, settings: { ...state.settings, ...action.patch } }

    /* ---- API reconciliation ---- */

    /** Replace a whole collection with what the server returned. */
    case 'replace':
      return { ...state, [action.collection]: action.records }

    /**
     * Swap an optimistic record for the saved one.
     *
     * On create the server mints the real id, but the editor has already
     * navigated to the optimistic one — so the client id is kept on the record
     * as `tempId` and the editors match on either. Without it, saving a new
     * project would bounce you to a page for a record that no longer exists
     * under that id.
     */
    case 'reconcile': {
      const { collection, tempId, record, keepTempId } = action
      return {
        ...state,
        [collection]: (state[collection] ?? []).map((item) =>
          item.id === tempId ? (keepTempId ? { ...record, tempId } : record) : item,
        ),
      }
    }

    /** Merge a first load without discarding collections the API does not serve. */
    case 'hydrate':
      return { ...state, ...action.data }

    case 'reset':
      return structuredClone(seedData)
    default:
      return state
  }
}

export const DataProvider = ({ children }) => {
  /* This provider sits inside AuthProvider, so it can wait for a session.
     Every collection endpoint requires one — fetching on mount would 401 on
     every call before anyone has signed in. */
  const { isAuthenticated } = useAuth()

  const [state, dispatch] = useReducer(reducer, null, loadInitial)
  const [ready, setReady] = useState(false)
  const [syncError, setSyncError] = useState(null)

  /* The live state, readable from a callback without making every mutation
     depend on `state` and rebuild on each keystroke. */
  const stateRef = useRef(state)
  stateRef.current = state

  /* ------------------------------ First load ------------------------------ */

  useEffect(() => {
    if (!apiEnabled) {
      /* A brief first-paint delay lets skeletons show once, so the layout the
         user sees while loading is the layout they end up with. */
      const t = setTimeout(() => setReady(true), 350)
      return () => clearTimeout(t)
    }

    /* Wait for a session, and re-run on each sign-in so a second user does not
       inherit the first one's data. */
    if (!isAuthenticated) return

    let cancelled = false

    async function hydrate() {
      try {
        const [collections, users, messages, settings, analytics, activity] = await Promise.all([
          Promise.all(API_COLLECTIONS.map((name) => api.get(endpoints.collection(name)))),
          api.get(endpoints.users),
          api.get(endpoints.messages),
          api.get(endpoints.settings),
          api.get(endpoints.analytics),
          api.get(endpoints.activity),
        ])
        if (cancelled) return

        const data = { users, messages, settings, activity }
        API_COLLECTIONS.forEach((name, i) => { data[name] = collections[i] })

        dispatch({
          type: 'hydrate',
          data: {
            ...data,
            traffic: analytics.traffic,
            trafficSources: analytics.trafficSources,
            topPages: analytics.topPages,
          },
        })
      } catch (err) {
        if (cancelled) return
        // The screens stay usable on the seed shape rather than going blank,
        // and the banner says the numbers are not live.
        setSyncError(err.message)
      } finally {
        if (!cancelled) setReady(true)
      }
    }

    hydrate()
    return () => { cancelled = true }
  }, [isAuthenticated])

  /* Demo mode persists locally. With an API, the server is the store. */
  useEffect(() => {
    if (apiEnabled) return
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ __version: STORAGE_VERSION, data: state }),
      )
    } catch {
      /* Quota exceeded or private mode — the session still works in memory. */
    }
  }, [state])

  /**
   * Run an API call behind an update that has already been applied locally.
   *
   * Mutations stay synchronous for callers so the pages did not have to become
   * async. On failure the collection is put back exactly as it was and the
   * error surfaces, rather than leaving the screen showing a save that never
   * happened.
   */
  const sync = useCallback((collection, call) => {
    if (!apiEnabled) return
    const before = stateRef.current[collection]

    Promise.resolve()
      .then(call)
      .catch((err) => {
        dispatch({ type: 'replace', collection, records: before })
        setSyncError(err.message)
      })
  }, [])

  const create = useCallback((collection, record) => {
    const tempId = newId(collection)
    const full = {
      id: tempId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...record,
    }
    dispatch({ type: 'create', collection, record: full })

    sync(collection, async () => {
      const saved = await api.post(PATH[collection], record)
      // The server mints the real id and the slug, so the optimistic row is
      // swapped rather than left with a client-side id that no URL would match.
      dispatch({ type: 'reconcile', collection, tempId, record: saved, keepTempId: true })
    })

    return full
  }, [sync])

  const update = useCallback((collection, id, patch) => {
    dispatch({ type: 'update', collection, id, patch })
    sync(collection, async () => {
      const saved = await api.patch(endpoints.resource(collection, id), patch)
      if (saved) dispatch({ type: 'reconcile', collection, tempId: id, record: saved })
    })
  }, [sync])

  const updateMany = useCallback((collection, ids, patch) => {
    dispatch({ type: 'updateMany', collection, ids, patch })
    sync(collection, () => api.patch(PATH[collection], { ids, patch }))
  }, [sync])

  const remove = useCallback((collection, ids) => {
    const list = Array.isArray(ids) ? ids : [ids]
    dispatch({ type: 'remove', collection, ids: list })
    sync(collection, () =>
      list.length === 1
        ? api.delete(endpoints.resource(collection, list[0]))
        : api.delete(PATH[collection], { ids: list }),
    )
  }, [sync])

  const reorder = useCallback((collection, ids) => {
    dispatch({ type: 'reorder', collection, ids })
    sync(collection, () => api.post(endpoints.reorder(collection), { ids }))
  }, [sync])

  const saveSettings = useCallback((patch) => {
    dispatch({ type: 'settings', patch })
    if (!apiEnabled) return

    const before = stateRef.current.settings
    api.patch(endpoints.settings, patch).catch((err) => {
      dispatch({ type: 'settings', patch: before })
      setSyncError(err.message)
    })
  }, [])

  const reset = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    dispatch({ type: 'reset' })
  }, [])

  const dismissSyncError = useCallback(() => setSyncError(null), [])

  /* ---- Derived numbers used by the dashboard and the sidebar badges ---- */
  const derived = useMemo(() => {
    const unread = state.messages.filter((m) => !m.read && m.status !== 'spam').length
    const last30 = state.traffic.slice(-30)
    const prev30 = state.traffic.slice(-60, -30)

    const sum = (rows, key) => rows.reduce((acc, r) => acc + r[key], 0)
    const pct = (curr, prev) => (prev === 0 ? 0 : ((curr - prev) / prev) * 100)

    const visitors = sum(last30, 'visitors')
    const pageViews = sum(last30, 'pageViews')
    const enquiries = sum(last30, 'enquiries')

    return {
      unreadMessages: unread,
      openRoles: state.careers.filter((c) => c.status === 'open').length,
      publishedProjects: state.projects.filter((p) => p.status === 'published').length,
      draftCount:
        state.projects.filter((p) => p.status === 'draft').length +
        state.insights.filter((i) => i.status === 'draft').length,
      pendingTestimonials: state.testimonials.filter((t) => t.status === 'pending').length,
      visitors30: visitors,
      pageViews30: pageViews,
      enquiries30: enquiries,
      visitorsDelta: pct(visitors, sum(prev30, 'visitors')),
      pageViewsDelta: pct(pageViews, sum(prev30, 'pageViews')),
      enquiriesDelta: pct(enquiries, sum(prev30, 'enquiries')),
    }
  }, [state])

  const value = useMemo(
    () => ({
      ...state,
      ready,
      derived,
      liveData: apiEnabled,
      syncError,
      dismissSyncError,
      create, update, updateMany, remove, reorder, saveSettings, reset,
    }),
    [state, ready, derived, syncError, dismissSyncError,
      create, update, updateMany, remove, reorder, saveSettings, reset],
  )

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export const useData = () => {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used within DataProvider')
  return ctx
}
