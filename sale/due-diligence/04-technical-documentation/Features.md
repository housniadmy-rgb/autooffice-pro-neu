# PraxisOnline24 — Features

## Purpose

Feature-by-feature inventory of the platform, grouped by user-facing area. Each feature listed here is implemented and reachable in the running application.

## Executive summary

PraxisOnline24 is a **complete practice management SaaS** covering appointment scheduling, patient management, invoicing, review workflow, and an LLM-backed operational assistant. Twelve fully translated locales. Multi-tenant at the row level.

## Appointment management

- Day / week / month calendar views
- Per-practitioner availability windows
- Appointment types (initial consultation, follow-up, physiotherapy, custom)
- Duration in 15-minute increments
- Status workflow: scheduled → confirmed → completed → cancelled
- **Waitlist auto-offer** — when a slot opens, notify next in queue via email with a time-limited token
- **Patient self-cancellation** — token-based cancel link in confirmation email, no patient login required
- **Practitioner reassignment** via drag-and-drop or edit dialog
- Recurring appointment support (weekly / monthly)
- Timezone-aware timestamps

## Patient management

- Lightweight patient records (name, email, phone, notes)
- **Deliberately no clinical data** — no diagnoses, medications, dates of birth or insurance numbers stored
- Appointment history per patient
- Search by name, email, phone
- Export to CSV
- 30-day anonymisation cron for demo requests that never converted

## Practitioner management

- Multi-practitioner practice support
- Availability windows per weekday
- Specialty and biography fields for public profile
- Active / inactive toggle without deletion

## Invoicing

- PDF invoice generation via `pdfkit`
- Line-item structure with description, quantity, unit price
- VAT / tax rate configurable per invoice
- Payment tracking with status (draft / sent / paid / overdue)
- Automated payment reminders via cron
- Invoice numbering with configurable prefix

## Recipe / prescription print logs

- Audit trail for every prescription printout
- Attributed to practice, practitioner, patient and timestamp
- Read-only after creation (GDPR-conscious immutable record)

## Reviews

- Post-appointment automated review request emails
- Star rating + optional comment
- Opt-in publishing to public practice profile
- Practitioner-level rating aggregation

## Public practice profile + online booking

- One page per practice at `/practice/:slug` or `/practice.html?id=:id`
- Displays practitioners, specialties, opening hours, reviews
- Direct-to-booking flow without patient account creation
- Waitlist enrolment for full slots

## Demo onboarding flow

- Public demo request form at `/demo.html`
- Server creates practice + user + invite token synchronously
- Fires three emails in order: admin notification, practice confirmation, activation
- Activation link sets password and starts 30-day trial
- Multilingual throughout

## AI Practice Manager

- Daily briefing (idle chairs, upcoming appointment density, overdue invoices)
- Capacity warnings
- Recommended actions based on live practice data
- LLM adapter is swappable: buyer-provided Claude or OpenAI API key
- Positioned as differentiator; upsell candidate for higher tier

## Multi-language support

- 12 UI languages: DE, EN, FR, ES, PT, AR (RTL), TR, RU, ZH, HI, TH, ID
- 12-language email templates for every transactional email
- Language cookie + explicit URL parameter override
- Centralised in `utils/emailLocales.js` and `public/js/public-i18n.js` — one file change per string

## Owner / operator dashboard

- Cohort metrics (practices by tier, active vs inactive)
- MRR calculation from central pricing config
- Practice distribution across packages
- Executive timeline with recent events
- Owner-role gated

## Authentication and account management

- Email + password login with bcrypt (cost 12)
- Rate limiting on auth endpoints (5 login attempts / minute, 3 register / minute)
- Password reset via email link (time-limited token)
- Invite-token onboarding for new users
- Password visibility toggle on set-password screen
- Session cookies: HttpOnly, Secure, SameSite=Lax in production

## Cron-scheduled operations

Eight scheduled jobs (documented in `utils/cron.js`):
- Appointment reminders (day before)
- Review requests (after appointment completion)
- Trial reminders (5, 1, 0 days before expiry)
- Waitlist offer generation
- Database backup (copy to `data/backups/`)
- Anonymisation of demo requests older than 30 days
- > TODO — audit remaining two cron jobs from `utils/cron.js` and add here

## Features designed but not activated

- Stripe checkout integration (code path present, disabled by default; enabling is approximately two hours)
- Native mobile app (web is responsive PWA-friendly; no native shell yet)
- Two-factor authentication (documented gap; recommended Day-30 addition)
- Formal API for third-party integrations

## Features explicitly excluded (privacy-by-design decision)

- Clinical data storage (diagnoses, medications, treatment plans)
- Date of birth
- Insurance / national health identifier storage
- Payment card storage (Stripe would handle this when activated)

---

**NDA classification:** Share after NDA
**Last updated:** 2026-07-07
**Document owner:** The seller
**Related documents:** [Technology Stack](./Technology_Stack.md), [API Overview](./API_Overview.md), [Business Model](../02-investment-report/Business_Model.md)
