const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const path = require("path");
const config = require("./config/env")
const { prisma, connectDB, disconnectDB } = require('./config/db');
const morgan = require("morgan");
const errorHandler = require('./middleware/error.middleware');
const { globalLimiter } = require('./middleware/rate-limit.middleware');

const app = express();

/**
 * Trust the reverse proxies in front of us.
 *
 * Without this, req.ip is the proxy's address on every request, so all the
 * rate limiters in middleware/rate-limit.middleware.js key on one value and the
 * first person to fail a login locks out everyone behind it. Express also
 * refuses to read X-Forwarded-Proto, so secure cookies would never be set.
 *
 * The value is a hop count, not a boolean: set it to the number of proxies that
 * actually append to X-Forwarded-For, counting outward from this process.
 *   1  the edge nginx alone
 *   2  Cloudflare in front of the edge nginx
 * `true` is deliberately not used - it trusts the whole chain, and an attacker
 * can then forge X-Forwarded-For and become any IP the limiters see.
 */
const trustProxy = Number.parseInt(config.TRUST_PROXY ?? '', 10);
if (Number.isInteger(trustProxy) && trustProxy > 0) {
    app.set('trust proxy', trustProxy);
} else if (config.NODE_ENV === 'production') {
    console.warn(
        '[startup] TRUST_PROXY is not set. Behind a reverse proxy every request ' +
        'will appear to come from the proxy, which makes the rate limiters ' +
        'useless. Set it to the number of proxy hops.',
    );
}

//connect to the database
connectDB();

const port = config.PORT

// CORS. `credentials: true` means the browser will attach cookies to allowed
// cross-origin requests, so the allow-list has to be exact: reflecting whatever
// Origin the caller sent (the `origin: true` shorthand) would let any website
// make authenticated calls on a logged-in user's behalf.
//
// In production FRONTEND_URL is required and is the only accepted origin, plus
// its www form — a visitor who lands on www.<domain> is 301'd to the apex by the
// proxy, but the redirect happens after the browser has already fixed the origin
// for any in-flight request. In development it falls back to reflecting the
// origin, which is what makes the Vite dev server on a random port work.
if (config.NODE_ENV === 'production' && !config.FRONTEND_URL) {
    throw new Error(
        'FRONTEND_URL must be set in production — without it CORS cannot be locked ' +
        'to this site and any origin could make authenticated requests.'
    );
}

const allowedOrigins = config.FRONTEND_URL
    ? [...new Set([
        config.FRONTEND_URL,
        // Guarded so a FRONTEND_URL that already names www does not become
        // https://www.www.example.com.
        config.FRONTEND_URL.replace(/^(https?:\/\/)(?!www\.)/, '$1www.'),
    ])]
    : null;

app.use(
    cors({
        origin: allowedOrigins ?? true,
        credentials: true,
    })
);

// Security response headers: HSTS, X-Content-Type-Options, Referrer-Policy,
// frame denial, and cross-origin isolation defaults.
//
// contentSecurityPolicy is off because this process serves JSON and uploaded
// images, not HTML — the frontend's own CSP is set at the nginx edge, and a
// second policy here would only apply to error pages.
//
// crossOriginResourcePolicy is relaxed to cross-origin so /uploads images can be
// rendered by the frontend, which is served from a different origin.
app.use(
    helmet({
        contentSecurityPolicy: false,
        crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
);

// Blunt ceiling in front of everything. Per-endpoint limiters in
// middleware/rate-limit.middleware.js do the precise work on auth routes.
app.use(globalLimiter);





app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));
app.use(cookieParser());

// Express does not disclose its identity by default in v5, but the header is
// still emitted by some middleware paths — drop it so the stack is not advertised.
app.disable('x-powered-by');
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Basic route
app.get('/', (req, res) => {
    res.send('Hello Backend Working!');
});

// Container liveness probe (see HEALTHCHECK in the Dockerfile). Deliberately
// does not touch the database: a slow query should not make Docker kill and
// restart an otherwise healthy API process.
app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok', uptime: process.uptime() });
});



// Every route lives under /api/v1 - see routes/index.js, which owns the prefix.
const { apiRouter, routeNames } = require('./routes');
app.use('/api/v1', apiRouter);

// Anything that matched no router above is a 404, answered in the same
// { success, error } shape as every other failure so clients have one contract.
// Must sit after the routers and before the error handler.
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: `Route not found: ${req.method} ${req.originalUrl}`,
    });
});

// Error Handler Middleware. Four arguments, so Express only reaches it via
// next(err) — it has to be the last thing registered.
app.use(errorHandler);

// Start the server
const server = app.listen(port, () => {
    console.log(`\nDraftBit API listening on http://localhost:${port}`);
    console.log(`Environment: ${config.NODE_ENV || 'development'}\n`);
    console.log('Mounted routes:');
    for (const name of routeNames) {
        console.log(`  /api/v1/${name}`);
    }
    console.log('');
});
// `docker compose up -d --build` sends SIGTERM and waits 10s before SIGKILL.
// Draining in-flight requests and closing the Prisma pool here avoids dropped
// responses and leaked Postgres connections on every redeploy.
const shutdown = (signal) => {
    console.log(`${signal} received, shutting down gracefully...`);
    server.close(async () => {
        await disconnectDB();
        process.exit(0);
    });
    // Backstop in case a connection refuses to close.
    setTimeout(() => {
        console.error('Forcing shutdown after 10s timeout.');
        process.exit(1);
    }, 10000).unref();
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

