import {
  Globe,
  Smartphone,
  Palette,
  Layers,
  Code,
  Search,
  PenTool,
  Rocket,
  Brain,
  Shield,
  Zap,
  Cloud,
  Sparkles,
  Users,
  Award,
  Lightbulb,
  Database,
  BarChart3,
  ShoppingCart,
  Workflow,
} from 'lucide-react'

export const siteConfig = {
  name: 'DraftBit',
  tagline: "Africa's Bold Tech Studio With Sharp Code & A Builder's Mind",
  description:
    'Based in Nairobi with a global outlook, we are engineers, designers, and strategists building software that scales across continents.',
  email: 'hello@draftbit.com',
  phone: '+254 700 000 000',
  phoneHref: 'tel:+254700000000',
  location: 'Nairobi, Kenya',
  address: 'Karen, Nairobi, Kenya',
  mapUrl: 'https://maps.google.com/?q=Nairobi,Kenya',
}

export const mission = {
  label: 'Our Mission',
  text: 'To empower businesses with bold, scalable, and intelligent technology solutions that solve real problems, drive growth, and create lasting digital advantage in an ever-evolving global marketplace.',
}

export const vision = {
  label: 'Our Vision',
  text: 'To be the tech partner of choice for ambitious brands worldwide—building products that are as resilient as they are beautiful, and setting the standard for engineering excellence from Africa to the world.',
}

export const whoWeAre = {
  label: 'Who We Are',
  headline: 'At DraftBit we build technology that connects, scales, and transforms.',
  story:
    'Based in the heart of Nairobi, but with a global footprint and outlook, we are a passionate team of engineers, designers, and innovators dedicated to transforming businesses through cutting-edge software. We thrive on helping companies stand out in today\'s dynamic digital landscape—crafting custom platforms, intelligent automation, and products that perform at world-class standards.',
}

export const passions = [
  { icon: Code, title: 'Clean Architecture', description: 'Code that reads like poetry and scales like infrastructure.' },
  { icon: Brain, title: 'AI & Automation', description: 'Intelligent systems that eliminate friction and amplify human potential.' },
  { icon: Shield, title: 'Security First', description: 'Every line of code built with enterprise-grade protection in mind.' },
  { icon: Sparkles, title: 'Exceptional UX', description: 'Interfaces people love to use—intuitive, fast, and accessible.' },
  { icon: Cloud, title: 'Cloud Native', description: 'Infrastructure that grows with you, from startup to enterprise.' },
  { icon: Zap, title: 'Digital Transformation', description: 'Modernizing legacy systems and unlocking new business models.' },
]

/**
 * The offline fallback for the headline figures.
 *
 * These mirror what the API derives by counting published work (see
 * buildStats in backend/controllers/public.controller.js). They replace an
 * earlier set — "50+ Projects Delivered", "30+ Global Clients", "12+ Countries
 * Served" — that was simply not true, and that nothing kept honest as the real
 * work changed.
 *
 * Keep these in step with what is actually shipped, or leave them: the live
 * site prefers the counted version whenever the API is reachable.
 */
export const stats = [
  { value: 4, suffix: '+', label: 'Years Building' },
  { value: 2, suffix: '', label: 'Projects Delivered' },
  { value: 2, suffix: '', label: 'Live in Production' },
]

/**
 * Empty until a real client agrees to be named.
 *
 * This previously listed Safaricom, Flutterwave, Andela, M-Kopa, Twiga Foods,
 * Cellulant, Sendy, Lori Systems, Copia and Tala. They are real companies and
 * none of them are DraftBit clients.
 *
 * The homepage marquee falls back to what DraftBit builds while this is empty,
 * so there is no pressure to fill it with anything that is not true.
 */
export const clients = []

