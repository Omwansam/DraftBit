import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ArrowUpRight, Filter, SearchX } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useSiteData } from '../context/SiteDataContext'
import PageHero from '../components/ui/PageHero'
import ProjectCard from '../components/ui/ProjectCard'
import Seo from '../components/ui/Seo'
import { EditorialLabel } from '../components/ui/SectionHeader'

const ALL = 'All'

const Project = () => {
  const { allProjects } = useSiteData()

  const [activeCategory, setActiveCategory] = useState(ALL)

  /* Categories come from the work itself rather than a hard-coded list: a
     filter that matches nothing is a dead button, and a category added in the
     console would otherwise never appear here. Order is first appearance. */
  const categories = useMemo(() => {
    const counts = new Map([[ALL, allProjects.length]])
    for (const project of allProjects) {
      if (!project.category) continue
      counts.set(project.category, (counts.get(project.category) ?? 0) + 1)
    }
    return [...counts.entries()].map(([name, count]) => ({ name, count }))
  }, [allProjects])

  const filtered =
    activeCategory === ALL
      ? allProjects
      : allProjects.filter((p) => p.category === activeCategory)

  const liveCount = allProjects.filter((p) => p.liveUrl).length
  const disciplines = categories.length - 1

  const summary = [
    { value: allProjects.length, label: 'Projects' },
    { value: liveCount, label: 'Live in production' },
    { value: disciplines, label: disciplines === 1 ? 'Discipline' : 'Disciplines' },
  ].filter((item) => item.value > 0)

  return (
    <div className="min-h-screen bg-background">
      <Seo />

      <PageHero
        label="Projects"
        title="Work we're proud to put our name on."
        description="Selected projects we've delivered for clients—web apps, mobile products, and design systems. Every one built end to end, most of them running in production today."
      >
        {summary.length > 0 && (
          <motion.dl
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10 flex flex-wrap gap-x-12 gap-y-5"
          >
            {summary.map((item) => (
              <div key={item.label}>
                <dd className="text-3xl md:text-4xl font-display font-bold text-foreground leading-none tabular-nums">
                  {item.value}
                </dd>
                <dt className="text-xs uppercase tracking-[0.18em] text-muted-foreground mt-2">{item.label}</dt>
              </div>
            ))}
          </motion.dl>
        )}
      </PageHero>

      {/* Filter bar. Sticks just under the fixed navbar so the filters stay
          reachable while scrolling a long grid. */}
      <div className="sticky top-16 md:top-20 z-30 bg-background/85 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-3 flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground flex-shrink-0 mr-1" aria-hidden="true" />
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar -my-1 py-1" role="tablist" aria-label="Filter projects by category">
            {categories.map(({ name, count }) => {
              const active = activeCategory === name
              return (
                <button
                  key={name}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setActiveCategory(name)}
                  className={`relative px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    active ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground border border-white/10 hover:border-white/20'
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="project-filter-pill"
                      className="absolute inset-0 rounded-full bg-primary"
                      transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                    />
                  )}
                  <span className="relative z-10 inline-flex items-center gap-1.5">
                    {name}
                    <span className={`text-xs tabular-nums ${active ? 'text-primary-foreground/70' : 'text-muted-foreground/60'}`}>
                      {count}
                    </span>
                  </span>
                </button>
              )
            })}
          </div>
          <span className="ml-auto hidden sm:block text-xs text-muted-foreground tabular-nums flex-shrink-0">
            {filtered.length} of {allProjects.length}
          </span>
        </div>
      </div>

      <section className="py-14 md:py-20">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          {filtered.length > 0 ? (
            <motion.div layout className="grid gap-6 md:gap-8 md:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence mode="popLayout" initial={false}>
                {filtered.map((project, i) => (
                  <motion.article
                    key={project.slug}
                    layout
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ duration: 0.4, delay: Math.min(i, 8) * 0.04, ease: [0.22, 1, 0.36, 1] }}
                    className="h-full"
                  >
                    <ProjectCard project={project} index={i} />
                  </motion.article>
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <div className="py-24 text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/5 text-muted-foreground mb-5">
                <SearchX className="w-6 h-6" />
              </div>
              <p className="font-display font-bold text-foreground text-xl mb-2">Nothing here yet</p>
              <p className="text-muted-foreground mb-6">No projects match this category.</p>
              <button
                type="button"
                onClick={() => setActiveCategory(ALL)}
                className="text-sm font-semibold text-primary hover:underline"
              >
                Show all projects
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Closing call to action */}
      <section className="pb-20 md:pb-28 pt-4">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative rounded-3xl overflow-hidden border border-white/10"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-background to-secondary/10" />
            <div className="absolute inset-0 bg-grid opacity-30 [mask-image:linear-gradient(to_right,black,transparent)]" />
            <div className="relative px-8 py-12 md:px-16 md:py-16 grid gap-8 lg:grid-cols-12 lg:items-center">
              <div className="lg:col-span-8">
                <EditorialLabel>Your project next</EditorialLabel>
                <h2 className="editorial-headline mt-4 mb-4 max-w-2xl">Have something in mind? Let&apos;s build it.</h2>
                <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
                  Tell us what you&apos;re trying to ship. We&apos;ll come back with an honest read on scope,
                  timeline, and the right way to build it.
                </p>
              </div>
              <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 lg:items-stretch">
                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-primary text-primary-foreground font-semibold hover:bg-primary/90 hover:glow transition-all group"
                >
                  Start a project
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/services"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full border border-white/10 text-foreground font-semibold hover:border-primary/40 hover:text-primary transition-colors group"
                >
                  What we do
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default Project
