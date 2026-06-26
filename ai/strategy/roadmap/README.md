# Product Roadmap Manager

## Verantwortung

Strategische Initiativen über Zeit ordnen. Übersetzt strategische
Themen aus der Strategy Engine in greifbare Roadmap-Einträge mit
Horizont (Now / Next / Later), Owner-Abteilung und Abhängigkeiten.

## Scope

- Datenmodell eines Roadmap-Eintrags (`schema.json`)
- Horizont-Modell und Übergangsregeln (`horizons.md`)
- Verknüpfung Roadmap ↔ Themen ↔ Empfehlungen
- Status-Lebenszyklus eines Eintrags

## Nicht-Scope

- Keine eigene Implementierung von Features
- Keine GitHub-Schreibvorgänge (Issues, Milestones, PRs) in dieser
  Phase
- Keine automatischen Releases oder Deploys
- Keine Verknüpfung mit Kunden-/Tarifdaten

## Eingaben

- Themen + Empfehlungen aus `../strategy-engine`
- Opportunities mit hohem Score aus `../opportunities`
- Risiken, die als Initiative adressiert werden müssen (`../risk`)

## Ausgaben

- Roadmap-Einträge gemäß `schema.json`
- Zusammenfassungen für das Executive Dashboard (Now / Next / Later)

## Horizont-Modell

| Horizont | Bedeutung                                                  |
| -------- | ---------------------------------------------------------- |
| `now`    | Wird in diesem Zyklus (≈ Quartal) aktiv bearbeitet         |
| `next`   | Kommt im darauffolgenden Zyklus dran                       |
| `later`  | Kandidat, noch keine Entscheidung                          |
| `parked` | Bewusst zurückgestellt, mit Begründung                     |

Übergänge zwischen Horizonten sind ausschließlich **menschlich**.
