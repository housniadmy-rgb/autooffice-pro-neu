# ADR-002 – Approval-Flow als Pflicht für kritische Aktionen

## Status

Accepted (2026-06-26)

## Kontext

Die AI Company orchestriert Aufgaben, die externen oder produktiven
Effekt haben können (z. B. Deploy, Veröffentlichung, Versand,
Datenbank-Migration, Kundenkommunikation). Ohne einen verbindlichen
Freigabe-Punkt entstehen mehrere Risiken:

- Autonome Aktionen ohne Vier-Augen-Prinzip.
- Mehrere Module könnten konkurrierend Approvals erteilen, was zu
  inkonsistenten Zuständen führt.
- Politische und regulatorische Anforderungen (DSGVO, ärztliche
  Sorgfaltspflicht im Praxis-Kontext) verlangen menschliche
  Rechenschaft für Außenwirkung.

Phase 7 hat `ai/engine/approvals` bereits als Genehmigungs-Modul
etabliert. Phase 9 fordert für `critical`-klassifizierte Operationen
zwingend eine CEO-Freigabe. Phase 11 stellt mit `role_ceo` und
`decide:approval` die Berechtigung dafür bereit.

## Entscheidung

1. **`ai/engine/approvals` ist die einzige Quelle der Wahrheit** für
   Genehmigungs-Records. Andere Module dürfen Freigabe **anfordern**
   (`request_approval`), aber **niemals** selbst einen
   Genehmigungs-Record schreiben.
2. Eine Aktion gilt als **kritisch**, wenn mindestens eines zutrifft:
   - Außenwirkung (E-Mail/Slack/Webhook, Deploy, externe API),
   - Schreibzugriff auf produktive Datenbestände,
   - irreversibler Effekt,
   - Klassifikation `critical` durch `ai/ops/policy`.
3. Kritische Aktionen **dürfen nicht ausgeführt werden**, solange kein
   `approval.granted`-Event mit gültigem Bezug auf die Aktion
   vorliegt.
4. Die Genehmigung erfolgt durch einen menschlichen Akteur mit Rolle
   `role_ceo` (oder einer delegierten Rolle, die durch ein späteres
   ADR eingeführt wird).
5. Jede Genehmigungs- oder Ablehnungs-Entscheidung erzeugt einen
   Audit-Eintrag (`engine.approval.granted` /
   `engine.approval.rejected`) gemäß ADR-004.

## Konsequenzen

Positiv:

- Klare Rechenschaft: jede kritische Aktion ist menschlich autorisiert
  und nachvollziehbar.
- Eine zentrale Approval-API verhindert konkurrierende Schreibwege.
- Die Klassifikation `safe` vs. `critical` ist in `ai/ops/policy`
  zentralisiert und kann pro Aktionstyp verschärft, nicht aber
  umgangen werden.

Negativ / zu tragen:

- Latenz: Aktionen warten auf menschliche Freigabe.
- Operatorische Last beim CEO; spätere Delegation muss durch ein
  Folge-ADR geregelt werden.
- Module, die heute Approval-Records selbst schreiben (Hub Decision
  Engine, Ops Policy), müssen ihre Verträge anpassen auf
  `request_approval`-Aufrufe.

Folge-Entscheidungen:

- Delegations-ADR für Stellvertretungen (zukünftig).
- Audit-Verkopplung gemäß ADR-004.
- Read-Modell für offene Approvals im Dashboard
  (`view_engine_operational`) gemäß ADR-006.
