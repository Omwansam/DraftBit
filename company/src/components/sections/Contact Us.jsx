import React from 'react'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useSiteData } from '../../context/SiteDataContext'
import { submitContactForm } from '../../lib/contact'
import { EditorialLabel, EditorialHeadline } from '../ui/SectionHeader'
import { useToast } from '../ui/Toast'

const ContactSection = () => {
  const { siteConfig, socialLinks } = useSiteData()

  const { addToast } = useToast()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: { name: '', email: '', message: '' },
  })

  const onSubmit = async (data) => {
    try {
      await submitContactForm(data)
      reset()
      addToast('Message sent! We\'ll get back to you within 24 hours.')
    } catch (err) {
      console.error(err)
      addToast('Failed to send message. Please try again.', 'error')
    }
  }

  return (
    <section id="contact" className="py-24 md:py-32 bg-background border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
          {/* Editorial contact copy — NBT inspired */}
          <div>
            <EditorialLabel>Get In Touch</EditorialLabel>
            <EditorialHeadline className="mt-4 mb-8">
              Have an idea or an epic project in mind? Talk to us.
            </EditorialHeadline>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-lg text-muted-foreground mb-8 leading-relaxed"
            >
              Let us work together and make something great. Shoot us a message at
            </motion.p>

            <motion.a
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              href={`mailto:${siteConfig.email}`}
              className="block text-2xl md:text-3xl lg:text-4xl font-display font-bold text-gradient hover:opacity-80 transition-opacity break-all mb-12"
            >
              {siteConfig.email}
            </motion.a>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
              <div>
                <h4 className="section-label mb-4">Where to Find Us</h4>
                <address className="not-italic text-muted-foreground leading-relaxed">
                  {siteConfig.address.split(', ').map((line) => (
                    <span key={line} className="block">{line}</span>
                  ))}
                  <a
                    href={siteConfig.phoneHref}
                    className="block mt-2 hover:text-primary transition-colors"
                  >
                    {siteConfig.phone}
                  </a>
                </address>
              </div>

              <div>
                <h4 className="section-label mb-4">Follow Us</h4>
                <ul className="space-y-2">
                  {socialLinks.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <Link
              to="/contact"
              className="inline-flex mt-12 px-10 py-4 rounded-full bg-primary text-primary-foreground font-semibold text-lg hover:bg-primary/90 hover:glow transition-all"
            >
              Let&apos;s Talk
            </Link>
          </div>

          {/* Quick message form */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:pt-16"
          >
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-6 p-8 md:p-10 rounded-2xl border border-white/8 bg-white/[0.02]"
            >
              <p className="text-sm text-muted-foreground mb-2">Or send a quick message</p>

              <div>
                <input
                  type="text"
                  {...register('name', { required: 'Name is required' })}
                  placeholder="Your name"
                  className={`w-full px-0 py-4 bg-transparent border-0 border-b border-white/10 focus:outline-none focus:border-primary transition-colors text-foreground placeholder:text-muted-foreground/50 ${
                    errors.name ? 'border-red-500' : ''
                  }`}
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
              </div>

              <div>
                <input
                  type="email"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' },
                  })}
                  placeholder="Your email"
                  className={`w-full px-0 py-4 bg-transparent border-0 border-b border-white/10 focus:outline-none focus:border-primary transition-colors text-foreground placeholder:text-muted-foreground/50 ${
                    errors.email ? 'border-red-500' : ''
                  }`}
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
              </div>

              <div>
                <textarea
                  {...register('message', { required: 'Message is required' })}
                  placeholder="Tell us about your project..."
                  rows={4}
                  className={`w-full px-0 py-4 bg-transparent border-0 border-b border-white/10 focus:outline-none focus:border-primary transition-colors resize-none text-foreground placeholder:text-muted-foreground/50 ${
                    errors.message ? 'border-red-500' : ''
                  }`}
                />
                {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message.message}</p>}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-full bg-foreground text-background font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Message'
                )}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default ContactSection
