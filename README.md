# PraxisOnline24

**Ihre Praxis. Online. Rund um die Uhr.**

Terminverwaltungssoftware für medizinische Praxen – Node.js / Express / SQLite, kein Frontend-Framework.

---

## Lokaler Start

```bash
npm install
cp .env.example .env   # Umgebungsvariablen anpassen (optional für Testbetrieb)
npm start              # Startet auf http://localhost:3000
```

Der Server lädt die SQLite-Datenbank in den Speicher und speichert sie unter `data/praxisonline24.db`.

---

## Umgebungsvariablen (.env)

| Variable       | Beschreibung                                                         | Standard          |
|----------------|----------------------------------------------------------------------|-------------------|
| PORT           | Serverport                                                           | 3000              |
| SESSION_SECRET | Sitzungsschlüssel – **unbedingt ändern!**                           | (Pflichtfeld)     |
| EMAIL_DEV_MODE | `true` = E-Mails in Konsole ausgeben (kein SMTP nötig)              | true              |
| SMTP_HOST      | SMTP-Mailserver                                                      | –                 |
| SMTP_PORT      | SMTP-Port                                                            | 587               |
| SMTP_USER      | SMTP-Benutzername                                                    | –                 |
| SMTP_PASS      | SMTP-Passwort                                                        | –                 |
| SMTP_FROM      | Absenderadresse                                                      | –                 |
| APP_URL        | Öffentliche URL (für Links in E-Mails)                              | http://localhost:3000 |

---

## Features (Phasen 1–16)

| Phase | Feature                                                               | Status     |
|-------|-----------------------------------------------------------------------|------------|
| 1     | Express-Server, SQLite (sql.js), Sessions                             | ✅ Fertig  |
| 2     | Registrierung, Login, Logout, bcrypt, 30-Tage-Testphase              | ✅ Fertig  |
| 3     | Kalender (Monats-/Tagesansicht), Terminverwaltung                    | ✅ Fertig  |
| 4     | Behandler, Patienten (aus Termindaten), BASIC-Limits                 | ✅ Fertig  |
| 5     | Rechnungen (PDF), Rezeptdruck-Protokoll                              | ✅ Fertig  |
| 6     | Bewertungen (Einreichen, Freigeben, Ausblenden), Einstellungen       | ✅ Fertig  |
| 7     | Warteliste, Automatisierungen (Cron: Erinnerungen, Bereinigung)      | ✅ Fertig  |
| 8     | Buchungsflow (3-Step), Patientenportal, ICS-Kalenderexport           | ✅ Fertig  |
| 9     | Mehrsprachigkeit (8 Sprachen), BASIC/UNLIMITED-Pakete, Trial-Lifecycle | ✅ Fertig |
| 10    | Booking-Sprachumschalter, öffentliche Seiten multilingual, Stabilisierung | ✅ Fertig |
| 11    | Vollständige Mehrsprachigkeit aller öffentlichen Seiten (12 Sprachen) | ✅ Fertig |
| 12    | Mehrsprachige AGB/Datenschutz, erweiterter Hero-Text                 | ✅ Fertig  |
| 13    | AI Praxismanager – automatische Praxiszusammenfassung & Hinweise     | ✅ Fertig  |
| 14    | Dashboard-Mehrsprachigkeit – alle 10 Seiten in 12 Sprachen, Cookie-Sync bei Login | ✅ Fertig  |
| 15    | i18n-Vervollständigung – alle fehlenden Schlüssel für 12 Sprachen    | ✅ Fertig  |
| 16    | Terminarchivierung – automatische Archivierung, konfigurierbarer Schwellenwert, Kalender-Filter | ✅ Fertig  |

### Phase 16 – Terminarchivierung (Details)

- **Status `archived`**: Neuer Terminstatus – Termine werden nicht gelöscht, sondern archiviert
- **Automatischer Cron-Job**: Täglich 01:00 – archiviert abgeschlossene/abgesagte Termine nach konfiguriertem Zeitraum
- **Einstellbar** unter Einstellungen → Terminarchivierung: Nie / 6 / 12 (Standard) / 24 Monate
- **Kalender-Filter**: Aktive Termine / Archivierte Termine / Alle Termine (Dropdown im Kalender)
- **AI Praxismanager**: Archivierte Termine fließen nicht in aktuelle Statistiken ein
- **Datenschutz**: Keine automatische Löschung – Daten bleiben vollständig erhalten
- **Mehrsprachig**: Alle Labels in allen 12 Sprachen übersetzt

