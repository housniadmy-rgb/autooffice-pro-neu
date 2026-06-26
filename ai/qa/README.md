# QA

## Verantwortung

Qualitätssicherung von PraxisOnline24: funktionale Tests, Regressionen,
Übersetzungen, UX-Konsistenz, Linkprüfung, Formularverhalten.

## Scope

- Definition und Pflege von Testfällen (`QA_CHECKLIST.md` ist die
  bestehende Referenz)
- Bewertung von Bugfixes und Verifikation
- Prüfung von i18n-Vollständigkeit (`locales/`)
- Konsistenz öffentlicher Seiten (Navigation, Footer, CTAs)

## Nicht-Scope

- Keine produktiven Tests gegen Live-Datenbank
- Keine automatische Korrektur von Bugs
- Kein Deployment

## Eingaben

- `QA_CHECKLIST.md`
- Routen unter `routes/`
- Übersetzungsdateien unter `locales/`

## Ausgaben

- `qa/report.latest.md` – Befunde, Schweregrade, empfohlene Reproschritte
