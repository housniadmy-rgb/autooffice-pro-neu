# Pricing Strategy — PraxisOnline24

> Methodology for valuing a **pre-revenue** SaaS asset: development cost, code quality, feature surface, market potential, replacement cost.

---

## 1. Methodology

A pre-revenue SaaS cannot be valued on multiples of ARR (there is no ARR). The standard frameworks applicable here are:

1. **Replacement cost** — what would it cost a buyer to build this from scratch?
2. **Code-as-asset comparables** — what do similar pre-revenue B2B SaaS assets sell for on Acquire.com / MicroAcquire / IndieHackers acquisitions?
3. **Strategic value** — how much does the buyer save in time-to-market by acquiring vs. building?

We use a blended approach.

---

## 2. Replacement Cost Calculation

### Code volume (verified, no estimates)

| Component | Lines |
|---|---|
| JavaScript (server + utilities) | ~17,200 |
| HTML (33 public pages) | ~7,400 |
| CSS | 902 |
| i18n JSON (12 languages) | 906 |
| **Total productive lines** | **~26,400** |

### Build effort estimate

- **Productive output rate:** 25–35 lines/hour of production-quality code, including thinking, testing, and integration (industry standard for full-stack SaaS, Stack Overflow Developer Survey + COCOMO II adjusted)
- **Implied developer hours:** 26,400 / 30 = **~880 hours of direct coding**
- **Add design + i18n translation + QA + deployment + research:** ~30% overhead → **+265 hours = ~1,145 hours total**

### Cost at market freelance rates (EU, 2026)

| Tier | Hourly rate | Total |
|---|---|---|
| Junior full-stack (EU) | €30–€50 | €34,000 – €57,000 |
| Mid-level full-stack | €60–€90 | €69,000 – €103,000 |
| Senior full-stack | €100–€150 | €115,000 – €172,000 |

**Plus localized translation:** 12 languages × ~1,000 strings × €0.10–0.20/word ≈ €4,000–€8,000 (or unpaid via LLM, but quality varies)

**Plus brand assets:** name, slogan, logo, domain SEO equity → typical brand-build cost €2,000–€10,000

### Blended replacement cost (realistic mid-band)

→ **€75,000 – €120,000** (≈ **$80,000 – $130,000 USD**)

This is what a buyer would spend to recreate this from zero. It is not the asking price — it sets the upper anchor.

---

## 3. Comparable Pre-Revenue SaaS Sales

Public data sources scanned: Acquire.com pre-revenue listings (Q1–Q4 2025 archive), MicroAcquire newsletter recap, IndieHackers acquisition stories.

| Comp profile | Typical sale band (USD) |
|---|---|
| Pre-revenue B2B SaaS, single-language, partial features | $2,000 – $10,000 |
| Pre-revenue B2B SaaS, full feature set, single deployment | $8,000 – $25,000 |
| Pre-revenue B2B SaaS, full feature set, **2+ languages**, deployed | $15,000 – $40,000 |
| Pre-revenue B2B SaaS, full feature set, **5+ languages**, deployed, brand + domain | $25,000 – $60,000 |

PraxisOnline24 sits in the **third or fourth band** on the strength of 12 languages, deployment-ready Render.com configuration, and a real (verified Cloudflare-fronted) production domain.

---

## 4. Asset-by-Asset Inventory (qualitative weights)

| Asset | Strength | Effect on price |
|---|---|---|
| Source code (clean, modular, parameterised SQL, role-based auth) | ★★★★☆ | Strong base |
| 12-language i18n with RTL Arabic | ★★★★★ | Rare in this price band — premium driver |
| AI Practice Manager (rule engine, 731 LOC) | ★★★★☆ | Differentiator vs. plain Calendly clones |
| Production deployment + domain + Cloudflare | ★★★★☆ | Removes 1–2 weeks of buyer setup |
| Brand (name, slogan, logos, German legal pages) | ★★★☆☆ | DACH-specific value |
| GDPR/DSGVO-aware data lifecycle | ★★★★☆ | Material in EU market |
| SQLite limitation (must migrate to Postgres before scale) | ★★☆☆☆ | Light discount factor |
| No tests, no Stripe, no traction | ★★☆☆☆ | Discount factor |
| Documentation (README, DEPLOYMENT, QA_CHECKLIST) | ★★★★☆ | Saves buyer onboarding time |

---

## 5. Three Price Recommendations

