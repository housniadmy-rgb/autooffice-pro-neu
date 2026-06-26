# Event & Intelligence Hub – PraxisOnline24

Zentrale Sammel-, Bewertungs- und Verteilstelle für Ereignisse aus
allen AI-Abteilungen und aus der Automation Engine. Der Hub macht
sichtbar, was im System passiert, ordnet es ein und leitet es kontrolliert
an die zuständigen Module weiter.

## Status

- Phase: 8 (Grundarchitektur)
- Modus: passiv / deklarativ / dokumentarisch
- Branch: `praxisonline24-repositioning`
- Auto-Execute: deaktiviert
- Auto-Publish: deaktiviert
- Bezug zu bestehender App (Express/SQLite/EJS): **keiner**

In dieser Phase werden **keine produktiven Aktionen** ausgeführt. Der
Hub ist ausschließlich als Datenmodell, Routing-Spezifikation und
Wissensgerüst angelegt.

## Module

| Modul              | Pfad                 | Verantwortung                                                 |
| ------------------ | -------------------- | ------------------------------------------------------------- |
| Event Hub          | `./event-hub`        | Annahme und Validierung eingehender Ereignisse                |
| Event Registry     | `./registry`         | Katalog bekannter Event-Typen und ihrer Schemas               |
| Knowledge Base     | `./knowledge-base`   | Bekannte Probleme, Lösungen, Best Practices                   |
| Decision Engine    | `./decision-engine`  | Regelbasiertes Routing eingehender Events (noch keine KI)     |
| Notification Center| `./notifications`    | Datenmodell für Benachrichtigungen (alle Kanäle deaktiviert)  |
| CEO Event Feed     | `./ceo-feed`         | Append-only Ledger für das CEO-Dashboard                      |

## Kommunikation der Module

```
   Abteilung (ai/<dept>)        Engine (ai/engine/*)
           │                            │
           └──────────┬─────────────────┘
                      ▼
                 ┌──────────┐
                 │ Event Hub│ ─── validiert gegen ─── Event Registry
                 └────┬─────┘
                      │ normalisiertes Event
                      ▼
                ┌─────────────────┐    konsultiert    ┌──────────────────┐
                │ Decision Engine │ ───────────────► │ Knowledge Base   │
                └────┬────────────┘                  └──────────────────┘
                     │ Routing-Entscheidung (1..n Aktionen)
                     │
            ┌────────┼─────────────────────────────┐
            ▼        ▼                             ▼
   Engine.Tasks   Notification Center      CEO Event Feed
   (Task neu)    (pending, keine Sends)   (append-only)
                                                   │
                                                   ▼
                                          CEO-Dashboard (Phase 7)
                                            liest read-only
```

## Grundregeln

1. **Single Entry Point.** Jedes Ereignis betritt das System
   ausschließlich über den Event Hub.
2. **Registry-Pflicht.** Ein Event ohne registrierten Typ wird abgelehnt
   (in späterer Phase) – in Phase 8 bereits Schema-validiert.
3. **Decision Engine ist regelbasiert.** Ausschließlich deklarative
   Routing-Regeln (`rules.json`). Keine LLM-/ML-Entscheidungen in
   dieser Phase.
4. **Notifications sind passiv.** Datensätze werden vorbereitet, aber
   nicht versendet. Alle Kanäle sind `enabled: false`.
5. **Approval bleibt zwingend.** Jede Aktion mit Außenwirkung
   verbleibt im Approval-Flow aus Phase 7.
6. **CEO Event Feed ist append-only.** Einträge werden niemals
   verändert oder gelöscht.

## Konventionen

Jedes Modul enthält mindestens:

- `README.md` – Verantwortung, Scope, Nicht-Scope
- eine maschinenlesbare Strukturdatei (`schema.json` oder Katalog)

## Nicht-Scope dieser Phase

- Kein Versand realer Notifications (E-Mail, Slack, Webhook, Push)
- Keine HTTP-Endpunkte, keine UI
- Keine Anbindung an die produktive SQLite-Datenbank
- Keine LLM-/KI-Entscheidungen
- Keine Änderung an `server.js`, `routes/`, `middleware/`, `data/`,
  `utils/`, `locales/`, `public/`
