# Deploying DraftBit to a Hostinger VPS

Target layout: the repository lives at `/srv/draftbit`, Docker runs everything,
and nginx inside a container terminates TLS for both domains.

```
draftbitlabs.tech          the public marketing site
www.draftbitlabs.tech      301 -> apex
portal.draftbitlabs.tech   the staff console
*/api/  */uploads/         the API, on both domains
```

Everything is reached through one container, `proxy`, which is the only service
that publishes a host port. Nothing else — not Postgres, not the API — is
reachable from outside the Docker network.

---

## Before you start

You need three things, and the certificate step fails without all of them.

**1. DNS.** Three records pointing at the VPS's public IP:

| Type | Name | Value |
|------|--------|-------------|
| A | `@` | your VPS IP |
| A | `www` | your VPS IP |
| A | `portal` | your VPS IP |

Add `AAAA` records too if the VPS has IPv6. Verify from your laptop before going
further — Let's Encrypt resolves these itself and there is no way to fake it:

```bash
dig +short draftbitlabs.tech
dig +short portal.draftbitlabs.tech
```

Both must print the VPS IP. DNS propagation can take up to an hour.

**2. Ports 80 and 443 open.** Covered in step 2 below.

**3. Cloudflare, if you use it, temporarily set to DNS-only.** See
[the Cloudflare note](#if-you-use-cloudflare) — this catches people out.

---

## 1. Connect and create the deploy user

Hostinger gives you root. Don't run the stack as root.

```bash
ssh root@YOUR_VPS_IP
```

```bash
adduser deploy
usermod -aG sudo deploy
rsync --archive --chown=deploy:deploy ~/.ssh /home/deploy
```

From now on, connect as `deploy`:

```bash
ssh deploy@YOUR_VPS_IP
```

### Harden SSH

If you signed in with a password, add a key first from your **laptop**:

```bash
ssh-copy-id deploy@YOUR_VPS_IP
```

Confirm key login works in a second terminal *before* continuing — locking
yourself out here means a rescue-console trip.

```bash
sudo nano /etc/ssh/sshd_config
```

```
PermitRootLogin no
PasswordAuthentication no
```

```bash
sudo systemctl restart ssh
```

---

## 2. Firewall

```bash
sudo apt update && sudo apt install -y ufw
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
sudo ufw status
```

Only 22, 80 and 443. Postgres and the API are deliberately not exposed.

> **Docker bypasses ufw.** Docker writes its own iptables rules, so a published
> container port is reachable even when ufw says otherwise. This stack publishes
> only 80 and 443, so it does not bite here — but if you ever uncomment the `db`
> or `backend` `ports:` block, that port is on the public internet regardless of
> what ufw reports. Bind it to localhost instead: `"127.0.0.1:5434:5432"`.

---

## 3. Install Docker

```bash
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER
```

Log out and back in for the group change to apply, then check:

```bash
docker run --rm hello-world
docker compose version
```

---

## 4. Swap, if the VPS has 2GB or less

Building three frontend images runs Vite three times. On a small plan the
kernel's OOM killer stops a build with no clear error.

```bash
free -h                    # check first — skip if you already have swap
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

---

## 5. Clone into /srv

```bash
sudo mkdir -p /srv
sudo chown deploy:deploy /srv
cd /srv
git clone https://github.com/Omwansam/DraftBit.git draftbit
cd /srv/draftbit
```

Private repo? Generate a deploy key on the VPS and add it to GitHub under
**Settings → Deploy keys**:

```bash
ssh-keygen -t ed25519 -C "draftbit-vps" -f ~/.ssh/id_ed25519 -N ""
cat ~/.ssh/id_ed25519.pub
git clone git@github.com:Omwansam/DraftBit.git draftbit
```

---

## 6. Configure

```bash
cp .env.example .env
nano .env
```

Generate the two secrets on the VPS and paste them in:

```bash
openssl rand -hex 32     # POSTGRES_PASSWORD
openssl rand -hex 48     # JWT_SECRET
openssl rand -hex 16     # SEED_OWNER_PASSWORD
```

Minimum you must set:

```ini
DOMAIN=draftbitlabs.tech
PORTAL_DOMAIN=portal.draftbitlabs.tech
LETSENCRYPT_EMAIL=you@draftbitlabs.tech

POSTGRES_PASSWORD=<openssl rand -hex 32>
JWT_SECRET=<openssl rand -hex 48>

TRUST_PROXY=1

SEED_OWNER_EMAIL=you@draftbitlabs.tech
SEED_OWNER_PASSWORD=<openssl rand -hex 16>
```

Notes that matter:

- **`POSTGRES_PASSWORD` is interpolated into a URL.** If you write your own,
  percent-encode any `@ : / ?` in it. The `openssl` output above is hex, so it
  is always safe.
- **`TRUST_PROXY=1`** for this stack. Set it to `2` only if Cloudflare (or any
  other CDN) sits in front. Too low and every request looks like it came from
  nginx, so one failed login rate-limits everyone; too high and a client can
  forge `X-Forwarded-For` and defeat the limiters entirely.
- **`SITE_API_URL` and `ADMIN_API_URL` stay `/api/v1`.** They are relative on
  purpose, so the browser calls the origin it is already on. An absolute URL
  reintroduces CORS and cross-site cookie problems.
- **These are baked in at build time.** Changing `SITE_API_URL`, `SITE_URL` or
  `DOMAIN` needs `--build`, not a restart.

Lock the file down — it holds every secret you have:

```bash
chmod 600 .env
```

---

## 7. First build

```bash
cd /srv/draftbit
docker compose up -d --build
```

Five to ten minutes on a small VPS. Then:

```bash
docker compose ps
```

Every service should be `running` except `migrate`, which is `exited (0)` — it
is a one-shot that applies the schema and stops. That is correct.

At this point the site answers on **HTTP only**. That is deliberate: nginx
cannot start with a config referencing a certificate that does not exist yet,
and Let's Encrypt cannot issue one until something answers on port 80. The
proxy detects the missing certificate and serves HTTP so the challenge can be
answered.

```bash
curl -I http://draftbitlabs.tech
```

A `301` to HTTPS is the expected response. If you get connection refused, stop
here and fix it before requesting a certificate — see
[Troubleshooting](#troubleshooting).

---

## 8. TLS certificate

### If you use Cloudflare

Set all three DNS records to **DNS only** (grey cloud) before this step.
Proxied records make Let's Encrypt fetch the challenge from Cloudflare instead
of from your VPS, and it will not find it. Turn the orange cloud back on
afterwards, and set SSL/TLS mode to **Full (strict)** — anything less leaves the
Cloudflare-to-origin leg unencrypted or unverified.

### Dry run first

Let's Encrypt's real CA locks you out for a week after five failures. Test
against staging, where the limits are generous:

```bash
sed -i 's/^LETSENCRYPT_STAGING=.*/LETSENCRYPT_STAGING=1/' .env
./proxy/init-letsencrypt.sh
```

A staging certificate is **not** browser-trusted — the browser warning is
expected and means it worked.

### The real certificate

```bash
sed -i 's/^LETSENCRYPT_STAGING=.*/LETSENCRYPT_STAGING=0/' .env
./proxy/init-letsencrypt.sh --force
```

`--force` is needed to replace the staging certificate. The script requests one
certificate covering all three names, then restarts the proxy so it renders its
HTTPS config.

```bash
curl -I https://draftbitlabs.tech
curl -I https://portal.draftbitlabs.tech
```

Both should return `200`, and `www` should `301` to the apex.

**Renewal is automatic.** The `certbot` service checks twice a day and renews
inside 30 days of expiry; the proxy reloads every six hours to pick up a renewed
certificate. You should never need to run the script again.

---

## 9. Seed the database

```bash
docker compose exec backend npm run seed
```

This writes the site settings, the two published case studies, insights, team,
services, careers and 120 days of analytics history.

The seed **refuses to run** in production if `SEED_OWNER_PASSWORD` is unset,
rather than falling back to the default password published in this repository.

It prints the sign-in credentials and a single-use invitation link. Copy them,
then sign in at `https://portal.draftbitlabs.tech` and change the password.

To wipe and reseed — **destroys all content, including anything written through
the console**:

```bash
docker compose exec backend npm run seed -- --reset
```

---

## 10. Verify

```bash
curl -s https://draftbitlabs.tech/api/v1 | head -c 200          # API index
curl -s https://portal.draftbitlabs.tech/api/v1/public/site | head -c 200
curl -sI https://portal.draftbitlabs.tech | grep -i x-robots    # noindex
curl -sI https://draftbitlabs.tech | grep -i strict-transport   # HSTS
```

Then in a browser:

- `https://draftbitlabs.tech` — marketing site, valid padlock
- `https://portal.draftbitlabs.tech` — sign in, dashboard loads live figures
- Submit the contact form; it should appear in the console's inbox

---

## Day-to-day

### Deploying a change

```bash
cd /srv/draftbit
git pull
docker compose up -d --build
```

Migrations apply automatically — `migrate` runs to completion before the API
starts, so the API never serves against an unapplied schema.

Rebuilding only what changed is faster:

```bash
docker compose up -d --build company     # public site only
docker compose up -d --build backend     # API only
```

Remember the frontends bake `VITE_*` in at build time: changing those in `.env`
requires `--build`, not `restart`.

### Logs

```bash
docker compose logs -f --tail=100          # everything
docker compose logs -f backend             # one service
docker compose logs proxy | grep -E "error|502|504"
```

### Restart, stop, status

```bash
docker compose restart backend
docker compose ps
docker compose down                        # stop; volumes survive
```

`docker compose down -v` **deletes the database and the certificates.** There is
almost never a reason to use it.

### Database access

Postgres is not published. Open a shell inside the container:

```bash
docker compose exec db psql -U draftbit -d draftbitlabs
```

For Prisma Studio or a GUI, tunnel from your laptop rather than exposing the
port — uncomment the `db` `ports:` block bound to localhost first:

```bash
ssh -L 5434:localhost:5434 deploy@YOUR_VPS_IP
```

### Backups

Nothing backs the database up on its own. A nightly dump:

```bash
mkdir -p /srv/backups
crontab -e
```

```cron
0 3 * * * cd /srv/draftbit && docker compose exec -T db pg_dump -U draftbit draftbitlabs | gzip > /srv/backups/draftbit-$(date +\%F).sql.gz
0 4 * * 0 find /srv/backups -name '*.sql.gz' -mtime +30 -delete
```

`%` must be escaped as `\%` in a crontab, and `-T` is required — without it
`exec` allocates a TTY and corrupts the dump with control characters.

Copy backups off the VPS regularly. A backup on the same disk is not a backup.

Restore:

```bash
gunzip -c /srv/backups/draftbit-2026-08-29.sql.gz \
  | docker compose exec -T db psql -U draftbit -d draftbitlabs
```

Also worth keeping: `/srv/draftbit/.env` (unrecoverable — losing `JWT_SECRET`
signs everyone out) and the `certbot-conf` volume.

### Disk

Docker accumulates old images with every rebuild.

```bash
df -h
docker system prune -af --volumes=false     # keeps named volumes
```

Never add `--volumes` — that deletes the database.

---

## Troubleshooting

**`init-letsencrypt.sh` fails with "Invalid response" or "Timeout during connect"**

Something between Let's Encrypt and the proxy is wrong. Check in order:

```bash
dig +short draftbitlabs.tech              # must be the VPS IP
sudo ufw status                           # 80 and 443 allowed
docker compose ps proxy                   # running
curl -I http://draftbitlabs.tech/.well-known/acme-challenge/test   # 404, not refused
```

A `404` on that last one is *correct* — the path is reachable and no token
exists yet. Connection refused means the proxy is not serving. Also confirm
Cloudflare is grey-clouded.

**Everything returns 502**

An upstream is down. The proxy stays up by design so one broken container does
not take both sites offline.

```bash
docker compose ps
docker compose logs backend --tail=50
```

The usual cause is the API failing to boot — most often a `DATABASE_URL` broken
by an unencoded special character in `POSTGRES_PASSWORD`.

**Rate limiter locks everyone out after one failed login**

`TRUST_PROXY` is wrong. It must be `1` for this stack, `2` behind Cloudflare.
Wrong value means every request appears to come from nginx, so all clients share
one bucket.

**Admin console loads but shows no data**

Sign in first — the console fetches content only once authenticated. If it is
still empty, the API is unreachable:

```bash
curl -s https://portal.draftbitlabs.tech/api/v1/public/site | head -c 200
```

**Build killed with no error**

Out of memory. Add swap — see step 4.

**Site shows old content after a deploy**

The frontends bake configuration in at build time. Use `--build`, and
hard-reload the browser (`Ctrl+Shift+R`).

---

## What runs where

| Service | Port | Exposed publicly | Purpose |
|---------|------|------------------|---------|
| `proxy` | 80, 443 | **yes** | TLS, routes both domains |
| `company` | 80 | no | public site (static) |
| `admin` | 80 | no | staff console (static) |
| `backend` | 5000 | no | API |
| `db` | 5432 | no | Postgres 17 |
| `migrate` | — | no | one-shot, exits 0 |
| `certbot` | — | no | renews the certificate |

Volumes: `pgdata` (database), `uploads` (uploaded images), `certbot-conf`
(certificates), `certbot-www` (ACME challenges).
