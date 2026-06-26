# Genehmigungs-Workflow

## Verantwortung

Zentrale Stelle, an der **menschliche Freigaben** für Tasks und
Workflows erfasst und nachvollziehbar dokumentiert werden. Ohne ein
gültiges Approval darf in einer späteren Phase **keine** Aktion mit
Außenwirkung ausgelöst werden.

## Scope

- Datenmodell für Approval-Requests (`schema.json`)
- Richtlinien, wann ein Approval zwingend ist (`policy.md`)
- Audit-fähige Felder (wer, wann, Begründung)
- Verknüpfung zu Tasks und Workflows

## Nicht-Scope

- Keine automatische Freigabe – niemals
- Keine Speicherung in der produktiven SQLite-Datenbank
- Keine externe Benachrichtigung (E-Mail, Slack, Webhook)
- Kein Zugriff auf Benutzer- oder Kundendaten

## Eingaben

- Tasks mit `requires_approval: true`
- Workflows mit Schritten, die `requires_approval: true` tragen

## Ausgaben

- Approval-Records (`schema.json`-konform)
- Statusübergänge `awaiting_approval → approved | rejected` an den
  Task-Manager
- Eintrag im CEO-Dashboard-Datenmodell als „offene Freigaben“

## Grundprinzip

Eine Freigabe ist **immer** ein Mensch + ein Zeitstempel + eine
nachvollziehbare Entscheidung. Es gibt keinen technischen Mechanismus,
mit dem die Engine in dieser Phase eine Freigabe selbst erzeugen darf.
