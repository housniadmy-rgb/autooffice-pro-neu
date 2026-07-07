# PraxisOnline24 — Environment Requirements

## Purpose

Complete inventory of runtime environment variables. For each variable: whether it is required, what it does, sensitivity classification, and where the buyer should set it.

## Executive summary

The application reads approximately **nine environment variables at startup**. Required variables must be set for production; optional variables have safe defaults. All secrets belong in the Render dashboard's Environment section, not in `render.yaml` or the repository.

## Variable inventory

| Variable | Required | Default | Purpose | Sensitivity |
|---|---|---|---|---|
| `NODE_ENV` | Yes (production) | `development` | Environment mode; enables secure cookies, disables verbose errors | Public |
| `PORT` | Yes | `3000` (local) / `10000` (Render) | HTTP listen port | Public |
| `SESSION_SECRET` | Yes | (none — server refuses to start) | Signs session cookies | **Secret** |
| `OWNER_EMAIL` | Recommended | (none) | Identifies the platform-owner user | Public |
| `OWNER_INITIAL_PASSWORD` | Yes (for first boot) | (none) | Seeds the owner account's password on startup if the user does not yet exist | **Secret** |
| `BREVO_API_KEY` | Yes (unless `EMAIL_DEV_MODE=true`) | (none) | Authenticates to Brevo transactional API | **Secret** |
| `SMTP_FROM` | Recommended | `PraxisOnline24 <info@praxisonline24.com>` | From address for outgoing email | Public |
| `EMAIL_DEV_MODE` | No | `false` in production | When `true`, mails are logged only, not sent | Public |
| `APP_URL` | Recommended | `http://localhost:3000` | Base URL for magic-link generation | Public |

## Where to set each variable

### `render.yaml` (repository)

Suitable for **public** values only. The current `render.yaml` sets:

- `NODE_ENV`
- `PORT`
- `SESSION_SECRET` (with `generateValue: true` — Render generates a random value)
- `EMAIL_DEV_MODE`
- `OWNER_EMAIL`
- `SMTP_FROM`
- `BREVO_API_KEY` (declared with `sync: false` — no value in repo; buyer sets in dashboard)
- `OWNER_INITIAL_PASSWORD` (declared with `sync: false` — no value in repo)
- `APP_URL` (declared with `sync: false`)

### Render dashboard (production secrets)

The buyer must set at least:

- `BREVO_API_KEY` — from Brevo dashboard
- `OWNER_INITIAL_PASSWORD` — a strong password known to the operator
- `APP_URL` — the production URL after DNS cutover

### `.env` file (local development)

For local runs, copy `.env.example` to `.env` and populate. `.env` is gitignored.

## Sensitivity classification and handling

- **Public** variables can appear in the repository, in `render.yaml`, and in the deployment documentation.
- **Secret** variables must never appear in the repository, in commit history, in build logs, or in error messages. Buyer should set these only via the Render dashboard.

## Rotation policy

- `SESSION_SECRET`: rotate on any suspected compromise. Rotation logs out all active users (accepted trade-off).
- `OWNER_INITIAL_PASSWORD`: rotate immediately after the operator sets a real password on first login. From that point on, the environment variable value is unused (the operator's password lives hashed in the database).
- `BREVO_API_KEY`: rotate quarterly as standard hygiene, or immediately on suspected exposure. Rotation is safe — no session invalidation impact.

## Values NOT to place in environment

- Personal API keys of the seller
- Credentials for the seller's Render, Cloudflare or Hostinger accounts
- Any user data or PII

## Verification checklist for the buyer

After completing environment setup on Render:

- [ ] `SESSION_SECRET` is set and at least 32 characters long
- [ ] `OWNER_INITIAL_PASSWORD` is set to a strong operator-known value
- [ ] `BREVO_API_KEY` is set and starts with `xkeysib-`
- [ ] `EMAIL_DEV_MODE` is `false` in production
- [ ] `APP_URL` matches the production hostname
- [ ] `NODE_ENV` is `production`
- [ ] `SMTP_FROM` uses a domain verified in Brevo

## Buyer-added variables

The buyer will likely add:

- `SENTRY_DSN` — application error tracking
- `LLM_PROVIDER` and provider-specific API key (`ANTHROPIC_API_KEY` or `OPENAI_API_KEY`)
- `BACKUP_S3_BUCKET` and credentials for off-container backups
- Any additional monitoring / alerting integration credentials

> TODO — buyer completes their own extension of this inventory as they add production hardening.

---

**NDA classification:** Share after NDA
**Last updated:** 2026-07-07
**Document owner:** The seller
**Related documents:** [Deployment Guide](./Deployment_Guide.md), [Security](../04-technical-documentation/Security.md), [Infrastructure](../05-architecture/Infrastructure.md)
