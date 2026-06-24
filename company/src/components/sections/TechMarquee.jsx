import React from 'react'
import { techStack } from '../../data/site'

const TechMarquee = () => {
  const doubled = [...techStack, ...techStack]

  return (
    <section className="py-16 border-t border-white/5 bg-background overflow-hidden">
      <p className="text-center text-xs uppercase tracking-[0.25em] text-muted-foreground mb-8">
        Technologies we work with
      </p>
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-background to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background to-transparent z-10" />
        <div className="flex animate-marquee-slow">
          {doubled.map((tech, i) => (
            <span
              key={`${tech.name}-${i}`}
              className="flex-shrink-0 mx-6 px-5 py-2 rounded-full border border-white/8 text-sm font-medium text-muted-foreground whitespace-nowrap"
            >
              {tech.name}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}

export default TechMarquee
