# Buyer FAQ — PraxisOnline24

Answers to the most common questions a serious buyer asks before submitting an LOI.

---

## Business & Sale

**Q: Why are you selling?**
A: The owner built PraxisOnline24 as a learning + portfolio project. Monetisation (Stripe) was paused in favour of a contact-based sales process, and the operator has shifted focus to other work. The product is at a hand-off-ready state and the owner prefers to transfer the entire stack to someone who will take it to market.

**Q: Is there any revenue, MRR, or customer book?**
A: No. This is sold strictly as a **pre-revenue technical asset**: production-ready code, brand, domain, deployment, documentation, and 12-language i18n. No customers, no recurring revenue, no churn risk.

**Q: Why is there no Stripe integration?**
A: Stripe was implemented earlier and intentionally replaced with a request form on the public site. The Stripe code is in Git history and can be restored in 1–2 days. This was a sales-strategy decision, not a technical gap.

**Q: What is the asking price?**
A: See `Pricing_Strategy.md`. Recommended list: **$24,500 USD** (Fair Market Value range $18k–$32k). Quick-sale floor: $8k–$15k. Strategic/optimistic ceiling: $35k–$55k.

**Q: Are you open to creative deals?**
A: Yes — code-only transfer at lower price, or full handover (code + domain + deployment + 30-day support + brand mailbox) at higher. Open to LOIs.

**Q: Can I see the financials?**
A: There are no financials to see — no revenue, no expenses beyond a Render Free Tier deployment and domain registration (~$15/year). Hosting cost is documented in `DEPLOYMENT.md`.

---

## Code & Tech

**Q: What is the tech stack?**
A: Node.js ≥ 18 LTS, Express 4.18, SQLite via sql.js, vanilla HTML/CSS/JS frontend, pdfkit for invoices, node-cron for scheduling, nodemailer + Brevo for e-mail. Full breakdown in `Technical_Due_Diligence.md`.

**Q: Will SQLite scale?**
A: Comfortably to ~100–200 small practices. Past that, migrate to PostgreSQL. The path is documented in `DEPLOYMENT.md` — the data layer already uses parametrised `prepare()` calls, which are nearly drop-in compatible with `pg`/`node-postgres`. Estimated migration effort: 20–40 hours.

**Q: Are there any tests?**
A: Playwright is installed as a devDependency, but no test files are committed. The 187-point `QA_CHECKLIST.md` is the de-facto regression spec. Adding ~30 E2E specs over the critical flows would take ~1 week.

**Q: How is security handled?**
A: bcrypt (cost factor 12) for passwords, parametrised SQL throughout, session cookies (HttpOnly + Secure in prod), full security-header suite (HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy), rate limiting on login/register/forgot-password, role-based access control (admin > doctor > staff > patient), HTTPS-only in production, trust-proxy enabled for the Cloudflare front.

**Q: What security work is NOT yet done?**
A: No Content-Security-Policy header, no CSRF tokens (Express sessions + same-origin only), no 2FA, no e-mail verification on registration. These are typical MVP gaps and are individually 1–3 day jobs.

**Q: Is the code monolithic or modular?**
A: Modular. 17 separate route files in `routes/`, a `middleware/` folder, a `utils/` folder for cron + e-mail + activity + rate-limit + PDF, and a single `database.js` for schema. The longest file is `routes/ai-praxismanager.js` at 731 lines (because it generates a 14-section dashboard payload).

**Q: Is the code well documented?**
A: Yes for repo-level (`README.md` 227 lines, `DEPLOYMENT.md` 165 lines, `QA_CHECKLIST.md` 187 points). Code-level comments are in German throughout — not a typical AcquireDoc gold standard, but readable. No OpenAPI spec, no architecture diagram (would be ~1 day of work to add).

---

## Deployment & Operations

**Q: Where does it currently run?**
A: Render.com Free Tier in Frankfurt (eu-central-1 equivalent). Live at https://www.praxisonline24.com, fronted by Cloudflare for TLS + CDN.

**Q: What does it cost to run?**
A: Render Free Tier = $0/month (with cold-start tradeoff). Render Starter Disk = ~$7/month, eliminates cold starts and gives 1 GB persistent SQLite storage. Domain ≈ $15/year. Cloudflare Free is sufficient. **Total monthly opex: $7–$15 depending on plan.**

**Q: Will I get the Render account or do I redeploy?**
A: Either is fine. Easiest is a fresh deploy under your Render account — `render.yaml` is committed, so it is a 5-minute setup. Owner can also transfer the existing Render service if buyer prefers zero downtime.

**Q: How does the domain transfer work?**
A: `praxisonline24.com` is registered at a third-party registrar (Cloudflare). Standard EPP-code transfer. Estimated 5–7 business days. Owner will provide unlock + auth code on closing.

