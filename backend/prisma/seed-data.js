/**
 * The real DraftBit content, in database shapes.
 *
 * Transcribed from company/src/data/site.js, which is what the marketing site
 * renders before the API answers. Keeping the two in step matters: the static
 * file is the fallback the site shows when the API is unreachable, so a visitor
 * should not be able to tell which one they are looking at.
 *
 * Differences from the static file are all schema-driven:
 *   icon      a lucide component there, the component's name here
 *   gradient  presentation only, no column
 *   date      publishedAt
 *   avatar    derived from the name at render time, so avatarUrl stays empty
 *   clients   plain strings there, records here
 */

/* -------------------------------------------------------------------------- */
/* Site settings                                                              */
/* -------------------------------------------------------------------------- */

const settings = {
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
    /**
     * Left empty on purpose.
     *
     * The public API derives these from what is actually in the database (see
     * buildStats in controllers/public.controller.js), so the figures cannot
     * drift away from the truth the way the previous hard-coded "50+ Projects
     * Delivered / 30+ Global Clients / 12+ Countries Served" had. Setting a
     * value here overrides the derived numbers - only do that for something
     * that is true and cannot be counted.
     */
    stats: [],
    /** Founding year, used to derive "years building". */
    foundedYear: 2022,
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
    features: { chatWidget: true, cookieBanner: true, newsletter: true, whatsapp: true },
};

/* -------------------------------------------------------------------------- */
/* Staff accounts                                                             */
/* -------------------------------------------------------------------------- */

/**
 * The four founders and staff, plus one outstanding invitation so the invite
 * hand-off is exercisable without creating an account by hand.
 */
const users = [
    { username: 'alex', name: 'Alex Kimani', email: 'alex@draftbit.com', role: 'Owner', status: 'active' },
    { username: 'sarah', name: 'Sarah Mwangi', email: 'sarah@draftbit.com', role: 'Admin', status: 'active' },
    { username: 'james', name: 'James Ochieng', email: 'james@draftbit.com', role: 'Editor', status: 'active' },
    { username: 'grace', name: 'Grace Wanjiku', email: 'grace@draftbit.com', role: 'Editor', status: 'active' },
    { username: 'brian', name: 'Brian Otieno', email: 'brian@draftbit.com', role: 'Viewer', status: 'invited' },
];

/* -------------------------------------------------------------------------- */
/* Team (the public "who we are" grid)                                        */
/* -------------------------------------------------------------------------- */

const team = [
    {
        name: 'Alex Kimani',
        role: 'Founder & Lead Engineer',
        focus: 'Architecture, backend, and delivery.',
        email: 'alex@draftbit.com',
        linkedin: 'https://linkedin.com',
        github: 'https://github.com',
        status: 'active',
        order: 0,
    },
    {
        name: 'Sarah Mwangi',
        role: 'Product & Design Lead',
        focus: 'UX, UI, and design systems.',
        email: 'sarah@draftbit.com',
        linkedin: 'https://linkedin.com',
        status: 'active',
        order: 1,
    },
    {
        name: 'James Ochieng',
        role: 'Senior Full-Stack Developer',
        focus: 'Web and mobile applications.',
        email: 'james@draftbit.com',
        linkedin: 'https://linkedin.com',
        github: 'https://github.com',
        status: 'active',
        order: 2,
    },
    {
        name: 'Grace Wanjiku',
        role: 'DevOps & Cloud Engineer',
        focus: 'Infrastructure and deployment.',
        email: 'grace@draftbit.com',
        linkedin: 'https://linkedin.com',
        status: 'active',
        order: 3,
    },
];

/* -------------------------------------------------------------------------- */
/* Projects                                                                   */
/* -------------------------------------------------------------------------- */

