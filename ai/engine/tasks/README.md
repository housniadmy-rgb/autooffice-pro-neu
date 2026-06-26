# Task Manager

## Verantwortung

Erfassung und Lebenszyklus einzelner Arbeitseinheiten der AI Company.
Ein Task ist die kleinste koordinierbare Einheit – z. B. „SEO-Audit der
Friseur-Landingpage erstellen“, „QA-Lauf gegen Buchungsformular“,
„Pricing-Bericht erzeugen“.

## Scope

- Datenmodell für Tasks definieren (`schema.json`)
- Lebenszyklus-Zustände beschreiben (`states.md`)
- Eindeutige IDs, Owner-Abteilung, Zielartefakte vorgeben
- Verknüpfung zu Workflows und Approvals vorsehen

## Nicht-Scope

- Keine Persistenz, keine Ausführung
- Keine direkte Anbindung an die SQLite-Datenbank der App
- Keine externen Notifications

## Eingaben

- Abteilungen aus `ai/` (Owner)
- Reports und Empfehlungen anderer Abteilungen (als Auslöser)

## Ausgaben

- Tasks als JSON-Objekte gemäß `schema.json`
- Statusänderungen entlang der State-Machine in `states.md`

## Wichtige Felder

- `id` – stabile Kennung (`task_<slug>_<timestamp>`)
- `owner` – Abteilung aus `ai/` (z. B. `seo`, `qa`, `cto`)
- `workflow_id` – optionaler Bezug zu einem Workflow
- `priority` – wird vom Prioritäts-System gesetzt, nicht von der Abteilung
- `requires_approval` – steuert, ob der Approval-Flow ausgelöst wird
- `state` – siehe `states.md`
- `artifacts` – Pfade zu Reports/Outputs (read-only, dokumentarisch)