**Q: What about the Cloudflare zone?**
A: Transferable to buyer's Cloudflare account, no downtime. DNS records are minimal (apex A → Render origin, www CNAME → Render origin). Process takes ~15 minutes.

**Q: Will the e-mail address `info@praxisonline24.com` come with it?**
A: Yes, if the domain transfers. The MX records are part of the zone. If the buyer prefers a fresh mailbox, no data migration is needed because no sales pipeline lives in the inbox.

---

## Product

**Q: Can I run this for verticals other than medical practices?**
A: Yes. The data model (`practitioners`, `appointments`, `patients`) is generic enough for physiotherapy, beauty/wellness, driving schools, tax consultancy, coaching. The UI strings would need a vertical-specific pass (replace "Patient" with "Client" etc.) — about 1–2 days of work in the i18n catalog.

**Q: Is the "AI Practice Manager" using an LLM?**
A: No. It is a **deterministic rule engine** (~731 lines in `routes/ai-praxismanager.js`) that turns 14 sections of practice data into prioritised hints, KPIs, traffic-light recommendations, and forecasts. This is a transparency point — the product label uses "AI" loosely. You can plug a real LLM in (e.g., Anthropic Claude / OpenAI GPT) by adding a single function that summarises the JSON output for the user. ~1–2 days of integration work.

**Q: How many languages, really?**
A: 12 UI catalogs: DE, EN, FR, ES, PT, AR (RTL), RU, ZH, HI, TH, TR, ID. E-mail templates are localized across the same 12 languages in `utils/emailLocales*.js`. Spot-check the catalogs in `locales/` directly.

**Q: Is the booking flow really mobile-ready?**
A: Yes — `viewport` meta tag and responsive CSS throughout. No native mobile app.

---

## GDPR / Legal

**Q: Is it GDPR-compliant out of the box?**
A: Compliance posture, not compliance certificate. Concrete measures: no health data ever stored (no diagnoses, no medications, no DOB, no insurance numbers — enforced in the schema), patient data anonymised after 30 days by a daily cron, full activity log, security headers including HSTS. The German AGB / Datenschutz / Impressum pages exist as templates and **must be reviewed by a lawyer** before live patient use under the buyer's brand.

**Q: Are there any open lawsuits, IP disputes, or licensing problems?**
A: No. All dependencies are open-source under MIT / ISC / Apache 2.0 (`npm ls` is clean). Brand and domain are owned outright by the seller. No employees, no contractors, no equity holders.

**Q: What about the data currently in the live database?**
A: The current SQLite file contains test accounts and demo data only — no real patient data. The seller will provide a clean fresh DB on handover. Test data wipe script: `scripts/cleanup-test-account.sql`.

---

## Handover & Support

**Q: What's included in the handover?**
A: See `Transfer_Checklist.md` for the complete list — code, domain, Cloudflare zone, Render deployment, brand assets, mailbox, all credentials in a 1Password share, walkthroughs of cron jobs and i18n.

**Q: Will you help me set up?**
A: Up to 5 hours of free e-mail Q&A in the first 30 days post-close. Additional support negotiable at $120/hr.

**Q: How long does a typical handover take?**
A: 7–10 business days end-to-end. Most of that is the EPP-code domain transfer wait. Code + deployment + Cloudflare are done day one.

**Q: What happens if I find a bug right after closing?**
A: Within the 30-day post-close window, the seller will look at it as part of the included Q&A budget. After 30 days, support is paid hourly.

---

## Deal Mechanics

**Q: Payment method?**
A: Escrow via Acquire.com or Escrow.com. No direct wire transfers without third-party hold.

**Q: How do I know the code is what you describe?**
A: Sign an NDA + intent-to-purchase letter and the seller will grant a read-only repo invite. You will also get a 30-minute live walkthrough of the deployed admin dashboard, calendar, booking flow, and AI Practice Manager.

**Q: What due-diligence materials are available?**
A: This `sale/` folder is the DD pack:
- `PraxisOnline24_Investment_Report.docx` — the full investor report
- `Investor_Pitch_Deck.pptx` — 12-slide deck
- `Executive_Summary.pdf` — one-pager
- `Technical_Due_Diligence.md` — deeper code review
- `Demo_Guide.md` — what to click during your evaluation
- `Transfer_Checklist.md` — what literally transfers on closing
- `Pricing_Strategy.md` — how the asking price was reasoned
- `Acquire_Listing.md` — the public listing copy

**Q: How fast can you close?**
A: 7 days for code + repo + deployment. 7–10 days additional for the domain EPP transfer. Total: ~2 weeks for full handover.
