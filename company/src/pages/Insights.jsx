import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { blogPosts } from '../data/site'
import PageHero from '../components/ui/PageHero'

const Insights = () => (
  <div className="min-h-screen bg-background">
    <PageHero
      label="Insights"
      title="Thoughts from the studio."
      description="Engineering, product, and industry perspectives from the DraftBit team."
    />

    <section className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {blogPosts.map((post, i) => (
            <motion.article
              key={post.slug}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <Link to={`/insights/${post.slug}`} className="group block">
                <div className="rounded-2xl overflow-hidden mb-5 aspect-[16/10] border border-white/8">
                  <img src={post.image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                  <span className="text-primary font-semibold uppercase tracking-wider">{post.category}</span>
                  <span>·</span>
                  <time dateTime={post.date}>{new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</time>
                  <span>·</span>
                  <span>{post.readTime}</span>
                </div>
                <h2 className="text-xl font-display font-bold text-foreground group-hover:text-primary transition-colors mb-2">{post.title}</h2>
                <p className="text-muted-foreground line-clamp-3">{post.excerpt}</p>
              </Link>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  </div>
)

export default Insights
