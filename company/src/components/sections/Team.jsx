import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Linkedin } from 'lucide-react'
import { useSiteData } from '../../context/SiteDataContext'
import { EditorialLabel, EditorialHeadline } from '../ui/SectionHeader'

const TeamSection = () => {
  const { team, careers } = useSiteData()

  /* One person is the normal case here, and a lone card stranded in a
     four-column grid reads as three people failing to load. The grid only
     opens up once there is more than one record to put in it. */
  const solo = team.length === 1
  const gridClass = solo
    ? 'grid grid-cols-1 max-w-2xl'
    : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'

  const hiring = careers.length > 0

  return (
  <section id="team" className="py-24 md:py-32 bg-background border-t border-white/5">
    <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
      <EditorialLabel>{solo ? 'The Founder' : 'The Team'}</EditorialLabel>
      <EditorialHeadline className="mt-4 mb-16 max-w-3xl">
        {solo ? 'The mind behind the code.' : 'The minds behind the code.'}
      </EditorialHeadline>

      <div className={`${gridClass} gap-6`}>
        {team.map((member, i) => (
          <motion.div
            key={member.name}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08, duration: 0.5 }}
            className={`group rounded-2xl border border-white/8 bg-white/[0.02] hover:border-primary/25 hover:bg-white/[0.04] transition-all ${solo ? 'p-8 md:p-10' : 'p-6'}`}
          >
            <div className={`rounded-2xl bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center font-bold text-foreground group-hover:scale-105 transition-transform ${solo ? 'w-20 h-20 text-2xl mb-6' : 'w-16 h-16 text-lg mb-5'}`}>
              {member.avatar}
            </div>
            <h3 className={`font-display font-bold text-foreground mb-1 ${solo ? 'text-2xl' : 'text-lg'}`}>{member.name}</h3>
            <p className="text-sm text-primary mb-2">{member.role}</p>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">{member.focus}</p>
            {/* A "#" href is the placeholder the content files ship, and it scrolls
                the page to the top instead of going anywhere. No link beats a
                broken one, so the chip only renders once a real profile is set. */}
            {member.linkedin && member.linkedin !== '#' && (
              <a
                href={member.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
                aria-label={`${member.name} on LinkedIn`}
              >
                <Linkedin className="w-4 h-4" />
                LinkedIn
              </a>
            )}
          </motion.div>
        ))}
      </div>

      <div className="mt-12 text-center">
        {hiring ? (
          <Link
            to="/careers"
            className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-primary hover:underline"
          >
            We&apos;re hiring — View open roles →
          </Link>
        ) : (
          <p className="text-sm text-muted-foreground">
            No open roles right now.{' '}
            <Link to="/careers" className="text-primary hover:underline">
              Introduce yourself anyway →
            </Link>
          </p>
        )}
      </div>
    </div>
  </section>
)
}

export default TeamSection