/** `order` fixes the case-study grid; the two live builds lead. */
const projects = [
    {
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
            'Fractional land investment puts three different audiences on one platform: prospective investors evaluating listings, members tracking positions and payouts, and operators reconciling money and approving applications. Each needs its own surface and permissions. Settlement had to cover both card and bank wire across two currencies without the money logic forking into parallel code paths.',
        solution:
            'A full-stack product designed and built end to end: React 19, TypeScript, Vite, Tailwind CSS v4, Radix UI, React Router and Recharts on the front end, with an Express, Prisma and PostgreSQL 16 back end. It is organised as three deliberately distinct interface layers—a marketing site, a signed-in investor portal, and an operator console with a Command-K palette—each with its own chrome so users always know which surface they are on. The portal covers portfolio allocation and growth charts, wallet activity, deposits, withdrawals, payout schedules and per-project positions; a tiered membership system (Free through Investor+) handles reviewed applications, invoices, renewals and a gated members hub; the marketplace lists vetted projects with live funding progress, projected ROI, timelines and minimums. Card and bank-wire settlement run through one code path, dual currency (KES/USD), with money stored as integer minor units. Security covers JWT in httpOnly cookies, bcrypt at cost 12, account lockout, per-IP rate limiting, a server-side password policy and MX-checked email validation at signup. It ships fully containerised via Docker Compose—nginx reverse proxy, static front end, API, database and certbot—behind Cloudflare on Full strict TLS with Let\'s Encrypt origin certificates, origin locked to Cloudflare IPs, automated migrations on deploy and scheduled database backups.',
        results: [
            'Live in production at fibicommunity.org',
            'Three distinct surfaces: marketing, investor portal, operator console',
            'Card and bank-wire settlement through one code path',
            'Dual currency (KES/USD), money stored as integer minor units',
            'Responsive and audited from 320px to 2560px',
            'Automated TLS renewal and scheduled database backups',
        ],
        order: 0,
    },
    {
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
        role: 'Lead Engineer',
        year: '2026',
        liveUrl: 'https://danzykicks.com',
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1200&auto=format&fit=crop',
        imageAlt: 'A wall of sneakers, representing the ShoeLocker storefront',
        challenge:
            'The target VPS already served two unrelated production applications behind a single shared nginx container that owned ports 80 and 443. Adding a third site meant working inside that arrangement—without provisioning new infrastructure, and without taking the existing tenants offline.',
        solution:
            'We attached the ShoeLocker stack—React 19 + Vite SPA, Flask REST API on Gunicorn, PostgreSQL 16, containerized end-to-end with Docker Compose behind Cloudflare—to the proxy network under dedicated service aliases and published zero host ports, so the storefront and API are reachable only by the proxy, by name. An isolated vhost for danzykicks.com was added alongside the existing ones, and the site went live on a graceful config reload. Pre-deploy review also caught credentials being baked into the backend image—.dockerignore patterns are anchored at the build-context root, so a rule written for .env never matched the nested file the service actually loaded—and an npm lockfile out of sync with package.json that broke reproducible builds.',
        results: [
            'Zero host ports published',
            'No downtime on cutover',
            'Neither existing application restarted',
            'Secrets kept out of image layers',
        ],
        order: 1,
    },
    {
        slug: 'e-commerce-platform',
        title: 'E-Commerce Platform',
        description:
            'Full-stack online store with cart, checkout, and admin dashboard for a retail brand scaling across regions.',
        tags: ['React', 'Node.js', 'Stripe'],
        icon: 'Globe',
        category: 'Web',
        status: 'draft',
        featured: true,
        client: 'East Africa Retail Group',
        year: '2024',
        image: 'https://images.unsplash.com/photo-1557821552-17105176677c?q=80&w=1200&auto=format&fit=crop',
        challenge:
            'A growing retail brand needed a unified e-commerce platform to replace fragmented storefronts across three countries, with real-time inventory and localized payments.',
        solution:
            'We built a headless commerce platform with React storefront, Node.js API, Stripe and M-Pesa integration, and a real-time admin dashboard for inventory and orders.',
        results: [
            '3x online revenue in 12 months',
            'Unified inventory across 3 countries',
            'Sub-2s page load on mobile',
            '99.9% uptime since launch',
        ],
        order: 2,
    },
    {
        slug: 'fitness-mobile-app',
        title: 'Fitness Mobile App',
        description: 'Cross-platform app with workout tracking, progress charts, and subscription management.',
        tags: ['React Native', 'Firebase', 'Stripe'],
        icon: 'Smartphone',
        category: 'Mobile',
        status: 'draft',
        featured: true,
        client: 'HealthTech Startup',
        year: '2024',
        image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1200&auto=format&fit=crop',
        challenge:
            'A fitness startup needed a single codebase for iOS and Android with offline workout tracking and subscription billing.',
        solution:
            'React Native app with Firebase backend, offline-first architecture, and Stripe subscription management with in-app purchase support.',
        results: [
            '50k+ downloads in 6 months',
            '4.8-star average app store rating',
            '40% subscription conversion rate',
            'Single codebase for both platforms',
        ],
        order: 3,
    },
    {
        slug: 'analytics-dashboard',
        title: 'Analytics Dashboard',
        description: 'Real-time analytics with custom charts, filters, and export for daily reporting.',
        tags: ['React', 'D3.js', 'REST API'],
        icon: 'Layers',
        category: 'Dashboard',
        status: 'draft',
        featured: false,
        client: 'Data-Driven Enterprise',
        year: '2023',
        image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200&auto=format&fit=crop',
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
        order: 4,
    },
    {
        slug: 'brand-design-system',
        title: 'Brand & Design System',
        description: 'Visual identity and component library for a B2B SaaS product.',
        tags: ['Figma', 'Storybook', 'Design Tokens'],
        icon: 'Palette',
        category: 'Design',
        status: 'draft',
        featured: false,
        client: 'B2B SaaS Company',
        year: '2023',
        image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=1200&auto=format&fit=crop',
        challenge:
            'A SaaS product had inconsistent UI across web and marketing, slowing development and hurting brand perception.',
        solution:
            'Complete design system in Figma with design tokens, Storybook component library, and documentation for engineering handoff.',
        results: [
            '60% faster UI development',
            '100% component consistency',
            'Unified brand across web & marketing',
            'Developer-friendly documentation',
        ],
        order: 5,
    },
    {
        slug: 'booking-scheduling',
        title: 'Booking & Scheduling',
        description: 'Web app for appointment booking, calendar sync, reminders, and payments.',
        tags: ['React', 'Node.js', 'Twilio'],
        icon: 'Globe',
        category: 'Web',
        status: 'draft',
        featured: false,
        client: 'Service Business Network',
        year: '2023',
        image: 'https://images.unsplash.com/photo-1506784365847-bbad939e9335?q=80&w=1200&auto=format&fit=crop',
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
        order: 6,
    },
    {
        slug: 'internal-tooling',
        title: 'Internal Tooling Suite',
        description: 'Custom internal tools for operations: inventory, workflows, and reporting.',
        tags: ['React', 'Node.js', 'PostgreSQL'],
        icon: 'Code',
        category: 'Web',
        status: 'draft',
        featured: false,
        client: 'Operations Team',
        year: '2022',
        image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200&auto=format&fit=crop',
        challenge:
            'Operations ran on spreadsheets and email chains, creating bottlenecks and data silos across teams.',
        solution:
            'Suite of internal tools: inventory management, workflow automation, and custom reporting—all integrated with existing PostgreSQL databases.',
        results: [
            'Replaced 15+ spreadsheets',
            '50% faster order processing',
            'Single source of truth for inventory',
            'Custom reports on demand',
        ],
        order: 7,
    },
];

