const express = require('express');
const protect = require('../middleware/protect.middleware');
const requirePermission = require('../middleware/permission.middleware');
const { overview, traffic, sources, pages, summary } = require('../controllers/analytics.controller');

const analyticsRouter = express.Router();

analyticsRouter.use(protect);

analyticsRouter.get('/', requirePermission('read'), overview);
analyticsRouter.get('/summary', requirePermission('read'), summary);
analyticsRouter.get('/traffic', requirePermission('read'), traffic);
analyticsRouter.get('/sources', requirePermission('read'), sources);
analyticsRouter.get('/pages', requirePermission('read'), pages);

module.exports = analyticsRouter;
