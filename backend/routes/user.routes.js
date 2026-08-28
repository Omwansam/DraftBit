const express = require('express');
const protect = require('../middleware/protect.middleware');
const requirePermission = require('../middleware/permission.middleware');
const {
    list, getOne, create, resendInvite, update, remove, updateProfile,
} = require('../controllers/user.controller');

const userRouter = express.Router();

userRouter.use(protect);

// Editing your own name or avatar is not user management, so it sits above the
// manage_users gate - otherwise a Viewer could not change their own display name.
userRouter.patch('/me', updateProfile);
userRouter.put('/me', updateProfile);

userRouter.get('/', requirePermission('read'), list);
userRouter.get('/:id', requirePermission('read'), getOne);

userRouter.post('/', requirePermission('manage_users'), create);
userRouter.post('/:id/resend-invite', requirePermission('manage_users'), resendInvite);
userRouter.patch('/:id', requirePermission('manage_users'), update);
userRouter.put('/:id', requirePermission('manage_users'), update);
userRouter.delete('/:id', requirePermission('manage_users'), remove);

module.exports = userRouter;
