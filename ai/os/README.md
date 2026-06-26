# AI Operating System (AI OS) – PraxisOnline24

Fundament der AI Company. Während Phase 6 die Abteilungen, Phase 7 die
Engine, Phase 8 den Event & Intelligence Hub, Phase 9 die Autonomous
Operations Platform und Phase 10 die Strategic Intelligence Platform
definiert haben, liefert Phase 11 die **gemeinsame Plattform**, auf der
alle bisherigen AI-Module künftig aufsetzen: ein Operating System für
AI-Agenten mit einheitlicher Identität, Kommunikation, Speicher,
Berechtigungen und Beobachtbarkeit.

## Status

- Phase: 11 (Grundarchitektur)
- Modus: passiv / deklarativ / dokumentarisch
- Branch: `praxisonline24-repositioning`
- Auto-Execute: **deaktiviert**
- Auto-Publish: **deaktiviert**
- Auto-Deploy: **deaktiviert**
- Externe API-Aufrufe: **deaktiviert**
- Secrets: **keine** (kein Secret-Speicher, keine Credentials)
- GitHub-Schreibzugriffe: **deaktiviert**
- Bezug zur bestehenden App: **keiner** (`server.js`, `routes/`,
  `middleware/`, `data/`, `utils/`, `locales/`, `public/` unverändert)

In dieser Phase werden **keine produktiven Aktionen** ausgeführt. Das
AI OS ist ausschließlich als Schnittstellen-, Daten- und
Sicherheitsspezifikation angelegt. Es ersetzt keines der bisherigen
Phasen-Module, sondern definiert die Plattform, an die sie sich später
anschließen können.

## Module

| Modul              | Pfad                   | Verantwortung                                                       |
| ------------------ | ---------------------- | ------------------------------------------------------------------- |
| Agent Registry     | `./agent-registry`     | Identität, Capabilities und Lebenszyklus jedes Moduls/Agenten       |
| Message Bus        | `./message-bus`        | Einheitliches Pub/Sub-Envelope-Format zwischen Agenten              |
| Scheduler          | `./scheduler`          | Deklarative Zeit- und Trigger-Definitionen (cron / interval / once) |
| Memory             | `./memory`             | Kurz-, Langzeit- und Shared-Memory-Namespaces                       |
| Event Router       | `./event-router`       | Regelbasiertes Routing von Bus-Events an Subscriber                 |
| Permissions        | `./permissions`        | Rollen, Scopes und Aktionen pro Agent (RBAC-Modell)                 |
| Audit              | `./audit`              | Append-only Protokoll aller Plattform-Entscheidungen                |
| Dashboard API      | `./dashboard-api`      | Read-only Aggregations-Endpunkte für UIs (Spezifikation)            |
| API Gateway        | `./api-gateway`        | Externer Einstiegspunkt für künftige Clients (deaktiviert)          |

## Verhältnis zu Phase 6–10

Das AI OS **integriert** die bestehenden Phasen, ohne sie zu ersetzen:

- Phase 6 – Abteilungen (`ai/<dept>`): werden in der **Agent Registry**
  als Agenten geführt (Owner, Capabilities, Status).
- Phase 7 – Engine (`ai/engine/*`): Tasks, Workflows, Priority,
  Approvals, Dashboard, Status werden als **Service-Agenten** in der
  Registry geführt und kommunizieren über den **Message Bus**.
- Phase 8 – Hub (`ai/hub/*`): Event Hub, Registry (Event-Typen),
  Knowledge Base, Decision Engine, Notifications, CEO Feed werden
  durchgehend über den **Event Router** an Subscriber verteilt.
- Phase 9 – Ops (`ai/ops/*`): Queue, Execution, Policy, Health, Digest,
  History, Audit werden vom **Scheduler** angesteuert und durch
  **Permissions** abgesichert.
- Phase 10 – Strategy (`ai/strategy/*`): Strategy Engine, Roadmap,
  Opportunities, KPI, Risk, Executive Dashboard nutzen die
  **Dashboard API** als read-only Aggregations-Layer.

Es gibt **keinen** Weg, der die bisherigen Approval-Pflichten umgeht.
Das AI OS ist eine **Plattform**, kein Bypass.

## Kommunikationsfluss