export const allProjects = [
  {
    slug: 'fibi-community',
    title: 'FIBI',
    description: 'A fractional land-investment platform for co-owning vetted Kenyan projects—eco-lodges, solar, and agriculture—starting from a low minimum.',
    tags: ['React 19', 'TypeScript', 'Express', 'Prisma', 'PostgreSQL'],
    icon: BarChart3,
    category: 'Web',
    gradient: 'from-cyan-500/20 to-violet-500/20',
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1200&auto=format&fit=crop',
    imageAlt: 'Aerial view of open farmland, representing the land projects FIBI members co-own',
    featured: true,
    liveUrl: 'https://fibicommunity.org',
    client: 'FIBI — For Investors By Investors',
    role: 'Lead Engineer',
    year: '2026',
    challenge: 'Fractional land investment puts three different audiences on one platform: prospective investors evaluating listings, members tracking positions and payouts, and operators reconciling money and approving applications. Each needs its own surface and permissions. Settlement had to cover both card and bank wire across two currencies without the money logic forking into parallel code paths.',
    solution: 'A full-stack product designed and built end to end: React 19, TypeScript, Vite, Tailwind CSS v4, Radix UI, React Router and Recharts on the front end, with an Express, Prisma and PostgreSQL 16 back end. It is organised as three deliberately distinct interface layers—a marketing site, a signed-in investor portal, and an operator console with a ⌘K command palette—each with its own chrome so users always know which surface they are on. The portal covers portfolio allocation and growth charts, wallet activity, deposits, withdrawals, payout schedules and per-project positions; a tiered membership system (Free through Investor+) handles reviewed applications, invoices, renewals and a gated members hub; the marketplace lists vetted projects with live funding progress, projected ROI, timelines and minimums. Card and bank-wire settlement run through one code path, dual currency (KES/USD), with money stored as integer minor units. Security covers JWT in httpOnly cookies, bcrypt at cost 12, account lockout, per-IP rate limiting, a server-side password policy and MX-checked email validation at signup. It ships fully containerised via Docker Compose—nginx reverse proxy, static front end, API, database and certbot—behind Cloudflare on Full strict TLS with Let\'s Encrypt origin certificates, origin locked to Cloudflare IPs, automated migrations on deploy and scheduled database backups.',
    results: [
      'Live in production at fibicommunity.org',
      'Three distinct surfaces: marketing, investor portal, operator console',
      'Card and bank-wire settlement through one code path',
      'Dual currency (KES/USD), money stored as integer minor units',
      'Responsive and audited from 320px to 2560px',
      'Automated TLS renewal and scheduled database backups',
    ],
  },
  {
    slug: 'shoelocker-storefront',
    title: 'ShoeLocker',
    description: 'E-commerce storefront deployed as a third tenant on a VPS already running two production applications behind a shared nginx container.',
    tags: ['React 19', 'Flask', 'PostgreSQL', 'Docker'],
    icon: ShoppingCart,
    category: 'Web',
    gradient: 'from-cyan-500/20 to-transparent',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1200&auto=format&fit=crop',
    featured: true,
    client: 'ShoeLocker (danzykicks.com)',
    year: '2026',
    challenge: 'The target VPS already served two unrelated production applications behind a single shared nginx container that owned ports 80 and 443. Adding a third site meant working inside that arrangement—without provisioning new infrastructure, and without taking the existing tenants offline.',
    solution: 'We attached the ShoeLocker stack—React 19 + Vite SPA, Flask REST API on Gunicorn, PostgreSQL 16, containerized end-to-end with Docker Compose behind Cloudflare—to the proxy\'s Docker network under dedicated service aliases and published zero host ports, so the storefront and API are reachable only by the proxy, by name. An isolated vhost for danzykicks.com was added alongside the existing ones, and the site went live on a graceful config reload. Pre-deploy review also caught credentials being baked into the backend image—.dockerignore patterns are anchored at the build-context root, so a rule written for .env never matched the nested file the service actually loaded—and an npm lockfile out of sync with package.json that broke reproducible builds.',
    results: ['Zero host ports published', 'No downtime on cutover', 'Neither existing application restarted', 'Secrets kept out of image layers'],
  },
  {
    slug: 'e-commerce-platform',
    title: 'E-Commerce Platform',
    description: 'Full-stack online store with cart, checkout, and admin dashboard for a retail brand scaling across regions.',
    tags: ['React', 'Node.js', 'Stripe'],
    icon: Globe,
    category: 'Web',
    gradient: 'from-cyan-500/20 to-transparent',
    image: 'https://images.unsplash.com/photo-1557821552-17105176677c?q=80&w=1200&auto=format&fit=crop',
    featured: true,
    client: 'East Africa Retail Group',
    year: '2024',
    challenge: 'A growing retail brand needed a unified e-commerce platform to replace fragmented storefronts across three countries, with real-time inventory and localized payments.',
    solution: 'We built a headless commerce platform with React storefront, Node.js API, Stripe and M-Pesa integration, and a real-time admin dashboard for inventory and orders.',
    results: ['3x online revenue in 12 months', 'Unified inventory across 3 countries', 'Sub-2s page load on mobile', '99.9% uptime since launch'],
  },
  {
    slug: 'fitness-mobile-app',
    title: 'Fitness Mobile App',
    description: 'Cross-platform app with workout tracking, progress charts, and subscription management.',
    tags: ['React Native', 'Firebase', 'Stripe'],
    icon: Smartphone,
    category: 'Mobile',
    gradient: 'from-violet-500/20 to-transparent',
    image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1200&auto=format&fit=crop',
    featured: true,
    client: 'HealthTech Startup',
    year: '2024',
    challenge: 'A fitness startup needed a single codebase for iOS and Android with offline workout tracking and subscription billing.',
    solution: 'React Native app with Firebase backend, offline-first architecture, and Stripe subscription management with in-app purchase support.',
    results: ['50k+ downloads in 6 months', '4.8★ average app store rating', '40% subscription conversion rate', 'Single codebase for both platforms'],
  },
  {
    slug: 'analytics-dashboard',
    title: 'Analytics Dashboard',
    description: 'Real-time analytics with custom charts, filters, and export for daily reporting.',
    tags: ['React', 'D3.js', 'REST API'],
    icon: Layers,
    category: 'Dashboard',
    gradient: 'from-violet-500/20 to-transparent',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200&auto=format&fit=crop',
    featured: false,
    client: 'Data-Driven Enterprise',
    year: '2023',
    challenge: 'Internal teams relied on spreadsheets for daily reporting, causing delays and inconsistent data across departments.',
    solution: 'Custom React dashboard with D3.js visualizations, role-based access, scheduled exports, and real-time API feeds from existing systems.',
    results: ['80% reduction in reporting time', 'Real-time data across 12 departments', 'Automated daily email reports', 'Zero spreadsheet dependency'],
  },
  {
    slug: 'brand-design-system',
    title: 'Brand & Design System',
    description: 'Visual identity and component library for a B2B SaaS product.',
    tags: ['Figma', 'Storybook', 'Design Tokens'],
    icon: Palette,
    category: 'Design',
    gradient: 'from-cyan-500/20 to-violet-500/20',
    image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=1200&auto=format&fit=crop',
    featured: false,
    client: 'B2B SaaS Company',
    year: '2023',
    challenge: 'A SaaS product had inconsistent UI across web and marketing, slowing development and hurting brand perception.',
    solution: 'Complete design system in Figma with design tokens, Storybook component library, and documentation for engineering handoff.',
    results: ['60% faster UI development', '100% component consistency', 'Unified brand across web & marketing', 'Developer-friendly documentation'],
  },
  {
    slug: 'booking-scheduling',
    title: 'Booking & Scheduling',
    description: 'Web app for appointment booking, calendar sync, reminders, and payments.',
    tags: ['React', 'Node.js', 'Twilio'],
    icon: Globe,
    category: 'Web',
    gradient: 'from-cyan-500/20 to-transparent',
    image: 'https://images.unsplash.com/photo-1506784365847-bbad939e9335?q=80&w=1200&auto=format&fit=crop',
    featured: false,
    client: 'Service Business Network',
    year: '2023',
    challenge: 'A network of service providers struggled with no-shows and manual scheduling across multiple locations.',
    solution: 'Booking platform with Google Calendar sync, SMS reminders via Twilio, online payments, and a provider admin portal.',
    results: ['45% reduction in no-shows', 'Automated scheduling for 200+ providers', 'Integrated payment collection', 'Calendar sync for all staff'],
  },
  {
    slug: 'internal-tooling',
    title: 'Internal Tooling Suite',
    description: 'Custom internal tools for operations: inventory, workflows, and reporting.',
    tags: ['React', 'Node.js', 'PostgreSQL'],
    icon: Code,
    category: 'Web',
    gradient: 'from-violet-500/20 to-transparent',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200&auto=format&fit=crop',
    featured: false,
    client: 'Operations Team',
    year: '2022',
    challenge: 'Operations ran on spreadsheets and email chains, creating bottlenecks and data silos across teams.',
    solution: 'Suite of internal tools: inventory management, workflow automation, and custom reporting—all integrated with existing PostgreSQL databases.',
    results: ['Replaced 15+ spreadsheets', '50% faster order processing', 'Single source of truth for inventory', 'Custom reports on demand'],
  },
]

