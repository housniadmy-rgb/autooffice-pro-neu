const cron = require('node-cron');
const moment = require('moment');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const {
  sendAppointmentReminder,
  sendWaitlistOffer,
  sendReviewRequest,
  sendTrialReminder,
} = require('./email');

function startCronJobs(db) {
  // Terminerinnerungen täglich 08:00
  cron.schedule('0 8 * * *', () => sendReminderEmails(db));

  // Terminarchivierung täglich 01:00
  cron.schedule('0 1 * * *', () => archiveOldAppointments(db));

  // SQLite-Backup täglich 02:00
  cron.schedule('0 2 * * *', () => runBackup(db));

  // Wartelisten-Angebote alle 15 Minuten
  cron.schedule('*/15 * * * *', () => checkExpiredOffers(db));

  // Bewertungsmails stündlich
  cron.schedule('0 * * * *', () => sendPendingReviewMails(db));

  // Testphasen-Prüfung stündlich
  cron.schedule('0 * * * *', () => checkTrialReminders(db));

  // Abgelaufene Konten pausieren stündlich
  cron.schedule('0 * * * *', () => pauseExpiredAccounts(db));

  // Datenbereinigung täglich 03:00
  cron.schedule('0 3 * * *', () => runDataCleanup(db));

  console.log('[CRON] Alle Automatisierungen gestartet.');
}

// ── Terminerinnerungen ────────────────────────────────────

function sendReminderEmails(db) {
  const tomorrow = moment().add(1, 'days').format('YYYY-MM-DD');
  const appointments = db.prepare(`
    SELECT a.*, p.id as practice_id_col, p.name as practice_name, p.address, p.zip, p.city, p.phone, p.email as practice_email
    FROM appointments a
    JOIN practices p ON a.practice_id = p.id
    WHERE a.appointment_date = ? AND a.status = 'scheduled'
  `).all(tomorrow);

  appointments.forEach(async (appt) => {
    try {
      await sendAppointmentReminder(appt, {
        name: appt.practice_name,
        address: appt.address,
        zip: appt.zip,
        city: appt.city,
        phone: appt.phone,
        email: appt.practice_email,
      });
    } catch (err) {
      console.error(`[CRON] Erinnerungsmail fehlgeschlagen für Termin ${appt.id}:`, err.message);
    }
  });
}

// ── Wartelisten-Angebote (abgelaufen → nächsten benachrichtigen) ──

function checkExpiredOffers(db) {
  const now = moment().format('YYYY-MM-DD HH:mm:ss');

  const expired = db.prepare(`
    SELECT wo.*, w.practice_id, w.patient_first_name, w.patient_last_name, w.patient_email, w.language as patient_language
    FROM waitlist_offers wo
    JOIN waitlist w ON wo.waitlist_id = w.id
    WHERE wo.status = 'pending' AND wo.expires_at < ?
  `).all(now);

  expired.forEach(offer => {
    try {
      db.prepare("UPDATE waitlist_offers SET status = 'expired' WHERE id = ?").run(offer.id);
      db.prepare("UPDATE waitlist SET status = 'waiting' WHERE id = ?").run(offer.waitlist_id);
      notifyNextWaitlistEntry(db, offer.practice_id, offer.appointment_id);
    } catch (err) {
      console.error(`[CRON] Wartelisten-Folgebenachrichtigung fehlgeschlagen:`, err.message);
    }
  });
}

function notifyNextWaitlistEntry(db, practiceId, appointmentId) {
  const next = db.prepare(`
    SELECT * FROM waitlist
    WHERE practice_id = ? AND status = 'waiting'
    ORDER BY created_at ASC
    LIMIT 1
  `).get(practiceId);

  if (!next) return;

  const appointment = db.prepare('SELECT * FROM appointments WHERE id = ?').get(appointmentId);
  if (!appointment) return;

  const practice = db.prepare('SELECT * FROM practices WHERE id = ?').get(practiceId);
  if (!practice) return;

  const token = uuidv4();
  const expiresAt = moment().add(4, 'hours').format('YYYY-MM-DD HH:mm:ss');

  db.prepare(`
    INSERT INTO waitlist_offers (id, waitlist_id, appointment_id, token, expires_at, status)
    VALUES (?, ?, ?, ?, ?, 'pending')
  `).run(uuidv4(), next.id, appointmentId, token, expiresAt);

  db.prepare("UPDATE waitlist SET status = 'offered' WHERE id = ?").run(next.id);

  db.prepare(`INSERT INTO automation_log (id, type, details, ran_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)`)
    .run(uuidv4(), 'waitlist_offer', `Angebot gesendet an ${next.patient_email} für Termin ${appointmentId}`);

  sendWaitlistOffer(next, appointment, practice, token).catch(err => {
    console.error('[CRON] Wartelisten-E-Mail fehlgeschlagen:', err.message);
  });
}

