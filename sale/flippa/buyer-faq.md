# PraxisOnline24 — Buyer FAQ

> Answers to the most common questions from potential buyers. Written to be honest, not to close a deal at any cost.

---

## Business & Financials

### 1. What exactly am I buying?

A complete pre-launch SaaS asset: source code (100 % ownership transfer), domain `praxisonline24.com`, Cloudflare + Render deployment setup, verified Brevo email sender (SPF/DKIM/DMARC configured), brand assets (logo, favicon, colour palette, marketing screenshots), 12 languages of UI + email templates, and 30 days of async implementation support. You do **not** acquire a customer book or a company entity — only the digital assets.

### 2. Is there any revenue?

**No.** PraxisOnline24 is pre-revenue and pre-launch. Zero paying customers, zero MRR, zero ARR. The value is a completed product ready to be commercialised, not a running business.

### 3. Why is it pre-revenue if the product is complete?

The product build is done; the sales function is not started. Selling B2B SaaS into medical practices requires a specific go-to-market motion (cold outreach, association partnerships, healthcare content marketing) that I am not positioned to run full-time. A buyer with existing healthcare distribution can activate this much faster than I can.

### 4. What was the total build cost?

Bootstrapped by one founder over ~6 months. If replicated at typical agency rates for a senior full-stack developer (approx. €80–120/hour × 800–1,000 hours), replacement cost is in the €75,000–€120,000 range. That's the "build-vs-buy" benchmark, not a valuation.

### 5. How was the asking price ($39,000) calculated?

Pre-revenue SaaS asset pricing on Flippa typically falls between **build-cost replacement floor and buyer-opportunity ceiling**. The $39,000 asking price is well below the replacement floor and reflects that the buyer takes on all go-to-market risk. It is negotiable; final settlement price will depend on your intended use case.

### 6. Are you open to negotiation?

Yes. Serious offers with a clear use case receive priority. Quick-close offers below $30,000 will not be considered.

### 7. What ongoing costs will I inherit?

- **Render hosting:** ~$7 / month for Starter plan + ~$0.25 / GB / month for a persistent disk. Budget $15/mo including modest usage.
- **Domain renewal:** ~$15 / year via current registrar (transferable).
- **Cloudflare:** free tier is sufficient at launch.
- **Brevo email:** free tier covers up to 300 mails / day. Paid plans start ~$20/mo.
- **AI provider (Claude / OpenAI):** pay-per-use; budget $10–50/mo per active tenant depending on assistant usage.

Total baseline cost of operation at zero customers is under $50/month.

---

## Technical

### 8. What is the tech stack?

- **Backend:** Node.js 18+ LTS, Express 4.18, express-session, bcrypt 5, pdfkit, node-cron.
- **Database:** SQLite via sql.js 1.12 (in-memory with sync-to-file). 18 tables, foreign keys enforced, idempotent additive migrations.
- **Frontend:** vanilla HTML5 / CSS3 / ES modules. No React, Vue, Svelte or build step.
- **Email:** Brevo Transactional API (HTTP), fallback-tested against SMTP.
- **AI:** LLM-adapter for Claude / OpenAI in the practice-manager route.
- **Deployment:** Render (`render.yaml` committed), Cloudflare CDN + TLS, DNS via Hostinger.

### 9. Why SQLite and not Postgres from day 1?

Operational simplicity at target scale. SQLite handles the current design (~200 practices, hundreds of appointments per day) with zero maintenance. A Postgres migration path is documented in `DEPLOYMENT.md` and is a ~2–3 week project when volume warrants it.

### 10. Is the code well documented?

Yes. Modular route files (`routes/*.js`) carry inline comments explaining design decisions, not just what the code does. The `sale/` directory contains a full Technical Due Diligence report, deployment runbook and transfer checklist. The buyer gets everything I would want if I bought the codebase myself.

### 11. Are there tests?

**No unit tests, no spec files.** Playwright is a devDependency but not wired into the codebase. End-to-end flows have been manually verified. A buyer serious about scale should budget ~2 weeks of a senior engineer's time to build a proper test suite.

### 12. Any known security issues?

Standard defence-in-depth items are not yet implemented: **no CSRF tokens, no CSP header, no 2FA.** Application-level fundamentals are correct (parametrised SQL everywhere, bcrypt cost 12, output escaping, session cookies HttpOnly + Secure in production). A pre-launch security audit is recommended and would take a few days.

### 13. Is it GDPR compliant?

**Privacy-by-design.** The schema deliberately does not store diagnoses, medication data, dates of birth or insurance numbers. Demo requests are anonymised after 30 days via cron. Explicit consent flows exist on the demo, register and set-password pages. Full DSGVO/GDPR compliance also requires operational elements (DPA agreements, data-request handling, breach notification procedure) that the buyer will need to formalise with their legal team.

