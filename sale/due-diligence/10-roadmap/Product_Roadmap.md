# PraxisOnline24 — 12-Month Product Roadmap

## Purpose

Illustrative 12-month growth path a buyer could execute after transfer. Explicitly framed as a **planning tool, not a forecast**. Numbers, milestones and hire timings are indicative.

## Executive summary

Seven phases across twelve months, from Day-1 handover hardening to Month-12 category decision. Assumes buyer commits ≥ 20 hours per week to the asset for the first six months, has (or hires) approximately 40 hours per month of engineering capacity, and has budgeted approximately USD 15,000 for marketing across year 1. If any of those assumptions fail, timelines extend.

## Guiding principles

1. **Harden before scale.** A small pentest, CSP, CSRF and 2FA are cheap now, expensive later.
2. **One wedge first.** Pick a vertical × language × geography before trying to serve every market.
3. **Founder-led sales for the first 20 customers.** No scaled paid ads until you have testimonials and case studies.
4. **Stripe integration is Day-1.** The current contact-form flow is fine for validation but caps conversion.

## Phase 0 — Days 0 to 14: Handover and hardening

**Goal:** Take clean control of the asset and eliminate launch-blocking risks.

| Task | Effort | Owner |
|---|---|---|
| Complete asset transfer per [Asset Transfer Checklist](../09-legal-and-transfer/Asset_Transfer_Checklist.md) | 2 days | Buyer + seller |
| Deploy under buyer's infrastructure; verify `/api/health` + demo flow | 1 day | Buyer |
| Upgrade Render to Starter plan + attach persistent disk | 2 hours | Buyer |
| Add CSRF, CSP, 2FA (or plan for later) | 3 days | Engineering |
| Enable Stripe checkout on the pricing page | 1 day | Engineering |
| Run OWASP ZAP baseline scan; fix findings | 1 day | Engineering |
| Register trademarks in target markets | 1 week (async) | Legal |
| Book independent 2-day penetration test | scheduled month 1 | Security |

Deliverable: Product operating under buyer control, hardened for public launch.

## Phase 1 — Month 1: Wedge selection and alpha enrolment

**Goal:** Choose a single vertical + language + geography. Enrol 5 alpha practices at zero cost.

| Task | Effort |
|---|---|
| Wedge decision workshop: vertical × language × country | 1 day |
| Rewrite hero copy and demo flow for the chosen wedge | 2 days |
| Identify 100 practices in the target segment (LinkedIn, association directories, Google Maps) | 1 week |
| Cold outreach: 20 personalised emails/week; goal 5 alphas | Month 1 total |
| Manual onboarding of 5 alpha practices (free) | Month 1 total |
| Weekly feedback interviews with alphas | Month 1 |

Success signal: 5 practices actively using the calendar or invoice module weekly.

## Phase 2 — Month 2: Beta conversion and content foundations

**Goal:** Convert 3 of 5 alphas into paying beta customers; publish 6 SEO-anchored content assets.

| Task | Effort |
|---|---|
| Introduce paid plans to alphas; special "founding customer" pricing | 2 days |
| Case-study interviews with 3 alphas | 1 week |
| Publish 6 blog posts (SEO-targeted long-tail queries in wedge language) | Weekly |
| Set up Sentry error tracking; UptimeRobot | 1 day |
| Set up Plausible or Fathom analytics (privacy-friendly) | 1 day |
| Launch paid Google Ads test budget (~USD 500) | ongoing |

## Phase 3 — Month 3: Referral loop and first retention data

**Goal:** Turn beta customers into referrers; measure 30-day retention.

| Task | Effort |
|---|---|
| Build simple in-product referral flow (referral link + discount) | 2 days |
| Send NPS survey to beta customers | 1 day |
| Analyse: which features do beta customers actually use? | 2 days |
| Kill or defer any unused feature module | 1 day |
| Fix top 3 UX friction points found in weeks 1–8 | Ongoing |
| Attend or sponsor 1 industry event or association meeting | 1 week |

## Phase 4 — Months 4 to 6: Repeatable acquisition

