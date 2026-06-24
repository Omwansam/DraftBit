import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useToast } from '../ui/Toast'
import { EditorialLabel, EditorialHeadline } from '../ui/SectionHeader'

const Newsletter = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const { addToast } = useToast()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    await new Promise((r) => setTimeout(r, 800))
    setLoading(false)
    setEmail('')
    addToast('You\'re subscribed! Welcome to the DraftBit newsletter.')
  }

  return (
    <section className="py-20 border-t border-white/5 bg-[hsl(224_71%_3%)]">
      <div className="max-w-2xl mx-auto px-6 sm:px-8 text-center">
        <EditorialLabel className="justify-center">Stay in the Loop</EditorialLabel>
        <EditorialHeadline className="mt-4 mb-4">
          Get insights from our studio.
        </EditorialHeadline>
        <p className="text-muted-foreground mb-8">
          Monthly updates on tech, product, and building from Africa to the world. No spam.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            className="flex-1 px-5 py-3.5 rounded-full bg-white/5 border border-white/10 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-colors"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3.5 rounded-full bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60"
          >
            {loading ? 'Subscribing...' : 'Subscribe'}
          </button>
        </form>
      </div>
    </section>
  )
}

export default Newsletter
