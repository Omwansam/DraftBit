/**
 * The enquiry inbox.
 *
 * Reading is a read; triage (star, archive, mark read, spam) is a write;
 * deleting is a delete — a Viewer can therefore see the inbox but cannot
 * quietly mark everything read, which is what the console's UI already implies.
 */
import { Router } from 'express'
import { z } from 'zod'
import prisma from '../prisma.js'
import ApiError from '../lib/errors.js'
import { logFor } from '../lib/activity.js'
import { messageStatusToDb, serializeMessage, serializeMessages } from '../lib/serialize.js'
import { requirePermission } from '../middleware/auth.js'
import validate from '../middleware/validate.js'
import { idList, idParam } from '../schemas/common.js'

const router = Router()

const API_STATUSES = ['new', 'in-progress', 'replied', 'archived', 'spam', 'closed']

const listQuery = z.object({
  status: z.enum(API_STATUSES).optional(),
  read: z.enum(['true', 'false']).optional(),
  starred: z.enum(['true', 'false']).optional(),
  q: z.string().trim().max(200).optional(),
  limit: z.coerce.number().int().min(1).max(1000).optional(),
})

const patchBody = z
  .object({
    read: z.boolean().optional(),
    starred: z.boolean().optional(),
    status: z.enum(API_STATUSES).optional(),
  })
  .transform((patch) => ({
    ...patch,
    ...(patch.status ? { status: messageStatusToDb(patch.status) } : {}),
    // A reply is a fact with a time; the inbox shows "replied" but the row
    // should be able to say when.
    ...(patch.status === 'replied' ? { repliedAt: new Date() } : {}),
  }))

const bulkBody = z.object({ ids: idList.shape.ids, patch: patchBody })

/* ---------------------------------- Read ---------------------------------- */

router.get('/', requirePermission('read'), validate({ query: listQuery }), async (req, res) => {
  const { status, read, starred, q, limit } = req.validatedQuery

  const rows = await prisma.message.findMany({
    where: {
      ...(status ? { status: messageStatusToDb(status) } : {}),
      ...(read ? { read: read === 'true' } : {}),
      ...(starred ? { starred: starred === 'true' } : {}),
      ...(q
        ? {
            OR: ['name', 'email', 'subject', 'message'].map((field) => ({
              [field]: { contains: q, mode: 'insensitive' },
            })),
          }
        : {}),
    },
    orderBy: { createdAt: 'desc' },
    ...(limit ? { take: limit } : {}),
  })

  res.json(serializeMessages(rows))
})

/** Unread count for the sidebar badge, without shipping the whole inbox. */
router.get('/unread-count', requirePermission('read'), async (_req, res) => {
  const count = await prisma.message.count({
    where: { read: false, status: { not: 'spam' } },
  })
  res.json({ count })
})

router.get('/:id', requirePermission('read'), validate({ params: idParam }), async (req, res) => {
  const found = await prisma.message.findUnique({ where: { id: req.params.id } })
  if (!found) throw ApiError.notFound('That message no longer exists.')
  res.json(serializeMessage(found))
})

/* --------------------------------- Triage --------------------------------- */

const patchOne = async (req, res) => {
  const existing = await prisma.message.findUnique({ where: { id: req.params.id } })
  if (!existing) throw ApiError.notFound('That message no longer exists.')

  const updated = await prisma.message.update({ where: { id: existing.id }, data: req.body })

  /* Opening a message marks it read, which would otherwise fill the activity
     feed with noise. Only a real triage decision is worth logging. */
  if (req.body.status && req.body.status !== existing.status) {
    logFor(req, `marked the enquiry from ${existing.name} as ${req.body.status.replace('_', ' ')}`, existing.subject, 'message', { id: existing.id })
  }

  res.json(serializeMessage(updated))
}

router.patch('/:id', requirePermission('write'), validate({ params: idParam, body: patchBody }), patchOne)
router.put('/:id', requirePermission('write'), validate({ params: idParam, body: patchBody }), patchOne)

router.patch('/', requirePermission('write'), validate({ body: bulkBody }), async (req, res) => {
  const { ids, patch } = req.body

  const result = await prisma.message.updateMany({ where: { id: { in: ids } }, data: patch })
  const rows = await prisma.message.findMany({ where: { id: { in: ids } }, orderBy: { createdAt: 'desc' } })

  if (patch.status) {
    logFor(req, `moved ${result.count} enquir${result.count === 1 ? 'y' : 'ies'} to ${patch.status.replace('_', ' ')}`, '', 'message', { ids })
  }

  res.json({ count: result.count, records: serializeMessages(rows) })
})

/* --------------------------------- Delete --------------------------------- */

router.delete('/:id', requirePermission('delete'), validate({ params: idParam }), async (req, res) => {
  const existing = await prisma.message.findUnique({ where: { id: req.params.id } })
  if (!existing) throw ApiError.notFound('That message no longer exists.')

  await prisma.message.delete({ where: { id: existing.id } })
  logFor(req, 'deleted the enquiry from', existing.name, 'delete', { id: existing.id })

  res.status(204).end()
})

router.delete('/', requirePermission('delete'), async (req, res) => {
  const { ids } = idList.parse(req.body ?? {})
  const result = await prisma.message.deleteMany({ where: { id: { in: ids } } })

  logFor(req, `deleted ${result.count} enquir${result.count === 1 ? 'y' : 'ies'}`, '', 'delete', { ids })
  res.json({ count: result.count })
})

export default router