---

## Testen

### 1. Registrierung & Login

```bash
# Registrieren (alle 8 Sprachen: de/en/fr/es/pt/ar/tr/id)
curl -c /tmp/c.txt -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"first_name":"Max","last_name":"Muster","email":"max@praxis.de","password":"Test1234!","practice_name":"Musterklinik","language":"de","package":"BASIC"}'

# Einloggen
curl -c /tmp/c.txt -b /tmp/c.txt -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"max@praxis.de","password":"Test1234!"}'
```

Dann Browser öffnen: http://localhost:3000/login.html

### 2. Behandler anlegen

Admin → **Behandler** → `http://localhost:3000/practitioners.html` → **+ Neuer Behandler**

BASIC-Limit: maximal 3 aktive Behandler.

### 3. Online-Buchung testen

1. Praxis-ID aus `api/auth/me` holen
2. `http://localhost:3000/booking.html?p=PRAXIS-ID` öffnen
3. Sprache wählen (Flaggen-Dropdown oben rechts)
4. Behandler → Datum → Uhrzeit → Weiter → Patientendaten → Buchen
5. Bestätigung mit ICS-Link und Absage-Link erscheint

Unterstützte Sprachen: `?lang=de` `?lang=en` `?lang=fr` `?lang=es` `?lang=pt` `?lang=ar` `?lang=tr` `?lang=id`

### 4. Meine Termine (Patientenportal)

`http://localhost:3000/my-appointments.html?p=PRAXIS-ID` → E-Mail eingeben → Termine ansehen, absagen, bewerten

### 5. Termin absagen (öffentlich)

`http://localhost:3000/cancel.html?token=CANCEL_TOKEN` – Patient erhält diesen Link per E-Mail oder nach der Buchung.

### 6. Bewertung abgeben

`http://localhost:3000/review.html?p=PRAXIS-ID` – Sterne + optionaler Kommentar. Keine Gesundheitsdaten erlaubt.

### 7. Abonnement & Paket

`http://localhost:3000/subscription.html` – Zeigt aktuelles Paket, Trial-Status. Upgrade per Kontaktanfrage.

### 8. Testphase & Account-Lifecycle (automatisch)

| Zeitpunkt           | Aktion                                           |
|---------------------|--------------------------------------------------|
| Registrierung       | 30-Tage-Trial startet                            |
| T-5 Tage            | Erinnerungs-E-Mail (Dev: Konsolenausgabe)        |
| T-1 Tag             | Zweite Erinnerungs-E-Mail                        |
| T+0 (Ablauf)        | Zahlungsaufforderungs-E-Mail                     |
| T+7 Tage            | Account wird pausiert (402-Response)             |
| Account pausiert    | Rotes Banner in allen Admin-Seiten               |

### 9. Sprache (Admin)

Einstellungen → **Sprache** – ändert Sprache der Trial-Erinnerungs-E-Mails und der Cookie-Präferenz.

### 10. Vollständiger API-Test

```bash
# Dashboard
curl -b /tmp/c.txt http://localhost:3000/api/dashboard

# Subscription
curl -b /tmp/c.txt http://localhost:3000/api/practices/subscription

# Sprache setzen
curl -b /tmp/c.txt -X PUT http://localhost:3000/api/practices/language \
  -H "Content-Type: application/json" -d '{"language":"en"}'

# Verfügbare Buchungstage
curl "http://localhost:3000/api/public/available-days?practitioner_id=ID&year=2026&month=7"

# Buchung
curl -X POST http://localhost:3000/api/public/book \
  -H "Content-Type: application/json" \
  -d '{"practice_id":"...","practitioner_id":"...","patient_first_name":"Max","patient_last_name":"M","patient_email":"m@t.de","appointment_date":"2026-07-20","appointment_time":"10:00","patient_language":"de"}'
```

---

## Datenbankstruktur

SQLite-Datenbank: `data/praxisonline24.db` (sql.js, in-memory, bei jedem Schreibvorgang gespeichert)

