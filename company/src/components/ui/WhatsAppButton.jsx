import React from 'react'
import { MessageCircle } from 'lucide-react'
import { getWhatsAppUrl } from '../../lib/contact'

const WhatsAppButton = () => (
  <a
    href={getWhatsAppUrl()}
    target="_blank"
    rel="noopener noreferrer"
    className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#25D366] text-white shadow-lg hover:scale-110 hover:shadow-xl transition-all flex items-center justify-center group"
    aria-label="Chat on WhatsApp"
  >
    <MessageCircle className="w-7 h-7" fill="currentColor" />
    <span className="absolute right-full mr-3 px-3 py-1.5 rounded-lg bg-background border border-white/10 text-xs font-medium text-foreground whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none hidden sm:block">
      Chat on WhatsApp
    </span>
  </a>
)

export default WhatsAppButton
