# Acquire.com Submission Checklist — PraxisOnline24

> **Status: DRAFT — not yet published.** Use this document to fill out the Acquire.com listing form. Each field is pre-filled from the existing `sale/` materials; missing data is explicitly flagged. Do not invent information; either fill the gap with real data or leave the optional field empty.

---

## 0. Consistency audit across sale/ documents

| Fact | Acquire_Listing.md | Pricing_Strategy.md | Buyer_FAQ.md | Technical_DD.md | Investment_Report.docx | ✓ |
|---|---|---|---|---|---|---|
| Tech stack: Node.js ≥ 18, Express 4.18, sql.js | ✓ | ✓ | ✓ | ✓ | ✓ | ✅ Consistent |
| 12 languages incl. RTL Arabic | ✓ | — | ✓ | ✓ | ✓ | ✅ Consistent |
| Pre-revenue: 0 customers, 0 MRR, 0 ARR | ✓ | ✓ | ✓ | — | ✓ | ✅ Consistent |
| Live URL `praxisonline24.com` via Render | ✓ | ✓ | ✓ | ✓ | ✓ | ✅ Consistent |
| 17 routes, 18 DB tables, 8 cron jobs | ✓ | — | ✓ | ✓ | ✓ | ✅ Consistent |
| ~17,200 JS LoC | ✓ | ✓ | — | ✓ | ✓ | ✅ Consistent |
| 16 dev phases shipped | ✓ | — | — | — | ✓ | ✅ Consistent |
| Pricing: Quick $8–15k / FMV $18–32k / Optimistic $35–55k | ✓ | ✓ | ✓ | — | ✓ | ✅ Consistent |
| Recommended list **$24,500 USD** | ✓ (range) | ✓ explicit | ✓ | — | ✓ | ✅ Consistent |
| Replacement cost €75–120k / ~$80–130k | ✓ | ✓ | — | ✓ | ✓ | ✅ Consistent |
| AI Practice Manager = rule engine, not LLM | ✓ | — | ✓ | ✓ | ✓ | ✅ Consistent |
| Privacy-by-design: no health data stored | ✓ | — | ✓ | ✓ | ✓ | ✅ Consistent |

**Verdict:** Zero contradictions found.

---

## 1. Listing meta — paste-ready

### Listing title (Acquire.com field: "Startup name / Listing title", max ~70 chars)
```
PraxisOnline24 — 12-Language Booking & Practice-Management SaaS
```

### Tagline / one-liner (max ~140 chars)
```
Production-ready, multilingual online appointment + practice-management SaaS for medical practices and small service businesses. Pre-revenue.
```

### Elevator pitch (max ~280 chars — for the search-result card)
```
A fully built, deployed Node.js/Express SaaS that lets practices accept online appointments 24/7, manage practitioners, send PDF invoices, run waitlists, collect reviews, and operate in 12 languages — including a rule-based AI Practice Manager.
```

### Asking price (USD)
```
24,500
```
**Negotiation room:** $19,500 – $28,000. Floor for quick sale: $12,000.

### Listing type
- [x] **Asset Sale** ← correct for this listing
- [ ] Equity Sale
- [ ] Acqui-hire

### Industry / category (pick on Acquire.com)
- Primary: **SaaS** → **Vertical SaaS** → **Healthcare / Medical**
- Secondary tags (if multiple allowed): `Booking`, `Appointment scheduling`, `B2B SaaS`, `Multi-language`, `Practice management`

### Year founded / first commit
```
2026 (first commit: 2026-05-24, evidence: git log --reverse)
```

### Country / location of seller
```
Germany
```
> **Action:** fill the exact city/state if Acquire.com requires it. Not in sale/ docs to avoid PII leak — fill at submission time.

### Time required per week to operate
```
≤ 2 hours/week (automated cron + Render auto-deploy; check inbox + monitor health)
```

### Team size
```
1 (solo founder)
```

### Reason for sale (Acquire.com field: "Why are you selling?", paste-ready)
```
Owner built PraxisOnline24 as a portfolio + learning project and brought it to a production-deployed, multilingual, multi-tenant state. Stripe monetization was paused in favor of a contact-form flow, and the operator has shifted focus to other projects. The product is at a clean hand-off state — code, brand, domain, deployment, and 12-language i18n — and is being sold as a turn-key technical asset to a buyer with go-to-market capacity.
```

---

## 2. Financials — Acquire.com required fields

All values reflect **the actual state of the business**. No customers, no revenue, no fundraising. Do not estimate or project.

