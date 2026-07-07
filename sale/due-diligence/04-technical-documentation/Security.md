# PraxisOnline24 — Security

## Purpose

Honest description of the security posture as implemented today. What is in place, what is deferred, and what the buyer should treat as Day-30 hardening work.

## Executive summary

**Application-level fundamentals are correctly implemented:** parametrised SQL, bcrypt password hashing at cost 12, rate limits on auth endpoints, secure session cookies in production. **Defence-in-depth items are documented gaps:** no CSRF tokens, no Content Security Policy header, no two-factor authentication. No formal external security audit has been performed.

## What is implemented

### Authentication and authorisation

- **Password hashing:** bcrypt at cost 12 (production-grade)
- **Session management:** `express-session` with cookie flags `HttpOnly`, `Secure` (in production), `SameSite=Lax`
- **Session store:** in-memory (default MemoryStore); Redis swap documented
- **Auth rate limits:** 5 login attempts per minute per IP, 3 register attempts per minute, 3 forgot-password requests per minute
- **Owner role check:** compares `req.session.userEmail` against `process.env.OWNER_EMAIL` at request time
- **Password reset flow:** time-limited tokens (1 hour), single-use, delivered via email
- **Anti-enumeration on login:** identical error message for user-not-found and wrong-password
- **Anti-enumeration on forgot-password:** always returns 200 regardless of whether the email exists

### Data-layer security

- **Parametrised SQL everywhere.** No string interpolation into queries. Grep-verifiable across the codebase.
- **Foreign key enforcement:** `PRAGMA foreign_keys = ON` set on database open
- **Privacy-by-design schema:** deliberately excludes clinical data, dates of birth, insurance numbers, payment card storage

### Transport security

- **HTTPS enforced** at the Cloudflare edge (buyer configures TLS mode)
- **HSTS header** set in production
- Cookies flagged `Secure` in production

### HTTP security headers

Set via a `middleware/security.js` module:

- `X-Frame-Options: SAMEORIGIN`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`

### Secrets management

- All secrets read from environment variables at process start
- No secrets committed to the repository (verified via git-history scan)
- Production secrets stored in Render dashboard, not in `render.yaml`

## What is not implemented (transparent disclosure)

- **CSRF token protection.** Not implemented. Session-based auth with `SameSite=Lax` cookies mitigates the most common CSRF class, but explicit CSRF tokens are recommended for defence-in-depth.
- **Content Security Policy (CSP) header.** Not set. Would harden against XSS.
- **Two-factor authentication.** Not implemented. Recommended for owner and administrator accounts.
- **Formal external penetration test.** Not performed. Buyer should budget 2–3 days from an independent auditor before public launch.
- **Web Application Firewall (WAF) rules.** Cloudflare provides some at the edge with the free tier; additional rules are the buyer's decision.
- **Automated dependency scanning in CI.** Not wired. Recommend `npm audit --production` on every deploy.
- **Bug bounty programme.** Not established.

## Threat model — what the current posture protects against

- **Credential stuffing** — bcrypt cost 12 makes brute force infeasible; rate limits slow online attacks
- **SQL injection** — parametrised queries block the common vector
- **Session hijacking (network sniffing)** — TLS + Secure cookies mitigate
- **Common privilege escalation** — row-level tenancy on every query prevents most tenant-isolation violations (subject to code review)
- **Basic data exfiltration** — schema deliberately excludes sensitive medical data

## Threat model — what is out of scope

- **Nation-state adversaries** — not the target threat model
- **Insider threats with database access** — a compromised Render dashboard grants full data access; standard hosted-SaaS trust model
- **Supply-chain attacks on third-party dependencies** — mitigated by keeping the dependency set small and audited, not eliminated
- **Client-side attacks against the practitioner's browser** — outside the application's control (session cookies with `HttpOnly` reduce impact)

## Compliance posture

- **GDPR:** privacy-conscious schema and 30-day anonymisation of demo requests; formal DPA agreements with sub-processors (Render, Cloudflare, Brevo) are the buyer's responsibility to establish
- **HIPAA:** not audited, not compliant, no BAA-ready configuration; US healthcare market entry requires a HIPAA compliance project
- **PCI-DSS:** not applicable (no payment cards stored on the platform; Stripe would handle when activated)
- **National regulations** in the buyer's target market: buyer's responsibility

## Buyer's recommended Day-30 security actions

1. Independent penetration test (2–3 days, external auditor)
2. Add CSRF token library (`csurf` or equivalent) to state-changing routes
3. Configure Content Security Policy header via the security middleware
4. Enable two-factor authentication for owner and administrator accounts
5. Set up dependency scanning in CI (`npm audit --production` gate)
6. Formalise incident response procedure
7. Establish DPA agreements with Render, Cloudflare and Brevo

## Buyer's verification steps

- Grep the codebase for password constants: none should exist
- Run `git log -p | grep -iE "password|secret|api_key"` and verify only variable-name references appear
- Run `npm audit --production` and compare against seller's reported findings
- Verify Cloudflare TLS mode is set to "Full (Strict)" not "Flexible"
- Check the Render dashboard for accidental environment-variable exposure

---

**NDA classification:** Share after NDA
**Last updated:** 2026-07-07
**Document owner:** The seller
**Related documents:** [Technology Stack](./Technology_Stack.md), [API Overview](./API_Overview.md), [Deployment Guide](../06-deployment/Deployment_Guide.md), [Environment Requirements](../06-deployment/Environment_Requirements.md)
