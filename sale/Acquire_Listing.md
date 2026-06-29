# PraxisOnline24 — Acquire.com Listing

> Ready-to-paste copy for Acquire.com. Pre-revenue, code + brand + domain + deployment + 12-language i18n.

---

## Headline

**PraxisOnline24 — Production-Ready, 12-Language Online Booking & Practice-Management SaaS for Medical & Service Practices (Pre-Revenue)**

---

## Elevator Pitch (≤ 280 chars)

A fully built, deployed Node.js/Express SaaS that lets practices accept online appointments 24/7, manage practitioners, send PDF invoices, run waitlists, collect reviews, and operate in **12 languages** — including a rule-based AI Practice Manager that turns daily ops data into actionable hints.

---

## Product Description

PraxisOnline24 is a **fully built, deployed, multi-tenant SaaS** for medical practices, therapists, and small service businesses. It covers the entire patient lifecycle — from the public booking page, to the admin calendar, to invoicing, to follow-up review e-mails — and runs in **12 languages** with RTL support for Arabic.

**Status:** All 16 development phases shipped (see README). The product is live at **https://www.praxisonline24.com**, the codebase is clean (~17,000 lines of JavaScript / ~7,400 lines of HTML / 12-language JSON catalogs), and the domain + render.com deployment + brand assets are part of the sale.

**The owner is selling because** monetization (Stripe) was deliberately disabled in favor of a contact form, the asset was used to learn full-stack SaaS, and the operator has moved on to other projects. **No revenue, no MRR, no customers** — this is sold strictly as a technical asset with a working product, brand, domain, and deployed infrastructure.

### Core feature surface (all shipped)

- **Public 3-step booking flow** — practitioner → date → time → patient details → ICS download + cancel-token e-mail
- **30-day trial lifecycle** — automatic e-mail reminders T-5 / T-1 / T+0, account auto-pause at T+7
- **Practitioner management** with individual weekly availability (`practitioner_availability` table) and BASIC plan cap (3 practitioners)
- **Patient portal** — appointment lookup by e-mail, cancel via token, review submission
- **Calendar** — month/week/day views, conflict detection, archived-appointment filter
- **Invoicing** — line items, VAT, status workflow (draft → paid), **PDF generation via pdfkit**
- **Waitlist** with auto-offer engine: when an appointment is cancelled, the next waiting patient gets a 4-hour token to claim the slot
- **Reviews** — 1–5 stars + comment, admin approval workflow, disclaimer ("no health data")
- **Recipe print log** — audit trail without storing prescription content (privacy-by-design)
- **Activity log** — every admin action recorded
- **AI Practice Manager** — 731-line rule engine that produces daily report, financial overview, traffic-light recommendations (Finance / Utilization / Reviews / Waitlist), KI hints, revenue forecast, 7-day utilization forecast, prioritized to-do list
- **Automation (8 cron jobs)** — daily appointment reminders, daily archive, daily SQLite backup, 15-min expired waitlist offer check, hourly review-mail dispatch, hourly trial reminder, hourly account pausing, daily data cleanup with GDPR anonymization at 30 days
- **12-language localization** — DE / EN / FR / ES / PT / AR (RTL) / RU / ZH / HI / TH / TR / ID
- **Security** — bcrypt cost 12, session cookies (HttpOnly + Secure in prod), HSTS / X-Frame-Options / X-Content-Type-Options / Referrer-Policy / Permissions-Policy, role-based auth (admin / doctor / staff / patient), rate-limited login & registration, parametrised SQL throughout

### What you DO NOT get (sold honestly)

- No customers, no MRR, no ARR
- No Stripe (was integrated then deliberately replaced with a request form on the public site — payment links are still present in the codebase)
- No unit tests (Playwright installed as devDep but no test files committed)
- No CSP header, no CSRF tokens, no 2FA (typical for an MVP at this stage)
- No SLA, no support contracts

---

## Market

**Primary markets:**

- DACH region (initial focus, German UI as default) — Germany alone has ~204,000 doctors' practices (KBV registry) and tens of thousands of physiotherapists, osteopaths, alternative practitioners
- EU-wide via i18n (FR / ES / PT / IT-via-EN / PL-via-EN / NL-via-EN)
- Emerging-market potential via AR / TR / ID / HI / TH / ZH / RU catalogs (no SaaS competitor we are aware of bundles those 12 languages)

**Adjacent verticals — same product, different vocabulary:**

- Physiotherapy / chiropractic
- Veterinary practices
- Beauty / wellness / cosmetics
- Driving schools
- Tax & legal consulting
- Independent coaches / therapists

**Direct competitors:** Doctolib, Jameda, samedi, Dr. Flex (DE); Calendly + practice add-ons (global)
**Differentiation:** Self-hostable, white-label-friendly, 12 languages out of the box, much lower price point than Doctolib, no patient-side network effect required to be useful on day one.

---

## Ideal Customer Profile (per the product, not because we have one)

