# API Gateway

## Verantwortung

Geplanter externer Einstiegspunkt für künftige Clients (zukünftige UIs,
externe Integrationspartner, Cron-Worker, mobile Apps). Das Gateway
definiert in dieser Phase ausschließlich die **Spezifikation** und das
**Sicherheitsmodell** für externe Zugriffe.

In Phase 11 ist das Gateway **deaktiviert** – kein Listener, keine
geöffnete Route, kein DNS-Eintrag wird gesetzt.

## Status

- `enabled`: `false`
- Alle Endpunkte: `disabled`
- Auth-Provider: nicht konfiguriert
- Bezug zur bestehenden App: **keiner**

## Scope

- Datenmodell für Endpunkte (`schema.json`)
- Initialer Endpunkt-Katalog (`routes.json`)
- Auth-/Rate-Limit-Konvention (Spezifikation)
- Hartgrenze gegen Schreibwirkung in dieser Phase

## Nicht-Scope

- Keine HTTP-Implementierung
- Keine Aktivierung von Routen
- Kein eigener Auth-Provider (delegiert an spätere Phase)
- Keine Verbindung zur produktiven App, zu `server.js`,
  `routes/`, `middleware/`

## Endpunkt-Konvention

Jeder Endpunkt verweist auf eine Dashboard-API-View oder ein
spezifisches Read-Modell. Schreiboperationen sind in dieser Phase
**ausnahmslos** verboten.

- Methoden: nur `GET` und `HEAD` in dieser Phase
- Pfade: `/api/v1/<area>/<resource>`
- Antwortformat: JSON, Felder gemäß Dashboard-API-View
- Pagination: `?page`, `?pageSize`

## Sicherheitsmodell

| Schutzziel       | Mechanismus                                                          |
| ---------------- | -------------------------------------------------------------------- |
| Authentisierung  | Spätere Phase (OIDC/JWT) – nicht in Phase 11                         |
| Autorisierung    | Mapping `endpoint → permission` (z. B. `read:dashboard`)              |
| Rate-Limit       | Default 30 req/min/IP (Spezifikation)                                |
| Sichtbarkeit     | Nur Views/Daten mit `visibility=external`                            |
| Bot/DDoS         | Geplante Anbindung an Vercel Firewall + BotID (spätere Phase)        |
| Audit            | Jeder Aufruf erzeugt `gateway.request.received` (sobald aktiv)       |
| Secrets          | Keine in Routen, keine in Headern; Auth-Token nie in Logs            |

## Erweiterungspunkte

- Auth-Provider: Clerk, Auth0, eigene OIDC-Instanz
- `gateway.write` für spätere Schreibrouten (nur mit OS-Admin-Approval)
- Webhook-Pfade als separate Schicht
- Edge-Caching-Hints (z. B. Vercel Cache-Control)

## Aktivierungs-Pfad

Eine spätere Aktivierung erfordert in dieser Reihenfolge:

1. CEO-Approval als Task im Engine-Workflow
2. Eintrag `gateway.endpoint.enabled` im Audit
3. Zuweisung passender Permission an Subject-Rolle
4. Setzen von `enabled: true` in `routes.json`
