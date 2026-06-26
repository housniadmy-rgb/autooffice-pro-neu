# Dashboard API

## Verantwortung

Spezifikation einer **read-only** Aggregations-Schicht über alle
Phasen-Daten. Die Dashboard API definiert, **welche Views es gibt**,
**welche Felder sie zurückgeben** und **welche Quellen sie konsumieren**.
Sie ist die Grundlage für UI-Anbindungen in späteren Phasen.

In Phase 11 wird **kein Endpoint** implementiert. Es entstehen
ausschließlich View-Definitionen.

## Scope

- Datenmodell für View-Spezifikationen (`schema.json`)
- Initialer View-Katalog (`endpoints.json`)
- Konvention für Sortierung, Paginierung, Caching
- Read-only-Garantien

## Nicht-Scope

- Keine HTTP-Endpunkte, keine Implementierung
- Keine Schreiboperationen
- Keine Authentifizierung (delegiert an spätere Gateway-Phase)
- Keine direkte SQL-/DB-Anbindung

## Views (Auszug)

| View                            | Quelle(n)                                                    | Zielgruppe |
| ------------------------------- | ------------------------------------------------------------ | ---------- |
| `view_ceo_today`                | `ai/ops/digest`, `ai/ops/health`, `ai/hub/ceo-feed`           | CEO        |
| `view_engine_operational`       | `ai/engine/tasks`, `ai/engine/workflows`, `ai/engine/approvals` | CEO/Engine |
| `view_strategy_executive`       | `ai/strategy/kpi`, `ai/strategy/roadmap`, `ai/strategy/risk`  | CEO        |
| `view_platform_health`          | `ai/ops/health`, `ai/os/audit`, `ai/os/agent-registry`        | Observer   |
| `view_audit_recent`             | `ai/os/audit`, `ai/ops/audit`                                 | CEO/Observer |
| `view_agents_directory`         | `ai/os/agent-registry`                                        | Observer   |
| `view_permissions_matrix`       | `ai/os/permissions`                                           | OS Admin   |

## Konventionen

- Default `pageSize` = 50, max. 200
- Sortierung default `desc` nach `updated_at`/`ts`
- Cache-Hint per View (`cache_seconds` – Spezifikation, kein TTL-Code)
- Felder enthalten **keine** Secrets oder PII; bei Bedarf nur
  Referenz-IDs

## Erweiterungspunkte

- Filter-Spezifikation pro View (z. B. `area`, `criticality`)
- Streaming/Server-Sent-Events für Live-Views
- Pagination-Modi (`offset`, `cursor`)
- Federated Views, die mehrere Quellen joinen

## Sicherheit

- Default-Sichtbarkeit: `internal`
- Jede View benötigt eine zugeordnete Permission (`read:dashboard:<view>`)
- Read-only Hartgrenze – keine View mutiert Daten
- Externe Exposition ausschließlich durch das (deaktivierte)
  API Gateway
