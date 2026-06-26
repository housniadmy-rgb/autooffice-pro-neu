# ADR-005 – Keine Secrets und keine PII im AI OS

## Status

Accepted (2026-06-26)

## Kontext

Das AI OS koordiniert Module, die Reports, Tasks, Approvals und
Events transportieren. Im Kontext einer Praxis-SaaS-Plattform
(PraxisOnline24) gelten besondere Sorgfaltspflichten:

- DSGVO und ärztliche Schweigepflicht für patientennahe Daten.
- Credentials und API-Keys dürfen weder im Repository noch in
  Nachrichten-Payloads enthalten sein.
- Logs, Audit-Einträge und Memory-Snapshots können langlebig sein und
  über Module hinaus sichtbar werden.

Ohne harte Trennung zwischen Plattform-Daten und sensiblen Daten
besteht das Risiko, dass PII oder Secrets unbeabsichtigt persistiert,
geloggt oder über künftige Integrations ausgespielt werden.

## Entscheidung

1. **Keine Secrets im Repository.** Keine API-Keys, Tokens, Passwörter,
   Service-Account-JSONs, Cloud-Credentials in irgendeiner Datei
   unter `ai/os/*` oder `ai/architecture/*`.
2. **Keine Secrets im AI OS.** Das AI OS hat **keinen** Secret-Speicher
   und beansprucht ihn nicht. Credentials werden außerhalb dieser
   Phase verwaltet (separate spätere Sicherheits-Schicht).
3. **Keine PII auf dem Message Bus.** Bus-Envelopes enthalten weder
   Namen, E-Mail-Adressen, Telefonnummern, Adressen, Geburtsdaten noch
   medizinische Daten. Statt PII werden ausschließlich Referenzen
   verwendet (`patient_ref`, `user_ref`, `tenant_ref`).
4. **Keine PII in Memory.** Memory-Einträge folgen derselben Regel
   wie der Bus. `shared`-Scope ist besonders heikel und schreibt
   immer einen Audit-Eintrag (`memory.written:shared`).
5. **Keine PII im Audit.** Audit-Einträge enthalten nur Klassifikatoren,
   IDs und strukturelle `details`. Keine Volltext-Payloads, keine
   Mail-Bodies, keine Patient:innen-Daten.
6. **Pflicht-Header `headers.contains_pii: false`** auf jedem
   Envelope. Setzt ein Producer `true`, wird die Nachricht durch den
   Event Router verworfen und der Versuch auditiert.
7. **Verweise statt Werte.** Jede Daten-Referenz nutzt stabile,
   nicht-rückführbare IDs. Auflösung in PII erfolgt ausschließlich in
   der bestehenden App-Schicht, niemals im AI OS.

## Konsequenzen

Positiv:

- DSGVO- und Schweigepflicht-konforme Trennung.
- Verlust- und Leak-Risiko durch lange Audit-Retention sinkt.
- Bus-Volumen bleibt klein und cache-freundlich.
- Externe Integrationen können nicht aus Versehen Patientendaten
  exponieren.

Negativ / zu tragen:

- Anwendungslogik braucht eine zusätzliche Auflösungs-Stufe
  (Reference → PII) auf der App-Seite.
- Module dürfen sich nicht „eben mal" einen Mail-Body durchreichen,
  sondern müssen über IDs arbeiten.
- Tests werden komplexer (mocken die Referenz-Auflösung).

Folge-Entscheidungen:

- Spätere Secret-Schicht außerhalb des AI OS (eigenes ADR, sobald
  konkret).
- Linting/Pre-Commit-Hook für PII-Feldnamen und Secret-Patterns
  (zukünftig, nicht in Phase 11 aktiv).
- Read-Models gemäß ADR-006 enthalten ausnahmslos nicht-sensible,
  Dashboard-sichere Felder.
