# CEO Daily Digest

## Verantwortung

Tagesaktuelle Zusammenfassung für den CEO. Bündelt Queue, Ausführungen
des Tages, Health Score, offene Freigaben, Highlights aus dem CEO
Event Feed und Audit-Auffälligkeiten zu einem read-only Snapshot.

## Scope

- Datenmodell des Digest (`schema.json`)
- Tageszuschnitt (`date`-basiert, UTC)
- Konsolidierte Empfehlung – als Vorschlag, niemals als Aktion

## Nicht-Scope

- Kein Versand (kein E-Mail, kein Slack, kein Webhook)
- Keine Aktion ohne menschliche Freigabe
- Keine Mutation der Quell-Datensätze
- Keine externe Veröffentlichung

## Eingaben

- `ai/ops/queue` – aktueller Stand
- `ai/ops/execution` – Ausführungen des Tages
- `ai/ops/history` – abgeschlossene Tasks des Tages
- `ai/ops/health` – jüngster Health-Snapshot
- `ai/engine/approvals` – offene Freigaben (`pending`)
- `ai/hub/ceo-feed` – Top-Einträge des Tages

## Ausgaben

- Digest-Objekt gemäß `schema.json`
- Konsumiert vom CEO-Dashboard (`ai/engine/dashboard`) und vom
  menschlichen CEO

## Generierungs-Trigger

In Phase 9: ausschließlich **manuell** auslösbar. Auch wenn die
Generierung später zeitbasiert geplant wird, bleibt der Digest selbst
ein read-only Artefakt und versendet sich nicht.
