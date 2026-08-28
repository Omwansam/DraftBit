# syntax=docker/dockerfile:1

###############################################################################
# deps — install node_modules and generate the Prisma client
###############################################################################
FROM node:22-alpine AS deps

WORKDIR /app

# The schema and the Prisma config must exist before `npm ci`, because
# package.json runs `prisma generate` in a postinstall hook. Copying only these
# (not the whole source tree) keeps this layer cached until dependencies or the
# schema actually change — editing a controller does not trigger a reinstall.
COPY package.json package-lock.json ./
COPY prisma ./prisma
COPY prisma7.config.ts ./

# Dev dependencies are installed on purpose: the `prisma` CLI is one, and it is
# needed twice — by the postinstall generate here, and by `prisma migrate deploy`
# in the migrate service at deploy time. Pruning it out would cost more than the
# ~40MB it saves.
#
# This project's Prisma client compiles to a WASM query compiler rather than a
# native engine binary (it uses the @prisma/adapter-pg driver adapter), so there
# is no openssl dependency and no `binaryTargets` to pin for Alpine.
RUN npm ci

###############################################################################
# runtime
###############################################################################
FROM node:22-alpine AS runtime

# tini reaps zombies and forwards SIGTERM to node, so the graceful-shutdown
# handler in index.js actually runs on `docker compose down` — without it the
# container is SIGKILLed after the 10s grace period, dropping in-flight requests
# and leaking Postgres connections on every redeploy.
RUN apk add --no-cache tini

ENV NODE_ENV=production
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# uploads/ is the mount point for the named volume in docker-compose.yml.
# Created here and chowned so the unprivileged user can write to it on the very
# first run, before the volume has any content of its own.
RUN mkdir -p uploads/projects && chown -R node:node /app

USER node

EXPOSE 5000

# Hits the liveness probe in index.js, which deliberately does not touch the
# database — a slow query should not make Docker restart a healthy API process.
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD wget -qO- http://127.0.0.1:5000/health >/dev/null 2>&1 || exit 1

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "index.js"]
