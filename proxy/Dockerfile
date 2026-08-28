FROM nginx:1.27-alpine

# envsubst lives in gettext; the alpine image does not ship it.
RUN apk add --no-cache gettext

COPY nginx.conf           /etc/nginx/nginx.conf
COPY snippets/            /etc/nginx/snippets/
COPY templates/           /etc/nginx/templates/
COPY docker-entrypoint.sh /entrypoint.sh

# The base image has its own entrypoint that also processes /etc/nginx/templates
# with envsubst — and it would mangle every nginx variable in ours. Replacing it
# outright is deliberate.
ENTRYPOINT ["/entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]

# Checks the proxy itself, not the sites behind it: this must report unhealthy
# only when nginx is actually down, or a restarting backend would take the edge
# with it.
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget -q --spider http://127.0.0.1/.well-known/acme-challenge/ || exit 1
