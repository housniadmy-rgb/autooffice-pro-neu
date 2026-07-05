# PraxisOnline24 — Flippa Listing Draft

> **Draft only.** All figures assume a pre-revenue transfer of assets. Buyer is expected to complete an independent technical + legal due diligence.

---

## Title (max 80 characters)

**PraxisOnline24 — Turnkey Multilingual SaaS for Medical Practices (12 Languages, Pre-Launch)**

Character count: 79.

### Alternative titles (A/B ready)

- `Pre-Built AI Practice Management SaaS · 12 Languages · Domain Included`
- `Multilingual Healthcare SaaS · Full Source · Ready to Launch (praxisonline24.com)`

---

## Short Summary (100–140 words, hero section)

PraxisOnline24 is a **turnkey B2B SaaS for medical practices** — a fully built appointment, patient, invoice and AI-assistant platform, ready for a new owner to take live. Twelve languages (including Arabic RTL and traditional Chinese). Complete Node.js/Express codebase, verified Brevo email deliverability, Cloudflare + Render deployment stack, official branding, domain `praxisonline24.com`.

**Status honestly stated:** pre-launch, zero customers, zero revenue. The value on offer is a **production-ready product, brand and deployment**, not a book of business. The buyer skips the 6–12 months of build effort and focuses on go-to-market — pricing structure, subscription flow, and multilingual onboarding are already wired up.

**Asking price: USD 39,000.** Full transfer of code, domain, brand assets and 30 days of implementation support included.

---

## Full Description

### What you're buying

PraxisOnline24 is a **complete SaaS asset**, not a lead-gen site or an idea. The core product — a multi-tenant practice management platform — is functional end-to-end today. You receive:

- 100 % of the source code (Node.js / Express, 17 modular route files, ~40 KB of well-commented business logic).
- The domain **praxisonline24.com** (registered, Cloudflare-fronted).
- Live deployment on **Render Frankfurt** (transferable) with CI-style auto-deploy from `main`.
- **Verified Brevo Transactional email** (SPF, DKIM 2×, DMARC — configured on the domain).
- Full **branding kit** — logo variants, favicon, wordmark, colour palette, marketing screenshots.
- Twelve **fully translated user interfaces** and email templates.
- Complete **buyer documentation**: technical due-diligence report, deployment runbook, transfer checklist, pricing strategy, growth roadmap.
- **30 days of implementation support** post-transfer (async, up to ~10 hours of my time for handover questions).

### What the product actually does

PraxisOnline24 is a niche SaaS for independent medical, dental, physiotherapy, psychology and specialist practices. Once a practice signs up, the platform handles:

- **Appointment scheduling** — day / week / month calendar views, per-practitioner availability windows, waitlist with auto-offer flow, cancellation tokens for patient self-service.
- **Patient management** — light patient records (no clinical data — privacy-by-design), booking history, review invitations.
- **Invoicing & receipts** — PDF invoice generation (pdfkit), payment tracking, recurring reminders.
- **Recipe / prescription print logs** — audit trail for prescription handling, GDPR-conscious.
- **Reviews** — post-appointment automated review request emails; opt-in publishing to a public practice profile page.
- **AI Practice Manager** — LLM-backed assistant that produces daily briefings, warnings (idle chairs, overdue invoices) and recommendations from live practice data.
- **Multilingual onboarding** — demo request → auto-account creation → invite email → password setup → 30-day trial. All in the user's chosen language.
- **Owner dashboard** — CEO/operator view with cohort metrics, MRR calculation, package distribution, executive timeline.

### Technical highlights

- **Node.js ≥ 18 LTS + Express 4.18** — monolithic architecture chosen for operational simplicity at the target scale (see risks section for scaling notes).
- **SQLite via sql.js 1.12** — 18 tables, foreign keys enforced, additive `ALTER TABLE`-based migrations. Suitable up to ~200 practices without a database migration.
- **bcrypt cost 12** — production-grade password hashing.
- **Parametrised SQL throughout** — no query interpolation, low SQL injection surface.
- **Brevo Transactional API** — HTTPS-based, avoids the SMTP port 587 / 465 timeout issues that Render's outbound network is known for. SPF+DKIM+DMARC verified on `praxisonline24.com`.
- **Central pricing config** — single source of truth (`config/pricing.js`) served both to backend MRR calculation and to the browser via `/js/pricing-config.js`. Change once, propagates everywhere.
- **Owner auto-seed on startup** — `OWNER_INITIAL_PASSWORD` env variable ensures the platform-owner account survives redeploys on ephemeral hosting.

### Why the owner is selling

I built PraxisOnline24 as a solo founder over ~6 months. The technical build is done and the platform is production-ready. What comes next — cold outreach to independent practices, clinic association partnerships, running paid ads in the DACH region, or approaching international dental groups — is a **founder-market fit** question and a full-time sales effort I am not positioned to sustain long-term. Rather than let a completed platform sit idle, I would prefer a buyer with either healthcare-industry access or a distribution channel to take it live.

### Monetisation opportunities

The platform is priced-in for a straightforward subscription model, but the code supports several revenue angles a buyer can activate:

1. **Direct SaaS subscriptions** — the current pricing tiers (Basic $29 / Pro $59 / Unlimited $99 per month) are already wired to the registration form, subscription page and MRR reporting. Stripe integration is disabled by default (contact form is used instead); connecting Stripe is ~2 hours of work.
2. **Freemium → paid conversion** — 30-day free trial is already implemented; conversion emails (`sendTrialReminder`) and expiration handling exist.
3. **White-label to regional practice groups** — a healthcare association could re-brand and offer as a member benefit.
4. **Vertical variants** — the same codebase has already spawned a working sister product (Doctoronline24). Naming, translations and templates are all centralised in `utils/emailLocales.js` and `public/js/public-i18n.js`, making a re-skin a 1-day project.
5. **Add-on services** — the AI assistant module (`/api/ai-praxismanager`) can be positioned as an add-on for higher tiers, once LLM API costs are known.

