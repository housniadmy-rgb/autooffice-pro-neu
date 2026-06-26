# Horizont-Modell

## Horizonte und Bedeutung

| Horizont | Zeithorizont (Richtwert) | Wofür                                                       |
| -------- | ------------------------ | ----------------------------------------------------------- |
| `now`    | aktueller Zyklus (Quartal) | Tatsächlich begonnen, Owner aktiv dran                    |
| `next`   | folgender Zyklus         | Klar geplant, aber noch nicht begonnen                      |
| `later`  | 2+ Zyklen entfernt       | Kandidat, noch keine harte Entscheidung                     |
| `parked` | unbegrenzt               | Bewusst zurückgestellt, mit dokumentierter Begründung       |

## Status-Lebenszyklus

```
proposed ──► validated ──► in_progress ──► shipped
    │             │              │
    │             │              └── blocked ──► in_progress
    │             │
    └── cancelled ◄──── (jederzeit, mit Begründung)
```

- `proposed` – aus Strategy Engine / Opportunity Scanner / Risk Manager
  eingegangen, noch nicht überprüft.
- `validated` – durch CEO oder Verantwortliche bestätigt.
- `in_progress` – wird aktiv bearbeitet (in einer späteren Phase über
  konkrete Engine-Tasks).
- `blocked` – wartet auf externe Bedingung oder Approval.
- `shipped` – abgeschlossen und im Produkt sichtbar.
- `cancelled` – verworfen.

## Übergangsregeln

- Horizont-Wechsel (`later → next`, `next → now`) sind **menschlich**
  und immer dokumentiert.
- Status-Übergänge entstehen entweder durch CEO-Entscheidung oder
  durch Abschluss zugehöriger Tasks im Engine-Workflow.
- Roadmap-Einträge können in Phase 10 nicht selbsttätig in
  `in_progress` wechseln – das setzt einen vom CEO freigegebenen
  Engine-Workflow voraus.

## Verhältnis zu Themen

- Jeder Roadmap-Eintrag verweist optional auf genau ein `theme_id`.
- Themen ohne Roadmap-Einträge sind erlaubt (sie sind Beobachtung,
  nicht Aktion).
- Roadmap-Einträge ohne Theme sollten geprüft werden, ob ein neues
  Theme nötig ist.
