# Risk Manager

## Verantwortung

Strategisches Risiko-Register: identifizierte Risiken, ihre
Wahrscheinlichkeit, Wirkung, Owner, Gegenmaßnahmen und Status. Speist
die Strategy Engine mit Risiko-Signalen und das Executive Dashboard
mit der aktuellen Risikolage.

## Scope

- Datenmodell eines Risiko-Eintrags (`schema.json`)
- Bewertungsmatrix (`matrix.md`)
- Statusmodell und Review-Kadenz
- Verknüpfung zu Themen, Roadmap, KPIs

## Nicht-Scope

- Keine operative Behebung von Vorfällen – das passiert über
  `ai/engine/tasks` und `ai/ops/queue`
- Keine externen API-Calls
- Keine Compliance-Audits gegen produktive Daten

## Eingaben

- Security-Befunde (`ai/security`, Hub-Events `security.*`)
- Monitoring-Signale (`ai/monitoring`, Hub-Events
  `monitoring.health.degraded`)
- Compliance-/DSGVO-Themen
- Marktbeobachtungen aus dem Opportunity Scanner (Wettbewerb)

## Ausgaben

- Risiko-Einträge gemäß `schema.json`
- Sammelobjekt für Executive Dashboard
- Eingaben für Strategy Engine (Empfehlungen, wenn Severity steigt)

## Status

| Status     | Bedeutung                                                  |
| ---------- | ---------------------------------------------------------- |
| `open`     | Identifiziert, Gegenmaßnahmen offen                        |
| `mitigating` | Gegenmaßnahmen laufen                                    |
| `monitoring` | Restrisiko wird beobachtet                               |
| `accepted` | Bewusst akzeptiert, mit Begründung                         |
| `closed`   | Risiko ist nicht mehr relevant                             |

Reviews sind im Eintrag mit `last_reviewed_at` und `review_cadence`
angegeben. Versäumte Reviews fallen in Tagesempfehlungen auf.
