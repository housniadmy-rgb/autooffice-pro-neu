# Agent Registry

## Verantwortung

Zentrales Verzeichnis aller Agenten der AI Company. Jeder Agent –
unabhängig davon, ob er eine Abteilung aus Phase 6, ein Engine-Modul
aus Phase 7, ein Hub-Bestandteil aus Phase 8, eine Operations-Komponente
aus Phase 9, eine Strategy-Komponente aus Phase 10 oder ein
Plattformdienst aus Phase 11 ist – wird hier mit stabiler ID,
Capabilities, Subscriptions, Permissions-Anforderungen und
Lifecycle-Zustand geführt.

Die Registry ist die **einzige Quelle der Wahrheit** für die Identität
eines Agenten. Andere Module konsultieren sie zur Auflösung von
`agent_id`-Referenzen.

## Scope

- Datenmodell für Agenten definieren (`schema.json`)
- Initiales Inventar aller bisherigen Module (`agents.json`)
- Lebenszyklus-Zustände beschreiben (`states.md`)
- Capabilities, Subscriptions und benötigte Permissions vorgeben
- Konvention für stabile, semantische IDs (`agent_<area>_<name>`)

## Nicht-Scope

- Keine Laufzeit-Discovery (kein Heartbeat-Pull, keine Health-Checks)
- Keine dynamische Registrierung über HTTP
- Keine Persistenz in der produktiven SQLite-Datenbank
- Keine Authentifizierung gegen externe IdPs

## Eingaben

- Manuell gepflegte Einträge in `agents.json`
- Spätere Phasen, die neue Agenten einbringen

## Ausgaben

- Aufgelöste Identitäten für Audit, Permissions, Bus-Router
- Capability-Listen für Dashboard API

## Wichtige Felder eines Agent-Eintrags

- `id` – stabile Kennung (`agent_<area>_<name>`)
- `area` – einer von `department`, `engine`, `hub`, `ops`, `strategy`,
  `os`
- `path` – Verzeichnis im Repository (z. B. `ai/engine/tasks`)
- `capabilities` – Liste der Fähigkeiten als Strings
- `subscriptions` – Topics auf dem Message Bus, die der Agent
  konsumiert
- `publishes` – Topics, die der Agent veröffentlichen darf
- `permissions_required` – Rollen-/Action-Anforderungen für
  Permissions-Checks
- `state` – siehe `states.md`
- `owner_human` – verantwortliche Person (Default: CEO)

## Lifecycle (siehe `states.md`)

`draft → registered → active → paused → retired`

Übergänge erzeugen Audit-Einträge. `retired`-Einträge bleiben für
Nachvollziehbarkeit erhalten und werden nicht gelöscht.

## Erweiterungspunkte

- `version` / `model` / `runtime` für KI-Agenten in späteren Phasen
- `health_endpoint` für aktive Health-Checks
- `region` / `tenant` für Multi-Mandanten-Setups
- `slo` für Service-Level-Erwartungen

## Sicherheit

- Default-Sichtbarkeit eines Eintrags: `internal`
- Schreibrechte auf die Registry: nur `role: os.admin`
- Auflösungs-API ist read-only und liefert keine Secrets
