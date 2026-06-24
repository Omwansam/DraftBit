import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { faqs } from '../../data/site'
import { EditorialLabel, EditorialHeadline } from '../ui/SectionHeader'

const FaqSection = () => {
  const [openIndex, setOpenIndex] = useState(null)

  return (
    <section id="faq" className="py-24 md:py-32 bg-[hsl(224_71%_3%)] border-t border-white/5">
      <div className="max-w-3xl mx-auto px-6 sm:px-8 lg:px-12">
        <EditorialLabel className="justify-center">FAQ</EditorialLabel>
        <EditorialHeadline className="mt-4 mb-12 text-center">
          Questions? We&apos;ve got answers.
        </EditorialHeadline>

        <div className="space-y-2">
          {faqs.map((faq, i) => (
            <div key={faq.question} className="border-b border-white/8">
              <button
                type="button"
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between gap-4 py-5 text-left group"
                aria-expanded={openIndex === i}
              >
                <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-muted-foreground flex-shrink-0 transition-transform duration-300 ${
                    openIndex === i ? 'rotate-180 text-primary' : ''
                  }`}
                />
              </button>
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <p className="pb-5 text-muted-foreground leading-relaxed">{faq.answer}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default FaqSection
