# PraxisOnline24 — Infrastructure

## Purpose

Runtime infrastructure inventory and dependency map. Answers: *what physical services keep this application running, and what does the buyer inherit or replace?*

## Executive summary

Four external services keep PraxisOnline24 online: **Render** (hosting), **Cloudflare** (DNS + CDN + TLS), **Hostinger** (domain registration and inbound MX for `info@praxisonline24.com`), and **Brevo** (transactional email). One additional dependency, the **LLM provider** for the AI Practice Manager, is chosen and billed by the buyer.

## Service inventory

### Render

- **Purpose:** Application hosting
- **Region:** Frankfurt (EU)
- **Plan (current):** > TODO — confirm whether Free or Starter is currently active; seller intent is Starter with a persistent disk for the buyer's production
- **Deployment mode:** Auto-deploy from `main` branch via GitHub webhook
- **Configuration file:** `render.yaml` committed at repository root
- **Health check:** `/api/health` (returns `200 OK` when the app is up)
- **Transfer path:** transfer the service to the buyer's Render account, or redeploy under a new Render account with the committed `render.yaml`

### Cloudflare

- **Purpose:** DNS zone, CDN edge, TLS termination, basic WAF
- **Zone:** `praxisonline24.com`
- **TLS mode:** > TODO — confirm current setting (Full Strict recommended)
- **CDN caching rules:** > TODO — enumerate any custom rules; default is likely bypass on `/api/*`, cache on `/css` and `/js`
- **Transfer path:** zone reassignment to buyer's Cloudflare account (24–48 hours propagation)

### Hostinger

- **Purpose:** Domain registrar for `praxisonline24.com`; inbound mail for `info@praxisonline24.com`
- **DNS management:** delegated to Cloudflare (nameservers point to `atlas.dns-parking.com` and `hyperion.dns-parking.com` per current whois)
- **Inbound MX records:** `mx1.hostinger.com` (priority 5), `mx2.hostinger.com` (priority 10)
- **Transfer path:** domain unlock + auth code, transfer to buyer's registrar (typically 5–7 days)

### Brevo (formerly Sendinblue)

- **Purpose:** Transactional email via HTTPS API
- **Account:** > TODO — confirm current owner-account name for buyer transfer discussion; Doctoronline24 sister project uses same Brevo account
- **DNS records on `praxisonline24.com`:**
  - SPF: `v=spf1 include:_spf.mail.hostinger.com include:spf.brevo.com ~all`
  - DKIM selectors: `brevo1._domainkey`, `brevo2._domainkey`
  - DMARC: `v=DMARC1; p=none; rua=mailto:rua@dmarc.brevo.com`
  - Brevo domain-verify: `brevo-code:5eb8acbf3b87514cae56a30bff926c13`
- **Transfer path:** buyer creates their own Brevo account, re-verifies the sender identity, updates DNS records to point to their own DKIM selectors. Total time: 30–60 minutes plus DNS propagation.

### LLM provider (buyer-chosen)

- **Purpose:** AI Practice Manager daily briefings
- **Adapter:** swappable at runtime via environment variables
- **Supported providers:** Anthropic Claude, OpenAI (extendable to any HTTP-JSON LLM)
- **Cost profile:** per-tenant per-briefing; variable with LLM provider pricing
- **Transfer path:** buyer provides their own API key via environment variable; no seller-side account transfers

## Cost baseline (at zero customers)

| Service | Plan | Monthly cost |
|---|---|---|
| Render | Starter recommended (~USD 7/mo) plus persistent disk (~USD 0.25 per GB / mo) | ~USD 8–15 |
| Cloudflare | Free tier | USD 0 |
| Hostinger | Domain renewal amortised | ~USD 1.25 (from USD 15/year) |
| Brevo | Free tier (up to 300 emails/day) | USD 0 |
| LLM provider | Pay-per-use, buyer provides key | Variable; ~USD 10–50/mo at low volume |
| **Baseline** | | **~USD 20–70 / month** |

## Cost scaling considerations

- **Brevo** transitions to paid plan around 300 emails/day (typically ~100 practices at moderate activity)
- **LLM cost** scales linearly with active practice count × briefings-per-day
- **Render** may require plan upgrade at scale to handle concurrent connections
- **Cloudflare Pro or Business** becomes worthwhile if traffic warrants advanced WAF or image optimisation

## Monitoring and alerting

Current state: **none in place.** Recommended Day-30 setup:

- Uptime monitoring: UptimeRobot or Better Stack on `/api/health`
- Application error tracking: Sentry
- Log aggregation: Render's built-in log viewer (retention up to 7 days on Starter)
- Email deliverability monitoring: Brevo's built-in bounce and complaint reports

## Backup and disaster recovery

- **Database backup:** daily cron job copies `data/praxisonline24.db` to `data/backups/` inside the container
- **Off-container backups:** > TODO — not currently configured; recommend nightly rsync to an S3-compatible bucket
- **Recovery time objective (RTO):** > TODO — should be defined at Day-30 (Render service restart is under 5 minutes; database restore is disk-copy time)
- **Recovery point objective (RPO):** current is 24 hours (daily backup cadence); improve with hourly backup or WAL streaming when volume warrants

## Third-party service audit

The buyer should verify at DD stage:

- Render service is not consuming more resources than the current plan allows
- Cloudflare zone has no legacy A records pointing to abandoned infrastructure
- Brevo has no email templates or contact lists inherited from prior use
- Hostinger domain is unlocked and auth-code is retrievable

## What is not part of the sale

- Seller's personal Render, Cloudflare, Brevo or Hostinger accounts
- Seller's personal LLM provider API keys
- Any consulting or ongoing operational responsibility beyond the 30-day handover window

---

**NDA classification:** Share after NDA
**Last updated:** 2026-07-07
**Document owner:** The seller
**Related documents:** [System Architecture](./System_Architecture.md), [Deployment Guide](../06-deployment/Deployment_Guide.md), [Environment Requirements](../06-deployment/Environment_Requirements.md), [Domain and Brand](../07-domain-and-brand-assets/Domain_and_Brand.md)
