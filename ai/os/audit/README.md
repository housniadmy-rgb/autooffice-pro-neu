# Audit

## Verantwortung

Plattformweites, append-only Protokoll aller relevanten Entscheidungen
und Lifecycle-Ereignisse. Audit ist die **Wahrheitsquelle** für
„was ist auf der Plattform passiert, wer hat es ausgelöst, mit welchem
Effekt, gegen welche Permissions?“. Es ergänzt das fachliche
`ai/ops/audit` (Phase 9) um eine **plattform-tiefere** Sicht und löst
es nicht ab.

## Scope

- Datenmodell für Audit-Einträge (`schema.json`)
- Liste der pflichtmäßig auditierten Ereignisse (`events.md`)
- Append-only Garantien
- Verkopplung mit Permissions, Registry, Router

## Nicht-Scope

- Keine Implementierung eines Storage-Backends
- Keine Anbindung an externes SIEM
- Keine Lösch- oder Edit-API – Korrekturen sind ausschließlich
  zusätzliche Einträge mit `kind: correction`
- Keine PII-Speicherung; nur IDs, Klassifikatoren und Referenzen

## Audit-Eintrag

Pflichtfelder eines Eintrags:

- `id` – `audit_<ulid>`
- `ts` – ISO-Timestamp
- `kind` – siehe `events.md`
- `actor` – `agent_id` oder Mensch (`human_ceo`)
- `subject` – betroffene Entität (Agent, Route, Permission, …)
- `action` – die durchgeführte Aktion (z. B. `register`, `forward`,
  `deny`, `grant`)
- `outcome` – `allowed`, `denied`, `success`, `failure`,
  `dryrun_success`, `dropped`
- `trace_id`, `correlation_id` – aus dem Bus-Envelope übernommen
- `details` – strukturierte, kompakte Zusatzdaten (kein Payload-Dump)

Optional: `previous_hash`, `entry_hash` für eine spätere
Hash-Chain (Forensik).

## Pflicht-Ereignisse (Auszug, vollständig in `events.md`)

- Registry: `agent.registered`, `agent.activated`, `agent.retired`
- Permissions: `permission.denied`, `permission.granted`,
  `permission.bound`, `role.created`
- Router: `route.matched`, `route.dropped`, `route.added`
- Scheduler: `scheduler.tick.emitted`, `scheduler.tick.skipped`
- Memory: `memory.written:shared`, `memory.deleted` (durch Backend)
- Bus: `bus.message.rejected` (z. B. unbekanntes Topic)
- Gateway: `gateway.request.received` (nur zukünftig)

## Retention

- Default: `unlimited` (append-only)
- Komprimierung/Archivierung ist später möglich, ohne Einträge zu
  ändern – Archive sind separate Sinks.
- Spätere Phasen können `retention_class` einführen (z. B.
  `legal_hold`).

## Erweiterungspunkte

- Hash-Chain (`previous_hash` ↔ `entry_hash`)
- Externe Sinks: Datei, SQLite, Postgres, S3-WORM, externes SIEM
- Strukturierte Suche per `actor`, `kind`, `subject`, `correlation_id`
- Korrektur-Einträge (`kind: correction`) verlinken via
  `corrects: audit_<id>`

## Sicherheit

- Schreiben: nur Agenten mit Permission `write:audit`
- Lesen: nur Agenten mit `read:audit` (CEO, Observer, Dashboard API)
- Es existiert **keine** Lösch-/Edit-Aktion
- Audit-Einträge enthalten weder Secrets noch PII
