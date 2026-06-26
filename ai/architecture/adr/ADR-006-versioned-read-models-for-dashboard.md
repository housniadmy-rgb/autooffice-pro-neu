# ADR-006 – Versionierte Read-Models für das Dashboard

## Status

Accepted (2026-06-26)

## Kontext

Das CEO-Dashboard wird Daten aus allen Sektionen aggregieren:
Core, Departments, Engine, Intelligence, Operations, Security,
Integrations, Dashboard. Im heutigen Stand greift die
`ai/os/dashboard-api/endpoints.json` direkt auf interne Pfade
(`/latest/summary`, `/latest/score`) der Quell-Module zu.

Das führt zu drei Risiken:

- **Brüche bei interner Änderung:** Sobald ein Modul seine
  internen Datenstrukturen umorganisiert, brechen Dashboard-Views.
- **Leak-Risiko:** Direkter Zugriff auf interne Felder kann PII
  oder Secrets exponieren, wenn dort versehentlich welche stehen.
- **Unklare Verträge:** Es ist nicht erkennbar, welche Felder
  „Dashboard-tauglich" sind und welche internen Charakter haben.

## Entscheidung

1. **Jedes Hauptmodul exportiert ein eigenes Read-Model** als
   versionierte Datei: `read-model.v<n>.json`.
2. **Read-Models enthalten ausschließlich Dashboard-sichere Felder.**
   Verpflichtende Feldliste:
   - `id`
   - `name`
   - `status`
   - `owner`
   - `health_score`
   - `last_updated`
   - `summary`
   - `warnings`
   - `next_actions`
3. **Read-Models enthalten keine internen Pfade,** keine PII, keine
   Secrets, keine vollen Payloads.
4. **Versionierung ist Pflicht.** Eine Änderung am Feldsatz erzeugt
   eine neue Datei (`read-model.v2.json`), während `v1` weiter
   bestehen bleibt, bis Konsumenten migriert sind.
5. **Dashboard API konsumiert ausschließlich Read-Models,** niemals
   interne Modul-Dateien. Damit ist die Kopplung zwischen
   Dashboard und Modul auf das Read-Model reduziert.
6. **Heutiger Stand (Phase 11):** Read-Models sind Spezifikation und
   werden manuell gepflegt. Spätere Phasen können sie aus
   Modul-Manifesten generieren.

## Konsequenzen

Positiv:

- Module evolvieren intern frei, ohne das Dashboard zu brechen.
- Der Dashboard-Vertrag ist auf einen Blick prüfbar (eine Datei,
  feste Feldliste).
- PII-/Secret-Leak-Risiko gemäß ADR-005 sinkt strukturell, weil
  Read-Models keine vollen Payloads exportieren.
- Versions-Disziplin macht Migrationen sichtbar und planbar.

Negativ / zu tragen:

- Doppelte Pflege: Modul-State **und** Read-Model. Aggregation ist
  nicht automatisiert.
- Mehrfeld-Sichten brauchen ggf. eine Aggregations-Spec über mehrere
  Read-Models (zukünftige Erweiterung).
- Strenge Feldliste kann ungenügend sein, wenn neue Anforderungen
  zusätzliche Felder verlangen – dann ist ein `v2` einzuführen statt
  `v1` zu erweitern.

Folge-Entscheidungen:

- Aggregations-Specs zwischen Read-Models und Dashboard-Views
  (zukünftig).
- Generator aus Modul-Manifesten (zukünftig).
- Erweiterung des Feldsatzes ausschließlich über neue Versionen
  (`v2`, `v3`, …).
