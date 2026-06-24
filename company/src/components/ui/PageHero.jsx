import React from 'react'
import { motion } from 'framer-motion'
import { EditorialLabel } from './SectionHeader'

const PageHero = ({ label, title, description, children }) => (
  <section className="relative pt-32 pb-16 md:pt-40 md:pb-20 overflow-hidden border-b border-white/5">
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_hsl(var(--primary)/0.08),_transparent_60%)] pointer-events-none" />
    <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
      {label && <EditorialLabel>{label}</EditorialLabel>}
      <motion.h1
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="editorial-headline mt-4 mb-6 max-w-4xl"
      >
        {title}
      </motion.h1>
      {description && (
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed"
        >
          {description}
        </motion.p>
      )}
      {children}
    </div>
  </section>
)

export default PageHero
