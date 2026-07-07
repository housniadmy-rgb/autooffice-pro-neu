# PraxisOnline24 — Business Model

## Purpose

Explain the intended commercial model, the mechanisms already implemented in the code, and the levers a new owner can pull to activate revenue. Pre-revenue: no historic figures; only architecture and design intent.

## Executive summary

PraxisOnline24 is designed as a **B2B SaaS subscription business** with three published tiers, a 30-day trial, and a contact-form fallback for payment activation. The subscription plumbing exists end to end; the buyer decides which monetisation path to activate first.

## Subscription tiers (currently configured)

| Tier | Monthly price | Appointment cap | Practitioner cap | Feature scope |
|---|---|---|---|---|
| Basic | USD 29 | 200 / month | 3 | Core booking, patient records, invoices, reviews |
| Pro | USD 59 | 500 / month | 10 | Basic + waitlist, AI Practice Manager |
| Unlimited | USD 99 | Unlimited | Unlimited | Pro + priority support |

Prices, plan names, feature caps and per-tier feature flags are all driven from a **single central config file** (`config/pricing.js`) served to both the backend MRR calculation and the browser via `/js/pricing-config.js`. A price change propagates repository-wide on the next deploy.

## Trial and conversion flow

- 30-day free trial starts at practice creation
- Trial reminder emails at 5, 1 and 0 days before expiry (`sendTrialReminder`)
- On expiry, account is paused (not deleted) — buyer configures dunning policy
- **Stripe checkout is not wired by default** — the current listing directs users to a contact form for manual activation. Stripe integration is documented as approximately two hours of engineering work.

## Target customer segment

- Independent small-to-medium medical, dental, physiotherapy and psychology practices
- Practice size 1–10 practitioners
- Currently underserved in > TODO — insert specific geography or specialty the buyer intends to target as their first wedge

## Unit economics (illustrative)

Because no customers have paid yet, all figures below are model inputs, not observations.

| Metric | Value | Basis |
|---|---|---|
| Average revenue per practice, monthly | > TODO — buyer's own assumption | Depends on tier mix |
| Cost of goods sold per active practice | > TODO — includes AI provider cost, email sender cost, prorated hosting | Modelled in `10-roadmap/Product_Roadmap.md` |
| Payback period on customer acquisition cost | > TODO | Depends on CAC channel |
| Gross margin at 100 paying practices | > TODO — insert seller estimate range | Buyer to validate |
| Net revenue retention target | > TODO — recommended > 100 % via tier upgrades | Buyer's product decision |

## Revenue paths a new owner can activate

1. **Direct subscription revenue.** Enable Stripe checkout; run practice-side onboarding.
2. **Association or group licence.** White-label the platform for a regional practice association (multi-year contract, larger deal size).
3. **AI Assistant premium add-on.** Position the LLM-backed daily briefing as a Pro-tier upgrade or a separate premium module.
4. **Vertical variant sales.** Re-brand for adjacent verticals (veterinarians, chiropractors, wellness studios) with approximately one day of work each.
5. **Implementation services.** Bill setup, custom integrations or bespoke reporting on top of SaaS.

## Ongoing cost structure

At zero active customers, monthly operating cost is under USD 50 for Render Starter, domain renewal amortised, Cloudflare free tier, Brevo free tier. As customer count grows:

- **Hosting scales linearly** with tenant density up to the SQLite ceiling (~200 practices), then step-changes to Postgres and Redis
- **Email volume** transitions Brevo free tier to a paid tier around 300 emails / day
- **AI Assistant** cost scales per-tenant, per-briefing (variable, driven by LLM provider pricing)

Full cost model at 10 / 100 / 1000 practices is available in > TODO — link to `cost-of-operation-model.xlsx` once the model is built.

## Assumptions the buyer must validate

- Willingness of independent practices in the target market to adopt a new SaaS
- Ability to translate the multilingual advantage into real market wedge outcomes
- LLM provider price stability over the buyer's planning horizon
- Regulatory posture (GDPR alignment, EU AI Act, jurisdiction-specific licensing) for the buyer's target country

---

**NDA classification:** Share after NDA
**Last updated:** 2026-07-07
**Document owner:** The seller
**Related documents:** [Investment Highlights](./Investment_Highlights.md), [Market Opportunity](./Market_Opportunity.md), [Features](../04-technical-documentation/Features.md)
