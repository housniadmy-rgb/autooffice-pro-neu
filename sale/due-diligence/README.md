# PraxisOnline24 — Due Diligence Index

> Buyer-facing entry point to the complete due-diligence package for the PraxisOnline24 SaaS asset sale on Flippa. This folder is organised for a structured DD process — read top to bottom or jump directly to the section relevant to your evaluation stage.

**Asking price:** USD 39,000
**Marketplace:** Flippa
**Status:** Pre-launch, pre-revenue (asset sale, not a going concern)

---

## How to use this folder

Materials are grouped by evaluation stage. Each subfolder has its own README with:
- **Purpose** — what belongs there
- **Files that will be added** — inventory of expected contents (uploaded in stages during DD)
- **NDA classification** — who can access what and when

Three access tiers are used throughout:

| Classification | Who can view | Applies to |
|---|---|---|
| **Public** | Anyone browsing the Flippa listing | Executive summary, screenshots, buyer FAQ, brand kit previews, DD changelog |
| **Share after NDA** | Buyers who have signed a mutual NDA | Full technical documentation, architecture, deployment runbook, roadmap |
| **Confidential** | Buyers under LOI or in escrow | Legal contracts, transfer credentials, financial deep-dive |

---

## Contents

| # | Section | Classification | Purpose |
|---|---|---|---|
| 01 | [Executive Summary](./01-executive-summary/) | Public | Two-page overview of the asset, its value proposition, and what's included |
| 02 | [Investment Report](./02-investment-report/) | Share after NDA | Build-cost analysis, cost-of-operation model, valuation framework |
| 03 | [Pitch Deck](./03-pitch-deck/) | Share after NDA | Investor-oriented slide deck with market context and asset positioning |
| 04 | [Technical Documentation](./04-technical-documentation/) | Share after NDA | Stack details, module map, coding standards, dependency inventory |
| 05 | [Architecture](./05-architecture/) | Share after NDA | Diagrams, database schema, API surface, security model |
| 06 | [Deployment](./06-deployment/) | Share after NDA | Render + Cloudflare setup, environment variables, runbook, monitoring |
| 07 | [Domain & Brand Assets](./07-domain-and-brand-assets/) | Public → Share after NDA | Domain registration proof, logo files, brand guidelines, transfer specifics |
| 08 | [Screenshots & Media](./08-screenshots-and-media/) | Public | Retina screenshots, demo video, captured product tours |
| 09 | [Legal & Transfer](./09-legal-and-transfer/) | Confidential | Asset purchase agreement template, transfer checklist, IP declarations |
| 10 | [Roadmap](./10-roadmap/) | Share after NDA | 12-month plausible growth path, cost projections, hire plan |
| 11 | [Buyer FAQ](./11-buyer-faq/) | Public | 32 answered questions in five categories |
| 12 | [Risk Disclosures](./12-risk-disclosures/) | Share after NDA | Structured risk register across commercial, technical, security, legal, operational, market and reputational categories |
| 13 | [Due Diligence Changelog](./13-changelog/) | Public | Revision history of the DD package with version log and pending-revision list |

---

## Standard DD workflow

Typical buyer path through the materials:

1. **Public discovery** — read `01-executive-summary/`, browse `08-screenshots-and-media/`, skim `11-buyer-faq/`, review `13-changelog/` for revision history
2. **Interest confirmation** — request mutual NDA from seller (template in `09-legal-and-transfer/` once counter-signed)
3. **Risk review** — study `12-risk-disclosures/` under NDA to size known risks before deeper technical or commercial evaluation
4. **Technical review** — study `04-technical-documentation/`, `05-architecture/`, `06-deployment/`; optionally clone the private repo via time-limited read access
5. **Commercial review** — walk through `02-investment-report/`, `03-pitch-deck/`, `10-roadmap/`
6. **Domain & brand check** — verify `07-domain-and-brand-assets/` — registrar records, trademark search results, transfer feasibility
7. **Letter of Intent (LOI)** — non-binding offer, unlocks `09-legal-and-transfer/` full contents
8. **Escrow + transfer** — asset purchase agreement executed, Flippa Escrow initiated, transfer completes within 7 days per checklist in section 09

---

## What is included in the asset sale

- 100 % of the source code (Node.js / Express, ~40 KB of business logic, well-commented)
- Domain **praxisonline24.com** (Cloudflare-fronted, transferable)
- Render Frankfurt deployment (transferable service)
- Brevo transactional email with verified SPF, DKIM (2 selectors), DMARC
- Complete brand kit — logo variants, favicon, wordmark, colour palette
- 12 fully translated user interfaces + email templates (DE, EN, FR, ES, PT, AR, TR, ID, RU, ZH, HI, TH)
- All buyer documentation in this folder
- 30 days of asynchronous implementation support (~10 hours of seller's time)

---

## What is NOT included

- No paying customers, no MRR, no ARR (pre-revenue, honestly stated)
- No company entity (this is an asset sale, not a share deal)
- No trademark registration (buyer may register in target market)
- No US HIPAA compliance certification (GDPR-conscious schema only)
- No formal security audit (recommended within 30 days of transfer)

---

## Contact

For DD questions, use the Flippa messaging system on the active listing. Response target: 24 hours during weekdays.

---

## Version

Document set version: **DD-Rev.1.2 (2026-07-08)**
Full revision log: [Due Diligence Changelog](./13-changelog/Due_Diligence_Changelog.md)
Repository commit: check `git log --oneline -1` for the latest revision of these materials.
