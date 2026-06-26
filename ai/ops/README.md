# Autonomous Operations Platform – PraxisOnline24

Operative Schicht der AI Company. Während Phase 7 (`ai/engine`) die
Koordination und Phase 8 (`ai/hub`) die Ereignis- und
Intelligenzschicht definiert hat, sorgt Phase 9 für den **operativen
Vollzug**: Aufgaben werden in eine Queue eingespielt, automatisch an
Abteilungen verteilt, gegen Policies geprüft, in einer
Ausführungsschicht **simuliert**, ihre Wirkung in Health-Score und
Daily Digest sichtbar gemacht und in History + Audit-Log
nachvollziehbar dokumentiert.

## Status

- Phase: 9 (Grundarchitektur)
- Modus: passiv / deklarativ + Auto-Distribution (kein Vollzug)
- Branch: `praxisonline24-repositioning`
- Auto-Distribution: **erlaubt** (Operations Queue → Slot pro Abteilung)
- Auto-Execution: **deaktiviert** (Execution Manager läuft im Dry-Run)
- Auto-Publish: **deaktiviert**
- Auto-Deploy: **deaktiviert**
- GitHub-Schreibzugriffe: **deaktiviert**
- Bezug zur bestehenden App: **keiner** (`server.js`, `routes/`,
  `middleware/`, `data/`, `utils/`, `locales/`, `public/` unverändert)

## Module

| Modul              | Pfad              | Verantwortung                                            |
| ------------------ | ----------------- | -------------------------------------------------------- |
| Operations Queue   | `./queue`         | Aufnahme freigegebener Tasks, Auto-Distribution          |
| Execution Manager  | `./execution`     | Dry-Run-Ausführung, Slot-Belegung, Idempotenz            |
| Policy Engine      | `./policy`        | Klassifizierung sicher vs. kritisch, Approval-Gate       |
| Health Score       | `./health`        | Aggregierte Plattform-Gesundheit                         |
| CEO Daily Digest   | `./digest`        | Tageszusammenfassung für den CEO                         |
| Task History       | `./history`       | Verlauf abgeschlossener Tasks (read-only)                |
| Audit Log          | `./audit`         | Append-only Protokoll aller Entscheidungen               |

## Beziehungen zu Phase 7 & 8

- Quelle für Queue-Einträge: **`ai/engine/tasks`** im Zustand
  `approved` (oder explizit auto-distributable markiert) und der
  **CEO Event Feed** (`ai/hub/ceo-feed`) für Triggersignale.
- Approval-Gate verwendet **weiterhin `ai/engine/approvals`** – die
  Policy Engine darf eine Freigabe **anfordern**, niemals erteilen.
- Decision Engine (`ai/hub/decision-engine`) bleibt die zentrale
  Routing-Stelle für Events; die Ops-Platform reagiert ausschließlich
  auf Tasks und Approvals, nicht direkt auf Rohevents.

## Kommunikation der Module

```
 Engine.Tasks (approved)        Hub.Decision (create_task)
        │                              │
        └──────────────┬───────────────┘
                       ▼
                ┌──────────────────┐
                │ Operations Queue │── Auto-Distribution ──► Slot pro Abteilung
                └────────┬─────────┘
                         │ next_runnable()
                         ▼
                ┌──────────────────┐
                │  Policy Engine   │ klassifiziert: safe | critical
                └────┬────────┬────┘
              safe  │        │ critical
                    ▼        ▼
        ┌─────────────────┐  ┌──────────────────────────────┐
        │ Execution Mgr   │  │ engine.approvals (CEO Gate)  │
        │ (Dry-Run only)  │  │ requires_approval=true       │
        └────────┬────────┘  └───────┬──────────────────────┘
                 │                   │ approved → zurück in Queue
                 ▼                   │ rejected → History (rejected)
        ┌─────────────────┐          │
        │  Task History   │◄─────────┘
        └────────┬────────┘
                 │
                 ▼
        ┌─────────────────┐    ┌──────────────────┐    ┌──────────────────┐
        │   Audit Log     │ ─► │   Health Score   │ ─► │ CEO Daily Digest │
        │  (append-only)  │    │ (aggregiert)     │    │ (1× pro Tag)     │
        └─────────────────┘    └──────────────────┘    └────────┬─────────┘
                                                                ▼
                                                  CEO-Dashboard (Phase 7)
                                                    read-only
```

## Harte Regeln

1. **Auto-Distribution erlaubt, Auto-Execution nicht.** Die Queue darf
   einen Task autonom einer Abteilung zuweisen. Der Execution Manager
   führt in Phase 9 **ausschließlich Dry-Runs** durch.
2. **Kritisch ⇒ immer CEO-Freigabe.** Die Policy Engine klassifiziert
   jede Operation. Ist sie `critical`, ist `request_approval` an
   `ceo` Pflicht – es gibt keinen Bypass.
3. **Kein Deploy, kein Push, keine GitHub-API-Aufrufe.** Diese Phase
   enthält keinen einzigen Schreibpfad nach außen.
4. **Append-only Audit.** Jede klassifikations-, Distributions-,
   Ausführungs- und Freigabeentscheidung wird unveränderlich
   protokolliert.
5. **History ist read-only.** Tasks werden nach Abschluss in die
   History übernommen und nicht mehr verändert.
6. **Health Score ist abgeleitet.** Er besitzt keinen eigenen
   Schreibpfad in andere Module – andere Module konsumieren ihn,
   schreiben ihn aber nicht.

## Konventionen

Jedes Modul enthält mindestens:

- `README.md` – Verantwortung, Scope, Nicht-Scope
- eine maschinenlesbare Strukturdatei (`schema.json`, ggf. zusätzlich
  `policies.json`, `formula.md`, `states.md`)

## Nicht-Scope dieser Phase

- Keine reale Ausführung (Code-Änderungen, DB-Schreibvorgänge,
  externe API-Calls, Deploys, Releases, Notifications)
- Keine HTTP-Endpunkte, keine UI
- Keine Persistenz in der produktiven SQLite-Datenbank
- Keine LLM-/KI-Entscheidungen
- Keine Änderung an `server.js`, `routes/`, `middleware/`, `data/`,
  `utils/`, `locales/`, `public/`
