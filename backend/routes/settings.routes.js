const express = require('express');
const protect = require('../middleware/protect.middleware');
const requirePermission = require('../middleware/permission.middleware');
const { get, save } = require('../controllers/settings.controller');

const settingsRouter = express.Router();

settingsRouter.use(protect);

settingsRouter.get('/', requirePermission('read'), get);
settingsRouter.put('/', requirePermission('manage_settings'), save);
settingsRouter.patch('/', requirePermission('manage_settings'), save);

module.exports = settingsRouter;
