const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { sendAppointmentConfirmation } = require('../utils/email');
const { getDb } = require('../database');
const { t, getLang } = require('../utils/language');
const db = new Proxy({}, { get: (_, p) => (...args) => getDb()[p](...args) });

const router = express.Router();

router.get('/practices/:id', (req, res) => {
  const practice = db.prepare('SELECT id, name, address, zip, city, phone, email, website, description, opening_hours FROM practices WHERE id = ?').get(req.params.id);
  if (!practice) return res.status(404).json({ error: t('err_practice_not_found', getLang(req)) });

  const practitioners = db.prepare('SELECT id, first_name, last_name, title, specialty, bio FROM practitioners WHERE practice_id = ? AND active = 1').all(req.params.id);
  const avgRating = db.prepare('SELECT AVG(rating) as avg, COUNT(*) as count FROM reviews WHERE practice_id = ? AND visible = 1').get(req.params.id);
  const reviews = db.prepare('SELECT id, rating, comment, author_name, created_at FROM reviews WHERE practice_id = ? AND visible = 1 ORDER BY created_at DESC LIMIT 5').all(req.params.id);

  res.json({ practice, practitioners, rating: avgRating, reviews });
});

function jsWeekdayToMon0(jsDay) {
  return jsDay === 0 ? 6 : jsDay - 1;
}

function generateSlotsFromWindows(windows) {
  const slots = [];
  for (const w of windows) {
    let [h, m] = w.start_time.split(':').map(Number);
    const [endH, endM] = w.end_time.split(':').map(Number);
    while (h * 60 + m < endH * 60 + endM) {
      slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
      m += 30;
      if (m >= 60) { m -= 60; h++; }
    }
  }
  return slots;
}

router.get('/slots', (req, res) => {
  const { practitioner_id, date } = req.query;
  if (!practitioner_id || !date) return res.status(400).json({ error: t('err_practitioner_date_required', getLang(req)) });

  const booked = db.prepare(`
    SELECT appointment_time FROM appointments
    WHERE practitioner_id = ? AND appointment_date = ? AND status = 'scheduled'
  `).all(practitioner_id, date).map((r) => r.appointment_time);

  const availability = db.prepare('SELECT * FROM practitioner_availability WHERE practitioner_id = ?').all(practitioner_id);

  let allSlots;
  if (availability.length === 0) {
    allSlots = [];
    for (let h = 8; h < 18; h++) {
      for (let m = 0; m < 60; m += 30) {
        allSlots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
      }
    }
  } else {
    const dayOfWeek = jsWeekdayToMon0(new Date(date + 'T12:00:00').getDay());
    const windows = availability.filter((a) => a.day_of_week === dayOfWeek);
    if (windows.length === 0) return res.json([]);
    allSlots = generateSlotsFromWindows(windows);
  }

  res.json(allSlots.filter((s) => !booked.includes(s)));
});

