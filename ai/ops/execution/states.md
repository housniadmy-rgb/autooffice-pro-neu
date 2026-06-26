# Execution State Machine

Eindeutige Zustandsübergänge des Execution Managers im **Dry-Run**.

## Zustände

| Zustand     | Bedeutung                                                |
| ----------- | -------------------------------------------------------- |
| `starting`  | Datensatz erzeugt, Idempotenz geprüft                    |
| `running`   | Simulation läuft (geplante Effekte werden festgehalten)  |
| `completed` | Simulation erfolgreich beendet                           |
| `failed`    | Simulation mit Fehler abgeschlossen (Backoff möglich)    |
| `rejected`  | Pre-Check abgelehnt (z. B. Policy-Bruch zur Laufzeit)    |
| `cancelled` | Vor oder während des Laufs bewusst zurückgezogen         |

## Erlaubte Übergänge

```
starting ──► running ──► completed
   │            │
   │            └──► failed ──► (Queue: Retry oder finaler Abbruch)
   │
   ├──► rejected
   │
   └──► cancelled
```

## Auslöser

| Übergang                  | Ausgelöst durch                       |
| ------------------------- | ------------------------------------- |
| `starting → running`      | Execution Manager (nach Idempotenz)   |
| `running → completed`     | Execution Manager                     |
| `running → failed`        | Execution Manager                     |
| `* → rejected`            | Policy Engine (Re-Evaluation)         |
| `* → cancelled`           | Operations Queue (z. B. Owner-Abbruch)|

## Invarianten

- `mode` ist in Phase 9 ausschließlich `dry_run`.
- Eine Ausführung mit `policy_class = critical` darf `running` nur
  betreten, wenn ein gültiger Approval-Record vorliegt.
- Jeder Übergang erzeugt einen Audit-Eintrag.
