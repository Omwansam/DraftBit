import React from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Clock, ArrowUpRight, Inbox } from 'lucide-react'
import { motion } from 'framer-motion'
import { useSiteData } from '../context/SiteDataContext'
import PageHero from '../components/ui/PageHero'

const Careers = () => {
  const { careers } = useSiteData()
  const hiring = careers.length > 0

  return (
  <div className="min-h-screen bg-background">
    <PageHero
      label="Careers"
      title={hiring ? 'Join the studio building the future from Nairobi.' : 'No open roles right now.'}
      description={
        hiring
          ? "We're a small, ambitious studio. If you love clean code, great design, and meaningful work—we want to hear from you."
          : "DraftBit is a one-person studio today, so there are no positions open at the moment. That changes as the work grows—and when it does, the roles land here first."
      }
    />

    <section className="py-16 md:py-24">
      <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 space-y-6">
        {hiring ? (
          careers.map((job, i) => (
            <motion.article
              key={job.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="group p-8 rounded-2xl border border-white/8 bg-white/[0.02] hover:border-primary/25 transition-all"
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <span className="text-xs uppercase tracking-widest text-primary font-semibold">{job.department}</span>
                  <h2 className="text-2xl font-display font-bold text-foreground mt-2 mb-3">{job.title}</h2>
                  <p className="text-muted-foreground leading-relaxed mb-4">{job.description}</p>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5"><MapPin className="w-4 h-4" />{job.location}</span>
                    <span className="inline-flex items-center gap-1.5"><Clock className="w-4 h-4" />{job.type}</span>
                  </div>
                </div>
                <Link
                  to={`/contact?role=${job.slug}`}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-white/10 text-sm font-semibold text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all flex-shrink-0"
                >
                  Apply Now
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.article>
          ))
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-10 md:p-14 rounded-2xl border border-white/8 bg-white/[0.02] text-center"
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/25 to-secondary/25 flex items-center justify-center mx-auto mb-6">
              <Inbox className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-2xl font-display font-bold text-foreground mb-3">No positions open</h2>
            <p className="text-muted-foreground leading-relaxed max-w-lg mx-auto">
              There are no vacancies at DraftBit right now. Nothing is being reviewed and no
              applications are pending—but the door is not bolted shut. If you build things
              worth seeing, send them over and you will be first in line when a role opens.
            </p>
          </motion.div>
        )}
      </div>
    </section>

    <section className="py-16 border-t border-white/5 text-center">
      <p className="text-muted-foreground mb-4">
        {hiring
          ? "Don't see a fit? We're always open to meeting talented people."
          : "We're always open to meeting talented people, open role or not."}
      </p>
      <Link to="/contact" className="text-primary font-semibold hover:underline">Send us your portfolio →</Link>
    </section>
  </div>
)
}

export default Careers