**Goal:** Move from founder-led sales to a repeatable channel that a first sales hire can execute.

| Task | Effort |
|---|---|
| Document a scripted outbound playbook | Month 4 |
| Hire 1 part-time SDR or contractor | Month 4 |
| Second language rollout (activate one more of the 12 built-in languages) | Month 5 |
| Launch practice-association partnership pilot | Months 5–6 |
| First feature investment: waitlist auto-fill algorithm improvement | Month 5 |
| Integrate first payment processor for practice-level invoicing (customer's Stripe) | Month 6 |

## Phase 5 — Months 7 to 9: Retention and expansion

**Goal:** Reduce churn, expand average revenue per practice.

| Task | Effort |
|---|---|
| Introduce paid AI Assistant add-on (upsell path) | Month 7 |
| Launch practitioner-per-seat pricing option | Month 8 |
| Roll out mobile-responsive PWA install flow | Month 8 |
| Deploy PostgreSQL migration (if user count exceeds 150 practices) | Month 9 |
| Add Zapier or Make integration (widen ecosystem) | Month 9 |
| Formalise customer support: Intercom or Crisp | Month 7 |

## Phase 6 — Months 10 to 12: Category expansion or vertical depth

**Goal:** Decide the next 12 months of the business — go wider (new verticals) or deeper (dominant in current vertical).

| Task | Effort |
|---|---|
| Full segmentation analysis of paying customer base | 1 week |
| Choose: expand to 2 more verticals OR deepen the current one | Decision |
| If wide: launch 1 white-label vertical variant | Months 11–12 |
| If deep: build 3 vertical-specific features (e.g. specialised billing codes) | Months 11–12 |
| First full-time hire (marketing OR engineering) | Month 12 |
| Set up recurring investor or advisor update cadence | Month 12 |

## Cost model (rough, illustrative)

| Category | Month 1 | Month 6 | Month 12 |
|---|---|---|---|
| Hosting (Render, Cloudflare, domain) | USD 50 | USD 75 | USD 150 |
| Email (Brevo) | USD 0 | USD 25 | USD 65 |
| AI provider | USD 30 | USD 200 | USD 600 |
| Marketing (ads + content) | USD 500 | USD 2,000 | USD 5,000 |
| Contractors / part-time SDR | USD 0 | USD 2,000 | USD 5,000 |
| Legal / accounting | USD 200 | USD 500 | USD 1,000 |
| **Total operational** | **~USD 780** | **~USD 4,800** | **~USD 11,815** |

Buyer should assume additional one-off costs for security audit, trademark registration, and any founder-led personal time.

## Risks to plan for

- **Vertical mismatch.** If the wedge choice doesn't have practice density or budget, alpha enrolment will fail. Have a 2-vertical backup ready.
- **Sales cycle length.** Medical practices are risk-averse buyers; expect 30–90 day cycles.
- **Regulatory drift.** EU AI Act may impose obligations on the AI Assistant module as it evolves.
- **Reputation risk of pre-launch domain.** A weak initial rollout can damage the domain's early sender reputation. Warm up email volume slowly.
- **Founder support ends at Day 30.** Buyer must have engineering capability in-house or a trusted contractor lined up before Day 30.

## Assumptions embedded in this roadmap

1. Buyer has ≥ 20 hours per week focused on this asset for at least the first six months
2. Buyer has (or hires) engineering capacity for approximately 40 hours per month for maintenance and feature work
3. Marketing spend of at least approximately USD 15,000 across the first 12 months is available
4. Buyer chooses a single wedge — not "all verticals in all languages" — for the first six months

> TODO — buyer to insert their own numeric targets for practices enrolled, revenue, and hires per phase.

## What this document is not

- A forecast of buyer outcomes
- A commitment from the seller regarding buyer's success
- Financial advice

---

**NDA classification:** Share after NDA
**Last updated:** 2026-07-07
**Document owner:** The seller
**Related documents:** [Investment Highlights](../02-investment-report/Investment_Highlights.md), [Business Model](../02-investment-report/Business_Model.md), [Market Opportunity](../02-investment-report/Market_Opportunity.md)
