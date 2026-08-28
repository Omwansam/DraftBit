# syntax=docker/dockerfile:1

###############################################################################
# build — compile the Vite bundle
###############################################################################
FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Vite inlines `import.meta.env.*` into the bundle at build time, so these are
# build arguments, not runtime environment: changing one means rebuilding the
# image, not restarting the container.
ARG VITE_API_URL=""
ARG VITE_SITE_URL="http://localhost:8080"
ARG VITE_FORMSPREE_ENDPOINT=""
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_SITE_URL=$VITE_SITE_URL
ENV VITE_FORMSPREE_ENDPOINT=$VITE_FORMSPREE_ENDPOINT

RUN npm run build

###############################################################################
# runtime — nginx serving the compiled static build
###############################################################################
FROM nginx:1.27-alpine AS runtime

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget -qO- http://127.0.0.1/ >/dev/null 2>&1 || exit 1

CMD ["nginx", "-g", "daemon off;"]
