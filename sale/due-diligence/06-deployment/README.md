# 06 — Deployment

## Purpose

Operational documentation for the buyer's DevOps evaluator. Answers *"How does this run in production, and what do I need to know to keep it running the day after the transfer completes?"*

## Files that will be added

- `deployment-runbook.md` — step-by-step guide from GitHub clone to live production URL
- `render-configuration.md` — how `render.yaml` maps to the Render service, plan selection, region, health checks
- `cloudflare-configuration.md` — DNS records, TLS mode, page rules, cache configuration
- `environment-variables.md` — every env var used, required vs optional, sensitivity classification
- `email-deliverability-setup.md` — Brevo sender verification, DKIM records (`brevo1._domainkey`, `brevo2._domainkey`), SPF include, DMARC policy — with current DNS state
- `monitoring-and-alerting-setup.md` — recommended UptimeRobot / Sentry / Better Stack setup, with example configuration
- `backup-strategy.md` — current SQLite backup cron, restore procedure, recommended upgrade path
- `disaster-recovery-runbook.md` — service-down / region-down / provider-account-locked scenarios and recovery steps

## NDA classification

**Share after NDA.** Deployment-level detail is used during transfer preparation. Provided upon signed NDA. Actual credentials (API keys, service passwords) are transferred separately during escrow release — see section 09 for that process.

## Reader notes

- The buyer takes on hosting cost from Day 1 of transfer. Baseline is documented at ~$50/month; specifics in `sale/flippa/buyer-faq.md` Q7.
- Deployment is Node.js on Render's Fluid Compute. No container orchestration, no Kubernetes. Deliberately simple for the target scale.
- Persistent-disk upgrade path is documented but not activated in the current `render.yaml` — this is the buyer's Day-1 decision.