/* -------------------------------------------------------------------------- */
/* Insights (the site calls them blog posts)                                  */
/* -------------------------------------------------------------------------- */

/**
 * The static file carries only excerpts, because the marketing site never
 * rendered a full article. `body` is written here so the insight detail page
 * has something real to show once it reads from the API.
 */
const insights = [
    {
        slug: 'building-for-africa-global-tech',
        title: 'Building for Africa, Competing Globally',
        excerpt:
            'How Nairobi-born tech teams are shipping world-class products that scale across continents.',
        category: 'Industry',
        author: 'Alex Kimani',
        readTime: '6 min read',
        status: 'published',
        featured: true,
        publishedAt: new Date('2025-11-12T09:00:00Z'),
        image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=800&auto=format&fit=crop',
        tags: ['Africa', 'Engineering', 'Scale'],
        body: [
            'There is a persistent assumption that software built in Nairobi is software built for Nairobi. It is worth retiring. The teams we work alongside ship to users in Lagos, London and Lisbon, and the constraints that shaped how they build turn out to travel remarkably well.',
            '',
            '## Constraints make better engineers',
            '',
            'Intermittent connectivity, expensive data and a wide spread of device capability are not edge cases here — they are the median user. Designing for that produces habits that any product benefits from: offline-first data layers, payloads measured in kilobytes rather than megabytes, and interfaces that stay usable on a four-year-old Android phone.',
            '',
            'A team that has optimised a checkout flow for a 3G connection has already solved most of the performance work a European client will ever ask for.',
            '',
            '## Payments are the real differentiator',
            '',
            'Mobile money is not a bolt-on in this market; it is the default. Building a settlement layer that treats M-Pesa, card and bank transfer as equal citizens forces a cleaner abstraction than a stack that assumes a card and adds everything else later.',
            '',
            'We have written that layer more than once. Every time, the discipline of storing money as integer minor units and routing every rail through one code path has prevented an entire category of rounding and reconciliation bug.',
            '',
            '## What still needs work',
            '',
            'Distribution and credibility, mostly. The engineering is not the bottleneck. Convincing a procurement team in another timezone that a studio in Karen can carry an enterprise build is a longer conversation than the code ever is — and the only argument that reliably lands is a running production system with its uptime on display.',
        ].join('\n'),
        order: 0,
    },
    {
        slug: 'why-clean-architecture-matters',
        title: 'Why Clean Architecture Matters for Startups',
        excerpt:
            'The technical decisions you make early will either accelerate or cripple your growth. Here is what we recommend.',
        category: 'Engineering',
        author: 'James Ochieng',
        readTime: '8 min read',
        status: 'published',
        featured: false,
        publishedAt: new Date('2025-10-28T09:00:00Z'),
        image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=800&auto=format&fit=crop',
        tags: ['Architecture', 'Startups', 'Technical Debt'],
        body: [
            'Every startup we meet has been told to "move fast and refactor later". It is decent advice that becomes expensive the moment it is taken literally, because the parts of a system that are hard to change later are chosen in the first fortnight, usually by accident.',
            '',
            '## Three decisions worth slowing down for',
            '',
            '**Your data model.** Renaming a column is trivial. Discovering that a one-to-one relationship should always have been one-to-many, after eighteen months of production data, is not. Spend the extra afternoon.',
            '',
            '**Where your business rules live.** If the rule that decides whether an order can ship is written inside a React component, it will be rewritten — slightly differently — in the mobile app, the admin tool and the nightly job. Put it in one place the first time.',
            '',
            '**How money is represented.** Integer minor units, always. Floating point currency is a bug you have already written and have not yet noticed.',
            '',
            '## What genuinely can wait',
            '',
            'Microservices. Kubernetes. A message queue. Caching. An event bus. Every one of these solves a problem you will be able to describe precisely when you have it, and none of them are cheaper to adopt early.',
            '',
            'A single well-organised monolith with clear module boundaries will carry you further than most founders expect — and it stays easy to split apart precisely because the boundaries were already drawn.',
            '',
            '## The test we use',
            '',
            'Can a new engineer change one behaviour without reading the whole codebase? If yes, the architecture is clean enough for now. If no, no amount of infrastructure will rescue it.',
        ].join('\n'),
        order: 1,
    },
    {
        slug: 'ai-automation-smb',
        title: 'AI & Automation for Growing Businesses',
        excerpt:
            'Practical ways SMEs can leverage AI and automation without enterprise budgets or complexity.',
        category: 'Product',
        author: 'Sarah Mwangi',
        readTime: '5 min read',
        status: 'published',
        featured: false,
        publishedAt: new Date('2025-09-15T09:00:00Z'),
        image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=800&auto=format&fit=crop',
        tags: ['AI', 'Automation', 'SME'],
        body: [
            'Most of the value a mid-sized business gets from automation has nothing to do with a model. It comes from noticing that four people are retyping the same figure into three systems, and removing two of the steps.',
            '',
            '## Start with the boring wins',
            '',
            'Invoice data entry, appointment reminders, stock reorder thresholds, weekly reports that someone assembles by hand every Monday morning. None of it is glamorous. All of it is measurable, and most of it pays for itself inside a quarter.',
            '',
            'We usually ask a simple question during discovery: what does someone here do every week that they would describe as mindless? That list is the roadmap.',
            '',
            '## Where a model actually helps',
            '',
            'Classification and extraction, mostly. Reading a supplier invoice and pulling out line items. Routing an inbound enquiry to the right team. Summarising a long support thread for whoever picks it up next.',
            '',
            'These share a useful property: a wrong answer is cheap and visible, and a human is already in the loop. That is the right place to start, not customer-facing generation where an error reaches someone outside the business before anyone notices.',
            '',
            '## Keep a person in the loop',
            '',
            'The automations that survive contact with a real business are the ones that draft rather than decide. Let the system prepare the invoice, the reply, the reorder — and let a person approve it. Adoption is far higher, and the failure mode is a wasted minute rather than a wrong payment.',
        ].join('\n'),
        order: 2,
    },
];

