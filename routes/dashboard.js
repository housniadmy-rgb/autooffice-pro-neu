const express = require('express');
const moment = require('moment');
const { requireAuth } = require('../middleware/auth');
const { getDb } = require('../database');
const db = new Proxy({}, { get: (_, p) => (...args) => getDb()[p](...args) });

const router = express.Router();

router.get('/', requireAuth, (req, res) => {
  const practiceId = req.session.practiceId;
  const today = moment().format('YYYY-MM-DD');
  const monthStart = moment().startOf('month').format('YYYY-MM-DD');
  const monthEnd = moment().endOf('month').format('YYYY-MM-DD');

  const practice = db.prepare(
    'SELECT name, package, language, trial_end_date FROM practices WHERE id = ?'
  ).get(practiceId);

  const todayCount = db.prepare(`
    SELECT COUNT(*) as count FROM appointments
    WHERE practice_id = ? AND appointment_date = ? AND status != 'cancelled'
  `).get(practiceId, today);

  const monthlyCount = db.prepare(`
    SELECT COUNT(*) as count FROM appointments
    WHERE practice_id = ? AND appointment_date BETWEEN ? AND ? AND status != 'cancelled'
  `).get(practiceId, monthStart, monthEnd);

  const todayRevenue = db.prepare(`
    SELECT COALESCE(SUM(p.amount), 0) as total
    FROM payments p
    JOIN invoices i ON p.invoice_id = i.id
    WHERE i.practice_id = ? AND p.payment_date = ? AND p.status = 'completed'
  `).get(practiceId, today);

  const openComplaints = db.prepare(`
    SELECT COUNT(*) as count FROM waitlist
    WHERE practice_id = ? AND status = 'waiting'
  `).get(practiceId);

  const practitionerCount = db.prepare(`
    SELECT COUNT(*) as count FROM practitioners
    WHERE practice_id = ? AND active = 1
  `).get(practiceId);

  const pendingReviewCount = db.prepare(`
    SELECT COUNT(*) as count FROM reviews
    WHERE practice_id = ? AND visible = 0
  `).get(practiceId);

  const unpaidInvoiceCount = db.prepare(`
    SELECT COUNT(*) as count FROM invoices
    WHERE practice_id = ? AND status != 'paid'
  `).get(practiceId);

  const waitlistWaiting = db.prepare(`
    SELECT COUNT(*) as count FROM waitlist WHERE practice_id = ? AND status = 'waiting'
  `).get(practiceId);

  const pendingReviewMails = db.prepare(`
    SELECT COUNT(*) as count FROM appointments
    WHERE practice_id = ? AND status = 'completed' AND review_mail_sent = 0
      AND datetime(appointment_date || ' ' || appointment_time) < datetime('now', '-24 hours')
  `).get(practiceId);

  const today7days = moment().add(7, 'days').format('YYYY-MM-DD');
  const trialsExpiringSoon = db.prepare(`
    SELECT COUNT(*) as count FROM practices
    WHERE trial_end_date BETWEEN ? AND ?
  `).get(today, today7days);

  const lastCleanup = db.prepare(`
    SELECT ran_at FROM automation_log WHERE type = 'cleanup' ORDER BY ran_at DESC LIMIT 1
  `).get();

  const todayAppointments = db.prepare(`
    SELECT a.*, pr.first_name as practitioner_first_name, pr.last_name as practitioner_last_name, pr.title as practitioner_title
    FROM appointments a
    LEFT JOIN practitioners pr ON a.practitioner_id = pr.id
    WHERE a.practice_id = ? AND a.appointment_date = ?
    ORDER BY a.appointment_time ASC
  `).all(practiceId, today);

  const pkg = (practice && practice.package) ? practice.package : 'BASIC';

  res.json({
    today,
    practice: {
      name: practice ? practice.name : '',
      package: pkg,
      language: practice ? practice.language : 'de',
      trial_end_date: practice ? practice.trial_end_date : null,
    },
    stats: {
      today_appointments: todayCount.count,
      monthly_appointments: monthlyCount.count,
      today_revenue: todayRevenue ? todayRevenue.total : 0,
      open_complaints: openComplaints.count,
      practitioner_count: practitionerCount.count,
      pending_reviews: pendingReviewCount.count,
      unpaid_invoices: unpaidInvoiceCount.count,
    },
    limits: pkg === 'UNLIMITED'
      ? { monthly_appointments: null, practitioners: null }
      : { monthly_appointments: 200, practitioners: 3 },
    automation: {
      waitlist_waiting: waitlistWaiting.count,
      pending_review_mails: pendingReviewMails.count,
      trials_expiring_soon: trialsExpiringSoon.count,
      last_cleanup: lastCleanup ? lastCleanup.ran_at : null,
    },
    today_appointments: todayAppointments,
  });
});

module.exports = router;
