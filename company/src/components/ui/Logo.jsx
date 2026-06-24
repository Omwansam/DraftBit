import React from 'react'
import { Link } from 'react-router-dom'

const Logo = ({ className = 'h-10', showText = true }) => {
  return (
    <Link to="/" className="flex items-center gap-2 group">
      <svg
        viewBox="0 0 40 40"
        className={`${className} w-auto flex-shrink-0`}
        aria-hidden="true"
      >
        <rect x="4" y="4" width="32" height="32" rx="8" fill="hsl(var(--primary))" opacity="0.15" />
        <path
          d="M13 27V13h5.5c3.8 0 6 2.2 6 5.2 0 2-1 3.5-2.7 4.2L25 27h-3.8l-3.2-3.5H16v3.5H13zm3.5-7h1.5c1.5 0 2.3-0.7 2.3-2 0-1.3-0.8-2-2.3-2H16.5v4z"
          fill="hsl(var(--primary))"
        />
      </svg>
      {showText && (
        <span className="font-display font-bold text-base tracking-tight text-foreground">
          Draft<span className="text-primary">Bit</span>
        </span>
      )}
    </Link>
  )
}

export default Logo
