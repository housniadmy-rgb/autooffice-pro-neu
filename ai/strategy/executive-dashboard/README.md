# Executive Dashboard

## Verantwortung

Read-only Sicht für den CEO auf die strategische Lage:
**Heute / Diese Woche / Aktuelles Quartal**. Bündelt Themen,
Empfehlungen, Roadmap-Horizonte, KPI-Korridore, Top-Opportunities und
aktive Risiken.

## Scope

- Datenmodell des Executive Dashboards (`schema.json`)
- Drei feste Zeitfenster: `today`, `this_week`, `current_quarter`
- Reine Aggregation – kein Schreibpfad

## Nicht-Scope

- Kein Versand, kein E-Mail-Report
- Keine Aktion ohne menschliche Freigabe
- Keine Mutation der Quell-Datensätze
- Keine externe Veröffentlichung

## Eingaben

- Strategy Snapshot (`../strategy-engine`)
- Roadmap-Einträge nach Horizont (`../roadmap`)
- Top-Opportunities (`../opportunities`)
- KPI-Korridore und Owner (`../kpi`)
- Aktive Risiken nach Severity (`../risk`)
- Daily Digest und Health Score aus Phase 9 (`ai/ops/digest`,
  `ai/ops/health`)

## Ausgaben

- Dashboard-Objekt gemäß `schema.json`
- Drei Sektionen (`today`, `this_week`, `current_quarter`) mit jeweils:
  Headline, Empfehlungen, Roadmap-Stand, KPI-Highlights,
  Risiko-Hervorhebungen

## Verhältnis zu Phase-7-Dashboard

| Dimension               | CEO-Dashboard (Phase 7) | Executive Dashboard (Phase 10) |
| ----------------------- | ----------------------- | ------------------------------ |
| Zeitfenster             | „Jetzt“ (operativ)      | Heute / Woche / Quartal        |
| Inhalt                  | Queue, Approvals, Health| Themen, KPIs, Roadmap, Risiken |
| Beziehung zur Engine    | konsumiert Ops-State    | konsumiert Strategy-State      |
| Aktion                  | keine                   | keine                          |

Die beiden Dashboards **ersetzen sich nicht**, sie ergänzen sich. Der
operative Blick aus Phase 7 zeigt „was passiert gerade“, der
strategische Blick aus Phase 10 zeigt „woran arbeiten wir warum“.