export const featuredProjects = allProjects.filter((p) => p.featured)
export const getProjectBySlug = (slug) => allProjects.find((p) => p.slug === slug)

export const techStack = [
  { name: 'React', category: 'Frontend' },
  { name: 'Next.js', category: 'Frontend' },
  { name: 'TypeScript', category: 'Language' },
  { name: 'Node.js', category: 'Backend' },
  { name: 'Python', category: 'Backend' },
  { name: 'PostgreSQL', category: 'Database' },
  { name: 'MongoDB', category: 'Database' },
  { name: 'AWS', category: 'Cloud' },
  { name: 'Docker', category: 'DevOps' },
  { name: 'React Native', category: 'Mobile' },
  { name: 'GraphQL', category: 'API' },
  { name: 'Tailwind CSS', category: 'Frontend' },
  { name: 'Firebase', category: 'Backend' },
  { name: 'Kubernetes', category: 'DevOps' },
  { name: 'Figma', category: 'Design' },
]

export const processSteps = [
  { step: '01', title: 'Discover', description: 'We align on goals, scope, and success metrics so we build the right thing.', icon: Search },
  { step: '02', title: 'Design', description: 'Wireframes, prototypes, and UI design—iterating until it feels right.', icon: PenTool },
  { step: '03', title: 'Build', description: 'Clean, scalable code with tests and documentation. We ship in iterations.', icon: Code },
  { step: '04', title: 'Launch', description: 'Deploy, monitor, and support. We stay involved after go-live when you need us.', icon: Rocket },
]

