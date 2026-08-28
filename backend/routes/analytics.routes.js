/**
 * Traffic figures for the dashboard and the analytics screen.
 *
 * The console does its own windowing and delta maths over the raw series, so
 * these endpoints hand back the same arrays its demo seed produces — nothing
 * is pre-aggregated into a shape only one chart can use.
 */
import { Router } from 'express'
import { z } from 'zod'
import prisma from '../prisma.js'
import { topPages, trafficSeries, trafficSources } from '../lib/analytics.js'
import { requirePermission } from '../middleware/auth.js'
import validate from '../middleware/validate.js'

const router = Router()

const daysQuery = z.object({
  days: z.coerce.number().int().min(1).max(365).default(90),
})

router.get('/', requirePermission('read'), validate({ query: daysQuery }), async (req, res) => {
  const [traffic, sources, pages] = await Promise.all([
    trafficSeries(req.validatedQuery.days),
    trafficSources(),
    topPages(),
  ])
  res.json({ traffic, trafficSources: sources, topPages: pages })
})

router.get('/traffic', requirePermission('read'), validate({ query: daysQuery }), async (req, res) => {
  res.json(await trafficSeries(req.validatedQuery.days))
})

router.get('/sources', requirePermission('read'), async (_req, res) => {
  res.json(await trafficSources())
})

router.get('/pages', requirePermission('read'), async (_req, res) => {
  res.json(await topPages())
})

/**
 * The dashboard's stat tiles: current window, previous window of equal length,
 * and the counts the sidebar badges show.
 */
router.get('/summary', requirePermission('read'), validate({ query: daysQuery }), async (req, res) => {
  const days = Math.min(req.validatedQuery.days, 180)
  const series = await trafficSeries(days * 2)

  const current = series.slice(-days)
  const previous = series.slice(0, days)

  const sum = (rows, key) => rows.reduce((acc, row) => acc + row[key], 0)
  const delta = (curr, prev) => (prev === 0 ? null : ((curr - prev) / prev) * 100)

  const visitors = sum(current, 'visitors')
  const pageViews = sum(current, 'pageViews')
  const enquiries = sum(current, 'enquiries')

  const [unreadMessages, openRoles, publishedProjects, draftProjects, draftInsights, pendingTestimonials] =
    await Promise.all([
      prisma.message.count({ where: { read: false, status: { not: 'spam' } } }),
      prisma.career.count({ where: { status: 'open' } }),
      prisma.project.count({ where: { status: 'published' } }),
      prisma.project.count({ where: { status: 'draft' } }),
      prisma.insight.count({ where: { status: 'draft' } }),
      prisma.testimonial.count({ where: { status: 'pending' } }),
    ])

  res.json({
    days,
    visitors,
    pageViews,
    enquiries,
    conversion: visitors === 0 ? 0 : (enquiries / visitors) * 100,
    pagesPerVisit: visitors === 0 ? 0 : pageViews / visitors,
    visitorsDelta: delta(visitors, sum(previous, 'visitors')),
    pageViewsDelta: delta(pageViews, sum(previous, 'pageViews')),
    enquiriesDelta: delta(enquiries, sum(previous, 'enquiries')),
    unreadMessages,
    openRoles,
    publishedProjects,
    draftCount: draftProjects + draftInsights,
    pendingTestimonials,
  })
})

export default router
