import React from 'react'
import { motion } from 'framer-motion'
import { ArrowDown } from 'lucide-react'
import { siteConfig } from '../../data/site'

const lineVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] },
  }),
}

const Hero = () => {
  const lines = [
    <>We are <span className="text-gradient">{siteConfig.name}</span></>,
    <>Africa&apos;s Bold Tech Studio</>,
    <>With Sharp Code &amp;</>,
    <>A Builder&apos;s Mind.</>,
  ]

  return (
    <section className="relative min-h-screen flex flex-col justify-end overflow-hidden bg-background">
      {/* Subtle ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 -right-32 w-[600px] h-[600px] bg-primary/8 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-secondary/6 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 w-full pb-32 pt-36">
        {/* Giant Hello */}
        <motion.h1
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="hero-greeting mb-10 md:mb-16"
        >
          Hello<span className="text-primary">.</span>
        </motion.h1>

        {/* Narrative lines */}
        <div className="max-w-4xl space-y-1 md:space-y-2">
          {lines.map((line, i) => (
            <motion.p
              key={i}
              custom={i + 1}
              initial="hidden"
              animate="visible"
              variants={lineVariants}
              className="hero-line text-2xl sm:text-3xl md:text-4xl lg:text-[2.75rem] font-display font-semibold leading-tight tracking-tight text-foreground/90"
            >
              {line}
            </motion.p>
          ))}
        </div>
      </div>

      {/* Scroll down — bottom right, NBT style */}
      <motion.a
        href="#who-we-are"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.8 }}
        className="absolute bottom-10 right-6 sm:right-10 lg:right-12 z-10 group flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors"
        aria-label="Scroll down"
      >
        <span className="text-xs uppercase tracking-[0.25em] font-medium">Scroll Down</span>
        <span className="flex items-center justify-center w-10 h-10 rounded-full border border-white/10 group-hover:border-primary/40 transition-colors">
          <ArrowDown className="w-4 h-4 animate-bounce" />
        </span>
      </motion.a>

      {/* Bottom line accent */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </section>
  )
}

export default Hero
