# Risiko-Matrix

## Wahrscheinlichkeit × Wirkung → Severity

|                     | impact=very_low | impact=low | impact=medium | impact=high | impact=very_high |
| ------------------- | --------------- | ---------- | ------------- | ----------- | ---------------- |
| **probability=very_high** | low      | medium     | high          | critical    | critical         |
| **probability=high**      | low      | medium     | high          | high        | critical         |
| **probability=medium**    | info     | low        | medium        | high        | high             |
| **probability=low**       | info     | low        | low           | medium      | high             |
| **probability=very_low**  | info     | info       | low           | medium      | medium           |

`severity` ist eine **abgeleitete** Größe. Sie darf nicht direkt
gesetzt werden, sondern ergibt sich aus `probability` und `impact`
über diese Matrix.

## Folge für Strategy Engine

- `severity = critical | high` ⇒ Risiko wird automatisch
  Signal-Quelle in der Strategy Engine (Tagesempfehlung-Kandidat).
- `severity = medium` ⇒ erscheint im Executive Dashboard im
  Abschnitt „Watchlist“.
- `severity = low | info` ⇒ erscheint nicht im Tagesblick, bleibt im
  Register.

## Review

| `review_cadence` | Erinnerung fällig nach           |
| ---------------- | -------------------------------- |
| `weekly`         | 7 Tagen seit `last_reviewed_at`  |
| `monthly`        | 30 Tagen                         |
| `quarterly`      | 90 Tagen                         |

Versäumte Reviews werden im Executive Dashboard markiert. Sie lösen
**keine** automatische Aktion aus.
