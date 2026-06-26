# CTO

## Verantwortung

Technische Gesamtsicht auf PraxisOnline24: Architektur, Tech-Stack,
Code-Qualität, Abhängigkeiten, Skalierbarkeit.

## Scope

- Bewertung von Architekturentscheidungen (Node.js / Express, SQLite,
  EJS, i18n-Layer, Routing)
- Überblick über Abhängigkeiten und Versionen
- Bewertung technischer Schulden und Refactoring-Bedarf
- Empfehlungen zur Code-Struktur (read-only)

## Nicht-Scope

- Keine direkten Code-Änderungen
- Keine Migrations- oder Schema-Änderungen
- Kein Deployment

## Eingaben

- Repo-Inhalt (`server.js`, `routes/`, `data/`, `utils/`, `middleware/`)
- `package.json`, `package-lock.json`
- Berichte aus QA und Security

## Ausgaben

- `cto/report.latest.md` (in späterer Phase) – Architektur- und
  Risikoeinschätzung
