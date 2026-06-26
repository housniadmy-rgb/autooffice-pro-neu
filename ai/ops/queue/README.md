# Operations Queue

## Verantwortung

Aufnahme freigegebener oder auto-distributierbarer Tasks aus
`ai/engine/tasks` und Verteilung auf Slots pro Abteilung. Die Queue
ist die einzige Stelle, an der **Auto-Distribution** stattfindet.

## Scope

- Datenmodell eines Queue-Eintrags (`schema.json`)
- Regeln der Auto-Distribution (Round-Robin nach Owner, Slot-Cap,
  Backpressure)
- Re-Queueing nach CEO-Approval
- Sichtbare Wartezeit / Liegezeit pro Eintrag

## Nicht-Scope

- Keine Ausführung von Tasks (das ist der Execution Manager)
- Keine Freigabe-Entscheidung (das ist Approval / Policy Engine)
- Kein Schreibzugriff auf produktive App-Daten

## Eingaben

- Tasks aus `ai/engine/tasks` mit `state = approved`
- Tasks, die im Schema explizit `auto_distributable: true` tragen
- Rückläufer aus dem Approval-Flow (`approved` nach Policy-Block)

## Ausgaben

- Queue-Einträge mit `slot`-Zuweisung pro Abteilung
- Übergabe an die Policy Engine via `next_runnable()`
- Audit-Events für jede Distribution

## Slot-Modell

- Pro Abteilung gibt es eine konfigurierbare Anzahl Slots
  (`slot_caps`). Default in dieser Phase: 1 aktiver Slot pro
  Abteilung – bewusst konservativ.
- Erst wenn ein Slot frei wird (Execution `completed` / `failed` /
  `rejected`), darf der nächste Eintrag derselben Abteilung in die
  Bearbeitung gehen.
- `critical`-Klassifikation überspringt keinen Slot, sondern erhält
  höhere Reihenfolge **innerhalb** der Abteilung.

## Verhalten (Spezifikation, nicht ausgeführt)

1. Eingang prüfen: Task ist `approved` oder explizit
   `auto_distributable`.
2. Eintrag in Queue anlegen, Owner-Abteilung übernehmen.
3. Auto-Distribution: Falls ein Slot der Abteilung frei ist, Eintrag
   als `assigned` markieren.
4. Policy Engine anfragen (siehe `../policy`). Bei `critical` → in
   `awaiting_approval` versetzen, Approval-Request anlegen.
5. Bei `safe` → für Execution Manager (Dry-Run) bereitstellen.
