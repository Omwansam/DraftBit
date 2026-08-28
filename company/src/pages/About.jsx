import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Quote } from 'lucide-react'
import { whoWeAre, techStack } from '../data/site'
import { useSiteData } from '../context/SiteDataContext'
import PageHero from '../components/ui/PageHero'
import Seo from '../components/ui/Seo'
import AnimatedCounter from '../components/ui/AnimatedCounter'

const timeline = [
  { year: '2019', title: 'Founded', description: 'DraftBit started in Nairobi with a focus on web and mobile product development.' },
  { year: '2021', title: 'First scale-up', description: 'Shipped products for startups and mid-size companies across East Africa.' },
  { year: '2023', title: 'Global reach', description: 'Expanded to serve clients in Europe, Americas, and the Middle East.' },
  { year: '2025', title: 'Today', description: 'A bold tech studio building world-class products from Africa to the world.' },
]

const About = () => {
  const { siteConfig, mission, vision, stats, team, testimonials } = useSiteData()

  return (
  <div className="min-h-screen bg-background">
    <Seo />
    <PageHero
      label="About"
      title="We build technology that connects, scales, and transforms."
      description={whoWeAre.story}
    />

    <section className="py-16 border-y border-white/5">
      <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
        {stats.map((stat) => (
          <div key={stat.label} className="text-center">
            <p className="text-3xl md:text-4xl font-display font-bold text-foreground">
              <AnimatedCounter value={stat.value} suffix={stat.suffix} />
            </p>
            <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>

    <section className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-8">
        {[mission, vision].map((item) => (
          <div key={item.label} className="p-8 rounded-2xl border border-white/8 bg-white/[0.02]">
            <h2 className="section-label mb-4">{item.label}</h2>
            <p className="text-muted-foreground leading-relaxed">{item.text}</p>
          </div>
        ))}
      </div>
    </section>

    <section className="py-16 md:py-24 bg-[hsl(224_71%_3%)] border-t border-white/5">
      <div className="max-w-3xl mx-auto px-6">
        <h2 className="section-label mb-10">Our Journey</h2>
        <div className="space-y-6">
          {timeline.map((item, i) => (
            <motion.div
              key={item.year}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex gap-6 p-6 rounded-2xl border border-white/8"
            >
              <span className="text-2xl font-display font-bold text-primary flex-shrink-0">{item.year}</span>
              <div>
                <h3 className="font-display font-bold text-foreground mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    <section className="py-16 md:py-24 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="section-label mb-10">The Team</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {team.map((member) => (
            <div key={member.name} className="p-6 rounded-2xl border border-white/8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center text-lg font-bold mx-auto mb-4">
                {member.avatar}
              </div>
              <h3 className="font-display font-bold text-foreground">{member.name}</h3>
              <p className="text-sm text-primary mt-1 mb-2">{member.role}</p>
              <p className="text-xs text-muted-foreground">{member.focus}</p>
            </div>
          ))}
        </div>
        <p className="text-center mt-10">
          <Link to="/careers" className="text-primary font-semibold hover:underline">We&apos;re hiring →</Link>
        </p>
      </div>
    </section>

    <section className="py-16 border-t border-white/5">
      <div className="max-w-4xl mx-auto px-6">
        <h2 className="section-label mb-8">Tools & Technologies</h2>
        <div className="flex flex-wrap gap-3">
          {techStack.map((tech) => (
            <span key={tech.name} className="px-4 py-2 rounded-full text-sm border border-white/10 text-muted-foreground">{tech.name}</span>
          ))}
        </div>
      </div>
    </section>

    {/* Live content can arrive empty, so the pull quote is conditional rather
        than assuming a first testimonial exists. */}
    {testimonials.length > 0 && (
      <section className="py-16 border-t border-white/5">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <Quote className="w-8 h-8 text-primary/40 mx-auto mb-6" />
          <blockquote className="text-xl font-display text-foreground leading-relaxed mb-6">
            &ldquo;{testimonials[0].quote}&rdquo;
          </blockquote>
          <cite className="text-sm text-muted-foreground not-italic">{testimonials[0].author} — {testimonials[0].role}</cite>
        </div>
      </section>
    )}

    <section className="py-20 border-t border-white/5 text-center">
      <h2 className="text-2xl font-display font-bold text-foreground mb-4">Based in {siteConfig.location}</h2>
      <p className="text-muted-foreground mb-8">Working with clients locally and across the globe.</p>
      <Link to="/contact" className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors">
        Work with us
        <ArrowRight className="w-5 h-5" />
      </Link>
    </section>
  </div>
)
}

export default About
