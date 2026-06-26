# Opportunity Scanner

## Verantwortung

Erfasst und bewertet Chancen: neue Branchen, Feature-Hypothesen,
Partnerschaften, SEO-Lücken, Wettbewerbsverschiebungen. Liefert der
Strategy Engine bewertete Kandidaten.

## Scope

- Datenmodell einer Opportunity (`schema.json`)
- Bewertungsverfahren (`scoring.md`)
- Lebenszyklus: erfasst → bewertet → bestätigt / verworfen
- Quellenangabe pro Opportunity

## Nicht-Scope

- Keine Marktforschung gegen externe APIs in dieser Phase
- Keine LLM-generierte Bewertung
- Keine direkte Roadmap-Aufnahme (das passiert über die Strategy
  Engine)

## Eingaben

- Beobachtungen aus AI-Abteilungen (SEO, Sales, Marketing, Support)
- Auswertungen aus dem CEO Event Feed (`ai/hub/ceo-feed`)
- KPI-Lücken aus `../kpi`

## Ausgaben

- Opportunity-Einträge gemäß `schema.json`
- Sortierte Kandidatenliste für die Strategy Engine

## Lebenszyklus

| Status      | Bedeutung                                                |
| ----------- | -------------------------------------------------------- |
| `captured`  | Frisch erfasst, noch keine Bewertung                     |
| `scored`    | Bewertet, mit `score` und `confidence`                   |
| `validated` | Durch CEO oder Owner-Abteilung bestätigt                 |
| `archived`  | Verworfen / nicht weiterverfolgt                         |

Übergänge sind menschlich. Eine `archived` Opportunity wird **nicht
gelöscht** – das Wissen, dass sie geprüft wurde, ist wertvoll.
