import React from 'react'
import { motion } from 'framer-motion'
import { passions } from '../../data/site'
import { EditorialLabel, EditorialHeadline } from '../ui/SectionHeader'

const PassionateAbout = () => {
  return (
    <section id="passionate" className="py-24 md:py-32 bg-[hsl(224_71%_3%)] border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <EditorialLabel>We Are Passionate About</EditorialLabel>
        <EditorialHeadline className="mt-4 mb-16 max-w-4xl">
          The craft of building technology that actually matters.
        </EditorialHeadline>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-white/10 rounded-2xl overflow-hidden">
          {passions.map((item, i) => {
            const Icon = item.icon
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                className="group bg-background p-8 md:p-10 hover:bg-white/[0.03] transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-display font-bold text-foreground mb-3">
                  {item.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default PassionateAbout
