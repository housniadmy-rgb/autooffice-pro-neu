# Workflow Manager

## Verantwortung

Verkettung mehrerer Tasks zu einem geordneten Ablauf. Workflows
ermöglichen abteilungsübergreifende Koordination, ohne dass eine
einzelne Abteilung Ausführungsrechte über eine andere bekommt.

## Scope

- Datenmodell für Workflow-Definitionen (`schema.json`)
- Beispielhafte Workflow-Skizzen (`examples.md`, nicht ausführbar)
- Abhängigkeits- und Reihenfolgelogik (sequential / parallel / fan-in)
- Übergabe einer Workflow-ID an alle enthaltenen Tasks

## Nicht-Scope

- Keine Ausführung von Schritten
- Kein Scheduling, kein Cron
- Keine Anbindung an Queues, MQ oder externe Trigger
- Kein Schreibzugriff auf produktive App-Daten

## Eingaben

- Tasks mit `workflow_id`
- Reports und Status-Snapshots der Abteilungen

## Ausgaben

- Workflow-Definitionen (Markdown/JSON, dokumentarisch)
- Abgeleitete Task-Liste mit `depends_on`-Beziehungen

## Struktur eines Workflows

- `id` – stabile Workflow-Kennung
- `name` – sprechender Name
- `trigger` – nur `manual` in dieser Phase erlaubt
- `steps[]` – geordnete Schrittfolge, jeweils mit `owner`,
  `task_template`, `requires_approval`
- `policy` – global geltende Regeln (z. B. Pflicht-Approval vor jedem
  Schritt mit Außenwirkung)

Workflows werden niemals automatisch gestartet. Selbst `trigger: manual`
benötigt eine explizite menschliche Auslösung in einer späteren Phase.
