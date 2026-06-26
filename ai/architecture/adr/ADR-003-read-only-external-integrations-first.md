# ADR-003 – Externe Integrationen starten read-only

## Status

Accepted (2026-06-26)

## Kontext

Spätere Phasen werden externe Systeme anbinden – z. B. GitHub
(Repos, PRs), Stripe (Zahlungen), Google Calendar (Termine),
Mail-Provider, Monitoring-Tools. Externe Schreibwege bergen
besondere Risiken:

- Irreversible Effekte (Mailversand, Zahlungsauslösung,
  Termin-Anlage).
- Reputations- und Compliance-Schäden bei Fehlverhalten.
- Schwere Debuggbarkeit, sobald mehrere Systeme verschränkt sind.
- Sicherheitsangriffsfläche (Webhook-Endpoints, Credentials).

Phase 11 hat das **API Gateway** in `ai/os/api-gateway` als
deaktivierten Einstiegspunkt definiert und mit der Konvention
„nur `GET`/`HEAD`, default `enabled: false`" gestartet. Das deckt
inbound-read ab; outbound-write fehlt noch als eigener Vertrag.

## Entscheidung

1. **Alle externen Integrationen starten read-only.** Outbound-Writes
   (E-Mail-Versand, Webhook-Push, Zahlungsauslösung, GitHub-Schreiben,
   Kalender-Anlage) sind in einer ersten Phase je Integration nicht
   verfügbar.
2. **Inbound-Read first:** Eine neue Integration darf zunächst
   ausschließlich Read-Daten ins System bringen (Webhooks
   konsumieren, Status-Polls). Verarbeitung erfolgt über den Bus.
3. **Outbound-Writes erfordern**:
   - eigene Permission (`outbound:<provider>`),
   - explizites Audit-Event vor Aktivierung
     (`integration.outbound.enabled`),
   - Kopplung an `ai/engine/approvals` gemäß ADR-002,
   - dokumentierter Aktivierungs-Pfad analog zum API Gateway.
4. **API Gateway bleibt default `enabled: false`** und ist in dieser
   Phase nicht der Inbound-Pfad für Integrationen – es bedient
   Dashboards.
5. Eine spätere Integrations-Sektion (`ai/os/integrations`) führt
   Manifest-basiert Plugins mit `kind: inbound`, `outbound`,
   `bidirectional`. In Phase 11 ist sie als Architektur-Slot
   vorbereitet, aber **leer** und vollständig deaktiviert.

## Konsequenzen

Positiv:

- Sicheres Onboarding neuer Integrationen.
- Schaden durch Fehlkonfiguration ist zunächst gedeckelt
  (kein Schreibeffekt nach außen).
- Klarer Aktivierungs-Pfad mit Vier-Augen-Prinzip.
- Kompatibilität mit ADR-002 (kritisch ⇒ Approval).

Negativ / zu tragen:

- Mancher Use Case (z. B. automatischer Mailversand) ist anfangs
  nicht möglich.
- Zwei-Stufen-Aktivierung (Inbound vor Outbound) erhöht die
  Vorlaufzeit pro Integration.
- Zusätzliche Dokumentation pro Integration nötig
  (Manifest, Permissions, Activation-Log).

Folge-Entscheidungen:

- Plugin-Manifest-Spec für `ai/os/integrations` (zukünftig).
- Secret-Management außerhalb des AI OS gemäß ADR-005.
- Audit-Verkopplung gemäß ADR-004.
