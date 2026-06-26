# Task State Machine

Eindeutige Zustandsübergänge für Tasks. Übergänge dürfen nur durch die
zuständigen Module ausgelöst werden – `awaiting_approval → approved`
bzw. `→ rejected` ist **menschlich**.

## Zustände

| Zustand              | Bedeutung                                                        |
| -------------------- | ---------------------------------------------------------------- |
| `draft`              | Von einer Abteilung erfasst, noch nicht in der Warteschlange     |
| `queued`             | Aufgenommen, wartet auf Workflow-/Prioritätsbewertung            |
| `blocked`            | Wartet auf andere Tasks (`depends_on`) oder externe Bedingung    |
| `awaiting_approval`  | Liegt im Approval-Flow, wartet auf menschliche Freigabe          |
| `approved`           | Freigegeben, aber noch nicht ausgeführt                          |
| `rejected`           | Freigabe verweigert, kein weiterer Schritt                       |
| `in_progress`        | Wird (in späterer Phase) bearbeitet                              |
| `completed`          | Erfolgreich beendet                                              |
| `cancelled`          | Vor Ausführung zurückgezogen                                     |
| `failed`             | Ausführung scheiterte (in späterer Phase)                        |

## Erlaubte Übergänge

```
draft ───► queued ───► blocked ─┐
              │                 │
              ▼                 ▼
        awaiting_approval ◄────┘
              │
       ┌──────┴──────┐
       ▼             ▼
   approved      rejected
       │
       ▼
   in_progress ──► completed
       │
       └──► failed

queued | blocked | awaiting_approval | approved  ──► cancelled
```

## Auslöser

| Übergang                              | Ausgelöst durch       |
| ------------------------------------- | --------------------- |
| `draft → queued`                      | Task Manager          |
| `queued → blocked`                    | Workflow Manager      |
| `blocked → awaiting_approval`         | Workflow Manager      |
| `queued → awaiting_approval`          | Workflow Manager      |
| `awaiting_approval → approved`        | **Mensch**            |
| `awaiting_approval → rejected`        | **Mensch**            |
| `approved → in_progress`              | spätere Phase         |
| `in_progress → completed`             | spätere Phase         |
| `in_progress → failed`                | spätere Phase         |
| `* → cancelled`                       | Owner-Abteilung       |

## Invarianten

- Ein Task kann nie ohne `approved` in `in_progress` übergehen.
- `priority` wird ausschließlich vom Prioritäts-System gesetzt.
- `artifacts` sind in dieser Phase grundsätzlich `read_only: true`.
