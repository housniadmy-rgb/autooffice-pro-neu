# Security

## Verantwortung

Sicherheits- und Datenschutzperspektive auf PraxisOnline24
(Authentifizierung, Sessions, DSGVO, Secret-Hygiene).

## Scope

- Bewertung von Auth-Flows und Sessions
- Prüfung auf bekannte Schwachstellen in Dependencies
- DSGVO-Konformität (Hosting in EU, Datenminimierung, Cookie-Hinweise)
- Secret-Hygiene (keine Secrets im Repo / Logs)

## Nicht-Scope

- Keine Penetrationstests gegen die Live-Umgebung
- Keine automatischen Sperren von Accounts
- Keine direkten Code-Patches – nur Empfehlungen

## Eingaben

- `middleware/`, `routes/`, `utils/`, `package.json`
- Bestehende Konfigurationen (`render.yaml`, `DEPLOYMENT.md`)

## Ausgaben

- `security/report.latest.md` – Risiken nach Schweregrad, Empfehlungen
