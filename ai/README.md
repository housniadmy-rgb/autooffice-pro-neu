# AI Company – PraxisOnline24

Interne KI-Organisationsstruktur. Jede Abteilung ist ein eigenständiges
Modul mit klar definierter Verantwortlichkeit und einer eigenen
Konfiguration. Diese Phase (Phase 6) liefert ausschließlich die
**Architektur und Beschreibung** – es werden noch **keine produktiven
Aktionen** ausgeführt, nichts veröffentlicht und keine bestehenden
Funktionen verändert.

## Status

- Phase: 6 (Grundarchitektur)
- Modus: passiv / read-only / dokumentarisch
- Branch: `praxisonline24-repositioning`
- Auto-Deploy: deaktiviert
- Auto-Publish: deaktiviert

## Abteilungen

| Abteilung    | Pfad             | Kurzbeschreibung                                       |
| ------------ | ---------------- | ------------------------------------------------------ |
| CEO          | `./ceo`          | Aggregiert Berichte aller Abteilungen, ohne zu handeln |
| CTO          | `./cto`          | Architektur, Tech-Stack, Code-Qualität                 |
| QA           | `./qa`           | Test- und Qualitätssicherung                           |
| SEO          | `./seo`          | Sichtbarkeit, Keywords, Onpage-Signale                 |
| Marketing    | `./marketing`    | Kampagnen-, Content- und Positionierungsplanung        |
| Sales        | `./sales`        | Pipeline, Konversion, Angebotsstruktur                 |
| Support      | `./support`      | Kunden- und Praxis-Anfragen, Wissensbasis              |
| Finance      | `./finance`      | Umsatz, Kosten, Forecasts, Pricing-Analyse             |
| Security     | `./security`     | Auth, DSGVO, Vulnerabilities, Secret-Hygiene           |
| Monitoring   | `./monitoring`   | Uptime, Logs, Performance-Signale                      |
| Operations   | `./operations`   | Deployments, Tasks, Infrastruktur-Routinen             |

## Berichtsfluss

```
[ cto, qa, seo, marketing, sales, support, finance, security, monitoring, operations ]
                              │
                              ▼
                            [ ceo ]
                              │
                              ▼
                  Konsolidierter Bericht
                  (read-only, manuelle Freigabe)
```

Der CEO konsolidiert ausschließlich die Reports der anderen Abteilungen.
Er veröffentlicht **nichts automatisch** und greift **nicht in die
laufende Anwendung** ein. Jede Freigabe erfordert eine menschliche
Entscheidung.

## Konventionen

Jede Abteilung enthält mindestens:

- `README.md` – Verantwortung, Scope, Nicht-Scope
- `config.json` – maschinenlesbare Konfiguration (Status, Berechtigungen)

Erweiterungen wie `report.template.md` oder `inputs.md` sind erlaubt,
solange keine Logik produktive Effekte hat.
