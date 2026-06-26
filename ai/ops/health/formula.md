# Health Score – Formel und Gewichte

Diese Formel ist die **Spezifikation** für die spätere Implementierung.
Sie wird in Phase 9 nicht ausgeführt.

## Score

```
score = clamp(0..100,
              100 - Σ ( component.weight * component.penalty ) )
```

- `clamp(0..100, x)` schneidet den Wert auf das Intervall [0, 100].
- `penalty` ist ein Wert zwischen 0 und 100, der das negative Signal
  einer Komponente angibt.

## Komponenten und Default-Gewichte

| Key                       | Default-Gewicht | Penalty-Quelle                                              |
| ------------------------- | --------------- | ----------------------------------------------------------- |
| `queue_depth`             | 0.15            | wachsende Queue ohne Abarbeitung                            |
| `queue_wait_p95`          | 0.10            | hohe P95-Liegezeit der letzten 24h                          |
| `execution_success_rate`  | 0.20            | Anteil `failed` an den letzten Ausführungen                 |
| `open_critical_tasks`     | 0.20            | offene `critical`-Tasks aus `ai/engine/tasks`               |
| `open_approvals`          | 0.15            | offene Approval-Records aus `ai/engine/approvals`           |
| `feed_severity_profile`   | 0.10            | Anteil `critical`/`high` der letzten 24h im CEO Event Feed  |
| `audit_anomalies`         | 0.10            | Auffälligkeiten / Klassifikations-Konflikte im Audit Log    |

Summe der Default-Gewichte: 1.0.

## Tier-Schwellen

| Score      | Tier        |
| ---------- | ----------- |
| 85–100     | `healthy`   |
| 70–84      | `watch`     |
| 50–69      | `degraded`  |
| 0–49       | `critical`  |

## Verhalten bei `critical` Tier

- Der Daily Digest hebt den Score und seine schwächsten Komponenten
  hervor.
- Es wird **keine** automatische Aktion ausgelöst – die Eskalation
  bleibt eine menschliche Entscheidung des CEO.
