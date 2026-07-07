# PraxisOnline24 — System Architecture

## Purpose

Structural overview of how the running system is composed: components, request flow, and the deliberate simplicity choices behind the architecture.

## Executive summary

PraxisOnline24 is a **single Node.js / Express monolith** deployed behind Cloudflare on Render's Fluid Compute in the Frankfurt region. It uses SQLite (via `sql.js`) for storage, Brevo for transactional email, and an LLM adapter (Claude or OpenAI) for the AI Practice Manager. The architecture is deliberately simple for the target scale (approximately 200 practices) and has documented paths for horizontal scaling.

## High-level topology

```
Browser
   |
   v
Cloudflare (DNS + CDN + TLS)
   |
   v
Render Frankfurt (Node.js Fluid Compute)
   |
   ├──> SQLite (in-process, sql.js, backed by data/praxisonline24.db)
   ├──> Brevo Transactional API (HTTPS)
   └──> LLM adapter (Claude or OpenAI HTTPS)
```

> TODO — replace this ASCII diagram with a Mermaid `.mmd` source file and a rendered `system-diagram.png` at 300 DPI. Place both in this folder alongside the current document.

## Request lifecycle: authenticated route example

1. Browser sends `GET /api/appointments` with session cookie
2. Cloudflare edge terminates TLS, caches static assets, forwards dynamic request
3. Render Fluid Compute routes to the running Node process
4. Express middleware chain executes: `securityHeaders` → `cors` → `express.json` → `cookieParser` → `session`
5. Route module (`routes/appointments.js`) inspects `req.session` for auth
6. If authenticated, tenant filter `WHERE practice_id = ?` is applied on every query
7. SQLite (in-process, `sql.js`) responds from memory; disk flush is asynchronous
8. Response JSON serialised, returned to Cloudflare, returned to browser

## Request lifecycle: unauthenticated public route (demo request)

1. Browser posts to `/api/demo` with form data
2. `routes/demo.js` validates payload, inserts `demo_requests` row
3. Auto-onboarding: `practices` + `users` + `invite_tokens` rows created synchronously
4. Response `200 OK` returned immediately
5. Three emails fired asynchronously via `fireAndForget` wrapper:
   - Admin notification to `OWNER_EMAIL`
   - Contact confirmation to the requester
   - Activation email to the requester (unless the user was already active)

## Component responsibilities

### `server.js`
- Loads environment
- Initialises database and creates schema
- Composes middleware chain
- Mounts route modules
- Starts cron jobs
- Binds to `PORT`

### `database.js`
- Wraps `sql.js` behind a `better-sqlite3`-shaped API (prepared statement style)
- Implements `PRAGMA foreign_keys = ON`
- Runs additive migrations at boot
- Handles owner-account auto-seeding via `OWNER_INITIAL_PASSWORD`

### `routes/*.js`
- One module per domain area
- Each mounts to an `/api/*` path prefix from `server.js`
- Modules are self-contained: each imports its own DB helpers and email utilities

### `utils/`
- `email.js` — Brevo transport wrapper
- `emailLocales.js` — 12-language template content
- `cron.js` — 8 scheduled jobs
- `rateLimit.js` — per-IP sliding-window limiter
- `activity.js` — audit log writer
- `language.js` — locale detection helpers

### `middleware/`
- `auth.js` — session inspection, tenant scoping, owner-role guard
- `security.js` — HTTP security headers

### `public/`
- Vanilla HTML pages served by `express.static`
- Client-side JS at `public/js/` (no build step)
- CSS at `public/css/`

## Data flow: pricing configuration

A concrete example of the "single source of truth" design decision:

1. `config/pricing.js` defines the three tiers (Basic USD 29 / Pro USD 59 / Unlimited USD 99)
2. Backend imports it directly for MRR calculation
3. Server exposes it at `GET /js/pricing-config.js`, which returns `window.PRICING = {...}` JavaScript
4. Every HTML page loads this endpoint and reads pricing from `window.PRICING`
5. A price change is a single-file edit; a redeploy propagates it repository-wide

## Scaling considerations

### Vertical (current architecture)

- SQLite scales cleanly to approximately 200 practices at the current schema density
- Render Fluid Compute handles concurrent requests via async I/O
- No external session store required at this scale

### Horizontal (future)

Documented migration path (2–3 weeks of engineering effort):

1. Migrate storage to PostgreSQL (schema is 1:1 compatible)
2. Move session store to Redis
3. Enable multi-process deployment on Render
4. Add CDN caching rules for static + read-only endpoints

## Deliberate simplicity choices

Each of the following is a decision, not an oversight:

- **No microservices.** A monolith at target scale is faster to reason about.
- **No message queue.** Fire-and-forget wrappers on async jobs are sufficient for the current workload.
- **No Kubernetes.** Render's Fluid Compute delivers ~99.9% uptime without container orchestration.
- **No frontend framework.** Vanilla HTML/CSS/JS eliminates build-tooling churn.
- **No API gateway.** Cloudflare provides edge, TLS, and basic WAF.

## What can go wrong

- **Single-process memory pressure** if the SQLite dataset grows past comfortable RAM limits — mitigation: monitor at 100+ practices, trigger Postgres migration
- **Session loss on process restart** — expected in the current architecture; Redis migration recommended when volume matters
- **AI Practice Manager cost blowup** — LLM call cost scales per tenant per briefing; monitor and cap
- **Email deliverability degradation** — Yahoo/Gmail can reclassify sender at any time; monitor Brevo bounce rate

## Diagrams to be produced

> TODO — produce and add to this folder:
> - `system-diagram.png` — the topology above at 300 DPI
> - `system-diagram.mmd` — Mermaid source so buyer can regenerate
> - `data-flow-demo-onboarding.png` — sequence diagram of the demo request lifecycle
> - `data-flow-demo-onboarding.mmd` — Mermaid source

---

**NDA classification:** Share after NDA
**Last updated:** 2026-07-07
**Document owner:** The seller
**Related documents:** [Infrastructure](./Infrastructure.md), [Technology Stack](../04-technical-documentation/Technology_Stack.md), [Database Overview](../04-technical-documentation/Database_Overview.md)