router.post('/book', async (req, res) => {
  const { practice_id, practitioner_id, patient_first_name, patient_last_name, patient_email, patient_phone, appointment_date, appointment_time, appointment_type, patient_language } = req.body;

  if (!practice_id || !practitioner_id || !patient_first_name || !patient_last_name || !patient_email || !appointment_date || !appointment_time) {
    return res.status(400).json({ error: t('err_required_fields_missing', getLang(req)) });
  }

  const practiceExists = db.prepare('SELECT id, account_status FROM practices WHERE id = ?').get(practice_id);
  if (!practiceExists) return res.status(404).json({ error: t('err_practice_not_found', getLang(req)) });
  if (practiceExists.account_status === 'paused') {
    return res.status(402).json({ error: t('err_no_online_booking', getLang(req)) });
  }

  const conflict = db.prepare(`
    SELECT id FROM appointments
    WHERE practitioner_id = ? AND appointment_date = ? AND appointment_time = ? AND status = 'scheduled'
  `).get(practitioner_id, appointment_date, appointment_time);

  if (conflict) return res.status(409).json({ error: t('err_slot_no_longer_available', getLang(req)) });

  const id = uuidv4();
  const cancelToken = uuidv4();

  const { SUPPORTED_LANGS } = require('../utils/language');
  const lang = SUPPORTED_LANGS.includes(patient_language) ? patient_language : 'de';

  db.prepare(`
    INSERT INTO appointments (id, practice_id, practitioner_id, patient_first_name, patient_last_name, patient_email, patient_phone, appointment_date, appointment_time, appointment_type, cancel_token, patient_language)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, practice_id, practitioner_id, patient_first_name, patient_last_name, patient_email, patient_phone || null, appointment_date, appointment_time, appointment_type || null, cancelToken, lang);

  const appointment = db.prepare('SELECT * FROM appointments WHERE id = ?').get(id);
  const practice = db.prepare('SELECT * FROM practices WHERE id = ?').get(practice_id);

  try {
    await sendAppointmentConfirmation(appointment, practice);
  } catch (err) {
    console.error('Bestätigungsmail fehlgeschlagen:', err.message);
  }

  res.status(201).json({ success: true, appointment_id: id, cancel_token: cancelToken });
});

router.get('/cancel/:token', (req, res) => {
  const appointment = db.prepare(`
    SELECT a.*, p.name as practice_name FROM appointments a
    JOIN practices p ON a.practice_id = p.id
    WHERE a.cancel_token = ?
  `).get(req.params.token);

  if (!appointment) return res.status(404).json({ error: t('err_appointment_not_found', getLang(req)) });
  if (appointment.status === 'cancelled') return res.status(410).json({ error: t('err_appointment_already_cancelled', getLang(req)) });

  res.json({
    id: appointment.id,
    practice_name: appointment.practice_name,
    appointment_date: appointment.appointment_date,
    appointment_time: appointment.appointment_time,
    patient_first_name: appointment.patient_first_name,
    patient_last_name: appointment.patient_last_name,
  });
});

router.post('/cancel/:token', async (req, res) => {
  const appointment = db.prepare('SELECT * FROM appointments WHERE cancel_token = ?').get(req.params.token);
  if (!appointment) return res.status(404).json({ error: t('err_appointment_not_found', getLang(req)) });
  if (appointment.status === 'cancelled') return res.status(410).json({ error: t('err_appointment_already_cancelled', getLang(req)) });

  db.prepare("UPDATE appointments SET status = 'cancelled' WHERE cancel_token = ?").run(req.params.token);

  const practice = db.prepare('SELECT * FROM practices WHERE id = ?').get(appointment.practice_id);
  try {
    const { sendAppointmentCancellation } = require('../utils/email');
    await sendAppointmentCancellation(appointment, practice);
  } catch (err) {
    console.error('Absagemail fehlgeschlagen:', err.message);
  }

  try {
    const { triggerWaitlistForCancelledAppointment } = require('../utils/cron');
    triggerWaitlistForCancelledAppointment(getDb(), appointment.id, appointment.practice_id);
  } catch (err) {
    console.error('Wartelisten-Trigger fehlgeschlagen:', err.message);
  }

  res.json({ success: true });
});

// ── Verfügbare Tage im Monat ──────────────────────────────

router.get('/available-days', (req, res) => {
  const { practitioner_id, year, month } = req.query;
  if (!practitioner_id || !year || !month) {
    return res.status(400).json({ error: t('err_practitioner_year_month_required', getLang(req)) });
  }

  const y = parseInt(year);
  const m = parseInt(month);
  const paddedMonth = String(m).padStart(2, '0');
  const lastDayNum = new Date(y, m, 0).getDate();
  const firstDay = `${y}-${paddedMonth}-01`;
  const lastDay = `${y}-${paddedMonth}-${String(lastDayNum).padStart(2, '0')}`;
  const today = new Date().toISOString().split('T')[0];

  const availability = db.prepare('SELECT * FROM practitioner_availability WHERE practitioner_id = ?').all(practitioner_id);
  const hasAvailability = availability.length > 0;
  const availDaySet = hasAvailability ? new Set(availability.map((a) => a.day_of_week)) : null;

  function totalSlotsForDay(dow) {
    if (!hasAvailability) return 20;
    return generateSlotsFromWindows(availability.filter((a) => a.day_of_week === dow)).length;
  }

  const bookedRows = db.prepare(`
    SELECT appointment_date, COUNT(*) as booked_count
    FROM appointments
    WHERE practitioner_id = ? AND appointment_date BETWEEN ? AND ? AND status = 'scheduled'
    GROUP BY appointment_date
  `).all(practitioner_id, firstDay, lastDay);

  const bookedMap = {};
  bookedRows.forEach((r) => { bookedMap[r.appointment_date] = r.booked_count; });

  const available = [];
  for (let d = 1; d <= lastDayNum; d++) {
    const dateStr = `${y}-${paddedMonth}-${String(d).padStart(2, '0')}`;
    if (dateStr <= today) continue;
    const dow = jsWeekdayToMon0(new Date(dateStr + 'T12:00:00').getDay());
    if (hasAvailability && !availDaySet.has(dow)) continue;
    const total = totalSlotsForDay(dow);
    if (total > 0 && (bookedMap[dateStr] || 0) < total) available.push(dateStr);
  }

  res.json(available);
});

// ── Meine Termine (Patienten-Selbstauskunft) ─────────────

router.get('/my-appointments', (req, res) => {
  const { email, practice_id } = req.query;
  if (!email || !practice_id) {
    return res.status(400).json({ error: t('err_email_practice_required', getLang(req)) });
  }

  const practice = db.prepare('SELECT id FROM practices WHERE id = ?').get(practice_id);
  if (!practice) return res.status(404).json({ error: t('err_practice_not_found', getLang(req)) });

  const appointments = db.prepare(`
    SELECT a.id, a.appointment_date, a.appointment_time, a.duration_minutes,
           a.appointment_type, a.status, a.cancel_token,
           pr.first_name as practitioner_first_name, pr.last_name as practitioner_last_name,
           pr.title as practitioner_title
    FROM appointments a
    LEFT JOIN practitioners pr ON a.practitioner_id = pr.id
    WHERE a.practice_id = ? AND LOWER(a.patient_email) = LOWER(?)
      AND a.patient_email != 'anonymized'
    ORDER BY a.appointment_date DESC, a.appointment_time DESC
  `).all(practice_id, email.trim());

  res.json(appointments);
});

// ── ICS-Kalender-Datei ────────────────────────────────────

router.get('/ics/:token', (req, res) => {
  const appointment = db.prepare(`
    SELECT a.*, p.name as practice_name, p.address, p.zip, p.city
    FROM appointments a
    JOIN practices p ON a.practice_id = p.id
    WHERE a.cancel_token = ? AND a.status != 'cancelled'
  `).get(req.params.token);

  if (!appointment) return res.status(404).send('Termin nicht gefunden');

  const [yr, mo, dy] = appointment.appointment_date.split('-');
  const [hr, mn] = appointment.appointment_time.split(':');
  const dur = appointment.duration_minutes || 30;
  const totalMin = parseInt(hr) * 60 + parseInt(mn) + dur;
  const endHr = String(Math.floor(totalMin / 60)).padStart(2, '0');
  const endMn = String(totalMin % 60).padStart(2, '0');
  const dtStamp = new Date().toISOString().replace(/[-:.]/g, '').slice(0, 15) + 'Z';
  const location = [appointment.address, appointment.zip, appointment.city].filter(Boolean).join(', ');

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//PraxisOnline24//DE',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${appointment.id}@praxisonline24`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART:${yr}${mo}${dy}T${hr}${mn}00`,
    `DTEND:${yr}${mo}${dy}T${endHr}${endMn}00`,
    `SUMMARY:Termin – ${appointment.practice_name}`,
  ];
  if (location) lines.push(`LOCATION:${location}`);
  lines.push('END:VEVENT', 'END:VCALENDAR');

  res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="termin.ics"');
  res.send(lines.join('\r\n'));
});

// ── Alias: /practice/:id ──────────────────────────────────

router.get('/practice/:id', (req, res) => {
  const practice = db.prepare(
    'SELECT id, name, address, zip, city, phone, email, website, description, opening_hours FROM practices WHERE id = ?'
  ).get(req.params.id);
  if (!practice) return res.status(404).json({ error: t('err_practice_not_found', getLang(req)) });
  res.json(practice);
});

module.exports = router;
