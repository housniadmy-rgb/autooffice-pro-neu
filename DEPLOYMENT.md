# Deployment auf Render.com

> **Hinweis:** Deployment erst nach vollständigem lokalen Test starten.
> Diese Datei beschreibt die Vorbereitung – noch kein Live-Schalten.

---

## Voraussetzungen

- GitHub-Repository: `https://github.com/housniadmy-rgb/praxisonline24`
- Render-Account: [render.com](https://render.com) (kostenloser Plan genügt)
- Node.js ≥ 18 (automatisch auf Render)

---

## Schritt 1: Render-Account & GitHub verbinden

1. [render.com](https://render.com) → **Get Started for Free**
2. Mit GitHub-Account einloggen (oder neu registrieren)
3. **Dashboard → New → Web Service**
4. **Connect a repository** → `housniadmy-rgb/praxisonline24` auswählen
5. **Connect** klicken

---

## Schritt 2: Web Service konfigurieren

| Feld | Wert |
|---|---|
| **Name** | `praxisonline24` |
| **Region** | Frankfurt (EU Central) |
| **Branch** | `main` |
| **Runtime** | Node |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Instance Type** | Free (oder Starter für Persistent Disk) |

---

## Schritt 3: Umgebungsvariablen setzen

Im Render-Dashboard unter **Environment → Add Environment Variable**:

| Variable | Wert | Pflicht |
|---|---|---|
| `NODE_ENV` | `production` | ✅ |
| `SESSION_SECRET` | zufälliger langer String (min. 32 Zeichen) | ✅ |
| `EMAIL_DEV_MODE` | `false` (oder `true` zum Testen) | ✅ |
| `SMTP_HOST` | z. B. `smtp.gmail.com` | für E-Mail |
| `SMTP_PORT` | `587` | für E-Mail |
| `SMTP_USER` | E-Mail-Adresse | für E-Mail |
| `SMTP_PASS` | App-Passwort / SMTP-Passwort | für E-Mail |
| `SMTP_FROM` | `PraxisOnline24 <noreply@example.com>` | für E-Mail |

### SESSION_SECRET generieren

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Schritt 4: Health Check

Render prüft automatisch ob der Server läuft:

- **Health Check Path:** `/api/health`
- Gibt `{"status":"ok","app":"PraxisOnline24"}` zurück

---

## Schritt 5: Deployment starten

1. Auf **Create Web Service** klicken
2. Render installiert automatisch `npm install`
3. Danach startet `npm start`
4. Nach ca. 2–3 Minuten ist die App erreichbar unter:
   `https://praxisonline24.onrender.com`

---

## ⚠️ Wichtiger Hinweis: SQLite auf Render Free Tier

### Das Problem

Die App verwendet **SQLite via sql.js** (speichert in `data/praxisonline24.db`).

Auf dem **kostenlosen Render-Plan** ist der Dateispeicher **ephemeral** (flüchtig):
- Bei jedem Neustart / Redeploy wird die Datenbank **zurückgesetzt**
- Alle registrierten Praxen, Termine, Daten gehen verloren
- Render fährt den Server nach 15 Minuten Inaktivität herunter

### Kurzfristige Lösung: Render Disk

Für echte Datenpersistenz mit SQLite:

1. Render Dashboard → Web Service → **Disks**
2. **Add Disk** → Mount Path: `/opt/render/project/src/data`
3. Größe: 1 GB (ca. $0,25/Monat)

Dann bleibt die Datenbank auch nach Neustarts erhalten.

### Langfristige Lösung: PostgreSQL

Für produktiven Betrieb mit mehreren Benutzern wird **PostgreSQL** empfohlen:

1. Render Dashboard → **New → PostgreSQL** (kostenloser Plan: 90 Tage)
2. `DATABASE_URL` Umgebungsvariable kopieren
3. `database.js` auf `pg`-Paket (node-postgres) umstellen
4. Alle SQL-Abfragen bleiben weitgehend kompatibel

```bash
# PostgreSQL-Paket installieren
npm install pg
```

---

## Automatische Deployments

Nach der Einrichtung deployt Render automatisch bei jedem `git push origin main`.

```bash
# Lokale Änderung pushen → automatisches Deployment
git push origin main
```

---

## Lokaler Test vor Deployment

```bash
# .env aus .env.example kopieren und anpassen
cp .env.example .env

# Für lokale Tests IMMER im Dev-Modus starten:
# NODE_ENV=production lokal führt dazu dass cookie.secure=true gesetzt wird,
# was über plain HTTP (localhost) keine Sessions erlaubt (by design, korrekt).
npm start          # → NODE_ENV=development (Standard, kein Secure-Cookie)
npm run dev        # → mit nodemon + Auto-Reload
```

---

## Sicherheits-Checkliste vor Go-Live

- [ ] `SESSION_SECRET` ist ein zufälliger 32+ Zeichen-String
- [ ] `NODE_ENV=production` gesetzt
- [ ] `.env` ist in `.gitignore` und nicht im Repository
- [ ] `data/` ist in `.gitignore` und nicht im Repository
- [ ] SMTP-Zugangsdaten als Render-Umgebungsvariablen gesetzt (nicht im Code)
- [ ] HTTPS ist aktiv (Render stellt TLS automatisch bereit)
- [ ] `cookie.secure=true` ist bei `NODE_ENV=production` gesetzt ✅

---

## Bekannte Einschränkungen (Free Tier)

| Einschränkung | Auswirkung |
|---|---|
| Ephemeral Disk | Daten gehen bei Neustart verloren → Disk oder PostgreSQL nötig |
| Sleep nach 15 Min. | Erster Request nach Inaktivität dauert ~30 Sek. |
| 750 Std./Monat | Entspricht ca. 1 dauerhaft laufenden Service |
| Kein Custom Domain SSL kostenlos | Render-Subdomain hat kostenlos HTTPS |
