# Automation Engine – PraxisOnline24

Koordinationsschicht der AI Company. Die Engine bringt die Abteilungen
aus `ai/` in einen geordneten Arbeitsablauf: Aufgaben werden erfasst,
in Workflows verkettet, priorisiert, freigegeben und in einem
Datenmodell für ein späteres CEO-Dashboard bereitgestellt.

## Status

- Phase: 7 (Grundarchitektur)
- Modus: passiv / deklarativ / dokumentarisch
- Branch: `praxisonline24-repositioning`
- Auto-Execute: deaktiviert
- Auto-Publish: deaktiviert
- Bezug zu bestehender App (Express/SQLite/EJS): **keiner**

In dieser Phase werden **keine produktiven Aktionen** ausgeführt. Die
Engine ist ausschließlich als Datenmodell und Spezifikation angelegt.

## Module

| Modul              | Pfad                | Verantwortung                                   |
| ------------------ | ------------------- | ----------------------------------------------- |
| Task Manager       | `./tasks`           | Erfassung und Lebenszyklus einzelner Aufgaben   |
| Workflow Manager   | `./workflows`       | Verkettung von Aufgaben zu Abläufen             |
| Prioritäts-System  | `./priority`        | Bewertung und Reihung von Aufgaben/Workflows    |
| Genehmigungs-Flow  | `./approvals`       | Menschliche Freigabe vor jeder Veröffentlichung |
| CEO-Dashboard      | `./dashboard`       | Read-only Datenmodell für Gesamtüberblick       |
| Abteilungs-Status  | `./status`          | Aktueller Zustand jeder AI-Abteilung            |

## Kommunikation der Module

```
                ┌──────────────────────────────────────┐
                │           Abteilungs-Status          │
                │    (ai/engine/status, read-only)     │
                └──────────────▲───────────────────────┘
                               │ liest Zustand
                               │
   ┌──────────────┐   erzeugt  │   gruppiert     ┌────────────────────┐
   │  Abteilung   │───────────►│ Task ──────────►│  Workflow Manager  │
   │ (cto, qa, …) │            │ Manager         │                    │
   └──────────────┘            └────┬────────────┴─────────┬──────────┘
                                    │ bewertet             │ verkettet
                                    ▼                      ▼
                            ┌─────────────────┐   ┌──────────────────┐
                            │ Prioritäts-     │   │ Genehmigungs-    │
                            │ System          │   │ Workflow         │
                            └────────┬────────┘   └─────────┬────────┘
                                     │ Rang                 │ Freigabe (Mensch)
                                     └───────────┬──────────┘
                                                 ▼
                                       ┌───────────────────┐
                                       │   CEO-Dashboard   │
                                       │   (Datenmodell)   │
                                       └───────────────────┘
```

Kernregeln des Flusses:

1. **Eingabe nur durch Abteilungen.** Eine Abteilung erzeugt einen
   Task über das Task-Manager-Schema. Tasks ohne Abteilung sind
   ungültig.
2. **Workflow vor Priorisierung.** Der Workflow-Manager bündelt
   verwandte Tasks. Erst Workflows werden priorisiert, dann ihre Tasks
   sortiert.
3. **Priorisierung vor Freigabe.** Das Prioritäts-System ordnet
   `critical → high → medium → low → info`. Der Approval-Flow wird nur
   für Schritte mit `requires_approval: true` aktiviert.
4. **Freigabe ist menschlich.** Kein Approval-Schritt darf
   automatisiert gesetzt werden. Ohne Freigabe wird nichts ausgeführt
   und nichts veröffentlicht.
5. **Dashboard ist read-only.** Das CEO-Dashboard konsumiert Tasks,
   Workflows, Prioritäten, Approvals und Department-Status, schreibt
   aber nichts zurück.

## Konventionen

Jedes Modul enthält mindestens:

- `README.md` – Verantwortung, Scope, Nicht-Scope
- `schema.json` *oder* eine andere maschinenlesbare Strukturdatei

Daten- und Zustands-Spezifikationen werden zusätzlich in Markdown
beschrieben (`states.md`, `rules.md`, `policy.md`), damit der Aufbau
für spätere Code-Implementierungen eindeutig ist.

## Nicht-Scope dieser Phase

- Keine Ausführung von Tasks oder Workflows
- Keine Persistenz in der bestehenden SQLite-Datenbank
- Keine HTTP-Endpunkte, keine UI-Anbindung
- Keine Anbindung an Cron, Queues oder externe Systeme
- Keine Änderung an `server.js`, `routes/`, `middleware/`, `data/`,
  `utils/` oder `locales/`
