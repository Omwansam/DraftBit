import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { siteConfig } from '../../data/site'

const PageLoader = () => {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1800)
    return () => clearTimeout(timer)
  }, [])

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[300] bg-background flex flex-col items-center justify-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <p className="text-6xl md:text-8xl font-display font-bold text-foreground mb-4">
              Hello<span className="text-primary">.</span>
            </p>
            <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">
              {siteConfig.name}
            </p>
          </motion.div>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
            className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary origin-left"
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default PageLoader
