# Decision Engine

## Verantwortung

Regelbasiertes Routing eingehender Events. Beantwortet eine einzige
Frage: „Welche Aktionen sollen für dieses Event angestoßen werden?“
Die Antworten sind in dieser Phase ausschließlich **Vorschläge an
andere Module**, niemals direkte Ausführungen.

## Scope

- Regel-Schema (`schema.json`)
- Initialer Regelsatz (`rules.json`)
- Definierte Aktionstypen (siehe unten)
- Auswertungsreihenfolge und Konflikthandhabung

## Nicht-Scope

- **Keine KI-Entscheidungen** in dieser Phase (keine LLM-Calls,
  keine ML-Modelle)
- Keine direkte Ausführung von Tasks
- Kein Versand von Notifications
- Kein Schreibzugriff auf produktive App-Daten

## Eingaben

- Normalisierte Events aus dem Event Hub
- Lookup-Ergebnisse aus der Knowledge Base (optional)

## Ausgaben

- Liste von Aktionsvorschlägen pro Event:
  - `create_task` – Anlage in `ai/engine/tasks`
  - `request_approval` – Aufnahme in `ai/engine/approvals`
  - `notify` – Aufnahme als `pending` in `ai/hub/notifications`
  - `append_feed` – Spiegelung in `ai/hub/ceo-feed`
  - `consult_kb` – KB-Lookup mit Query (nur Lese-Vorgang)
  - `noop` – bewusst keine Aktion

## Auswertungsmodell

1. Alle aktiven Regeln werden geprüft.
2. Eine Regel `matched`, wenn alle Bedingungen erfüllt sind.
3. Die Aktionen aller `matched` Regeln werden zusammengeführt.
4. Konflikte (z. B. `noop` neben `create_task`) werden zugunsten der
   spezifischeren Regel aufgelöst (höhere `specificity`).
5. Ausgabe ist ein deterministischer, geordneter Aktionsplan.

## Bedingungen, die eine Regel prüfen darf

- `event.type` (exakt oder Präfix `security.*`)
- `event.severity` (Vergleich)
- `event.source.kind` / `event.source.id`
- `event.tags` (enthält)
- `payload.<feld>` (einfache Gleichheit)

Komplexere Bedingungen (Schwellwertfenster, Aggregationen, Korrelationen
über Zeit) sind ausdrücklich für eine spätere Phase vorgesehen.
