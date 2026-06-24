import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Linkedin } from 'lucide-react'
import { team } from '../../data/site'
import { EditorialLabel, EditorialHeadline } from '../ui/SectionHeader'

const TeamSection = () => (
  <section id="team" className="py-24 md:py-32 bg-background border-t border-white/5">
    <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
      <EditorialLabel>The Team</EditorialLabel>
      <EditorialHeadline className="mt-4 mb-16 max-w-3xl">
        The minds behind the code.
      </EditorialHeadline>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {team.map((member, i) => (
          <motion.div
            key={member.name}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08, duration: 0.5 }}
            className="group p-6 rounded-2xl border border-white/8 bg-white/[0.02] hover:border-primary/25 hover:bg-white/[0.04] transition-all"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center text-lg font-bold text-foreground mb-5 group-hover:scale-105 transition-transform">
              {member.avatar}
            </div>
            <h3 className="font-display font-bold text-lg text-foreground mb-1">{member.name}</h3>
            <p className="text-sm text-primary mb-2">{member.role}</p>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">{member.focus}</p>
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
          </motion.div>
        ))}
      </div>

      <div className="mt-12 text-center">
        <Link
          to="/careers"
          className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-primary hover:underline"
        >
          We&apos;re hiring — View open roles →
        </Link>
      </div>
    </div>
  </section>
)

export default TeamSection
