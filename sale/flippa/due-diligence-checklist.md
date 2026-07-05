# PraxisOnline24 — Buyer Due Diligence Checklist

> Use this checklist during due diligence. Every item below is either **available immediately**, **available on request** or **not applicable (pre-revenue)** and marked accordingly. Bring your own advisers for legal and tax review.

---

## Section A — Codebase & Intellectual Property

| # | Item | Available |
|---|---|---|
| A1 | Full source code access via time-limited GitHub read invite | Immediately |
| A2 | Commit history and contributor list (single-founder codebase) | Immediately |
| A3 | Dependency inventory (`package.json`, `package-lock.json`, licence audit) | Immediately |
| A4 | Vulnerability scan of dependencies (`npm audit`, Snyk export) | On request |
| A5 | Confirmation that no code was copied from other proprietary sources | Immediately — declared in writing |
| A6 | Third-party licence compatibility check (MIT / Apache / ISC — no copyleft) | Immediately |
| A7 | Trademark search on "PraxisOnline24" (not registered) | Buyer-side |
| A8 | Design assets: logo files (SVG + PNG), favicon, brand colours, screenshots | Immediately, `sale/assets/` |

**Verification steps for the buyer:**
- Run `npm audit --production` and review output.
- Grep the codebase for third-party proprietary snippets: none found in seller's own audit.
- Verify licence of every direct + transitive dependency.

---

## Section B — Technical Architecture

| # | Item | Available |
|---|---|---|
| B1 | Architecture diagram + module map | Immediately, `sale/Technical_Due_Diligence.md` |
| B2 | Database schema documentation (18 tables) | Immediately in `database.js` + technical DD doc |
| B3 | API endpoint inventory (17 route files) | Immediately in `sale/Technical_Due_Diligence.md` |
| B4 | Deployment topology (Cloudflare → Render Frankfurt) | Immediately |
| B5 | `render.yaml` deployment manifest | Immediately in repo |
| B6 | Environment variable inventory + which are required vs optional | Immediately in `.env.example` |
| B7 | Cron job list (8 scheduled jobs) with purpose and cadence | Immediately in `utils/cron.js` and technical DD doc |
| B8 | Backup strategy documentation | Immediately in `DEPLOYMENT.md` |

**Verification steps for the buyer:**
- Clone repo locally, `npm install`, `npm start` — reach `http://localhost:3000` within 5 minutes.
- Trigger each cron job in dev mode; observe logs.
- Load-test the demo flow with an HTTP tool; observe response times.

---

## Section C — Security Posture

| # | Item | Status |
|---|---|---|
| C1 | Password hashing (bcrypt cost 12) | ✅ Implemented |
| C2 | Parametrised SQL everywhere | ✅ Implemented, grep-verifiable |
| C3 | HTTPS + HSTS + secure cookies in production | ✅ Implemented |
| C4 | Rate limiting on auth endpoints | ✅ Implemented (5/min login, 3/min register/forgot-password) |
| C5 | HTTP security headers (X-Frame-Options, X-Content-Type-Options, Referrer-Policy) | ✅ Implemented |
| C6 | CSRF protection | ❌ Not implemented (documented risk) |
| C7 | Content Security Policy (CSP) | ❌ Not implemented (documented risk) |
| C8 | Two-Factor Authentication (2FA) | ❌ Not implemented (documented risk) |
| C9 | Secrets scanning of git history | ✅ Verified clean at time of listing |
| C10 | External penetration test | ❌ Not performed |

**Verification steps for the buyer:**
- Run `git log -p | grep -iE "password|secret|token|api_key"` — expect only variable-name references, no literal secret values.
- Run OWASP ZAP baseline scan against the live pre-launch instance.
- Book a small pentest (2–3 days from an independent auditor) before opening to the public.

---

## Section D — Data Protection & Privacy

| # | Item | Status |
|---|---|---|
| D1 | Privacy-by-design schema (no diagnoses, medication, DOB, insurance) | ✅ Explicit in `database.js` |
| D2 | 30-day auto-anonymisation of demo requests | ✅ Implemented in cron |
| D3 | Explicit consent flows (registration, demo, invite activation) | ✅ Implemented |
| D4 | Privacy policy page | ✅ `public/datenschutz.html`, multilingual |
| D5 | Imprint page (Impressum) | ✅ `public/impressum.html` |
| D6 | Terms & conditions | ✅ `public/agb.html` |
| D7 | Data Processing Agreement (DPA) with sub-processors | Buyer to formalise |
| D8 | GDPR data-request handling procedure | Buyer to formalise |
| D9 | Breach notification procedure | Buyer to formalise |
| D10 | HIPAA readiness | ❌ Not audited, not compliant |

---

## Section E — Financial & Commercial