| Field | Value |
|---|---|
| **Monthly Recurring Revenue (MRR)** | **0 EUR / 0 USD** |
| **Annual Recurring Revenue (ARR)** | **0 EUR / 0 USD** |
| **TTM Gross Revenue** | **0 EUR / 0 USD** |
| **TTM Net Profit** | **0 EUR / 0 USD** |
| **Customer count** | **0** |
| **Paying customer count** | **0** |
| **Active user count (MAU)** | **0** |
| **Trial signup count** | **0** |
| **Growth rate (MoM)** | **N/A — pre-revenue** |
| **Profit margin** | **N/A — pre-revenue** |
| **Burn rate** | **~$7–$15/month** (Render Starter or Free + domain renewal). No payroll. |
| **Cash on hand / runway** | **N/A — owner self-funded; no separate entity / cash account** |
| **Has the business ever generated revenue?** | **No** |
| **Outstanding debt / liabilities** | **None** |

> **Acquire.com label hint:** When the form asks "is this pre-revenue?", check **Yes**. The listing will then automatically use the pre-revenue UI band.

---

## 3. Full description (long-form — Acquire.com "Business description")

Use the existing `Acquire_Listing.md` body as-is. Below is the suggested mapping into Acquire's section structure:

| Acquire.com section | Source in sale/ |
|---|---|
| Headline | `Acquire_Listing.md` → "Headline" block |
| Elevator Pitch | `Acquire_Listing.md` → "Elevator Pitch" |
| Product Description | `Acquire_Listing.md` → "Product Description" + "Core feature surface" |
| Market | `Acquire_Listing.md` → "Market" |
| Ideal Customer Profile | `Acquire_Listing.md` → "Ideal Customer Profile" |
| Tech Stack | `Acquire_Listing.md` → "Tech Stack" table |
| Competitive Advantages | `Acquire_Listing.md` → "Competitive Advantages" |
| Development Status | `Acquire_Listing.md` → "Development Status" + known limitations |
| Reason for Selling | `Acquire_Listing.md` → "Reason for Selling" |
| What the Buyer Gets | `Acquire_Listing.md` → "What the Buyer Gets" |
| What is NOT included | `Acquire_Listing.md` → "What you DO NOT get (sold honestly)" |

**Action:** copy the entire content of `Acquire_Listing.md` into the long-form description field. It is already formatted for Acquire and runs ~10 KB which is comfortably under the typical 20k character ceiling.

---

## 4. Tech stack / tools — Acquire.com checkbox list

For the "Tools used" multi-select, tick these on the platform:

- [x] Node.js
- [x] Express
- [x] SQLite
- [x] GitHub
- [x] Render
- [x] Cloudflare
- [x] Brevo (Sendinblue) — for transactional e-mail
- [x] pdfkit (PDF library, list under "other" if not available)
- [x] node-cron (list under "other" if not available)
- [ ] AWS / GCP / Azure (none used)
- [ ] Vercel (deprecated, not part of this sale — do **not** tick)
- [ ] PostgreSQL (not yet — only documented migration path)
- [ ] React / Vue / Angular (none — vanilla frontend)

---

## 5. Traffic & marketing — Acquire.com fields

| Field | Value |
|---|---|
| **Monthly unique visitors** | **❓ Not measured.** Render + Cloudflare logs not aggregated. Cloudflare Free dashboard would show last 30 days — **action: pull stat at submission time** (do NOT invent). |
| **Marketing channels active** | None (no paid campaigns, no content marketing, no social media presence) |
| **SEO rank / keywords** | Not measured. SEO baseline present (canonical, OG, JSON-LD, sitemap). |
| **E-mail list size** | 0 |
| **Social media followers** | 0 across all platforms |
| **Customer acquisition cost (CAC)** | N/A — pre-revenue |
| **LTV** | N/A — pre-revenue |

---

## 6. Operating costs — Acquire.com field "Monthly expenses"

| Item | Monthly cost | Note |
|---|---|---|
| Render hosting (Free Tier) | $0 | Cold-start tradeoff |
| Render hosting (Starter, if upgraded) | $7 | Recommended baseline post-acquisition |
| Domain registration (amortised) | ~$1.25 | $15/year ÷ 12 |
| Cloudflare | $0 | Free tier sufficient |
| Brevo transactional e-mail | $0 | Free tier ≤ 300/day |
| **Total monthly opex** | **$1.25 – $8.25** | Depending on Render plan |

---

## 7. Assets included in sale (Acquire.com field "Assets")

Tick on platform:
- [x] Source code (full repo transfer)
- [x] Domain name
- [x] Customer database — **N/A (no customers; only test data, which will be wiped)**
- [x] Trademarks — **N/A (none registered)**
- [x] Social media accounts — **N/A (none)**
- [x] Brand assets (logo, colors, slogan)
- [x] Documentation
- [x] Deployment infrastructure (render.yaml + DNS zone)
- [x] E-mail templates (12 languages)
- [x] M&A docs (sale/ folder)

