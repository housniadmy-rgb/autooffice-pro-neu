# Operations

## Verantwortung

Betriebsbezogene Routinen: Deployments, Tasks, Infrastruktur,
Datensicherung – ausschließlich beschreibend in dieser Phase.

## Scope

- Überblick über Deployment-Konfigurationen (`render.yaml`,
  `DEPLOYMENT.md`)
- Liste wiederkehrender Aufgaben (Backups, Migrationen, Skripte)
- Verantwortlichkeiten und Reihenfolgen bei Releases
- Schnittstelle zu CTO (Architektur) und Security (Zugriffe)

## Nicht-Scope

- Kein automatisches Deployment
- Keine automatische Ausführung von Skripten unter `scripts/`
- Keine Änderung an Infrastruktur

## Eingaben

- `render.yaml`, `DEPLOYMENT.md`
- `scripts/`
- Reports aus CTO, Security und Monitoring

## Ausgaben

- `operations/report.latest.md` – Status, Risiken, anstehende Routinen
