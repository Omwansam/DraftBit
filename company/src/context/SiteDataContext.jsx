import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { apiEnabled, fetchSite } from '../lib/api'
import { iconFor } from '../lib/icons'
import * as staticSite from '../data/site'

const SiteDataContext = createContext(null)

/**
 * Live content, with the static file as the floor.
 *
 * The site renders from src/data/site.js immediately, then swaps in whatever
 * the API returns. That ordering is the point: a visitor never waits on a
 * network round trip to see the page, and an API that is down, slow or not
 * configured yet degrades to the shipped content instead of an empty layout.
 *
 * Only collections the admin console actually manages are overridden. Marketing
 * copy with no admin screen behind it (tech stack, process, FAQs) has no API
 * equivalent and stays static by design.
 */

/**
 * Initials, used where the site shows an avatar chip and the record has no
 * image. The static content ships these hand-written ("AK"), so live records
 * have to produce the same shape or the chip renders empty.
 */
const initials = (name = '') =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')

/**
 * Drop empty media URLs.
 *
 * The schema defaults these columns to "", and an empty `src` makes the browser
 * re-request the current page. Undefined makes React omit the attribute
 * entirely, which is what the components' fallbacks already expect.
 */
const MEDIA_FIELDS = ['image', 'avatarUrl', 'logoUrl', 'liveUrl']

/**
 * Resolve the stored icon name to the component the templates render.
 *
 * The static file holds a lucide component in this field; the API holds its
 * name. Without this the templates render `<BarChart3 />` as an unknown HTML
 * element, which React warns about and the browser draws as nothing.
 */
const withIcon = (row) => (typeof row.icon === 'string' ? { ...row, icon: iconFor(row.icon) } : row)

const cleanMedia = (row) => {
  const out = { ...row }
  for (const field of MEDIA_FIELDS) {
    if (out[field] === '') out[field] = undefined
  }
  return out
}

/** API collections -> the shapes the components already expect. */
function adapt(payload) {
  if (!payload) return {}

  const projects = (payload.projects ?? []).map(cleanMedia).map(withIcon)
  const insights = (payload.insights ?? []).map(cleanMedia)
  const careers = payload.careers ?? []
  const settings = payload.settings ?? {}

  const merged = {}

  if (payload.projects) {
    merged.allProjects = projects
    /* Nothing flagged featured yet is the normal state of a fresh database, and
       an empty homepage section reads as broken rather than as new. Falling
       back to the most recent work keeps the section meaningful until someone
       makes a deliberate choice in the console. */
    const flagged = projects.filter((p) => p.featured)
    merged.featuredProjects = flagged.length ? flagged : projects.slice(0, 4)
    merged.getProjectBySlug = (slug) => projects.find((p) => p.slug === slug)
  }

  if (payload.insights) {
    // The site calls them blog posts; the API and console call them insights.
    // `date` is what the templates format - the column is `publishedAt`.
    const posts = insights.map((post) => ({ ...post, date: post.publishedAt ?? post.createdAt }))
    merged.blogPosts = posts
    merged.getBlogPostBySlug = (slug) => posts.find((p) => p.slug === slug)
  }

  if (payload.careers) {
    merged.careers = careers
    merged.getCareerBySlug = (slug) => careers.find((c) => c.slug === slug)
  }

  // The team grid renders `avatar` as a chip: a URL when there is one, initials
  // otherwise, matching how the static entries are written.
  if (payload.team) {
    merged.team = payload.team.map((member) => ({
      ...cleanMedia(member),
      avatar: member.avatarUrl || initials(member.name),
    }))
  }

  if (payload.testimonials) {
    merged.testimonials = payload.testimonials.map((item) => ({
      ...item,
      avatar: initials(item.author),
    }))
  }

  // The logo marquee renders each entry directly as text, so this collection is
  // a list of names rather than of records.
  if (payload.clients) merged.clients = payload.clients.map((client) => client.name)

  if (payload.services) merged.services = payload.services.map(withIcon)

  /* Settings are merged field by field rather than wholesale: a blank column on
     a fresh database must not wipe the shipped contact details. */
  if (Object.keys(settings).length) {
    const keep = (value, fallback) =>
      value === undefined || value === null || value === '' ? fallback : value

    merged.siteConfig = {
      ...staticSite.siteConfig,
      name: keep(settings.name, staticSite.siteConfig.name),
      tagline: keep(settings.tagline, staticSite.siteConfig.tagline),
      description: keep(settings.description, staticSite.siteConfig.description),
      email: keep(settings.email, staticSite.siteConfig.email),
      phone: keep(settings.phone, staticSite.siteConfig.phone),
      location: keep(settings.location, staticSite.siteConfig.location),
      address: keep(settings.address, staticSite.siteConfig.address),
    }

    if (Array.isArray(settings.stats) && settings.stats.length) merged.stats = settings.stats
    if (Array.isArray(settings.businessHours) && settings.businessHours.length) {
      merged.businessHours = settings.businessHours
    }
    if (settings.mission) merged.mission = { ...staticSite.mission, body: settings.mission }
    if (settings.vision) merged.vision = { ...staticSite.vision, body: settings.vision }

    if (settings.social && Object.keys(settings.social).length) {
      merged.socialLinks = staticSite.socialLinks.map((link) => {
        const href = settings.social[link.name?.toLowerCase()]
        return href ? { ...link, href } : link
      })
    }
  }

  return merged
}

export const SiteDataProvider = ({ children }) => {
  const [live, setLive] = useState(null)
  const [status, setStatus] = useState(apiEnabled ? 'loading' : 'static')

  useEffect(() => {
    if (!apiEnabled) return
    let cancelled = false

    fetchSite()
      .then((payload) => {
        if (cancelled) return
        setLive(adapt(payload))
        setStatus('live')
      })
      .catch(() => {
        // Deliberately silent for the visitor: the static content is already
        // on screen and is a perfectly good page.
        if (!cancelled) setStatus('static')
      })

    return () => { cancelled = true }
  }, [])

  const value = useMemo(
    () => ({ ...staticSite, ...(live ?? {}), status, isLive: status === 'live' }),
    [live, status],
  )

  return <SiteDataContext.Provider value={value}>{children}</SiteDataContext.Provider>
}

/**
 * Everything src/data/site.js exports, with live values swapped in where the
 * API has them. Destructure exactly as you would have imported.
 */
export const useSiteData = () => {
  const ctx = useContext(SiteDataContext)
  if (!ctx) throw new Error('useSiteData must be used within SiteDataProvider')
  return ctx
}
