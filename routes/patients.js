const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { getDb } = require('../database');
const db = new Proxy({}, { get: (_, p) => (...args) => getDb()[p](...args) });

const router = express.Router();

router.get('/', requireAuth, (req, res) => {
  const patients = db.prepare(`
    SELECT
      patient_first_name,
      patient_last_name,
      patient_email,
      MAX(patient_phone) AS patient_phone,
      COUNT(*) AS appointment_count,
      MAX(appointment_date) AS last_appointment_date
    FROM appointments
    WHERE practice_id = ?
    GROUP BY LOWER(patient_email)
    ORDER BY last_appointment_date DESC
  `).all(req.session.practiceId);

  res.json(patients);
});

router.get('/history', requireAuth, (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ error: 'E-Mail erforderlich' });

  const appointments = db.prepare(`
    SELECT
      a.id, a.appointment_date, a.appointment_time, a.duration_minutes,
      a.appointment_type, a.status,
      pr.first_name AS practitioner_first_name,
      pr.last_name  AS practitioner_last_name,
      pr.title      AS practitioner_title
    FROM appointments a
    LEFT JOIN practitioners pr ON a.practitioner_id = pr.id
    WHERE a.practice_id = ? AND LOWER(a.patient_email) = LOWER(?)
    ORDER BY a.appointment_date DESC, a.appointment_time DESC
  `).all(req.session.practiceId, email);

  res.json(appointments);
});

module.exports = router;
