import {
  createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState,
} from 'react'
import seedData from '../data/seed'

const DataContext = createContext(null)
const STORAGE_KEY = 'draftbit-admin-data'
const STORAGE_VERSION = 1

/** Collections that behave as editable lists of records with an `id`. */
export const COLLECTIONS = [
  'projects', 'insights', 'careers', 'team', 'testimonials',
  'services', 'clients', 'users', 'messages',
]

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
    case 'reset':
      return structuredClone(seedData)
    default:
      return state
  }
}

export const DataProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, null, loadInitial)
  const [ready, setReady] = useState(false)

  /* A brief first-paint delay lets skeletons show once, so the layout the user
     sees while loading is the layout they end up with. */
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 350)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ __version: STORAGE_VERSION, data: state }),
      )
    } catch {
      /* Quota exceeded or private mode — the session still works in memory. */
    }
  }, [state])

  const create = useCallback((collection, record) => {
    const full = {
      id: newId(collection),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...record,
    }
    dispatch({ type: 'create', collection, record: full })
    return full
  }, [])

  const update = useCallback((collection, id, patch) => {
    dispatch({ type: 'update', collection, id, patch })
  }, [])

  const updateMany = useCallback((collection, ids, patch) => {
    dispatch({ type: 'updateMany', collection, ids, patch })
  }, [])

  const remove = useCallback((collection, ids) => {
    dispatch({ type: 'remove', collection, ids: Array.isArray(ids) ? ids : [ids] })
  }, [])

  const reorder = useCallback((collection, ids) => {
    dispatch({ type: 'reorder', collection, ids })
  }, [])

  const saveSettings = useCallback((patch) => {
    dispatch({ type: 'settings', patch })
  }, [])

  const reset = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    dispatch({ type: 'reset' })
  }, [])

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
    () => ({ ...state, ready, derived, create, update, updateMany, remove, reorder, saveSettings, reset }),
    [state, ready, derived, create, update, updateMany, remove, reorder, saveSettings, reset],
  )

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export const useData = () => {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used within DataProvider')
  return ctx
}
