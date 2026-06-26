# Approval-Policy

## Wann ist eine Freigabe zwingend?

Eine Freigabe ist **immer** notwendig, wenn ein Task oder ein
Workflow-Schritt eine der folgenden Eigenschaften hat:

- Außenwirkung (Veröffentlichung von Inhalten, E-Mail, Webhook,
  externer API-Call)
- Schreibzugriff auf produktive App-Daten (DB, Dateisystem, Caches)
- Änderung am Code (`server.js`, `routes/`, `middleware/`, `utils/`,
  `data/`, `locales/`, `public/`)
- Änderung an Konfigurationen mit Deploy-Wirkung (`render.yaml`,
  `package.json`)
- Empfehlung aus `ai/security` mit `risk_level >= high`
- Empfehlung aus `ai/finance`, die Preise / Tarife berührt
- Empfehlung aus `ai/operations`, die ein Release / Deployment betrifft

## Defaults

- `requires_approval` ist **standardmäßig `true`** für jeden vom System
  erzeugten Task.
- `requires_approval` darf nur unter dokumentierter Bedingung auf
  `false` gesetzt werden (z. B. rein interner read-only Snapshot ohne
  Außenwirkung).

## Rollen

| Rolle             | Darf entscheiden über                                   |
| ----------------- | ------------------------------------------------------- |
| Eigentümer:in     | Alle Freigaben                                          |
| Niemand sonst     | (in dieser Phase keine weiteren Rollen vorgesehen)      |

## Ablauf

```
Task (requires_approval=true)
   └─► Approval Request (status=pending)
           └─► Mensch entscheidet
                   ├─ approved → Task: approved
                   └─ rejected → Task: rejected
```

## Auditierbarkeit

Jeder Approval-Record enthält `requested_by`, `decided_by`,
`decision_note`, `created_at`, `decided_at`. Records dürfen nach einer
Entscheidung **nicht mehr verändert** werden – Korrekturen erfolgen
durch neue Records mit Verweis.

## Was die Engine niemals darf

- Automatische Freigabe, auch nicht „nur für interne“ Schritte
- Nachträgliche Manipulation entschiedener Records
- Bypass von `requires_approval` über Prioritäts-Tricks
