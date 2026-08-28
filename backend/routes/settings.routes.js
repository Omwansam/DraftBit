/**
 * Site settings — one row, id "site".
 *
 * Read by anyone signed in (the console shows the form read-only to Viewers);
 * written only with manage_settings, which is where the public site's contact
 * details and SEO copy actually live.
 */
import { Router } from 'express'
import prisma from '../prisma.js'
import { logFor } from '../lib/activity.js'
import { serializeSettings } from '../lib/serialize.js'
import { requirePermission } from '../middleware/auth.js'
import validate from '../middleware/validate.js'
import settingsUpdate from '../schemas/settings.js'

const router = Router()

export const SETTINGS_ID = 'site'

/** Reading settings should never 404 on a fresh database. */
export async function readSettings() {
  const row = await prisma.siteSetting.upsert({
    where: { id: SETTINGS_ID },
    update: {},
    create: { id: SETTINGS_ID },
  })
  return serializeSettings(row)
}

router.get('/', requirePermission('read'), async (_req, res) => {
  res.json(await readSettings())
})

const save = async (req, res) => {
  const data = { ...req.body, updatedById: req.user.id }

  const row = await prisma.siteSetting.upsert({
    where: { id: SETTINGS_ID },
    update: data,
    create: { id: SETTINGS_ID, ...data },
  })

  logFor(req, 'updated site settings', Object.keys(req.body).join(', '), 'edit')
  res.json(serializeSettings(row))
}

router.put('/', requirePermission('manage_settings'), validate({ body: settingsUpdate }), save)
router.patch('/', requirePermission('manage_settings'), validate({ body: settingsUpdate }), save)

export default router
