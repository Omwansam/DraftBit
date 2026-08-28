import {
  BarChart3, Brain, Cloud, Code, Database, Globe, Award, Layers, Lightbulb,
  Palette, PenTool, Rocket, Search, Shield, ShoppingCart, Smartphone, Sparkles,
  Users, Workflow, Zap,
} from 'lucide-react'

/**
 * API records store an icon *name*, because a column cannot hold a React
 * component. This resolves it back to one.
 *
 * The static content in src/data/site.js imports the components directly, so
 * the components that render them expect a component either way — resolving
 * here in the adapter is what keeps those two sources interchangeable.
 *
 * Deliberately explicit rather than `import * as Icons from 'lucide-react'`:
 * the namespace import defeats tree-shaking and pulls the entire icon set
 * (~800kB) in to render twenty of them.
 *
 * Mirrors admin/src/lib/icons.js — keep the keys in step.
 */
export const ICONS = {
  Globe, Smartphone, Palette, Layers, Code, Search, PenTool, Rocket, Brain,
  Shield, Zap, Cloud, Sparkles, Users, Award, Lightbulb, Database, BarChart3,
  ShoppingCart, Workflow,
}

/** Falls back to a neutral icon when a record names one we do not bundle. */
export const iconFor = (name) => ICONS[name] ?? Sparkles
