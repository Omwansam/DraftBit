#!/bin/sh
# Render the nginx config for whichever state this deployment is in.
#
# The chicken-and-egg: nginx will not start if a server block references a
# certificate file that does not exist, but Let's Encrypt cannot issue that
# certificate until something is answering the ACME challenge over HTTP on the
# real domain. A config that assumes TLS therefore cannot bootstrap itself.
#
# So the HTTP block is always rendered, and the HTTPS block only once the
# certificate is actually on disk. First boot serves HTTP, certbot obtains the
# certificate, the container is reloaded, and HTTPS appears. Every later boot
# finds the certificate and renders both.
set -eu

: "${DOMAIN:?DOMAIN must be set (e.g. draftbitlabs.tech)}"
: "${PORTAL_DOMAIN:=portal.${DOMAIN}}"
export DOMAIN PORTAL_DOMAIN

TEMPLATES=/etc/nginx/templates
OUT=/etc/nginx/conf.d
CERT="/etc/letsencrypt/live/${DOMAIN}/fullchain.pem"

rm -f "$OUT"/*.conf

# Only DOMAIN and PORTAL_DOMAIN are substituted. Passing the whitelist matters:
# a bare envsubst would also eat $host, $request_uri and every other nginx
# variable in the template, silently producing a config full of empty strings.
render() {
    envsubst '${DOMAIN} ${PORTAL_DOMAIN}' < "$1" > "$2"
}

render "$TEMPLATES/00-http.conf.template" "$OUT/00-http.conf"
echo "[proxy] HTTP ready for ${DOMAIN}, www.${DOMAIN}, ${PORTAL_DOMAIN}"

if [ -f "$CERT" ]; then
    render "$TEMPLATES/10-https.conf.template" "$OUT/10-https.conf"
    echo "[proxy] certificate found — HTTPS enabled"
else
    echo "[proxy] no certificate at ${CERT} yet."
    echo "[proxy] serving HTTP only so the ACME challenge can be answered."
    echo "[proxy] run ./proxy/init-letsencrypt.sh to obtain one."
fi

nginx -t
exec "$@"
