import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Zap } from 'lucide-react'
import { engagementModels } from '../../data/site'
import { EditorialLabel, EditorialHeadline } from '../ui/SectionHeader'

const EngagementSection = () => (
  <section id="engagement" className="py-24 md:py-32 bg-[hsl(224_71%_3%)] border-t border-white/5">
    <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
      <EditorialLabel>How We Partner</EditorialLabel>
      <EditorialHeadline className="mt-4 mb-16 max-w-3xl">
        Flexible engagement models for every stage.
      </EditorialHeadline>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {engagementModels.map((model, i) => (
          <motion.div
            key={model.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="p-8 rounded-2xl border border-white/8 bg-white/[0.02] hover:border-primary/25 transition-colors"
          >
            <span className="text-3xl mb-4 block">{model.icon}</span>
            <h3 className="font-display font-bold text-xl text-foreground mb-3">{model.title}</h3>
            <p className="text-muted-foreground leading-relaxed">{model.description}</p>
          </motion.div>
        ))}
      </div>

      <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link
          to="/contact"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-primary text-primary-foreground font-semibold hover:bg-primary/90 hover:glow transition-all"
        >
          <Zap className="w-5 h-5" />
          Discuss Your Project
        </Link>
      </div>
    </div>
  </section>
)

export default EngagementSection
