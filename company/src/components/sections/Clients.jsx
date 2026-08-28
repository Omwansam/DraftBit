import React from 'react'
import { useSiteData } from '../../context/SiteDataContext'
import { EditorialHeadline } from '../ui/SectionHeader'

/**
 * The scrolling strip under the fold.
 *
 * It used to scroll Safaricom, Flutterwave, Andela, M-Kopa, Twiga Foods,
 * Cellulant, Sendy, Lori Systems, Copia and Tala as if they were clients. They
 * are real companies and none of them are, so a visitor could disprove the
 * whole section in about a minute — and a marketing page that fails that test
 * costs more than an empty strip ever would.
 *
 * So it shows whichever of these is true:
 *   clients exist   named clients, once someone has agreed to be listed
 *   otherwise       what DraftBit builds, which is true today and needs no
 *                   permission from anyone
 *
 * Add a real client in the console and this becomes a client marquee on its own.
 */

/** Enough repeats to fill the width, then mirrored for a seamless -50% loop. */
const MIN_ITEMS = 10

function marqueeItems(source) {
  if (!source.length) return []

  const half = []
  while (half.length < MIN_ITEMS) half.push(...source)

  // The animation translates by exactly -50%, so the two halves must be
  // identical or the loop visibly jumps at the seam.
  return [...half, ...half]
}

const ClientsSection = () => {
  const { clients, services } = useSiteData()

  const named = clients.map((client) => (typeof client === 'string' ? client : client.name))
  const showingClients = named.length > 0
  const source = showingClients ? named : services.map((service) => service.title)

  const items = marqueeItems(source)
  if (!items.length) return null

  return (
    <section
      id="clients"
      className="py-24 md:py-32 bg-background border-t border-white/5 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 mb-16">
        <EditorialHeadline className="max-w-5xl">
          {showingClients
            ? 'We love what we do, which has led us to working with brands who trust us to build it properly.'
            : 'We love what we do — custom software, commerce, and the systems that run quietly behind them.'}
        </EditorialHeadline>
      </div>

      {/* Logo marquee */}
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-20 md:w-32 bg-gradient-to-r from-background to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-20 md:w-32 bg-gradient-to-l from-background to-transparent z-10" />
        <div className="flex animate-marquee">
          {items.map((item, i) => (
            <div
              key={`${item}-${i}`}
              className="flex-shrink-0 mx-10 md:mx-16 flex items-center"
              /* The strip repeats for visual continuity; announcing every copy
                 would read the same list to a screen reader four times over. */
              aria-hidden={i >= source.length}
            >
              <span className="text-2xl md:text-4xl font-display font-bold text-white/15 hover:text-white/30 transition-colors whitespace-nowrap">
                {item}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default ClientsSection
