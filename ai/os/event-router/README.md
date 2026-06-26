# Event Router

## Verantwortung

Regelbasiertes Routing aller Nachrichten vom Message Bus an die
korrekten Subscriber, an Engine-Tasks oder an Notification-Vorbereitungen.
Der Router ist **rein deklarativ**: Regeln stehen in `routes.json`, es
gibt keine ML-/LLM-Entscheidung. Damit ist er der Geschwister-Bruder
der `ai/hub/decision-engine` für die **Plattform**-Ebene (während die
Decision Engine fachliche Routing-Entscheidungen trifft).

## Scope

- Datenmodell für Routen (`schema.json`)
- Initialer Routen-Katalog (`routes.json`)
- Match-Sprache (Topic-Glob, Header-Filter, Producer-Filter)
- Aktions-Typen: `forward`, `fanout`, `enrich`, `drop`, `audit_only`

## Nicht-Scope

- Keine inhaltliche Bewertung des Payloads (das ist Sache der
  Decision Engine in `ai/hub`)
- Keine reale Nachrichtenzustellung (kein Transport)
- Keine HTTP-Endpunkte
- Keine Persistenz – Routen sind statisch in `routes.json`

## Match-Sprache

Jede Regel besteht aus einem `match`-Objekt mit:

- `topic` – Glob über Topic (`engine.task.*`, `os.scheduler.tick.*`)
- `producer` – exakter `agent_id` oder Glob (`agent_engine_*`)
- `headers.criticality.gte` – minimaler Kritikalitätswert
- `headers.visibility` – `internal` (Default) oder `external`
- `payload` – optionale, einfache Path-Existenz-Checks (kein
  Volltext-Match)

Erstes passendes Regel-Set entscheidet (`first-match wins`). Eine
Regel mit `final: false` lässt nachfolgende Regeln zusätzlich greifen
(z. B. um zusätzlich Audit zu schreiben).

## Aktions-Typen

| Aktion       | Bedeutung                                                       |
| ------------ | --------------------------------------------------------------- |
| `forward`    | Nachricht an einen einzelnen Subscriber-Agenten ausliefern      |
| `fanout`     | Nachricht an mehrere Subscriber gleichzeitig                    |
| `enrich`     | Header-/Payload-Marker setzen (z. B. `tag: critical`)            |
| `drop`       | Nachricht stillschweigend verwerfen (immer audit-pflichtig)     |
| `audit_only` | Nicht an Subscriber zustellen, nur in Audit aufnehmen           |

## Erweiterungspunkte

- `rate_limit` pro Regel (z. B. „max 60/min an Notifications“)
- `retry_policy` pro Subscriber
- `dead_letter_topic` für nicht zustellbare Nachrichten
- A/B-Routing-Hooks für spätere Experiment-Phasen

## Sicherheit

- Default `drop` mit `audit_only` für alle Topics, die nicht
  katalogisiert sind
- Externe Sichtbarkeit (`visibility=external`) erfordert eine
  explizite Regel und `permission: route:write:external`
- Drop und Forward erzeugen Audit-Einträge mit `route_id` und
  `rule_index`
