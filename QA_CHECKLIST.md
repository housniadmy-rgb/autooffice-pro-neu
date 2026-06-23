# PraxisOnline24 – Finale QA-Checkliste (Phase 11)

> Alle Tests lokal durchführen. Deployment erst nach bestandener Checkliste.

---

## 1. Authentifizierung & Passwort

- [ ] Registrierung mit allen Pflichtfeldern funktioniert
- [ ] Login mit E-Mail + Passwort funktioniert
- [ ] Login mit falschem Passwort zeigt Fehlermeldung
- [ ] `Passwort vergessen`-Link auf Login-Seite sichtbar
- [ ] `POST /api/auth/forgot-password` gibt immer 200 zurück (kein User-Enumeration)
- [ ] Reset-Mail wird in Konsole protokolliert (DEV-MODUS)
- [ ] Passwort-Reset mit gültigem Token setzt neues Passwort
- [ ] Passwort-Reset mit abgelaufenem/ungültigem Token gibt Fehler 400
- [ ] Passwort-Reset-Token kann nur einmal verwendet werden
- [ ] Anmeldung mit neuem Passwort funktioniert nach Reset
- [ ] Passwort ändern (eingeloggt) unter Einstellungen funktioniert

## 2. Praxisprofil & Einstellungen

- [ ] Praxisdaten (Name, Adresse, Tel., Web) speichern
- [ ] Öffnungszeiten speichern und auf Buchungsseite anzeigen
- [ ] Sprache wechseln (de/en/fr/es/pt/ar/tr/id)
- [ ] Buchungslink auf Einstellungsseite kopieren
- [ ] Abonnement-Status korrekt angezeigt (BASIC / UNLIMITED / pausiert)
- [ ] Aktivitätsprotokoll laden zeigt Login- und Termineinträge

## 3. Behandler & Verfügbarkeiten

- [ ] Neuen Behandler anlegen (Vor-/Nachname Pflichtfeld)
- [ ] Behandler bearbeiten
- [ ] Behandler deaktivieren / reaktivieren
- [ ] BASIC-Limit: max. 3 aktive Behandler (Fehlermeldung bei 4.)
- [ ] **NEU**: Verfügbarkeit (Zeiten-Button) öffnet Wochenraster
- [ ] Verfügbarkeit: Mo–Fr 09:00–17:00 speichern
- [ ] Verfügbarkeit: Änderung zeigt korrekten Zähler in Tabelle
- [ ] Buchungsseite: Nur konfigurierte Tage erscheinen im Kalender
- [ ] Buchungsseite: Sa/So nicht wählbar bei Mo–Fr-Konfiguration
- [ ] Buchungsseite: Slots nur innerhalb der Zeitfenster (09:00–16:30)
- [ ] Ohne Verfügbarkeit: Standard 08:00–18:00 alle Tage verfügbar

## 4. Terminkalender

- [ ] Termine auflisten (Woche/Monat-Ansicht)
- [ ] Neuen Termin anlegen (Admin)
- [ ] Terminart aus Kanonischer Liste wählen (7 Arten)
- [ ] Termin bearbeiten (Status, Datum, Zeit)
- [ ] Termin stornieren → Patient erhält Absage-Mail (DEV: Konsole)
- [ ] Terminarten-Backward-Compat: Alte DB-Werte werden korrekt gemappt
- [ ] Keine Doppelbuchung (Konfliktprüfung)

## 5. Online-Buchung (öffentlich)

- [ ] Buchungsseite über `/booking.html?p=PRACTICE_ID` erreichbar
- [ ] Behandler-Auswahl zeigt aktive Behandler
- [ ] Kalender zeigt nur verfügbare Tage
- [ ] Zeitslots korrekt gefiltert (gebuchte Slots nicht mehr wählbar)
- [ ] Schritt 1 → 2 → 3 Navigation funktioniert
- [ ] Buchung abschicken → Bestätigung angezeigt
- [ ] Bestätigungs-E-Mail in Konsole protokolliert
- [ ] ICS-Datei-Download nach Buchung
- [ ] Terminabsage via Token (`/cancel.html?token=...`)
- [ ] Meine Termine (`/my-appointments.html?p=...`) nach E-Mail suchen

## 6. Mehrsprachigkeit (alle 8 Sprachen)

Testpfad: `/booking.html?p=PRACTICE_ID&lang=XX`

- [ ] Deutsch (de): Kalender, Formular, Bestätigung
- [ ] English (en): all UI labels translated
- [ ] Français (fr): labels in French
- [ ] Español (es): labels in Spanish
- [ ] Português (pt): labels in Portuguese
- [ ] العربية (ar): RTL-Layout, arabische Labels
- [ ] Türkçe (tr): labels in Turkish
- [ ] Bahasa Indonesia (id): labels in Indonesian
- [ ] Terminart-Werte: Immer Kanonisch (Deutsch) gespeichert
- [ ] E-Mail-Bestätigung: Sprache entspricht Patientensprache

## 7. Patienten

