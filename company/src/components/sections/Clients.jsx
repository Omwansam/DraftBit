import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { globalRegions, clients } from '../../data/site'
import { EditorialHeadline } from '../ui/SectionHeader'

const ClientsSection = () => {
  const [activeRegion, setActiveRegion] = useState(globalRegions[0].id)
  const region = globalRegions.find((r) => r.id === activeRegion)
  const doubled = [...clients, ...clients]

  return (
    <section id="clients" className="py-24 md:py-32 bg-background border-t border-white/5 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 mb-16">
        <EditorialHeadline className="max-w-5xl">
          We love what we do which has led us to working with ambitious brands across the globe.
        </EditorialHeadline>
      </div>

      {/* Logo marquee */}
      <div className="relative mb-20">
        <div className="absolute left-0 top-0 bottom-0 w-20 md:w-32 bg-gradient-to-r from-background to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-20 md:w-32 bg-gradient-to-l from-background to-transparent z-10" />
        <div className="flex animate-marquee">
          {doubled.map((client, i) => (
            <div
              key={`${client}-${i}`}
              className="flex-shrink-0 mx-10 md:mx-16 flex items-center"
            >
              <span className="text-2xl md:text-4xl font-display font-bold text-white/15 hover:text-white/30 transition-colors whitespace-nowrap">
                {client}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Regional presence */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex flex-wrap gap-3 mb-10">
          {globalRegions.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setActiveRegion(r.id)}
              className={`px-6 py-3 rounded-full text-sm font-semibold transition-all ${
                activeRegion === r.id
                  ? 'bg-primary text-primary-foreground'
                  : 'border border-white/10 text-muted-foreground hover:text-foreground hover:border-white/20'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeRegion}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
            className="flex flex-wrap gap-x-6 gap-y-3"
          >
            {region.countries.map((country) => (
              <span
                key={country}
                className="text-muted-foreground hover:text-primary transition-colors cursor-default text-sm md:text-base"
              >
                {country}
              </span>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  )
}

export default ClientsSection
