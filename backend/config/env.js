require('dotenv').config();

/**
 * Every environment variable the API reads, in one place.
 *
 * Anything absent here is not consulted anywhere else, so this file doubles as
 * the list of what a deployment has to set.
 */
module.exports = {
    PORT: process.env.PORT || 5000,
    NODE_ENV: process.env.NODE_ENV || 'development',

    /** Proxy hops in front of Express. 1 = the nginx edge proxy. */
    TRUST_PROXY: process.env.TRUST_PROXY,

    JWT_SECRET: process.env.JWT_SECRET,
    /** Access tokens are short-lived; the refresh cookie carries the long session. */
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '15m',
    REFRESH_TTL_DAYS: Number.parseInt(process.env.REFRESH_TTL_DAYS || '30', 10),

    /**
     * Browser origins allowed to call the API. In production this is required
     * and is the only accepted origin; in development an unset value reflects
     * the caller, which is what makes a Vite dev server on a random port work.
     */
    FRONTEND_URL: process.env.FRONTEND_URL,
    /** The admin console, used to build invite links. */
    ADMIN_URL: process.env.ADMIN_URL || 'http://localhost:5174',
    /** The public marketing site, used for "view on site" links. */
    SITE_URL: process.env.SITE_URL || 'http://localhost:5173',
};
