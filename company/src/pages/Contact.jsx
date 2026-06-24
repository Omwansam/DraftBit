import React, { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, Mail, MapPin, Phone, Clock, ChevronDown } from 'lucide-react'
import { siteConfig, faqs, businessHours, getCareerBySlug } from '../data/site'
import { submitContactForm, getWhatsAppUrl } from '../lib/contact'
import PageHero from '../components/ui/PageHero'
import Seo from '../components/ui/Seo'
import { useToast } from '../components/ui/Toast'

const Contact = () => {
  const [searchParams] = useSearchParams()
  const roleSlug = searchParams.get('role')
  const applyingRole = roleSlug ? getCareerBySlug(roleSlug) : null
  const [openFaq, setOpenFaq] = useState(null)
  const { addToast } = useToast()

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      name: '',
      email: '',
      message: applyingRole ? `I'm interested in the ${applyingRole.title} position.` : '',
    },
  })

  const onSubmit = async (data) => {
    try {
      await submitContactForm({
        ...data,
        subject: applyingRole ? `Career: ${applyingRole.title}` : 'Website inquiry',
      })
      reset()
      addToast('Message sent! We\'ll reply within 24 hours.')
    } catch {
      addToast('Something went wrong. Please email us directly.', 'error')
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Seo />
      <PageHero
        label="Get In Touch"
        title="Have an idea or an epic project in mind?"
        description="Let's work together and make something great."
      />

      {applyingRole && (
        <div className="max-w-3xl mx-auto px-6 -mt-8 mb-8">
          <div className="p-4 rounded-xl border border-primary/30 bg-primary/10 text-sm">
            Applying for: <strong className="text-foreground">{applyingRole.title}</strong> — {applyingRole.department}
          </div>
        </div>
      )}

      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div>
              <a href={`mailto:${siteConfig.email}`} className="block text-2xl md:text-3xl font-display font-bold text-gradient hover:opacity-80 transition-opacity mb-10 break-all">
                {siteConfig.email}
              </a>

              <div className="space-y-6 mb-10">
                {[
                  { icon: Phone, label: 'Phone', value: siteConfig.phone, href: siteConfig.phoneHref },
                  { icon: MapPin, label: 'Office', value: siteConfig.address, href: siteConfig.mapUrl },
                  { icon: Mail, label: 'WhatsApp', value: 'Chat with us', href: getWhatsAppUrl() },
                ].map((item) => {
                  const Icon = item.icon
                  return (
                    <a key={item.label} href={item.href} target={item.href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" className="flex items-center gap-4 group">
                      <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:border-primary/30 transition-colors">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">{item.label}</p>
                        <p className="text-foreground group-hover:text-primary transition-colors">{item.value}</p>
                      </div>
                    </a>
                  )
                })}
              </div>

              <div className="p-6 rounded-2xl border border-white/8 bg-white/[0.02]">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-5 h-5 text-primary" />
                  <h3 className="font-display font-bold text-foreground">Business Hours</h3>
                </div>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {businessHours.map((h) => (
                    <li key={h.days} className="flex justify-between gap-4">
                      <span>{h.days}</span>
                      <span className="text-foreground">{h.time}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-8 md:p-10 rounded-2xl border border-white/8 bg-white/[0.02]">
              <h2 className="font-display font-bold text-xl text-foreground mb-2">Send a message</h2>
              <p className="text-sm text-muted-foreground mb-4">We respond within 24 hours on business days.</p>

              {['name', 'email'].map((field) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-foreground mb-2 capitalize">{field}</label>
                  <input
                    type={field === 'email' ? 'email' : 'text'}
                    {...register(field, { required: `${field} is required` })}
                    className={`w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:outline-none focus:border-primary transition-colors ${errors[field] ? 'border-red-500' : ''}`}
                  />
                  {errors[field] && <p className="text-red-500 text-sm mt-1">{errors[field].message}</p>}
                </div>
              ))}

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Message</label>
                <textarea
                  {...register('message', { required: 'Message is required' })}
                  rows={5}
                  className={`w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:outline-none focus:border-primary resize-none transition-colors ${errors.message ? 'border-red-500' : ''}`}
                />
                {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message.message}</p>}
              </div>

              <button type="submit" disabled={isSubmitting} className="w-full py-4 rounded-full bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
                {isSubmitting ? <><Loader2 className="w-5 h-5 animate-spin" />Sending...</> : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </section>

      <section className="py-16 border-t border-white/5">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="section-label justify-center mb-10">FAQ</h2>
          <div className="space-y-1">
            {faqs.map((faq, i) => (
              <div key={faq.question} className="border-b border-white/8">
                <button type="button" onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between gap-4 py-5 text-left">
                  <span className="font-medium text-foreground">{faq.question}</span>
                  <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.p initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden pb-5 text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 border-t border-white/5">
        <div className="max-w-5xl mx-auto px-6">
          <iframe
            title="DraftBit office location"
            src="https://maps.google.com/maps?q=Nairobi,Kenya&output=embed"
            className="w-full h-80 rounded-2xl border border-white/10 grayscale hover:grayscale-0 transition-all duration-500"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </section>
    </div>
  )
}

export default Contact
