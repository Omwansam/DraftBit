import React, { useEffect, useRef, useState } from 'react'
import { useInView, motion } from 'framer-motion'

const AnimatedCounter = ({ value, suffix = '', duration = 2 }) => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!isInView) return

    let start = 0
    const end = value
    const startTime = performance.now()

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / (duration * 1000), 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = Math.floor(start + (end - start) * eased)
      setCount(current)

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [isInView, value, duration])

  return (
    <motion.span ref={ref} className="tabular-nums">
      {count}
      {suffix}
    </motion.span>
  )
}

export default AnimatedCounter