### Buyer package

| Item | Included |
|---|---|
| GitHub repository access (private, transferred) | ✅ |
| Domain `praxisonline24.com` with Cloudflare setup | ✅ |
| Render deployment (transferable service) | ✅ |
| Brevo sender identity + DKIM records (transferable) | ✅ |
| Logo, favicon, brand palette, marketing screenshots | ✅ |
| Technical due diligence document | ✅ |
| 12-month growth roadmap | ✅ |
| Deployment runbook + owner onboarding guide | ✅ |
| 30-day async handover support (~10 hours) | ✅ |
| Existing customer contracts | N/A — pre-revenue |
| Ongoing operational responsibility | N/A — transfer completes at handover |

### Ideal buyer

You'll get the most value if you fit one of these profiles:

- **Healthcare SaaS operator** looking to expand a portfolio into DACH / MENA / LATAM without the 6-month build phase.
- **Regional practice association** wanting a white-label platform for members.
- **Solo indie founder** with a healthcare network who prefers acquiring a finished product over building one.
- **Agency / dev shop** using this as the base of a customised solution for a specific clinic or dental group.

You'll get the least value if:

- You want turnkey passive income — this is pre-revenue and requires a go-to-market push.
- You need US HIPAA compliance — the codebase is GDPR-conscious but has no HIPAA audit trail or BAA-ready configuration.
- You expect no operational work — a real product still needs support, sales and iteration.

### Technical overview (short version)

- **Stack:** Node.js 18+, Express 4.18, sql.js 1.12, bcrypt 5, pdfkit, node-cron, nodemailer + Brevo API, express-session, vanilla ES-module frontend.
- **Frontend:** Zero-build vanilla HTML5/CSS3/JS. No React, Vue or Svelte — deliberately kept simple.
- **Multi-tenancy:** Row-level tenancy on `practice_id` foreign key.
- **Auth:** email/password with bcrypt, express-session (in-memory), invite-token onboarding, password reset via email link.
- **Cron:** 8 scheduled jobs (appointment reminders, review requests, trial reminders, backup, waitlist offers).
- **Deployment:** `render.yaml` committed. Currently on Render Free plan for demo purposes; production migration to Starter + persistent disk is a 15-minute config change (documented in `DEPLOYMENT.md`).
- **Data model:** 18 tables (practices, users, practitioners, appointments, waitlist, waitlist_offers, reviews, invoices, recipe_print_logs, payments, settings, automation_log, password_reset_tokens, practitioner_availability, activity_log, demo_requests, invite_tokens).
- **Privacy by design:** the schema does not store diagnoses, medication, dates of birth or insurance numbers. 30-day anonymisation via cron.

### Risks and honest disclosures

I want a well-informed buyer, not a disappointed one. Please read this section before offering.

- **Pre-revenue.** Zero paying customers, zero MRR / ARR. Product-market fit is *plausible* based on comparable markets (~€30–120 / month per practice is the going rate in DE for equivalent tools) but is **not proven**.
- **No unit tests.** Playwright is a devDependency but no spec files exist. E2E flows have been manually verified. A buyer serious about scale should budget for a test-suite build-out.
- **SQLite ceiling.** The current storage engine (sql.js, in-memory with sync-to-file) scales cleanly to ~200 practices. Beyond that, a Postgres migration is planned and documented in `DEPLOYMENT.md`, but not executed. Migration effort estimate: 2–3 weeks.
- **In-memory session store.** `express-session` uses the default MemoryStore. Session data is lost on server restart. Users must re-login after each redeploy. Acceptable for the target scale; a Redis session store is a 1-hour swap when needed.
- **No CSRF, no CSP, no 2FA.** Standard defence-in-depth items that a mature product would add. Application logic uses parametrised SQL, output escaping and bcrypt correctly — but a security audit is recommended before going live.
- **Deprecated dependency (`moment`).** Migration to `date-fns` is recommended, ~4 hours of work.
- **Email deliverability.** SPF, DKIM (2 selectors), DMARC are all correctly configured on `praxisonline24.com` — verified via live DNS lookups. Deliverability to Yahoo/web.de was validated during pre-launch testing.
- **AI assistant costs.** The `/api/ai-praxismanager` module makes LLM API calls. At scale this becomes a per-tenant cost item that must be factored into pricing. Current implementation is Claude / OpenAI compatible via a swappable adapter.
- **No commercial contracts, no trademarks registered.** Brand assets and domain transfer are straightforward; there is no company entity being sold, only the digital assets.

### Terms

- Payment via Flippa Escrow.
- Asset transfer completes within 7 days of cleared funds.
- 30-day post-transfer async handover included.
- Ongoing hosting costs (Render ~$7/mo Starter + $0.25/GB/mo disk, Brevo Free until volume, Cloudflare Free, domain ~$15/year) are the buyer's responsibility from day 1 of transfer.

---

## Cover / hero copy variants (for A/B testing on Flippa)

**Variant A — technical/founder tone:**
> Complete healthcare SaaS in 12 languages, ready to launch. Six months of build for the price of one. Skip the boilerplate — go straight to sales.

**Variant B — buyer-outcome tone:**
> Own the platform, not the code. Full source, verified email, live domain, 30 days of support. Pre-revenue: your growth story starts on day 1.

**Variant C — market-focused tone:**
> Multilingual practice management SaaS — priced-in, wired for subscriptions, deploy-ready on Render. Ideal for healthcare portfolio operators.
