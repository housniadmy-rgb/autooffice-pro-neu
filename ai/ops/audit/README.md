# Audit Log

## Verantwortung

Unveränderliches, append-only Protokoll aller Entscheidungen,
Klassifikationen, Distributionen, Ausführungs-Übergänge und
Approval-Aktionen innerhalb der Ops-Platform.

## Scope

- Datenmodell eines Audit-Eintrags (`schema.json`)
- Verbindliche Logging-Pflicht (`policy.md`)
- Korrelation über `correlation_id` (z. B. Task-/Queue-ID)
- Hash-Kette als Spezifikation für Manipulationssicherheit

## Nicht-Scope

- Keine Mutation oder Löschung von Einträgen
- Keine Schreibrechte aus externen Systemen
- Keine Anzeige von Inhalten gegenüber Endkunden
- Keine produktive Persistenz in dieser Phase

## Eingaben

- Operations Queue (Distribution, Slot-Belegung, Re-Queueing)
- Policy Engine (Klassifikationsentscheidung, Approval-Request)
- Execution Manager (Statusübergänge, Idempotenz-Treffer)
- Approval-Flow aus Phase 7 (`approved | rejected | expired | withdrawn`)

## Ausgaben

- Audit-Einträge gemäß `schema.json`
- Eingaben für Health Score (`audit_anomalies`)
- Begründungsbasis für CEO Daily Digest und CEO-Dashboard
