import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react'
import { useSiteData } from '../../context/SiteDataContext'
import { EditorialLabel, EditorialHeadline } from '../ui/SectionHeader'

const TestimonialsSection = () => {
  const { testimonials } = useSiteData()

  const [active, setActive] = useState(0)
  const current = testimonials[active]
  const next = () => setActive((i) => (i + 1) % testimonials.length)
  const prev = () => setActive((i) => (i - 1 + testimonials.length) % testimonials.length)

  return (
    <section id="testimonials" className="py-24 md:py-32 bg-background border-t border-white/5">
      <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12">
        <EditorialLabel className="justify-center">Testimonials</EditorialLabel>
        <EditorialHeadline className="mt-4 mb-16 text-center">
          What our clients say.
        </EditorialHeadline>

        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="text-center"
          >
            <Quote className="w-8 h-8 text-primary/40 mx-auto mb-8" />
            <blockquote className="text-2xl md:text-3xl font-display font-medium text-foreground leading-snug mb-10">
              &ldquo;{current.quote}&rdquo;
            </blockquote>
            <div className="flex items-center justify-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-sm font-bold text-primary-foreground">
                {current.avatar}
              </div>
              <div className="text-left">
                <cite className="font-semibold text-foreground not-italic block">{current.author}</cite>
                <p className="text-sm text-muted-foreground">{current.role}</p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center justify-center gap-4 mt-12">
          <button type="button" onClick={prev} className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors" aria-label="Previous">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex gap-2">
            {testimonials.map((_, i) => (
              <button key={i} type="button" onClick={() => setActive(i)} className={`h-2 rounded-full transition-all ${i === active ? 'w-8 bg-primary' : 'w-2 bg-white/20'}`} aria-label={`Testimonial ${i + 1}`} />
            ))}
          </div>
          <button type="button" onClick={next} className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors" aria-label="Next">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  )
}

export default TestimonialsSection
