import React from 'react'
import { clients } from '../../data/site'
import { EditorialHeadline } from '../ui/SectionHeader'

const ClientsSection = () => {
  const doubled = [...clients, ...clients]

  return (
    <section id="clients" className="py-24 md:py-32 bg-background border-t border-white/5 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 mb-16">
        <EditorialHeadline className="max-w-5xl">
          We love what we do which has led us to working with ambitious brands across the globe.
        </EditorialHeadline>
      </div>

      {/* Logo marquee */}
      <div className="relative">
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
    </section>
  )
}

export default ClientsSection
