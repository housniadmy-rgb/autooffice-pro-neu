# Opportunity Scoring

## Formel (RICE-Variante)

```
total = (reach * impact * confidence) / effort
```

- `reach` – wie viele Nutzer / Sitzungen / Praxen pro Zyklus betroffen
  sind (geschätzt).
- `impact` – diskrete Skala:
  - `0.25` = winzig, `0.5` = klein, `1` = mittel, `2` = groß, `3` = massiv.
- `confidence` – 0..1, wie verlässlich die Schätzung ist (Studie,
  bestehende Daten, reine Intuition).
- `effort` – ≥ 1, geschätzter Aufwand in Personen-Wochen.

## Schwellen

| Schwelle           | Bedeutung                                              |
| ------------------ | ------------------------------------------------------ |
| `total >= 50`      | Starker Kandidat – kommt in die Strategy Engine        |
| `20 <= total < 50` | Beobachten, sammeln, anderes Theme                     |
| `total < 20`       | Niedrige Priorität, bleibt in `captured` / `archived`  |

## Hygiene

- `confidence` darf **nicht** ohne Quelle hoch sein. Wer 1.0 schreibt,
  muss eine harte Quelle (Studie, Messung, Kundeninterview) hinterlegen.
- Doppelte Opportunities zum gleichen Kern werden zusammengeführt
  (`status = archived`, Verweis auf den gewinnenden Eintrag in
  `summary`).
- Eine archivierte Opportunity ist **historische Information**, kein
  Fehler.

## Verhältnis zur Strategy Engine

Nur Opportunities mit `status = scored` (oder `validated`) und
`total >= 50` fließen in den Tagesempfehlungs-Prozess. Die Strategy
Engine wählt davon eine geordnete Teilmenge aus.
