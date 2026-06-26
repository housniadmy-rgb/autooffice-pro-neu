# Monitoring

## Verantwortung

Beobachtung des laufenden Betriebs von PraxisOnline24: Uptime, Logs,
Performance-Signale, Fehlerraten.

## Scope

- Bewertung von Health-Endpoints und Statusmeldungen
- Aufbereitung von Log-Mustern
- Identifikation wiederkehrender Fehlerbilder
- Empfehlungen für Alarmierungsschwellen

## Nicht-Scope

- Kein direkter Eingriff in den Betrieb
- Keine Neukonfiguration von Logging-Targets
- Keine automatischen Neustarts oder Skalierungsaktionen

## Eingaben

- Bestehende Logs / Health-Endpoints (sofern lokal lesbar)
- Reports aus Operations und Security

## Ausgaben

- `monitoring/report.latest.md` – Auffälligkeiten, Trends, Vorschläge