export const team = [
  { name: 'Alex Kimani', role: 'Founder & Lead Engineer', focus: 'Architecture, backend, and delivery.', avatar: 'AK', linkedin: '#' },
  { name: 'Sarah Mwangi', role: 'Product & Design Lead', focus: 'UX, UI, and design systems.', avatar: 'SM', linkedin: '#' },
  { name: 'James Ochieng', role: 'Senior Full-Stack Developer', focus: 'Web and mobile applications.', avatar: 'JO', linkedin: '#' },
  { name: 'Grace Wanjiku', role: 'DevOps & Cloud Engineer', focus: 'Infrastructure and deployment.', avatar: 'GW', linkedin: '#' },
]

export const testimonials = [
  { quote: "DraftBit took our rough concept and turned it into a product we're proud of. Professional, on time, and great to work with.", author: 'Sarah M.', role: 'Product Lead, SaaS Company', avatar: 'SM' },
  { quote: 'Their team delivered a complex ERP system on schedule. The attention to detail and communication throughout was exceptional.', author: 'James O.', role: 'Operations Director, Retail Brand', avatar: 'JO' },
  { quote: 'From discovery to launch, DraftBit felt like an extension of our team. Our mobile app exceeded every expectation.', author: 'Alex K.', role: 'Founder, HealthTech Startup', avatar: 'AK' },
]

