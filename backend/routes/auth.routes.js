const express = require('express');
const protect = require('../middleware/protect.middleware');
const {
    login, refresh, logout, me, checkInvite, acceptInvite, changePassword,
} = require('../controllers/auth.controller');
const {
    loginLimiter, loginIpLimiter, resetPasswordLimiter,
} = require('../middleware/rate-limit.middleware');

const authRouter = express.Router();

// Two limiters per endpoint: the narrow one stops guessing at a single account,
// the wide one stops one host spraying attempts across many accounts.
authRouter.post('/login', loginIpLimiter, loginLimiter, login);
authRouter.post('/refresh', refresh);
authRouter.post('/logout', logout);
authRouter.get('/me', protect, me);

// Invite hand-off. Rate limited because the token is the only secret guarding
// an account that does not have a password yet.
authRouter.get('/invite', resetPasswordLimiter, checkInvite);
authRouter.post('/invite/accept', resetPasswordLimiter, acceptInvite);

authRouter.post('/change-password', protect, changePassword);

module.exports = authRouter;
