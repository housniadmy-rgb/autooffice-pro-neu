# Transfer Checklist — PraxisOnline24

> Everything that physically changes hands on closing. Tick each item; both parties sign at the end.

---

## 1. Source Code (Day 0 — closing day)

- [ ] Seller transfers GitHub repository ownership of `housniadmy-rgb/autooffice-pro-neu` to buyer's GitHub org/account, **OR**
- [ ] Seller pushes a final `transfer/main` tag and grants buyer a one-time admin invite; buyer mirrors to their own repo
- [ ] Seller archives any seller-side repo copies (no parallel forks)
- [ ] Buyer verifies clone, `npm install`, `npm start` succeed locally
- [ ] Buyer verifies `git log --oneline` shows clean history with documented commit messages

---

## 2. Domain (Day 0–7)

- [ ] **`praxisonline24.com`** — apex domain
- [ ] **`www.praxisonline24.com`** — www subdomain (handled by registrar)
- [ ] Seller unlocks the domain at the registrar
- [ ] Seller generates EPP/auth transfer code, sends via encrypted channel (1Password / Signal)
- [ ] Buyer initiates transfer in their own registrar account
- [ ] Both parties confirm 5–7 day EPP wait
- [ ] On transfer success: WHOIS record updated, domain visible in buyer's registrar
- [ ] DNS continuity: see §3

---

## 3. DNS & Cloudflare (Day 0–7)

- [ ] Seller adds buyer as Cloudflare zone admin (no downtime), **OR**
- [ ] Seller exports the zone file (DNS records) and shares with buyer
- [ ] Records to transfer:
  - [ ] Apex A → Render origin (currently `216.24.57.x` range)
  - [ ] `www` CNAME → Render origin
  - [ ] MX records (if buyer wants `info@praxisonline24.com` mailbox)
  - [ ] TXT records (SPF, DKIM, DMARC) for mail deliverability
- [ ] Buyer moves zone to their Cloudflare account (or keeps it via shared admin until comfortable)
- [ ] Cloudflare CDN + TLS continue to work throughout transfer

---

## 4. Production Deployment (Day 0)

**Choice A — Buyer redeploys (recommended, simplest):**
- [ ] Buyer creates a new Render Web Service
- [ ] Connects to buyer's GitHub fork
- [ ] `render.yaml` auto-applies build/start commands + health check
- [ ] Buyer sets environment variables (see §6)
- [ ] First deploy succeeds; `https://buyer-app-name.onrender.com` returns 200
- [ ] DNS is repointed from old Render service to new Render service (5-minute task)
- [ ] Seller decommissions old Render service after 24h of buyer running stable

**Choice B — Seller hands over the Render account:**
- [ ] Seller transfers Render workspace ownership to buyer (or adds buyer as owner, then seller removes themselves)
- [ ] Buyer updates payment method to their own card
- [ ] Buyer rotates `SESSION_SECRET`, `SMTP_*`, `BREVO_API_KEY`, `OWNER_INITIAL_PASSWORD`

---

## 5. Database (Day 0)

- [ ] Seller confirms current `data/praxisonline24.db` contains only test data
- [ ] Buyer **wipes** the live database on first deploy: `rm data/praxisonline24.db` then restart → fresh schema, fresh owner account
- [ ] If buyer wants the test data for reference: seller provides a copy out-of-band
- [ ] Daily backup cron starts immediately on buyer's deployment (verify by checking `data/backups/` after 02:00 UTC the first night)

---

## 6. Environment Variables (Day 0)

Buyer sets these in their Render dashboard:

| Variable | Required | Notes |
|---|---|---|
| `NODE_ENV` | ✅ | `production` |
| `PORT` | ✅ | `10000` (Render default for `render.yaml`) |
| `SESSION_SECRET` | ✅ | Strong random 32+ chars; auto-generated via `render.yaml` |
| `EMAIL_DEV_MODE` | ✅ | `false` for real e-mail |
| `SMTP_HOST` | ⚠️ | Buyer's SMTP provider (or Brevo) |
| `SMTP_PORT` | ⚠️ | 587 |
| `SMTP_USER` | ⚠️ | |
| `SMTP_PASS` | ⚠️ | |
| `SMTP_FROM` | ⚠️ | `"PraxisOnline24 <noreply@praxisonline24.com>"` |
| `BREVO_API_KEY` | optional | If using Brevo API instead of SMTP |
| `OWNER_EMAIL` | ✅ | Buyer's admin e-mail |
| `OWNER_INITIAL_PASSWORD` | ✅ | One-time bootstrap admin password — change after first login |
| `APP_URL` | ✅ | `https://praxisonline24.com` |

⚠️ = required if e-mail delivery should work (otherwise everything else functions, mails just go to console logs)