export const faqs = [
  { question: 'How quickly do you respond to inquiries?', answer: 'We aim to reply within 24 hours on business days. For urgent requests, mention it in your message.' },
  { question: 'Do you offer free consultations?', answer: 'Yes. We offer a free initial call to discuss your project, scope, and timeline. No commitment required.' },
  { question: 'What kind of projects do you take on?', answer: 'Web apps, mobile apps, dashboards, e-commerce, ERP, CRM, APIs, and design systems—from MVPs to enterprise builds.' },
  { question: 'Can we meet in person or only remotely?', answer: 'We\'re based in Nairobi and happy to meet locally. We also work with clients worldwide over video calls.' },
  { question: 'What are your typical project timelines?', answer: 'MVPs typically take 6–12 weeks. Full product builds range from 3–9 months depending on scope. We\'ll give you a clear timeline after discovery.' },
  { question: 'Do you provide ongoing support after launch?', answer: 'Absolutely. We offer maintenance packages, feature iterations, and on-call support so your product keeps performing.' },
]

export const businessHours = [
  { days: 'Monday – Friday', time: '9:00 AM – 6:00 PM EAT' },
  { days: 'Saturday', time: '10:00 AM – 2:00 PM EAT' },
  { days: 'Sunday', time: 'Closed' },
]

export const blogPosts = [
  {
    slug: 'building-for-africa-global-tech',
    title: 'Building for Africa, Competing Globally',
    excerpt: 'How Nairobi-born tech teams are shipping world-class products that scale across continents.',
    category: 'Industry',
    date: '2025-11-12',
    readTime: '6 min read',
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=800&auto=format&fit=crop',
  },
  {
    slug: 'why-clean-architecture-matters',
    title: 'Why Clean Architecture Matters for Startups',
    excerpt: 'The technical decisions you make early will either accelerate or cripple your growth. Here\'s what we recommend.',
    category: 'Engineering',
    date: '2025-10-28',
    readTime: '8 min read',
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=800&auto=format&fit=crop',
  },
  {
    slug: 'ai-automation-smb',
    title: 'AI & Automation for Growing Businesses',
    excerpt: 'Practical ways SMEs can leverage AI and automation without enterprise budgets or complexity.',
    category: 'Product',
    date: '2025-09-15',
    readTime: '5 min read',
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=800&auto=format&fit=crop',
  },
]

export const getBlogPostBySlug = (slug) => blogPosts.find((p) => p.slug === slug)

export const careers = [
  {
    slug: 'senior-fullstack-engineer',
    title: 'Senior Full-Stack Engineer',
    department: 'Engineering',
    location: 'Nairobi / Remote',
    type: 'Full-time',
    description: 'Build scalable web and mobile products for clients across Africa and beyond. You\'ll own features end-to-end—from API design to polished UI.',
    requirements: ['5+ years full-stack experience', 'Strong React & Node.js skills', 'Experience with PostgreSQL or MongoDB', 'Comfortable with client communication'],
  },
  {
    slug: 'product-designer',
    title: 'Product Designer',
    department: 'Design',
    location: 'Nairobi / Hybrid',
    type: 'Full-time',
    description: 'Shape intuitive, beautiful interfaces for web and mobile products. You\'ll work closely with engineers and clients from discovery to delivery.',
    requirements: ['3+ years product/UI design experience', 'Proficiency in Figma', 'Portfolio demonstrating web & mobile work', 'Understanding of design systems'],
  },
  {
    slug: 'devops-engineer',
    title: 'DevOps Engineer',
    department: 'Engineering',
    location: 'Remote',
    type: 'Full-time',
    description: 'Design and maintain cloud infrastructure for client projects. CI/CD pipelines, monitoring, and security are your domain.',
    requirements: ['3+ years DevOps/SRE experience', 'AWS or GCP proficiency', 'Docker & Kubernetes knowledge', 'Infrastructure as Code (Terraform preferred)'],
  },
]

export const getCareerBySlug = (slug) => careers.find((c) => c.slug === slug)

export const socialLinks = [
  { label: 'LinkedIn', href: 'https://linkedin.com' },
  { label: 'GitHub', href: 'https://github.com' },
  { label: 'Twitter', href: 'https://twitter.com' },
  { label: 'Instagram', href: 'https://instagram.com' },
]

