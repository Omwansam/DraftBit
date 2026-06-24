import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { stats, siteConfig } from '../../data/site'
import AnimatedCounter from './AnimatedCounter'

const LiveClock = () => {
  const [time, setTime] = useState('')

  useEffect(() => {
    const update = () => {
      setTime(
        new Date().toLocaleTimeString('en-KE', {
          timeZone: 'Africa/Nairobi',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        })
      )
    }
    update()
    const id = setInterval(update, 30000)
    return () => clearInterval(id)
  }, [])

  const isOpen = () => {
    const now = new Date()
    const nairobi = new Date(now.toLocaleString('en-US', { timeZone: 'Africa/Nairobi' }))
    const day = nairobi.getDay()
    const hour = nairobi.getHours()
    if (day === 0) return false
    if (day === 6) return hour >= 10 && hour < 14
    return hour >= 9 && hour < 18
  }

  const open = isOpen()

  return (
    <div className="flex items-center gap-4 text-sm">
      <span className="text-muted-foreground">{siteConfig.location}</span>
      <span className="text-muted-foreground">·</span>
      <span className="text-muted-foreground tabular-nums">{time} EAT</span>
      <span className="flex items-center gap-1.5">
        <span className={`w-2 h-2 rounded-full ${open ? 'bg-green-500 animate-pulse' : 'bg-muted-foreground'}`} />
        <span className={open ? 'text-green-400' : 'text-muted-foreground'}>
          {open ? 'Open now' : 'Closed'}
        </span>
      </span>
    </div>
  )
}

const StatsStrip = () => (
  <section className="py-12 border-y border-white/5 bg-white/[0.02]">
    <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 mb-10">
        <LiveClock />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="text-center md:text-left"
          >
            <p className="text-3xl md:text-4xl font-display font-bold text-foreground">
              <AnimatedCounter value={stat.value} suffix={stat.suffix} />
            </p>
            <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
)

export default StatsStrip
