const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { getDb } = require('../database');
const { t, getLang, SUPPORTED_LANGS } = require('../utils/language');
const db = new Proxy({}, { get: (_, p) => (...args) => getDb()[p](...args) });

const router = express.Router();

router.get('/', requireAuth, (req, res) => {
  const practice = db.prepare('SELECT * FROM practices WHERE id = ?').get(req.session.practiceId);
  if (!practice) return res.status(404).json({ error: t('err_practice_not_found', getLang(req)) });
  res.json(practice);
});

router.put('/', requireAdmin, (req, res) => {
  const allowed = ['name', 'address', 'zip', 'city', 'phone', 'email', 'website', 'description', 'opening_hours', 'account_status'];

  if ('account_status' in req.body && !['active', 'paused'].includes(req.body.account_status)) {
    return res.status(400).json({ error: t('err_invalid_account_status', getLang(req)) });
  }
  const setClauses = [];
  const values = [];

  for (const field of allowed) {
    if (field in req.body) {
      setClauses.push(`${field} = ?`);
      values.push(req.body[field] !== '' ? req.body[field] : null);
    }
  }

  if (setClauses.length === 0) {
    return res.json(db.prepare('SELECT * FROM practices WHERE id = ?').get(req.session.practiceId));
  }

  setClauses.push('updated_at = CURRENT_TIMESTAMP');
  values.push(req.session.practiceId);

  db.prepare(`UPDATE practices SET ${setClauses.join(', ')} WHERE id = ?`).run(...values);
  res.json(db.prepare('SELECT * FROM practices WHERE id = ?').get(req.session.practiceId));
});

router.put('/language', requireAdmin, (req, res) => {
  const { language } = req.body;
  if (!SUPPORTED_LANGS.includes(language)) {
    return res.status(400).json({ error: t('err_invalid_language', getLang(req)) });
  }
  db.prepare('UPDATE practices SET language = ? WHERE id = ?').run(language, req.session.practiceId);
  res.cookie('lang', language, { maxAge: 365 * 24 * 60 * 60 * 1000, httpOnly: false, sameSite: 'lax' });
  res.json({ success: true, language });
});

router.get('/subscription', requireAuth, (req, res) => {
  const practice = db.prepare(
    'SELECT package, language, trial_end_date, account_status FROM practices WHERE id = ?'
  ).get(req.session.practiceId);
  if (!practice) return res.status(404).json({ error: t('err_practice_not_found', getLang(req)) });

  const today = new Date().toISOString().slice(0, 10);
  const trialEnd = practice.trial_end_date;
  let trialDaysLeft = null;
  if (trialEnd) {
    const diff = Math.ceil((new Date(trialEnd) - new Date(today)) / (1000 * 60 * 60 * 24));
    trialDaysLeft = diff;
  }

  res.json({
    package: practice.package || 'BASIC',
    language: practice.language || 'de',
    trial_end_date: trialEnd,
    trial_days_left: trialDaysLeft,
    account_status: practice.account_status || 'active',
  });
});

router.get('/settings', requireAuth, (req, res) => {
  const settings = db.prepare('SELECT key, value FROM settings WHERE practice_id = ?').all(req.session.practiceId);
  const result = {};
  settings.forEach((s) => { result[s.key] = s.value; });
  res.json(result);
});

router.put('/settings', requireAdmin, (req, res) => {
  const entries = Object.entries(req.body);
  const upsert = db.prepare(`
    INSERT INTO settings (id, practice_id, key, value, updated_at)
    VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(practice_id, key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP
  `);

  const transaction = db.transaction(() => {
    entries.forEach(([key, value]) => {
      upsert.run(uuidv4(), req.session.practiceId, key, String(value));
    });
  });

  transaction();
  res.json({ success: true });
});

module.exports = router;
