import { Router } from 'express'
import { z } from 'zod'
import prisma from '../prisma.js'
import { requirePermission } from '../middleware/auth.js'
import validate from '../middleware/validate.js'

const router = Router()

const listQuery = z.object({
  limit: z.coerce.number().int().min(1).max(200).default(30),
  type: z.string().trim().max(40).optional(),
})

router.get('/', requirePermission('read'), validate({ query: listQuery }), async (req, res) => {
  const { limit, type } = req.validatedQuery

  const rows = await prisma.activityLog.findMany({
    where: type ? { type } : {},
    orderBy: { at: 'desc' },
    take: limit,
    select: { id: true, actor: true, action: true, target: true, type: true, at: true },
  })

  res.json(rows)
})

export default router
