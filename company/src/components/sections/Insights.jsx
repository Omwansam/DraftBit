import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { useSiteData } from '../../context/SiteDataContext'
import { EditorialLabel, EditorialHeadline } from '../ui/SectionHeader'

const InsightsSection = () => {
  const { blogPosts } = useSiteData()

  return (
  <section id="insights" className="py-24 md:py-32 bg-background border-t border-white/5">
    <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16">
        <div>
          <EditorialLabel>Insights</EditorialLabel>
          <EditorialHeadline className="mt-4 max-w-2xl">
            Thoughts from the studio.
          </EditorialHeadline>
        </div>
        <Link
          to="/insights"
          className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-primary hover:underline flex-shrink-0"
        >
          All Articles
          <ArrowUpRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {blogPosts.map((post, i) => (
          <motion.article
            key={post.slug}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
          >
            <Link to={`/insights/${post.slug}`} className="group block">
              <div className="rounded-2xl overflow-hidden mb-5 aspect-[16/10] border border-white/8">
                <img
                  src={post.image}
                  alt=""
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <span className="text-xs uppercase tracking-widest text-primary font-semibold">
                {post.category}
              </span>
              <h3 className="text-xl font-display font-bold text-foreground mt-2 mb-2 group-hover:text-primary transition-colors">
                {post.title}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{post.excerpt}</p>
              <span className="text-xs text-muted-foreground">{post.readTime}</span>
            </Link>
          </motion.article>
        ))}
      </div>
    </div>
  </section>
)
}

export default InsightsSection
