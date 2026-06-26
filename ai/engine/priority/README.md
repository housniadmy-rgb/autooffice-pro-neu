# Prioritäts-System

## Verantwortung

Bewertung und Reihung von Tasks und Workflows. Sorgt dafür, dass
kritische Themen vor optionalen sichtbar werden und der CEO einen
geordneten Überblick erhält.

## Scope

- Definition der Prioritätsstufen (`levels.json`)
- Regeln zur Ableitung der Priorität (`rules.md`)
- Berechnung einer numerischen Reihenfolge (Score)
- Markierung von Eskalationen für den Approval-Flow

## Nicht-Scope

- Keine Ausführung priorisierter Tasks
- Keine Override-Rechte gegenüber Approvals
- Kein Zugriff auf produktive App-Daten

## Eingaben

- Tasks (mit Metadaten: Owner, Tags, depends_on)
- Workflow-Policies
- Reports aus Security, QA und Monitoring (für Risiko-Signale)

## Ausgaben

- `priority` pro Task / Workflow (`critical|high|medium|low|info`)
- `priority_score` (Zahl) zur stabilen Sortierung
- Optionaler Hinweis `escalate: true`, wenn `requires_approval`
  zwingend erzwungen werden muss
