# Permissions

## Verantwortung

Rollenbasierte Berechtigungen für alle Agenten. Permissions definiert,
**wer welche Aktion auf welcher Ressource ausführen darf** und wird vor
jeder schreibenden Operation konsultiert. Die Auswertung folgt einem
strengen **Default-Deny**-Modell.

## Scope

- Datenmodell für Rollen und Bindungen (`schema.json`)
- Initialer Rollen-Katalog (`roles.json`)
- Action × Resource × Scope Matrix
- Audit-Verkopplung: jede Denial erzeugt `os.permission.denied`

## Nicht-Scope

- Kein OAuth/IdP-Anschluss
- Kein Token-Issuing
- Keine Endbenutzer-Authentifizierung (das ist Sache der App, nicht des
  AI OS)
- Keine HTTP-Endpunkte

## Modell

Eine Permission ist ein Tripel `action : resource : scope`.

- `action`: `read`, `write`, `decide`, `subscribe`, `publish`,
  `register`, `dryrun`, `admin`
- `resource`: z. B. `task`, `workflow`, `approval`, `queue`,
  `notification`, `memory`, `bus`, `route`, `agent`, `audit`,
  `dashboard`, `gateway`, `feed`
- `scope` (optional): z. B. `internal`, `external`, `agent`,
  `department`, `shared`, `workflow`

Beispiele:

- `read:task`
- `write:task:internal`
- `decide:approval`
- `publish:bus:external`
- `write:memory:shared`
- `admin:gateway`

## Rollen

Initiale Rollen:

| Rolle               | Beschreibung                                                |
| ------------------- | ----------------------------------------------------------- |
| `role_os_admin`     | Verwaltung der Plattform (Registry, Routes, Permissions)    |
| `role_department`   | Standardrolle für Abteilungen (Reports schreiben)            |
| `role_engine`       | Engine-Module (Tasks, Workflows, Priority, Approvals)        |
| `role_hub`          | Hub-Module (Event Hub, Decision, Knowledge, Notifications)   |
| `role_ops`          | Ops-Module (Queue, Execution, Policy, Health, Digest, History, Audit) |
| `role_strategy`     | Strategy-Module (Engine, Roadmap, KPI, Risk, Opportunities)  |
| `role_ceo`          | Menschliche CEO-Rolle (Approvals erteilen)                   |
| `role_observer`     | Lesende Dashboards, keine Schreibrechte                      |

Rollen werden Agenten/Personen in `roles.json` über
`bindings` zugewiesen.

## Bindungs-Regel

- Eine Bindung verbindet `subject` (Agent oder Mensch) mit `role`.
- Pro Subject sind mehrere Rollen erlaubt.
- Effektive Permissions sind die Vereinigung aller gebundenen Rollen.

## Auswertungsregeln

1. **Default Deny.** Fehlt eine passende Permission, ist die Aktion
   verboten.
2. **Genauester Treffer gewinnt.** Eine Regel mit Scope hat Vorrang vor
   einer scopelosen Regel mit derselben Action+Resource.
3. **Negation existiert nicht.** Es gibt keine `deny`-Regel; Zugriffe
   werden ausschließlich durch das Fehlen passender Permissions
   verhindert. Damit bleibt das Modell additiv.
4. **Externe Sichtbarkeit explizit.** Jede Aktion mit Scope `external`
   benötigt eine explizite Permission – `internal` deckt `external`
   nicht ab.
5. **Audit der Verweigerung.** Jede Denial publisht
   `os.permission.denied` mit `subject`, `action`, `resource`, `scope`.

## Erweiterungspunkte

- Mehrstufige `scope`-Hierarchien (`shared > department > agent`)
- Zeitlich begrenzte Bindungen (`valid_until`)
- ABAC-Erweiterung (Bedingungen auf Headers/Payload)
- Mandanten-Trennung (`tenant_id`)

## Sicherheit

- Permissions-Updates sind nur durch `role_os_admin` möglich und
  erzeugen einen Audit-Eintrag.
- Bindungen für `role_ceo` an menschliche Subjects sind in dieser
  Phase rein dokumentarisch.
- Es werden keine Secrets verwaltet – nur Aktion/Ressource/Scope.
