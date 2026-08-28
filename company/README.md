# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.



Structure
I took the first option you offered — a separate admin/ app outside company/. Nothing in company/ moved or changed (its two pre-existing modified files are your own edits; it still builds).


DraftBit/
├── company/   public site   → :5173   (untouched)
├── admin/     NEW console   → :5174
└── BACKEND/   Flask API

cd admin && npm install && npm run dev
Sign in with alex@draftbit.com / draftbit.

What's there
56 source files. Login, Dashboard, Analytics, Messages inbox, Projects + editor, Insights + editor, Careers + editor, Team, Testimonials, Services, Clients, Admin users, Site settings, 404 — plus a ⌘K palette, light/dark themes, and role-based permissions (Owner/Admin/Editor/Viewer).

It runs fully without the backend: seeded from your real site.js content, persisted to localStorage, so every screen is usable now. Set VITE_API_URL and it switches to the Flask API instead.

Verified, not assumed
I drove it in headless Chrome — 14/14 functional flows pass, zero console errors: auth gating, bad-password rejection, create/validate/persist, unread-badge updates, palette navigation, and Editors being blocked from /settings.

Four real defects found and fixed along the way:

Horizontal scrollbar on mobile across 5 routes. Root cause was min-width: auto on grid items — truncate doesn't reduce min-content width, so one long headline floored its whole column. Fixed with one documented rule in index.css.
"in 10 hours" on new enquiries — seeded same-day timestamps used absolute clock times that landed in the future.
Bundle nearly halved (1171 kB → 601 kB): a import * as Icons from 'lucide-react' was pulling the whole icon set to render twenty.
Editors discarded unsaved edits whenever anything else wrote to the store; they now reload only on an actual record change.
Charts are hand-rolled SVG (no charting dep). I ran the palette through the colourblind/contrast validator — all six checks pass in both light and dark against each theme's own surface.

Two things worth flagging
The backend can't serve most of this yet. BACKEND/server/models.py has only User and Contact, and app.py has a single / route. Of the console's collections, only messages and users map to anything real — projects, insights, careers, team, testimonials, services and clients need models and CRUD routes before VITE_API_URL will drive those screens. I documented the expected contract in one place (endpoints in src/lib/api.js) so it's a straightforward mirror. Say the word and I'll build those out.

Role checks here are UI-only — they hide what a role can't use. The API must enforce the same rules independently; hiding a route isn't access control.