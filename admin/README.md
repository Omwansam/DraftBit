# DraftBit Admin

Internal admin console for the DraftBit site. Separate Vite + React app, sibling
to `company/` (the public marketing site) and `BACKEND/` (the Flask API).

```
DraftBit/
├── company/   public marketing site      → localhost:5173
├── admin/     this app                   → localhost:5174
└── BACKEND/   Flask API (User, Contact)
```

## Running it

```bash
cd admin
npm install
npm run dev        # http://localhost:5174
```

`npm run build` produces `dist/`; `npm run lint` runs ESLint; `npm run preview`
serves the production build.

### Demo mode

With no `VITE_API_URL` set, the console runs on seeded content mirroring what
the public site renders today, persisted to `localStorage`. Every screen is
fully usable — create, edit, publish, delete, all of it survives a reload.

Sign in with any team address and the password `draftbit`:

| Email | Role | What they can do |
|---|---|---|
| `alex@draftbit.com` | Owner | everything |
| `sarah@draftbit.com` | Admin | everything except transferring ownership |
| `james@draftbit.com` | Editor | content only — no users, no settings |
| `grace@draftbit.com` | Editor | content only |

**Site settings → Features → Reset all data** restores the seed.

### Connecting the Flask backend

Copy `.env.example` to `.env` and set `VITE_API_URL` to the API's base URL. The
console then reads and writes through it instead of `localStorage`, and the
"Demo data" chip in the top bar disappears.

The endpoints it expects are listed in one place — `endpoints` in
[src/lib/api.js](src/lib/api.js) — so the backend has a single contract to
mirror. Auth is JWT in the `Authorization: Bearer` header, matching the
`flask_jwt_extended` config already in `BACKEND/server/config.py`.

Only `POST /auth/login`, `GET /auth/me` and the `/contacts` collection map onto
models that exist today (`User` and `Contact`). The other collections —
projects, insights, careers, team, testimonials, services, clients — have no
tables yet; they need models and CRUD routes before `VITE_API_URL` will serve
those screens.

> Role checks in this app hide UI a role cannot use. That is presentation, not
> access control — the API has to enforce the same rules independently.

## What's in it

| Screen | |
|---|---|
| Dashboard | KPI tiles, visitor trend, channel mix, enquiries per week, latest enquiries, activity feed, "needs attention" |
| Analytics | Traffic over time, acquisition channels, enquiries per week, top pages |
| Messages | Inbox for contact-form enquiries — read/unread, star, archive, spam, bulk actions, reply |
| Projects | Case studies — list + full editor (overview, case study, results, cover image, publishing) |
| Insights | Blog articles — list + editor with word count and read-time |
| Careers | Open roles — list + editor with requirements and applicant counts |
| Team · Testimonials · Services · Clients | Content collections with inline editors |
| Admin users | Invite, assign roles, suspend, remove |
| Site settings | Identity, contact, social, SEO (with search preview), feature switches |

Press <kbd>⌘K</kbd> / <kbd>Ctrl+K</kbd> anywhere to search pages and records.

## How it's put together

```
src/
├── context/      ThemeContext · AuthContext · DataContext (the CRUD store)
├── components/
│   ├── layout/   AdminLayout, Sidebar, Topbar, navigation.js
│   ├── ui/       Button, Card, Field, DataTable, Modal, Toast, StatTile, …
│   └── charts/   hand-rolled SVG charts + chartTheme.js
├── pages/        one file per screen
├── lib/          api · format · slug · icons
└── data/seed.js  seeded content
```

**Navigation lives in one file.** [navigation.js](src/components/layout/navigation.js)
feeds the sidebar, the breadcrumbs and the command palette, so a new page is
registered once.

**Charts are hand-rolled SVG**, no charting dependency. The categorical palette
was validated for colourblind separation, lightness band, chroma floor and
contrast against each theme's own surface — see the comments in
[index.css](src/index.css). Rules the charts hold to: one y-axis ever (no dual
axis), colour follows the entity rather than its rank, nominal categories all
take slot 1 rather than a value-ramp, and every chart has a table view so no
value is reachable only by hovering.

**Design tokens** mirror the public site — cyan primary, violet secondary, Syne
for headings, DM Sans for body — declared as complete colour values so Tailwind
v4 opacity modifiers resolve through `color-mix()` without bridge utilities.

## Notes for whoever picks this up

- Icons on records are stored as lucide *names*, resolved through
  [src/lib/icons.js](src/lib/icons.js). That map is explicit on purpose: a
  `import * as Icons from 'lucide-react'` namespace import defeats tree-shaking
  and adds ~570kB to the bundle to render twenty icons.
- The editors reload their form only when the route points at a *different*
  record. Re-syncing on every store change would discard unsaved edits the
  moment anything else wrote to the store.
- `:where(.grid) > * { min-width: 0 }` in `index.css` is load-bearing. A grid
  item's automatic minimum is its content's min-content width, and `truncate`
  does not reduce that — so one long headline would otherwise floor its whole
  column and give the page a horizontal scrollbar on mobile.
