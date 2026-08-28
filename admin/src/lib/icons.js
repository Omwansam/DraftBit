import {
  BarChart3, Brain, Cloud, Code, Database, Globe, Award, Layers, Lightbulb,
  Palette, PenTool, Rocket, Search, Shield, ShoppingCart, Smartphone, Sparkles,
  Users, Workflow, Zap,
} from 'lucide-react'

/**
 * Records store an icon *name* so they stay serializable. This map resolves it
 * back to a component.
 *
 * Deliberately explicit rather than `import * as Icons from 'lucide-react'`:
 * the namespace import defeats tree-shaking and pulls the entire icon set
 * (~800kB) into the bundle to render twenty of them.
 *
 * Keep the keys in step with ICON_OPTIONS in src/data/seed.js.
 */
export const ICONS = {
  Globe, Smartphone, Palette, Layers, Code, Search, PenTool, Rocket, Brain,
  Shield, Zap, Cloud, Sparkles, Users, Award, Lightbulb, Database, BarChart3,
  ShoppingCart, Workflow,
}

/** Falls back to a neutral icon when a record names one we do not bundle. */
export const iconFor = (name) => ICONS[name] ?? Sparkles
