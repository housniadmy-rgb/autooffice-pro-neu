# Message Bus

## Verantwortung

Einheitliches Pub/Sub-Spezifikat für die Kommunikation zwischen Agenten.
Der Message Bus definiert das **Envelope-Format**, die **Topic-Konvention**
und die **Zustellungs-Semantik**. Er ist in dieser Phase **kein
Transport** – kein Worker, kein Broker, kein Listener läuft. Er ist die
Vertragsdefinition, an die sich spätere Implementierungen
(NodeEventEmitter, Vercel Queues, Redis Streams, NATS, …) halten.

## Scope

- Envelope-Schema (`schema.json`)
- Topic-Namenskonvention und initialer Katalog (`topics.json`)
- Zustellungs-Garantien und Versionierung
- Validierungsregeln gegen die Registry und das Permissions-Modul

## Nicht-Scope

- Keine Implementierung eines Transports
- Keine Speicherung der Nachrichten
- Keine Retry-, Dead-Letter- oder Backoff-Logik (Spezifikation only)
- Keine PII-Übertragung

## Envelope

Jede Nachricht folgt einem stabilen Envelope:

```
{
  "envelope_version": 1,
  "id": "msg_<ulid>",
  "topic": "<area>.<entity>.<event>",
  "ts": "2026-06-26T08:00:00.000Z",
  "producer": "agent_<area>_<name>",
  "trace_id": "trace_<ulid>",
  "correlation_id": "task_<slug>_<ts>",
  "schema_ref": "ai/os/message-bus/payloads/<topic>.json",
  "payload": { ... },
  "headers": {
    "tenant": "praxisonline24",
    "visibility": "internal",
    "criticality": "info"
  }
}
```

Pflichtfelder: `envelope_version`, `id`, `topic`, `ts`, `producer`,
`payload`.

## Topic-Konvention

`<area>.<entity>.<event>` (kleinbuchstaben, dot-separiert).

- `area`: `engine`, `hub`, `ops`, `strategy`, `os`, `dept`
- `entity`: z. B. `task`, `approval`, `queue`, `digest`, `agent`,
  `permission`, `tick`
- `event`: Vergangenheitsform (`created`, `changed`, `denied`, …)

Beispiele:

- `engine.task.created`
- `engine.approval.granted`
- `hub.event.normalized`
- `ops.execution.dryrun.completed`
- `os.scheduler.tick.daily`
- `os.permission.denied`

## Zustellungs-Semantik

- `default_delivery`: `at-least-once`
- `default_ordering`: `per-correlation_id`
- `default_visibility`: `internal`
- `idempotency`: Konsumenten sind verpflichtet, Nachrichten anhand
  `id` + `correlation_id` zu deduplizieren.

## Validierungsregeln

1. `producer` muss in `ai/os/agent-registry/agents.json` als `active`
   geführt sein.
2. `topic` muss in `topics.json` katalogisiert sein.
3. Der Producer muss `publishes`-Recht für das Topic besitzen.
4. Subscriber benötigen `bus:subscribe` plus eine Permission-Bindung
   an das Topic.
5. PII-Felder (Namen, E-Mails, Telefonnummern, Adressen) sind im
   Payload **nicht erlaubt** – stattdessen Referenzen wie
   `patient_ref: "px_<id>"`.

## Erweiterungspunkte

- `headers.partition_key` für skalierende Backends
- `headers.replay_token` für Replays in späteren Phasen
- `payload_compression` für große Payloads
- `transport`-Adapter: `eventemitter`, `vercel-queues`, `redis-streams`,
  `nats`

## Sicherheit

- Producer-Verifikation gegen Registry (Default: `deny`)
- Default-Sichtbarkeit `internal`; `external` erfordert
  Permission `bus:publish:external`
- Nachrichten enthalten **keine** Secrets, keine Zugangsdaten,
  keine vollständigen PII-Datensätze
