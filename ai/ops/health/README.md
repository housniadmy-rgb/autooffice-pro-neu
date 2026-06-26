# Health Score

## Verantwortung

Aggregierte Plattform-Gesundheit als einzelne Zahl und als
strukturierte Auflistung der Teilfaktoren. Liefert dem CEO Daily
Digest und dem Phase-7-Dashboard einen sofort lesbaren
Gesundheitsstatus der AI Company.

## Scope

- Datenmodell des Health Score (`schema.json`)
- Berechnungsformel und Gewichte (`formula.md`)
- Trennung zwischen Score (Zahl) und Komponenten (Teilfaktoren)

## Nicht-Scope

- Kein Schreibzugriff auf andere Module – der Score ist **abgeleitet**
- Keine direkten Aktionen, keine Notifications
- Keine Schwellwert-Eskalation außerhalb des Digest

## Eingaben

- Queue-Tiefe und Wartezeiten (`ai/ops/queue`)
- Erfolgsrate aktueller Ausführungen (`ai/ops/execution`)
- Anzahl offener kritischer Tasks und offener Approvals
  (`ai/engine/tasks`, `ai/engine/approvals`)
- Severity-Profil im CEO Event Feed (`ai/hub/ceo-feed`)
- Audit-Log-Auffälligkeiten (`ai/ops/audit`)

## Ausgaben

- `score` (0..100), `tier` (`healthy | watch | degraded | critical`)
- Komponenten-Werte mit Beitrag zum Score
- Generierungszeitpunkt

## Verhältnis zum CEO Dashboard

Das Dashboard liest den Health Score **read-only** und stellt
ausschließlich die letzte Version dar. Historisierung erfolgt durch
neue Snapshots, nicht durch Mutation existierender Werte.
