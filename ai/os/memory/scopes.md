# Memory Scopes

Memory ist klar nach Sichtbarkeit getrennt. Jeder Scope hat eine
eigene Lebensdauer und ein eigenes Berechtigungsbild.

## `agent`

- **Sichtbar für:** ausschließlich den eigenen Agenten
- **Lebensdauer (Default):** `PT1H`
- **Typische Inhalte:** Caches, Kurzzeitzustände, Iterationszähler
- **Permissions:** `memory:read:agent`, `memory:write:agent`

## `department`

- **Sichtbar für:** alle Agenten derselben `area`/Abteilung
- **Lebensdauer (Default):** `P7D`
- **Typische Inhalte:** abteilungsweite Reports-Stände, Snapshots,
  letzte bekannte KPI-Werte
- **Permissions:** `memory:read:department`, `memory:write:department`
  (jeweils gebunden an passende `area`)

## `shared`

- **Sichtbar für:** alle Agenten mit `memory:read:shared`
- **Lebensdauer (Default):** `unlimited`
- **Typische Inhalte:** Feature Flags, plattformweite Konstanten,
  Indexverweise
- **Permissions:** `memory:read:shared`, `memory:write:shared`
- **Sonderregel:** Schreiben auf `shared` erzeugt **immer** einen
  Audit-Eintrag.

## `workflow`

- **Sichtbar für:** alle Agenten, die am Workflow beteiligt sind
  (Workflow-ID muss im Key vorkommen)
- **Lebensdauer (Default):** `P1D`
- **Typische Inhalte:** Zwischenresultate, aktueller Schritt,
  ausstehende Approvals
- **Permissions:** `memory:read:workflow`, `memory:write:workflow`

## Default-Regeln

1. Kein Eintrag darf länger leben als sein Scope erlaubt, außer
   `shared`.
2. TTL kann nicht gegen Null gesetzt werden (Minimum `PT1M`).
3. Beim Übergang eines Workflows in `archived` werden die zugehörigen
   `workflow:*`-Einträge nach `P30D` automatisch gelöscht (durch das
   spätere Backend, nicht in dieser Phase).
4. Beim `retired`-Übergang eines Agenten werden seine `agent:*`-Einträge
   nicht gelöscht, sondern read-only fixiert (`updated_at` eingefroren).
