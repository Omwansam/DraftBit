import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { whoWeAre } from '../../data/site'
import { useSiteData } from '../../context/SiteDataContext'
import { EditorialLabel, EditorialHeadline } from '../ui/SectionHeader'

const WhoWeAre = () => {
  const { mission, vision } = useSiteData()

  const [expanded, setExpanded] = useState(false)
  const previewLength = 180
  const needsTruncate = whoWeAre.story.length > previewLength
  const displayText = expanded || !needsTruncate
    ? whoWeAre.story
    : `${whoWeAre.story.slice(0, previewLength).trim()}...`

  return (
    <section id="who-we-are" className="py-24 md:py-32 bg-background border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
          {/* Main story */}
          <div className="lg:col-span-7">
            <EditorialLabel>{whoWeAre.label}</EditorialLabel>
            <EditorialHeadline className="mt-4 mb-8">
              {whoWeAre.headline}
            </EditorialHeadline>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-6"
            >
              {displayText}
            </motion.p>

            {needsTruncate && !expanded && (
              <button
                type="button"
                onClick={() => setExpanded(true)}
                className="text-primary hover:underline text-sm font-medium mb-6"
              >
                Read more
              </button>
            )}

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <Link
                to="/about"
                className="inline-flex items-center gap-2 text-foreground font-semibold group hover:text-primary transition-colors"
              >
                More About DraftBit
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>

          {/* Mission & Vision */}
          <div className="lg:col-span-5 flex flex-col gap-8 lg:pt-16">
            {[mission, vision].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                className="p-8 rounded-2xl border border-white/8 bg-white/[0.02] hover:border-primary/20 transition-colors"
              >
                <h3 className="section-label mb-4 !text-left">{item.label}</h3>
                <p className="text-muted-foreground leading-relaxed">{item.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default WhoWeAre
