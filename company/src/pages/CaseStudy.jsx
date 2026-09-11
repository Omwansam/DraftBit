import React from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, Check, ChevronRight, ExternalLink } from 'lucide-react'
import { motion } from 'framer-motion'
import { useSiteData } from '../context/SiteDataContext'
import Seo from '../components/ui/Seo'
import ProjectCard from '../components/ui/ProjectCard'
import { EditorialLabel, EditorialHeadline } from '../components/ui/SectionHeader'
import NotFound from './NotFound'

const ease = [0.22, 1, 0.36, 1]

/** "https://www.fibicommunity.org/x" -> "fibicommunity.org"; null when unparseable. */
const hostOf = (url) => {
  if (!url) return null
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return null
  }
}

const Reveal = ({ children, className = '', delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-60px' }}
    transition={{ duration: 0.6, delay, ease }}
    className={className}
  >
    {children}
  </motion.div>
)

const CaseStudy = () => {
  const { getProjectBySlug, allProjects } = useSiteData()

  const { slug } = useParams()
  const project = getProjectBySlug(slug)

  if (!project) return <NotFound />

  const Icon = project.icon
  const liveHost = hostOf(project.liveUrl)
  const tags = project.tags ?? []
  const results = project.results ?? []

  const position = allProjects.findIndex((p) => p.slug === slug)
  const previous = position > 0 ? allProjects[position - 1] : null
  const next = position >= 0 && position < allProjects.length - 1 ? allProjects[position + 1] : null

  const related = allProjects.filter((p) => p.slug !== slug && p.category === project.category).slice(0, 2)
    .concat(allProjects.filter((p) => p.slug !== slug && p.category !== project.category).slice(0, 1))
    .slice(0, 3)

  /* A heading with nothing under it reads as a broken page rather than as a
     short one, so each section renders only when it has content. Not every
     project has a written challenge or a list of results. */
  const narrative = [
    { label: 'The Challenge', text: project.challenge },
    { label: 'Our Solution', text: project.solution },
  ].filter((section) => section.text?.trim())

  const facts = [
    ['Client', project.client],
    ['Role', project.role],
    ['Category', project.category],
    ['Year', project.year],
  ].filter(([, value]) => value)

  const hasBody = narrative.length > 0 || results.length > 0

  return (
    <div className="min-h-screen bg-background">
      <Seo title={`${project.title} | DraftBit`} description={project.description} />

      {/* Hero */}
      <header className="relative min-h-[72vh] md:min-h-[80vh] flex flex-col overflow-hidden">
        {project.image ? (
          <motion.img
            initial={{ scale: 1.08, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.4, ease }}
            src={project.image}
            alt={project.imageAlt || project.title}
            className="absolute inset-0 w-full h-full object-cover opacity-50"
            loading="eager"
            fetchPriority="high"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-secondary/20" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-background/20 to-transparent" />

        <div className="relative flex-1 flex flex-col justify-end max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 w-full pt-32 md:pt-40 pb-10 md:pb-14">
          <motion.nav
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            aria-label="Breadcrumb"
            className="flex items-center gap-2 text-sm text-muted-foreground mb-8"
          >
            <Link to="/projects" className="inline-flex items-center gap-1.5 hover:text-primary transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Projects
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-white/30" aria-hidden="true" />
            <span className="text-foreground/80 truncate">{project.title}</span>
          </motion.nav>

          <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1, ease }}>
            <div className="flex flex-wrap items-center gap-2.5 mb-6">
              <span className="px-3 py-1 rounded-full text-[0.65rem] font-semibold uppercase tracking-[0.2em] bg-primary/15 border border-primary/30 text-primary">
                {project.category}
              </span>
              {project.year && (
                <span className="px-3 py-1 rounded-full text-[0.65rem] font-semibold uppercase tracking-[0.2em] bg-background/60 backdrop-blur border border-white/10 text-muted-foreground">
                  {project.year}
                </span>
              )}
              {project.liveUrl && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[0.65rem] font-semibold uppercase tracking-[0.2em] bg-background/60 backdrop-blur border border-white/10 text-green-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  Live in production
                </span>
              )}
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold tracking-tight text-foreground max-w-4xl mb-6">
              {project.title}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed">{project.description}</p>

            <div className="mt-8 flex flex-wrap gap-3">
              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-semibold hover:bg-primary/90 hover:glow transition-all group"
                >
                  Visit live site
                  <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </a>
              )}
              {hasBody && (
                <a
                  href="#case-study"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-white/10 bg-background/40 backdrop-blur text-foreground font-semibold hover:border-primary/40 hover:text-primary transition-colors group"
                >
                  Read the case study
                  <ArrowDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
                </a>
              )}
            </div>
          </motion.div>
        </div>

        {facts.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.7 }}
            className="relative border-t border-white/8 bg-background/60 backdrop-blur-sm"
          >
            <dl className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-5 md:py-6 grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-5">
              {facts.map(([label, value]) => (
                <div key={label} className="min-w-0">
                  <dt className="text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground mb-1.5">{label}</dt>
                  <dd className="font-medium text-foreground leading-snug break-words">{value}</dd>
                </div>
              ))}
            </dl>
          </motion.div>
        )}
      </header>

      {/* Body */}
      <div id="case-study" className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16 md:py-24 scroll-mt-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          <div className="lg:col-span-8 space-y-16 md:space-y-20">
            {narrative.map((section, i) => (
              <Reveal key={section.label}>
                <section>
                  <div className="flex items-center gap-4 mb-6">
                    <span className="font-display text-sm font-semibold text-primary/60 tabular-nums">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <h2 className="section-label">{section.label}</h2>
                  </div>
                  <p className="text-lg text-muted-foreground leading-relaxed whitespace-pre-line max-w-3xl">
                    {section.text}
                  </p>
                </section>
              </Reveal>
            ))}

            {results.length > 0 && (
              <Reveal>
                <section>
                  <div className="flex items-center gap-4 mb-8">
                    <span className="font-display text-sm font-semibold text-primary/60 tabular-nums">
                      {String(narrative.length + 1).padStart(2, '0')}
                    </span>
                    <h2 className="section-label">Results</h2>
                  </div>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {results.map((result, i) => (
                      <motion.li
                        key={result}
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: i * 0.06, ease }}
                        className="flex items-start gap-4 p-5 rounded-2xl border border-white/8 bg-white/[0.02] hover:border-primary/25 hover:bg-white/[0.04] transition-colors"
                      >
                        <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/15 text-primary flex items-center justify-center">
                          <Check className="w-4 h-4" strokeWidth={2.5} />
                        </span>
                        <span className="text-foreground leading-snug pt-1">{result}</span>
                      </motion.li>
                    ))}
                  </ul>
                </section>
              </Reveal>
            )}

            {!hasBody && (
              <div className="p-8 rounded-2xl border border-dashed border-white/10 text-muted-foreground">
                The full write-up for this project is on its way. In the meantime, the details on the right
                cover what was built and with what.
              </div>
            )}
          </div>

          <aside className="lg:col-span-4">
            <div className="lg:sticky lg:top-28 space-y-4">
              <Reveal delay={0.1}>
                <div className="p-6 md:p-7 rounded-3xl border border-white/8 bg-white/[0.02]">
                  <div className="flex items-center gap-4 mb-6">
                    {Icon && (
                      <div className="w-12 h-12 rounded-2xl bg-primary/15 border border-primary/20 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">Project</p>
                      <p className="font-display font-bold text-foreground truncate">{project.title}</p>
                    </div>
                  </div>

                  {facts.length > 0 && (
                    <dl className="divide-y divide-white/5 border-y border-white/5">
                      {facts.map(([label, value]) => (
                        <div key={label} className="flex items-baseline justify-between gap-4 py-3 text-sm">
                          <dt className="text-muted-foreground flex-shrink-0">{label}</dt>
                          <dd className="font-medium text-foreground text-right">{value}</dd>
                        </div>
                      ))}
                    </dl>
                  )}

                  {tags.length > 0 && (
                    <div className="mt-6">
                      <p className="text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground mb-3">Technologies</p>
                      <div className="flex flex-wrap gap-2">
                        {tags.map((tag) => (
                          <span key={tag} className="px-3 py-1 rounded-full text-xs border border-white/10 text-muted-foreground">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-7 space-y-3">
                    {project.liveUrl && (
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full inline-flex items-center justify-between gap-3 px-5 py-3 rounded-full border border-white/10 text-foreground font-medium hover:border-primary/40 hover:text-primary transition-colors group"
                      >
                        <span className="truncate">{liveHost ?? 'Visit live site'}</span>
                        <ExternalLink className="w-4 h-4 flex-shrink-0 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      </a>
                    )}
                    <Link
                      to="/contact"
                      className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors group"
                    >
                      Start a similar project
                      <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </Link>
                  </div>
                </div>
              </Reveal>

              <Link
                to="/projects"
                className="inline-flex items-center gap-2 px-2 text-sm text-muted-foreground hover:text-primary transition-colors group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                Back to all projects
              </Link>
            </div>
          </aside>
        </div>
      </div>

      {/* Previous / next */}
      {(previous || next) && (
        <nav aria-label="Adjacent projects" className="border-t border-white/5">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/5">
            {previous ? (
              <Link to={`/projects/${previous.slug}`} className="group py-8 md:py-10 md:pr-10 flex items-center gap-5">
                <span className="w-11 h-11 rounded-full border border-white/10 flex items-center justify-center flex-shrink-0 group-hover:border-primary/40 group-hover:text-primary transition-colors">
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                </span>
                <span className="min-w-0">
                  <span className="block text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground mb-1">Previous</span>
                  <span className="block font-display font-bold text-foreground group-hover:text-primary transition-colors truncate">
                    {previous.title}
                  </span>
                </span>
              </Link>
            ) : (
              <div className="hidden md:block" />
            )}
            {next && (
              <Link to={`/projects/${next.slug}`} className="group py-8 md:py-10 md:pl-10 flex items-center justify-end gap-5 text-right">
                <span className="min-w-0">
                  <span className="block text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground mb-1">Next</span>
                  <span className="block font-display font-bold text-foreground group-hover:text-primary transition-colors truncate">
                    {next.title}
                  </span>
                </span>
                <span className="w-11 h-11 rounded-full border border-white/10 flex items-center justify-center flex-shrink-0 group-hover:border-primary/40 group-hover:text-primary transition-colors">
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </Link>
            )}
          </div>
        </nav>
      )}

      {related.length > 0 && (
        <section className="py-16 md:py-24 border-t border-white/5 bg-[hsl(224_71%_3%)]">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
            <div className="flex flex-wrap items-end justify-between gap-6 mb-10 md:mb-12">
              <div>
                <EditorialLabel>More Projects</EditorialLabel>
                <EditorialHeadline className="mt-4">Other work you might like.</EditorialHeadline>
              </div>
              <Link
                to="/projects"
                className="inline-flex items-center gap-2 font-semibold text-foreground hover:text-primary transition-colors group"
              >
                View all projects
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {related.map((p, i) => (
                <Reveal key={p.slug} delay={i * 0.08} className="h-full">
                  <ProjectCard project={p} index={i} compact />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

export default CaseStudy