/* -------------------------------------------------------------------------- */
/* Open roles                                                                 */
/* -------------------------------------------------------------------------- */

const careers = [
    {
        slug: 'senior-fullstack-engineer',
        title: 'Senior Full-Stack Engineer',
        department: 'Engineering',
        location: 'Nairobi / Remote',
        type: 'Full-time',
        status: 'open',
        description:
            'Build scalable web and mobile products for clients across Africa and beyond. You will own features end-to-end—from API design to polished UI.',
        requirements: [
            '5+ years full-stack experience',
            'Strong React & Node.js skills',
            'Experience with PostgreSQL or MongoDB',
            'Comfortable with client communication',
        ],
        order: 0,
    },
    {
        slug: 'product-designer',
        title: 'Product Designer',
        department: 'Design',
        location: 'Nairobi / Hybrid',
        type: 'Full-time',
        status: 'open',
        description:
            'Shape intuitive, beautiful interfaces for web and mobile products. You will work closely with engineers and clients from discovery to delivery.',
        requirements: [
            '3+ years product/UI design experience',
            'Proficiency in Figma',
            'Portfolio demonstrating web & mobile work',
            'Understanding of design systems',
        ],
        order: 1,
    },
    {
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
        order: 2,
    },
];

/* -------------------------------------------------------------------------- */
/* Testimonials                                                               */
/* -------------------------------------------------------------------------- */

