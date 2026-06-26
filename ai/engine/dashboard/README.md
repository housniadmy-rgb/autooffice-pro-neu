# CEO-Dashboard (nur Datenmodell)

## Verantwortung

Read-only Aggregat des Engine-Zustands für den CEO und für menschliche
Entscheider. Diese Phase liefert ausschließlich das **Datenmodell** –
keine UI, keine HTTP-Route, keine Persistenz.

## Scope

- Datenmodell des Dashboards (`schema.json`)
- Definierte Abschnitte: Zusammenfassung, offene Freigaben, kritische
  Themen, Abteilungs-Status, jüngste Reports

## Nicht-Scope

- Keine View, keine Templates, keine Routen
- Keine Schreibzugriffe (das Dashboard ist read-only)
- Keine Echtzeit-Push-Mechanismen
- Keine Anbindung an die produktive App-DB

## Eingaben

- Tasks (`ai/engine/tasks`)
- Workflows (`ai/engine/workflows`)
- Approvals (`ai/engine/approvals`)
- Department-Status (`ai/engine/status`)
- Reports der Abteilungen (`ai/<dept>/report.latest.md`, sofern vorhanden)

## Ausgaben

- Ein konsolidiertes JSON-Objekt (Schema in `schema.json`), das später
  in eine View oder eine Datei serialisiert werden kann

## Abschnitte des Dashboards

1. `headline` – kurze Lage in einem Satz
2. `attention_required` – offene Approvals + kritische Tasks
3. `by_department` – Status, letzte Aktivität, offene Tasks
4. `recent_artifacts` – Pfade zu jüngsten Reports
5. `metrics` – aggregierte Zahlen (Anzahl Tasks pro Status etc.)

Alle Werte werden **berechnet**, nicht eingegeben. Das Dashboard hat
keinen eigenen Schreibpfad.
