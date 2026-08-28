const express = require('express');
const protect = require('../middleware/protect.middleware');
const requirePermission = require('../middleware/permission.middleware');
const resourceController = require('../controllers/resource.controller');

/**
 * Build one CRUD router for a collection.
 *
 * Route order matters: `/reorder` is declared before `/:id` because Express
 * matches in declaration order, and `/:id` would otherwise swallow it and try
 * to look up a record whose id is the literal string "reorder".
 */
function resourceRouter(name, config) {
    const router = express.Router();
    const c = resourceController(name, config);

    router.use(protect);

    router.post('/reorder', requirePermission('write'), c.reorder);

    router.get('/', requirePermission('read'), c.list);
    router.post('/', requirePermission('write'), c.create);
    router.patch('/', requirePermission('write'), c.bulkUpdate);
    router.delete('/', requirePermission('delete'), c.bulkRemove);

    router.get('/:id', requirePermission('read'), c.getOne);
    // PUT is accepted as an alias so a client that prefers it works; both merge
    // the supplied fields rather than blanking the ones left out.
    router.patch('/:id', requirePermission('write'), c.update);
    router.put('/:id', requirePermission('write'), c.update);
    router.delete('/:id', requirePermission('delete'), c.remove);

    return router;
}

/** Mount every registered collection onto a parent router. */
function mountResources(parent, registry) {
    for (const [name, config] of Object.entries(registry)) {
        parent.use(`/${name}`, resourceRouter(name, config));
    }
    return parent;
}

module.exports = { resourceRouter, mountResources };
