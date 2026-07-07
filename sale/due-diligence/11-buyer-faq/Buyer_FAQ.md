# PraxisOnline24 — Buyer Frequently Asked Questions

## Purpose

Anticipated buyer questions, answered honestly and consistently across the DD package. Reduces the volume of Flippa messaging back-and-forth and lets the buyer self-serve on standard concerns before scheduling any call.

## Executive summary

**32 questions in 5 categories.** The seller does not answer differently across channels. If a question is not covered here, ask via Flippa messaging — new questions are batched and added at the next document revision.

## Business and Financials

### 1. What exactly am I buying?

A complete pre-launch SaaS asset: source code, domain `praxisonline24.com`, Cloudflare + Render deployment configuration, verified Brevo sender identity, brand kit, 12 language locales, complete buyer documentation, and 30 days of asynchronous handover support. **Not** a customer book, **not** a company entity.

### 2. Is there any revenue?

**No.** PraxisOnline24 is pre-revenue and pre-launch. Zero paying customers. Zero MRR. Zero ARR. The value is the completed product ready to be commercialised, not a running business.

### 3. Why is it pre-revenue if the product is complete?

The technical build is done; the sales function is not started. Selling B2B SaaS into medical practices requires a specific go-to-market motion (cold outreach, association partnerships, healthcare content marketing) that the current seller is not positioned to run full-time. A buyer with existing healthcare distribution can activate this much faster.

### 4. What was the total build cost?

Bootstrapped by one founder over approximately six months. Replicating at typical agency rates for a senior full-stack developer (approximately EUR 80–120 per hour × 800–1,000 hours) puts replacement cost in the EUR 75,000–120,000 range. That is the build-vs-buy benchmark, not a valuation.

### 5. How was the asking price of USD 39,000 calculated?

Pre-revenue SaaS asset pricing on Flippa typically falls between the build-cost replacement floor and the buyer-opportunity ceiling. The USD 39,000 asking price is well below the replacement floor and reflects that the buyer takes on all go-to-market risk. It is negotiable; final settlement depends on the buyer's intended use case.

### 6. Are you open to negotiation?

Yes. Serious offers with a clear use case receive priority. Quick-close offers substantially below the asking price will not be considered.

### 7. What ongoing costs will I inherit?

Full breakdown in [Environment Requirements](../06-deployment/Environment_Requirements.md) and [Infrastructure](../05-architecture/Infrastructure.md). Baseline at zero customers is under USD 50 per month. Cost model at 10 / 100 / 1000 practices is available in [Business Model](../02-investment-report/Business_Model.md).

## Technical

### 8. What is the tech stack?

Node.js 18+ LTS, Express 4.18, SQLite via `sql.js` 1.12, bcrypt cost 12, vanilla HTML/CSS/JS frontend, Brevo transactional email, LLM adapter for Claude or OpenAI. Full inventory in [Technology Stack](../04-technical-documentation/Technology_Stack.md).

### 9. Why SQLite and not PostgreSQL from day one?

Operational simplicity at target scale. SQLite handles the current design (~200 practices, hundreds of appointments per day) with zero maintenance. A PostgreSQL migration path is documented and is a ~2–3 week project when volume warrants it. See [Database Overview](../04-technical-documentation/Database_Overview.md).

### 10. Is the code well documented?

Modular route files carry inline comments explaining design decisions, not just what the code does. This DD folder plus the source-code READMEs contain everything a seller would want if the roles were reversed.

### 11. Are there tests?

**No unit tests, no spec files.** Playwright is a development dependency but not wired into the codebase. End-to-end flows have been manually verified. A buyer serious about scale should budget approximately two weeks of a senior engineer's time to build a proper test suite.

### 12. Any known security issues?

Application-level fundamentals are correct (parametrised SQL, bcrypt cost 12, secure session cookies). Defence-in-depth gaps: no CSRF, no CSP header, no 2FA. A pre-launch security audit is recommended. Full disclosure in [Security](../04-technical-documentation/Security.md).

### 13. Is it GDPR compliant?

**Privacy by design.** The schema deliberately excludes clinical data, dates of birth and insurance numbers. Full GDPR compliance also requires operational elements (DPA agreements, data-request handling, breach notification) that the buyer will need to formalise with their legal team.

### 14. Is it HIPAA compliant?

**No.** The codebase is not audited for HIPAA and no BAA-ready configuration exists. US healthcare market entry requires a HIPAA compliance project.

