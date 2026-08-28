import { createElement } from 'react'
import { iconFor } from '../../lib/icons'

/**
 * Renders a lucide icon chosen by *name*, for records that store an icon as a
 * string.
 *
 * Uses createElement rather than assigning the looked-up component to a
 * capitalized local and rendering `<Cmp />`: a component value produced during
 * render is a new identity every pass, which remounts the subtree and throws
 * away any state it holds.
 */
export default function Icon({ name, ...props }) {
  return createElement(iconFor(name), props)
}