### 14. Is it HIPAA compliant?

**No.** The codebase is not audited for HIPAA and no BAA-ready configuration exists. If the buyer wants a US healthcare market, budget for a HIPAA compliance project (encryption at rest for the database, formal audit trail, BAA with hosting providers).

### 15. What about accessibility (WCAG)?

The UI follows semantic HTML, ARIA labels are used on form controls and password-toggle icons. It has not been formally audited against WCAG AA. Basic accessibility (keyboard navigation, screen reader labels) works.

### 16. What languages does the product support?

12 languages: German, English, French, Spanish, Portuguese, Arabic (RTL), Russian, Chinese, Hindi, Thai, Turkish, Indonesian. Both UI and email templates are fully translated.

### 17. How is email deliverability handled?

- **Transport:** Brevo Transactional HTTPS API (not SMTP — that's a design decision to avoid Render's outbound port timeouts).
- **DNS:** SPF, DKIM (2 selectors: `brevo1._domainkey` and `brevo2._domainkey`), DMARC — all configured and verified.
- **Sender:** `PraxisOnline24 <info@praxisonline24.com>` — authenticated in Brevo.
- **Bounce/return-path:** aligned via DKIM (subdomain CNAME for aligned SPF is optional and documented).

---

## Product

### 18. Can I see a working demo?

Yes. The live pre-launch instance is at **https://praxisonline24.com**. Public pages (homepage, pricing, demo request, public practice profile) are accessible without login. For the practitioner-facing dashboard, calendar, patients, invoices etc., I will grant a time-limited demo login upon request during due diligence.

### 19. Is the AI assistant using real LLM APIs?

Yes. `/api/ai-praxismanager` calls a swappable LLM adapter (currently configured for Claude and OpenAI). API key is a buyer-provided env variable. Under current traffic, cost per active practice is modest, but a serious operator should model this as a variable cost per tenant.

### 20. Can the platform be white-labelled?

Yes. The branding string is centralised in `utils/emailLocales.js` and the browser copy in `public/js/public-i18n.js`. Logo assets and colour palette are in `public/css/style.css`. A full re-brand is typically a 1-day project. The sister project Doctoronline24 was created by exactly this process from the same codebase base.

### 21. Which browsers are supported?

Modern evergreen browsers: Chrome, Firefox, Edge, Safari (macOS + iOS). No IE support. Mobile responsive.

### 22. Is there a mobile app?

No native mobile app. The web UI is mobile-responsive and works as a PWA-compatible experience. Building a wrapper (React Native or Capacitor) is a possible follow-up.

---

## Transfer & Post-Sale

### 23. How does the actual transfer work?

1. Escrow is opened on Flippa; buyer wires funds.
2. Once funds are held in escrow, I initiate:
   - GitHub repository transfer to buyer's account
   - Domain transfer via registrar unlock + auth code
   - Cloudflare zone re-assign
   - Render service ownership transfer (or fresh deploy under buyer's Render account)
   - Brevo sender identity re-verification under buyer's Brevo account
3. Buyer confirms operational access to each item.
4. Escrow releases funds. Full transfer target: 7 days from cleared payment.

### 24. What does the 30-day support cover?

Async support via a shared communication channel (email, Slack or Linear — buyer's choice). Coverage: deployment questions, code walkthroughs, environment migration help, config decisions, transfer paperwork. Budget: up to ~10 hours of my time in month 1. Not covered: net-new feature work.

### 25. Can I get post-30-day support?

Available on request at a standard consulting rate. Not bundled in the sale price.

### 26. Will you sign an NDA during due diligence?

Yes, standard mutual NDA is available on request.

### 27. Will you sign a non-compete?

Time-limited, geography-limited non-compete is negotiable. I would not agree to a global perpetual non-compete for the general "medical practice SaaS" space, because the underlying code originates from a sister project I still work on.

### 28. Is there a training package for new operators?

The 30-day support includes async knowledge transfer. Structured training (recorded walkthroughs, live sessions) can be added as a paid extra.

---

## Legal / Risk

### 29. Are there any active lawsuits or IP disputes?

No. The codebase is my original work. All third-party dependencies are permissively licensed (MIT, Apache 2.0, ISC — full audit available). No trademarks are registered on "PraxisOnline24" — the buyer is free to register in their target market.

### 30. Are you selling a company entity?

No. Asset sale only: source code, IP rights, domain, brand assets. No company shares change hands. This simplifies the transaction and lets the buyer use their own legal entity.

### 31. Can two buyers bid?

Yes, the listing is open to competing offers until sale-agreed. First serious offer that meets my target price and has a credible use case will get right of first refusal for 48 hours.

### 32. What if I'm not sure yet?

Ask questions here or in Flippa messages. If you're serious but not ready to commit, a small refundable due-diligence retainer can lock the listing for 7 days.
