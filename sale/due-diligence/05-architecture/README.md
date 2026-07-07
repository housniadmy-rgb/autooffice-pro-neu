# 05 — Architecture

## Purpose

Visual and structural documentation of how the system is put together — the level a technical evaluator uses to spot design flaws, scaling risks, and integration surface.

## Files that will be added

- `system-diagram.png` — end-to-end topology (browser → Cloudflare → Render → Brevo → LLM adapter)
- `system-diagram.mmd` — Mermaid source for the diagram (so buyer can regenerate)
- `database-schema.md` — 18-table schema documentation, foreign keys, indexes, migration approach
- `database-schema.svg` — ER-diagram
- `api-surface-inventory.md` — every endpoint documented: path, method, auth, request/response shape, rate limit
- `data-flow-demo-onboarding.md` — worked example of the demo → invite → activation flow with sequence diagram
- `security-model.md` — authentication, authorisation, secret management, threat model, defence-in-depth items done / deferred
- `multi-tenancy-model.md` — how `practice_id` row-level tenancy is enforced across every table and route

## NDA classification

**Share after NDA.** Same reasoning as section 04 — architecture-level detail is competitive information. Provided upon signed NDA.

## Reader notes

- Diagrams should be exportable to PDF at 300 DPI without loss — Mermaid source ensures regeneration.
- The security model is defence-in-depth-oriented but transparently notes the gaps: no CSRF, no CSP header, no 2FA — a 2–3 day security hardening sprint is documented as the buyer's recommended first action.
- Multi-tenancy is enforced at the query layer, not via row-level security (RLS) or separate schemas. This is a design trade-off appropriate for the target scale (~200 practices), and a Postgres migration path with RLS is documented for higher scale.
