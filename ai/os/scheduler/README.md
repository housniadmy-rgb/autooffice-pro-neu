# Scheduler

## Verantwortung

Deklarative Zeit- und Trigger-Definitionen für die AI Company. Der
Scheduler **registriert keine echten Cron-Jobs** in dieser Phase – er
spezifiziert lediglich, **welche Trigger es gibt**, **was sie auslösen**
und **wer auf sie hört**. Spätere Implementierungen können ihn an
`node-cron`, Vercel Cron oder externe Worker binden.

In aktiver Betriebsweise wird der Scheduler ausschließlich
`os.scheduler.tick.*`-Events auf den Message Bus publishen. Er ruft
selbst keinen Code und keine API auf.

## Scope

- Job-Schema (`schema.json`)
- Initialer Job-Katalog (`jobs.json`)
- Zeit- und Trigger-Typen (`cron`, `interval`, `once`, `event`)
- Idempotenz- und Drift-Regeln

## Nicht-Scope

- Keine reale Registrierung an `node-cron`, `setInterval`,
  Vercel Cron oder anderen Schedulern
- Kein direkter Aufruf von Engine-, Ops- oder Hub-Modulen
- Keine HTTP-Endpunkte, keine UI
- Keine Persistenz der Lauf-Historie (das übernimmt `ai/os/audit`)

## Trigger-Typen

| Typ        | Bedeutung                                              | Beispiel                          |
| ---------- | ------------------------------------------------------ | --------------------------------- |
| `cron`     | Wiederkehrend mit Cron-Ausdruck                        | `0 6 * * *` für CEO Daily Digest  |
| `interval` | Wiederkehrend mit Dauer (ISO-8601 Duration)            | `PT15M` für Health-Snapshot       |
| `once`     | Einmalig zu fester Zeit                                | `2026-12-31T23:00:00Z`            |
| `event`    | Reaktiv auf ein anderes Bus-Event                      | `engine.approval.granted`         |

## Idempotenz und Drift

- Jeder Tick erhält eine `tick_id` (`tick_<job>_<isoTs>`).
- Tickwiederholungen mit derselben `tick_id` sind no-ops.
- Bei Drift (verpasster Slot) wird der nächste reguläre Tick gefeuert,
  nicht der verpasste – Catch-up ist explizit `false`.
- Job ohne Owner ist ungültig.

## Erweiterungspunkte

- `backend`: `node-cron`, `vercel-cron`, `temporal`, `quartz`
- `timezone` je Job (Default `Europe/Berlin`)
- `catch_up`: optional `true` für audit-kritische Jobs
- `max_concurrency` pro Job

## Sicherheit

- Default-Owner eines Tick-Events: `agent_os_scheduler`
- Job-Registrierung benötigt `scheduler:register`
- Tick-Events sind `internal`-only und nicht via API Gateway erreichbar
- Keine Job-Definition darf Secrets enthalten
