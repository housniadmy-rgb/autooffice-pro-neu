# Policy Engine

## Verantwortung

Klassifizierung jeder Operation in `safe` oder `critical` und
Vorgabe der Sicherheitsregeln. Die Policy Engine ist das Gate vor dem
Execution Manager und das Bindeglied zum Approval-Flow aus Phase 7.

## Scope

- Datenmodell einer Policy (`schema.json`)
- Initialer Policy-Satz (`policies.json`)
- Definition, wann Operationen als `critical` gelten
- Auflösung der Frage „Wer darf was, und unter welcher Bedingung?“

## Nicht-Scope

- Keine eigenständige Freigabe – die Engine **fordert** Freigaben an,
  erteilt sie aber nie selbst
- Keine Modifikation produktiver Daten
- Keine LLM-Entscheidungen

## Eingaben

- Queue-Einträge mit zugehörigem Task (Owner, Tags, geplante Effekte)
- Klassifikationssignale aus Hub (z. B. Security-Events mit hoher
  Severity)

## Ausgaben

- `policy_class` (`safe | critical`) auf dem Queue-Eintrag
- Bei `critical`: automatische Anlage eines Approval-Requests in
  `ai/engine/approvals` mit `requested_by` der Owner-Abteilung und
  `decided_by` reserviert für den CEO
- Audit-Eintrag pro Klassifikationsentscheidung

## Klassifikationsmatrix

| Bedingung                                                | Klassifikation |
| -------------------------------------------------------- | -------------- |
| Geplante Effekte enthalten `config_propose` mit Deploy   | `critical`     |
| Geplante Effekte enthalten `notification_propose` extern | `critical`     |
| Owner ist `security` und `priority >= high`              | `critical`     |
| Owner ist `finance` und Pricing/Tarif berührt            | `critical`     |
| Owner ist `operations` und Release/Deployment berührt    | `critical`     |
| Tag `compliance` oder `dsgvo`                            | `critical`     |
| Nur read-only Reports / KB-Vorschläge                    | `safe`         |
| Alles übrige (Default)                                   | `critical`     |

Der Default ist bewusst **konservativ**: alles, was nicht eindeutig als
read-only nachgewiesen ist, gilt als `critical` und braucht CEO-Freigabe.
