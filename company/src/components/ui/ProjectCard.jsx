import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'

const MAX_TAGS = 4

/**
 * One project in a grid. Used by the projects index and by the "more
 * projects" row on a case study, so the two stay visually in step.
 *
 * Every field except slug and title is optional: live records straight out of
 * the console can have no image, tags or year yet, and the card has to read as
 * finished rather than as half-loaded.
 */
const ProjectCard = ({ project, index = 0, compact = false }) => {
  const Icon = project.icon
  const tags = project.tags ?? []
  const overflow = tags.length - MAX_TAGS

  return (
    <Link
      to={`/projects/${project.slug}`}
      className="group relative flex flex-col h-full rounded-3xl overflow-hidden border border-white/8 bg-white/[0.02] hover:border-primary/30 hover:bg-white/[0.04] transition-colors duration-300"
    >
      <div className={`relative overflow-hidden ${compact ? 'aspect-[16/10]' : 'aspect-[16/10] md:aspect-[3/2]'}`}>
        {project.image ? (
          <img
            src={project.image}
            alt={project.imageAlt || project.title}
            loading="lazy"
            className="w-full h-full object-cover opacity-70 group-hover:opacity-95 group-hover:scale-[1.04] transition-all duration-700 ease-out"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 via-background to-secondary/20" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent" />

        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <span className="font-display text-xs font-semibold tracking-[0.2em] text-foreground/60">
            {String(index + 1).padStart(2, '0')}
          </span>
          {project.liveUrl && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[0.65rem] font-semibold uppercase tracking-[0.18em] bg-background/70 backdrop-blur border border-white/10 text-green-400">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              Live
            </span>
          )}
        </div>

        {Icon && (
          <div className="absolute bottom-4 left-4 w-10 h-10 rounded-xl bg-background/70 backdrop-blur border border-white/10 flex items-center justify-center">
            <Icon className="w-5 h-5 text-primary" />
          </div>
        )}
        <div className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
          <ArrowUpRight className="w-4 h-4" />
        </div>
      </div>

      <div className={`flex flex-col flex-1 ${compact ? 'p-5' : 'p-6'}`}>
        <div className="flex items-center gap-2 text-[0.7rem] uppercase tracking-[0.18em] font-semibold mb-3">
          <span className="text-primary">{project.category}</span>
          {project.year && (
            <>
              <span className="text-white/20">/</span>
              <span className="text-muted-foreground">{project.year}</span>
            </>
          )}
        </div>
        <h3 className={`font-display font-bold text-foreground group-hover:text-primary transition-colors ${compact ? 'text-lg' : 'text-xl md:text-2xl'} mb-2`}>
          {project.title}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{project.description}</p>

        {!compact && tags.length > 0 && (
          <div className="mt-auto pt-5 flex flex-wrap gap-2">
            {tags.slice(0, MAX_TAGS).map((tag) => (
              <span key={tag} className="px-2.5 py-1 text-xs border border-white/10 rounded-full text-muted-foreground">
                {tag}
              </span>
            ))}
            {overflow > 0 && (
              <span className="px-2.5 py-1 text-xs rounded-full bg-white/5 text-muted-foreground">+{overflow}</span>
            )}
          </div>
        )}
      </div>
    </Link>
  )
}

export default ProjectCard