### 15. What about accessibility (WCAG)?

The UI follows semantic HTML with ARIA labels on form controls and password-toggle icons. It has not been formally audited against WCAG AA. Basic accessibility (keyboard navigation, screen reader labels) works.

### 16. What languages does the product support?

Twelve languages: German, English, French, Spanish, Portuguese, Arabic (RTL), Russian, Chinese, Hindi, Thai, Turkish, Indonesian. Both UI and email templates are fully translated.

### 17. How is email deliverability handled?

Brevo transactional HTTPS API (not SMTP — a design choice to avoid Render's outbound port timeouts). SPF, DKIM (2 selectors) and DMARC configured and verified on the domain. Full detail in [Infrastructure](../05-architecture/Infrastructure.md).

## Product

### 18. Can I see a working demo?

Yes. The live pre-launch instance is at `https://praxisonline24.com`. Public pages are accessible without login. For the practitioner-facing dashboard, a time-limited demo login is granted upon request during DD.

### 19. Is the AI assistant using real LLM APIs?

Yes. The `/api/ai-praxismanager` endpoint calls a swappable LLM adapter. Buyer provides their own API key via environment variable.

### 20. Can the platform be white-labelled?

Yes. Branding strings are centralised in `utils/emailLocales.js` and `public/js/public-i18n.js`. Logo and colour palette are in `public/css/style.css`. A full re-brand is typically a one-day project. The sister project Doctoronline24 was created by this process.

### 21. Which browsers are supported?

Modern evergreen browsers: Chrome, Firefox, Edge, Safari (macOS + iOS). No Internet Explorer support. Mobile responsive.

### 22. Is there a mobile app?

No native mobile app. The web UI is mobile-responsive. Building a wrapper (React Native or Capacitor) is a possible follow-up.

## Transfer and Post-Sale

### 23. How does the actual transfer work?

Detailed in [Asset Transfer Checklist](../09-legal-and-transfer/Asset_Transfer_Checklist.md). Summary: 7 calendar days from cleared escrow, sequential handover of GitHub repo → domain → Cloudflare → Render → Brevo → brand assets → 30-day support channel setup.

### 24. What does the 30-day support cover?

Asynchronous support via a shared communication channel. Coverage: deployment questions, code walkthroughs, environment migration help, configuration decisions. Approximately 10 hours of seller time. Not covered: new-feature work.

### 25. Can I get post-30-day support?

Available on request at a standard consulting rate. Not bundled in the sale price.

### 26. Will you sign an NDA during due diligence?

Yes, standard mutual NDA is available. Template held in `sale/due-diligence/09-legal-and-transfer/`.

### 27. Will you sign a non-compete?

Time-limited, geography-limited non-compete is negotiable. Not global perpetual for the general medical-practice-SaaS space, because the underlying code originates from a sister project that continues.

### 28. Is there a training package for new operators?

The 30-day support includes asynchronous knowledge transfer. Structured training (recorded walkthroughs, live sessions) can be added as a paid extra.

## Legal and Risk

### 29. Are there any active lawsuits or IP disputes?

No. The codebase is original work. All third-party dependencies are permissively licensed. Details in [IP and Licensing](../09-legal-and-transfer/IP_and_Licensing.md). No trademark is registered on "PraxisOnline24" — buyer may register in their target market.

### 30. Are you selling a company entity?

No. Asset sale only: source code, IP rights, domain, brand assets. No company shares change hands. Simplifies the transaction and lets the buyer use their own legal entity.

### 31. Can two buyers bid?

Yes, the listing is open to competing offers until sale-agreed. First serious offer that meets the target price and has a credible use case gets right of first refusal for 48 hours.

### 32. What if I'm not sure yet?

Ask questions via Flippa messaging. A small refundable due-diligence retainer can lock the listing for 7 days if you are serious but not ready to commit.

## When your question isn't here

Ask via the Flippa listing message system. Responses within 24 hours during business days. Recurring new questions get folded into a future revision of this document.

---

**NDA classification:** Public
**Last updated:** 2026-07-07
**Document owner:** The seller
**Related documents:** [Executive Summary](../01-executive-summary/Executive_Summary.md), [Investment Highlights](../02-investment-report/Investment_Highlights.md), [Asset Transfer Checklist](../09-legal-and-transfer/Asset_Transfer_Checklist.md)
