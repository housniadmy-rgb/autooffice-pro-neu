# Strategy Engine

## Verantwortung

Verbindet Kennzahlen (KPI Center), Chancen (Opportunity Scanner) und
Risiken (Risk Manager) zu einer kleinen, geordneten Liste strategischer
Themen und Tagesempfehlungen für den CEO. Regelbasiert, kein LLM.

## Scope

- Datenmodell für strategische Themen und Tagesempfehlungen
  (`schema.json`)
- Initialer Satz strategischer Themen (`themes.json`)
- Ableitungslogik: aus Signalen (KPI-Abweichung, Opportunity-Score,
  Risiko-Trend) entstehen Empfehlungen
- Reihenfolgeregeln und Konfliktauflösung

## Nicht-Scope

- Keine direkte Ausführung – Empfehlungen werden zu Engine-Tasks und
  durchlaufen den Approval-Flow (Phase 7)
- Keine eigenen Releases oder Deployments
- Keine LLM-Entscheidungen in dieser Phase

## Eingaben

- KPI-Definitionen + Zielwerte (`../kpi`)
- Opportunities mit Score (`../opportunities`)
- Risiken mit Wahrscheinlichkeit × Wirkung (`../risk`)
- Health Score und Daily Digest (`ai/ops/health`, `ai/ops/digest`)
- CEO Event Feed (`ai/hub/ceo-feed`)

## Ausgaben

- `themes[]` – stabile strategische Themen (z. B. „Repositionierung
  Multi-Industry“, „Compliance/DSGVO“, „Conversion-Optimierung
  Branchen-LP“)
- `recommendations[]` – tägliche Empfehlungen mit Begründung,
  Priorität, vorgeschlagener Owner-Abteilung
- Jede Empfehlung trägt `requires_approval: true`

## Ableitungslogik (Spezifikation, nicht ausgeführt)

1. Für jedes KPI mit `actual` außerhalb des `target`-Korridors:
   Kandidat-Empfehlung erzeugen.
2. Für jedes Opportunity mit `score >= threshold`: Kandidat erzeugen.
3. Für jedes Risiko mit `severity >= high`: Kandidat erzeugen.
4. Kandidaten gegen aktive Themen mappen (`theme_id`).
5. Sortieren nach `priority_score = theme_weight * signal_strength`.
6. Top-N pro Tag in `recommendations[]` schreiben – ohne automatische
   Folgeaktion.
