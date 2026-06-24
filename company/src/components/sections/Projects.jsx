import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { featuredProjects } from '../../data/site'
import { EditorialLabel, EditorialHeadline } from '../ui/SectionHeader'

const ProjectsSection = () => {
  const [featured, ...rest] = featuredProjects

  return (
    <section id="projects" className="py-24 md:py-32 bg-[hsl(224_71%_3%)] border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <EditorialLabel>Projects</EditorialLabel>
        <EditorialHeadline className="mt-4 mb-16 max-w-3xl">
          Work we&apos;re proud to put our name on.
        </EditorialHeadline>

        {/* Featured project — full width editorial */}
        <Link to={`/projects/${featured.slug}`}>
        <motion.article
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="group relative rounded-3xl overflow-hidden mb-6 min-h-[480px] md:min-h-[560px] block cursor-pointer"
        >
          <img
            src={featured.image}
            alt={featured.title}
            className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-60 group-hover:scale-[1.02] transition-all duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
          <div className="relative h-full flex flex-col justify-end p-8 md:p-12 lg:p-16 min-h-[480px] md:min-h-[560px]">
            <span className="text-xs uppercase tracking-[0.2em] text-primary font-semibold mb-4">
              Featured — {featured.category}
            </span>
            <h3 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-4 max-w-2xl">
              {featured.title}
            </h3>
            <p className="text-lg text-muted-foreground max-w-xl mb-6">
              {featured.description}
            </p>
            <div className="flex flex-wrap gap-2">
              {featured.tags.map((tag) => (
                <span key={tag} className="px-3 py-1 text-xs font-medium border border-white/10 rounded-full text-muted-foreground">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </motion.article>
        </Link>

        {/* Secondary projects row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {rest.map((project, i) => (
            <Link key={project.title} to={`/projects/${project.slug}`}>
            <motion.article
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="group relative rounded-2xl overflow-hidden border border-white/8 min-h-[280px] hover:border-primary/30 transition-colors block h-full"
            >
              <img
                src={project.image}
                alt={project.title}
                className="absolute inset-0 w-full h-full object-cover opacity-35 group-hover:opacity-45 group-hover:scale-105 transition-all duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/20" />
              <div className="relative h-full flex flex-col justify-end p-6">
                <span className="text-xs uppercase tracking-widest text-primary mb-2">{project.category}</span>
                <h3 className="text-xl font-display font-bold text-foreground">{project.title}</h3>
              </div>
            </motion.article>
            </Link>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <Link
            to="/projects"
            className="inline-flex items-center gap-2 text-lg font-semibold text-foreground hover:text-primary transition-colors group"
          >
            View All Projects
            <ArrowUpRight className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

export default ProjectsSection
