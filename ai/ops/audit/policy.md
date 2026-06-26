# Audit-Pflichten

## Was zwingend protokolliert wird

Folgende Ereignisse erzeugen **immer** einen Audit-Eintrag. Das gilt
auch für Dry-Run-Ausführungen.

| Quelle              | Ereignis                                        | `kind`                    |
| ------------------- | ----------------------------------------------- | ------------------------- |
| Operations Queue    | Eintrag aufgenommen                              | `queue.enqueued`          |
| Operations Queue    | Slot zugewiesen                                  | `queue.assigned`          |
| Operations Queue    | Eintrag nach Approval zurückgeführt              | `queue.requeued`          |
| Operations Queue    | Eintrag manuell zurückgezogen                    | `queue.cancelled`         |
| Policy Engine       | Klassifikation gesetzt                           | `policy.classified`       |
| Policy Engine       | Approval angefragt                               | `policy.requested_approval` |
| Approval Flow       | Entscheidung getroffen                           | `approval.decided`        |
| Execution Manager   | Dry-Run gestartet                                | `execution.started`       |
| Execution Manager   | Dry-Run abgeschlossen                            | `execution.completed`     |
| Execution Manager   | Dry-Run fehlgeschlagen                           | `execution.failed`        |
| Execution Manager   | Pre-Check abgewiesen                             | `execution.rejected`      |
| Task History        | Eintrag fortgeschrieben                          | `history.appended`        |
| System              | Anomalie / Konsistenzbruch erkannt               | `system.anomaly`          |

## Verbindliche Felder pro Eintrag

- `audit_id` (sortierbar)
- `actor` mit `kind` und `id`
- `subject` mit `kind` und `id`
- `summary` als kurzer, lesbarer Text
- `occurred_at` (UTC, ISO-8601)
- `correlation_id`, sofern eine Task-/Queue-/Approval-Kette existiert

## Unveränderlichkeit

- Audit-Einträge werden **nie** verändert oder gelöscht.
- Korrekturen erfolgen ausschließlich durch neue Einträge mit
  `kind = system.anomaly` und Verweis auf den fehlerhaften Eintrag in
  `details`.
- `prev_hash` / `hash` sind in dieser Phase Spezifikation für die
  spätere Implementierung einer Hash-Kette.

## Ausschluss

- Inhalte aus Kundendaten dürfen **nicht** in `details` aufgenommen
  werden – nur Metadaten und Referenz-IDs.
- Secrets, Tokens, Passwörter sind immer auszuschließen, auch in
  abgekürzter Form.