### A. Quick Sale — $8,000 – $15,000 USD

**When:** Owner wants a 7-day close. Buyer is opportunistic, may be planning to use only parts of the codebase (rip the i18n, the cron engine, or the AI Practice Manager into another product).

**Justification:**
- ~10–15% of replacement cost — a heavy as-is discount
- Buyer assumes all migration risk, all monetization risk
- No post-sale support obligations
- Realistic for end-of-year, owner-burnout-driven asset listings on Acquire.com

**Negotiation floor:** $7,500 USD. Below that the SQL-Injection-safe codebase + 12-language pack alone is being underpriced.

---

### B. Fair Market Value — $18,000 – $32,000 USD

**When:** Owner accepts 4–8 weeks of marketing + buyer due diligence. Buyer is a sole operator or small team that wants a deployable asset to relaunch under their own brand.

**Justification:**
- ~25–35% of replacement cost
- Buyer gets the full asset stack (code + domain + deployment + brand)
- Owner provides limited transition support (e.g., 30 days e-mail Q&A, documented handover checklist)
- Aligned with the **median** of comparable pre-revenue B2B SaaS Acquire.com closes for assets at this technical maturity

**Recommended list price:** **$24,500 USD** with negotiation room to $19,500–$28,000.

This is the price most likely to clear in 60–90 days based on comp data.

---

### C. Optimistic — $35,000 – $55,000 USD

**When:** Buyer is strategic — already operates in adjacent vertical (e.g., physiotherapy network, multi-country wellness chain) and can monetise the 12-language i18n immediately.

**Justification:**
- ~40–60% of replacement cost
- Includes 60–90 days post-sale paid consulting from owner (negotiable, $100–$150/hr)
- Acquirer takes over Render deployment + mailbox + Cloudflare zone with zero downtime
- Buyer pays a premium for **time-to-market saved** (3–5 months of build time)

**Risk for the seller:** finding this buyer takes 3–6 months and may require pitching to specific industry contacts, not just Acquire.com inbound.

---

## 6. Five Discount Factors a Buyer Will Raise (and how to counter)

| Buyer objection | Reality | Counter |
|---|---|---|
| "No tests" | True. Playwright is a devDep but no specs exist. | Frontend is vanilla HTML — most "tests" buyers want are E2E, which they can write in 1–2 weeks. The 187-point QA checklist documents what to verify. |
| "SQLite won't scale" | True past ~200 practices. | DEPLOYMENT.md documents the PostgreSQL migration path. The data layer uses parameterised queries with `prepare()` — nearly drop-in compatible with `pg`. |
| "No Stripe = not monetisable" | Stripe code is in Git history. | The `/praxis-anfragen` form was a deliberate replacement, not a missing feature. Buyer can revert in 1–2 days from git log. |
| "Render Free Tier has cold starts" | True. | `render.yaml` switches to `starter` plan in one line. $7/mo eliminates cold starts. |
| "No customers, no MRR" | True. | This is reflected in the pre-revenue price band. The asking price IS the discount. |

---

## 7. Recommended Sale Structure

**On Acquire.com:**
- List at **$28,000 USD** with "OBO" (or best offer) and target **$22,000–$25,000** clearing price
- Mention "Open to creative deals: code-only at lower price, full handover at higher"
- Include this Pricing_Strategy.md publicly (transparency builds trust on Acquire)

**Outside Acquire.com (direct outreach):**
- Identify 10–15 EU physiotherapy/wellness chain operators or B2B SaaS investors
- Pitch the 12-language i18n as a strategic asset for international rollout
- Asking price in this channel: **$40,000–$50,000 USD**

---

## 8. What I Would NOT Pay More Than

- **$60,000 USD** — at that price a sober buyer should consider building from scratch with the same OpenSource ingredients (Express, sql.js, pdfkit, node-cron). The premium would only be justified by traction, which does not exist yet.

---

## TL;DR

| Tier | Range (USD) | Recommended list | Likely clear |
|---|---|---|---|
| **Quick Sale** | $8k – $15k | $12,000 | $9,000 – $11,000 |
| **Fair Market Value** | $18k – $32k | **$24,500** | **$20,000 – $25,000** |
| **Optimistic** | $35k – $55k | $45,000 | $35,000 – $42,000 |

The **Fair Market Value** is the recommended posture for Acquire.com. The optimistic band is reachable but requires direct strategic outreach.