export const engagementModels = [
  { title: 'Fixed Project', description: 'Defined scope, timeline, and deliverables. Best for MVPs and well-specified builds.', icon: '🎯' },
  { title: 'Dedicated Team', description: 'Embedded engineers working as an extension of your team. Best for ongoing product development.', icon: '👥' },
  { title: 'Retainer', description: 'Monthly hours for maintenance, iterations, and support. Best for launched products.', icon: '🔄' },
]

export const services = [
  { icon: Code, title: 'Custom Software', description: 'Tailor-made applications designed to solve your specific business challenges with scalable architecture.', features: ['Web & mobile apps', 'API development', 'Third-party integrations'] },
  { icon: Globe, title: 'Website Development', description: 'High-performance, responsive, and SEO-optimized websites that convert visitors into customers.', features: ['Corporate websites', 'Landing pages', 'E-commerce stores'] },
  { icon: Database, title: 'ERP Systems', description: 'Integrated management of main business processes in real-time through custom software.', features: ['Inventory management', 'HR & payroll', 'Financial reporting'] },
  { icon: BarChart3, title: 'CRM Solutions', description: 'Customer relationship tools to manage interactions with current and potential customers.', features: ['Lead tracking', 'Sales pipelines', 'Customer portals'] },
  { icon: ShoppingCart, title: 'POS Systems', description: 'Modern Point of Sale systems that streamline transactions and inventory management.', features: ['Multi-location support', 'Receipt & invoicing', 'Real-time stock sync'] },
  { icon: Workflow, title: 'Automation & API', description: 'Connect your tools and automate repetitive workflows to save time and reduce errors.', features: ['Workflow automation', 'API design', 'System integrations'] },
]

export const values = [
  { title: 'Quality First', description: 'We ship clean, maintainable code and pixel-perfect design. No shortcuts—just work we\'re proud of.', icon: Award },
  { title: 'Collaboration', description: 'We work closely with you from idea to launch and beyond. You\'re part of the process, not just the brief.', icon: Users },
  { title: 'Transparency', description: 'Clear communication, honest timelines, and no hidden fees. You always know where the project stands.', icon: Shield },
  { title: 'Innovation', description: 'We stay current with tools and practices that deliver results. Your product benefits from what we learn.', icon: Lightbulb },
]

/**
 * Dated from the real founding year, 2022. The previous version opened in 2019
 * and closed on "serving clients across 12+ countries", neither of which was
 * true — and the 2019 date contradicted the four years of building claimed
 * everywhere else on the site.
 */
export const timeline = [
  { year: '2022', title: 'Founded', description: 'DraftBit started in Nairobi, building web and mobile products end to end.' },
  { year: '2024', title: 'Full-Stack Delivery', description: 'Took products from first commit through to production infrastructure, not just the code.' },
  { year: '2026', title: 'Shipping in Production', description: 'FIBI and ShoeLocker live, both built and deployed end to end from Nairobi.' },
]

export const pageMeta = {
  home: { title: 'DraftBit | Africa\'s Bold Tech Studio', description: 'Expert full-stack development from Nairobi. Custom software, web apps, mobile products, and digital transformation.' },
  about: { title: 'About | DraftBit', description: 'Meet the team behind DraftBit. Our mission, values, and journey building world-class technology from Africa.' },
  services: { title: 'Services | DraftBit', description: 'Custom software, websites, ERP, CRM, POS, and automation solutions engineered for scale.' },
  projects: { title: 'Projects | DraftBit', description: 'Selected work we\'ve delivered for clients—web apps, mobile products, and design systems.' },
  contact: { title: 'Contact | DraftBit', description: 'Have a project in mind? Talk to us. Based in Nairobi, serving clients worldwide.' },
  careers: { title: 'Careers | DraftBit', description: 'Join our team building the future from Nairobi. Open roles in engineering and design.' },
  insights: { title: 'Insights | DraftBit', description: 'Engineering, product, and industry perspectives from the DraftBit team.' },
}
