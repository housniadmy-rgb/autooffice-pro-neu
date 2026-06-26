# Event Hub

## Verantwortung

Einziger Eingangspunkt für Ereignisse in der AI Company. Nimmt Events
von Abteilungen (`ai/<dept>`) und Engine-Modulen (`ai/engine/*`)
entgegen, normalisiert sie auf einen einheitlichen Envelope,
validiert sie gegen die Event Registry und gibt sie an die Decision
Engine weiter.

## Scope

- Datenmodell des Event-Envelopes (`schema.json`)
- Validierungspflicht gegen Registry (`../registry`)
- Stabile Event-ID, Quelle, Zeitstempel
- Idempotenz-Vorgaben (Wiederholungen werden deduplizieren)

## Nicht-Scope

- Keine eigene Entscheidungslogik – das ist Aufgabe der Decision Engine
- Kein Versand von Notifications
- Keine Persistenz in der produktiven SQLite-Datenbank
- Keine HTTP-Schnittstelle in dieser Phase

## Eingaben

- Events aus AI-Abteilungen
- Events aus der Automation Engine (Task-Statuswechsel, Approval-Statuswechsel)

## Ausgaben

- Normalisierte Event-Objekte gemäß `schema.json`
- Übergabe an die Decision Engine
- Spiegelung in den CEO Event Feed (read-only Sicht für das Dashboard)

## Envelope (Kernfelder)

- `event_id` – stabile, sortierbare ID (`evt_<slug>_<timestamp>`)
- `type` – Wert aus der Event Registry (`../registry/event-types.json`)
- `source` – Abteilung oder Engine-Modul
- `severity` – `critical | high | medium | low | info`
- `occurred_at` / `received_at`
- `payload` – typspezifisch, Schema kommt aus der Registry
- `correlation_id` – verkettet zusammengehörige Events
- `dedupe_key` – verhindert Doppelverarbeitung

## Verhalten (Spezifikation, nicht ausgeführt)

1. Envelope entgegennehmen.
2. Pflichtfelder gegen `schema.json` prüfen.
3. `type` gegen Registry auflösen, `payload` gegen das dort
   referenzierte Schema prüfen.
4. Dedupliziertes Event an die Decision Engine übergeben.
5. Eintrag im CEO Event Feed anlegen (append-only).
