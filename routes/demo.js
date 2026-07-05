const express = require('express');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const { sendDemoRequest, sendInviteEmail, sendContactConfirmation } = require('../utils/email');
const { getDb } = require('../database');

const router = express.Router();

function generateInviteToken() {
  const raw = crypto.randomBytes(32).toString('hex');
  const hash = crypto.createHash('sha256').update(raw).digest('hex');
  return { raw, hash };
}

// Wraps a promise so SMTP errors / hangs never bubble up.
// The hard timeout protects against transporter calls that ignore their own socketTimeout.
function fireAndForget(label, promiseFactory, timeoutMs = 12000) {
  setImmediate(() => {
    let settled = false;
    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      console.error(`[demo] ${label} Timeout nach ${timeoutMs}ms – wird ignoriert`);
    }, timeoutMs);

    Promise.resolve()
      .then(() => promiseFactory())
      .then(() => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
      })
      .catch((err) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        console.error(`[demo] ${label} Fehler:`, err && err.message ? err.message : err);
      });
  });
}

router.post('/', async (req, res) => {
  const { practice, contact, email, phone, country, language, message } = req.body;

  if (!practice || !contact || !email || !country) {
    return res.status(400).json({ error: 'Pflichtfelder fehlen' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Ungültige E-Mail-Adresse' });
  }

  const db = getDb();
  const demoId = uuidv4();

  // 1) Demo-Anfrage sofort speichern. WICHTIG: Fehler hier NICHT mit 200 quittieren –
  // sonst sieht der Nutzer "Demo gesendet", aber im Owner-Dashboard taucht
  // keine Anfrage auf (Demo verschwindet spurlos, weil das frühe return danach
  // auch Auto-Onboarding + Mailversand überspringt).
  try {
    db.prepare(
      'INSERT INTO demo_requests (id, practice, contact, email, phone, country, language, message) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(demoId, practice, contact, email, phone || null, country, language || null, message || null);
    console.log(`[demo] gespeichert: id=${demoId} email=${email} practice="${practice}"`);
  } catch (err) {
    console.error('[demo] DB-Fehler beim Speichern – Anfrage NICHT gespeichert:',
      err && err.stack ? err.stack : err);
    return res.status(500).json({ error: 'Anfrage konnte nicht gespeichert werden. Bitte später erneut versuchen.' });
  }

  // 2) Auto-Onboarding (DB-Operationen) – synchron, damit der Invite-Link existiert.
  //
  // Drei Wege für die gefundene E-Mail:
  //   (a) unbekannt        → Praxis + User + Invite anlegen, Mail schicken
  //   (b) existiert, active=0 → identischen User wiederverwenden, offene Token
  //                             invalidieren, neuen Token erzeugen, Mail schicken
  //   (c) existiert, active=1 → skip (bereits aktivierter Account darf per
  //                             Demo-Formular NICHT überschrieben werden)
  let inviteContext = null;
  let inviteSkipReason = null;
  try {
    const existingUser = db.prepare(
      'SELECT id, active, practice_id FROM users WHERE LOWER(email) = LOWER(?)'
    ).get(email);

    if (existingUser && existingUser.active === 1) {
      // (c) Aktivierter User – Sicherheits-Skip.
      inviteSkipReason = `Benutzer ${email} ist bereits aktiviert (user_id=${existingUser.id}) – keine neue Einladung erzeugt`;
      console.log(`[demo] ${inviteSkipReason}`);
    } else {
      let userId, practiceId;
      const lang = language || 'de';

      if (existingUser) {
        // (b) Bestehender inaktiver User – Resend.
        userId = existingUser.id;
        practiceId = existingUser.practice_id;
        // Offene Token entwerten, damit alte Links nicht mehr genutzt werden können.
        db.prepare(
          'UPDATE invite_tokens SET used = 1 WHERE user_id = ? AND used = 0'
        ).run(userId);
        console.log(`[demo] Bestehender inaktiver Benutzer ${email} (user_id=${userId}) – offene Invite-Token invalidiert, neuer Token wird erzeugt`);
      } else {
        // (a) Neuer User – Praxis + User anlegen.
        practiceId = uuidv4();
        userId = uuidv4();
        const placeholderHash = await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 10);

        db.prepare(
          'INSERT INTO practices (id, name, email, package, language, account_status) VALUES (?, ?, ?, ?, ?, ?)'
        ).run(practiceId, practice, email.toLowerCase(), 'BASIC', lang, 'active');

        db.prepare(
          'INSERT INTO users (id, practice_id, email, password_hash, first_name, last_name, role, active) VALUES (?, ?, ?, ?, ?, ?, ?, 0)'
        ).run(userId, practiceId, email.toLowerCase(), placeholderHash, contact, '', 'admin');
      }

      // Gemeinsamer Rest für (a) + (b): neuer Invite-Token, demo_requests updaten,
      // inviteContext für den späteren Mailversand aufbauen.
      const { raw, hash } = generateInviteToken();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().replace('T', ' ').slice(0, 19);
      // Sprache am Token speichern → /i/<token>-Redirect kennt das Locale ohne
      // ?lang=…-Query-String in der Mail (die Mobile-Mail-Clients zerlegen).
      db.prepare(
        'INSERT INTO invite_tokens (id, user_id, token_hash, expires_at, language) VALUES (?, ?, ?, ?, ?)'
      ).run(uuidv4(), userId, hash, expiresAt, lang);

      db.prepare('UPDATE demo_requests SET status = ?, invited_user_id = ? WHERE id = ?')
        .run('eingeladen', userId, demoId);

      const appUrl = process.env.APP_URL || 'https://praxisonline24.onrender.com';
      inviteContext = {
        contact,
        practice,
        email,
        // KURZ-Link: kein ?, kein & → kein Line-Break-Punkt in mobiler Mail.
        // Server-seitige Route /i/:token schaut die Sprache nach und macht
        // 302 → /set-password.html?token=…&lang=…
        setPasswordUrl: `${appUrl}/i/${raw}`,
        lang,
      };
    }
  } catch (err) {
    inviteSkipReason = `Onboarding-Exception: ${err && err.message ? err.message : String(err)}`;
    console.error('[demo] Onboarding-Fehler – keine Einladung erzeugt:', err && err.stack ? err.stack : err);
  }

  // 3) Sofort antworten – E-Mails laufen im Hintergrund
  res.status(200).json({ ok: true });

  // 4) Hintergrund-Versand (blockiert die Antwort nie).
  // Admin-Benachrichtigung läuft parallel – hat keinen zeitlichen Bezug zur Kunden-Mail.
  fireAndForget('Benachrichtigungs-E-Mail', () =>
    sendDemoRequest({ practice, contact, email, phone, country, language, message })
  );

  // Kontakt-Bestätigung und Einladungs-Mail STRIKT SERIELL im selben Wrapper.
  //
  // Warum nicht zwei fireAndForget-Calls? Die würden parallel via setImmediate
  // loslaufen und die Reihenfolge dem Zufall überlassen.
  //
  // Warum der 2000ms-Puffer NACH der Bestätigung? Selbst wenn wir seriell
  // awaiten, akzeptiert Brevo den ersten Request in ~50–200ms und queued die
  // Mail intern. Wenn der zweite Request unmittelbar folgt, kann Brevos
  // SMTP-Queue-Worker beide gleichzeitig picken → Reihenfolge im Postfach
  // undefiniert. 2 s Wartezeit stellt sicher, dass die erste Mail Brevos
  // Delivery-Pipeline verlassen hat, bevor die zweite hereinkommt.
  //
  // fireAndForget-Timeout auf 40 s erhöht: Brevo-Request 1 (max 12 s) + 2 s
  // Puffer + Brevo-Request 2 (max 12 s) + Sicherheitsmarge.
  const CONTACT_TO_INVITE_DELAY_MS = 2000;
  fireAndForget('Kontakt-Bestätigung + Einladung', async () => {
    const t0 = Date.now();
    try {
      await sendContactConfirmation({ to: email, contactName: contact, lang: language || 'de' });
      console.log(`[demo] CONTACT_CONFIRMATION sent (${Date.now() - t0}ms) — waiting ${CONTACT_TO_INVITE_DELAY_MS}ms before invite`);
    } catch (err) {
      // Bestätigungs-Mail-Fehler darf die Einladung NICHT blockieren – nur loggen.
      console.error('[demo] Kontakt-Bestätigung Fehler:', err && err.message ? err.message : err);
    }
    if (inviteContext) {
      // Bewusste Wartezeit gegen Brevo-Queue-Race.
      await new Promise((resolve) => setTimeout(resolve, CONTACT_TO_INVITE_DELAY_MS));
      const t1 = Date.now();
      await sendInviteEmail(inviteContext);
      console.log(`[demo] INVITE_EMAIL sent (${Date.now() - t1}ms) — total pipeline ${Date.now() - t0}ms`);
      console.log(`[demo] Einladung-Pipeline abgeschlossen für ${inviteContext.email} (${inviteContext.practice})`);
    }
  }, 40000);

  if (inviteContext) {
    console.log(`[demo] Invite-Link (Fallback): ${inviteContext.setPasswordUrl}`);
  } else {
    // Klare Diagnose, warum keine Invite-Mail rausging – sichtbar in Render-Logs
    // neben der parallel laufenden Kontakt-Bestätigung. Damit ist beim nächsten
    // "Kontakt-Mail kommt, Invite nicht"-Issue sofort erkennbar, ob der
    // Versand übersprungen wurde (User existiert / Onboarding-Fehler) oder ob
    // Brevo die Mail abgelehnt hat.
    console.warn(`[demo] EINLADUNG NICHT VERSENDET an ${email} – Grund: ${inviteSkipReason || 'unbekannt'}`);
  }
});

module.exports = router;
