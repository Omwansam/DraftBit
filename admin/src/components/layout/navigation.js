import {
  Briefcase, Building2, FileText, Gauge, Inbox, MessageSquareQuote,
  Settings, Sparkles, TrendingUp, UserCog, Users,
} from 'lucide-react'

/**
 * One source of truth for navigation. The sidebar renders it, the command
 * palette searches it, and the topbar derives breadcrumbs from it — so a new
 * page is added in exactly one place.
 *
 * `badge` names a key on DataContext.derived; the sidebar reads the live count.
 */
export const NAV_SECTIONS = [
  {
    label: 'Overview',
    items: [
      { to: '/', label: 'Dashboard', icon: Gauge, end: true },
      { to: '/analytics', label: 'Analytics', icon: TrendingUp },
      { to: '/messages', label: 'Messages', icon: Inbox, badge: 'unreadMessages' },
    ],
  },
  {
    label: 'Content',
    items: [
      { to: '/projects', label: 'Projects', icon: Briefcase },
      { to: '/insights', label: 'Insights', icon: FileText },
      { to: '/services', label: 'Services', icon: Sparkles },
      { to: '/testimonials', label: 'Testimonials', icon: MessageSquareQuote, badge: 'pendingTestimonials' },
      { to: '/clients', label: 'Clients', icon: Building2 },
    ],
  },
  {
    label: 'People',
    items: [
      { to: '/careers', label: 'Careers', icon: Briefcase },
      { to: '/team', label: 'Team', icon: Users },
      { to: '/users', label: 'Admin users', icon: UserCog, permission: 'manage_users' },
    ],
  },
  {
    label: 'Configuration',
    items: [
      { to: '/settings', label: 'Site settings', icon: Settings, permission: 'manage_settings' },
    ],
  },
]

export const ALL_NAV_ITEMS = NAV_SECTIONS.flatMap((section) =>
  section.items.map((item) => ({ ...item, section: section.label })),
)

/** Human-readable label for a path segment, for breadcrumbs. */
export function labelForPath(pathname) {
  const match = ALL_NAV_ITEMS
    .filter((item) => item.to !== '/')
    .find((item) => pathname.startsWith(item.to))
  return match?.label ?? null
}
