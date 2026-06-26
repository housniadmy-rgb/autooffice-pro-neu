# Event Registry

## Verantwortung

Verbindlicher Katalog aller im System bekannten Event-Typen. Jeder Typ
hat einen Namen, eine Eigentümer-Abteilung, eine Standard-Severity und
eine Spezifikation seines `payload`.

## Scope

- Liste aller registrierten Typen (`event-types.json`)
- Schema, dem jeder Registry-Eintrag folgt (`schema.json`)
- Versionierungsregeln für Event-Typen
- Kennzeichnung deprecated Typen

## Nicht-Scope

- Keine Erfassung konkreter Ereignisse (das macht der Event Hub)
- Keine Routing-Regeln (das macht die Decision Engine)

## Eingaben

- Vorschläge neuer Typen aus Abteilungen oder Engine-Modulen
- Reviews durch CTO/Security

## Ausgaben

- Aktualisierter Typkatalog
- Validierungsbasis für eingehende Events im Event Hub

## Konventionen

- Namensschema: `<dept_or_module>.<noun>.<verb_past>` (z. B.
  `security.vulnerability.detected`, `engine.task.created`,
  `monitoring.health.degraded`).
- Brüche im Payload erfordern einen neuen Typ-Namen mit Versionssuffix
  (`.v2`), nicht stilles Mutieren.
- Deprecated Typen werden mit `deprecated: true` markiert, **nicht
  gelöscht** – CEO Event Feed muss alte Einträge weiterhin lesen können.
