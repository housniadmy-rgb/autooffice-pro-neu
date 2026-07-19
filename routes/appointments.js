const express = require('express');
const { v4: uuidv4 } = require('uuid');
const moment = require('moment');
const { requireAuth } = require('../middleware/auth');
const { sendAppointmentCancellation } = require('../utils/email');
const { triggerWaitlistForCancelledAppointment } = require('../utils/cron');
const { getDb } = require('../database');
const { logActivity } = require('../utils/activity');
const { t, getLang } = require('../utils/language');
const db = new Proxy({}, { get: (_, p) => (...args) => getDb()[p](...args) });

const router = express.Router();

router.get('/', requireAuth, (req, res) => {
  const practiceId = req.session.practiceId;
  const { from, to, practitioner_id, status, archive_filter } = req.query;

  let query = `
    SELECT a.*, pr.first_name as practitioner_first_name, pr.last_name as practitioner_last_name, pr.title as practitioner_title
    FROM appointments a
    LEFT JOIN practitioners pr ON a.practitioner_id = pr.id
    WHERE a.practice_id = ?
  `;
  const params = [practiceId];

  if (from) { query += ' AND a.appointment_date >= ?'; params.push(from); }
  if (to) { query += ' AND a.appointment_date <= ?'; params.push(to); }
  if (practitioner_id) { query += ' AND a.practitioner_id = ?'; params.push(practitioner_id); }
  if (status) {
    query += ' AND a.status = ?'; params.push(status);
  } else if (archive_filter === 'archived') {
    query += " AND a.status = 'archived'";
  } else if (archive_filter === 'all') {
    // no status filter
  } else {
    // default: active only (exclude archived)
    query += " AND a.status != 'archived'";
  }

  query += ' ORDER BY a.appointment_date ASC, a.appointment_time ASC';

  const appointments = db.prepare(query).all(...params);
  res.json(appointments);
});

router.get('/:id', requireAuth, (req, res) => {
  const appointment = db.prepare(`
    SELECT a.*, pr.first_name as practitioner_first_name, pr.last_name as practitioner_last_name
    FROM appointments a
    LEFT JOIN practitioners pr ON a.practitioner_id = pr.id
    WHERE a.id = ? AND a.practice_id = ?
  `).get(req.params.id, req.session.practiceId);

  if (!appointment) return res.status(404).json({ error: t('err_appointment_not_found', getLang(req)) });
  res.json(appointment);
});

router.post('/', requireAuth, (req, res) => {
  const { practitioner_id, patient_first_name, patient_last_name, patient_email, patient_phone, appointment_date, appointment_time, duration_minutes, appointment_type, notes } = req.body;

  if (!practitioner_id || !patient_first_name || !patient_last_name || !patient_email || !appointment_date || !appointment_time) {
    return res.status(400).json({ error: t('err_required_fields_missing', getLang(req)) });
  }

  const conflict = db.prepare(`
    SELECT id FROM appointments
    WHERE practitioner_id = ? AND appointment_date = ? AND appointment_time = ? AND status = 'scheduled'
  `).get(practitioner_id, appointment_date, appointment_time);

  if (conflict) {
    return res.status(409).json({ error: t('err_time_conflict', getLang(req)) });
  }

  const id = uuidv4();
  const cancelToken = uuidv4();

  db.prepare(`
    INSERT INTO appointments (id, practice_id, practitioner_id, patient_first_name, patient_last_name, patient_email, patient_phone, appointment_date, appointment_time, duration_minutes, appointment_type, notes, cancel_token)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, req.session.practiceId, practitioner_id, patient_first_name, patient_last_name, patient_email, patient_phone || null, appointment_date, appointment_time, duration_minutes || 30, appointment_type || null, notes || null, cancelToken);

  const appointment = db.prepare('SELECT * FROM appointments WHERE id = ?').get(id);
  logActivity(getDb(), req.session.practiceId, req.session.userEmail, 'appointment.created', 'appointment', id, { date: appointment_date, time: appointment_time });
  res.status(201).json(appointment);
});

router.put('/:id', requireAuth, (req, res) => {
  const appointment = db.prepare('SELECT * FROM appointments WHERE id = ? AND practice_id = ?').get(req.params.id, req.session.practiceId);
  if (!appointment) return res.status(404).json({ error: t('err_appointment_not_found', getLang(req)) });

  const { patient_first_name, patient_last_name, patient_email, patient_phone, appointment_date, appointment_time, duration_minutes, appointment_type, status, notes } = req.body;

  db.prepare(`
    UPDATE appointments SET
      patient_first_name = COALESCE(?, patient_first_name),
      patient_last_name = COALESCE(?, patient_last_name),
      patient_email = COALESCE(?, patient_email),
      patient_phone = COALESCE(?, patient_phone),
      appointment_date = COALESCE(?, appointment_date),
      appointment_time = COALESCE(?, appointment_time),
      duration_minutes = COALESCE(?, duration_minutes),
      appointment_type = COALESCE(?, appointment_type),
      status = COALESCE(?, status),
      notes = COALESCE(?, notes)
    WHERE id = ? AND practice_id = ?
  `).run(patient_first_name || null, patient_last_name || null, patient_email || null, patient_phone || null, appointment_date || null, appointment_time || null, duration_minutes || null, appointment_type || null, status || null, notes || null, req.params.id, req.session.practiceId);

  const updated = db.prepare('SELECT * FROM appointments WHERE id = ? AND practice_id = ?').get(req.params.id, req.session.practiceId);
  logActivity(getDb(), req.session.practiceId, req.session.userEmail, 'appointment.updated', 'appointment', req.params.id, { status: status || updated.status });
  res.json(updated);
});

router.delete('/:id', requireAuth, async (req, res) => {
  const appointment = db.prepare('SELECT * FROM appointments WHERE id = ? AND practice_id = ?').get(req.params.id, req.session.practiceId);
  if (!appointment) return res.status(404).json({ error: t('err_appointment_not_found', getLang(req)) });

  db.prepare("UPDATE appointments SET status = 'cancelled' WHERE id = ? AND practice_id = ?").run(req.params.id, req.session.practiceId);
  logActivity(getDb(), req.session.practiceId, req.session.userEmail, 'appointment.cancelled', 'appointment', req.params.id, {});

  const practice = db.prepare('SELECT * FROM practices WHERE id = ?').get(req.session.practiceId);
  try {
    await sendAppointmentCancellation(appointment, practice);
  } catch (err) {
    console.error('Absagemail fehlgeschlagen:', err.message);
  }

  try {
    triggerWaitlistForCancelledAppointment(getDb(), req.params.id, req.session.practiceId);
  } catch (err) {
    console.error('Wartelisten-Trigger fehlgeschlagen:', err.message);
  }

  res.json({ success: true });
});

router.get('/public/available-slots', (req, res) => {
  const { practitioner_id, date } = req.query;
  if (!practitioner_id || !date) return res.status(400).json({ error: t('err_practitioner_date_required', getLang(req)) });

  const booked = db.prepare(`
    SELECT appointment_time FROM appointments
    WHERE practitioner_id = ? AND appointment_date = ? AND status = 'scheduled'
  `).all(practitioner_id, date).map((r) => r.appointment_time);

  const allSlots = [];
  for (let h = 8; h < 18; h++) {
    for (let m = 0; m < 60; m += 30) {
      allSlots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    }
  }

  const available = allSlots.filter((slot) => !booked.includes(slot));
  res.json(available);
});

module.exports = router;
