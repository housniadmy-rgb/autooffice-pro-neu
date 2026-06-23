const express = require('express');
const { v4: uuidv4 } = require('uuid');
const moment = require('moment');
const { requireAuth } = require('../middleware/auth');
const { getDb } = require('../database');
const db = new Proxy({}, { get: (_, p) => (...args) => getDb()[p](...args) });

const router = express.Router();

// ── Admin: alle Einträge der Praxis ──────────────────────

router.get('/', requireAuth, (req, res) => {
  const entries = db.prepare(`
    SELECT w.*, pr.first_name as practitioner_first_name, pr.last_name as practitioner_last_name
    FROM waitlist w
    LEFT JOIN practitioners pr ON w.practitioner_id = pr.id
    WHERE w.practice_id = ?
    ORDER BY w.created_at DESC
  `).all(req.session.practiceId);
  res.json(entries);
});

// ── Öffentlich: Patient trägt sich ein ───────────────────

router.post('/', (req, res) => {
  const { practice_id, practitioner_id, patient_first_name, patient_last_name, patient_email, patient_phone, language, preferred_period } = req.body;

  if (!practice_id || !patient_first_name || !patient_last_name || !patient_email) {
    return res.status(400).json({ error: 'Pflichtfelder fehlen' });
  }

  const practiceExists = db.prepare('SELECT id FROM practices WHERE id = ?').get(practice_id);
  if (!practiceExists) return res.status(404).json({ error: 'Praxis nicht gefunden' });

  const id = uuidv4();
  db.prepare(`
    INSERT INTO waitlist (id, practice_id, practitioner_id, patient_first_name, patient_last_name, patient_email, patient_phone, language, preferred_period, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'waiting')
  `).run(
    id, practice_id,
    practitioner_id || null,
    patient_first_name.trim(), patient_last_name.trim(),
    patient_email.trim().toLowerCase(),
    patient_phone || null,
    language || 'de',
    preferred_period || null,
  );

  res.status(201).json({ success: true, id });
});

// ── Admin: Eintrag löschen ────────────────────────────────

router.delete('/:id', requireAuth, (req, res) => {
  const entry = db.prepare('SELECT * FROM waitlist WHERE id = ? AND practice_id = ?').get(req.params.id, req.session.practiceId);
  if (!entry) return res.status(404).json({ error: 'Eintrag nicht gefunden' });

  db.prepare('DELETE FROM waitlist_offers WHERE waitlist_id = ?').run(req.params.id);
  db.prepare('DELETE FROM waitlist WHERE id = ? AND practice_id = ?').run(req.params.id, req.session.practiceId);
  res.json({ success: true });
});

// ── Öffentlich: Angebot annehmen via Token ───────────────

router.get('/accept', (req, res) => {
  const { token } = req.query;
  if (!token) return res.status(400).json({ error: 'Token fehlt' });

  const offer = db.prepare(`
    SELECT wo.*, w.practice_id, w.patient_first_name, w.patient_last_name, w.patient_email, w.patient_phone, w.language
    FROM waitlist_offers wo
    JOIN waitlist w ON wo.waitlist_id = w.id
    WHERE wo.token = ?
  `).get(token);

  if (!offer) return res.status(404).json({ error: 'Angebot nicht gefunden' });
  if (offer.status === 'accepted') return res.status(409).json({ error: 'Angebot bereits angenommen' });
  if (offer.status === 'expired' || offer.expires_at < moment().format('YYYY-MM-DD HH:mm:ss')) {
    if (offer.status !== 'expired') {
      db.prepare("UPDATE waitlist_offers SET status = 'expired' WHERE id = ?").run(offer.id);
    }
    return res.status(410).json({ error: 'Angebot abgelaufen' });
  }

  const original = db.prepare('SELECT * FROM appointments WHERE id = ?').get(offer.appointment_id);
  if (!original) return res.status(404).json({ error: 'Ursprünglicher Termin nicht mehr vorhanden' });

  // Prüfen ob Slot noch frei
  const conflict = db.prepare(`
    SELECT id FROM appointments
    WHERE practitioner_id = ? AND appointment_date = ? AND appointment_time = ? AND status = 'scheduled'
  `).get(original.practitioner_id, original.appointment_date, original.appointment_time);

  if (conflict) return res.status(409).json({ error: 'Zeitslot ist inzwischen wieder belegt' });

  const newId = uuidv4();
  const cancelToken = uuidv4();

  db.prepare(`
    INSERT INTO appointments (id, practice_id, practitioner_id, patient_first_name, patient_last_name, patient_email, patient_phone, appointment_date, appointment_time, duration_minutes, appointment_type, status, cancel_token)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'scheduled', ?)
  `).run(
    newId, original.practice_id, original.practitioner_id,
    offer.patient_first_name, offer.patient_last_name, offer.patient_email, offer.patient_phone || null,
    original.appointment_date, original.appointment_time, original.duration_minutes || 30,
    original.appointment_type || null, cancelToken,
  );

  db.prepare("UPDATE waitlist_offers SET status = 'accepted' WHERE id = ?").run(offer.id);
  db.prepare("UPDATE waitlist SET status = 'booked' WHERE id = ?").run(offer.waitlist_id);

  res.json({
    success: true,
    appointment: {
      date: original.appointment_date,
      time: original.appointment_time,
      appointment_id: newId,
    },
  });
});

// ── Admin: Statistiken für Dashboard-Automatisierungskarte ─

router.get('/stats', requireAuth, (req, res) => {
  const practiceId = req.session.practiceId;

  const waitingCount = db.prepare(`
    SELECT COUNT(*) as count FROM waitlist WHERE practice_id = ? AND status = 'waiting'
  `).get(practiceId);

  const pendingReviewMails = db.prepare(`
    SELECT COUNT(*) as count FROM appointments
    WHERE practice_id = ? AND status = 'completed' AND review_mail_sent = 0
      AND datetime(appointment_date || ' ' || appointment_time) < datetime('now', '-24 hours')
  `).get(practiceId);

  const lastCleanup = db.prepare(`
    SELECT ran_at FROM automation_log WHERE type = 'cleanup' ORDER BY ran_at DESC LIMIT 1
  `).get();

  res.json({
    waitlist_waiting: waitingCount.count,
    pending_review_mails: pendingReviewMails.count,
    last_cleanup: lastCleanup ? lastCleanup.ran_at : null,
  });
});

module.exports = router;
