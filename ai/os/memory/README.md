# Memory

## Verantwortung

Plattformweiter Speicher-Layer für Agenten. Memory definiert
**Namespaces** und **Lebensdauern** für drei klar getrennte Scopes:

- **Short-term** – flüchtige Zustände eines laufenden Workflows
- **Long-term** – persistente Wissensbestände eines Agenten oder einer
  Abteilung
- **Shared** – explizit geteilte, mehrschichtig zugängliche Einträge

In dieser Phase wird **kein Store** implementiert. Memory ist ein
Vertrag: Welche Keys es gibt, wer sie lesen/schreiben darf, wie lange
sie leben.

## Scope

- Datenmodell für Einträge (`schema.json`)
- Scope-Definitionen (`scopes.md`)
- Namensraum-Konvention und Default-TTLs
- Lese-/Schreibrechte (via `ai/os/permissions`)

## Nicht-Scope

- Keine konkrete Implementierung (kein KV, kein Redis, kein
  Vektor-Store)
- Keine Anbindung an die produktive SQLite-Datenbank
- Keine PII oder Secrets in Memory-Einträgen

## Scopes

| Scope        | Lebensdauer     | Sichtbarkeit                              | Default-TTL |
| ------------ | --------------- | ----------------------------------------- | ----------- |
| `agent`      | gebunden an Agent | nur der Agent selbst                    | `PT1H`      |
| `department` | gebunden an Abteilung | Agenten derselben Abteilung         | `P7D`       |
| `shared`     | global geteilt  | alle Agenten mit `memory:read:shared`     | `unlimited` |
| `workflow`   | gebunden an Workflow | beteiligte Agenten des Workflows     | `P1D`       |

## Key-Konvention

`<scope>:<agent_or_dept>:<area>:<key>`

Beispiele:

- `agent:agent_engine_tasks:cache:open_count`
- `department:seo:report:last_audit_ts`
- `shared:platform:flags:autopilot_enabled`
- `workflow:wf_q4_pricing:state:current_step`

## Wichtige Felder

- `key` – siehe Key-Konvention
- `scope` – `agent` | `department` | `shared` | `workflow`
- `owner` – `agent_id` des Schreibers
- `value` – beliebiger JSON-Wert (kein PII, keine Secrets)
- `ttl` – ISO-8601 Duration (oder `unlimited` für `shared`)
- `created_at`, `updated_at` – ISO-Timestamps
- `tags` – optionale Strings

## Erweiterungspunkte

- Backend-Adapter: `in-memory`, `sqlite`, `redis`, `postgres`,
  `vercel-edge-config`, `vector-store`
- Versionierte Einträge (`version`, `previous_versions`)
- Verschlüsselung-at-rest für sensitive Werte (separate Permission)
- TTL-basierte Garbage Collection (delegiert an Backend)

## Sicherheit

- Default-Zugriff: `deny`
- Schreiben auf `shared` erfordert `memory:write:shared`
- Lesen auf `department` setzt Mitgliedschaft in derselben Area voraus
- Memory enthält **keine** Secrets; Verweise gehen über das (in dieser
  Phase nicht existierende) Secret-Modul, nicht über Memory
