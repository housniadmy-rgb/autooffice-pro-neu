const express = require('express');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const { requireAuth } = require('../middleware/auth');
const { getDb } = require('../database');
const { logActivity } = require('../utils/activity');
const { SUPPORTED_LANGS } = require('../utils/language');
const { rateLimit } = require('../utils/rateLimit');
const db = new Proxy({}, { get: (_, p) => (...args) => getDb()[p](...args) });

const loginLimiter = rateLimit({
  windowMs: 60_000, max: 5,
  message: 'Zu viele Anmeldeversuche. Bitte nach 1 Minute erneut versuchen.',
});
const registerLimiter = rateLimit({
  windowMs: 60_000, max: 3,
  message: 'Zu viele Registrierungsversuche. Bitte warte einen Moment.',
});
const forgotLimiter = rateLimit({
  windowMs: 60_000, max: 3,
  message: 'Zu viele Passwort-Zurücksetzen-Versuche. Bitte warte einen Moment.',
});

const router = express.Router();

router.post('/login', loginLimiter, async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'E-Mail und Passwort erforderlich' });
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ? AND active = 1').get(email.toLowerCase());
  if (!user) {
    return res.status(401).json({ error: 'E-Mail oder Passwort falsch' });
  }

  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) {
    return res.status(401).json({ error: 'E-Mail oder Passwort falsch' });
  }

  req.session.userId = user.id;
  req.session.userEmail = user.email;
  req.session.userRole = user.role;
  req.session.practiceId = user.practice_id;

  logActivity(getDb(), user.practice_id, user.email, 'login', 'user', user.id, null);

  const practice = db.prepare('SELECT language FROM practices WHERE id = ?').get(user.practice_id);
  const lang = (practice && practice.language) || 'en';
  res.cookie('lang', lang, { maxAge: 365 * 24 * 60 * 60 * 1000, httpOnly: false, sameSite: 'lax' });

  res.json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
      practice_id: user.practice_id,
    },
  });
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true });
  });
});

