import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, Zap } from 'lucide-react'

const CtaBanner = () => {
  return (
    <section className="py-20 px-4 md:px-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative max-w-5xl mx-auto rounded-3xl overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/10 to-primary/5" />
        <div className="absolute inset-0 border border-white/10 rounded-3xl" />
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)
            `,
            backgroundSize: '32px 32px',
          }}
        />

        <div className="relative px-8 py-14 md:px-16 md:py-16 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/20 text-primary mb-6">
            <Zap className="w-7 h-7" />
          </div>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
            Ready to Transform Your Business?
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8">
            Let&apos;s discuss your project and build something extraordinary together.
            Free consultation, no commitment.
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-primary text-primary-foreground font-semibold hover:bg-primary/90 hover:glow transition-all group"
          >
            Get Started Today
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </motion.div>
    </section>
  )
}

export default CtaBanner
