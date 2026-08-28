import { forwardRef } from 'react'
import { Link } from 'react-router-dom'
import { Loader2 } from 'lucide-react'

const VARIANTS = {
  primary:
    'bg-primary text-primary-foreground hover:bg-primary/90 border border-transparent shadow-sm',
  secondary:
    'bg-secondary text-secondary-foreground hover:bg-secondary/90 border border-transparent shadow-sm',
  outline:
    'bg-transparent text-foreground border border-border-strong hover:bg-foreground/5 hover:border-foreground/25',
  ghost:
    'bg-transparent text-muted-foreground border border-transparent hover:bg-foreground/5 hover:text-foreground',
  subtle:
    'bg-foreground/5 text-foreground border border-transparent hover:bg-foreground/10',
  danger:
    'bg-critical text-white hover:bg-critical/90 border border-transparent shadow-sm',
}

const SIZES = {
  sm: 'h-8 px-3 text-[0.8125rem] gap-1.5 rounded-md',
  md: 'h-10 px-4 text-sm gap-2 rounded-lg',
  lg: 'h-11 px-5 text-[0.9375rem] gap-2 rounded-lg',
  icon: 'h-9 w-9 rounded-lg justify-center',
  'icon-sm': 'h-8 w-8 rounded-md justify-center',
}

const base =
  'inline-flex items-center justify-center font-medium whitespace-nowrap transition-colors ' +
  'disabled:opacity-50 disabled:pointer-events-none select-none'

/**
 * One button. Renders as <button>, <a> or react-router <Link> depending on the
 * props given, so callers never have to restyle a link to look like a button.
 */
const Button = forwardRef(function Button(
  { variant = 'primary', size = 'md', loading = false, className = '', children, to, href, ...props },
  ref,
) {
  const classes = `${base} ${SIZES[size]} ${VARIANTS[variant]} ${className}`
  const content = (
    <>
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
      {children}
    </>
  )

  if (to) {
    return (
      <Link ref={ref} to={to} className={classes} {...props}>
        {content}
      </Link>
    )
  }
  if (href) {
    return (
      <a ref={ref} href={href} className={classes} {...props}>
        {content}
      </a>
    )
  }
  return (
    <button ref={ref} type="button" className={classes} disabled={loading || props.disabled} {...props}>
      {content}
    </button>
  )
})

export default Button
