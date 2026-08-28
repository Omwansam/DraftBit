#!/usr/bin/env bash
#
# Obtain the first TLS certificate. Run once, from the repository root:
#
#   ./proxy/init-letsencrypt.sh
#
# Renewal after this is automatic — the certbot service in docker-compose.yml
# checks twice a day and the proxy reloads every six hours to pick up a renewed
# certificate. You should not need to run this again.
#
# Before running, three things must already be true:
#   1. DNS A/AAAA records for DOMAIN, www.DOMAIN and PORTAL_DOMAIN point at this
#      host. Let's Encrypt resolves them itself — there is no way to fake it.
#   2. Ports 80 and 443 reach this host from the public internet.
#   3. If DNS is behind Cloudflare, the records are set to "DNS only" (grey
#      cloud) for this run. Proxied records make Let's Encrypt fetch the
#      challenge from Cloudflare rather than from here, and it will not find it.
#      Turn the proxy back on afterwards.
set -euo pipefail

cd "$(dirname "$0")/.."

if [[ ! -f .env ]]; then
    echo "No .env found. Copy .env.example to .env and fill it in first." >&2
    exit 1
fi

set -a; source .env; set +a

: "${DOMAIN:?DOMAIN must be set in .env}"
PORTAL_DOMAIN="${PORTAL_DOMAIN:-portal.${DOMAIN}}"

if [[ -z "${LETSENCRYPT_EMAIL:-}" ]]; then
    echo "LETSENCRYPT_EMAIL is not set in .env." >&2
    echo "Let's Encrypt uses it to warn you before a certificate expires." >&2
    exit 1
fi

STAGING_ARG=""
if [[ "${LETSENCRYPT_STAGING:-0}" == "1" ]]; then
    echo "!! Using the STAGING CA. The certificate will NOT be trusted by browsers."
    STAGING_ARG="--staging"
fi

FORCE_ARG=""
if [[ "${1:-}" == "--force" ]]; then
    FORCE_ARG="--force-renewal"
fi

echo
echo "Requesting a certificate covering:"
echo "    ${DOMAIN}"
echo "    www.${DOMAIN}"
echo "    ${PORTAL_DOMAIN}"
echo

# One certificate with all three names, rather than three certificates.
# Let's Encrypt allows 100 names per certificate, and a single file means the
# nginx config references one path and renewal is one operation.
#
# The first name becomes the directory under /etc/letsencrypt/live, which is
# why the nginx templates all point at live/${DOMAIN}/.

# The proxy must be up first: it serves the challenge over HTTP. Its entrypoint
# renders an HTTP-only config when no certificate exists yet, which is exactly
# the state we are in here.
echo "Starting the proxy so it can answer the ACME challenge..."
docker compose up -d --build proxy
sleep 3

docker compose run --rm --entrypoint certbot certbot \
    certonly --webroot -w /var/www/certbot \
    --email "${LETSENCRYPT_EMAIL}" \
    --agree-tos --no-eff-email \
    ${STAGING_ARG} ${FORCE_ARG} \
    -d "${DOMAIN}" -d "www.${DOMAIN}" -d "${PORTAL_DOMAIN}"

echo
echo "Certificate obtained. Restarting the proxy so it renders the HTTPS config..."
docker compose up -d --force-recreate proxy

echo
echo "Done. Both sites should now answer on HTTPS:"
echo "    https://${DOMAIN}"
echo "    https://${PORTAL_DOMAIN}"
