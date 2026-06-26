# Notification Center

## Verantwortung

Vorbereitung von Benachrichtigungen, die aus Entscheidungen der
Decision Engine entstehen. **Versendet in Phase 8 nichts.** Stattdessen
werden Notification-Records im Status `pending` erzeugt und stehen für
spätere Phasen oder manuelle Auslieferung bereit.

## Scope

- Datenmodell einer Notification (`schema.json`)
- Katalog der Kanäle (`channels.json`), alle `enabled: false`
- Trennung zwischen interner Sichtbarkeit (z. B. CEO Inbox) und
  externer Auslieferung (z. B. E-Mail)

## Nicht-Scope

- **Kein Versand**, weder E-Mail, Slack, Webhook noch Push
- Keine Integration mit externen Diensten in dieser Phase
- Keine Speicherung in der produktiven SQLite-Datenbank
- Keine Kundenkommunikation

## Eingaben

- `notify`-Aktionen der Decision Engine
- Approval-Status der Engine (für Begleit-Notifications)

## Ausgaben

- Notification-Records im Status `pending`
- Spiegelung als Event-Feed-Eintrag (über die Decision Engine, nicht
  direkt)

## Statusmodell

| Status      | Bedeutung                                                      |
| ----------- | -------------------------------------------------------------- |
| `pending`   | Erzeugt, aber noch nicht zugestellt – Default in Phase 8       |
| `queued`    | Bereit zur Auslieferung (spätere Phase)                        |
| `sent`      | Erfolgreich zugestellt (spätere Phase)                         |
| `failed`    | Zustellung gescheitert                                         |
| `cancelled` | Vor Auslieferung zurückgezogen                                 |

In Phase 8 verlassen Notifications den Status `pending` nicht
automatisch. Jeder Übergang braucht eine spätere Implementierung **mit
Approval**.
