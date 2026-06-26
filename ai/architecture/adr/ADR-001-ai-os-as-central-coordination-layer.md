# ADR-001 – AI OS als zentrale Koordinationsschicht

## Status

Accepted (2026-06-26)

## Kontext

Die AI Company ist in mehreren Phasen gewachsen:

- Phase 6 – Abteilungen (`ai/<dept>`): fachliche Stimmen (CEO, CTO,
  QA, SEO, Marketing, Sales, Support, Finance, Security, Monitoring,
  Operations).
- Phase 7 – Automation Engine (`ai/engine/*`): Tasks, Workflows,
  Priority, Approvals, Dashboard, Status.
- Phase 8 – Event & Intelligence Hub (`ai/hub/*`): Event Hub, Registry,
  Knowledge Base, Decision Engine, Notifications, CEO Feed.
- Phase 9 – Autonomous Operations Platform (`ai/ops/*`): Queue,
  Execution, Policy, Health, Digest, History, Audit.
- Phase 10 – Strategic Intelligence Platform (`ai/strategy/*`):
  Strategy Engine, Roadmap, Opportunities, KPI, Risk, Executive
  Dashboard.

Ohne eine gemeinsame Plattform-Schicht entstehen:

- doppelte Verantwortlichkeiten (zwei Audits, zwei Routing-Layer,
  drei Dashboards, vier CEO-Sichten),
- inkonsistente Identitäten (kein gemeinsamer `agent_id`-Begriff),
- ad-hoc Kommunikation zwischen Modulen (direkte Imports statt
  vertraglich gebundener Nachrichten),
- keine einheitliche Berechtigungslogik,
- keine plattformweite Audit-Wahrheit.

Architekturreview hat diese Risiken bestätigt.

## Entscheidung

Wir führen das **AI Operating System** (`ai/os/*`) als zentrale,
querschneidende Koordinationsschicht ein. Es bietet:

- **Agent Registry** – einzige Identitätsquelle für alle Module.
- **Message Bus** – einheitlicher Envelope für Pub/Sub.
- **Event Router** – deklaratives Transport-Routing.
- **Scheduler** – deklarative Zeit- und Trigger-Definitionen.
- **Memory** – getrennte Scopes (`agent`/`department`/`shared`/
  `workflow`).
- **Permissions** – Default-Deny RBAC `action:resource:scope`.
- **Audit** – Append-only Plattform-Protokoll.
- **Dashboard API** – read-only Aggregations-Schicht (Spezifikation).
- **API Gateway** – externer Einstiegspunkt, in dieser Phase
  deaktiviert.

Das AI OS **ersetzt keine bestehende Phase**, sondern definiert die
Plattform, auf der sie sich vertraglich anschließen.

## Konsequenzen

Positiv:

- Eine gemeinsame Sprache (Identität, Topics, Permissions, Audit) für
  alle Phasen.
- Neue Agenten lassen sich rein deklarativ ergänzen
  (Registry + Permissions-Binding), ohne andere Module zu berühren.
- Klare Skalierungspfade für Bus-Transport, Scheduler-Backend,
  Memory-Stores und externe Integrationen.
- Sicherheits- und Beobachtbarkeits-Mechanismen werden zentralisiert
  und sind nicht mehr je Phase neu zu erfinden.

Negativ / zu tragen:

- Zusätzliche Indirektion (Bus statt direkter Methoden-Calls).
- Mehr deklarative Artefakte (Schemas, Kataloge) – Pflege-Aufwand
  steigt.
- Bestehende Phasen müssen sich später an die Plattform-Verträge
  anpassen (Schreib-Wege auf den Audit, Topic-Konvention auf dem Bus).

Folge-Entscheidungen:

- ADR-002: Approval-Flow als Pflicht für kritische Aktionen.
- ADR-003: Externe Integrationen starten read-only.
- ADR-004: Audit-Layer ist append-only.
- ADR-005: Keine Secrets, keine PII im AI OS.
- ADR-006: Versionierte Read-Models pro Sektion für das Dashboard.
