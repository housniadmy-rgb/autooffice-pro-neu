# Prioritäts-Regeln

Diese Regeln werden in einer späteren Phase implementiert. In Phase 7
sind sie ausschließlich als Spezifikation für die Engine hinterlegt.

## Grundregeln

1. **Security vor allem.** Jeder Befund mit `severity = critical` aus
   `ai/security` ergibt automatisch `priority = critical`.
2. **Monitoring eskaliert.** Ein anhaltendes Outage-Signal aus
   `ai/monitoring` (> 3 zusammenhängende Health-Misses) ergibt
   `priority = critical`.
3. **QA-Regressionen.** QA-Befunde, die eine bestehende Funktion brechen,
   ergeben mindestens `priority = high`.
4. **Compliance/DSGVO.** Themen mit Tag `compliance` oder `dsgvo`
   bekommen mindestens `priority = high`.
5. **Pricing-/Umsatz-Risiko.** Finance-Befunde, die Umsatz oder Marge
   spürbar beeinflussen, bekommen mindestens `priority = high`.
6. **Default.** Ohne explizite Regel ist die Priorität `info`.

## Berechnung des Scores

```
priority_score = level.score
                 + (overdue_factor * 10)
                 + (dependency_blocker_factor * 5)
                 - (age_decay)
```

- `overdue_factor` = 1, wenn `due_at` überschritten, sonst 0
- `dependency_blocker_factor` = Anzahl Tasks, die auf diesen Task
  warten
- `age_decay` = sanfter Abzug für sehr alte `info`-Tasks, damit sie aus
  dem aktiven Fenster fallen

## Eskalations-Flag

Wenn der finale Level `critical` oder `high` ist:

- `requires_approval` wird zwingend auf `true` gesetzt
- der Task / Workflow wird im CEO-Dashboard im Abschnitt
  `attention_required` ausgewiesen

## Was das System nicht tun darf

- Es darf eine ursprünglich höhere Priorität niemals **stillschweigend**
  senken.
- Es darf keine eigenmächtige Freigabe erteilen.
- Es darf keine Veröffentlichung anstoßen, nur Reihung.