const testimonials = [
    {
        quote:
            "DraftBit took our rough concept and turned it into a product we're proud of. Professional, on time, and great to work with.",
        author: 'Sarah M.',
        role: 'Product Lead',
        company: 'SaaS Company',
        rating: 5,
        status: 'published',
        order: 0,
    },
    {
        quote:
            'Their team delivered a complex ERP system on schedule. The attention to detail and communication throughout was exceptional.',
        author: 'James O.',
        role: 'Operations Director',
        company: 'Retail Brand',
        rating: 5,
        status: 'published',
        order: 1,
    },
    {
        quote:
            'From discovery to launch, DraftBit felt like an extension of our team. Our mobile app exceeded every expectation.',
        author: 'Alex K.',
        role: 'Founder',
        company: 'HealthTech Startup',
        rating: 5,
        status: 'published',
        order: 2,
    },
];

/* -------------------------------------------------------------------------- */
/* Clients                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Empty, deliberately.
 *
 * This list previously named Safaricom, Flutterwave, Andela, M-Kopa, Twiga
 * Foods, Cellulant, Sendy, Lori Systems, Copia and Tala as clients. They are
 * real companies and they are not DraftBit clients, so presenting them as one
 * is a claim a visitor could check and disprove in a minute.
 *
 * Add a client here only once they have agreed to be named. The homepage
 * marquee no longer depends on this list - it scrolls what DraftBit builds
 * instead of who for - so an empty table costs nothing.
 */
const clients = [];

/* -------------------------------------------------------------------------- */
/* Services                                                                   */
/* -------------------------------------------------------------------------- */

