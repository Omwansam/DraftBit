import React from 'react'
import { motion } from 'framer-motion'

export const EditorialLabel = ({ children, className = '' }) => (
  <motion.p
    initial={{ opacity: 0, y: 12 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5 }}
    className={`section-label ${className}`}
  >
    {children}
  </motion.p>
)

export const EditorialHeadline = ({ children, className = '', as: Tag = 'h2' }) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-60px' }}
    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
  >
    <Tag className={`editorial-headline ${className}`}>{children}</Tag>
  </motion.div>
)

const SectionHeader = ({
  badge,
  title,
  highlight,
  description,
  align = 'center',
  className = '',
  editorial = false,
}) => {
  const isCenter = align === 'center'

  if (editorial) {
    return (
      <div className={`${isCenter ? 'text-center max-w-4xl mx-auto' : 'max-w-3xl'} mb-16 ${className}`}>
        {badge && <EditorialLabel className={isCenter ? 'justify-center' : ''}>{badge}</EditorialLabel>}
        <EditorialHeadline className={isCenter ? 'mx-auto' : ''}>
          {title}{highlight && <> <span className="text-gradient">{highlight}</span></>}
        </EditorialHeadline>
        {description && (
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className={`text-lg md:text-xl text-muted-foreground leading-relaxed mt-6 ${isCenter ? 'mx-auto max-w-2xl' : ''}`}
          >
            {description}
          </motion.p>
        )}
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6 }}
      className={`${isCenter ? 'text-center max-w-3xl mx-auto' : 'max-w-2xl'} mb-16 ${className}`}
    >
      {badge && (
        <span className="inline-block px-3 py-1 mb-4 text-xs font-semibold uppercase tracking-widest text-primary bg-primary/10 border border-primary/20 rounded-full">
          {badge}
        </span>
      )}
      <h2 className="text-3xl md:text-5xl font-display font-bold mb-4 text-foreground">
        {title}{' '}
        {highlight && <span className="text-gradient">{highlight}</span>}
      </h2>
      {description && (
        <p className="text-lg text-muted-foreground leading-relaxed">
          {description}
        </p>
      )}
    </motion.div>
  )
}

export default SectionHeader
