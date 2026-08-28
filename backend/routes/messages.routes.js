const express = require('express');
const protect = require('../middleware/protect.middleware');
const requirePermission = require('../middleware/permission.middleware');
const {
    list, unreadCount, getOne, update, bulkUpdate, remove, bulkRemove,
} = require('../controllers/messages.controller');

const messagesRouter = express.Router();

messagesRouter.use(protect);

// Declared before '/:id' so the literal path is not captured as an id.
messagesRouter.get('/unread-count', requirePermission('read'), unreadCount);

messagesRouter.get('/', requirePermission('read'), list);
messagesRouter.patch('/', requirePermission('write'), bulkUpdate);
messagesRouter.delete('/', requirePermission('delete'), bulkRemove);

messagesRouter.get('/:id', requirePermission('read'), getOne);
messagesRouter.patch('/:id', requirePermission('write'), update);
messagesRouter.put('/:id', requirePermission('write'), update);
messagesRouter.delete('/:id', requirePermission('delete'), remove);

module.exports = messagesRouter;