Full list and process: see `Transfer_Checklist.md`.

---

## 8. Documents to upload (Acquire.com "Documents" section)

| Document | File in sale/ | Suggested label on Acquire | Privacy |
|---|---|---|---|
| Investment & Due Diligence Report | `PraxisOnline24_Investment_Report.docx` | "Full DD report (22 chapters)" | NDA-gated |
| Investor Pitch Deck | `Investor_Pitch_Deck.pptx` | "12-slide pitch deck" | Public-OK |
| Executive Summary | `Executive_Summary.pdf` | "1-page exec summary" | Public-OK |
| Pricing reasoning | `Pricing_Strategy.md` | "Pricing & valuation methodology" | NDA-gated |
| Technical Due Diligence | `Technical_Due_Diligence.md` | "Technical DD pack" | NDA-gated |
| Buyer FAQ | `Buyer_FAQ.md` | "Frequently asked questions" | Public-OK |
| Demo Guide | `Demo_Guide.md` | "27-min hands-on demo guide" | Public-OK |
| Transfer Checklist | `Transfer_Checklist.md` | "Asset transfer checklist" | NDA-gated |
| Acquire.com listing copy | `Acquire_Listing.md` | (used as listing body — no upload) | — |

> **Recommendation:** Make Executive Summary + Pitch Deck + Buyer FAQ + Demo Guide visible to **all logged-in Acquire buyers**. Keep DD report + Pricing Strategy + Tech DD + Transfer Checklist behind the **NDA gate**.

---

## 9. Listing media (images + video)

| Asset | Status | Path / Action |
|---|---|---|
| **Logo (square, 800×800px)** | ❌ Missing | The current "logo" is text-only ("PraxisOnline24 · Your practice. Online. Around the clock.") rendered in CSS. **Action: create a simple wordmark PNG (Figma / Canva, 30 min) or use a high-DPI screenshot of the current text logo from the live homepage.** |
| **Cover image (1200×630)** | ⚠️ Use existing | Reuse `sale/assets/screenshots/en/01-homepage.png` (1920×1080) cropped to 1200×630 at the hero area. |
| **Product screenshots (3–8 recommended)** | ✅ **Ready (9 captures)** | `sale/assets/screenshots/en/` — English UI, 1920×1080, fictitious demo data. Files: `01-homepage`, `02-login`, `03-pricing`, `04-request-demo`, `05-dashboard`, `06-calendar`, `07-patients`, `08-invoices`, `09-settings`. |
| **Demo video (1–3 min, optional)** | ✅ **Ready** | `sale/assets/demo/praxisonline24-demo-en.mp4` — silent, 1920×1080, 66 s, English UI + English text overlays, no voice-over. |

> **Without logo, do not publish.** Acquire's algorithm down-ranks media-less listings. Screenshots and demo video are now in place; only the wordmark logo remains.

---

## 10. Buyer-facing demo access (Acquire.com "Demo / Trial")

Options to offer prospective buyers:

| Option | Effort | Recommended? |
|---|---|---|
| **Public live site** (read-only — they cannot see admin) | 0 | ✅ Always |
| **Demo guide (27-min self-serve)** | 0 | ✅ Always — point to `Demo_Guide.md` |
| **Dedicated demo account credentials** (NDA-gated) | 10 min to provision | ✅ For serious buyers |
| **Read-only repo invite** (NDA-gated) | 5 min | ✅ For serious buyers |
| **60-min walkthrough call** (post-LOI) | 1 hour | ⚠️ Optional, time-of-seller |

**Action before publishing:**
- [ ] Create a sandbox demo account on the live deployment with the credentials documented somewhere safe (do **not** paste into the public listing)
- [ ] Have a 1Password / Signal-ready way to share those credentials with NDA-signed buyers

---

## 11. NDA / LOI

Acquire.com provides a standard NDA flow. Default settings recommended:
- [x] **Require NDA before viewing financials** — irrelevant here (financials are public-zero), but tick anyway for repo / DD-pack access
- [x] **Require NDA before downloading documents** — yes for DD pack + Pricing
- [x] **Auto-approve verified buyers** — Acquire's "verified" tier is OK

---

## 12. Likely buyer questions — pre-mapped to source

Acquire.com lets buyers ask questions via the listing. Seller should review and pre-write answers. All are already covered in `Buyer_FAQ.md`. Top 10 most likely:

