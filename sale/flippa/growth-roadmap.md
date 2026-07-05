# PraxisOnline24 — 12-Month Growth Roadmap

> This roadmap is a **plausible path**, not a forecast. It reflects what a buyer with typical SaaS resources could execute, assuming full-time focus and a modest launch budget. All numbers are illustrative; a serious buyer should build their own model.

---

## Guiding principles

1. **Fix hardening before scale** — a small pentest, CSP, CSRF and 2FA are cheap now, expensive later.
2. **One vertical, one language first** — pick a wedge (e.g. Germany + physiotherapy, or Spain + dentistry) before trying to serve every market.
3. **Founder-led sales for the first 20 customers** — no scaled paid ads until you have testimonials and case studies.
4. **Stripe integration is a day-1 unblocker** — the current contact-form flow is fine for validation but caps conversion.
5. **Don't invent metrics** — measure only what a paying customer cares about.

---

## Phase 0 — Days 0 to 14: Handover & Hardening

**Goal:** Take clean control of the asset and eliminate launch-blocking risks.

| # | Task | Effort | Owner |
|---|---|---|---|
| 0.1 | Complete asset transfer (GitHub, domain, Cloudflare, Render, Brevo) | 2 days | Buyer + seller |
| 0.2 | Deploy under buyer's infrastructure; verify `/api/health` + demo flow | 1 day | Buyer |
| 0.3 | Upgrade Render to Starter + persistent disk; migrate database | 2 hours | Buyer |
| 0.4 | Add CSRF, CSP, 2FA (or plan for later) | 3 days | Engineering |
| 0.5 | Enable Stripe checkout on `preise.html`; connect to `subscription.html` | 1 day | Engineering |
| 0.6 | Run OWASP ZAP baseline scan; fix findings | 1 day | Engineering |
| 0.7 | Register trademarks in target markets | 1 week (async) | Legal |
| 0.8 | Book independent 2-day pentest | scheduled month 1 | Security |

**Deliverable:** Product operating under buyer control, hardened for public launch.

---

## Phase 1 — Month 1: Wedge Selection & Alpha

**Goal:** Choose a single vertical + language + geography. Enrol 5 alpha practices at zero cost.

| # | Task | Effort |
|---|---|---|
| 1.1 | Wedge decision workshop: vertical × language × country | 1 day |
| 1.2 | Rewrite hero copy and demo flow for the chosen wedge | 2 days |
| 1.3 | Identify 100 practices in the target segment (LinkedIn, association directories, Google Maps) | 1 week |
| 1.4 | Cold outreach: 20 personalised emails/week; goal 5 alphas | Month 1 total |
| 1.5 | Manual onboarding of 5 alpha practices (free) | Month 1 total |
| 1.6 | Weekly feedback interviews with alphas | Month 1 |

**Success metric:** 5 practices actively using the calendar or invoice module weekly.

**Do not measure:** paying customers, MRR, revenue.

---

## Phase 2 — Month 2: Beta Conversion & Foundational Content

**Goal:** Convert 3 of 5 alphas into paying beta customers; publish 6 content assets.

| # | Task | Effort |
|---|---|---|
| 2.1 | Introduce paid plans to alphas; special "founding customer" pricing | 2 days |
| 2.2 | Case-study interviews with 3 alphas | 1 week |
| 2.3 | Publish 6 blog posts (SEO-targeted long-tail queries in wedge language) | Weekly |
| 2.4 | Set up Sentry error tracking; UptimeRobot | 1 day |
| 2.5 | Set up Plausible/Fathom analytics (privacy-friendly) | 1 day |
| 2.6 | Launch: paid Google Ads test budget (~$500) | ongoing |

**Success metric:** 3 paying customers. First case study drafted.

---

## Phase 3 — Month 3: Referral Loop & First Retention Data

**Goal:** Turn beta customers into referrers; measure 30-day retention.

| # | Task | Effort |
|---|---|---|
| 3.1 | Build simple in-product referral flow (referral link + discount) | 2 days |
| 3.2 | Send NPS survey to beta customers | 1 day |
| 3.3 | Analyse: which features do beta customers actually use? | 2 days |
| 3.4 | Kill / defer any unused feature module | 1 day |
| 3.5 | Fix top 3 UX friction points found in weeks 1–8 | Ongoing |
| 3.6 | Attend or sponsor 1 industry event / association meeting | 1 week |