// Öffentlich exportiert für den Appointments-Route
function triggerWaitlistForCancelledAppointment(db, appointmentId, practiceId) {
  notifyNextWaitlistEntry(db, practiceId, appointmentId);
}

// ── Bewertungsmails ───────────────────────────────────────

function sendPendingReviewMails(db) {
  const appointments = db.prepare(`
    SELECT a.*, p.id as pid, p.name as practice_name, p.language as practice_language
    FROM appointments a
    JOIN practices p ON a.practice_id = p.id
    WHERE a.status = 'completed'
      AND a.review_mail_sent = 0
      AND datetime(a.appointment_date || ' ' || a.appointment_time) < datetime('now', '-24 hours')
  `).all();

  appointments.forEach(async (appt) => {
    try {
      const practice = { id: appt.practice_id, name: appt.practice_name, language: appt.practice_language };
      await sendReviewRequest(appt, practice);
      db.prepare('UPDATE appointments SET review_mail_sent = 1 WHERE id = ?').run(appt.id);
      db.prepare(`INSERT INTO automation_log (id, type, details, ran_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)`)
        .run(uuidv4(), 'review_mail', `Bewertungsmail gesendet für Termin ${appt.id}`);
    } catch (err) {
      console.error(`[CRON] Bewertungsmail fehlgeschlagen für Termin ${appt.id}:`, err.message);
    }
  });
}

// ── Testphasen-Erinnerungen ───────────────────────────────

function checkTrialReminders(db) {
  const today = moment().format('YYYY-MM-DD');
  const in5Days = moment().add(5, 'days').format('YYYY-MM-DD');
  const in1Day = moment().add(1, 'days').format('YYYY-MM-DD');

  const practices = db.prepare('SELECT * FROM practices WHERE trial_end_date IS NOT NULL').all();

  practices.forEach(async (practice) => {
    try {
      if (practice.trial_end_date === in5Days) {
        const key = `trial_5d:${practice.id}:${today}`;
        if (!logEntryExists(db, key)) {
          await sendTrialReminder(practice, 5);
          db.prepare(`INSERT INTO automation_log (id, type, details, ran_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)`)
            .run(uuidv4(), 'trial_reminder', key);
        }
      } else if (practice.trial_end_date === in1Day) {
        const key = `trial_1d:${practice.id}:${today}`;
        if (!logEntryExists(db, key)) {
          await sendTrialReminder(practice, 1);
          db.prepare(`INSERT INTO automation_log (id, type, details, ran_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)`)
            .run(uuidv4(), 'trial_reminder', key);
        }
      } else if (practice.trial_end_date < today) {
        const key = `trial_expired:${practice.id}`;
        if (!logEntryExists(db, key)) {
          await sendTrialReminder(practice, 0);
          db.prepare(`INSERT INTO automation_log (id, type, details, ran_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)`)
            .run(uuidv4(), 'trial_reminder', key);
        }
      }
    } catch (err) {
      console.error(`[CRON] Testphasen-Erinnerung fehlgeschlagen für ${practice.id}:`, err.message);
    }
  });
}

function logEntryExists(db, details) {
  const row = db.prepare(`SELECT id FROM automation_log WHERE type = 'trial_reminder' AND details = ?`).get(details);
  return !!row;
}

// ── Terminarchivierung ────────────────────────────────────

function archiveOldAppointments(db) {
  try {
    const practices = db.prepare('SELECT id FROM practices').all();
    let totalArchived = 0;

    practices.forEach(practice => {
      const setting = db.prepare(
        "SELECT value FROM settings WHERE practice_id = ? AND key = 'archive_months'"
      ).get(practice.id);

      const archiveMonths = (setting && setting.value) ? setting.value : '12';
      if (archiveMonths === 'never') return;

      const months = parseInt(archiveMonths, 10);
      if (isNaN(months) || months <= 0) return;

      const cutoff = moment().subtract(months, 'months').format('YYYY-MM-DD');

      const toArchive = db.prepare(`
        SELECT COUNT(*) as count FROM appointments
        WHERE practice_id = ?
          AND status IN ('completed', 'cancelled')
          AND appointment_date < ?
      `).get(practice.id, cutoff);

      if (toArchive.count > 0) {
        db.prepare(`
          UPDATE appointments
          SET status = 'archived'
          WHERE practice_id = ?
            AND status IN ('completed', 'cancelled')
            AND appointment_date < ?
        `).run(practice.id, cutoff);
        totalArchived += toArchive.count;
      }
    });

    if (totalArchived > 0) {
      db.prepare(`INSERT INTO automation_log (id, type, details, ran_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)`)
        .run(uuidv4(), 'archive', `${totalArchived} Termin(e) archiviert`);
      console.log(`[CRON] Archivierung: ${totalArchived} Termin(e) archiviert`);
    }
  } catch (err) {
    console.error('[CRON] Archivierung fehlgeschlagen:', err.message);
  }
}

