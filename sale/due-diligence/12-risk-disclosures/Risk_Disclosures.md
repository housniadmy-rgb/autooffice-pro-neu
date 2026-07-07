# PraxisOnline24 — Risk Disclosures

## Purpose

Structured, transparent inventory of the risks associated with acquiring PraxisOnline24. Written to help a buyer make an informed decision, not to promote the asset. Every risk here is either already surfaced in the Flippa listing or in a section-specific document under `sale/due-diligence/`.

## Executive summary

PraxisOnline24 is a **pre-revenue asset sale**. All returns are opportunity-based, contingent on buyer execution. The technical build is complete and hardened at fundamentals level; the go-to-market motion is not started. Below is the full risk register categorised by domain, with likelihood, impact and mitigation status.

## How to read the risk register

- **Likelihood:** *Low* / *Medium* / *High* — seller's honest assessment; the buyer should form their own view during DD
- **Impact if realised:** *Low* / *Medium* / *High* — magnitude on the buyer's business, not on the transaction itself
- **Mitigation status:** *Documented* (approach known and captured in this DD package), *Partial* (mitigation exists but is incomplete), *Not started* (buyer's responsibility from Day 1)

The register is not exhaustive. Buyers are expected to identify additional risks specific to their target market, jurisdiction, and operating model.

## Category 1 — Commercial risks

### 1.1 Pre-revenue with no proven demand

- **Description:** Zero paying customers, zero MRR, zero ARR. The commercial model is priced-in but unvalidated.
- **Likelihood of impact:** N/A (existing condition, not a future event)
- **Impact:** High — the entire valuation is opportunity-based
- **Mitigation status:** Documented in [Executive Summary](../01-executive-summary/Executive_Summary.md) and [Investment Highlights](../02-investment-report/Investment_Highlights.md)
- **Buyer action:** Model own unit economics; validate demand in chosen wedge before scaling

### 1.2 Founder-market fit dependency

- **Description:** Selling B2B SaaS into medical practices requires a specific go-to-market motion (cold outreach, association partnerships, healthcare content marketing). If the buyer lacks these capabilities or a suitable hire, growth stalls.
- **Likelihood:** Medium
- **Impact:** High
- **Mitigation status:** Documented — [Product Roadmap](../10-roadmap/Product_Roadmap.md) recommends hiring a part-time SDR by Month 4
- **Buyer action:** Confirm own capability or lined-up hire before commitment

### 1.3 Long sales cycle

- **Description:** Medical practices are risk-averse buyers. Sales cycles of 30–90 days are typical. Cash burn during customer-acquisition phase must be pre-funded.
- **Likelihood:** High
- **Impact:** Medium
- **Mitigation status:** Documented in Product Roadmap cost model
- **Buyer action:** Have working capital for ~12 months of operations before revenue matters

### 1.4 Wedge-selection risk

- **Description:** Choosing the wrong first vertical × language × geography may exhaust cold-outreach budget without alpha enrolment.
- **Likelihood:** Medium
- **Impact:** Medium
- **Mitigation status:** Documented — [Market Opportunity](../02-investment-report/Market_Opportunity.md) provides a wedge-selection framework
- **Buyer action:** Have a two-wedge backup before initial commitment

## Category 2 — Technical risks

### 2.1 SQLite storage-engine ceiling

- **Description:** SQLite scales cleanly to approximately 200 practices at the current schema density. Beyond that, memory footprint and single-process concurrency become issues.
- **Likelihood:** Medium (once traction is achieved)
- **Impact:** Medium
- **Mitigation status:** Documented — Postgres migration path in [Database Overview](../04-technical-documentation/Database_Overview.md); estimated 2–3 week engineering effort
- **Buyer action:** Monitor practice count from Day 1; trigger migration project when count exceeds 150

### 2.2 In-memory session store

- **Description:** `express-session` uses default MemoryStore. Session data is lost on every process restart. All logged-in users must re-authenticate after any redeploy.
- **Likelihood:** High (occurs on every deploy)
- **Impact:** Low (mild UX friction, not data loss)
- **Mitigation status:** Documented — Redis swap is approximately one hour of engineering work
- **Buyer action:** Deferrable until scale warrants; swap when concurrent user count exceeds ~50

### 2.3 Absence of unit test suite

- **Description:** Playwright is a development dependency but no spec files exist. End-to-end flows have been manually verified. Regression testing requires re-verification.
- **Likelihood:** High (impacts every future change)
- **Impact:** Medium
- **Mitigation status:** Not started — buyer's responsibility
- **Buyer action:** Budget approximately two weeks of a senior engineer's time for initial test-suite build-out; add tests progressively for each new change

### 2.4 Deprecated dependency: `moment.js`

- **Description:** The `moment` library is officially deprecated by its maintainers. It still works but no longer receives feature updates or security patches beyond critical fixes.
- **Likelihood:** Low (immediate impact); Medium (12-month horizon)
- **Impact:** Low
- **Mitigation status:** Partial — migration to `date-fns` documented as approximately four hours of work
- **Buyer action:** Include in first-30-days hardening sprint

### 2.5 Ephemeral hosting on Render Free tier

- **Description:** Current `render.yaml` may be configured for Free tier, which has ephemeral storage. Any redeploy resets the SQLite database.
- **Likelihood:** High (if buyer does not upgrade)
- **Impact:** High (data loss on redeploy)
- **Mitigation status:** Documented — Starter plan + persistent disk documented in [Deployment Guide](../06-deployment/Deployment_Guide.md); one-hour buyer action to complete
- **Buyer action:** Upgrade to Starter plan + persistent disk in Phase 0 (Days 0–14)

## Category 3 — Security risks

### 3.1 No CSRF token protection

- **Description:** State-changing routes do not require CSRF tokens. Session cookies with `SameSite=Lax` mitigate the common CSRF attack class but do not eliminate it.
- **Likelihood:** Low (session cookie mitigations reduce practical exploitability)
- **Impact:** Medium
- **Mitigation status:** Not started — recommended defence-in-depth addition
- **Buyer action:** Add `csurf` middleware or equivalent in first-30-days hardening

### 3.2 No Content Security Policy header

- **Description:** No CSP header is currently set. XSS-injected script would run with the same origin's privileges.
- **Likelihood:** Low (assuming buyer maintains parametrised SQL and output escaping)
- **Impact:** Medium
- **Mitigation status:** Not started
- **Buyer action:** Configure CSP header via the security middleware in first-30-days hardening

### 3.3 No two-factor authentication

- **Description:** All accounts, including the owner and administrator accounts, are protected by a single password only.
- **Likelihood:** Low (if password is strong and unique)
- **Impact:** High (owner-account compromise gives full data access)
- **Mitigation status:** Not started — 2FA is documented as a Day-30 recommendation
- **Buyer action:** Add 2FA for owner and administrator roles at minimum; consider optional 2FA for practitioner accounts

### 3.4 No formal external security audit

- **Description:** The codebase has not been penetration-tested by an independent third party. Application-level fundamentals are correctly implemented (parametrised SQL, bcrypt cost 12, secure cookies) but a formal audit has not verified them.
- **Likelihood:** N/A (missing verification, not a future event)
- **Impact:** Medium
- **Mitigation status:** Not started
- **Buyer action:** Book an independent 2–3 day audit within 30 days of transfer

### 3.5 No CI-integrated dependency scanning

- **Description:** `npm audit` is not run automatically on every deployment. New vulnerabilities in transitive dependencies may go undetected.
- **Likelihood:** Medium (over time)
- **Impact:** Medium
- **Mitigation status:** Not started
- **Buyer action:** Add `npm audit --production` step to the CI pipeline in first-30-days hardening

## Category 4 — Legal and regulatory risks

### 4.1 Trademark not registered

- **Description:** "PraxisOnline24" is not a registered trademark in any jurisdiction. A third party could register the mark in the buyer's target market before the buyer does.
- **Likelihood:** Low
- **Impact:** Medium (rebrand cost if displaced)
- **Mitigation status:** Documented in [IP and Licensing](../09-legal-and-transfer/IP_and_Licensing.md)
- **Buyer action:** Register trademark in target market within first 60 days

### 4.2 No HIPAA compliance for US market

- **Description:** The codebase is not audited for HIPAA and no BAA-ready configuration exists. US healthcare market entry requires a HIPAA compliance project.
- **Likelihood:** N/A (only material if buyer targets US)
- **Impact:** High (blocks US market entry until resolved)
- **Mitigation status:** Not started — HIPAA compliance is a multi-month project
- **Buyer action:** Confirm target market; if US, budget a formal HIPAA compliance project (estimate: > TODO — buyer's counsel to size)

### 4.3 GDPR compliance requires operational elements not in scope

- **Description:** Schema is privacy-conscious but full GDPR alignment requires DPA agreements with sub-processors (Render, Cloudflare, Brevo), documented data-request handling, and a breach notification procedure. None of these operational elements are part of the code sale.
- **Likelihood:** N/A (only material if buyer targets EU)
- **Impact:** High (regulatory penalties if unaddressed)
- **Mitigation status:** Partial — schema design supports GDPR; operational compliance is buyer-side
- **Buyer action:** Engage EU counsel; establish DPAs with all sub-processors; implement DSAR (data subject access request) procedure

### 4.4 EU AI Act obligations for AI Assistant module

- **Description:** The LLM-powered AI Practice Manager may fall within scope of the EU AI Act as the regulation phases in. Obligations depend on classification and use case.
- **Likelihood:** Medium (over 12-month horizon)
- **Impact:** Medium
- **Mitigation status:** Not started — regulatory landscape evolves
- **Buyer action:** Track EU AI Act rulemaking; consult specialist counsel before EU launch

### 4.5 Data residency requirements in specific markets

- **Description:** Some markets (Germany health data, MENA sovereign data rules, others) may require in-country deployment.
- **Likelihood:** Depends on target market
- **Impact:** Medium (may require additional deployment infrastructure)
- **Mitigation status:** Documented — Render's Frankfurt region covers EU customers
- **Buyer action:** Confirm data residency requirements per target market

## Category 5 — Operational risks

### 5.1 Sole-founder operational knowledge concentration

- **Description:** Everything about how the system operates, why design decisions were made, and how to troubleshoot production issues is currently in the seller's head. The 30-day support window captures much of this but is time-limited.
- **Likelihood:** N/A (existing condition)
- **Impact:** Medium — post-Day-30 issues require independent troubleshooting
- **Mitigation status:** Documented in this DD package plus 30-day async support
- **Buyer action:** Use the 30-day window intensively; capture every meaningful conversation in shared documentation

### 5.2 Third-party service dependency

- **Description:** Render, Cloudflare, Brevo, LLM provider — each is a single point of failure. Any of these could suspend an account or change pricing unfavourably.
- **Likelihood:** Low per provider, Medium in aggregate over 12 months
- **Impact:** Medium
- **Mitigation status:** Partial — documented migration paths per service; no live redundancy
- **Buyer action:** Maintain up-to-date credentials + billing on file for each service; consider secondary provider for email deliverability

### 5.3 Email deliverability degradation

- **Description:** Yahoo, Gmail, and Web.de can reclassify sender reputation at any time. New-domain reputation is unproven.
- **Likelihood:** Low to Medium
- **Impact:** Medium
- **Mitigation status:** SPF, DKIM, DMARC configured; monitoring recommended
- **Buyer action:** Warm up sending volume slowly; monitor Brevo bounce and complaint rates; set up daily deliverability check

### 5.4 AI provider cost variability

- **Description:** LLM provider pricing may change; per-tenant briefing costs can grow unexpectedly if usage spikes.
- **Likelihood:** Medium
- **Impact:** Medium (cost margin compression)
- **Mitigation status:** Not started — no per-tenant cost caps in current code
- **Buyer action:** Add per-tenant cost cap or feature-gate the AI Assistant in higher tiers before scaling

## Category 6 — Market risks

### 6.1 Competitive dynamics may shift quickly

- **Description:** Incumbent practice-management SaaS providers may lower prices, add localised versions, or acquire smaller competitors during buyer's launch phase.
- **Likelihood:** Medium
- **Impact:** Medium
- **Mitigation status:** Documented in [Market Opportunity](../02-investment-report/Market_Opportunity.md) — competitive positioning requires quarterly review
- **Buyer action:** Establish competitive-intelligence cadence; adjust wedge if position deteriorates

### 6.2 Practice-buying behaviour is fragmented and slow

- **Description:** Independent practices buy software rarely; switching costs are low but decision inertia is high. Building traction in the first six months is unpredictable.
- **Likelihood:** High
- **Impact:** Medium
- **Mitigation status:** Documented in Product Roadmap — founder-led sales assumption
- **Buyer action:** Plan for uneven traction; do not draw conclusions from any single month's numbers

## Category 7 — Reputational risks

### 7.1 Domain reputation is fresh

- **Description:** `praxisonline24.com` has no established SEO ageing, no backlinks, no track record with major mail providers.
- **Likelihood:** N/A (existing condition)
- **Impact:** Low to Medium — extends the runway required for organic-traffic acquisition
- **Mitigation status:** Partial — technical email-authentication is in place
- **Buyer action:** Budget for content-and-link acquisition; consider paid distribution to accelerate early ranking

### 7.2 Weak launch damages long-term reputation

- **Description:** A public launch that fails to attract users can leave permanent traces (empty forums, defunct reviews, stale press mentions).
- **Likelihood:** Low if launch is disciplined
- **Impact:** Medium
- **Mitigation status:** Documented in Product Roadmap — soft-launch with alpha practices recommended
- **Buyer action:** Follow the phased roadmap; avoid premature scaled public launch

## Risk categories not applicable

Some categories commonly appearing in risk registers do not apply here because they are structurally excluded:

- **Payment-card data breach** — not applicable, no card storage; Stripe would handle if activated
- **Employee-based operational risk** — not applicable, no employees are being transferred
- **Existing customer churn** — not applicable, no existing customers
- **Contract-renewal risk** — not applicable, no existing contracts

## Buyer's ongoing risk-management responsibilities

After transfer, the buyer takes responsibility for:

- Maintaining the risk register with new items as they emerge
- Reviewing this document at least quarterly
- Establishing an incident response procedure
- Setting up monitoring and alerting for early-warning signals
- Compliance obligations in the target market

## What this document is not

- A guarantee that these are all the risks
- A representation that the seller has knowledge of risks not listed
- Legal advice — buyer's counsel should review before commitment
- Financial advice — buyer's analyst should model impact

---

**NDA classification:** Share after NDA
**Last updated:** 2026-07-07
**Document owner:** The seller
**Related documents:** [Executive Summary](../01-executive-summary/Executive_Summary.md), [Investment Highlights](../02-investment-report/Investment_Highlights.md), [Security](../04-technical-documentation/Security.md), [Product Roadmap](../10-roadmap/Product_Roadmap.md), [IP and Licensing](../09-legal-and-transfer/IP_and_Licensing.md)