**Success metric:** 8 paying customers; 30-day retention ≥ 80 %.

---

## Phase 4 — Months 4 to 6: Repeatable Acquisition

**Goal:** Move from founder-led sales to a repeatable channel that a first sales hire can execute.

| # | Task | Effort |
|---|---|---|
| 4.1 | Document a scripted outbound playbook | Month 4 |
| 4.2 | Hire 1 part-time SDR (or contractor) | Month 4 |
| 4.3 | Second language rollout (activate one more of the 12 built-in languages) | Month 5 |
| 4.4 | Launch practice-association partnership pilot | Month 5–6 |
| 4.5 | First feature investment: waitlist auto-fill algorithm improvement | Month 5 |
| 4.6 | Integrate first payment processor for practice-level invoicing (customer's Stripe) | Month 6 |

**Success metric:** 25 paying customers by end of month 6.

---

## Phase 5 — Months 7 to 9: Retention & Expansion

**Goal:** Reduce churn, expand ARPU per practice.

| # | Task | Effort |
|---|---|---|
| 5.1 | Introduce paid AI Assistant add-on (upsell path) | Month 7 |
| 5.2 | Launch practitioner-per-seat pricing option | Month 8 |
| 5.3 | Roll out mobile-responsive PWA install flow | Month 8 |
| 5.4 | Deploy Postgres migration (if user count > 150 practices) | Month 9 |
| 5.5 | Add Zapier / Make integration (widen ecosystem) | Month 9 |
| 5.6 | Formalise customer support: Intercom or Crisp | Month 7 |

**Success metric:** 50 paying customers; churn < 3 % monthly.

---

## Phase 6 — Months 10 to 12: Category Expansion or Vertical Depth

**Goal:** Decide the next 12 months of the business — go wider (new verticals) or deeper (dominant in current vertical).

| # | Task | Effort |
|---|---|---|
| 6.1 | Full segmentation analysis of paying customer base | 1 week |
| 6.2 | Choose: expand to 2 more verticals OR deepen the current one | Decision |
| 6.3 | If wide: launch 1 white-label vertical variant | Month 11–12 |
| 6.4 | If deep: build 3 vertical-specific features (e.g. specialised billing codes) | Month 11–12 |
| 6.5 | First hire full-time (marketing OR engineering) | Month 12 |
| 6.6 | Set up recurring investor / advisor update cadence | Month 12 |

**Success metric:** 100 paying customers; year-end MRR target defined by buyer.

---

## Cost Model (rough, illustrative)

| Category | Month 1 | Month 6 | Month 12 |
|---|---|---|---|
| Hosting (Render, Cloudflare, domain) | $50 | $75 | $150 |
| Email (Brevo) | $0 | $25 | $65 |
| AI provider | $30 | $200 | $600 |
| Marketing (ads + content) | $500 | $2,000 | $5,000 |
| Contractors / part-time SDR | $0 | $2,000 | $5,000 |
| Legal / accounting | $200 | $500 | $1,000 |
| **Total operational** | **~$780** | **~$4,800** | **~$11,815** |

Buyer should assume additional one-off costs for the security audit, trademark registration and any founder-led personal time.

---

## Risks to plan for

- **Vertical mismatch.** If the wedge choice doesn't have practice density or budget, alpha enrolment will fail. Have a 2-vertical backup ready.
- **Sales cycle length.** Medical practices are risk-averse buyers; expect 30–90 day cycles.
- **Regulatory drift.** EU AI Act may impose obligations on the AI Assistant module. Track and comply as it evolves.
- **Reputation risk of pre-launch domain.** A weak initial rollout can damage the domain's early sender reputation. Warm up email volume slowly.
- **Founder support ends at day 30.** Buyer must have engineering capability in-house or a trusted contractor lined up before day 30.

---

## Assumptions embedded in this roadmap

1. Buyer has ≥ 20 hours/week focused on this asset for at least the first 6 months.
2. Buyer has (or hires) engineering capacity for ~40 hours/month for maintenance + feature work.
3. Marketing spend of at least ~$15,000 across the first 12 months is available.
4. Buyer chooses a single wedge — not "all verticals in all languages" — for the first 6 months.

If any of these assumptions fail, revise the timeline downward. If all four hold, the milestones above are realistic but not guaranteed.
