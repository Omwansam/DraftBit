import React from 'react'
import { motion } from 'framer-motion'
import { processSteps } from '../../data/site'
import { EditorialLabel, EditorialHeadline } from '../ui/SectionHeader'

const ProcessSection = () => (
  <section id="process" className="py-24 md:py-32 bg-[hsl(224_71%_3%)] border-t border-white/5">
    <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
      <EditorialLabel>How We Work</EditorialLabel>
      <EditorialHeadline className="mt-4 mb-16 max-w-3xl">
        From idea to launch — a process you can trust.
      </EditorialHeadline>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {processSteps.map((item, i) => {
          const Icon = item.icon
          return (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="relative"
            >
              <span className="text-5xl font-display font-bold text-white/5 absolute -top-4 -left-1 select-none">
                {item.step}
              </span>
              <div className="relative pt-8">
                <div className="w-11 h-11 rounded-xl bg-primary/15 flex items-center justify-center mb-5">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-display font-bold text-xl text-foreground mb-3">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  </section>
)

export default ProcessSection
