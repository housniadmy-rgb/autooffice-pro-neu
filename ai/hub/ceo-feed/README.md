# CEO Event Feed

## Verantwortung

Append-only Ledger aller relevanten Events. Liefert dem CEO-Dashboard
(aus Phase 7) eine chronologisch geordnete, unveränderliche Sicht auf
das Geschehen in der AI Company.

## Scope

- Datenmodell eines Feed-Eintrags (`schema.json`)
- Append-only Semantik – Einträge werden nie verändert oder gelöscht
- Korrelation und Verkettung mehrerer Ereignisse über
  `correlation_id`

## Nicht-Scope

- Keine eigene UI
- Keine Mutation bestehender Einträge
- Keine Bewertung – Bewertung kommt aus Decision Engine und Priority
- Kein Schreibzugriff durch externe Systeme

## Eingaben

- `append_feed`-Aktionen der Decision Engine
- Statusübergänge aus Engine (Approval entschieden, Task abgeschlossen)

## Ausgaben

- Geordnete Liste von Feed-Einträgen
- Konsumiert vom CEO-Dashboard (`ai/engine/dashboard`) ausschließlich
  **read-only**

## Verhältnis zu Event Hub und Decision Engine

```
Event Hub  ──► Decision Engine ──► CEO Event Feed (append)
                                            │
                                            ▼
                                    CEO Dashboard (read)
```

Wichtig: Der Feed enthält **eine Sicht** auf Events, nicht die Events
selbst in voller Tiefe. Vollständige Payloads bleiben Sache des Event
Hubs und der Registry.