- Owner-operated practice, **3–10 practitioners**, **>50 appointments/week**
- Currently using paper/phone or generic Calendly
- Privacy-sensitive (GDPR/DSGVO) — values fact that **no diagnoses, medication, DOB, or insurance numbers are stored**
- Annual budget €300–€1.500 for software

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js ≥ 18 LTS |
| Server framework | Express 4.18 |
| Database | SQLite via sql.js 1.12 (single-file, easy backup; **PostgreSQL migration path documented in DEPLOYMENT.md**) |
| Auth | express-session + bcrypt (cost 12) + role-based middleware |
| Frontend | Plain HTML5 + CSS3 + vanilla ES modules (no framework lock-in) |
| PDF | pdfkit |
| Scheduling | node-cron |
| E-mail | nodemailer (SMTP) + Brevo API integration |
| i18n | Custom JSON catalogs (12 languages) |
| Hosting | Render.com (Frankfurt region), `render.yaml` committed |
| Domain & TLS | praxisonline24.com via Cloudflare → Render origin |
| Backups | Daily SQLite copy, 7-day rolling retention |

**Repo stats**
- 17 modular Express route files (~2,950 lines)
- 18 database tables
- 33 public HTML pages (admin + patient-facing + legal)
- 902 lines of CSS, 12 i18n JSON catalogs (906 lines combined)
- ~17,200 lines of JavaScript total

---

## Competitive Advantages

1. **12-language coverage** — almost no competitor in this price band ships RTL Arabic + Hindi + Thai + Chinese
2. **Rule-based AI Practice Manager** already wired into the admin dashboard — turns raw appointment data into prioritised actions
3. **Privacy-by-design** — explicit decision to never store health data, with 30-day patient-data anonymization cron
4. **Multi-tenant from day one** — `practice_id` foreign keys throughout
5. **Self-hostable** — single Node process + SQLite file; can run on a €5/mo VPS
6. **No framework drift risk** — vanilla HTML/JS frontend means no React/Vue version-treadmill
7. **Deployment is solved** — `render.yaml` committed, live deployment running, custom domain on Cloudflare

---

## Development Status

- 16 development phases shipped (see `README.md`)
- 187-point QA checklist in `QA_CHECKLIST.md` covering auth, calendar, booking, multilingual, security
- Production deployment on Render (Frankfurt) **with verified TLS and Cloudflare CDN** at https://www.praxisonline24.com
- DSGVO/GDPR-aware data lifecycle (auto-anonymisation at 30 days)
- Git repository clean, public-facing pages SEO-tagged (canonical, OpenGraph, Twitter Card, JSON-LD `SoftwareApplication`)

### Known limitations (disclosed up front)

- SQLite via sql.js is single-instance — migration to PostgreSQL is documented in `DEPLOYMENT.md` (recommended before scaling past ~200 practices)
- Express session store is in-memory — restart logs everyone out; Redis or `connect-pg-simple` recommended for production multi-instance
- No automated test suite (Playwright dependency installed, no specs written)
- Stripe integration was implemented and then deactivated — payment buttons currently route to `/praxis-anfragen` contact form

---

## Reason for Selling

The owner built PraxisOnline24 as a learning project and a working asset. Monetization (Stripe) was paused in favor of a contact-based sales process, the operator has moved on to other projects, and prefers to transfer the entire stack — code, brand, domain, deployment, e-mail account — to a buyer who will take it to market.

**This is an asset sale, not a business sale.** There is no customer book, no recurring revenue, no churn risk. The buyer gets a clean, deployed, multilingual product to monetize as they see fit.

---

## What the Buyer Gets

| Asset | Detail |
|---|---|
| **Source code** | Full Git repository transfer (GitHub `housniadmy-rgb/autooffice-pro-neu`) — clean main branch, no licensing entanglements |
| **Domain** | `praxisonline24.com` + `www.praxisonline24.com` (registrar transfer) |
| **Deployment** | Live Render.com service (Frankfurt), `render.yaml` committed; optional handover of Render account or fresh re-deploy under buyer account |
| **Brand assets** | Name, slogan ("Ihre Praxis. Online. Rund um die Uhr."), all UI strings in 12 languages, color system, logo |
| **Database schema** | 18 tables, fully documented in `README.md`; current DB file optional (test data only) |
| **Documentation** | `README.md` (227 lines), `DEPLOYMENT.md` (165 lines), `QA_CHECKLIST.md` (187-point list), `AGENTS.md` |
| **i18n catalogs** | 12 JSON files covering UI + e-mail templates |
| **E-mail templates** | Booking confirmation, appointment reminder, waitlist offer, trial reminders, review request — all in 12 languages |
| **Operational scripts** | `scripts/cleanup-test-account.sql`, 8 cron jobs, daily SQLite backup |
| **Public pages** | 33 HTML pages including AGB, Datenschutz, Impressum (German legal pages) |
| **Sales materials** | This `sale/` folder — investor report, pitch deck, executive summary, due-diligence pack |

**Optional handover support:** 30 days post-sale e-mail support for repo/deployment questions (negotiable).

---

## Asking Price Guidance

Pre-revenue technical asset valuations (see `Pricing_Strategy.md` for full reasoning):

- **Quick Sale:** **$8,000 – $15,000 USD** (as-is, fast close)
- **Fair Market Value:** **$18,000 – $32,000 USD**
- **Optimistic:** **$35,000 – $55,000 USD** (buyer who can monetise the 12-language angle)

---

## Next Steps

Serious buyers can request:
- Read-only repo invite for code review
- Live demo credentials on a sandboxed instance
- The full `sale/Technical_Due_Diligence.md` pack
- A 30-min product walkthrough call
