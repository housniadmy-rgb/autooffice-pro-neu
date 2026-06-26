# KPI Center

## Verantwortung

Verbindliche Definition aller strategischen Kennzahlen für
PraxisOnline24: Name, Owner-Abteilung, Einheit, Quelle, Zielwert,
Toleranzkorridor, Aktualisierungsfrequenz. In Phase 10 ausschließlich
**Definitionen**, **keine** Ist-Werte.

## Scope

- Datenmodell einer KPI-Definition (`schema.json`)
- Initialer KPI-Katalog (`catalog.json`)
- Quellen-Spezifikation (woher würde der Ist-Wert kommen)
- Konvention für `target` / `target_min` / `target_max`

## Nicht-Scope

- Kein Pull von Live-Daten aus Stripe, Analytics, Monitoring etc.
- Keine eigene Visualisierung
- Keine eigenen Notifications oder Alerts
- Keine Kunden- oder Tarifdaten

## Eingaben

- Vorschläge neuer KPIs aus den Abteilungen
- Themen aus `../strategy-engine`

## Ausgaben

- KPI-Definitionen, konsumiert von Strategy Engine, Risk Manager,
  Roadmap Manager und Executive Dashboard

## Datenquellen (Spezifikation, nicht angebunden)

| Quelle      | Typische KPIs                                          |
| ----------- | ------------------------------------------------------ |
| Stripe      | Umsatz, MRR, Churn, ARPU, Trial → Paid                 |
| Analytics   | Sitzungen, organischer Traffic, LP-Conversion          |
| Monitoring  | Uptime, P95-Latenz, Fehlerrate                         |
| GitHub      | Lead-Time, Deploy-Frequenz (nur lesend, später)        |
| Intern      | Support-Volumen, Anzahl freigegebener Empfehlungen     |

In Phase 10 sind alle Anbindungen **nicht** verbunden. KPI-Einträge
tragen `source.kind` und `source.id`, aber `actual` bleibt leer, bis
in einer späteren Phase ein read-only Pull angebunden wird.
