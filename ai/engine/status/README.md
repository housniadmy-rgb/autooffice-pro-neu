# Abteilungs-Status

## Verantwortung

Aktueller Zustand jeder AI-Abteilung als kompaktes, einheitliches
Datenmodell. Versorgt das CEO-Dashboard und die Engine selbst mit
einer schnellen Ja/Nein-Sicht: Ist die Abteilung aktiv? Gibt es offene
Tasks? Wann gab es zuletzt einen Report?

## Scope

- Datenmodell für Department-Status (`schema.json`)
- Erlaubte Statuswerte und Übergänge
- Verknüpfung zu Tasks und Approvals (gezählt, nicht referenziert)

## Nicht-Scope

- Keine Persistenz, kein Live-Polling
- Kein direkter Eingriff in Abteilungen
- Keine Veröffentlichung von Statusinformationen nach außen

## Eingaben

- `ai/<dept>/config.json` (Soll-Zustand)
- Tasks aus `ai/engine/tasks` (Ist-Last)
- Approvals aus `ai/engine/approvals` (offene Freigaben)

## Ausgaben

- Pro Abteilung ein Status-Objekt nach `schema.json`
- Sammelobjekt für das CEO-Dashboard (`by_department`)

## Statuswerte

| Status      | Bedeutung                                                       |
| ----------- | --------------------------------------------------------------- |
| `passive`   | Standard in Phase 6/7 – beobachtet, schreibt keine Aktionen     |
| `active`    | Arbeitet an freigegebenen Tasks (in späterer Phase)             |
| `degraded`  | Eingeschränkt – z. B. wegen offener Probleme / Risiken          |
| `blocked`   | Wartet auf Freigabe oder externe Bedingung                      |
| `unknown`   | Status konnte nicht ermittelt werden                            |

In Phase 7 ist der Default für alle Abteilungen `passive`.