const services = [
    {
        icon: 'Code',
        title: 'Custom Software',
        description:
            'Tailor-made applications designed to solve your specific business challenges with scalable architecture.',
        features: ['Web & mobile apps', 'API development', 'Third-party integrations'],
        status: 'published',
        order: 0,
    },
    {
        icon: 'Globe',
        title: 'Website Development',
        description:
            'High-performance, responsive, and SEO-optimized websites that convert visitors into customers.',
        features: ['Corporate websites', 'Landing pages', 'E-commerce stores'],
        status: 'published',
        order: 1,
    },
    {
        icon: 'Database',
        title: 'ERP Systems',
        description:
            'Integrated management of main business processes in real-time through custom software.',
        features: ['Inventory management', 'HR & payroll', 'Financial reporting'],
        status: 'published',
        order: 2,
    },
    {
        icon: 'BarChart3',
        title: 'CRM Solutions',
        description:
            'Customer relationship tools to manage interactions with current and potential customers.',
        features: ['Lead tracking', 'Sales pipelines', 'Customer portals'],
        status: 'published',
        order: 3,
    },
    {
        icon: 'ShoppingCart',
        title: 'POS Systems',
        description:
            'Modern Point of Sale systems that streamline transactions and inventory management.',
        features: ['Multi-location support', 'Receipt & invoicing', 'Real-time stock sync'],
        status: 'published',
        order: 4,
    },
    {
        icon: 'Workflow',
        title: 'Automation & API',
        description:
            'Connect your tools and automate repetitive workflows to save time and reduce errors.',
        features: ['Workflow automation', 'API design', 'System integrations'],
        status: 'published',
        order: 5,
    },
];

/* -------------------------------------------------------------------------- */
/* Enquiries                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * A realistic inbox: unread at the top, some triaged, one archived, one closed,
 * and one obvious spam so the filters have something to filter. `daysAgo` is
 * resolved against the seed run, so the inbox always looks recent.
 */
const messages = [
    {
        name: 'Daniel Mutiso',
        email: 'daniel@kazipay.co.ke',
        subject: 'ERP build for a 40-person operation',
        message:
            'Hi DraftBit — we run a light manufacturing outfit in Industrial Area and everything is on spreadsheets. Inventory, payroll, and job costing. We saw the ERP page. What does a discovery engagement look like and roughly what should we budget?',
        status: 'new', read: false, starred: true, daysAgo: 0.3,
    },
    {
        name: 'Priya Shah',
        email: 'priya.shah@northloop.io',
        subject: 'React Native app — second opinion on architecture',
        message:
            'We have an existing RN app that is getting slow and we suspect the state layer is the problem. Would you take on a two-week audit engagement rather than a full build? Happy to share the repo under NDA.',
        status: 'new', read: false, starred: false, daysAgo: 0.9,
    },
    {
        name: 'Kwame Asante',
        email: 'k.asante@accraventures.com',
        subject: 'Partnership enquiry',
        message:
            'I run a small venture studio in Accra. We regularly need engineering partners for portfolio companies at pre-seed. Is there scope for a retainer arrangement across multiple products?',
        status: 'new', read: false, starred: false, daysAgo: 2.1,
    },
    {
        name: 'Lucy Njeri',
        email: 'lucy@brightpath.ac.ke',
        subject: 'School management portal',
        message:
            'We need a parent portal with fee statements and M-Pesa payments for about 1,200 students. Timeline is next academic term. Is that realistic?',
        status: 'replied', read: true, starred: true, daysAgo: 4.2, repliedDaysAgo: 3.8,
    },
    {
        name: 'Tom Bergman',
        email: 'tom@bergman-analytics.se',
        subject: 'Dashboard work — remote engagement',
        message:
            'Stockholm-based. We need a data dashboard front end on top of an existing Python API. Fully remote, roughly 8 weeks. Do you take on European clients and how do you handle timezone overlap?',
        status: 'replied', read: true, starred: false, daysAgo: 6.5, repliedDaysAgo: 6.0,
    },
    {
        name: 'Amina Hassan',
        email: 'amina@souqbox.com',
        subject: 'E-commerce replatform',
        message:
            'Currently on a hosted platform that we have outgrown — the fees are eating margin and we cannot customise checkout. Interested in what a headless build would cost.',
        status: 'in-progress', read: true, starred: false, daysAgo: 8.0,
    },
    {
        name: 'Recruiter Bot',
        email: 'noreply@devtalentpool.biz',
        subject: 'Top 1% developers available now!!',
        message: 'Hire pre-vetted developers at 70% discount. Reply YES for a callback within 5 minutes.',
        status: 'spam', read: true, starred: false, daysAgo: 9.4, source: 'Contact form',
    },
    {
        name: 'Victor Kiplagat',
        email: 'victor.k@ridgefarm.co.ke',
        subject: 'Farm logistics tracking',
        message:
            'We move produce from Nakuru to Nairobi daily and have no visibility once a truck leaves. Looking for something simple — driver app plus a dispatcher view. Nothing fancy.',
        status: 'archived', read: true, starred: false, daysAgo: 14.0,
    },
    {
        name: 'Fatima Yusuf',
        email: 'fatima@medicare-clinics.com',
        subject: 'Clinic booking system',
        message:
            'Four clinics, shared doctor roster, patients currently book by phone. We want online booking with SMS reminders. Also need to think about patient data handling.',
        status: 'replied', read: true, starred: true, daysAgo: 18.5, repliedDaysAgo: 17.9,
    },
    {
        name: 'Steven Wachira',
        email: 'steve@wachira-legal.co.ke',
        subject: 'Website redesign',
        message:
            'Law firm, 12 partners. Our site is from 2016 and looks it. Mostly a credibility exercise — we want it to look serious and load fast. No CMS complexity please.',
        status: 'closed', read: true, starred: false, daysAgo: 26.0,
    },
];

