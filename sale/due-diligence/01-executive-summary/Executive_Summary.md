# PraxisOnline24 — Executive Summary

## Purpose

Two-page overview of the PraxisOnline24 asset offered on Flippa. Designed to be read in under three minutes by a prospective buyer or their advisor to answer: *What is this, what is included, and why is it for sale?*

## Executive summary

**PraxisOnline24** is a **turnkey B2B SaaS for medical, dental, physiotherapy and psychology practices**, ready for a new owner to launch commercially. The technical build is complete and production-ready; the go-to-market motion is the buyer's opportunity.

- **Marketplace:** Flippa
- **Asking price:** **USD 39,000**
- **Type of sale:** Asset sale — source code, domain, brand, deployment; no company entity
- **Status:** Pre-launch, pre-revenue (explicit; no customers, no MRR, no ARR)
- **Live URL:** `https://praxisonline24.com`

## What the product does

A multi-tenant practice-management platform covering the daily operational needs of small independent practices:

- Appointment scheduling with day / week / month views, per-practitioner availability, waitlist auto-offer and patient self-cancellation via token
- Lightweight, privacy-conscious patient records
- PDF invoice generation, payment tracking, automated reminders
- Recipe / prescription print logs (audit trail, GDPR-conscious)
- Review request workflow with opt-in public publishing
- LLM-backed AI Practice Manager (Claude / OpenAI adapter — buyer chooses)
- Multilingual demo-request → invite → activation → 30-day trial flow
- Owner-level dashboard with cohort metrics, MRR calculation, package distribution

## Included in the sale

- 100 % of the source code (Node.js / Express monolith, ~17 modular route files)
- Domain `praxisonline24.com` (registered, Cloudflare-fronted, transferable)
- Render Frankfurt deployment configuration and running service
- Verified Brevo transactional email (SPF, DKIM 2 selectors, DMARC on the domain)
- Full brand kit (logo, favicon, wordmark, colour palette in SVG + PNG)
- 12 fully translated user interfaces + email templates (DE, EN, FR, ES, PT, AR, RU, ZH, HI, TH, TR, ID)
- Complete buyer documentation (this folder and related repository sections)
- 30 days of asynchronous implementation support post-transfer

## Not included

- No paying customers, no MRR, no ARR (pre-revenue asset sale)
- No company entity
- No registered trademark on "PraxisOnline24" — buyer may register in target market
- No US HIPAA certification (privacy-conscious schema; not audited)
- No formal security audit (documented as buyer's recommended Day-30 action)

## Why the owner is selling

> TODO — insert the owner's one-paragraph reason. Suggested framing: solo founder built the technical asset in six months; the next phase requires full-time market-facing sales work that does not match the current owner's positioning; the asset should not sit idle.

## Buyer opportunity, in one line

Skip the six-to-twelve month build phase, inherit a complete multilingual SaaS asset with verified deliverability and a functioning deployment, focus resources on go-to-market rather than engineering.

## Transaction terms

- **Payment:** Flippa Escrow
- **Transfer window:** 7 days from cleared funds
- **Support:** 30 days of asynchronous handover support (~10 hours of seller time)
- **Ongoing costs:** transferred to buyer at handover (baseline ~USD 50/month for hosting)

## Key risks (honestly disclosed)

- Pre-revenue: valuation is opportunity-based, not multiple-based
- SQLite storage engine has a soft ceiling around 200 practices (Postgres migration path documented, not executed)
- No unit test suite (E2E flows manually verified)
- In-memory session store (Redis migration is a 1-hour swap when needed)
- No CSRF, no CSP, no 2FA (documented defence-in-depth gaps)

Full risk disclosure lives in the Flippa listing and this due-diligence folder.

---

**NDA classification:** Public
**Last updated:** 2026-07-07
**Document owner:** The seller
**Related documents:** [Business Model](../02-investment-report/Business_Model.md), [Buyer FAQ](../11-buyer-faq/Buyer_FAQ.md), [Asset Transfer Checklist](../09-legal-and-transfer/Asset_Transfer_Checklist.md)
