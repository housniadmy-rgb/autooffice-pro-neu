# PraxisOnline24 — Due Diligence Changelog

## Purpose

Audit trail of every material change to the PraxisOnline24 due-diligence package. Provides transparency to buyers about what has been updated, when, and why. Serves as a version history for the DD document set independent of the git commit log.

## Executive summary

This changelog tracks **DD package revisions** — not code releases and not internal edits. An entry is added whenever a document is created, materially revised, deprecated, or when a factual value replaces a previously-open `> TODO` placeholder. Minor typographic edits are not tracked here (git history is authoritative for those).

## How to read this changelog

Each revision follows a simple structure:

- **Version:** semantic-versioning-inspired (Major.Minor). Major = folder-level addition or structural change; Minor = document-level addition or content revision.
- **Date:** ISO date (YYYY-MM-DD).
- **Author:** the person or role responsible for the change.
- **Changes:** bulleted list of what was added, revised, or removed.

The most recent revision is at the top.

## Changelog format template

```
### v[Major.Minor] — [YYYY-MM-DD]

**Author:** [role or name]

**Changes:**
- [added / revised / removed] : [file path] — [short description]
- ...

**Reason for revision:** [why this change was made]
```

## Revisions

### v1.2 — 2026-07-07

**Author:** The seller

**Changes:**
- Added: `sale/due-diligence/12-risk-disclosures/Risk_Disclosures.md` — comprehensive risk register across commercial, technical, security, legal, operational, market and reputational categories
- Added: `sale/due-diligence/13-changelog/Due_Diligence_Changelog.md` — this document

**Reason for revision:** Complete the DD package with a dedicated risk-disclosure register and a formal changelog for future revisions.

### v1.1 — 2026-07-07

**Author:** The seller

**Changes:**
- Added: `sale/due-diligence/01-executive-summary/Executive_Summary.md`
- Added: `sale/due-diligence/02-investment-report/Investment_Highlights.md`
- Added: `sale/due-diligence/02-investment-report/Business_Model.md`
- Added: `sale/due-diligence/02-investment-report/Market_Opportunity.md`
- Added: `sale/due-diligence/03-pitch-deck/Pitch_Deck_Outline.md`
- Added: `sale/due-diligence/04-technical-documentation/Technology_Stack.md`
- Added: `sale/due-diligence/04-technical-documentation/Features.md`
- Added: `sale/due-diligence/04-technical-documentation/API_Overview.md`
- Added: `sale/due-diligence/04-technical-documentation/Database_Overview.md`
- Added: `sale/due-diligence/04-technical-documentation/Security.md`
- Added: `sale/due-diligence/05-architecture/System_Architecture.md`
- Added: `sale/due-diligence/05-architecture/Infrastructure.md`
- Added: `sale/due-diligence/06-deployment/Deployment_Guide.md`
- Added: `sale/due-diligence/06-deployment/Environment_Requirements.md`
- Added: `sale/due-diligence/07-domain-and-brand-assets/Domain_and_Brand.md`
- Added: `sale/due-diligence/08-screenshots-and-media/Media_Checklist.md`
- Added: `sale/due-diligence/09-legal-and-transfer/Asset_Transfer_Checklist.md`
- Added: `sale/due-diligence/09-legal-and-transfer/IP_and_Licensing.md`
- Added: `sale/due-diligence/10-roadmap/Product_Roadmap.md`
- Added: `sale/due-diligence/11-buyer-faq/Buyer_FAQ.md`

**Reason for revision:** Populate all 11 DD sections with individual documents. Prior revision established folder structure and per-folder README files only.

### v1.0 — 2026-07-07

**Author:** The seller

**Changes:**
- Added: `sale/due-diligence/README.md` — main DD index with NDA classification tiers and folder overview
- Added: 11 folder-level `README.md` files across `01-executive-summary/` through `11-buyer-faq/`

**Reason for revision:** Initial creation of the due-diligence package structure to accompany the Flippa listing.

## Pending revisions (planned)

Documents still to be added or expanded in future revisions:

- Executive Summary PDF — regenerated via `sale/_build_pdf.py`
- Investment Report DOCX — regenerated via `sale/_build_docx.py`
- Pitch Deck PPTX — regenerated via `sale/_build_pptx.py`
- Mermaid architecture diagrams (`.mmd` + `.png` at 300 DPI) for System Architecture and demo-onboarding data flow
- Executable Asset Purchase Agreement template (currently referenced, not shipped)
- Executable mutual NDA template (currently referenced, not shipped)
- Filled-in credentials transfer log format
- Trademark search report artifact (once buyer's target market is identified)
- Comparable-asset citations for Investment Highlights (Flippa closed-listing data, Acquire.com comparables)

> TODO — the seller commits to producing the above artifacts before the DD package is offered to the first serious buyer under NDA. The changelog will be updated with the corresponding v1.3+ entries.

## Revisions triggered by buyer feedback

If a prospective buyer flags a gap, ambiguity, or factual concern in the DD package, the seller commits to:

1. Acknowledging the feedback within 48 hours during business days
2. Revising the affected document(s) or explaining why a revision is not warranted
3. Recording the revision in this changelog with a reference to the anonymised feedback source ("prospective buyer #N")
4. Publishing the revised document in the next repository commit

Feedback that results in factual revisions is welcomed. Feedback that requires speculation or invented figures will not be actioned; those items will remain as `> TODO` placeholders.

## Semantic versioning notes

The DD package uses a simplified two-part semantic versioning scheme:

- **Major (X.0):** structural changes — folder additions, folder deletions, folder renamings, or reorganisation of the main README's contents table
- **Minor (X.Y):** document-level changes — additions, material content revisions, replacement of `> TODO` placeholders with verified values

Patch-level edits (typos, formatting, cross-reference link corrections) are not tracked here. Consult the git commit history for those.

## Distribution

This changelog is **public** — it is part of the transparent audit trail that supports the DD process. Buyers may reference specific revision numbers when asking about the current state of a document.

---

**NDA classification:** Public
**Last updated:** 2026-07-07
**Document owner:** The seller
**Related documents:** [Main DD Index](../README.md), [Risk Disclosures](../12-risk-disclosures/Risk_Disclosures.md), [Buyer FAQ](../11-buyer-faq/Buyer_FAQ.md)
