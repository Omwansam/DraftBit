/**
 * The unauthenticated surface: what the marketing site reads, plus the two
 * things it writes (an enquiry, and a page view).
 *
 * Nothing here requires a token, so every route is either a published-only
 * projection of a collection or a narrowly-shaped, rate-limited write. Draft
 * content is filtered in the query, not in the response — a `status` field a
 * client is trusted to ignore is not a filter.
 */
import { Router } from 'express'
import { z } from 'zod'
import prisma from '../prisma.js'
import ApiError from '../lib/errors.js'
import { logActivity } from '../lib/activity.js'
import { bumpDaily, classifyReferrer, dayKey } from '../lib/analytics.js'
import { serializeSettings } from '../lib/serialize.js'
import validate from '../middleware/validate.js'
import { contactLimiter, trackLimiter } from '../middleware/rateLimit.js'
import { resources } from '../resources/registry.js'
import { line, text, url } from '../schemas/common.js'
import { SETTINGS_ID } from './settings.routes.js'

const router = Router()

/** Columns that exist for the console's benefit and mean nothing publicly. */
const HIDDEN = new Set(['status', 'views', 'order', 'applicants', 'createdAt', 'updatedAt'])

const strip = (row) => Object.fromEntries(Object.entries(row).filter(([key]) => !HIDDEN.has(key)))

/* ------------------------------- Whole site ------------------------------- */

router.get('/site', async (_req, res) => {
  const [settings, ...collections] = await Promise.all([
    prisma.siteSetting.upsert({ where: { id: SETTINGS_ID }, update: {}, create: { id: SETTINGS_ID } }),
    ...Object.values(resources).map((config) =>
      prisma[config.model].findMany({ where: config.publicWhere, orderBy: config.publicOrderBy }),
    ),
  ])

  const payload = { settings: serializeSettings(settings) }
  Object.keys(resources).forEach((name, i) => {
    payload[name] = collections[i].map(strip)
  })

  res.json(payload)
})

/* --------------------------- One per collection --------------------------- */

for (const [name, config] of Object.entries(resources)) {
  router.get(`/${name}`, async (_req, res) => {
    const rows = await prisma[config.model].findMany({
      where: config.publicWhere,
      orderBy: config.publicOrderBy,
    })
    res.json(rows.map(strip))
  })

  if (!config.slugFrom) continue

  router.get(`/${name}/:slug`, async (req, res) => {
    const row = await prisma[config.model].findFirst({
      where: { slug: String(req.params.slug), ...config.publicWhere },
    })
    if (!row) throw ApiError.notFound(`No ${config.noun} at that address.`)

    /* View counting is best-effort: a failed increment must not turn a
       readable page into an error. */
    prisma[config.model]
      .update({ where: { id: row.id }, data: { views: { increment: 1 } } })
      .catch(() => {})

    res.json(strip(row))
  })
}

/* ------------------------------ Contact form ------------------------------ */

const contactBody = z.object({
  name: line(120).min(1, 'Please tell us your name'),
  email: z.email('Enter a valid email address').max(200).transform((v) => v.toLowerCase()),
  subject: line(200).default(''),
  message: text(5000).min(10, 'Please give us a little more detail'),
  source: line(60).default('Contact form'),
  /* Honeypot: a field styled out of sight that only a bot fills in. Cheap,
     invisible to real users, and catches most drive-by form spam. */
  website: url().max(200).optional(),
})

router.post('/contact', contactLimiter, validate({ body: contactBody }), async (req, res) => {
  const { website, ...data } = req.body

  if (website) {
    // Answer exactly as if it worked: telling a bot it was caught only tells
    // whoever wrote it which field to leave alone next time.
    return res.status(201).json({ ok: true })
  }

  const message = await prisma.message.create({
    data: {
      ...data,
      ip: req.ip,
      userAgent: req.get('user-agent')?.slice(0, 255) ?? null,
    },
  })

  await bumpDaily('enquiries')
  logActivity({
    actor: data.name,
    action: 'sent an enquiry',
    target: data.subject || data.email,
    type: 'message',
    meta: { id: message.id },
  })

  res.status(201).json({ ok: true, id: message.id })
})

/* ------------------------------ Page tracking ----------------------------- */

const trackBody = z.object({
  path: line(300).min(1),
  title: line(200).default(''),
  /** Anonymous, client-generated, rotated by the site — never a user id. */
  visitorId: line(64).min(8),
  referrer: url().default(''),
  seconds: z.coerce.number().int().min(0).max(3600).default(0),
  bounced: z.boolean().default(false),
})

router.post('/track', trackLimiter, validate({ body: trackBody }), async (req, res) => {
  const { path, title, visitorId, referrer, seconds, bounced } = req.body
  const date = dayKey()

  await bumpDaily('pageViews')

  /* The row's existence is what makes this a new visitor. Letting the unique
     constraint decide is race-free; a read-then-write would double-count two
     tabs opened at once. */
  let firstToday = true
  try {
    await prisma.visitorDay.create({ data: { date, visitorKey: visitorId } })
  } catch (err) {
    if (err?.code !== 'P2002') throw err
    firstToday = false
  }

  if (firstToday) {
    await bumpDaily('visitors')
    const source = classifyReferrer(referrer, req.hostname)
    await prisma.trafficSource.upsert({
      where: { source },
      update: { visitors: { increment: 1 } },
      create: { source, visitors: 1 },
    })
  }

  await prisma.pageStat.upsert({
    where: { path },
    update: {
      views: { increment: 1 },
      totalSeconds: { increment: seconds },
      bounces: { increment: bounced ? 1 : 0 },
      ...(title ? { title } : {}),
    },
    create: { path, title, views: 1, totalSeconds: seconds, bounces: bounced ? 1 : 0 },
  })

  res.status(202).json({ ok: true })
})

export default router
