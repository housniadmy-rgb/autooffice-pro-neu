# PraxisOnline24 — Pitch Deck Outline

## Purpose

Slide-by-slide outline for the investor-oriented pitch deck. Intended as a source document from which the actual `.pptx` deck is generated (see `sale/_build_pptx.py`). Speaker notes are included so the deck can be reviewed asynchronously by any prospective buyer.

## Executive summary

Fifteen-slide structure covering problem, market, solution, product, asset content, ask. Standard investor-deck ordering. No revenue or customer claims (pre-revenue). Total review time under five minutes.

## Slide-by-slide outline

### Slide 1 — Cover
- **Content:** PraxisOnline24 wordmark, tagline "Your practice. Online. Around the clock.", asking-price line "USD 39,000 — Flippa listing"
- **Speaker note:** Cover only; no talk track needed

### Slide 2 — The problem
- **Content:** Independent healthcare practices operate on fragmented spreadsheets, paper diaries, and off-the-shelf tools not built for practice workflow
- **Speaker note:** Frame the market gap, not the founder's story

### Slide 3 — Market context
- **Content:** Global TAM for practice-management SaaS; > TODO — insert numeric range from independent research (Statista, healthcare-tech association data)
- **Speaker note:** Explicit that TAM is buyer's own research responsibility

### Slide 4 — The competitive gap
- **Content:** English-first incumbents dominate North America and UK; DACH / MENA / LATAM / SEA are under-served by localised alternatives
- **Speaker note:** Position PraxisOnline24's twelve-language coverage as the answer

### Slide 5 — Solution: PraxisOnline24
- **Content:** Product screenshot (dashboard) with one-line description "Multi-tenant practice management, twelve languages, ready-to-launch"
- **Speaker note:** Show, not tell — screenshot does the work

### Slide 6 — Product tour: appointment calendar
- **Content:** Screenshot 06 (`sale/assets/flippa/screenshots/06_calendar.png`) with feature bullets
- **Speaker note:** Highlight day / week / month views, waitlist auto-offer

### Slide 7 — Product tour: patient management + invoices
- **Content:** Two-panel with screenshots 07 and 10
- **Speaker note:** Privacy-conscious schema, PDF invoice generation

### Slide 8 — Product tour: AI Practice Manager
- **Content:** Screenshot 09 (`sale/assets/flippa/screenshots/09_ai_assistant.png`)
- **Speaker note:** LLM adapter is swappable — Claude or OpenAI; positioned as differentiator against legacy competitors

### Slide 9 — Twelve languages
- **Content:** Screenshot 13 (`sale/assets/flippa/screenshots/13_multilanguage.png`) with 12 flags visible
- **Speaker note:** This is the single most underestimated cost that PraxisOnline24 has already absorbed

### Slide 10 — Technical foundation
- **Content:** Stack summary (Node.js 18+, Express 4.18, SQLite, bcrypt cost 12, Brevo, Cloudflare, Render Frankfurt)
- **Speaker note:** Deliberately simple monolith at target scale; Postgres migration path documented

### Slide 11 — What the buyer inherits
- **Content:** Table of included assets (source code, domain, deployment, brand, docs, 30-day support)
- **Speaker note:** Mirror the "Buyer package" section in the Flippa listing

### Slide 12 — Risks (transparent disclosure)
- **Content:** Pre-revenue • no test suite • SQLite ceiling • no CSRF/CSP/2FA • no HIPAA
- **Speaker note:** Explicit that these are not surprises to be discovered; they are documented and time-boxed

### Slide 13 — Buyer opportunity paths
- **Content:** Five monetisation angles from `02-investment-report/Business_Model.md`
- **Speaker note:** Buyer chooses; seller does not prescribe

### Slide 14 — Team and support
- **Content:** Solo-founder build; 30-day post-transfer support commitment (~10 hours); handover checklist reference
- **Speaker note:** No ongoing team commitment beyond day 30 unless separately contracted

### Slide 15 — The ask
- **Content:** USD 39,000 asking price • Flippa Escrow • 7-day transfer window • serious offers only
- **Speaker note:** Deliberately soft close; no urgency, no pressure

## Design guidelines

- Consistent typography with the domain brand (see `07-domain-and-brand-assets/Domain_and_Brand.md`)
- Colour palette matching the live product's CSS variables (blue accent, muted neutrals)
- One idea per slide — no dense text pages
- Every product screenshot is a real capture from `sale/assets/flippa/screenshots/`
- Deck should export cleanly to PDF at 300 DPI

## Where the assembled deck lives

Generated file: > TODO — target path `sale/due-diligence/03-pitch-deck/pitch-deck.pptx` (produced by regenerating via `sale/_build_pptx.py` after this outline is stabilised)

## Distribution constraint

The assembled deck contains the same commercial framing as the Investment Report plus product screenshot assemblies not on the public listing. Shared upon signed mutual NDA.

---

**NDA classification:** Share after NDA
**Last updated:** 2026-07-07
**Document owner:** The seller
**Related documents:** [Executive Summary](../01-executive-summary/Executive_Summary.md), [Investment Highlights](../02-investment-report/Investment_Highlights.md), [Media Checklist](../08-screenshots-and-media/Media_Checklist.md)
