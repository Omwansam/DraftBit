const express = require('express');
const protect = require('../middleware/protect.middleware');
const requirePermission = require('../middleware/permission.middleware');
const { list } = require('../controllers/activity.controller');

const activityRouter = express.Router();

activityRouter.use(protect);

activityRouter.get('/', requirePermission('read'), list);

module.exports = activityRouter;
