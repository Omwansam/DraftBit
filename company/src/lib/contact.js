import { apiEnabled, submitEnquiry } from './api'
import { siteConfig } from '../data/site'

const FORMSPREE_ENDPOINT = import.meta.env.VITE_FORMSPREE_ENDPOINT

/**
 * Send an enquiry.
 *
 * The DraftBit API is preferred, because a message that lands in the database
 * shows up in the admin console's inbox. Formspree stays as a fallback for a
 * deployment with no backend, and the dev simulation below keeps the form
 * usable with neither configured.
 */
export async function submitContactForm(data) {
  if (apiEnabled) {
    const payload = await submitEnquiry({
      name: data.name,
      email: data.email,
      subject: data.subject || 'Website enquiry',
      message: data.message,
      source: data.source || 'Contact form',
      // Honeypot: the form renders this field out of sight, so a value here
      // means a bot filled it in.
      ...(data.website ? { website: data.website } : {}),
    })
    return { ok: true, id: payload?.id }
  }

  if (FORMSPREE_ENDPOINT) {
    const res = await fetch(FORMSPREE_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        name: data.name,
        email: data.email,
        message: data.message,
        subject: data.subject || 'Website inquiry',
        _subject: `New inquiry from ${data.name}`,
      }),
    })
    if (!res.ok) throw new Error('Form submission failed')
    return { ok: true }
  }

  // Dev fallback: simulate success
  await new Promise((r) => setTimeout(r, 800))
  console.info('[Contact form]', data)
  return { ok: true, simulated: true }
}

export function getWhatsAppUrl(message = 'Hi DraftBit, I\'d like to discuss a project.') {
  const phone = siteConfig.phone.replace(/\D/g, '')
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
}
