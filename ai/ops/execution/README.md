# Execution Manager

## Verantwortung

Vollzug der durch die Queue zugewiesenen Tasks. In Phase 9
**ausschließlich als Dry-Run**: jede Operation wird geplant,
simuliert, protokolliert – aber **nicht produktiv ausgeführt**.
Schreibvorgänge auf produktive App-Daten, Deploys, GitHub-API,
externe Notifications und reale Veröffentlichungen sind ausgeschlossen.

## Scope

- Datenmodell eines Ausführungsdatensatzes (`schema.json`)
- Zustandsmaschine der Ausführung (`states.md`)
- Idempotenzschlüssel und Wiederaufnahme
- Trennung zwischen `dry_run` und (späterer) `live`-Ausführung

## Nicht-Scope

- Keine reale Ausführung – `mode = live` ist in dieser Phase **nicht
  erlaubt** und wird vom Schema explizit ausgeschlossen
- Kein Schreibzugriff auf produktive SQLite-Daten
- Keine Deploys, keine Pushes, keine GitHub-Operationen
- Keine HTTP-Endpunkte

## Eingaben

- Queue-Einträge mit `state = ready_for_execution`
- Policy-Klassifikation (`safe` Pflicht; `critical` darf nur nach
  Approval angeliefert werden)

## Ausgaben

- Ausführungsdatensätze (gemäß `schema.json`)
- Übergabe an Task History (`completed | failed | rejected`)
- Audit-Events bei Start, Statuswechsel und Abschluss

## Idempotenz

Jede Ausführung trägt einen `idempotency_key`. Erneute Versuche mit
identischem Key liefern den existierenden Datensatz zurück und führen
keine neue Simulation aus. Damit ist die Wiederaufnahme nach Crash
deterministisch.

## Verhalten (Spezifikation, nicht ausgeführt)

1. Eintrag aus Queue konsumieren (`state = ready_for_execution`).
2. Ausführung als `dry_run` starten (`schema.json: mode = "dry_run"`).
3. Geplante Effekte als `planned_effects[]` festhalten – ohne sie
   wirklich auszulösen.
4. Ergebnis (`completed | failed`) in History anlegen und Audit-Eintrag
   schreiben.
5. Bei `failed` Backoff/Retry gemäß `attempts` / `max_attempts` der
   Queue – stets weiterhin im Dry-Run.
