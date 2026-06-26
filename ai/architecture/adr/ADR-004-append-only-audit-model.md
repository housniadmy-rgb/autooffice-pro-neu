# ADR-004 – Append-only Audit-Modell

## Status

Accepted (2026-06-26)

## Kontext

Mehrere Module schreiben Entscheidungen und Zustandsübergänge auf:

- Registry-Lifecycle (Agent registriert/aktiv/retired),
- Permissions (denied/granted),
- Router (matched/dropped),
- Scheduler (tick emitted/skipped),
- Engine Approvals (granted/rejected),
- Ops Execution (dryrun success/failure).

Ohne ein einheitliches Modell entstehen drei Risiken:

- Forensik wird unzuverlässig, wenn Einträge editierbar sind.
- Doppelte Speicher (`ai/ops/audit` und `ai/os/audit`) können
  divergieren.
- Compliance-Anforderungen (Nicht-Repudiation, lückenlose
  Nachvollziehbarkeit) sind nicht erfüllbar.

## Entscheidung

1. **Append-only ist Pflicht.** Audit-Einträge werden niemals geändert
   oder gelöscht. Es existiert keine Edit- oder Delete-API.
2. **Korrekturen sind Folge-Einträge.** Ein falscher Eintrag wird
   durch einen neuen Eintrag mit `kind: correction` und
   `corrects: <audit_id>` ergänzt.
3. **Eine logische Wahrheit, zwei Schreib-Adapter.** Der
   Plattform-Audit (`ai/os/audit`) ist die einzige logische
   Wahrheit. `ai/ops/audit` bleibt als Schreib-Adapter für
   Ops-Ereignisse erhalten, schreibt aber in dieselbe append-only
   Quelle (logisch oder via späterem Replikationspfad). Konkurrierende
   Speicher sind nicht erlaubt.
4. **Pflichtmäßig auditierte Ereignisse** sind in
   `ai/os/audit/events.md` definiert. Jedes Modul, das ein
   Pflicht-Ereignis erzeugt, muss schreiben.
5. **Standard-Felder** je Eintrag: `id`, `ts`, `kind`, `actor`,
   `subject`, `action`, `outcome`, `trace_id`, `correlation_id`,
   `details`.
6. **Optionale Hash-Chain** (`previous_hash`, `entry_hash`) ist im
   Schema vorgesehen, wird durch späteres ADR aktiviert.
7. **Retention default `unlimited`.** Archivierung ist möglich, aber
   nur durch zusätzliche Sinks, ohne Original-Einträge zu verändern.

## Konsequenzen

Positiv:

- Forensik-fähige Lückenlosigkeit.
- Compliance-Bereitschaft (Nicht-Repudiation, Vier-Augen-Belege für
  Approvals).
- Klare Korrektur-Spur statt stiller Edits.
- Eine Suchquelle für „was ist auf der Plattform passiert?".

Negativ / zu tragen:

- Höheres Datenvolumen.
- Korrekturen sind explizit sichtbar – das ist gewollt, kann aber
  kommunikationspflichtig sein.
- Ops-Audit-Adapter braucht klare Schreib-Konvention, damit nicht
  zwei Wahrheiten entstehen.

Folge-Entscheidungen:

- Hash-Chain-Aktivierung (zukünftig).
- Sampling- und Archivierungs-Policy bei skaliertem Verkehr
  (zukünftig).
- Read-only Dashboard-View `view_audit_recent` gemäß ADR-006.
