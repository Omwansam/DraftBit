/**
 * One CRUD router, built per collection from src/resources/registry.js.
 *
 * Beyond the obvious verbs it covers the three things the console actually does
 * that plain REST does not: bulk patch (select rows → archive), bulk delete,
 * and reorder (drag a service up the list). Doing those one request per row
 * would be N round trips and N activity-log entries for one user gesture.
 */
import { Router } from 'express'
import { z } from 'zod'
import prisma from '../prisma.js'
import ApiError from '../lib/errors.js'
import { logFor } from '../lib/activity.js'
import { uniqueSlug } from '../lib/slug.js'
import { can, requirePermission } from '../middleware/auth.js'
import validate from '../middleware/validate.js'
import { id as idSchema, idList, idParam } from '../schemas/common.js'

const listQuery = z.object({
  status: z.string().trim().max(40).optional(),
  q: z.string().trim().max(200).optional(),
  featured: z.enum(['true', 'false']).optional(),
  limit: z.coerce.number().int().min(1).max(500).optional(),
  offset: z.coerce.number().int().min(0).optional(),
})

/** `?ids=a,b,c` as an alternative to a DELETE body, which some clients drop. */
const idsQuery = z.object({
  ids: z.string().trim().min(1).transform((v) => v.split(',').map((s) => s.trim()).filter(Boolean)).optional(),
})

const PUBLISHED_VALUES = new Set(['published', 'open'])

