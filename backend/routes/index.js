/**
 * Every route the API answers, mounted under /api/v1.
 *
 * The version prefix lives here and nowhere else: index.js mounts this one
 * router, so moving to /api/v2 later is a single change rather than an edit to
 * every route file.
 */

const express = require('express');
const { resources } = require('../config/resources');
const { mountResources } = require('./resource.routes');

const apiRouter = express.Router();

/* ------------------------------- Public ---------------------------------- */
// No token required. Mounted first so the marketing site never touches auth.
apiRouter.use('/public', require('./public.routes'));

/* -------------------------------- Auth ----------------------------------- */
// Mixed: /login and /refresh are open by necessity, /me is protected inside.
apiRouter.use('/auth', require('./auth.routes'));

/* ---------------------------- Authenticated ------------------------------ */
apiRouter.use('/users', require('./user.routes'));

/** Route names, for the boot banner and GET /api/v1. */
const routeNames = [
    'public', 'auth', 'users', 'messages', 'settings', 'activity', 'analytics',
    ...Object.keys(resources),
];

apiRouter.get('/', (_req, res) => {
    res.json({
        name: 'DraftBit API',
        version: 'v1',
        routes: routeNames.map((name) => `/api/v1/${name}`),
    });
});

// Each router below applies `protect` itself. A blanket gate here would also
// swallow unknown paths, so a typo'd URL would answer "please sign in" instead
// of a 404.
apiRouter.use('/messages', require('./messages.routes'));
apiRouter.use('/settings', require('./settings.routes'));
apiRouter.use('/activity', require('./activity.routes'));
apiRouter.use('/analytics', require('./analytics.routes'));

// projects, insights, careers, team, testimonials, services, clients
mountResources(apiRouter, resources);

module.exports = { apiRouter, routeNames };
