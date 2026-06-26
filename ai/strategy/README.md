# Strategic Intelligence Platform – PraxisOnline24

Strategische Schicht der AI Company. Während Phase 6 die Abteilungen,
Phase 7 die Engine, Phase 8 den Event & Intelligence Hub und Phase 9
die Autonomous Operations Platform definiert haben, beantwortet
Phase 10 die Frage „Woran arbeitet das Unternehmen warum?“ und
liefert dem CEO **tägliche Prioritäten und Empfehlungen** – jedoch
niemals automatische Releases oder Deployments.

## Status

- Phase: 10 (Grundarchitektur)
- Modus: passiv / deklarativ / dokumentarisch
- Branch: `praxisonline24-repositioning`
- Auto-Release: **deaktiviert**
- Auto-Deploy: **deaktiviert**
- Auto-Publish: **deaktiviert**
- GitHub-Schreibzugriffe: **deaktiviert**
- Bezug zur bestehenden App: **keiner** (`server.js`, `routes/`,
  `middleware/`, `data/`, `utils/`, `locales/`, `public/` unverändert)

## Module

| Modul                    | Pfad                          | Verantwortung                                                |
| ------------------------ | ----------------------------- | ------------------------------------------------------------ |
| Strategy Engine          | `./strategy-engine`           | Strategische Themen, Prioritäten, Tagesempfehlungen          |
| Product Roadmap Manager  | `./roadmap`                   | Initiativen über Horizonte (Now/Next/Later), Abhängigkeiten  |
| Opportunity Scanner      | `./opportunities`             | Marktsignale, Branchenchancen, Feature-Hypothesen            |
| KPI Center               | `./kpi`                       | Definition, Owner und Zielwerte der Kennzahlen               |
| Risk Manager             | `./risk`                      | Strategisches Risiko-Register, Wahrscheinlichkeit × Wirkung  |
| Executive Dashboard      | `./executive-dashboard`       | Read-only Sicht für den CEO – Heute / Diese Woche / Quartal  |

## Beziehungen zu Phase 6–9

- KPI-Center konsumiert in späterer Phase Werte aus externen Quellen
  (Stripe, Analytics, Monitoring). In Phase 10 bleibt es bei der
  Definition – ohne Live-Werte.
- Strategische Empfehlungen entstehen rein lesend aus
  `ai/hub/ceo-feed`, `ai/ops/digest`, `ai/ops/health`, KPI- und
  Risk-Snapshots.
- Umsetzung läuft ausschließlich über die bestehenden Pfade:
  Empfehlung → `ai/engine/tasks` → `ai/engine/approvals` →
  `ai/ops/queue`. Die Strategy Engine umgeht den Approval-Flow nicht.
- Das Executive Dashboard ist eine **eigene** Sicht – das CEO-Dashboard
  aus Phase 7 bleibt für den operativen Tagesblick zuständig.

## Kommunikation der Module

```
                ┌──────────────────┐
                │   KPI Center     │── Definitionen, Ziel/Ist
                └────────┬─────────┘
                         │
                         ▼
 ┌──────────────────┐    │     ┌──────────────────┐
 │  Opportunity     │────┼────►│  Strategy Engine │── Themen, Prioritäten,
 │  Scanner         │    │     │  (regelbasiert)  │   Tagesempfehlungen
 └──────────────────┘    │     └────────┬─────────┘
                         │              │
 ┌──────────────────┐    │              │
 │  Risk Manager    │────┘              │
 │  (Register +     │                   │
 │   Matrix)        │                   │
 └──────────────────┘                   │
                                        │ erzeugt
                                        ▼
                          ┌────────────────────────┐
                          │ Product Roadmap Mgr.   │── Initiativen,
                          │ (Now / Next / Later)   │   Horizonte
                          └────────┬───────────────┘
                                   │ liefert geplante Initiativen
                                   ▼
                          ┌────────────────────────┐
                          │  Executive Dashboard   │ read-only
                          │  (Tag / Woche / Quartal│
                          └────────┬───────────────┘
                                   │
                                   ▼  Empfehlungen mit Approval-Pflicht
              ┌───────────────────────────────────────────────────┐
              │  ai/engine/tasks → ai/engine/approvals (CEO)      │
              │  → ai/ops/queue (auto-distribute, dry-run only)    │
              └───────────────────────────────────────────────────┘
```

## Harte Regeln

1. **Keine eigenständigen Releases.** Strategy Engine und Roadmap
   Manager können Initiativen vorschlagen, aber niemals selbst
   anstoßen.
2. **Empfehlung ≠ Aktion.** Jede strategische Empfehlung wird zu einem
   ganz normalen Task im Engine-Workflow inkl. Approval-Pflicht.
3. **KPI-Werte sind extern-only.** In Phase 10 werden ausschließlich
   Definitionen, Owner und Zielwerte hinterlegt. Reale Ist-Werte
   kommen erst über spätere Anbindungen.
4. **Read-only nach außen.** Kein Versand, keine externen API-Calls,
   keine GitHub-Schreibvorgänge.
5. **Eine Sicht je Zielgruppe.** Das Executive Dashboard ist
   strategisch (Tag/Woche/Quartal); das CEO-Dashboard aus Phase 7
   bleibt operativ (Queue, Approvals, Health) und wird hier nicht
   ersetzt.

## Konventionen

Jedes Modul enthält mindestens:

- `README.md` – Verantwortung, Scope, Nicht-Scope
- eine maschinenlesbare Strukturdatei (`schema.json`, ggf. zusätzlich
  Katalog oder Spezifikation)

## Nicht-Scope dieser Phase

- Keine echte KPI-Erhebung (kein Stripe, kein Analytics, kein
  Monitoring-Pull)
- Keine LLM-/KI-Inferenz für Empfehlungen
- Keine HTTP-Endpunkte, keine UI
- Keine Anbindung an die produktive SQLite-Datenbank
- Keine Änderung an `server.js`, `routes/`, `middleware/`, `data/`,
  `utils/`, `locales/`, `public/`
