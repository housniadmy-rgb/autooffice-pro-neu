# PraxisOnline24 — Deployment Guide

## Purpose

Step-by-step instructions for the buyer's DevOps person to deploy PraxisOnline24 from a fresh clone to a production URL under their own accounts. Target duration: **60 minutes from clone to live health check.**

## Executive summary

Deployment is `render.yaml`-driven. Buyer clones the repository, sets required environment variables in the Render dashboard, presses "Deploy", and monitors the build log. No manual server configuration is needed.

## Prerequisites

- GitHub account with access to the transferred private repository
- Render account with a credit card on file (Starter plan is USD 7/month)
- Cloudflare account with the transferred `praxisonline24.com` zone
- Brevo account with a verified sender identity on `praxisonline24.com`
- LLM provider API key (Claude or OpenAI, buyer's choice)
- Local machine with Node.js 18+ and Git installed (optional for local testing)

## Step 1 — Clone and review

```bash
git clone git@github.com:<buyer>/autooffice-pro-neu.git
cd autooffice-pro-neu
```

Review the top-level files:

- `render.yaml` — deployment declaration
- `package.json` — dependency and script inventory
- `.env.example` — environment variable template
- `server.js` — application entry point

## Step 2 — Verify local runtime (optional but recommended)

```bash
npm install
cp .env.example .env
# Edit .env with local values (or leave BREVO_API_KEY empty for dev mode)
node server.js
```

Then in a second terminal:

```bash
curl http://localhost:3000/api/health
# Expected: {"status":"ok","app":"PraxisOnline24"}
```

Stop the server (Ctrl+C).

## Step 3 — Create the Render service

1. Sign in to Render dashboard
2. **New +** → **Web Service**
3. Connect the GitHub repository
4. Render auto-detects `render.yaml` and pre-fills configuration
5. Confirm:
   - Region: **Frankfurt**
   - Runtime: **Node**
   - Build command: `npm install`
   - Start command: `npm start`
   - Health check path: `/api/health`
   - Plan: **Starter** (recommended for production; Free tier available for testing but has ephemeral storage)

## Step 4 — Add a persistent disk (production only)

For production deployment where data must survive redeploys:

1. In the Render service, go to **Environment** → **Disks**
2. **Add Disk**
3. Mount path: `/opt/render/project/src/data`
4. Size: 1 GB (upgradeable later)
5. Save

Without a persistent disk, the SQLite database is ephemeral and lost on every redeploy. Suitable for demo, not for production.

## Step 5 — Set environment variables

In the Render service, go to **Environment** → **Environment Variables** and add each required key. Full inventory is in [Environment_Requirements.md](./Environment_Requirements.md). Minimum required:

- `NODE_ENV=production`
- `PORT=10000` (Render standard)
- `SESSION_SECRET` — a random 64-character string (generate with `openssl rand -hex 32`)
- `OWNER_EMAIL=owner@yourbrand.example`
- `OWNER_INITIAL_PASSWORD` — set once, then rotate manually after first login
- `BREVO_API_KEY` — from Brevo dashboard → SMTP & API → API Keys
- `SMTP_FROM=YourBrand <noreply@yourbrand.example>`
- `EMAIL_DEV_MODE=false` (for real email sending)
- `APP_URL=https://praxisonline24.com`

## Step 6 — Trigger the first deploy

- Render auto-deploys after the environment is configured
- Alternatively: **Manual Deploy** → **Deploy latest commit**
- Monitor the build log for errors
- Expected completion time: 2–5 minutes on Starter plan

## Step 7 — Verify the running deployment

```bash
curl https://<your-render-url>/api/health
# Expected: 200 OK with JSON body
```

Then browse to the URL in a browser and confirm the homepage renders.

## Step 8 — DNS cutover

Once the Render service is stable:

1. In Cloudflare, edit the `A` record for `praxisonline24.com` and `www.praxisonline24.com` to point to the Render service's IP or CNAME target
2. Set TTL to 300 seconds for the first 24 hours (revert to default afterwards)
3. Wait for propagation (typically 5 minutes with Cloudflare, longer with other DNS providers)
4. Verify: `curl https://praxisonline24.com/api/health` returns 200

## Step 9 — Email deliverability check

1. Trigger a demo request from an incognito browser tab
2. Confirm the admin notification arrives at `OWNER_EMAIL` inbox within 60 seconds
3. Confirm the requester receives the contact confirmation and activation emails
4. Check Brevo dashboard → Transactional → Logs for any bounces

## Step 10 — Configure monitoring (recommended)

- **UptimeRobot** on `https://praxisonline24.com/api/health` with 5-minute check
- **Sentry** for application error tracking (add `SENTRY_DSN` env var)
- **Render's built-in metrics** for CPU / memory / request rate

## Rollback procedure

If a deployment fails or introduces a critical bug:

1. Render dashboard → **Deploys** tab
2. Find the previous known-good deploy
3. Click **Rollback**
4. Rollback completes in under 60 seconds

## Common issues and fixes

| Symptom | Likely cause | Fix |
|---|---|---|
| Health check fails after deploy | Missing `SESSION_SECRET` in production | Set the env var and redeploy |
| Emails not sent | `EMAIL_DEV_MODE=true` in production | Set to `false` in Render env |
| Owner cannot log in | `OWNER_INITIAL_PASSWORD` not set | Add the env var and redeploy (triggers auto-seed on next startup) |
| Database resets on redeploy | Persistent disk not attached | Attach a disk at `/opt/render/project/src/data` |
| Brevo returns 401 | `BREVO_API_KEY` typo or expired | Regenerate key in Brevo dashboard, update Render env |

## What to do on Day 30

- Rotate `OWNER_INITIAL_PASSWORD` after first login (this becomes the operator's actual password)
- Enable dependency scanning in CI
- Add CSRF and CSP hardening (see [Security](../04-technical-documentation/Security.md))
- Schedule the first independent penetration test

---

**NDA classification:** Share after NDA
**Last updated:** 2026-07-07
**Document owner:** The seller
**Related documents:** [Environment Requirements](./Environment_Requirements.md), [Infrastructure](../05-architecture/Infrastructure.md), [Asset Transfer Checklist](../09-legal-and-transfer/Asset_Transfer_Checklist.md)
