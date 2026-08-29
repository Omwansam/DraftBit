import React from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowUpRight, CheckCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { useSiteData } from '../context/SiteDataContext'
import Seo from '../components/ui/Seo'
import NotFound from './NotFound'

const CaseStudy = () => {
  const { getProjectBySlug, allProjects } = useSiteData()

  const { slug } = useParams()
  const project = getProjectBySlug(slug)

  if (!project) return <NotFound />

  const Icon = project.icon
  const related = allProjects.filter((p) => p.slug !== slug && p.category === project.category).slice(0, 2)
    .concat(allProjects.filter((p) => p.slug !== slug && p.category !== project.category).slice(0, 1))
    .slice(0, 3)

  return (
    <div className="min-h-screen bg-background">
      <Seo title={`${project.title} | DraftBit`} description={project.description} />

      <div className="relative h-[50vh] md:h-[60vh] overflow-hidden">
        <img src={project.image} alt={project.title} className="absolute inset-0 w-full h-full object-cover opacity-40" loading="eager" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/30" />
        <div className="relative h-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 flex flex-col justify-end pb-12 pt-32">
          <Link to="/projects" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" />
            All Projects
          </Link>
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">{project.category} · {project.year}</span>
            <h1 className="text-4xl md:text-6xl font-display font-bold text-foreground mt-3 mb-4">{project.title}</h1>
            <p className="text-lg text-muted-foreground max-w-2xl">{project.description}</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-20">
          <div className="lg:col-span-2 space-y-12">
            {/* A heading with nothing under it reads as a broken page rather than
                as a short one, so each section renders only when it has content.
                Not every project has a written challenge or a list of results. */}
            {[
              { label: 'The Challenge', text: project.challenge },
              { label: 'Our Solution', text: project.solution },
            ]
              .filter((section) => section.text?.trim())
              .map((section) => (
                <section key={section.label}>
                  <h2 className="section-label mb-4">{section.label}</h2>
                  <p className="text-lg text-muted-foreground leading-relaxed whitespace-pre-line">
                    {section.text}
                  </p>
                </section>
              ))}
            {project.results?.length > 0 && (
              <section>
                <h2 className="section-label mb-6">Results</h2>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {project.results.map((result) => (
                    <li key={result} className="flex items-start gap-3 p-4 rounded-xl border border-white/8 bg-white/[0.02]">
                      <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-foreground">{result}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          <aside>
            <div className="p-6 rounded-2xl border border-white/8 bg-white/[0.02] sticky top-28">
              <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center mb-6">
                <Icon className="w-6 h-6 text-primary" />
              </div>
              <dl className="space-y-4 text-sm">
                {[
                  ['Client', project.client],
                  ['Category', project.category],
                  ['Year', project.year],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-muted-foreground mb-1">{label}</dt>
                    <dd className="font-medium text-foreground">{value}</dd>
                  </div>
                ))}
                <div>
                  <dt className="text-muted-foreground mb-2">Technologies</dt>
                  <dd className="flex flex-wrap gap-2">
                    {project.tags.map((tag) => (
                      <span key={tag} className="px-3 py-1 rounded-full text-xs border border-white/10 text-muted-foreground">{tag}</span>
                    ))}
                  </dd>
                </div>
              </dl>
              <Link to="/contact" className="mt-8 w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors">
                Start a Similar Project
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          </aside>
        </div>
      </div>

      {related.length > 0 && (
        <section className="py-16 border-t border-white/5">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
            <h2 className="section-label mb-10">More Projects</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {related.map((p) => (
                <Link key={p.slug} to={`/projects/${p.slug}`} className="group rounded-2xl overflow-hidden border border-white/8 hover:border-primary/30 transition-colors">
                  <div className="aspect-video overflow-hidden">
                    <img src={p.image} alt={p.title} className="w-full h-full object-cover opacity-50 group-hover:opacity-60 group-hover:scale-105 transition-all duration-500" loading="lazy" />
                  </div>
                  <div className="p-5">
                    <span className="text-xs text-primary uppercase tracking-wider">{p.category}</span>
                    <h3 className="font-display font-bold text-foreground mt-1 group-hover:text-primary transition-colors">{p.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

export default CaseStudy
