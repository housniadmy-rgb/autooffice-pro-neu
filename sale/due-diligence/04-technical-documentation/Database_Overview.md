# PraxisOnline24 — Database Overview

## Purpose

Storage engine, schema shape, and multi-tenancy model documentation for the buyer's technical evaluator.

## Executive summary

PraxisOnline24 uses **SQLite via `sql.js` 1.12**, loaded into memory at process start and synchronously flushed to `data/praxisonline24.db` on every write. **Approximately 18 tables** implement the domain model. Multi-tenancy is enforced at the row level via `practice_id` foreign keys across every tenant-scoped table.

## Storage engine

- **Engine:** SQLite via `sql.js` (SQLite compiled to WebAssembly)
- **File:** `data/praxisonline24.db`
- **Load pattern:** entire database loaded into Node process memory at boot; disk flush after each mutation
- **Concurrency:** single Node process assumption; multi-process would require external synchronisation
- **Backups:** automated daily copy to `data/backups/` via cron job; buyer should mirror off-server

## Scaling ceiling

- Approximately **200 practices** at current architecture
- Beyond that: memory footprint of the entire dataset grows; multi-process safety becomes a concern
- Migration path to PostgreSQL is documented in `10-roadmap/Product_Roadmap.md`; estimated 2–3 weeks of engineering work

## Schema highlights

| Table | Purpose | Row-level tenant key |
|---|---|---|
| `practices` | Practice records | Primary key (`id`) |
| `users` | User accounts (staff, owners) | `practice_id` |
| `practitioners` | Named practitioners for a practice | `practice_id` |
| `patients` (or embedded) | Patient records embedded in `appointments` / `waitlist` / `invoices` (no standalone table) | `practice_id` |
| `appointments` | Scheduled and completed appointments | `practice_id` |
| `waitlist` | Patients waiting for a slot | `practice_id` |
| `waitlist_offers` | Time-limited offers issued to waitlisted patients | Via `waitlist_id` |
| `reviews` | Post-appointment reviews | `practice_id` |
| `invoices` | Invoices with line items | `practice_id` |
| `payments` | Payment records against invoices | Via `invoice_id` |
| `recipe_print_logs` | Prescription printout audit trail | `practice_id` |
| `settings` | Per-practice key/value settings | `practice_id` |
| `automation_log` | Cron-job execution audit | Global |
| `activity_log` | User-action audit trail | `practice_id` (nullable) |
| `password_reset_tokens` | Time-limited reset tokens | Via `user_id` |
| `invite_tokens` | Onboarding invite tokens | Via `user_id` |
| `practitioner_availability` | Weekly availability windows | Via `practitioner_id` |
| `demo_requests` | Public demo request log | Anonymised after 30 days |

> TODO — buyer's technical evaluator to confirm this table list against the `CREATE TABLE` statements in `database.js` at DD stage; expected total is 18.

## Multi-tenancy model

- **Row-level.** Every tenant-scoped table has a `practice_id` foreign key that must be included in every query filter.
- **Enforcement:** query layer only — not database-level row security. Requires careful code review to ensure no query omits the tenant filter.
- **Alternative considered and rejected:** separate SQLite files per practice (operational complexity), Postgres row-level security (out of scope for current scale).

## Migrations

- Migrations are **additive `ALTER TABLE` statements** wrapped in try/catch, executed on every startup
- No down-migrations (deliberately — a rollback would risk data loss)
- Schema version is not tracked in a `schema_migrations` table; deltas are inferred from `database.js` code

> TODO — buyer's technical evaluator to confirm this migration model matches their operational expectations. Adding a proper migration tool (e.g. `umzug` or `knex` migrations) is a possible early roadmap item.

## Privacy-by-design decisions

The schema **deliberately does not store**:

- Clinical data (diagnoses, medications, treatment notes)
- Dates of birth
- Insurance / national health identifiers
- Payment card numbers
- Government ID numbers

This narrows the GDPR compliance surface and reduces breach-notification obligations.

## Foreign key enforcement

- `PRAGMA foreign_keys = ON` set on connection open
- Cascade behaviour is not aggressive — most `DELETE` operations are soft (`active = 0` flag) rather than physical
- > TODO — buyer to audit for cases where soft-delete leaves orphaned children

## Anonymisation and retention

- Demo requests older than 30 days are anonymised via cron
- Appointment history is retained indefinitely at present
- Invoice records are retained per statutory retention periods (buyer must configure for their jurisdiction)

## Buyer verification steps

- Run `sqlite3 data/praxisonline24.db ".schema"` after cloning and installing
- Compare table count against the "approximately 18" claim
- Inspect indexes with `.indexes` command
- Verify `PRAGMA foreign_keys` returns `1`

---

**NDA classification:** Share after NDA
**Last updated:** 2026-07-07
**Document owner:** The seller
**Related documents:** [Technology Stack](./Technology_Stack.md), [Security](./Security.md), [System Architecture](../05-architecture/System_Architecture.md)
