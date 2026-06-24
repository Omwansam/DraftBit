import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, Filter } from 'lucide-react'
import { motion } from 'framer-motion'
import { allProjects } from '../data/site'
import PageHero from '../components/ui/PageHero'

const categories = ['All', 'Web', 'Mobile', 'Design', 'Dashboard']

const Project = () => {
  const [activeCategory, setActiveCategory] = useState('All')

  const filtered =
    activeCategory === 'All'
      ? allProjects
      : allProjects.filter((p) => p.category === activeCategory)

  return (
    <div className="min-h-screen bg-background">
      <PageHero
        label="Projects"
        title="Work we're proud to put our name on."
        description="Selected projects we've delivered for clients—web apps, mobile products, and design systems."
      />

      <section className="py-8 px-6 sm:px-8 lg:px-12 border-b border-white/5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeCategory === cat
                  ? 'bg-primary text-primary-foreground'
                  : 'border border-white/10 text-muted-foreground hover:text-foreground'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="grid gap-8 md:grid-cols-2">
            {filtered.map((project, i) => {
              const Icon = project.icon
              return (
                <motion.article
                  key={project.slug}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    to={`/projects/${project.slug}`}
                    className="group block rounded-2xl overflow-hidden border border-white/8 hover:border-primary/30 transition-colors"
                  >
                    <div className="relative aspect-[16/9] overflow-hidden">
                      <img
                        src={project.image}
                        alt={project.title}
                        className="w-full h-full object-cover opacity-50 group-hover:opacity-60 group-hover:scale-105 transition-all duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                        <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <span className="text-xs uppercase tracking-wider text-muted-foreground">{project.category}</span>
                      </div>
                    </div>
                    <div className="p-6">
                      <h2 className="text-xl font-display font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                        {project.title}
                      </h2>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{project.description}</p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {project.tags.map((tag) => (
                          <span key={tag} className="px-2 py-0.5 text-xs border border-white/10 rounded-full text-muted-foreground">{tag}</span>
                        ))}
                      </div>
                      <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
                        View case study
                        <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      </span>
                    </div>
                  </Link>
                </motion.article>
              )
            })}
          </div>
        </div>
      </section>

      <section className="py-16 border-t border-white/5 text-center">
        <p className="text-muted-foreground mb-6">Have a project in mind?</p>
        <Link to="/contact" className="inline-flex px-8 py-4 rounded-full bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors">
          Get in touch
        </Link>
      </section>
    </div>
  )
}

export default Project
