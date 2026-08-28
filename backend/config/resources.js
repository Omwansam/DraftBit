/**
 * One entry per editable collection.
 *
 * The generic CRUD router (routes/resource.routes.js) is built from these, so
 * adding a collection is a matter of describing it here rather than writing
 * another seven near-identical handlers.
 *
 *   model            Prisma delegate name
 *   noun             used in messages: "That project no longer exists."
 *   label            field that names a record in the activity feed
 *   orderBy          admin list order
 *   publicWhere      filter applied on the public site - draft content is
 *                    excluded in the query, never in the response
 *   publicOrderBy    public list order
 *   slugFrom         field a slug is minted from, when the collection has one
 *   searchFields     columns ?q= searches
 *   create / update  validation schemas
 */

const V = require('../utils/validate.util');

const CONTENT_STATUS = ['draft', 'published', 'archived'];

/** Shared by every collection that carries a display position. */
const order = V.int({ min: 0, max: 100000 });

const projects = {
    model: 'project',
    noun: 'project',
    label: 'title',
    orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    publicWhere: { status: 'published' },
    publicOrderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    slugFrom: 'title',
    searchFields: ['title', 'description', 'client', 'category'],
    create: {
        title: V.line(200, { required: true }),
        slug: V.line(90),
        description: V.text(2000),
        tags: V.arr(V.line(40), { max: 20 }),
        icon: V.line(40, { default: 'Globe' }),
        category: V.line(60, { default: 'Web' }),
        status: V.enumOf(CONTENT_STATUS, { default: 'draft' }),
        featured: V.bool({ default: false }),
        client: V.line(120),
        role: V.line(120),
        year: V.line(10),
        liveUrl: V.url(),
        image: V.url(),
        imageAlt: V.line(200),
        challenge: V.text(4000),
        solution: V.text(4000),
        results: V.arr(V.line(300), { max: 20 }),
        order,
    },
};

const insights = {
    model: 'insight',
    noun: 'insight',
    label: 'title',
    orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
    publicWhere: { status: 'published' },
    publicOrderBy: [{ publishedAt: 'desc' }],
    slugFrom: 'title',
    searchFields: ['title', 'excerpt', 'body', 'author', 'category'],
    create: {
        title: V.line(200, { required: true }),
        slug: V.line(90),
        excerpt: V.text(600),
        body: V.text(60000),
        category: V.line(60, { default: 'Engineering' }),
        author: V.line(120),
        status: V.enumOf(CONTENT_STATUS, { default: 'draft' }),
        featured: V.bool({ default: false }),
        readTime: V.line(20),
        publishedAt: V.date(),
        image: V.url(),
        tags: V.arr(V.line(40), { max: 20 }),
        order,
    },
    /** Publishing without an explicit date stamps one, so the feed sorts right. */
    beforeWrite: (data, existing) => {
        if (data.status === 'published' && !data.publishedAt && !existing?.publishedAt) {
            return { ...data, publishedAt: new Date() };
        }
        return data;
    },
};

const careers = {
    model: 'career',
    noun: 'role',
    label: 'title',
    orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    publicWhere: { status: 'open' },
    publicOrderBy: [{ order: 'asc' }, { postedAt: 'desc' }],
    slugFrom: 'title',
    searchFields: ['title', 'department', 'location', 'description'],
    create: {
        title: V.line(200, { required: true }),
        slug: V.line(90),
        department: V.line(80, { default: 'Engineering' }),
        location: V.line(120),
        type: V.line(40, { default: 'Full-time' }),
        status: V.enumOf(['draft', 'open', 'closed'], { default: 'draft' }),
        description: V.text(20000),
        requirements: V.arr(V.line(300), { max: 40 }),
        postedAt: V.date(),
        order,
    },
    beforeWrite: (data, existing) => {
        if (data.status === 'open' && !data.postedAt && !existing?.postedAt) {
            return { ...data, postedAt: new Date() };
        }
        return data;
    },
};

const team = {
    model: 'teamMember',
    noun: 'team member',
    label: 'name',
    orderBy: [{ order: 'asc' }, { name: 'asc' }],
    publicWhere: { status: 'active' },
    publicOrderBy: [{ order: 'asc' }],
    searchFields: ['name', 'role', 'focus', 'email'],
    create: {
        name: V.line(120, { required: true }),
        role: V.line(120),
        focus: V.line(200),
        email: V.email({ required: true, lower: true }),
        linkedin: V.url(),
        github: V.url(),
        avatarUrl: V.url(),
        status: V.enumOf(['active', 'inactive'], { default: 'active' }),
        joinedAt: V.date(),
        order,
    },
};

const testimonials = {
    model: 'testimonial',
    noun: 'testimonial',
    label: 'author',
    orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    publicWhere: { status: 'published' },
    publicOrderBy: [{ order: 'asc' }],
    searchFields: ['quote', 'author', 'company'],
    create: {
        quote: V.text(1200, { required: true }),
        author: V.line(120, { required: true }),
        role: V.line(120),
        company: V.line(120),
        rating: V.int({ min: 1, max: 5, default: 5 }),
        status: V.enumOf(['pending', 'published', 'rejected'], { default: 'pending' }),
        order,
    },
};

const services = {
    model: 'service',
    noun: 'service',
    label: 'title',
    orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
    publicWhere: { status: 'published' },
    publicOrderBy: [{ order: 'asc' }],
    searchFields: ['title', 'description'],
    create: {
        icon: V.line(40, { default: 'Code' }),
        title: V.line(200, { required: true }),
        description: V.text(2000),
        features: V.arr(V.line(200), { max: 30 }),
        status: V.enumOf(CONTENT_STATUS, { default: 'published' }),
        order,
    },
};

const clients = {
    model: 'client',
    noun: 'client',
    label: 'name',
    orderBy: [{ order: 'asc' }, { name: 'asc' }],
    publicWhere: {},
    publicOrderBy: [{ order: 'asc' }],
    searchFields: ['name', 'industry'],
    create: {
        name: V.line(160, { required: true }),
        industry: V.line(120),
        website: V.url(),
        logoUrl: V.url(),
        featured: V.bool({ default: false }),
        order,
    },
};

const resources = { projects, insights, careers, team, testimonials, services, clients };

/**
 * An update schema is the create schema with nothing required. Deriving it
 * rather than writing a second copy is what stops the two drifting apart the
 * first time a column is added.
 */
for (const config of Object.values(resources)) {
    config.update = Object.fromEntries(
        Object.entries(config.create).map(([field, rule]) => [field, { ...rule, required: false }]),
    );
}

module.exports = { resources };
