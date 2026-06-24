import { siteConfig } from '../data/site'

const FORMSPREE_ENDPOINT = import.meta.env.VITE_FORMSPREE_ENDPOINT

export async function submitContactForm(data) {
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