The complete previous Vercel environment variable backup (encrypted) is **not** included in this transfer — that belonged to a separate, deprecated Vercel project (`autooffice-pro` on Vercel). The current production deployment runs on Render with `render.yaml`.

---

## 7. Brand Assets (Day 0)

- [ ] Product name **"PraxisOnline24"** — no trademark held; buyer may rename or keep
- [ ] Slogan **"Ihre Praxis. Online. Rund um die Uhr."** — in repo (`public/index.html`)
- [ ] Logo / brand color system — embedded in `public/css/style.css` and inline SVG/text in `public/index.html`
- [ ] All UI strings in 12 languages — in `locales/*.json`
- [ ] Favicon / app icons — in `public/`
- [ ] OpenGraph image — referenced from `public/index.html`

If buyer plans to **rename** the product:
- ~2 days to do a careful search-and-replace across `locales/`, HTML titles, OG tags, e-mail templates, README, deployment configs

---

## 8. Logos & Visual Assets (Day 0)

- [ ] Inspect `public/` for logo files (`favicon.ico`, hero images, OG image)
- [ ] Source files for the logo (e.g., Figma / SVG): seller provides or confirms there are none (current logo is text-based)
- [ ] Brand color palette: documented in CSS variables in `public/css/style.css`

---

## 9. E-mail Templates (Day 0 — already in repo)

- [ ] `utils/emailLocales.js` — patient-facing
- [ ] `utils/emailLocalesAdmin.js` — admin notifications
- [ ] `utils/emailLocalesInvoice.js` — invoice e-mails
- [ ] `utils/emailLocalesPatient.js` — patient confirmations
- [ ] All localized across 12 languages
- [ ] Buyer reviews + customises sender name + footer

---

## 10. Documentation (Day 0 — already in repo)

- [ ] `README.md` — 227 lines
- [ ] `DEPLOYMENT.md` — 165 lines
- [ ] `QA_CHECKLIST.md` — 187 verification points
- [ ] `AGENTS.md` / `CLAUDE.md` — short editor instructions
- [ ] `sale/` folder — investor report, pitch deck, executive summary, FAQ, due diligence, demo guide, pricing strategy, this checklist

---

## 11. Configuration Files (Day 0 — already in repo)

- [ ] `package.json` (dependencies pinned)
- [ ] `render.yaml` (Render deployment spec)
- [ ] `.gitignore` (covers `.env`, `data/`, `backups/`, `node_modules/`, `.vercel`)
- [ ] `.env.example` (template; no secrets)
- [ ] `scripts/cleanup-test-account.sql` (test-data cleanup helper)

---

## 12. Accounts to Hand Over (Optional)

| Account | Transferable? | Recommendation |
|---|---|---|
| GitHub repo | ✅ | Transfer ownership |
| Cloudflare zone | ✅ | Transfer or share admin |
| Render workspace | ✅ | Buyer's choice: new account or seller's account |
| `info@praxisonline24.com` mailbox | ⚠️ | Depends on where it is hosted (currently part of the domain MX records). If buyer takes the domain, the mailbox follows. |
| Brevo (transactional e-mail) | ⚠️ | Buyer creates their own free Brevo account; no data to migrate (it is just sending pipeline) |
| Vercel (legacy) | ❌ | Seller's deprecated Vercel project (`autooffice-pro`) is **not** transferred — it points to a different, older codebase and is being deprecated separately |

---

## 13. NOT Included in Transfer

- ❌ Seller's personal Anthropic / Claude Code / GitHub Pro / other developer accounts
- ❌ Stripe customer data (Stripe was not active; no customer data exists)
- ❌ Real patient/booking data (test data only)
- ❌ Outstanding contracts (there are none)
- ❌ Trademarks (no registered trademarks)
- ❌ Personal e-mail correspondence of the seller

---

## 14. Post-Close Support (Optional)

- [ ] 30 days of e-mail Q&A included — capped at 5 hours
- [ ] Additional support: $120/hr, invoiced monthly, capped at $1,500/month
- [ ] One free 60-min "office hours" call in the first 14 days

---

## 15. Signatures

| Party | Name | Date | Signature |
|---|---|---|---|
| Seller | | | |
| Buyer | | | |

---

## Estimated Total Handover Time

| Track | Time |
|---|---|
| Code + repo transfer | Day 0 (1 hour) |
| Deployment under buyer | Day 0 (1 hour) |
| DNS / Cloudflare | Day 0 (1 hour) |
| Domain EPP transfer | Day 0–7 (mostly wait) |
| Buyer's environment-variable setup | Day 0 (30 min) |
| Buyer's first end-to-end test (use `Demo_Guide.md`) | Day 0–1 (1–2 hours) |
| **Total active work** | **~5 hours combined seller + buyer** |
| **Total elapsed time** | **7–10 days** (gated by domain transfer wait) |
