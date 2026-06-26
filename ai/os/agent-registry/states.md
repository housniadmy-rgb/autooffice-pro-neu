# Agent Lifecycle States

```
 draft ──► registered ──► active ──► paused ──► retired
                                   ▲       │
                                   └───────┘
                                   (resume)
```

| State        | Bedeutung                                                                 | Zulässige Übergänge       |
| ------------ | ------------------------------------------------------------------------- | ------------------------- |
| `draft`      | Eintrag wurde angelegt, aber noch nicht verifiziert                       | → `registered`            |
| `registered` | Schema valide, Permissions geprüft, noch nicht freigegeben                | → `active`, → `retired`   |
| `active`     | Agent darf publishen/subscriben gemäß Registry-Eintrag                    | → `paused`, → `retired`   |
| `paused`     | Vorübergehend deaktiviert, Bus-Subscriptions inaktiv                      | → `active`, → `retired`   |
| `retired`    | Endzustand. Eintrag bleibt für Audit erhalten, ist aber nicht ausführbar  | (kein Übergang)           |

## Regeln

1. Übergang nach `active` setzt voraus, dass `permissions_required`
   vollständig in `ai/os/permissions/roles.json` abbildbar ist.
2. Jeder Zustandsübergang erzeugt einen Audit-Eintrag
   (`agent.lifecycle.<from>_to_<to>`).
3. `retired` ist absorbierend. Reaktivierung erfordert einen neuen
   Registry-Eintrag mit neuer `id`.
4. Während `draft` und `registered` ist der Agent für den Message Bus
   unsichtbar.
