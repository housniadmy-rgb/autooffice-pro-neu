# PraxisOnline24 — Asset Transfer Checklist

## Purpose

Sequential, verifiable checklist for transferring all sale-included assets from seller to buyer. Designed to be worked through in escrow phase with both parties ticking each item.

## Executive summary

Transfer completes in **seven calendar days** from cleared escrow funds. The checklist covers: GitHub repository, domain, Cloudflare zone, Render service, Brevo sender identity, brand asset copies, and 30-day support channel setup. Nothing is transferred until escrow funds are secured.

## Pre-transfer prerequisites

- [ ] Signed asset purchase agreement between seller and buyer
- [ ] Flippa escrow funded with buyer's payment
- [ ] Buyer confirms possession of the following accounts:
  - [ ] GitHub account
  - [ ] Domain registrar account (any registrar; recommended: same as seller's for zero-downtime, i.e. Hostinger)
  - [ ] Cloudflare account
  - [ ] Render account with credit card
  - [ ] Brevo account with a verified payment method
  - [ ] LLM provider account with API key
  - [ ] Email address for the 30-day support channel

## Transfer sequence

### Day 1 — Repository access

- [ ] Seller invites buyer as collaborator on the private repository with read access
- [ ] Buyer confirms clone and local build succeed
- [ ] Buyer runs `npm audit --production` and compares against seller's reported findings

### Day 2 — Domain unlock and auth-code delivery

- [ ] Seller unlocks `praxisonline24.com` at Hostinger
- [ ] Seller generates the EPP auth-code
- [ ] Seller delivers the auth-code to the buyer via escrow-protected channel (Flippa messaging, encrypted email, or password manager share)
- [ ] Buyer initiates transfer at their preferred registrar
- [ ] Both parties confirm the transfer approval email

### Day 2–3 — Cloudflare zone reassignment

- [ ] Buyer creates a new Cloudflare zone for `praxisonline24.com` under their account
- [ ] Buyer copies existing DNS records from the seller's zone (screenshot list provided by seller)
- [ ] DNS providers at registrar level are updated to point to buyer's Cloudflare nameservers
- [ ] Both parties verify propagation via `dig`
- [ ] Seller's original zone is retained until Day 5 as fallback

### Day 3–4 — Render service

- [ ] Buyer creates a new Render service from the transferred GitHub repository
- [ ] Buyer sets all required environment variables per [Environment Requirements](../06-deployment/Environment_Requirements.md)
- [ ] Buyer attaches a persistent disk if using Starter plan
- [ ] Buyer triggers first deploy and monitors build log
- [ ] Health check `/api/health` returns 200 on buyer's Render URL
- [ ] Seller's original Render service is retained until Day 5 as fallback

### Day 4 — Brevo sender re-verification

- [ ] Buyer creates a new Brevo account (or uses existing) with billing set up
- [ ] Buyer adds `praxisonline24.com` as a domain in Brevo dashboard
- [ ] Brevo provides new DKIM DNS records for the buyer's account
- [ ] Buyer adds those DKIM records to Cloudflare zone
- [ ] Brevo verifies the domain (typically under 30 minutes)
- [ ] Buyer generates a new API key and sets it in Render environment
- [ ] End-to-end email test: buyer sends themselves a demo request through the running app and confirms delivery

### Day 5 — DNS cutover to buyer's Render

- [ ] Buyer updates Cloudflare `A` record for `praxisonline24.com` and `www.praxisonline24.com` to point to buyer's Render service
- [ ] Both parties verify `curl https://praxisonline24.com/api/health` returns 200
- [ ] Seller decommissions original Render service and original Cloudflare zone

### Day 5–6 — Brand assets and documentation

- [ ] Full clone of the repository confirms all `sale/assets/branding/` files are present
- [ ] All buyer-facing DD documents (`sale/due-diligence/` and `sale/flippa/`) are on the buyer's copy
- [ ] Brand kit archive (SVG + PNG variants) is separately downloaded by buyer

### Day 6–7 — Support channel and handover

- [ ] Both parties agree on a communication channel for the 30-day support window (email thread, shared Slack channel, or Linear workspace)
- [ ] Seller shares any operational knowledge not already in the documentation
- [ ] Buyer signs the credentials-transfer log (see `credentials-transfer-log.md` template in this folder)
- [ ] Escrow release conditions are confirmed satisfied

### Day 7 — Escrow release

- [ ] Both parties sign the completion certificate
- [ ] Buyer releases escrow to seller
- [ ] The 30-day support window begins

## Post-transfer commitments

### Seller

- 30 days of asynchronous support, up to approximately 10 hours of seller time, covering:
  - Deployment questions
  - Code walkthroughs
  - Environment migration help
  - Configuration decisions
- No new-feature work included
- Extended support available at a standard consulting rate on separate agreement

### Buyer

- Take full operational responsibility from Day 7
- Manage all subsequent DNS, hosting, email and LLM provider changes
- Maintain security posture per [Security](../04-technical-documentation/Security.md) recommendations
- Handle any customer support inquiries directly

## What is not transferred

- Seller's personal accounts on GitHub, Render, Cloudflare, Hostinger, Brevo, or LLM providers
- Seller's personal API keys or credentials
- The Doctoronline24 sister product (separate asset, remains with seller)
- Any consulting relationship or ongoing operational role beyond the 30-day window

## Risk mitigation

- **Zero-downtime cutover** achieved by keeping both seller and buyer Render services live for 24 hours during Day 5
- **DNS fallback:** seller's Cloudflare zone remains live until buyer confirms production stability
- **Email deliverability window:** buyer's Brevo re-verification completes on Day 4, one day before DNS cutover
- **Credential handoff via escrow-protected channel:** auth codes never travel over unprotected email

## Verification sign-off

Both parties initial each transferred asset:

| Asset | Seller confirms handed over | Buyer confirms received |
|---|---|---|
| GitHub repository | ___ | ___ |
| Domain `praxisonline24.com` | ___ | ___ |
| Cloudflare zone | ___ | ___ |
| Render service | ___ | ___ |
| Brevo sender identity + DKIM | ___ | ___ |
| Brand asset archive | ___ | ___ |
| Full DD documentation | ___ | ___ |
| 30-day support channel established | ___ | ___ |

---

**NDA classification:** Confidential
**Last updated:** 2026-07-07
**Document owner:** The seller
**Related documents:** [IP and Licensing](./IP_and_Licensing.md), [Deployment Guide](../06-deployment/Deployment_Guide.md), [Environment Requirements](../06-deployment/Environment_Requirements.md), [Domain and Brand](../07-domain-and-brand-assets/Domain_and_Brand.md)