router.post('/register', registerLimiter, async (req, res) => {
  const {
    email, password, first_name, last_name,
    practice_name, practice_address, practice_zip, practice_city, practice_phone,
    language, package: pkg,
  } = req.body;

  if (!email || !password || !first_name || !last_name || !practice_name) {
    return res.status(400).json({ error: 'Alle Pflichtfelder ausfüllen' });
  }

  if (password.length < 8) {
    return res.status(400).json({ error: 'Passwort muss mindestens 8 Zeichen lang sein' });
  }

  const VALID_PACKAGES = ['BASIC', 'PROFESSIONAL', 'UNLIMITED'];
  const selectedPackage = VALID_PACKAGES.includes(pkg) ? pkg : 'BASIC';
  const selectedLanguage = SUPPORTED_LANGS.includes(language) ? language : 'en';

  const trialEnd = new Date();
  trialEnd.setDate(trialEnd.getDate() + 30);
  const trialEndDate = trialEnd.toISOString().slice(0, 10);

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());
  if (existing) {
    return res.status(409).json({ error: 'E-Mail bereits registriert' });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const practiceId = uuidv4();
  const userId = uuidv4();

  const insertPractice = db.prepare(`
    INSERT INTO practices (id, name, address, zip, city, phone, email, package, language, trial_end_date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertUser = db.prepare(`
    INSERT INTO users (id, practice_id, email, password_hash, first_name, last_name, role)
    VALUES (?, ?, ?, ?, ?, ?, 'admin')
  `);

  const transaction = db.transaction(() => {
    insertPractice.run(
      practiceId, practice_name,
      practice_address || null, practice_zip || null, practice_city || null,
      practice_phone || null, email.toLowerCase(),
      selectedPackage, selectedLanguage, trialEndDate,
    );
    insertUser.run(userId, practiceId, email.toLowerCase(), passwordHash, first_name, last_name);
  });

  transaction();

  req.session.userId = userId;
  req.session.userEmail = email.toLowerCase();
  req.session.userRole = 'admin';
  req.session.practiceId = practiceId;

  res.cookie('lang', selectedLanguage, { maxAge: 365 * 24 * 60 * 60 * 1000, httpOnly: false, sameSite: 'lax' });
  res.status(201).json({ success: true, trial_end_date: trialEndDate });

  // Begrüßungs-/Trial-Start-Mail asynchron, ohne Antwort zu blockieren
  const { sendTrialStarted } = require('../utils/email');
  sendTrialStarted({
    user: { email: email.toLowerCase(), first_name, last_name },
    practice: { name: practice_name, language: selectedLanguage, trial_end_date: trialEndDate },
    lang: selectedLanguage,
  }).catch((err) => console.error('[mail] Trial-Start FEHLER:', err && err.message ? err.message : err));
});

router.put('/password', requireAuth, async (req, res) => {
  const { current_password, new_password } = req.body;

  if (!current_password || !new_password) {
    return res.status(400).json({ error: 'Aktuelles und neues Passwort erforderlich' });
  }
  if (new_password.length < 8) {
    return res.status(400).json({ error: 'Neues Passwort muss mindestens 8 Zeichen lang sein' });
  }

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.session.userId);
  if (!user) return res.status(404).json({ error: 'Benutzer nicht gefunden' });

  const match = await bcrypt.compare(current_password, user.password_hash);
  if (!match) return res.status(401).json({ error: 'Aktuelles Passwort ist falsch' });

  const hash = await bcrypt.hash(new_password, 12);
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hash, req.session.userId);

  res.json({ success: true });

  const { sendPasswordChanged } = require('../utils/email');
  const practiceForLang = db.prepare('SELECT language FROM practices WHERE id = ?').get(user.practice_id);
  sendPasswordChanged({ user, lang: practiceForLang ? practiceForLang.language : 'de' })
    .catch((err) => console.error('[mail] Passwort-geändert FEHLER:', err && err.message ? err.message : err));
});

// ── Passwort vergessen ────────────────────────────────────

router.post('/forgot-password', forgotLimiter, async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'E-Mail erforderlich' });

  const user = db.prepare('SELECT * FROM users WHERE email = ? AND active = 1').get(email.toLowerCase());

  // Always respond 200 to avoid user enumeration
  if (!user) return res.json({ success: true });

  // Delete old tokens for this user
  db.prepare('DELETE FROM password_reset_tokens WHERE user_id = ?').run(user.id);

  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString().replace('T', ' ').slice(0, 19);

  db.prepare('INSERT INTO password_reset_tokens (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)').run(
    uuidv4(), user.id, token, expiresAt,
  );

  const appUrl = process.env.APP_URL || 'http://localhost:3000';
  const resetUrl = `${appUrl}/reset-password.html?token=${token}`;

  const { sendPasswordReset } = require('../utils/email');
  try {
    const practice = db.prepare('SELECT language FROM practices WHERE id = ?').get(user.practice_id);
    await sendPasswordReset(user, resetUrl, practice ? practice.language : 'de');
  } catch (err) {
    console.error('Passwort-Reset-Mail fehlgeschlagen:', err.message);
  }

  res.json({ success: true });
});

router.post('/reset-password', async (req, res) => {
  const { token, new_password } = req.body;
  if (!token || !new_password) return res.status(400).json({ error: 'Token und neues Passwort erforderlich' });
  if (new_password.length < 8) return res.status(400).json({ error: 'Passwort muss mindestens 8 Zeichen lang sein' });

  const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
  const row = db.prepare(`
    SELECT t.*, u.id as user_id_ref, u.email as user_email_ref
    FROM password_reset_tokens t
    JOIN users u ON t.user_id = u.id
    WHERE t.token = ? AND t.used = 0 AND t.expires_at > ?
  `).get(token, now);

  if (!row) return res.status(400).json({ error: 'Token ungültig oder abgelaufen' });

  const hash = await bcrypt.hash(new_password, 12);
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hash, row.user_id);
  db.prepare('UPDATE password_reset_tokens SET used = 1 WHERE id = ?').run(row.id);

  res.json({ success: true });

  const { sendPasswordChanged } = require('../utils/email');
  const user = db.prepare('SELECT id, email, first_name, last_name, practice_id FROM users WHERE id = ?').get(row.user_id);
  if (user) {
    const p = db.prepare('SELECT language FROM practices WHERE id = ?').get(user.practice_id);
    sendPasswordChanged({ user, lang: p ? p.language : 'de' })
      .catch((err) => console.error('[mail] Passwort-geändert FEHLER:', err && err.message ? err.message : err));
  }
});

// ── Einladungs-Token validieren ────────────────────────────

router.get('/invite/validate', (req, res) => {
  const { token } = req.query;
  if (!token) return res.status(400).json({ error: 'Token fehlt' });

  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const now = new Date().toISOString().replace('T', ' ').slice(0, 19);

  const row = db.prepare(`
    SELECT t.id, t.expires_at, t.used, u.email, u.first_name, u.practice_id
    FROM invite_tokens t
    JOIN users u ON t.user_id = u.id
    WHERE t.token_hash = ?
  `).get(tokenHash);

  if (!row) return res.status(400).json({ error: 'Token ungültig' });
  if (row.used) return res.status(400).json({ error: 'Token wurde bereits verwendet' });
  if (row.expires_at < now) return res.status(400).json({ error: 'Token abgelaufen' });

  const practice = db.prepare('SELECT name FROM practices WHERE id = ?').get(row.practice_id);
  res.json({
    valid: true,
    email: row.email,
    practice_name: practice ? practice.name : '',
  });
});

// ── Passwort setzen + Konto aktivieren ────────────────────

router.post('/invite/activate', async (req, res) => {
  const { token, new_password } = req.body;
  if (!token || !new_password) return res.status(400).json({ error: 'Token und Passwort erforderlich' });
  if (new_password.length < 8) return res.status(400).json({ error: 'Passwort muss mindestens 8 Zeichen lang sein' });

  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const now = new Date().toISOString().replace('T', ' ').slice(0, 19);

  const row = db.prepare(`
    SELECT t.id as token_id, t.user_id, t.expires_at, t.used
    FROM invite_tokens t
    WHERE t.token_hash = ?
  `).get(tokenHash);

  if (!row) return res.status(400).json({ error: 'Token ungültig' });
  if (row.used) return res.status(400).json({ error: 'Token wurde bereits verwendet' });
  if (row.expires_at < now) return res.status(400).json({ error: 'Token abgelaufen – bitte erneut einladen lassen' });

  const hash = await bcrypt.hash(new_password, 12);
  db.prepare('UPDATE users SET password_hash = ?, active = 1 WHERE id = ?').run(hash, row.user_id);
  db.prepare('UPDATE invite_tokens SET used = 1 WHERE id = ?').run(row.token_id);

  // Update linked demo_request status to 'aktiviert'
  db.prepare("UPDATE demo_requests SET status = 'aktiviert' WHERE invited_user_id = ? AND status = 'eingeladen'").run(row.user_id);

  console.log(`[invite] Konto aktiviert für user_id=${row.user_id}`);
  res.json({ success: true });

  const { sendAccountActivated } = require('../utils/email');
  const user = db.prepare('SELECT id, email, first_name, last_name, practice_id FROM users WHERE id = ?').get(row.user_id);
  if (user) {
    const p = db.prepare('SELECT language FROM practices WHERE id = ?').get(user.practice_id);
    sendAccountActivated({ user, lang: p ? p.language : 'de' })
      .catch((err) => console.error('[mail] Konto-aktiviert FEHLER:', err && err.message ? err.message : err));
  }
});

router.get('/me', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Nicht angemeldet' });
  }

  const user = db.prepare('SELECT id, email, first_name, last_name, role, practice_id FROM users WHERE id = ?').get(req.session.userId);
  if (!user) {
    return res.status(404).json({ error: 'Benutzer nicht gefunden' });
  }

  res.json(user);
});

module.exports = router;
