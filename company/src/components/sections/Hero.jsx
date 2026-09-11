import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowDown, ArrowRight, ArrowUpRight, MapPin } from 'lucide-react'
import { useSiteData } from '../../context/SiteDataContext'
import AnimatedCounter from '../ui/AnimatedCounter'

const ease = [0.22, 1, 0.36, 1]

const reveal = {
  hidden: { opacity: 0, y: 32 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, delay: 0.1 + i * 0.1, ease },
  }),
}

/**
 * The most recent featured project, shown as a card on large screens and as a
 * slim row underneath the copy everywhere else. Two elements rather than one
 * responsive one: the card needs ~300px of height that a phone viewport does
 * not have to spare, and the row would look lost in the desktop grid.
 */
const Spotlight = ({ project }) => {
  if (!project) return null

  const meta = [project.category, project.year].filter(Boolean).join(' · ')

  return (
    <>
      {/* Desktop card */}
      <motion.div custom={6} variants={reveal} initial="hidden" animate="visible" className="hidden lg:block">
        <Link
          to={`/projects/${project.slug}`}
          className="group relative block rounded-3xl overflow-hidden border border-white/10 bg-white/[0.02] shadow-2xl shadow-black/40 hover:border-primary/40 transition-colors duration-300"
        >
          <div className="relative aspect-[4/3] overflow-hidden">
            {project.image ? (
              <img
                src={project.image}
                alt={project.imageAlt || project.title}
                className="w-full h-full object-cover opacity-75 group-hover:opacity-95 group-hover:scale-105 transition-all duration-700 ease-out"
                loading="eager"
                fetchPriority="high"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/20 via-background to-secondary/20" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />

            <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
              <span className="px-3 py-1 rounded-full text-[0.65rem] font-semibold uppercase tracking-[0.2em] bg-background/70 backdrop-blur border border-white/10 text-foreground">
                Latest work
              </span>
              {project.liveUrl && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[0.65rem] font-semibold uppercase tracking-[0.2em] bg-background/70 backdrop-blur border border-white/10 text-green-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  Live
                </span>
              )}
            </div>
          </div>

          <div className="absolute inset-x-0 bottom-0 p-6 xl:p-7">
            {meta && (
              <span className="text-[0.65rem] uppercase tracking-[0.2em] text-primary font-semibold">{meta}</span>
            )}
            <h2 className="text-2xl xl:text-3xl font-display font-bold text-foreground mt-2 mb-2 group-hover:text-primary transition-colors">
              {project.title}
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-4">{project.description}</p>
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-foreground">
              View case study
              <ArrowUpRight className="w-4 h-4 text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </span>
          </div>
        </Link>
      </motion.div>

      {/* Compact row for phones and tablets */}
      <motion.div custom={6} variants={reveal} initial="hidden" animate="visible" className="lg:hidden">
        <Link
          to={`/projects/${project.slug}`}
          className="group flex items-center gap-4 p-3 pr-4 rounded-2xl border border-white/10 bg-white/[0.02] hover:border-primary/40 transition-colors"
        >
          <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-primary/20 to-secondary/20">
            {project.image && (
              <img src={project.image} alt="" className="w-full h-full object-cover opacity-80" loading="eager" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[0.65rem] uppercase tracking-[0.2em] text-primary font-semibold flex items-center gap-2">
              Latest work
              {project.liveUrl && <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />}
            </p>
            <p className="font-display font-bold text-foreground truncate">{project.title}</p>
            {meta && <p className="text-xs text-muted-foreground truncate">{meta}</p>}
          </div>
          <ArrowUpRight className="w-5 h-5 text-muted-foreground group-hover:text-primary flex-shrink-0 transition-colors" />
        </Link>
      </motion.div>
    </>
  )
}

const Hero = () => {
  const { siteConfig, stats, featuredProjects } = useSiteData()
  const spotlight = featuredProjects[0]

  const lines = [
    <>We are <span className="text-gradient">{siteConfig.name}</span></>,
    <>Africa&apos;s Bold Tech Studio</>,
    <>With Sharp Code &amp;</>,
    <>A Builder&apos;s Mind.</>,
  ]

  return (
    <section className="hero-viewport relative w-full flex flex-col overflow-hidden bg-background">
      {/* Backdrop: faint grid fading out at the edges, two slow-drifting glows */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute inset-0 bg-grid opacity-40 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_40%,black_20%,transparent_100%)]" />
        <div className="absolute -top-40 -right-32 w-[38rem] h-[38rem] rounded-full bg-primary/10 blur-[140px] animate-float-slow" />
        <div className="absolute -bottom-40 -left-32 w-[30rem] h-[30rem] rounded-full bg-secondary/10 blur-[130px] animate-float-slower" />
      </div>

      {/* Main content: centred in whatever height is left between the fixed
          navbar (h-16 / h-20) and the stats strip below. */}
      <div className="relative z-10 flex-1 flex items-center pt-24 md:pt-28 pb-8 md:pb-10">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          <div className="lg:col-span-7">
            {/* Eyebrow */}
            <motion.div
              custom={0}
              variants={reveal}
              initial="hidden"
              animate="visible"
              className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs sm:text-sm text-muted-foreground mb-6 md:mb-8"
            >
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-primary" />
                {siteConfig.location}
              </span>
              <span className="hidden sm:inline text-white/20">/</span>
              <span className="inline-flex items-center gap-2">
                <span className="relative flex w-2 h-2">
                  <span className="absolute inline-flex w-full h-full rounded-full bg-green-400 opacity-75 animate-ping" />
                  <span className="relative inline-flex w-2 h-2 rounded-full bg-green-400" />
                </span>
                Available for new projects
              </span>
            </motion.div>

            {/* Giant Hello */}
            <motion.h1
              custom={1}
              variants={reveal}
              initial="hidden"
              animate="visible"
              className="hero-greeting mb-6 md:mb-8"
            >
              Hello<span className="text-primary">.</span>
            </motion.h1>

            {/* Narrative lines */}
            <div className="space-y-0.5 md:space-y-1 mb-8 md:mb-10">
              {lines.map((line, i) => (
                <motion.p
                  key={i}
                  custom={i + 2}
                  variants={reveal}
                  initial="hidden"
                  animate="visible"
                  className="hero-line text-foreground/90"
                >
                  {line}
                </motion.p>
              ))}
            </div>

            {/* Actions */}
            <motion.div
              custom={6}
              variants={reveal}
              initial="hidden"
              animate="visible"
              className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4"
            >
              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-primary text-primary-foreground font-semibold hover:bg-primary/90 hover:glow transition-all group"
              >
                Start a project
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/projects"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full border border-white/10 text-foreground font-semibold hover:border-primary/40 hover:text-primary transition-colors group"
              >
                See our work
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
            </motion.div>
          </div>

          <div className="lg:col-span-5">
            <Spotlight project={spotlight} />
          </div>
        </div>
      </div>

      {/* Bottom strip: counted stats on the left, scroll cue on the right */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.8 }}
        className="relative z-10 border-t border-white/8 bg-background/40 backdrop-blur-sm"
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-5 md:py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <dl className="grid grid-cols-2 sm:flex sm:flex-wrap gap-x-10 lg:gap-x-14 gap-y-4">
            {stats.slice(0, 4).map((stat) => (
              <div key={stat.label}>
                <dt className="sr-only">{stat.label}</dt>
                <dd className="text-2xl md:text-3xl font-display font-bold text-foreground leading-none">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </dd>
                <dd className="text-[0.7rem] md:text-xs uppercase tracking-[0.18em] text-muted-foreground mt-1.5">
                  {stat.label}
                </dd>
              </div>
            ))}
          </dl>

          <a
            href="#who-we-are"
            className="hidden sm:flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors group flex-shrink-0"
            aria-label="Scroll down"
          >
            <span className="text-xs uppercase tracking-[0.25em] font-medium">Scroll</span>
            <span className="flex items-center justify-center w-10 h-10 rounded-full border border-white/10 group-hover:border-primary/40 transition-colors">
              <ArrowDown className="w-4 h-4 animate-bounce" />
            </span>
          </a>
        </div>
      </motion.div>
    </section>
  )
}

export default Hero