| # | Item | Status |
|---|---|---|
| E1 | Historic revenue | N/A — pre-revenue |
| E2 | Historic paying customers | N/A — pre-revenue |
| E3 | Historic MRR / ARR | N/A — pre-revenue |
| E4 | Pricing configuration | ✅ Documented in `config/pricing.js` and `sale/Pricing_Strategy.md` |
| E5 | Cost of goods sold (hosting, email, AI) | ✅ Modelled in growth roadmap |
| E6 | Customer acquisition cost | N/A — no marketing activity has been performed |
| E7 | Existing subscription contracts | N/A — none |
| E8 | Existing licence agreements | N/A — none |

---

## Section F — Marketing & Growth Assets

| # | Item | Available |
|---|---|---|
| F1 | Domain `praxisonline24.com` (registration, expiry, DNS control) | Transferable |
| F2 | Social media accounts | Not created (opportunity for buyer) |
| F3 | Email list of prospects | Not built (opportunity for buyer) |
| F4 | Landing page copy in 12 languages | ✅ In codebase |
| F5 | Google Search Console + Analytics setup | Not linked (buyer to set up) |
| F6 | Prior paid advertising history | None — no paid ads have been run |
| F7 | SEO status / backlinks | Fresh domain, no backlinks yet |
| F8 | Waitlist / interest signups | None captured pre-launch |

---

## Section G — Operations

| # | Item | Available |
|---|---|---|
| G1 | Deployment runbook | Immediately, `sale/Transfer_Checklist.md` |
| G2 | Environment configuration guide | Immediately, `.env.example` |
| G3 | Monitoring / alerting setup | Not implemented (buyer to add: UptimeRobot, Sentry, etc.) |
| G4 | Incident response procedure | Not formalised (buyer to draft) |
| G5 | Log retention policy | Default 7 days on Render, extendable |
| G6 | Backup automation | Implemented in `utils/cron.js`; buyer to test restore procedure |
| G7 | On-call rota | N/A — single-founder project |

---

## Section H — Third-Party Relationships

| # | Provider | Purpose | Transfer method |
|---|---|---|---|
| H1 | Render.com | Hosting | Service transfer or fresh deploy under buyer account |
| H2 | Cloudflare | DNS + CDN + TLS | Zone re-assign (48h) |
| H3 | Hostinger | Domain registration + MX for `info@praxisonline24.com` | Domain transfer via auth code |
| H4 | Brevo (Sendinblue) | Transactional email | New sender verification under buyer account (30-min DNS re-verify) |
| H5 | LLM provider (Claude / OpenAI) | AI assistant | Buyer-provided API key |
| H6 | Playwright / npm packages | Dev tooling | No account transfer needed |

---

## Section I — Legal

| # | Item | Status |
|---|---|---|
| I1 | Original authorship of code (no copyright dispute) | ✅ Declared in writing |
| I2 | Active lawsuits | ❌ None |
| I3 | Pending IP claims | ❌ None |
| I4 | Trademark registration on "PraxisOnline24" | ❌ Not registered |
| I5 | Company entity being sold | N/A — asset sale only |
| I6 | Employment obligations transferring | N/A |
| I7 | Contractor obligations transferring | N/A |
| I8 | Open-source licences of derivative work | Buyer must maintain attribution files |

---

## Section J — Handover Deliverables

Before escrow release, the buyer confirms receipt of:

- [ ] GitHub repository ownership transferred
- [ ] Domain unlocked + auth code delivered + successful transfer confirmed
- [ ] Cloudflare zone under buyer's Cloudflare account
- [ ] Render service under buyer's Render account (or fresh deploy confirmed)
- [ ] Brevo sender re-verified under buyer's Brevo account, DKIM validated
- [ ] Brand asset archive (logo variants, favicon, palette, screenshots) delivered
- [ ] All environment variables documented and provided (sanitised — no seller secrets)
- [ ] Final deployment health check: `/api/health` returns 200 on buyer-owned infrastructure
- [ ] Handover-support channel established (email/Slack/Linear)
- [ ] 30-day support clock started

---

## Recommended external advisers

- **SaaS attorney** in buyer's jurisdiction — for asset-purchase agreement structuring and licence review.
- **Independent security consultant** — for a light pentest before public launch.
- **Accountant** — for allocation of purchase price across asset categories in buyer's books.
- **Tax adviser** — for VAT / GST implications in the buyer's country.

---

## Red-flag summary

Items the seller has surfaced honestly rather than hidden:

- Pre-revenue → all valuation is opportunity-based, not multiple-based.
- No test suite → operational risk if scaled quickly.
- SQLite ceiling → known migration path but not yet implemented.
- No CSRF / CSP / 2FA → standard hardening deferred until launch demand justifies it.
- No formal security audit → recommended before public launch.
- Deprecated `moment` dependency → minor tech debt.

If any of these are dealbreakers, the seller wants to know before you invest time in due diligence.