1. "Why are you selling?" → `Buyer_FAQ.md` Q1
2. "Is there any revenue?" → `Buyer_FAQ.md` Q2 (answer: No)
3. "Why no Stripe?" → `Buyer_FAQ.md` Q3
4. "Are you open to creative deals?" → `Buyer_FAQ.md` Q5
5. "Will SQLite scale?" → `Buyer_FAQ.md` Q8
6. "What's the security posture?" → `Buyer_FAQ.md` Q10–11
7. "Where does it run, what does it cost?" → `Buyer_FAQ.md` Q15–17
8. "Can I run this for non-medical verticals?" → `Buyer_FAQ.md` Q22
9. "Is the AI a real LLM?" → `Buyer_FAQ.md` Q23 (answer: No, rule engine; pluggable)
10. "Is it GDPR-compliant?" → `Buyer_FAQ.md` Q25 (answer: privacy-by-design posture, not certified)

**Action:** keep `Buyer_FAQ.md` open while monitoring inbound questions.

---

## 13. Pre-publication final checklist

Before clicking "Publish" on Acquire.com:

| Item | Status | Owner |
|---|---|---|
| [ ] Long-form description pasted from `Acquire_Listing.md` | Pending | Seller |
| [ ] Asking price set to **$24,500 USD** | Pending | Seller |
| [ ] Pre-revenue indicator ticked (all financial fields = 0) | Pending | Seller |
| [ ] 5–8 screenshots uploaded (see §9) | ✅ Ready in `sale/assets/screenshots/en/` — upload | Seller |
| [ ] Logo uploaded (see §9) | **MISSING** | Seller (creates / extracts) |
| [ ] Demo video uploaded (see §9) | ✅ Ready at `sale/assets/demo/praxisonline24-demo-en.mp4` — upload | Seller |
| [ ] Documents uploaded with correct NDA gates (see §8) | Pending | Seller |
| [ ] Demo account credentials prepared (see §10) | **MISSING** | Seller |
| [ ] Tax / business location entered honestly | Pending | Seller |
| [ ] NDA + LOI gates configured (see §11) | Pending | Seller |
| [ ] Listing saved as **draft** and reviewed once more | Pending | Seller |
| [ ] **Explicit consent from owner to publish** | **REQUIRED** | Owner |

---

## 14. Recommended publication strategy

1. **Day 0** — Save listing as **draft** on Acquire.com. Do not publish.
2. **Day 0** — Upload the 9 prepared screenshots from `sale/assets/screenshots/en/` and the demo video `sale/assets/demo/praxisonline24-demo-en.mp4`.
3. **Day 0** — Create wordmark logo PNG (30 min, Figma / Canva).
4. **Day 0** — Provision a sandbox demo account (10 min, register on live site with `demo@praxisonline24.com` or similar).
5. **Day 1** — Internal review of the draft. Spot-check for:
   - Wrong jurisdiction in tax fields
   - Accidental personal phone / e-mail leak
   - Stale screenshots
6. **Day 1** — Publish to **"Acquire Verified Buyers" only** (Acquire's mid-visibility tier) for the first 14 days. Gauges inbound quality without exposing the listing to the entire internet.
7. **Day 14** — If inbound is low (< 5 verified buyers viewing), bump to **"Public"** visibility.
8. **Day 30** — If no LOI within 30 days at $24,500, drop to **$19,500** and re-publish.

---

## 15. What is missing / needs human action before publishing

| Missing item | Why it matters | Effort to fix |
|---|---|---|
| **Logo PNG (square + horizontal)** | Cover card requires it | 30 min |
| **Demo account credentials** | NDA-gated buyers need hands-on access | 10 min |
| **Cloudflare last-30-day traffic stats** | "Monthly visitors" field | 5 min (pull from Cloudflare dashboard) |
| **Tax jurisdiction / VAT ID** | Acquire escrow + tax form requires it | 5 min (seller knows this) |
| **Acquire.com seller-side account setup + verification** | Required to publish | 1–2 hours (KYC + Stripe Connect for payout) |

✅ **Done:** Product screenshots (9 PNGs, English UI) in `sale/assets/screenshots/en/`; demo video (66 s, silent, English) at `sale/assets/demo/praxisonline24-demo-en.mp4`.

Do NOT publish until at minimum the **logo and demo credentials** are in place.

---

## 16. Recommendation

| Question | Answer |
|---|---|
| Listing draft fully prepared? | ✅ **Yes** — all text content ready, all source documents consistent |
| Recommended asking price | **$24,500 USD** (negotiation room $19,500 – $28,000) |
| Ready to publish today? | ❌ **No — 2 blockers** (logo, demo account). Screenshots + demo video are already prepared. |
| Estimated time-to-publish-ready | **~2 hours of focused work** |
| Recommended visibility on launch | **"Verified Buyers Only"** for first 14 days, then bump to Public |
| Recommended close target | **60–90 days** at FMV; can shorten to **30 days** if owner is willing to take Quick Sale floor |
