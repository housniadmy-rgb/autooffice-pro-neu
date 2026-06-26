# Pflicht-Auditierte Ereignisse

Der Audit-Layer muss mindestens folgende Ereignisse aufnehmen. Diese
Liste ist abschließend für Phase 11 und ergänzt das fachliche Audit in
`ai/ops/audit`.

## Agent Registry

- `agent.registered` – neuer Eintrag in der Registry
- `agent.activated` – `registered → active`
- `agent.paused` – `active → paused`
- `agent.resumed` – `paused → active`
- `agent.retired` – Übergang in den Endzustand

## Permissions

- `role.created` – neue Rolle in `roles.json`
- `permission.bound` – Subject erhält Rolle
- `permission.unbound` – Bindung wird entfernt
- `permission.denied` – Aktion default-deny ausgewertet
- `permission.granted` – Aktion durch passende Permission erlaubt

## Event Router

- `route.added` – neue Route in `routes.json`
- `route.changed` – Routendefinition geändert
- `route.removed` – Route entfernt
- `route.matched` – Route hat gegriffen
- `route.dropped` – Nachricht durch `drop`-Aktion verworfen

## Scheduler

- `scheduler.job.registered` – Job in `jobs.json` aufgenommen
- `scheduler.tick.emitted` – Tick wurde publiziert
- `scheduler.tick.skipped` – Drift ohne Catch-up

## Memory

- `memory.written:shared` – Schreibvorgang auf `shared`-Scope
- `memory.policy.violation` – Versuch außerhalb erlaubter Scopes

## Message Bus

- `bus.message.rejected` – z. B. unbekanntes Topic, fehlende Permission
- `bus.subscription.added` – Agent abonniert ein Topic
- `bus.subscription.removed` – Abonnement entfernt

## API Gateway

- `gateway.endpoint.enabled` – Endpunkt von `disabled → enabled`
- `gateway.endpoint.disabled` – Rückführung
- `gateway.request.received` – nur sobald das Gateway aktiv ist

## Outcomes

- `allowed`, `denied` – für Permission-Checks
- `success`, `failure`, `dryrun_success` – für ausführende Aktionen
- `dropped` – ausschließlich Router

## Korrekturen

- Falsche Einträge werden nicht entfernt, sondern durch einen Eintrag
  mit `kind: correction` und `corrects: <audit_id>` ergänzt.
