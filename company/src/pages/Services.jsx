import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { passions, engagementModels, processSteps } from '../data/site'
import PageHero from '../components/ui/PageHero'
import Seo from '../components/ui/Seo'

const Services = () => (
  <div className="min-h-screen bg-background">
    <Seo title="Services | DraftBit" description="Custom software, web development, mobile apps, ERP, CRM, and automation." />
    <PageHero
      label="Services"
      title="Technology solutions engineered for growth."
      description="From MVPs to enterprise platforms — we design, build, and ship products that perform at world-class standards."
    />

    <section className="py-16 md:py-24 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <p className="section-label mb-12">What We Build</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/10 rounded-2xl overflow-hidden">
          {passions.map((item, i) => {
            const Icon = item.icon
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="bg-background p-8 md:p-10"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-display font-bold text-foreground mb-3">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{item.description}</p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>

    <section className="py-16 md:py-24 bg-[hsl(224_71%_3%)] border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <p className="section-label mb-12">How We Partner</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {engagementModels.map((model, i) => (
            <motion.div
              key={model.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-8 rounded-2xl border border-white/8 bg-white/[0.02]"
            >
              <span className="text-3xl mb-4 block">{model.icon}</span>
              <h3 className="font-display font-bold text-xl text-foreground mb-3">{model.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{model.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    <section className="py-16 md:py-24 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <p className="section-label mb-12">Our Process</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {processSteps.map((step) => {
            const Icon = step.icon
            return (
              <div key={step.step}>
                <span className="text-4xl font-display font-bold text-primary/30">{step.step}</span>
                <div className="flex items-center gap-3 mt-4 mb-3">
                  <Icon className="w-5 h-5 text-primary" />
                  <h3 className="font-display font-bold text-foreground">{step.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>

    <section className="py-20 border-t border-white/5 text-center">
      <h2 className="text-2xl font-display font-bold text-foreground mb-4">Ready to start?</h2>
      <p className="text-muted-foreground mb-8 max-w-md mx-auto">Tell us about your project and we&apos;ll get back within 24 hours.</p>
      <Link to="/contact" className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors">
        Get in Touch
        <ArrowUpRight className="w-5 h-5" />
      </Link>
    </section>
  </div>
)

export default Services
