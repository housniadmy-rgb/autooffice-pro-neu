# PraxisOnline24 — Technology Stack

## Purpose

Complete inventory of the runtime and build technologies used in PraxisOnline24. Written for a buyer's technical evaluator (in-house engineer, CTO, contracted reviewer).

## Executive summary

The stack is deliberately simple: **Node.js / Express monolith with a SQLite storage engine (`sql.js`), vanilla HTML/CSS/JS frontend, and a small set of well-audited third-party dependencies.** Choices favour operational simplicity at the target scale over premature abstraction.

## Runtime

| Layer | Technology | Version | Rationale |
|---|---|---|---|
| Runtime | Node.js | ≥ 18 LTS | Long-term support, ubiquitous ecosystem |
| HTTP framework | Express | 4.18 | Widely known, stable, minimal surface |
| Language | JavaScript (CommonJS) | ES2020+ | No transpilation step, direct debugging |
| Storage engine | SQLite via `sql.js` | 1.12 | Zero-ops SQLite compiled to WebAssembly; suits ~200 practices scale |
| Password hashing | bcrypt | (via `bcrypt` npm package, cost 12) | Industry standard, appropriate cost factor |
| Session management | `express-session` | Default MemoryStore | Adequate at target scale; Redis-swap documented |
| PDF generation | `pdfkit` | > TODO — version pin from `package.json` | Invoice + recipe print |
| Scheduled jobs | `node-cron` | > TODO — version pin | Eight scheduled jobs (reminders, backups, anonymisation) |
| Email transport | Brevo Transactional HTTP API (native HTTPS) | v3 API | Chosen over SMTP due to Render's outbound port timeouts |
| AI adapter | Custom LLM adapter | Node HTTPS to Claude / OpenAI | Swappable at runtime via env variable |

## Frontend

- **No framework** — vanilla HTML5 / CSS3 / ES modules
- **No build step** — assets served directly by Express static middleware
- Deliberately kept minimal to avoid build-tooling churn and to reduce operational surface for a small buyer team

## Development tooling

| Purpose | Tool | Notes |
|---|---|---|
| Dev-server auto-restart | `nodemon` | Dev dependency only |
| End-to-end testing (installed, not wired) | Playwright | Dev dependency; no spec files currently exist |
| Linting / formatting | > TODO — confirm whether ESLint / Prettier configs are committed | Buyer to review `.eslintrc*` and `.prettierrc*` |
| CI/CD | Render auto-deploy from `main` branch | Configured in `render.yaml` |

## Environment variable dependencies

Full inventory lives in [06-deployment/Environment_Requirements.md](../06-deployment/Environment_Requirements.md). Summary:

- `SESSION_SECRET` — required in production
- `OWNER_EMAIL`, `OWNER_INITIAL_PASSWORD` — required to seed platform-owner account
- `BREVO_API_KEY` — required for outbound email
- `SMTP_FROM` — sender identity string
- `EMAIL_DEV_MODE` — testing gate (default `false` in production)
- `APP_URL` — canonical URL for magic-link generation

## Third-party service dependencies

| Service | Purpose | Transferability |
|---|---|---|
| Render.com | Application hosting | New Render account, `render.yaml` deploy |
| Cloudflare | DNS, CDN, TLS | Zone reassignment (24–48 hours) |
| Hostinger | Domain registration | Domain transfer via auth code |
| Brevo (formerly Sendinblue) | Transactional email | New Brevo account + DKIM records already on domain |
| LLM provider (Claude or OpenAI) | AI Practice Manager | Buyer-provided API key |

## Codebase structure

Top-level directories relevant to the technical evaluator:

- `server.js` — HTTP application entry point
- `database.js` — Schema and migrations
- `routes/` — 17 modular route files (auth, appointments, patients, invoices, etc.)
- `utils/` — Cron jobs, email helpers, locale-agnostic utilities
- `middleware/` — Auth, rate-limiting, security headers
- `public/` — Static HTML/CSS/JS served to the browser
- `config/` — Central pricing configuration
- `data/` — Runtime SQLite file (created on first boot; gitignored)
- `sale/` — Sale documentation (this DD folder lives here)

## Dependency licensing

Every direct dependency in `package.json` is permissively licensed (MIT, Apache 2.0 or ISC). No copyleft dependencies (GPL, AGPL) in the direct set. Full transitive audit is available on request via `npm ls --production` and a licence-checker tool.

> TODO — buyer's technical evaluator to run `npm audit --production` at DD stage and compare against seller's reported findings.

## Known technical debt

- **Deprecated `moment.js`** — recommended migration to `date-fns` (approximately four hours of work)
- **No unit test suite** — Playwright is present but not wired; buyer should plan a test-suite build-out sprint
- **In-memory session store** — Redis migration is a documented one-hour swap when volume warrants
- **SQLite scaling ceiling** — approximately 200 practices; Postgres migration path in `10-roadmap/Product_Roadmap.md`

---

**NDA classification:** Share after NDA
**Last updated:** 2026-07-07
**Document owner:** The seller
**Related documents:** [Features](./Features.md), [API Overview](./API_Overview.md), [Database Overview](./Database_Overview.md), [System Architecture](../05-architecture/System_Architecture.md)
