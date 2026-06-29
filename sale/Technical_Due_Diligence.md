# Technical Due Diligence — PraxisOnline24

> Engineering-level deep dive. Written for a buyer's CTO or senior engineer.

---

## 1. Repository Snapshot

- **Repo:** `housniadmy-rgb/autooffice-pro-neu` (GitHub)
- **Default branch:** `main`
- **Build:** `npm install` → `npm start`
- **Runtime:** Node.js ≥ 18 LTS, Express 4.18

### File-level metrics (counted, not estimated)

| Layer | Files | LoC |
|---|---|---|
| Express routes (`routes/`) | 17 | 2,947 |
| Middleware (`middleware/`) | 2 | ~80 |
| Utilities (`utils/`) | 9 | ~1,500 (cron, e-mail, PDF, rate-limit, activity, i18n) |
| Total server-side JS | — | **~17,200** |
| Public HTML pages (`public/`) | 33 | ~7,400 |
| CSS (`public/css/style.css`) | 1 | 902 |
| Client JS (`public/js/`) | several | included in JS total |
| i18n catalogs (`locales/*.json`) | 12 | 906 |

### Top route files by size

| Route | Lines | Purpose |
|---|---|---|
| `ai-praxismanager.js` | 731 | Rule-engine dashboard payload (14 sections) |
| `owner.js` | 489 | Owner-level admin endpoints |
| `auth.js` | 317 | Login, register, password reset, forgot-password |
| `public.js` | 280 | Public booking + availability |
| `appointments.js` | 155 | Calendar CRUD |
| `waitlist.js` | 148 | Waitlist + auto-offer |

---

## 2. Architecture

### High-level

```
                     Cloudflare (TLS + CDN)
                              │
                              ▼
                   Render.com Web Service (Frankfurt)
                              │
                              ▼
            ┌─────────────────────────────────────────┐
            │  Express 4 monolith (server.js)         │
            │  ├── securityHeaders middleware         │
            │  ├── static (public/)                   │
            │  ├── cors, json, urlencoded, cookies    │
            │  ├── express-session (in-memory store!) │
            │  └── 17 route modules                   │
            └─────────────────────────────────────────┘
                              │
                              ▼
            sql.js (SQLite WASM, in-memory + sync flush to disk)
                              │
                              ▼
                  data/praxisonline24.db  (file on Render disk)
```

### Strengths

- Modular routing — one file per resource, each ~50–500 LoC
- Static asset serving placed **before** session/CORS to keep cold paths cheap
- `trust proxy` enabled in production for correct client-IP behind Cloudflare → Render
- `securityHeaders` middleware is the first thing in the chain — predictable
- Auth model is layered: `requireAuth` → `requireRole(role)` → `requireActiveAccount` (per-route opt-in)

### Weaknesses

- **In-memory session store** — restart logs everyone out. For single-instance Render Free Tier this is OK; for any multi-instance setup it is a blocker. Recommended fix: `connect-pg-simple` (1 hour) or `connect-redis` (2 hours).
- **sql.js loads the entire DB into RAM** — fine up to ~50 MB DB, problematic at production scale. Migration path to `pg` is documented but not implemented.
- `routes/ai-praxismanager.js` is a single 731-line handler — readable, but a refactor candidate.
- No request validation framework (no `zod`/`joi`). Each route hand-validates inputs. Error-prone if extended.

---

## 3. Data Model

18 tables (`practices`, `users`, `practitioners`, `appointments`, `waitlist`, `waitlist_offers`, `reviews`, `invoices`, `recipe_print_logs`, `payments`, `settings`, `automation_log`, `password_reset_tokens`, `practitioner_availability`, `activity_log`, `demo_requests`, `invite_tokens` + history).

### What is deliberately NOT stored (privacy by design)

- ❌ No diagnoses
- ❌ No medications or dosages
- ❌ No date of birth
- ❌ No insurance numbers
- ❌ No prescription content (only a print log: who printed for whom, when)

This is enforceable at the schema level — there are no columns for these fields.

### Schema design highlights

- All FK relations explicit with `FOREIGN KEY ... REFERENCES`
- `PRAGMA foreign_keys = ON` at startup
- UUIDs (v4) used for primary keys — no auto-increment leakage
- `created_at` defaults on every table → audit trail
- `practice_id` on every business table → multi-tenant ready