// ── Datenbereinigung ──────────────────────────────────────

function runDataCleanup(db) {
  const cutoff = moment().subtract(30, 'days').format('YYYY-MM-DD');
  const offerCutoff = moment().subtract(1, 'days').format('YYYY-MM-DD HH:mm:ss');
  const waitlistCutoff = moment().subtract(90, 'days').format('YYYY-MM-DD HH:mm:ss');

  try {
    // Termindaten anonymisieren (Personendaten entfernen)
    db.prepare(`
      UPDATE appointments
      SET patient_first_name = 'Anonymisiert',
          patient_last_name = '',
          patient_email = 'anonymized',
          patient_phone = NULL
      WHERE appointment_date < ?
        AND patient_email != 'anonymized'
    `).run(cutoff);

    // Abgelaufene Angebots-Tokens löschen
    db.prepare(`
      DELETE FROM waitlist_offers
      WHERE expires_at < ? AND status != 'accepted'
    `).run(offerCutoff);

    // Abgeschlossene/abgesagte alte Wartelisten-Einträge löschen
    db.prepare(`
      DELETE FROM waitlist
      WHERE created_at < ? AND status IN ('booked', 'cancelled')
    `).run(waitlistCutoff);

    // Cleanup-Log-Einträge älter als 90 Tage löschen
    db.prepare(`
      DELETE FROM automation_log
      WHERE type = 'cleanup' AND ran_at < datetime('now', '-90 days')
    `).run();

    db.prepare(`INSERT INTO automation_log (id, type, details, ran_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)`)
      .run(uuidv4(), 'cleanup', `Anonymisiert: Termine vor ${cutoff}; Tokens gelöscht; Warteliste bereinigt`);

    console.log(`[CRON] Datenbereinigung abgeschlossen (Stichtag: ${cutoff})`);
  } catch (err) {
    console.error('[CRON] Datenbereinigung fehlgeschlagen:', err.message);
  }
}

// ── Abgelaufene Konten pausieren ──────────────────────────

function pauseExpiredAccounts(db) {
  // Praxen pausieren, deren Testphase vor mehr als 7 Tagen abgelaufen ist
  const cutoff = moment().subtract(7, 'days').format('YYYY-MM-DD');

  const expired = db.prepare(`
    SELECT * FROM practices
    WHERE trial_end_date IS NOT NULL
      AND trial_end_date < ?
      AND account_status = 'active'
  `).all(cutoff);

  expired.forEach(practice => {
    try {
      db.prepare("UPDATE practices SET account_status = 'paused' WHERE id = ?").run(practice.id);
      db.prepare(`INSERT INTO automation_log (id, type, details, ran_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)`)
        .run(uuidv4(), 'account_paused', `Praxis ${practice.id} (${practice.name}) pausiert – Testphase abgelaufen seit ${practice.trial_end_date}`);
      console.log(`[CRON] Praxis "${practice.name}" pausiert (Testphase abgelaufen seit ${practice.trial_end_date})`);
    } catch (err) {
      console.error(`[CRON] Konto-Pausierung fehlgeschlagen für ${practice.id}:`, err.message);
    }
  });
}

// ── SQLite-Backup ─────────────────────────────────────────

function runBackup(db) {
  const DB_PATH = path.join(__dirname, '..', 'data', 'praxisonline24.db');
  const BACKUP_DIR = path.join(__dirname, '..', 'data', 'backups');
  const KEEP_BACKUPS = 7;

  if (!fs.existsSync(DB_PATH)) {
    console.log('[BACKUP] Keine Datenbankdatei gefunden – Backup übersprungen.');
    return;
  }

  try {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
    const stamp = moment().format('YYYY-MM-DD_HH-mm');
    const dest = path.join(BACKUP_DIR, `backup-${stamp}.db`);
    fs.copyFileSync(DB_PATH, dest);

    // Keep only the N most recent backups
    const files = fs.readdirSync(BACKUP_DIR)
      .filter((f) => f.startsWith('backup-') && f.endsWith('.db'))
      .sort()
      .reverse();

    files.slice(KEEP_BACKUPS).forEach((f) => {
      try { fs.unlinkSync(path.join(BACKUP_DIR, f)); } catch {}
    });

    try {
      db.prepare("INSERT INTO automation_log (id, type, details, ran_at) VALUES (?, 'backup', ?, CURRENT_TIMESTAMP)").run(uuidv4(), dest);
    } catch {}

    console.log(`[BACKUP] Backup erstellt: ${dest}`);
  } catch (err) {
    console.error('[BACKUP] Fehler beim Backup:', err.message);
  }
}

module.exports = { startCronJobs, triggerWaitlistForCancelledAppointment, runBackup, archiveOldAppointments };
