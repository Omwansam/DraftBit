const express = require('express');
const { resources } = require('../config/resources');
const { site, listCollection, getBySlug, contact, track } = require('../controllers/public.controller');
const { contactLimiter, trackLimiter } = require('../middleware/rate-limit.middleware');

const publicRouter = express.Router();

// Whole site in one round trip, for a cold page load.
publicRouter.get('/site', site);

// Writes first, so a collection called "contact" could never shadow them.
publicRouter.post('/contact', contactLimiter, contact);
publicRouter.post('/track', trackLimiter, track);

// One read-only list per collection, plus a by-slug lookup where the
// collection has slugs. Registered from the same config the console uses, so
// the two can never disagree about what is published.
for (const [name, config] of Object.entries(resources)) {
    publicRouter.get(`/${name}`, listCollection(config));
    if (config.slugFrom) publicRouter.get(`/${name}/:slug`, getBySlug(config));
}

module.exports = publicRouter;