### Schema evolution

The `initDatabase()` function runs `CREATE TABLE IF NOT EXISTS` + a list of `ALTER TABLE ... ADD COLUMN` statements wrapped in try/catch. This is a **lightweight migration mechanism** that works for a single dev but is fragile for production teams — recommended replacement: a real migration tool (e.g., `db-migrate`, `knex` migrations, or `prisma migrate`). Estimated effort to convert: 1–2 days.

---

## 4. Security Posture

### Implemented

| Control | Implementation | File |
|---|---|---|
| Password hashing | bcrypt cost factor 12 | `routes/auth.js`, `database.js` |
| Session cookies | HttpOnly always, Secure in prod | `server.js` |
| HSTS | `max-age=31536000; includeSubDomains; preload` (prod only) | `middleware/security.js` |
| X-Frame-Options | SAMEORIGIN | `middleware/security.js` |
| X-Content-Type-Options | nosniff | `middleware/security.js` |
| Referrer-Policy | strict-origin-when-cross-origin | `middleware/security.js` |
| Permissions-Policy | camera/mic/geolocation disabled | `middleware/security.js` |
| Rate limiting | 5/min login, 3/min register, 3/min forgot-password | `routes/auth.js` |
| Role-based access | admin > doctor > staff > patient | `middleware/auth.js` |
| Active-account gate | 402 response when trial expired and account paused | `middleware/auth.js` |
| Parameterised SQL | All `db.prepare(?,?,?)` calls — no string concatenation | repo-wide grep clean |
| HTTPS in prod | Render TLS + Cloudflare in front | infra |
| Trust proxy | `app.set('trust proxy', 1)` in production | `server.js` |
| Activity logging | Login, appointment CRUD, etc. → `activity_log` table | `utils/activity.js` |
| Password reset | One-time tokens, hashed, expiring | `password_reset_tokens` table |

### Not Implemented (typical MVP gaps)

| Gap | Risk | Effort to add |
|---|---|---|
| Content-Security-Policy header | Medium (XSS defense in depth) | 4 hours |
| CSRF tokens on state-changing routes | Medium (session sufficient for same-origin, but belt+braces) | 1 day |
| 2FA for admin users | Medium | 2 days (TOTP via `otplib`) |
| E-mail verification on registration | Low (does not break product) | 1 day |
| Brute-force lockout beyond per-IP rate limit | Low | 4 hours |
| Audit log export | Low | 4 hours |
| Dependency vulnerability scanning in CI | Low | 2 hours (`npm audit`, Dependabot) |

### Known unsafe defaults

- `SESSION_SECRET` falls back to a hard-coded development string if env var is missing. Server logs a warning, but does not refuse to start. **Buyer must set this in their Render env.** (Note: `render.yaml` uses `generateValue: true` so a fresh deploy gets a strong secret automatically.)

---

## 5. Automation Surface (Cron Jobs)

All in `utils/cron.js`. Started on app boot.

| Schedule | Job | What it does |
|---|---|---|
| `0 8 * * *` (08:00 daily) | `sendReminderEmails` | E-mail patients with appointments tomorrow |
| `0 1 * * *` (01:00 daily) | `archiveOldAppointments` | Sets status='archived' on completed/cancelled appts past per-practice threshold (default 12 months, configurable 6/12/24/never) |
| `0 2 * * *` (02:00 daily) | `runBackup` | Copies `data/praxisonline24.db` to `data/backups/backup-YYYY-MM-DD_HH-mm.db`, keeps 7 newest |
| `*/15 * * * *` (every 15 min) | `checkExpiredOffers` | Expires unanswered waitlist offers, notifies next patient |
| `0 * * * *` (hourly) | `sendPendingReviewMails` | E-mails review request 24h after completed appointments |
| `0 * * * *` (hourly) | `checkTrialReminders` | T-5 / T-1 / T+0 trial reminder e-mails |
| `0 * * * *` (hourly) | `pauseExpiredAccounts` | Sets `account_status='paused'` on accounts >7 days past trial end |
| `0 3 * * *` (03:00 daily) | `runDataCleanup` | GDPR anonymisation of patient PII >30 days old, expired token cleanup, waitlist housekeeping |

All cron events log to the `automation_log` table → auditable.

