# PraxisOnline24 — Investment Highlights

## Purpose

Bullet-driven summary of the reasons a buyer with SaaS operating experience should consider acquiring PraxisOnline24. Intended as a companion to the full Investment Report, not a substitute.

## Executive summary

The asset is offered at **USD 39,000**, below the seller's estimate of replacement build cost. All figures below are illustrative or benchmarked and clearly labelled; nothing is presented as promised outcome.

## Headline highlights

- **Complete product, not a codebase snapshot.** End-to-end flows work today: demo request → account creation → invite email → password setup → 30-day trial → dashboard usage.
- **Twelve languages already banked** — including RTL Arabic and traditional Chinese. Translation is the single most underestimated cost in international SaaS rollouts.
- **Verified email deliverability** — SPF, DKIM (two selectors) and DMARC configured on the domain. Confirmed via live DNS lookups.
- **Central pricing configuration** — one file drives the registration form, subscription page, MRR calculation and displayed prices. Changing pricing is minutes of work, not days.
- **Deployment is turnkey** — `render.yaml` committed; new owner can redeploy under their own Render account in under an hour.
- **AI feature already integrated** — practice-manager LLM adapter accepts Claude or OpenAI; monetisable as an add-on tier.
- **Sister-product proof of re-skin viability** — the same codebase base was previously used to spawn Doctoronline24; a re-brand for a different vertical takes approximately one day.

## Financial framing

| Item | Value | Source |
|---|---|---|
| Asking price | USD 39,000 | Flippa listing |
| Estimated replacement build cost (solo founder equivalent) | > TODO — insert seller estimate range | Seller build hours log |
| Comparable pre-revenue SaaS asset sales (2024–2026) | > TODO — populate with Flippa/Acquire comparable set | Public marketplace data |
| Ongoing operating cost, baseline (zero customers) | ~USD 50 / month | Documented in `06-deployment/Environment_Requirements.md` |
| Ongoing operating cost, 100 practices | > TODO — model in `Business_Model.md` | Buyer's own model |

## Buyer opportunity paths

The technical build supports several monetisation angles; the buyer chooses:

1. **Direct SaaS subscriptions** — current tiers (Basic USD 29 / Pro USD 59 / Unlimited USD 99 per month) already wired into registration and MRR reporting. Stripe integration is disabled by default; connecting is approximately two hours of work.
2. **Freemium → paid conversion** — 30-day trial and reminder emails already implemented.
3. **White-label to a healthcare association** — re-brand and offer to member practices.
4. **Vertical variant** — same codebase can spawn adjacent practice-type products with approximately one day of re-branding effort.
5. **AI Assistant add-on tier** — LLM feature is already integrated and can be positioned as premium.

## Risk factors

- **Pre-revenue.** All returns are opportunity-based, contingent on buyer execution.
- **No test suite.** Operational risk if scaled rapidly without adding one.
- **Storage-engine ceiling.** SQLite scales cleanly to ~200 practices; Postgres migration documented, not implemented.
- **No CSRF / CSP / 2FA.** Defence-in-depth items to add in first 30 days.
- **No marketing history.** Domain has no backlinks, no SEO ageing, no cold-outreach list.
- **Regulatory drift risk.** EU AI Act obligations may apply to the LLM-powered assistant as it evolves.

## Non-financial highlights

- Clean, well-commented codebase (verifiable pre-purchase via limited-time GitHub read invite)
- Every third-party dependency permissively licensed (MIT / Apache / ISC — no copyleft)
- Multi-tenancy at the row level via `practice_id` foreign key on every relevant table
- 30 days of async seller support post-transfer

## Comparable-asset context

> TODO — replace with actual comparable-set citations from Flippa closed-listing data and Acquire.com public marketplace summaries. Recommend three comparables at similar completeness / pre-revenue positioning.

## What this document is not

- A forecast of buyer outcomes
- A guarantee of any revenue outcome
- Financial advice — buyer should engage their own analyst and legal counsel

---

**NDA classification:** Share after NDA
**Last updated:** 2026-07-07
**Document owner:** The seller
**Related documents:** [Business Model](./Business_Model.md), [Market Opportunity](./Market_Opportunity.md), [Product Roadmap](../10-roadmap/Product_Roadmap.md)
