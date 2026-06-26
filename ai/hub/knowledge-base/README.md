# Knowledge Base

## Verantwortung

Strukturierter Speicher für bekannte Probleme, geprüfte Lösungen,
Best Practices und Anti-Patterns. Dient der Decision Engine als
Nachschlagewerk und dem CEO als Begründungsbasis für Empfehlungen.

## Scope

- Datenmodell eines KB-Eintrags (`schema.json`)
- Sammlung von Einträgen unter `entries/` (in dieser Phase: Beispiel)
- Tagging, Verlinkung, Quellenangabe
- Versionierungs- und Reife-Status (`draft`, `validated`, `archived`)

## Nicht-Scope

- Keine produktive Auslieferung an Endkunden
- Kein Schreibzugriff durch externe Systeme
- Keine automatische Generierung von KB-Einträgen durch ein LLM in
  dieser Phase

## Eingaben

- Befunde der Abteilungen
- Auswertungen aus dem CEO Event Feed
- Externe Best-Practice-Quellen (mit Quellenangabe im Eintrag)

## Ausgaben

- KB-Einträge als JSON-Dateien unter `entries/`
- Lookup-Schnittstelle (Spezifikation, keine Implementierung) für die
  Decision Engine: „Gibt es zu Event-Typ X einen bekannten Lösungspfad?“

## Eintrags-Typen

| Typ            | Inhalt                                              |
| -------------- | --------------------------------------------------- |
| `problem`      | Bekanntes Problemmuster mit Symptomen               |
| `solution`     | Geprüfter Lösungspfad – Voraussetzungen + Schritte  |
| `best_practice`| Empfehlung jenseits eines konkreten Problems        |
| `anti_pattern` | Vorgehen, das wir bewusst vermeiden                 |

## Reifegrade

- `draft` – Entwurf, noch nicht überprüft
- `validated` – mindestens einmal in Praxis bestätigt
- `archived` – nicht mehr relevant, aber lesbar