```
                          ┌──────────────────────────────┐
                          │       Agent Registry         │
                          │  Identität, Capabilities,    │
                          │  Health, Lifecycle           │
                          └──────────────▲───────────────┘
                                         │ registriert / liest
                                         │
                                         │
   ┌─────────────────────────────────────┼─────────────────────────────────────┐
   │                                     │                                     │
   ▼                                     ▼                                     ▼
┌──────────────┐ publish/subscribe ┌──────────────┐  routet via   ┌──────────────────┐
│   Agent A    │ ────────────────► │ Message Bus  │ ────────────► │  Event Router    │
│  (z. B.      │ ◄──────────────── │ (Envelope)   │ ◄──────────── │ (Rules, Targets) │
│   ai/engine) │                   └──────┬───────┘               └────────┬─────────┘
└──────┬───────┘                          │                                │
       │                                  │ delivery                       │ deliver
       │ liest/schreibt                   │                                ▼
       ▼                                  │                       ┌──────────────────┐
┌──────────────┐    konsultiert           │                       │    Agent B       │
│   Memory     │◄────────┐                │                       │ (z. B. ai/ops)   │
│  (scopes)    │         │                │                       └──────────────────┘
└──────────────┘         │                │
                         │                │
                         │ jede Aktion    │
                         │ wird geprüft   │
                         ▼                │
                  ┌──────────────┐        │
                  │ Permissions  │────────┤
                  │ (RBAC)       │        │
                  └──────┬───────┘        │
                         │ allow / deny   │
                         ▼                ▼
                  ┌─────────────────────────────┐
                  │           Audit             │
                  │      (append-only)          │
                  └──────────────┬──────────────┘
                                 │ liest
                                 ▼
                  ┌─────────────────────────────┐
                  │       Dashboard API         │
                  │      (read-only views)      │
                  └──────────────┬──────────────┘
                                 │ optional, später
                                 ▼
                  ┌─────────────────────────────┐
                  │        API Gateway          │
                  │   (extern, deaktiviert)     │
                  └─────────────────────────────┘

                     ┌─────────────────────┐
                     │     Scheduler       │ ── feuert Trigger → Message Bus
                     │ (cron / interval)   │
                     └─────────────────────┘
```

Lesbar in Worten:

1. Jeder Agent ist in der **Agent Registry** registriert und nennt
   seine `capabilities`, `subscriptions` und seine geforderten
   `permissions`.
2. Agenten kommunizieren ausschließlich über den **Message Bus** mit
   einem standardisierten Envelope. Direkte Imports oder
   Cross-Module-Calls sind nicht vorgesehen.
3. Der **Event Router** wendet deklarative Regeln an, um Nachrichten
   vom Bus an die richtigen Subscriber, an die Engine oder an das
   Notification Center weiterzuleiten.
4. Vor jeder schreibenden Aktion fragt der Agent die **Permissions**
   ab. Eine Verweigerung erzeugt einen `permission.denied`-Audit-Eintrag.
5. **Memory** ist nach Scope getrennt (`agent` / `department` /
   `shared`). Lese-/Schreibrechte werden über die Permissions geprüft.
6. Der **Scheduler** triggert weder Code noch APIs direkt – er
   publiziert ausschließlich `scheduler.tick`-Events auf dem Bus.
7. **Audit** ist append-only und konsumiert jeden relevanten
   Lifecycle-Event (registry, bus, scheduler, permissions, router).
8. Die **Dashboard API** spezifiziert read-only Views, die später
   bestehende UIs/Phasen befüllen. Sie schreibt nichts zurück.
9. Das **API Gateway** ist die geplante externe Tür. In Phase 11 ist
   sie **geschlossen** – kein Listener, keine Route aktiv.

## Sicherheitsmodell

