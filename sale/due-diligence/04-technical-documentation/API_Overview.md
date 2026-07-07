# PraxisOnline24 — API Overview

## Purpose

Inventory of HTTP endpoints exposed by the application, grouped by module. Intended for a buyer's technical evaluator to size the integration surface and validate the authentication model.

## Executive summary

The application exposes **approximately 17 modular route files** under `routes/`, each grouped by domain (auth, appointments, patients, invoices, and so on). All routes return JSON. Authenticated routes require a valid session cookie. There is currently no public REST API for third-party integrations.

## Route modules

Each entry below corresponds to a file in `routes/`. Endpoint details are documented within each source file.

| Module | File | Purpose | Auth |
|---|---|---|---|
| Authentication | `routes/auth.js` | Login, logout, register, reset, invite activation | Mixed |
| Appointments | `routes/appointments.js` | CRUD + status transitions | Session required |
| Practitioners | `routes/practitioners.js` | Practitioner management + availability | Session required |
| Patients | `routes/patients.js` | Aggregated patient records | Session required |
| Invoices | `routes/invoices.js` | Invoice CRUD + PDF | Session required |
| Payments | `routes/payments.js` | Payment recording | Session required |
| Recipes | `routes/recipes.js` | Prescription print logs | Session required |
| Reviews | `routes/reviews.js` | Review submission + visibility | Mixed |
| Waitlist | `routes/waitlist.js` | Waitlist enrolment + offer flow | Mixed |
| Practices | `routes/practices.js` | Practice settings, subscription state | Session required |
| Dashboard | `routes/dashboard.js` | Metrics for logged-in operator | Session required |
| Activity log | `routes/activity.js` | Read-only activity trail | Session required |
| Demo requests | `routes/demo.js` | Public onboarding flow | Public |
| Public read | `routes/public.js` | Practice profile + booking data | Public |
| Owner | `routes/owner.js` | Platform-owner dashboard (owner-only) | Owner session required |
| AI Practice Manager | `routes/ai-praxismanager.js` | LLM adapter calls | Session required |
| Invite redirect | `routes/invite-redirect.js` | Short-link redirect for invite tokens | Public |

## Authentication model

- **Session-based**, cookie-carried, `express-session` (in-memory store)
- Session cookie: `HttpOnly`, `Secure` (in production), `SameSite=Lax`
- Password hashing: bcrypt cost 12
- Rate limits on auth endpoints (login: 5 / minute; register: 3 / minute; forgot-password: 3 / minute)
- Owner-role check compares `req.session.userEmail` against `process.env.OWNER_EMAIL`

## Response conventions

- Success: `2xx` status with JSON payload
- Client error: `4xx` with `{ error: "message" }` shape
- Server error: `5xx` with `{ error: "message" }` shape (no stack traces to client in production)
- Anti-enumeration on login and forgot-password endpoints — same message for user-not-found and wrong-password

## CORS and cross-origin policy

- `cors` middleware configured with `origin: true, credentials: true`
- Intended usage is same-origin (browser → same host) — this configuration works for the current single-origin deployment
- Buyer should tighten CORS if opening a third-party API surface

## Rate limiting

- Custom rate limiter in `utils/rateLimit.js`
- Per-IP counter with a sliding window
- Applied to auth endpoints only; other endpoints are unthrottled at the application level
- Cloudflare provides an additional rate-limit layer at the edge (buyer configures)

## What is not exposed

- No public REST API for third-party integrations (documented as a Day-30+ roadmap item)
- No GraphQL layer
- No webhook subscription mechanism (documented as a possible add-on)
- No OAuth server (the platform is a first-party consumer of user credentials only)

## Endpoints that a buyer should test in the DD sandbox

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/health` | GET | Liveness probe (should return `200 OK` with `{status: "ok"}`) |
| `/api/auth/login` | POST | Auth smoke test |
| `/api/demo` | POST | End-to-end demo onboarding sanity check |
| `/js/pricing-config.js` | GET | Central pricing config sanity check |

## Missing documentation

> TODO — auto-generate OpenAPI 3.0 spec from route definitions. Recommended tool: `swagger-jsdoc` or similar. Effort estimate: one to two days of focused engineering.

---

**NDA classification:** Share after NDA
**Last updated:** 2026-07-07
**Document owner:** The seller
**Related documents:** [Technology Stack](./Technology_Stack.md), [Features](./Features.md), [Security](./Security.md)