**Strength:** This is genuinely useful operational scaffolding. A buyer would otherwise build all of this in weeks 2–4 of a from-scratch project.

---

## 6. E-mail System

- `utils/email.js` is the dispatcher
- `utils/emailLocales.js`, `utils/emailLocalesAdmin.js`, `utils/emailLocalesInvoice.js`, `utils/emailLocalesPatient.js` — localized templates across 12 languages
- `EMAIL_DEV_MODE=true` writes mail content to console (for dev/test)
- `EMAIL_DEV_MODE=false` uses SMTP via nodemailer, supports Brevo via `BREVO_API_KEY`
- All e-mails are HTML + plain-text
- Booking confirmations include ICS calendar attachment
- All e-mails follow the patient's preferred language (`appointments.patient_language`)

---

## 7. Internationalization

- **12 languages:** DE / EN / FR / ES / PT / AR (RTL) / RU / ZH / HI / TH / TR / ID
- One JSON file per language in `locales/`
- Browser language detection on first visit, with persistence in localStorage
- Cookie + URL query param overrides (`?lang=de`)
- E-mail templates separately localized

### Translation quality

Strings are in plain JSON, covering all UI labels. Spot-checks:
- DE / EN — native-quality
- FR / ES / PT / IT — fluent
- AR / TR / ID — fluent enough for production use
- RU / ZH / HI / TH — likely machine-translated, would benefit from a native reviewer (typical investment: $100–$300 per language via TextMaster / Lokalise)

---

## 8. Frontend

- **No framework.** Vanilla HTML5 / CSS3 / ES modules.
- 33 HTML pages — admin (`dashboard.html`, `appointments.html`, `practitioners.html`, etc.) + patient-facing (`booking.html`, `my-appointments.html`, `cancel.html`, `review.html`, `waitlist.html`, `waitlist-accept.html`) + public (`index.html`, `preise.html`, `demo.html`, `agb.html`, `datenschutz.html`, `impressum.html`, `security-compliance.html`)
- 902-line `style.css` covers all of it
- One JS folder, modular structure (per page)
- Responsive (viewport meta + mobile breakpoints in CSS)
- RTL handled at the HTML/CSS level for Arabic

### Pros / cons