| Tabelle             | Inhalt                                            |
|---------------------|--------------------------------------------------|
| practices           | Praxisdaten, Paket, Sprache, Trial, Account-Status |
| users               | Login-Accounts (bcrypt-Hash)                    |
| practitioners       | Behandler (Name, Titel, Fachgebiet)             |
| appointments        | Termine (inkl. patient_language, cancel_token)  |
| waitlist            | Wartelisten-Einträge                            |
| waitlist_offers     | 4h-gültige Annahme-Tokens                       |
| automation_log      | Cron-Protokoll (last_cleanup etc.)              |
| reviews             | Bewertungen (Sterne, Kommentar, Freigabe-Status) |
| invoices            | Rechnungen (PDF über pdfkit)                    |
| recipe_print_logs   | Rezeptdruckprotokoll (kein Rezeptinhalt)        |
| payments            | Zahlungsprotokoll                               |
| settings            | Praxiseinstellungen                             |

---

## Offene MVP-Grenzen (vor echtem Verkauf zu lösen)

| Thema               | Beschreibung                                                        |
|---------------------|---------------------------------------------------------------------|
| **Zahlung**         | Kein Zahlungsanbieter integriert. Paket-Upgrade läuft manuell per E-Mail. Vor dem Verkauf: Stripe o.ä. einbinden. |
| **E-Mail**          | Im Dev-Modus werden E-Mails nur in der Konsole ausgegeben. Vor dem Verkauf: echten SMTP-Server konfigurieren. |
| **Hosting**         | Lokal auf Port 3000. Für Produktion: VPS + Nginx-Reverse-Proxy + HTTPS (Let's Encrypt) + Prozessmanager (PM2). |
| **Session**         | Sessions sind in-memory (express-session ohne Store). Bei Neustart verlieren alle Nutzer ihre Session. Vor Produktion: connect-session-sequelize oder Redis-Store einsetzen. |
| **Mehrere Mandanten** | Jede Praxis ist ein eigener Account. Alle teilen eine DB-Datei. Skaliert für kleine Deployments. |
| **Passwort-Reset**  | Kein „Passwort vergessen"-Flow implementiert. Manueller Reset nötig. |
| **AGB / Datenschutz** | Platzhalter-Seiten vorhanden (`agb.html`, `datenschutz.html`). Rechtlich prüfen lassen! |
| **DSGVO**           | Keine automatisierte Löschung auf Anfrage. Muss manuell per DB-Abfrage erfolgen. |
| **Datensicherung**  | `data/praxisonline24.db` muss regelmäßig gesichert werden (kein Auto-Backup). |
| **Tests**           | Keine automatisierten Unit- oder Integrationstests. Empfehlung: Jest + Supertest. |
| **Behandler-Verfügbarkeit** | Derzeit werden alle Slots 08:00–18:00 Uhr als verfügbar angezeigt (keine individuelle Verfügbarkeit). |

---

## Rechtlicher Hinweis

PraxisOnline24 ist ein **Terminverwaltungs-Werkzeug**. Die Praxis ist allein verantwortlich für:
- Patientendaten und deren DSGVO-konforme Verarbeitung
- Medizinische Entscheidungen
- Rechnungsinhalte und steuerliche Korrektheit
- Rezeptangaben

**Es werden keine Gesundheitsdaten, Diagnosen, Medikamente, Dosierungen, Geburtsdaten oder Versicherungsnummern gespeichert.**

---

## Empfehlung Phase 11

**Priorität: Produktionsreife**

1. **Session-Store** (connect-session-sequelize oder Redis) – verhindert Session-Verlust bei Neustart
2. **SMTP-Konfiguration** – echte E-Mails für Trial-Erinnerungen und Buchungsbestätigungen
3. **Stripe-Integration** – automatisches Upgrade/Downgrade ohne manuelle E-Mail
4. **Passwort-Reset per E-Mail** – Token-basierter Reset-Flow
5. **Behandler-Verfügbarkeiten** – individuelle Arbeitszeiten pro Behandler
6. **Automatisierte Tests** – Jest/Supertest für alle kritischen API-Routen
7. **Nginx + HTTPS + PM2** – Produktions-Deployment-Setup

---

## Projekt-Phasen-Übersicht

Phasen 1–9 abgeschlossen 2026-06-17. Phase 10 abgeschlossen 2026-06-17. Phasen 11–12 abgeschlossen 2026-06-18. Phase 13 (AI Praxismanager) abgeschlossen 2026-06-18. Phase 14 (Dashboard-Mehrsprachigkeit) abgeschlossen 2026-06-18.
