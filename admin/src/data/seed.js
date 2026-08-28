/**
 * Seed content for the admin console.
 *
 * Mirrors what the public site renders today (company/src/data/site.js) so the
 * console opens with real records instead of lorem ipsum. Everything here is
 * plain JSON — icons are stored as lucide *names*, not components, so records
 * survive a round-trip through localStorage or a REST API.
 */

/* Deterministic PRNG so generated series look organic but never change between
   reloads — a dashboard whose numbers shuffle on refresh is unreadable. */
function mulberry32(seed) {
  return function rand() {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const DAY = 86_400_000
const HOUR = 3_600_000

/**
 * Timestamps are expressed as offsets from now, never as an absolute clock
 * time on a given day: pinning "today at 14:45" renders as "in 4 hours" for
 * anyone loading the console before that, and an enquiry that arrives in the
 * future is nonsense.
 */
const iso = (daysAgo, hoursAgo = 0, minutesAgo = 0) =>
  new Date(Date.now() - daysAgo * DAY - hoursAgo * HOUR - minutesAgo * 60_000).toISOString()

/** Shorthand for items within the last day. */
const hoursAgo = (h, m = 0) => iso(0, h, m)

export const ICON_OPTIONS = [
  'Globe', 'Smartphone', 'Palette', 'Layers', 'Code', 'Search', 'PenTool',
  'Rocket', 'Brain', 'Shield', 'Zap', 'Cloud', 'Sparkles', 'Users', 'Award',
  'Lightbulb', 'Database', 'BarChart3', 'ShoppingCart', 'Workflow',
]

export const PROJECT_CATEGORIES = ['Web', 'Mobile', 'Dashboard', 'Design', 'Platform']
export const INSIGHT_CATEGORIES = ['Engineering', 'Product', 'Industry', 'Design', 'Culture']
export const DEPARTMENTS = ['Engineering', 'Design', 'Product', 'Operations', 'Growth']
export const EMPLOYMENT_TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship']
export const ROLES = ['Owner', 'Admin', 'Editor', 'Viewer']

/* -------------------------------------------------------------------------- */
/* Projects                                                                    */
/* -------------------------------------------------------------------------- */

export const projects = [
  {
    id: 'prj-1',
    slug: 'fibi-community',
    title: 'FIBI',
    description:
      'A fractional land-investment platform for co-owning vetted Kenyan projects—eco-lodges, solar, and agriculture—starting from a low minimum.',
    tags: ['React 19', 'TypeScript', 'Express', 'Prisma', 'PostgreSQL'],
    icon: 'BarChart3',
    category: 'Web',
    status: 'published',
    featured: true,
    client: 'FIBI — For Investors By Investors',
    role: 'Lead Engineer',
    year: '2026',
    liveUrl: 'https://fibicommunity.org',
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1200&auto=format&fit=crop',
    imageAlt: 'Aerial view of open farmland, representing the land projects FIBI members co-own',
    challenge:
      'Fractional land investment puts three different audiences on one platform: prospective investors evaluating listings, members tracking positions and payouts, and operators reconciling money and approving applications. Each needs its own surface and permissions.',
    solution:
      'A full-stack product built end to end: React 19, TypeScript, Vite, Tailwind CSS v4 and Recharts on the front end, with an Express, Prisma and PostgreSQL 16 back end. Three deliberately distinct interface layers — a marketing site, a signed-in investor portal, and an operator console — each with its own chrome.',
    results: [
      'Live in production at fibicommunity.org',
      'Three distinct surfaces: marketing, investor portal, operator console',
      'Card and bank-wire settlement through one code path',
      'Dual currency (KES/USD), money stored as integer minor units',
      'Responsive and audited from 320px to 2560px',
    ],
    views: 4820,
    updatedAt: iso(2),
  },
  {
    id: 'prj-2',
    slug: 'shoelocker-storefront',
    title: 'ShoeLocker',
    description:
      'E-commerce storefront deployed as a third tenant on a VPS already running two production applications behind a shared nginx container.',
    tags: ['React 19', 'Flask', 'PostgreSQL', 'Docker'],
    icon: 'ShoppingCart',
    category: 'Web',
    status: 'published',
    featured: true,
    client: 'ShoeLocker (danzykicks.com)',
    role: 'Full-Stack Engineer',
    year: '2026',
    liveUrl: 'https://danzykicks.com',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1200&auto=format&fit=crop',
    imageAlt: 'Sneakers arranged on a shelf',
    challenge:
      'The target VPS already served two unrelated production applications behind a single shared nginx container that owned ports 80 and 443. Adding a third site meant working inside that arrangement, without new infrastructure and without taking existing tenants offline.',
    solution:
      'We attached the stack to the proxy’s Docker network under dedicated service aliases and published zero host ports, so the storefront and API are reachable only by the proxy, by name. An isolated vhost went live on a graceful config reload.',
    results: [
      'Zero host ports published',
      'No downtime on cutover',
      'Neither existing application restarted',
      'Secrets kept out of image layers',
    ],
    views: 2140,
    updatedAt: iso(9),
  },
  {
    id: 'prj-3',
    slug: 'e-commerce-platform',
    title: 'E-Commerce Platform',
    description:
      'Full-stack online store with cart, checkout, and admin dashboard for a retail brand scaling across regions.',
    tags: ['React', 'Node.js', 'Stripe'],
    icon: 'Globe',
    category: 'Web',
    status: 'published',
    featured: true,
    client: 'East Africa Retail Group',
    role: 'Delivery Team',
    year: '2024',
    liveUrl: '',
    image: 'https://images.unsplash.com/photo-1557821552-17105176677c?q=80&w=1200&auto=format&fit=crop',
    imageAlt: 'Retail storefront interior',
    challenge:
      'A growing retail brand needed a unified e-commerce platform to replace fragmented storefronts across three countries, with real-time inventory and localized payments.',
    solution:
      'We built a headless commerce platform with a React storefront, Node.js API, Stripe and M-Pesa integration, and a real-time admin dashboard for inventory and orders.',
    results: [
      '3x online revenue in 12 months',
      'Unified inventory across 3 countries',
      'Sub-2s page load on mobile',
      '99.9% uptime since launch',
    ],
    views: 3310,
    updatedAt: iso(24),
  },
  {
    id: 'prj-4',
    slug: 'fitness-mobile-app',
    title: 'Fitness Mobile App',
    description: 'Cross-platform app with workout tracking, progress charts, and subscription management.',
    tags: ['React Native', 'Firebase', 'Stripe'],
    icon: 'Smartphone',
    category: 'Mobile',
    status: 'published',
    featured: true,
    client: 'HealthTech Startup',
    role: 'Mobile Team',
    year: '2024',
    liveUrl: '',
    image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1200&auto=format&fit=crop',
    imageAlt: 'Athlete training in a gym',
    challenge:
      'A fitness startup needed a single codebase for iOS and Android with offline workout tracking and subscription billing.',
    solution:
      'React Native app with a Firebase backend, offline-first architecture, and Stripe subscription management with in-app purchase support.',
    results: [
      '50k+ downloads in 6 months',
      '4.8★ average app store rating',
      '40% subscription conversion rate',
      'Single codebase for both platforms',
    ],
    views: 2760,
    updatedAt: iso(31),
  },
  {
    id: 'prj-5',
    slug: 'analytics-dashboard',
    title: 'Analytics Dashboard',
    description: 'Real-time analytics with custom charts, filters, and export for daily reporting.',
    tags: ['React', 'D3.js', 'REST API'],
    icon: 'Layers',
    category: 'Dashboard',
    status: 'published',
    featured: false,
    client: 'Data-Driven Enterprise',
    role: 'Product Engineer',
    year: '2023',
    liveUrl: '',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200&auto=format&fit=crop',
    imageAlt: 'Dashboard charts on a laptop screen',
    challenge:
      'Internal teams relied on spreadsheets for daily reporting, causing delays and inconsistent data across departments.',
    solution:
      'Custom React dashboard with D3.js visualizations, role-based access, scheduled exports, and real-time API feeds from existing systems.',
    results: [
      '80% reduction in reporting time',
      'Real-time data across 12 departments',
      'Automated daily email reports',
      'Zero spreadsheet dependency',
    ],
    views: 1490,
    updatedAt: iso(58),
  },
  {
    id: 'prj-6',
    slug: 'brand-design-system',
    title: 'Brand & Design System',
    description: 'Visual identity and component library for a B2B SaaS product.',
    tags: ['Figma', 'Storybook', 'Design Tokens'],
    icon: 'Palette',
    category: 'Design',
    status: 'published',
    featured: false,
    client: 'B2B SaaS Company',
    role: 'Design Lead',
    year: '2023',
    liveUrl: '',
    image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=1200&auto=format&fit=crop',
    imageAlt: 'Design system swatches and type specimens',
    challenge:
      'A SaaS product had inconsistent UI across web and marketing, slowing development and hurting brand perception.',
    solution:
      'Complete design system in Figma with design tokens, a Storybook component library, and documentation for engineering handoff.',
    results: [
      '60% faster UI development',
      '100% component consistency',
      'Unified brand across web & marketing',
      'Developer-friendly documentation',
    ],
    views: 980,
    updatedAt: iso(74),
  },
  {
    id: 'prj-7',
    slug: 'booking-scheduling',
    title: 'Booking & Scheduling',
    description: 'Web app for appointment booking, calendar sync, reminders, and payments.',
    tags: ['React', 'Node.js', 'Twilio'],
    icon: 'Globe',
    category: 'Web',
    status: 'draft',
    featured: false,
    client: 'Service Business Network',
    role: 'Delivery Team',
    year: '2023',
    liveUrl: '',
    image: 'https://images.unsplash.com/photo-1506784365847-bbad939e9335?q=80&w=1200&auto=format&fit=crop',
    imageAlt: 'A wall calendar',
    challenge:
      'A network of service providers struggled with no-shows and manual scheduling across multiple locations.',
    solution:
      'Booking platform with Google Calendar sync, SMS reminders via Twilio, online payments, and a provider admin portal.',
    results: [
      '45% reduction in no-shows',
      'Automated scheduling for 200+ providers',
      'Integrated payment collection',
      'Calendar sync for all staff',
    ],
    views: 210,
    updatedAt: iso(6),
  },
]

/* -------------------------------------------------------------------------- */
/* Insights                                                                    */
/* -------------------------------------------------------------------------- */

export const insights = [
  {
    id: 'ins-1',
    slug: 'building-for-africa-global-tech',
    title: 'Building for Africa, Competing Globally',
    excerpt:
      'How Nairobi-born tech teams are shipping world-class products that scale across continents.',
    body:
      'The narrative that African engineering is "catching up" is a decade out of date. The teams we work alongside in Nairobi, Lagos and Kigali are shipping products with the same architectural rigour, the same test discipline and the same deployment automation as anyone in Berlin or Austin.\n\nWhat is different is the constraint set. Bandwidth is expensive and uneven, so payload budgets are real. Payment rails are fragmented, so abstraction over providers is not optional. Devices skew mid-range Android, so a 2MB JavaScript bundle is a business problem, not a lighthouse score.\n\nThose constraints produce better engineers. A team that has optimised for a 3G connection on a four-year-old handset does not suddenly forget how when the client is in London.',
    category: 'Industry',
    author: 'Alex Kimani',
    status: 'published',
    featured: true,
    readTime: '6 min read',
    publishedAt: iso(278),
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=800&auto=format&fit=crop',
    tags: ['Africa', 'Engineering culture'],
    views: 3140,
    updatedAt: iso(278),
  },
  {
    id: 'ins-2',
    slug: 'why-clean-architecture-matters',
    title: 'Why Clean Architecture Matters for Startups',
    excerpt:
      'The technical decisions you make early will either accelerate or cripple your growth. Here’s what we recommend.',
    body:
      'Every startup we meet has been told to "move fast." Almost none have been told what specifically to be sloppy about. That distinction is the whole game.\n\nBe sloppy about: styling systems, admin tooling, internal naming, the shape of your analytics events. These are cheap to change later.\n\nDo not be sloppy about: your data model, your auth boundary, and the direction your dependencies point. Those three calcify. A badly-shaped users table is still there three years and four rewrites later, because everything reads from it.\n\nClean architecture, in practice, is just this: keep business rules in the middle, keep frameworks at the edges, and let dependencies point inward.',
    category: 'Engineering',
    author: 'Alex Kimani',
    status: 'published',
    featured: true,
    readTime: '8 min read',
    publishedAt: iso(293),
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=800&auto=format&fit=crop',
    tags: ['Architecture', 'Startups'],
    views: 5210,
    updatedAt: iso(290),
  },
  {
    id: 'ins-3',
    slug: 'ai-automation-smb',
    title: 'AI & Automation for Growing Businesses',
    excerpt:
      'Practical ways SMEs can leverage AI and automation without enterprise budgets or complexity.',
    body:
      'Most small businesses do not need a model. They need a queue.\n\nBefore anyone reaches for an LLM, the highest-return automation is almost always structural: a form that writes to a database instead of an inbox, a scheduled job that reconciles two systems overnight, a webhook that stops someone re-typing an order.\n\nOnce that plumbing exists, AI has somewhere to plug in — summarising the queue, drafting the reply, classifying the ticket. Applied to a manual process, it just makes the mess faster.',
    category: 'Product',
    author: 'Sarah Mwangi',
    status: 'published',
    featured: false,
    readTime: '5 min read',
    publishedAt: iso(336),
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=800&auto=format&fit=crop',
    tags: ['AI', 'Automation', 'SME'],
    views: 2680,
    updatedAt: iso(330),
  },
  {
    id: 'ins-4',
    slug: 'design-systems-that-survive',
    title: 'Design Systems That Survive Contact With Engineering',
    excerpt:
      'A component library nobody uses is a very expensive Figma file. Here is what makes one stick.',
    body:
      'The failure mode is always the same: design ships a beautiful kit, engineering builds 80% of it, and then the first deadline arrives and someone writes a one-off button. Six months later there are nine buttons.\n\nWhat actually works is boring. Tokens before components. One owner with merge rights. A visible cost to going off-system — a lint rule, not a Slack message.',
    category: 'Design',
    author: 'Sarah Mwangi',
    status: 'draft',
    featured: false,
    readTime: '7 min read',
    publishedAt: null,
    image: 'https://images.unsplash.com/photo-1541462608143-67571c6738dd?q=80&w=800&auto=format&fit=crop',
    tags: ['Design systems'],
    views: 0,
    updatedAt: iso(3),
  },
]

/* -------------------------------------------------------------------------- */
/* Careers                                                                     */
/* -------------------------------------------------------------------------- */

export const careers = [
  {
    id: 'job-1',
    slug: 'senior-fullstack-engineer',
    title: 'Senior Full-Stack Engineer',
    department: 'Engineering',
    location: 'Nairobi / Remote',
    type: 'Full-time',
    status: 'open',
    description:
      'Build scalable web and mobile products for clients across Africa and beyond. You’ll own features end-to-end—from API design to polished UI.',
    requirements: [
      '5+ years full-stack experience',
      'Strong React & Node.js skills',
      'Experience with PostgreSQL or MongoDB',
      'Comfortable with client communication',
    ],
    applicants: 34,
    postedAt: iso(21),
    updatedAt: iso(4),
  },
  {
    id: 'job-2',
    slug: 'product-designer',
    title: 'Product Designer',
    department: 'Design',
    location: 'Nairobi / Hybrid',
    type: 'Full-time',
    status: 'open',
    description:
      'Shape intuitive, beautiful interfaces for web and mobile products. You’ll work closely with engineers and clients from discovery to delivery.',
    requirements: [
      '3+ years product/UI design experience',
      'Proficiency in Figma',
      'Portfolio demonstrating web & mobile work',
      'Understanding of design systems',
    ],
    applicants: 51,
    postedAt: iso(28),
    updatedAt: iso(7),
  },
  {
    id: 'job-3',
    slug: 'devops-engineer',
    title: 'DevOps Engineer',
    department: 'Engineering',
    location: 'Remote',
    type: 'Full-time',
    status: 'open',
    description:
      'Design and maintain cloud infrastructure for client projects. CI/CD pipelines, monitoring, and security are your domain.',
    requirements: [
      '3+ years DevOps/SRE experience',
      'AWS or GCP proficiency',
      'Docker & Kubernetes knowledge',
      'Infrastructure as Code (Terraform preferred)',
    ],
    applicants: 19,
    postedAt: iso(12),
    updatedAt: iso(12),
  },
  {
    id: 'job-4',
    slug: 'growth-marketing-lead',
    title: 'Growth Marketing Lead',
    department: 'Growth',
    location: 'Nairobi',
    type: 'Contract',
    status: 'closed',
    description:
      'Own top-of-funnel growth for the studio: content, partnerships, and inbound pipeline.',
    requirements: [
      '4+ years B2B marketing',
      'Track record with technical audiences',
      'Comfortable writing long-form',
    ],
    applicants: 63,
    postedAt: iso(96),
    updatedAt: iso(40),
  },
]

/* -------------------------------------------------------------------------- */
/* Team                                                                        */
/* -------------------------------------------------------------------------- */

export const team = [
  {
    id: 'tm-1',
    name: 'Alex Kimani',
    role: 'Founder & Lead Engineer',
    focus: 'Architecture, backend, and delivery.',
    email: 'alex@draftbit.com',
    linkedin: 'https://linkedin.com/in/alexkimani',
    github: 'https://github.com/alexkimani',
    status: 'active',
    order: 1,
    joinedAt: iso(2190),
  },
  {
    id: 'tm-2',
    name: 'Sarah Mwangi',
    role: 'Product & Design Lead',
    focus: 'UX, UI, and design systems.',
    email: 'sarah@draftbit.com',
    linkedin: 'https://linkedin.com/in/sarahmwangi',
    github: '',
    status: 'active',
    order: 2,
    joinedAt: iso(1460),
  },
  {
    id: 'tm-3',
    name: 'James Ochieng',
    role: 'Senior Full-Stack Developer',
    focus: 'Web and mobile applications.',
    email: 'james@draftbit.com',
    linkedin: 'https://linkedin.com/in/jamesochieng',
    github: 'https://github.com/jochieng',
    status: 'active',
    order: 3,
    joinedAt: iso(910),
  },
  {
    id: 'tm-4',
    name: 'Grace Wanjiku',
    role: 'DevOps & Cloud Engineer',
    focus: 'Infrastructure and deployment.',
    email: 'grace@draftbit.com',
    linkedin: 'https://linkedin.com/in/gracewanjiku',
    github: 'https://github.com/gwanjiku',
    status: 'active',
    order: 4,
    joinedAt: iso(620),
  },
]

/* -------------------------------------------------------------------------- */
/* Testimonials                                                                */
/* -------------------------------------------------------------------------- */

export const testimonials = [
  {
    id: 'tst-1',
    quote:
      "DraftBit took our rough concept and turned it into a product we're proud of. Professional, on time, and great to work with.",
    author: 'Sarah M.',
    role: 'Product Lead, SaaS Company',
    company: 'Northwind SaaS',
    rating: 5,
    status: 'published',
    createdAt: iso(120),
  },
  {
    id: 'tst-2',
    quote:
      'Their team delivered a complex ERP system on schedule. The attention to detail and communication throughout was exceptional.',
    author: 'James O.',
    role: 'Operations Director, Retail Brand',
    company: 'East Africa Retail Group',
    rating: 5,
    status: 'published',
    createdAt: iso(180),
  },
  {
    id: 'tst-3',
    quote:
      'From discovery to launch, DraftBit felt like an extension of our team. Our mobile app exceeded every expectation.',
    author: 'Alex K.',
    role: 'Founder, HealthTech Startup',
    company: 'VitalTrack',
    rating: 5,
    status: 'published',
    createdAt: iso(230),
  },
  {
    id: 'tst-4',
    quote:
      'Responsive, technically sharp, and honest about trade-offs. They told us what not to build, which saved us a quarter.',
    author: 'Miriam W.',
    role: 'CTO, Logistics Platform',
    company: 'Haulr',
    rating: 4,
    status: 'pending',
    createdAt: iso(11),
  },
]

/* -------------------------------------------------------------------------- */
/* Services & clients                                                          */
/* -------------------------------------------------------------------------- */

export const services = [
  {
    id: 'svc-1',
    icon: 'Code',
    title: 'Custom Software',
    description:
      'Tailor-made applications designed to solve your specific business challenges with scalable architecture.',
    features: ['Web & mobile apps', 'API development', 'Third-party integrations'],
    status: 'published',
    order: 1,
  },
  {
    id: 'svc-2',
    icon: 'Globe',
    title: 'Website Development',
    description:
      'High-performance, responsive, and SEO-optimized websites that convert visitors into customers.',
    features: ['Corporate websites', 'Landing pages', 'E-commerce stores'],
    status: 'published',
    order: 2,
  },
  {
    id: 'svc-3',
    icon: 'Database',
    title: 'ERP Systems',
    description:
      'Integrated management of main business processes in real-time through custom software.',
    features: ['Inventory management', 'HR & payroll', 'Financial reporting'],
    status: 'published',
    order: 3,
  },
  {
    id: 'svc-4',
    icon: 'BarChart3',
    title: 'CRM Solutions',
    description:
      'Customer relationship tools to manage interactions with current and potential customers.',
    features: ['Lead tracking', 'Sales pipelines', 'Customer portals'],
    status: 'published',
    order: 4,
  },
  {
    id: 'svc-5',
    icon: 'ShoppingCart',
    title: 'POS Systems',
    description:
      'Modern Point of Sale systems that streamline transactions and inventory management.',
    features: ['Multi-location support', 'Receipt & invoicing', 'Real-time stock sync'],
    status: 'published',
    order: 5,
  },
  {
    id: 'svc-6',
    icon: 'Workflow',
    title: 'Automation & API',
    description:
      'Connect your tools and automate repetitive workflows to save time and reduce errors.',
    features: ['Workflow automation', 'API design', 'System integrations'],
    status: 'published',
    order: 6,
  },
]

export const clients = [
  { id: 'cl-1', name: 'Safaricom', industry: 'Telecom', website: 'https://safaricom.co.ke', featured: true },
  { id: 'cl-2', name: 'Flutterwave', industry: 'Fintech', website: 'https://flutterwave.com', featured: true },
  { id: 'cl-3', name: 'Andela', industry: 'Talent', website: 'https://andela.com', featured: true },
  { id: 'cl-4', name: 'M-Kopa', industry: 'Energy', website: 'https://m-kopa.com', featured: true },
  { id: 'cl-5', name: 'Twiga Foods', industry: 'Agritech', website: 'https://twiga.com', featured: false },
  { id: 'cl-6', name: 'Cellulant', industry: 'Payments', website: 'https://cellulant.io', featured: false },
  { id: 'cl-7', name: 'Sendy', industry: 'Logistics', website: 'https://sendyit.com', featured: false },
  { id: 'cl-8', name: 'Lori Systems', industry: 'Logistics', website: 'https://lorisystems.com', featured: false },
  { id: 'cl-9', name: 'Copia', industry: 'E-commerce', website: 'https://copiakenya.com', featured: false },
  { id: 'cl-10', name: 'Tala', industry: 'Fintech', website: 'https://tala.co.ke', featured: false },
]

/* -------------------------------------------------------------------------- */
/* Users                                                                       */
/* -------------------------------------------------------------------------- */

export const users = [
  {
    id: 'usr-1',
    username: 'alex',
    name: 'Alex Kimani',
    email: 'alex@draftbit.com',
    role: 'Owner',
    status: 'active',
    lastActive: hoursAgo(1, 12),
    createdAt: iso(2190),
  },
  {
    id: 'usr-2',
    username: 'sarah',
    name: 'Sarah Mwangi',
    email: 'sarah@draftbit.com',
    role: 'Admin',
    status: 'active',
    lastActive: hoursAgo(3, 40),
    createdAt: iso(1460),
  },
  {
    id: 'usr-3',
    username: 'james',
    name: 'James Ochieng',
    email: 'james@draftbit.com',
    role: 'Editor',
    status: 'active',
    lastActive: iso(1, 5, 5),
    createdAt: iso(910),
  },
  {
    id: 'usr-4',
    username: 'grace',
    name: 'Grace Wanjiku',
    email: 'grace@draftbit.com',
    role: 'Editor',
    status: 'active',
    lastActive: iso(3, 2, 30),
    createdAt: iso(620),
  },
  {
    id: 'usr-5',
    username: 'intern',
    name: 'Brian Otieno',
    email: 'brian@draftbit.com',
    role: 'Viewer',
    status: 'invited',
    lastActive: null,
    createdAt: iso(5),
  },
]

/* -------------------------------------------------------------------------- */
/* Messages (mirrors the Contact model in BACKEND/server/models.py)            */
/* -------------------------------------------------------------------------- */

export const messages = [
  {
    id: 'msg-1',
    name: 'Daniel Mutiso',
    email: 'daniel@kazipay.co.ke',
    subject: 'ERP build for a 40-person operation',
    message:
      'Hi DraftBit — we run a light manufacturing outfit in Industrial Area and everything is on spreadsheets. Inventory, payroll, and job costing. We saw the ERP page. What does a discovery engagement look like, and roughly what budget should we be planning for?',
    read: false,
    starred: true,
    status: 'new',
    source: 'Contact form',
    createdAt: hoursAgo(2, 12),
  },
  {
    id: 'msg-2',
    name: 'Priya Shah',
    email: 'priya.shah@northloop.io',
    subject: 'React Native app — second opinion on architecture',
    message:
      'We have an existing RN app that is getting slow and we suspect the state layer is the problem. Would you take on a two-week audit engagement rather than a full build? Happy to share the repo under NDA.',
    read: false,
    starred: false,
    status: 'new',
    source: 'Contact form',
    createdAt: hoursAgo(6, 45),
  },
  {
    id: 'msg-3',
    name: 'Kwame Asante',
    email: 'k.asante@accraventures.com',
    subject: 'Partnership enquiry',
    message:
      'I run a small venture studio in Accra. We regularly need engineering partners for portfolio companies at pre-seed. Is there scope for a retainer arrangement across multiple products?',
    read: false,
    starred: false,
    status: 'new',
    source: 'Contact form',
    createdAt: iso(1, 4, 20),
  },
  {
    id: 'msg-4',
    name: 'Lucy Njeri',
    email: 'lucy@brightpath.ac.ke',
    subject: 'School management portal',
    message:
      'We need a parent portal with fee statements and M-Pesa payments for about 1,200 students. Timeline is next academic term. Is that realistic?',
    read: true,
    starred: true,
    status: 'replied',
    source: 'Contact form',
    createdAt: iso(2, 3, 5),
  },
  {
    id: 'msg-5',
    name: 'Tom Bergman',
    email: 'tom@bergman-analytics.se',
    subject: 'Dashboard work — remote engagement',
    message:
      'Stockholm-based. We need a data dashboard front end on top of an existing Python API. Fully remote, roughly 8 weeks. Do you take on European clients and how do you handle timezone overlap?',
    read: true,
    starred: false,
    status: 'replied',
    source: 'Contact form',
    createdAt: iso(3, 1, 55),
  },
  {
    id: 'msg-6',
    name: 'Amina Hassan',
    email: 'amina@souqbox.com',
    subject: 'E-commerce replatform',
    message:
      'Currently on a hosted platform that we have outgrown — the fees are eating margin and we cannot customise checkout. Interested in what a headless build would cost.',
    read: true,
    starred: false,
    status: 'in-progress',
    source: 'Contact form',
    createdAt: iso(4, 5, 15),
  },
  {
    id: 'msg-7',
    name: 'Recruiter Bot',
    email: 'noreply@devtalentpool.biz',
    subject: 'Top 1% developers available now!!',
    message:
      'Hire pre-vetted developers at 70% discount. Reply YES for a callback within 5 minutes.',
    read: true,
    starred: false,
    status: 'spam',
    source: 'Contact form',
    createdAt: iso(5, 3, 2),
  },
  {
    id: 'msg-8',
    name: 'Victor Kiplagat',
    email: 'victor.k@ridgefarm.co.ke',
    subject: 'Farm logistics tracking',
    message:
      'We move produce from Nakuru to Nairobi daily and have no visibility once a truck leaves. Looking for something simple — driver app plus a dispatcher view. Nothing fancy.',
    read: true,
    starred: false,
    status: 'archived',
    source: 'Contact form',
    createdAt: iso(8, 2, 40),
  },
  {
    id: 'msg-9',
    name: 'Fatima Yusuf',
    email: 'fatima@medicare-clinics.com',
    subject: 'Clinic booking system',
    message:
      'Four clinics, shared doctor roster, patients currently book by phone. We want online booking with SMS reminders. Also need to think about patient data handling.',
    read: true,
    starred: true,
    status: 'replied',
    source: 'Contact form',
    createdAt: iso(11, 6, 30),
  },
  {
    id: 'msg-10',
    name: 'Steven Wachira',
    email: 'steve@wachira-legal.co.ke',
    subject: 'Website redesign',
    message:
      'Law firm, 12 partners. Our site is from 2016 and looks it. Mostly a credibility exercise — we want it to look serious and load fast. No CMS complexity please.',
    read: true,
    starred: false,
    status: 'closed',
    source: 'Contact form',
    createdAt: iso(16, 1, 20),
  },
]

/* -------------------------------------------------------------------------- */
/* Site settings                                                               */
/* -------------------------------------------------------------------------- */

export const settings = {
  name: 'DraftBit',
  tagline: "Africa's Bold Tech Studio With Sharp Code & A Builder's Mind",
  description:
    'Based in Nairobi with a global outlook, we are engineers, designers, and strategists building software that scales across continents.',
  email: 'hello@draftbit.com',
  phone: '+254 700 000 000',
  location: 'Nairobi, Kenya',
  address: 'Karen, Nairobi, Kenya',
  mapUrl: 'https://maps.google.com/?q=Nairobi,Kenya',
  mission:
    'To empower businesses with bold, scalable, and intelligent technology solutions that solve real problems, drive growth, and create lasting digital advantage in an ever-evolving global marketplace.',
  vision:
    'To be the tech partner of choice for ambitious brands worldwide—building products that are as resilient as they are beautiful, and setting the standard for engineering excellence from Africa to the world.',
  social: {
    linkedin: 'https://linkedin.com',
    github: 'https://github.com',
    twitter: 'https://twitter.com',
    instagram: 'https://instagram.com',
  },
  stats: [
    { label: 'Projects Delivered', value: 50, suffix: '+' },
    { label: 'Global Clients', value: 30, suffix: '+' },
    { label: 'Years Building', value: 5, suffix: '+' },
    { label: 'Countries Served', value: 12, suffix: '+' },
  ],
  businessHours: [
    { days: 'Monday – Friday', time: '9:00 AM – 6:00 PM EAT' },
    { days: 'Saturday', time: '10:00 AM – 2:00 PM EAT' },
    { days: 'Sunday', time: 'Closed' },
  ],
  seo: {
    defaultTitle: "DraftBit | Africa's Bold Tech Studio",
    defaultDescription:
      'Expert full-stack development from Nairobi. Custom software, web apps, mobile products, and digital transformation.',
    indexable: true,
  },
  features: {
    chatWidget: true,
    cookieBanner: true,
    newsletter: true,
    whatsapp: true,
  },
}

/* -------------------------------------------------------------------------- */
/* Analytics                                                                   */
/* -------------------------------------------------------------------------- */

/** 90 days of daily visitor / enquiry counts with a mild weekly rhythm. */
function buildTraffic(days = 90) {
  const rand = mulberry32(20260817)
  const out = []
  for (let i = days - 1; i >= 0; i -= 1) {
    const date = new Date(Date.now() - i * DAY)
    date.setHours(0, 0, 0, 0)
    const dow = date.getDay()
    const weekend = dow === 0 || dow === 6
    // Gentle upward trend over the window.
    const trend = 1 + (days - i) / (days * 2.4)
    const base = (weekend ? 190 : 420) * trend
    const visitors = Math.round(base * (0.82 + rand() * 0.36))
    const pageViews = Math.round(visitors * (2.1 + rand() * 0.9))
    const enquiries = Math.max(0, Math.round((weekend ? 0.4 : 2.1) * (0.4 + rand() * 1.5)))
    out.push({ date: date.toISOString().slice(0, 10), visitors, pageViews, enquiries })
  }
  return out
}

export const traffic = buildTraffic(90)

export const trafficSources = [
  { source: 'Organic search', visitors: 14820 },
  { source: 'Direct', visitors: 8340 },
  { source: 'LinkedIn', visitors: 5120 },
  { source: 'Referral', visitors: 3260 },
  { source: 'X / Twitter', visitors: 1490 },
  { source: 'Other', visitors: 980 },
]

export const topPages = [
  { path: '/', title: 'Home', views: 18240, avgTime: '1:52', bounce: 38 },
  { path: '/services', title: 'Services', views: 9310, avgTime: '2:24', bounce: 31 },
  { path: '/projects', title: 'Projects', views: 7680, avgTime: '3:06', bounce: 26 },
  { path: '/projects/fibi-community', title: 'FIBI case study', views: 4820, avgTime: '4:41', bounce: 19 },
  { path: '/about', title: 'About', views: 4190, avgTime: '1:38', bounce: 42 },
  { path: '/contact', title: 'Contact', views: 3870, avgTime: '2:11', bounce: 22 },
  { path: '/insights', title: 'Insights', views: 2940, avgTime: '2:48', bounce: 35 },
  { path: '/careers', title: 'Careers', views: 2310, avgTime: '3:22', bounce: 29 },
]

export const activity = [
  { id: 'act-1', actor: 'Sarah Mwangi', action: 'published the insight', target: 'Building for Africa, Competing Globally', at: hoursAgo(2, 5), type: 'publish' },
  { id: 'act-2', actor: 'Alex Kimani', action: 'replied to', target: 'Lucy Njeri — School management portal', at: hoursAgo(5, 30), type: 'message' },
  { id: 'act-3', actor: 'James Ochieng', action: 'updated the project', target: 'FIBI', at: iso(1, 3, 12), type: 'edit' },
  { id: 'act-4', actor: 'Grace Wanjiku', action: 'opened the role', target: 'DevOps Engineer', at: iso(1, 7, 0), type: 'create' },
  { id: 'act-5', actor: 'Alex Kimani', action: 'invited', target: 'brian@draftbit.com', at: iso(5, 6, 45), type: 'user' },
  { id: 'act-6', actor: 'Sarah Mwangi', action: 'archived the message from', target: 'Victor Kiplagat', at: iso(7, 4, 20), type: 'archive' },
]

export const seedData = {
  projects,
  insights,
  careers,
  team,
  testimonials,
  services,
  clients,
  users,
  messages,
  settings,
  traffic,
  trafficSources,
  topPages,
  activity,
}

export default seedData
