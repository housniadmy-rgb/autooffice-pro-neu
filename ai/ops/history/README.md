# Task History

## Verantwortung

Read-only Verlauf abgeschlossener Tasks und Ausführungen. Ermöglicht
Trendanalyse, Wiederholungserkennung und Begründung von
CEO-Entscheidungen anhand vergangener Vorgänge.

## Scope

- Datenmodell eines History-Eintrags (`schema.json`)
- Verlinkung zu Queue-, Execution-, Approval- und Feed-Datensätzen
- Unveränderlichkeit nach Erzeugung

## Nicht-Scope

- Keine Mutation existierender Einträge
- Keine Löschung – Archivierung nur über Markierung in späterer Phase
- Keine produktive Datenanbindung

## Eingaben

- Abschluss eines Execution-Datensatzes
  (`completed | failed | rejected | cancelled`)
- Endgültige Ablehnung über Approval (`rejected`)
- Endgültiger Abbruch durch Owner (`cancelled`)

## Ausgaben

- History-Einträge gemäß `schema.json`
- Aggregierte Sichten für CEO Daily Digest und Health Score

## Verhältnis zu Queue und Execution

Queue und Execution beschreiben den **aktuellen Lauf**, History den
**Abschluss**. Sobald ein Task in History ankommt, ist sein Queue-Slot
frei. Die History referenziert die Quell-IDs, kopiert aber wesentliche
Felder, damit spätere Recherchen unabhängig von Quellen-Mutation
funktionieren.