| Schutzziel        | Mechanismus                                                                 |
| ----------------- | --------------------------------------------------------------------------- |
| Identität         | Agent Registry – jede Aktion ist einem registrierten Agenten zugeordnet     |
| Autorisierung     | Permissions – Rollen × Scopes × Actions; default `deny`                     |
| Mandantentrennung | Memory-Scopes (`agent` / `department` / `shared`) + Permission-Checks       |
| Nicht-Repudiation | Audit – append-only, signaturen-fähiges Schema, keine Lösch- oder Edit-API  |
| Außenwirkung      | API Gateway nur als Spezifikation; Engine-Approval-Flow bleibt verbindlich  |
| Secrets           | **Kein** Secret-Speicher im AI OS; Credentials außerhalb dieser Phase       |
| Geheimhaltung     | Keine PII in Bus-Envelopes; nur IDs, Referenzen, Klassifikatoren            |
| Sandbox           | Execution bleibt in `ai/ops/execution` (Dry-Run); AI OS startet nichts      |

Default-Werte:

- `default_permission`: `deny`
- `default_bus_delivery`: `at-least-once` (Spezifikation, kein Transport)
- `default_event_visibility`: `internal` (nicht via API Gateway exponiert)
- `default_memory_scope`: `agent` (kein Default-Share)
- `default_audit_retention`: `append-only / unlimited` (Spezifikation)

## Erweiterungspunkte

Das AI OS ist absichtlich so geschnitten, dass spätere Phasen Module
ergänzen können, ohne die Architektur zu brechen:

- **Registry-Adapter** (`agent-registry`): Schema kann durch
  `health_endpoint`, `runtime`, `version`, `model` ergänzt werden.
- **Bus-Transport** (`message-bus`): Envelope ist transport-agnostisch.
  Spätere Implementierungen können Node-EventEmitter, Vercel Queues,
  Redis-Streams oder NATS einsetzen, ohne das Envelope-Schema zu ändern.
- **Scheduler-Backends** (`scheduler`): Deklarative Jobs lassen sich
  später an `node-cron`, Vercel Cron oder externe Worker binden.
- **Memory-Backends** (`memory`): Pluggable Stores (in-memory, SQLite,
  Postgres, Vector-DB). Scopes und Keys bleiben stabil.
- **Router-Regeln** (`event-router`): Regeln sind in `routes.json`
  deklarativ. Neue Regeln können additiv hinzukommen.
- **Permissions-Erweiterungen** (`permissions`): Neue Rollen, Scopes
  und Actions sind additiv. Bestehende Defaults bleiben `deny`.
- **Audit-Sinks** (`audit`): Audit-Schreibziele (Datei, DB, externes
  SIEM) sind später hinter einem Adapter austauschbar.
- **Dashboard-Views** (`dashboard-api`): Neue Views erweitern den
  Katalog. Bestehende bleiben rückwärtskompatibel.
- **Gateway-Endpoints** (`api-gateway`): Bleiben default `disabled`.
  Aktivierung erfordert dokumentierten Approval-Eintrag.

## Konventionen

Jedes Modul enthält mindestens:

- `README.md` – Verantwortung, Scope, Nicht-Scope, Erweiterungspunkte
- eine maschinenlesbare Strukturdatei (`schema.json`)
- ergänzend ggf. Kataloge (`topics.json`, `routes.json`, `roles.json`,
  `jobs.json`, `endpoints.json`, `agents.json`)

## Harte Regeln

1. **Plattform, kein Bypass.** Das AI OS umgeht keinen
   Approval-Schritt aus den Phasen 7–10.
2. **Identität ist Pflicht.** Eine Aktion ohne registrierten
   `agent_id` ist ungültig.
3. **Default deny.** Permissions, Bus-Subscriptions und
   Gateway-Routen sind standardmäßig nicht erlaubt.
4. **Append-only Audit.** Audit-Einträge werden niemals geändert oder
   gelöscht.
5. **Keine Secrets, keine externen Calls, kein Deploy.** Diese Phase
   führt keinen Code aus, der das System verlässt.
6. **Read-only Dashboard.** Dashboard API schreibt nichts zurück;
   API Gateway ist nicht aktiv.

## Nicht-Scope dieser Phase

- Keine konkrete Bus-Implementierung (kein Worker, kein Broker)
- Keine HTTP-Endpunkte, keine UI, kein Listener
- Keine echten Cron-Registrierungen oder Timer
- Keine Anbindung an die produktive SQLite-Datenbank
- Keine LLM-/KI-Inferenz oder Modellauswahl im OS-Code
- Keine Änderung an `server.js`, `routes/`, `middleware/`, `data/`,
  `utils/`, `locales/`, `public/`
