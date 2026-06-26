# CEO Dashboard v1

Sprint 1 – erstes echtes CEO Dashboard auf Basis der vorhandenen AI-OS-Architektur.

## Status

- Phase: 11 (Read-only)
- Branch: `praxisonline24-repositioning`
- Modus: **lesend**, keine produktiven Aktionen
- Auto-Execute: deaktiviert
- Auto-Publish: deaktiviert
- Auto-Deploy: deaktiviert
- Externe API-Aufrufe: keine
- Bezug zur bestehenden App (`server.js`, `routes/`, `middleware/`, `public/`): **keiner**

## Datei

| Datei        | Zweck                                                  |
| ------------ | ------------------------------------------------------ |
| `index.html` | Eigenständiges Dashboard, das nur Read-Models liest    |
| `README.md`  | Dieses Dokument                                        |

Das Dashboard ist eine eigenständige HTML-Seite. Es kann direkt im Browser
geöffnet werden (`file://…/ai/os/dashboard/v1/index.html`) oder später als
read-only View in PraxisOnline24 integriert werden.

## Datenquellen (ausschließlich)

Das Dashboard liest **nur** versionierte Read-Models gemäß ADR-006:

| Read-Model                                       | Genutzt für (Module)                       |
| ------------------------------------------------ | ------------------------------------------ |
| `ai/os/core/read-model.v1.json`                  | Systemstatus, Unternehmensübersicht, Health, Aufgaben, Empfehlungen, Events |
| `ai/os/engine/read-model.v1.json`                | Systemstatus, Unternehmensübersicht, Health, Aufgaben, Empfehlungen, Events |
| `ai/os/departments/read-model.v1.json`           | Abteilungen, Unternehmensübersicht, Health, Aufgaben, Empfehlungen, Events  |
| `ai/os/intelligence/read-model.v1.json`          | Unternehmensübersicht, Health, Aufgaben, Empfehlungen, Events               |
| `ai/os/operations/read-model.v1.json`            | Systemstatus (Auto-Execution-Flag), Unternehmensübersicht, Health, Aufgaben, Empfehlungen, Events |
| `ai/os/security/read-model.v1.json`              | Unternehmensübersicht, Health, Aufgaben, Empfehlungen, Events               |
| `ai/os/integrations/read-model.v1.json`          | Systemstatus (paused-Anzeige), Unternehmensübersicht, Health, Aufgaben, Empfehlungen, Events |
| `ai/os/dashboard/read-model.v1.json`             | Unternehmensübersicht, Health, Aufgaben, Empfehlungen, Events               |

Es gibt **keine** direkten Zugriffe auf interne Moduldateien (kein
`agents.json`, kein `endpoints.json`, kein `events.md` u.s.w.). Diese
Spec-Artefakte sind im Read-Model bereits zusammengefasst.

## Module

| # | Modul                  | Datenfeld pro Read-Model           | Aggregation              |
| - | ---------------------- | ---------------------------------- | ------------------------ |
| 1 | Systemstatus           | `status`, `health_score`, `warnings` | KPI-Reihe über alle 8     |
| 2 | Unternehmensübersicht  | `name`, `summary`, `status`, `owner`, `last_updated` | 8 Sektions-Karten        |
| 3 | Abteilungen            | `departments.summary`              | Chips je Abteilung       |
| 4 | Health Scores          | `health_score`                     | Balken je Sektion        |
| 5 | CEO-Aufgaben           | `next_actions`                     | Vereinigt aus 8 Sektionen |
| 6 | Empfehlungen           | `warnings`                         | Vereinigt aus 8 Sektionen |
| 7 | Letzte Ereignisse      | `last_updated`, `status`, `owner`  | Sortiert desc            |

## Datenfluss

```
                    ┌─────────────────────────────────────────────────┐
                    │           ai/os/<section>/read-model.v1.json     │
                    │  (core · engine · departments · intelligence ·   │
                    │   operations · security · integrations · dashb.) │
                    └────────────────────────┬─────────────────────────┘
                                             │  Phase 11: eingebettet
                                             │  (später: fetch über
                                             │   Dashboard-API-View
                                             │   z. B. view_ceo_today)
                                             ▼
                    ┌─────────────────────────────────────────────────┐
                    │  ai/os/dashboard/v1/index.html                   │
                    │  (read-only Renderer, keine Mutation)            │
                    │                                                  │
                    │  ┌─ 1 Systemstatus    ┌─ 5 CEO-Aufgaben          │
                    │  ├─ 2 Übersicht       ├─ 6 Empfehlungen          │
                    │  ├─ 3 Abteilungen     └─ 7 Letzte Ereignisse     │
                    │  └─ 4 Health Scores                              │
                    └─────────────────────────────────────────────────┘
```

## Spätere Integration in PraxisOnline24

Wenn das Dashboard produktiv in PraxisOnline24 eingebunden wird, ersetzt
ein einziger `fetch()`-Aufruf den eingebetteten `READ_MODELS`-Block. Die
Renderer-Logik bleibt unverändert.

Zielanbindung gemäß `ai/os/dashboard-api/endpoints.json`:

- `view_ceo_today` – CEO-Tagesblick
- `view_platform_health` – Health-Aggregation
- `view_audit_recent` – Letzte Ereignisse

## Design

- Modernes, ruhiges Layout (CSS Variables, keine externen Frameworks)
- Responsive: 4 → 2 → 1 Spalten
- Hell/Dunkel-Modus vorbereitet (`data-theme="light|dark"`,
  `prefers-color-scheme`, persistente Auswahl in `localStorage`)
- Keine externen Schriften, keine Tracker, keine Online-Assets