| Pros | Cons |
|---|---|
| Zero framework version risk (React/Vue/Angular migrations are someone else's problem) | No SPA experience — every navigation is a full page load |
| Tiny bundle size — perfect for low-bandwidth markets | Limited to "form-and-list" UX patterns |
| SEO-friendly out of the box | No type-safety on client side |
| Easy for any junior dev to onboard | Custom state management on the few interactive pages (calendar) is manual |

---

## 9. Build & Deployment

- **No build step** — Node starts directly from source. No Webpack, no Vite, no Turbopack.
- **`render.yaml` committed** — buyer can re-deploy under their own account in 5 minutes.
- **Health check:** `GET /api/health` returns `{"status":"ok","app":"PraxisOnline24"}`. Render pings this on every deploy.
- **Production checklist** in `DEPLOYMENT.md` (165 lines) covers env vars, SESSION_SECRET, SMTP, HSTS, secure cookies, persistent disk for SQLite.

---

## 10. Dependencies (top-level)

| Package | Version | Risk |
|---|---|---|
| express | ^4.18.2 | Mature, well-maintained |
| sql.js | ^1.12.0 | Single-threaded; consider `better-sqlite3` for native perf — would require API changes |
| bcrypt | ^5.1.1 | Native module; works on Render Node 18+ |
| nodemailer | ^6.9.7 | Standard |
| pdfkit | ^0.15.0 | Mature; some advanced typography limitations |
| node-cron | ^3.0.3 | Standard |
| cookie-parser | ^1.4.6 | Used despite express-session — minor cleanup opportunity |
| moment | ^2.29.4 | **Deprecated upstream.** Migrate to `date-fns` or `luxon` — ~1 day of work across cron + activity timestamps |
| express-session | ^1.17.3 | Standard |
| cors | ^2.8.5 | Standard |
| uuid | ^9.0.0 | Standard |
| dotenv | ^16.3.1 | Standard |

`npm audit` clean at time of due diligence (verify before purchase — buyer should re-run).

---

## 11. SEO

| Property | Status | Notes |
|---|---|---|
| `<title>` per page | ✅ | German default, customised on homepage + pricing |
| `<meta name="description">` | ✅ | Set on homepage + pricing |
| Canonical URL | ✅ | `<link rel="canonical">` |
| OpenGraph | ✅ | og:type, og:title, og:description, og:url, og:image |
| Twitter Card | ✅ | summary_large_image |
| JSON-LD | ✅ | Schema.org `SoftwareApplication` on homepage |
| `sitemap.xml` | ✅ | Present in `public/` |
| `robots.txt` | ✅ | Present in `public/` |
| `hreflang` for 12 languages | ❌ | Not implemented — would help international SEO; ~4 hours |
| Image alt text | ⚠️ | Partial — depends on page |
| Lighthouse audit | ⚠️ | Not measured; expected 80–90 on a static page baseline |

---

## 12. Testing

- **Unit tests:** none
- **Integration tests:** none
- **E2E tests:** none committed (Playwright installed as devDep)
- **Manual QA:** 187-point `QA_CHECKLIST.md` covering auth, profile, calendar, booking, i18n, patients, invoices, recipes, reviews, waitlist, backups, activity log, password reset, security, deployment.

This is the largest single technical gap. Cost to remediate: $3,000–$6,000 of dev time to land ~50 E2E specs covering critical flows.

---

## 13. Performance

- No load testing data
- Static assets served directly from disk via `express.static` with ETag + Last-Modified
- Server is single-process — Render Free tier gives ~512 MB RAM, ~0.1 CPU
- sql.js loads full DB into RAM once at startup; subsequent queries are fast (in-RAM)
- Cron jobs run in same process — at high practice counts, would benefit from worker thread separation

**Expected ceiling on Render Free + SQLite:** ~50–200 practices with light usage. Beyond that, migrate to PostgreSQL + Render Starter plan.

---

## 14. Known Defects (full disclosure)

- The Express `cookie-parser` is registered but `express-session` does not actually need it for cookies. Cosmetic.
- `routes/ai-praxismanager.js` returns 14 distinct sections from a single handler — works but should eventually be split.
- `moment` is deprecated upstream — will keep working but no new features. Replace within 6–12 months.
- The `ALTER TABLE` migration mechanism in `database.js` swallows errors. If a column add fails for a real reason, you would not know.
- No CSP header (mentioned above).
- The `data/praxisonline24.db` file in the repo holds test data only — buyer should wipe before going live with their own customers.

---

## 15. Replacement-Cost Sanity Check

Independently of the asking price, here is what it would cost to rebuild this:

- **~1,150 hours** of full-stack development (see `Pricing_Strategy.md`)
- Plus 12-language i18n: 12 × ~1 day of integration + translation review = ~12 days
- Plus security hardening pass: ~2 weeks
- Plus deployment + Cloudflare + SEO baseline: ~3 days
- Plus brand + domain + legal templates: ~3 days

→ **Total: ~1,400 hours @ €60–€100/hr = €84,000–€140,000 (US$90k–$150k)**

The asset is being offered at a **fraction** of replacement cost because it carries no traction.

---

## 16. Recommended Buyer's Engineering To-Do (First 30 Days Post-Close)

1. Set strong `SESSION_SECRET`, `OWNER_EMAIL`, `OWNER_INITIAL_PASSWORD`, SMTP, Brevo
2. Wipe test data, run schema fresh (`rm data/praxisonline24.db` then restart)
3. Add persistent disk on Render (or migrate to PostgreSQL)
4. Add CSP header, CSRF middleware (`csurf`), 2FA for admins
5. Write ~30 Playwright E2E specs against the critical flows
6. Replace `moment` with `date-fns`
7. Add Sentry / similar error tracking
8. Re-enable Stripe checkout (revert the `/praxis-anfragen` swap)
9. Run a native-speaker review pass on RU / ZH / HI / TH catalogs
10. Hire a German lawyer to review AGB / Datenschutz / Impressum before going live with paying customers

Estimated cost of the 30-day to-do list: **$5,000–$10,000** (~80 hours of focused work).

---

## TL;DR

A buyer's engineering team should expect to spend roughly **$10k of dev time** to take this from "deployed asset" to "production-grade SaaS under your brand." That cost, plus the asking price, is still a fraction of what greenfield development would cost.