export function resourceRouter(name, config) {
  const router = Router()
  const delegate = () => prisma[config.model]
  const labelOf = (record) => record?.[config.label] ?? record?.id ?? ''

  const bulkPatchBody = z.object({
    ids: idList.shape.ids,
    patch: config.update,
  })

  /**
   * Publishing is a separate capability from editing, so a role that may draft
   * but not publish cannot reach the public site by sending `status` directly.
   */
  const assertPublishAllowed = (req, data) => {
    if (!data || !('status' in data)) return
    if (!PUBLISHED_VALUES.has(data.status)) return
    if (can(req.user?.role, 'publish')) return
    throw ApiError.forbidden(`Your role (${req.user?.role ?? 'Viewer'}) cannot publish.`)
  }

  const prepare = async (data, existing, req) => {
    assertPublishAllowed(req, data)

    let next = { ...data }

    if (config.slugFrom) {
      if (next.slug) {
        next.slug = await uniqueSlug(config.model, next.slug, existing?.id ?? null)
      } else if (!existing) {
        // Only mint a slug on create. Re-slugging on every rename would break
        // every public URL and inbound link the moment someone fixes a typo.
        next.slug = await uniqueSlug(config.model, next[config.slugFrom] ?? 'untitled')
      }
    }

    if (config.beforeWrite) next = config.beforeWrite(next, existing)
    return next
  }

  /* -------------------------------- Read --------------------------------- */

  router.get('/', requirePermission('read'), validate({ query: listQuery }), async (req, res) => {
    const { status, q, featured, limit, offset } = req.validatedQuery

    const where = {
      ...(status ? { status } : {}),
      ...(featured ? { featured: featured === 'true' } : {}),
      ...(q && config.searchFields?.length
        ? { OR: config.searchFields.map((field) => ({ [field]: { contains: q, mode: 'insensitive' } })) }
        : {}),
    }

    const rows = await delegate().findMany({
      where,
      orderBy: config.orderBy,
      ...(limit ? { take: limit } : {}),
      ...(offset ? { skip: offset } : {}),
    })

    res.json(rows)
  })

  router.get('/:id', requirePermission('read'), validate({ params: idParam }), async (req, res) => {
    const record = await delegate().findUnique({ where: { id: req.params.id } })
    if (!record) throw ApiError.notFound(`That ${config.noun} no longer exists.`)
    res.json(record)
  })

  /* ------------------------------- Create -------------------------------- */

  router.post('/', requirePermission('write'), validate({ body: config.create }), async (req, res) => {
    const data = await prepare(req.body, null, req)
    const record = await delegate().create({ data })

    logFor(req, `created the ${config.noun}`, labelOf(record), 'create', { id: record.id, collection: name })
    res.status(201).json(record)
  })

  /* -------------------------------- Update ------------------------------- */

  const updateOne = async (req, res) => {
    const existing = await delegate().findUnique({ where: { id: req.params.id } })
    if (!existing) throw ApiError.notFound(`That ${config.noun} no longer exists.`)

    const data = await prepare(req.body, existing, req)
    const record = await delegate().update({ where: { id: existing.id }, data })

    const published = 'status' in req.body && PUBLISHED_VALUES.has(req.body.status) && !PUBLISHED_VALUES.has(existing.status)
    logFor(
      req,
      published ? `published the ${config.noun}` : `updated the ${config.noun}`,
      labelOf(record),
      published ? 'publish' : 'edit',
      { id: record.id, collection: name },
    )

    res.json(record)
  }

  router.patch('/:id', requirePermission('write'), validate({ params: idParam, body: config.update }), updateOne)
  // PUT is accepted as an alias so a client that prefers it works; both merge
  // the supplied fields rather than blanking the ones left out.
  router.put('/:id', requirePermission('write'), validate({ params: idParam, body: config.update }), updateOne)

  router.patch('/', requirePermission('write'), validate({ body: bulkPatchBody }), async (req, res) => {
    const { ids, patch } = req.body
    assertPublishAllowed(req, patch)

    const result = await delegate().updateMany({ where: { id: { in: ids } }, data: patch })
    const rows = await delegate().findMany({ where: { id: { in: ids } }, orderBy: config.orderBy })

    logFor(req, `updated ${result.count} ${config.noun}${result.count === 1 ? '' : 's'}`, '', 'edit', {
      collection: name, ids, patch,
    })
    res.json({ count: result.count, records: rows })
  })

  /* -------------------------------- Delete ------------------------------- */

  router.delete('/:id', requirePermission('delete'), validate({ params: idParam }), async (req, res) => {
    const existing = await delegate().findUnique({ where: { id: req.params.id } })
    if (!existing) throw ApiError.notFound(`That ${config.noun} no longer exists.`)

    await delegate().delete({ where: { id: existing.id } })
    logFor(req, `deleted the ${config.noun}`, labelOf(existing), 'delete', { id: existing.id, collection: name })

    res.status(204).end()
  })

  router.delete(
    '/',
    requirePermission('delete'),
    validate({ query: idsQuery }),
    async (req, res) => {
      const ids = req.validatedQuery.ids ?? idList.parse(req.body ?? {}).ids
      const rows = await delegate().findMany({ where: { id: { in: ids } } })
      const result = await delegate().deleteMany({ where: { id: { in: ids } } })

      logFor(req, `deleted ${result.count} ${config.noun}${result.count === 1 ? '' : 's'}`, rows.map(labelOf).slice(0, 3).join(', '), 'delete', {
        collection: name, ids,
      })
      res.json({ count: result.count })
    },
  )

  /* -------------------------------- Reorder ------------------------------ */

  router.post('/reorder', requirePermission('write'), validate({ body: idList }), async (req, res) => {
    const { ids } = req.body

    // One transaction: a half-applied reorder leaves two records claiming the
    // same position, and the list renders in an order nobody chose.
    await prisma.$transaction(
      ids.map((recordId, index) =>
        delegate().update({ where: { id: recordId }, data: { order: index } }),
      ),
    )

    const rows = await delegate().findMany({ orderBy: config.orderBy })
    logFor(req, `reordered ${name}`, '', 'edit', { collection: name })
    res.json(rows)
  })

  return router
}

/** Mount every registered collection onto a parent router. */
export function mountResources(parent, registry) {
  for (const [name, config] of Object.entries(registry)) {
    parent.use(`/${name}`, resourceRouter(name, config))
  }
  return parent
}

export { idSchema }
export default resourceRouter