/* -------------------------------------------------------------------------- */
/* Analytics history                                                          */
/* -------------------------------------------------------------------------- */

/**
 * 120 days of traffic, generated rather than listed.
 *
 * The dashboard compares a window against the one before it, so a flat line
 * would make every delta read as "no change" and hide whether the comparison
 * works at all. This has a weekday/weekend rhythm and mild growth, so the
 * charts and the deltas both have something true to show.
 */
function trafficHistory(days = 120) {
    const rows = [];
    const today = new Date();
    const midnight = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());

    for (let i = days - 1; i >= 0; i -= 1) {
        const date = new Date(midnight - i * 86400000);
        const dow = date.getUTCDay();

        // Weekends run roughly 45% of a weekday for a B2B studio site.
        const weekend = dow === 0 || dow === 6 ? 0.45 : 1;
        // Gentle growth across the window, plus day-to-day noise.
        const growth = 1 + ((days - i) / days) * 0.35;
        const noise = 0.82 + Math.random() * 0.36;

        const visitors = Math.round(120 * weekend * growth * noise);
        const pageViews = Math.round(visitors * (2.1 + Math.random() * 0.9));
        // Enquiries are rare and lumpy - most days have none.
        const enquiries = Math.random() < 0.28 ? Math.ceil(Math.random() * 3) : 0;

        rows.push({ date, visitors, pageViews, enquiries });
    }
    return rows;
}

const trafficSources = [
    { source: 'Organic search', visitors: 6120 },
    { source: 'Direct', visitors: 3480 },
    { source: 'Referral', visitors: 1290 },
    { source: 'Social', visitors: 940 },
    { source: 'Email', visitors: 310 },
];

const pageStats = [
    { path: '/', title: 'Home', views: 9840, totalSeconds: 561880, bounces: 3740 },
    { path: '/projects', title: 'Projects', views: 4210, totalSeconds: 391530, bounces: 1010 },
    { path: '/services', title: 'Services', views: 3180, totalSeconds: 254400, bounces: 890 },
    { path: '/contact', title: 'Contact', views: 2440, totalSeconds: 175680, bounces: 460 },
    { path: '/about', title: 'About', views: 2050, totalSeconds: 143500, bounces: 720 },
    { path: '/insights', title: 'Insights', views: 1620, totalSeconds: 145800, bounces: 580 },
    { path: '/careers', title: 'Careers', views: 1180, totalSeconds: 82600, bounces: 490 },
    { path: '/projects/fibi-community', title: 'FIBI — Case study', views: 980, totalSeconds: 127400, bounces: 210 },
    { path: '/projects/shoelocker-storefront', title: 'ShoeLocker — Case study', views: 720, totalSeconds: 86400, bounces: 180 },
    { path: '/insights/building-for-africa-global-tech', title: 'Building for Africa', views: 640, totalSeconds: 89600, bounces: 240 },
];

module.exports = {
    settings, users, team, projects, insights, careers, testimonials, clients, services,
    messages, trafficHistory, trafficSources, pageStats,
};