- [ ] Patientenliste anzeigen (unique Patienten aus Terminen)
- [ ] Patientendetails / Terminhistorie
- [ ] DSGVO-Anonymisierung: Patient anonymisieren
- [ ] Keine Gesundheitsdaten, Diagnosen oder Geburtsdaten gespeichert

## 8. Rechnungen & PDF

- [ ] Rechnung anlegen (Patient, Betrag, Datum)
- [ ] Rechnungspositionen (Items) hinzufügen
- [ ] MwSt.-Berechnung korrekt
- [ ] Rechnungsstatus: Entwurf → Bezahlt
- [ ] **PDF-Download**: Rechnung als PDF herunterladen
  - [ ] PDF enthält Praxisname, Adresse
  - [ ] PDF enthält Patientname
  - [ ] PDF enthält Rechnungsnummer, Datum
  - [ ] PDF enthält Leistungen und Gesamtbetrag
  - [ ] Disclaimer am Ende vorhanden
- [ ] Zahlungseingang erfassen

## 9. Rezepte

- [ ] Rezeptdruck-Log anlegen (Behandler + Patient)
- [ ] Rezept-Logs auflisten
- [ ] Behandler-Auswahl im Rezept-Formular

## 10. Bewertungen

- [ ] Bewertungsseite (`/review.html?p=PRACTICE_ID`) aufrufen
- [ ] Bewertung 1–5 Sterne abgeben
- [ ] Kommentar + Name optional
- [ ] Disclaimer "keine Diagnosen" sichtbar
- [ ] Admin: Neue Bewertung erscheint mit `visible=0`
- [ ] Admin: Bewertung freischalten → `visible=1`
- [ ] Admin: Bewertung verbergen → `visible=0`
- [ ] Admin: Bewertung löschen
- [ ] Praxisseite (`/practice.html?p=...`): Nur sichtbare Bewertungen angezeigt
- [ ] Durchschnittsbewertung wird berechnet

## 11. Warteliste

- [ ] Patient trägt sich ein (`/waitlist.html?p=PRACTICE_ID`)
- [ ] Admin: Warteliste anzeigen
- [ ] Admin: Wartelisten-Eintrag löschen
- [ ] Automatisches Angebot bei Terminabsage (Cron oder manuell)
- [ ] Token-Link (`/waitlist-accept.html?token=...`): Termin annehmen
- [ ] Abgelaufenes Angebot zeigt Fehlermeldung

## 12. SQLite-Backups (NEU)

- [ ] Backup-Verzeichnis `data/backups/` wird automatisch angelegt
- [ ] Backup wird täglich um 02:00 Uhr erstellt (Cron)
- [ ] Backup-Datei enthält valide SQLite-Datenbank
- [ ] Maximal 7 Backups gespeichert (älteste werden gelöscht)
- [ ] `automation_log` enthält Backup-Einträge

## 13. Aktivitätsprotokoll (NEU)

- [ ] Login wird protokolliert
- [ ] Termin anlegen (Admin) wird protokolliert
- [ ] Termin bearbeiten wird protokolliert
- [ ] Termin stornieren wird protokolliert
- [ ] Protokoll in Einstellungen → "Protokoll laden" sichtbar
- [ ] Maximal 100 Einträge werden angezeigt

## 14. Passwort-Reset (NEU)

- [ ] Link "Passwort vergessen?" auf Login-Seite
- [ ] Formular auf `/reset-password.html` zeigt ohne Token das Anfrage-Formular
- [ ] Mit `?token=XXX` zeigt neues Passwort-Formular
- [ ] Passwörter müssen übereinstimmen (Client-Validierung)
- [ ] Erfolgsmeldung nach Reset
- [ ] Token kann nur einmal verwendet werden

## 15. Sicherheit

- [ ] `.env` nicht im Git-Repository
- [ ] `data/` nicht im Git-Repository
- [ ] SESSION_SECRET ist zufällig (nicht 'change-me')
- [ ] Alle Admin-Routen erfordern Authentifizierung
- [ ] Keine Diagnosen, Medikamente oder Geburtsdaten speicherbar
- [ ] XSS-Schutz: Alle Ausgaben werden escaped
- [ ] SQL-Injection: Parametrisierte Queries überall
- [ ] Cookie httpOnly + Secure (in Produktion)
- [ ] HTTPS wird in Produktion erzwungen (trust proxy)

## 16. Deployment-Vorbereitung

- [ ] `DEPLOYMENT.md` vollständig und aktuell
- [ ] `npm start` startet ohne Fehler
- [ ] `/api/health` gibt `{"status":"ok"}` zurück
- [ ] `data/`-Verzeichnis wird bei Fresh-Deploy automatisch angelegt
- [ ] `SESSION_SECRET`-Warnung bei Produktiv-Start ohne Secret
- [ ] `NODE_ENV=production` + HTTPS: cookie.secure aktiv

---

## Finale Freigabe

Alle obigen Punkte sind erfüllt:
- [ ] Reviewer 1: _________________ Datum: _______
- [ ] Reviewer 2: _________________ Datum: _______

> **Deployment erst nach vollständiger Freigabe aller Punkte.**
