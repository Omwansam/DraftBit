import React from 'react'
import { motion } from 'framer-motion'
import { techStack } from '../../data/site'
import SectionHeader from '../ui/SectionHeader'

const TechSection = () => {
  const categories = [...new Set(techStack.map((t) => t.category))]

  return (
    <section id="tech" className="py-24 bg-background relative overflow-hidden border-t border-white/5">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_hsl(var(--primary)/0.06),_transparent_50%)] pointer-events-none" />

      <div className="container mx-auto px-4 md:px-6 relative">
        <SectionHeader
          badge="Technology"
          title="Built With"
          highlight="Modern Tools"
          description="We use industry-leading technologies to deliver robust, scalable, and maintainable solutions."
        />

        <div className="max-w-5xl mx-auto space-y-10">
          {categories.map((category, catIndex) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: catIndex * 0.1 }}
            >
              <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
                {category}
              </h3>
              <div className="flex flex-wrap gap-3">
                {techStack
                  .filter((t) => t.category === category)
                  .map((tech, i) => (
                    <motion.span
                      key={tech.name}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: catIndex * 0.1 + i * 0.05 }}
                      whileHover={{ scale: 1.05, y: -2 }}
                      className="px-5 py-2.5 rounded-xl border border-white/10 bg-white/5 text-foreground font-medium text-sm hover:border-primary/40 hover:bg-primary/10 hover:text-primary transition-colors cursor-default"
                    >
                      {tech.name}
                    </motion.span>
                  ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default TechSection
