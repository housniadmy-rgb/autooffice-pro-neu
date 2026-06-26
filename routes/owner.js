const express = require('express');
const moment = require('moment');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');
const { getDb } = require('../database');

const PKG_PRICE = { BASIC: 19, PROFESSIONAL: 39, PRO: 39, UNLIMITED: 79 };

const router = express.Router();

// ── Owner Bootstrap (setzt Owner-Passwort ohne Session) ───────────────────────
// Nur aktiv wenn OWNER_SETUP_TOKEN in Env gesetzt ist.
// Nach Verwendung: OWNER_SETUP_TOKEN aus Render-Env entfernen.
router.post('/bootstrap', async (req, res) => {
  const setupToken = process.env.OWNER_SETUP_TOKEN;
  if (!setupToken) return res.status(403).json({ error: 'Not available' });

  const { token, new_password } = req.body;
  if (token !== setupToken)           return res.status(403).json({ error: 'Invalid token' });
  if (!new_password || new_password.length < 8)
    return res.status(400).json({ error: 'Passwort mind. 8 Zeichen' });

  const ownerEmail = process.env.OWNER_EMAIL;
  if (!ownerEmail) return res.status(503).json({ error: 'OWNER_EMAIL not configured' });

  const db = getDb();
  const user = db.prepare('SELECT id FROM users WHERE LOWER(email) = LOWER(?)').get(ownerEmail);
  if (!user) return res.status(404).json({ error: 'Owner-Account nicht in Datenbank gefunden' });

  const hash = await bcrypt.hash(new_password, 12);
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hash, user.id);

  res.json({ success: true, email: ownerEmail, message: 'Passwort gesetzt. OWNER_SETUP_TOKEN jetzt aus Render-Env entfernen.' });
});

function requireOwner(req, res, next) {
  const ownerEmail = process.env.OWNER_EMAIL;
  if (!ownerEmail) {
    return res.status(503).json({ error: 'OWNER_EMAIL nicht in .env konfiguriert' });
  }
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: 'Nicht angemeldet' });
  }
  if ((req.session.userEmail || '').toLowerCase() !== ownerEmail.toLowerCase()) {
    return res.status(403).json({ error: 'Kein Zugriff – nur Plattform-Owner' });
  }
  next();
}

// Quick check – tells frontend if current user is owner
router.get('/check', (req, res) => {
  const ownerEmail = process.env.OWNER_EMAIL;
  if (!req.session || !req.session.userId) return res.json({ isOwner: false });
  const isOwner = !!ownerEmail &&
    (req.session.userEmail || '').toLowerCase() === ownerEmail.toLowerCase();
  res.json({ isOwner });
});

// ── CEO Tab ────────────────────────────────────────────────────────────────────
router.get('/tab/ceo', requireOwner, (req, res) => {
  const db = getDb();
  const now = moment();
  const today = now.format('YYYY-MM-DD');
  const weekStart = now.clone().startOf('isoWeek').format('YYYY-MM-DD');
  const monthStart = now.clone().startOf('month').format('YYYY-MM-DD');
  const in7days = now.clone().add(7, 'days').format('YYYY-MM-DD');

  const totalPractices   = db.prepare('SELECT COUNT(*) as n FROM practices').get().n;
  const activePractices  = db.prepare("SELECT COUNT(*) as n FROM practices WHERE account_status = 'active' OR account_status IS NULL").get().n;
  const pausedPractices  = db.prepare("SELECT COUNT(*) as n FROM practices WHERE account_status = 'paused'").get().n;
  const trialPractices   = db.prepare('SELECT COUNT(*) as n FROM practices WHERE trial_end_date >= ?').get(today).n;
  const newToday         = db.prepare('SELECT COUNT(*) as n FROM practices WHERE DATE(created_at) = ?').get(today).n;
  const newThisWeek      = db.prepare('SELECT COUNT(*) as n FROM practices WHERE DATE(created_at) >= ?').get(weekStart).n;
  const newThisMonth     = db.prepare('SELECT COUNT(*) as n FROM practices WHERE DATE(created_at) >= ?').get(monthStart).n;
  const trialsExpiring7d = db.prepare('SELECT COUNT(*) as n FROM practices WHERE trial_end_date BETWEEN ? AND ?').get(today, in7days).n;
  const trialsExpired    = db.prepare("SELECT COUNT(*) as n FROM practices WHERE trial_end_date < ? AND (account_status IS NULL OR account_status = 'active')").get(today).n;

  const growth = db.prepare(`
    SELECT strftime('%Y-%m', created_at) as month, COUNT(*) as count
    FROM practices WHERE created_at >= datetime('now', '-12 months')
    GROUP BY month ORDER BY month
  `).all();

  const risks = [];
  const todos = [];

  if (trialsExpired > 0)
    risks.push({ level: 'danger', msg: `${trialsExpired} Praxis/en: Testphase abgelaufen – kein Upgrade` });
  if (trialsExpiring7d > 0)
    risks.push({ level: 'warn', msg: `${trialsExpiring7d} Praxis/en: Testphase endet in 7 Tagen` });
  if (pausedPractices > 0)
    risks.push({ level: 'warn', msg: `${pausedPractices} Konto/en pausiert` });
  if (newThisMonth === 0)
    risks.push({ level: 'info', msg: 'Keine Neuregistrierungen diesen Monat' });

  if (trialsExpiring7d > 0)
    todos.push(`Kontakt mit ${trialsExpiring7d} Praxis/en vor Trial-Ende`);
  if (pausedPractices > 0)
    todos.push(`Follow-up bei ${pausedPractices} pausierten Konten`);
  if (trialsExpired > 0)
    todos.push(`Upgrade-Angebot an ${trialsExpired} Praxis/en senden`);
  todos.push('Monatsbericht prüfen und Wachstumsstrategie anpassen');

  let ampel = 'green';
  if (risks.some(r => r.level === 'warn'))   ampel = 'yellow';
  if (risks.some(r => r.level === 'danger')) ampel = 'red';

  // Demo-Anfragen – CEO Übersicht
  const demoTotal      = db.prepare('SELECT COUNT(*) as n FROM demo_requests').get().n;
  const demoThisWeek   = db.prepare('SELECT COUNT(*) as n FROM demo_requests WHERE DATE(created_at) >= ?').get(weekStart).n;
  const demoThisMonth  = db.prepare('SELECT COUNT(*) as n FROM demo_requests WHERE DATE(created_at) >= ?').get(monthStart).n;
  const demoCountries  = db.prepare('SELECT country, COUNT(*) as count FROM demo_requests GROUP BY country ORDER BY count DESC LIMIT 5').all();
  const demoConversion = demoTotal > 0 ? Math.round((totalPractices / demoTotal) * 100) : 0;

  // AI Praxismanager – Platform Level
  const aptsToday       = db.prepare("SELECT COUNT(*) as n FROM appointments WHERE appointment_date = ? AND status NOT IN ('cancelled','archived')").get(today).n;
  const openInvoices    = db.prepare("SELECT COUNT(*) as n FROM invoices WHERE status != 'paid'").get().n;
  const waitlistTotal   = db.prepare("SELECT COUNT(*) as n FROM waitlist WHERE status = 'waiting'").get().n;
  const pendingReviews  = db.prepare("SELECT COUNT(*) as n FROM reviews WHERE visible = 0").get().n;
  const automationsToday = db.prepare("SELECT COUNT(*) as n FROM automation_log WHERE DATE(ran_at) = ?").get(today).n;

  const aiTasks = [];
  if (trialsExpired > 0)    aiTasks.push({ priority: 'high',   text: `${trialsExpired} abgelaufene Trial(s) – Upgrade-Angebot senden` });
  if (trialsExpiring7d > 0) aiTasks.push({ priority: 'high',   text: `${trialsExpiring7d} Trial(s) laufen in 7 Tagen ab – jetzt kontaktieren` });
  if (openInvoices > 0)     aiTasks.push({ priority: 'medium', text: `${openInvoices} offene Rechnungen plattformweit` });
  if (pausedPractices > 0)  aiTasks.push({ priority: 'medium', text: `${pausedPractices} pausierte Konten – Reaktivierung prüfen` });
  if (pendingReviews > 0)   aiTasks.push({ priority: 'low',    text: `${pendingReviews} Bewertungen warten auf Freigabe` });
  if (aiTasks.length === 0) aiTasks.push({ priority: 'none',   text: 'Keine offenen Aufgaben – Plattform läuft stabil' });

  const aiRecommendations = [
    totalPractices < 10 ? 'Onboarding-Kampagne starten: Zielgruppe Arztpraxen DE/AT/CH' : null,
    newThisMonth < 3    ? 'Marketing-Aktivierung: Unter 3 Neuanmeldungen diesen Monat' : null,
    'A/B-Test Landingpage: Video-Hero vs. Screenshot-Hero',
    'Retargeting-Kampagne für abgebrochene Registrierungen einrichten',
  ].filter(Boolean);

  res.json({
    generated_at: now.toISOString(),
    overview: { totalPractices, activePractices, pausedPractices, trialPractices, newToday, newThisWeek, newThisMonth, trialsExpiring7d, trialsExpired },
    growth,
    risks,
    todos,
    ampel,
    demo: { total: demoTotal, this_week: demoThisWeek, this_month: demoThisMonth, countries: demoCountries, conversion: demoConversion },
    ai: {
      tasks: aiTasks,
      recommendations: aiRecommendations,
      automations: { today: automationsToday },
      daily_summary: { aptsToday, openInvoices, waitlistTotal, pendingReviews, automationsToday },
    },
  });
});

// ── CFO Tab ────────────────────────────────────────────────────────────────────
router.get('/tab/cfo', requireOwner, (req, res) => {
  const db = getDb();
  const now = moment();
  const today = now.format('YYYY-MM-DD');

  // Invoices
  const paidInv    = db.prepare("SELECT COUNT(*) as count, COALESCE(SUM(total_amount),0) as amount FROM invoices WHERE status='paid'").get();
  const unpaidInv  = db.prepare("SELECT COUNT(*) as count, COALESCE(SUM(total_amount),0) as amount FROM invoices WHERE status IN ('draft','sent')").get();
  const overdueInv = db.prepare("SELECT COUNT(*) as count, COALESCE(SUM(total_amount),0) as amount FROM invoices WHERE status != 'paid' AND due_date < ?").get(today);
  const totalRevenue = db.prepare("SELECT COALESCE(SUM(amount),0) as total FROM payments WHERE status='completed'").get().total;

  const monthlyRevenue = db.prepare(`
    SELECT strftime('%Y-%m', payment_date) as month, COALESCE(SUM(amount),0) as revenue
    FROM payments WHERE status='completed' AND payment_date >= date('now','-12 months')
    GROUP BY month ORDER BY month
  `).all();

  // Practices by package (all)
  const packagesRows = db.prepare('SELECT package, COUNT(*) as count FROM practices GROUP BY package').all();
  const packages = {};
  packagesRows.forEach(r => { packages[r.package || 'BASIC'] = r.count; });

  // Trial vs. paying
  const trialPractices  = db.prepare("SELECT COUNT(*) as n FROM practices WHERE trial_end_date >= ? AND (account_status = 'active' OR account_status IS NULL)").get(today).n;
  const payingRows      = db.prepare("SELECT package, COUNT(*) as count FROM practices WHERE (trial_end_date IS NULL OR trial_end_date < ?) AND account_status = 'active' GROUP BY package").all(today);
  const payingCount     = payingRows.reduce((s, r) => s + r.count, 0);

  // MRR / ARR
  let mrr = 0;
  const mrrByPackage = {};
  payingRows.forEach(r => {
    const price = PKG_PRICE[r.package] || PKG_PRICE.BASIC;
    const rev   = price * r.count;
    mrr += rev;
    mrrByPackage[r.package || 'BASIC'] = { count: r.count, price, revenue: rev };
  });
  const arr = mrr * 12;

  res.json({
    generated_at:  now.toISOString(),
    total_revenue: totalRevenue,
    paid:          paidInv,
    unpaid:        unpaidInv,
    overdue:       overdueInv,
    monthly_revenue: monthlyRevenue,
    packages,
    trial_practices:  trialPractices,
    paying_practices: payingCount,
    mrr,
    arr,
    mrr_by_package: mrrByPackage,
  });
});

// ── Marketing Tab ──────────────────────────────────────────────────────────────
router.get('/tab/marketing', requireOwner, (req, res) => {
  const db = getDb();
  const now = moment();
  const weekStart  = now.clone().startOf('isoWeek').format('YYYY-MM-DD');
  const monthStart = now.clone().startOf('month').format('YYYY-MM-DD');

  const totalPractices  = db.prepare('SELECT COUNT(*) as n FROM practices').get().n;
  const activePractices = db.prepare("SELECT COUNT(*) as n FROM practices WHERE account_status = 'active' OR account_status IS NULL").get().n;
  const newThisWeek     = db.prepare('SELECT COUNT(*) as n FROM practices WHERE DATE(created_at) >= ?').get(weekStart).n;
  const newThisMonth    = db.prepare('SELECT COUNT(*) as n FROM practices WHERE DATE(created_at) >= ?').get(monthStart).n;
  const langRows        = db.prepare('SELECT language, COUNT(*) as count FROM practices GROUP BY language ORDER BY count DESC').all();
  const activeRate      = totalPractices > 0 ? Math.round((activePractices / totalPractices) * 100) : 0;

  const registrationsByMonth = db.prepare(`
    SELECT strftime('%Y-%m', created_at) as month, COUNT(*) as count
    FROM practices WHERE created_at >= datetime('now', '-6 months')
    GROUP BY month ORDER BY month
  `).all();

  const registrationsByWeek = db.prepare(`
    SELECT strftime('%Y-W%W', created_at) as week, COUNT(*) as count
    FROM practices WHERE created_at >= datetime('now', '-8 weeks')
    GROUP BY week ORDER BY week
  `).all();

  // Demo-Anfragen
  const demoTotal     = db.prepare('SELECT COUNT(*) as n FROM demo_requests').get().n;
  const demoThisWeek  = db.prepare('SELECT COUNT(*) as n FROM demo_requests WHERE DATE(created_at) >= ?').get(weekStart).n;
  const demoThisMonth = db.prepare('SELECT COUNT(*) as n FROM demo_requests WHERE DATE(created_at) >= ?').get(monthStart).n;
  const demoCountries = db.prepare('SELECT country, COUNT(*) as count FROM demo_requests GROUP BY country ORDER BY count DESC LIMIT 10').all();
  const conversionRate = demoTotal > 0 ? Math.round((totalPractices / demoTotal) * 100) : 0;

  const demoByMonth = db.prepare(`
    SELECT strftime('%Y-%m', created_at) as month, COUNT(*) as count
    FROM demo_requests WHERE created_at >= datetime('now', '-6 months')
    GROUP BY month ORDER BY month
  `).all();

  const seoHints = [
    'Keywords "Praxisverwaltung online" und "Online Terminbuchung Arzt" in Blog-Artikeln ausbauen',
    'Google My Business Eintrag für PraxisOnline24 aktuell halten',
    'Bewertungs-Funktion als USP auf Landingpage prominent platzieren',
    'Mehrsprachige Landing Pages für EN, FR, ES, AR erstellen',
    'Structured Data (LocalBusiness, SoftwareApplication) auf Startseite einbinden',
  ];
  const socialIdeas = [
    'LinkedIn: "Wie Arztpraxen 2 Std./Woche durch Online-Buchung sparen" – Case Study Post',
    'Instagram: Vorher/Nachher – Papierkalender vs. digitale Buchung (Reel)',
    'YouTube-Short: 60-Sek. Setup-Demo – Praxis in 5 Minuten online',
    'Facebook: Umfrage "Was nervt Patienten am Telefon-Termin am meisten?"',
    'TikTok: Tag-im-Leben einer Praxis mit PraxisOnline24 (humorvoller Short)',
  ];

  res.json({
    generated_at: now.toISOString(),
    total_practices:        totalPractices,
    active_rate:            activeRate,
    new_this_week:          newThisWeek,
    new_this_month:         newThisMonth,
    languages:              langRows,
    registrations_by_month: registrationsByMonth,
    registrations_by_week:  registrationsByWeek,
    demo_total:             demoTotal,
    demo_this_week:         demoThisWeek,
    demo_this_month:        demoThisMonth,
    demo_countries:         demoCountries,
    demo_by_month:          demoByMonth,
    conversion_rate:        conversionRate,
    seo_hints:              seoHints,
    social_ideas:           socialIdeas,
  });
});

// ── CTO Tab ────────────────────────────────────────────────────────────────────
router.get('/tab/cto', requireOwner, (req, res) => {
  const db  = getDb();
  const now = moment();

  const dbStats = {
    total_practices:    db.prepare('SELECT COUNT(*) as n FROM practices').get().n,
    total_users:        db.prepare('SELECT COUNT(*) as n FROM users').get().n,
    total_appointments: db.prepare('SELECT COUNT(*) as n FROM appointments').get().n,
    total_invoices:     db.prepare('SELECT COUNT(*) as n FROM invoices').get().n,
    total_payments:     db.prepare('SELECT COUNT(*) as n FROM payments').get().n,
    total_reviews:      db.prepare('SELECT COUNT(*) as n FROM reviews').get().n,
    total_waitlist:     db.prepare('SELECT COUNT(*) as n FROM waitlist').get().n,
    total_demo_requests:db.prepare('SELECT COUNT(*) as n FROM demo_requests').get().n,
  };

  // DB-Dateigröße
  const dbFilePath = process.env.DB_PATH || path.join(__dirname, '../data/praxisonline24.db');
  let dbSize = '—';
  try { dbSize = (fs.statSync(dbFilePath).size / 1024).toFixed(1) + ' KB'; } catch {}

  // Backup-Status
  const backupDir = path.join(path.dirname(dbFilePath), 'backups');
  let backups = [];
  try {
    backups = fs.readdirSync(backupDir)
      .filter(f => f.endsWith('.db'))
      .sort().reverse().slice(0, 5);
  } catch {}

  // Server-Uptime
  const uptimeSec  = Math.floor(process.uptime());
  const uptimeH    = Math.floor(uptimeSec / 3600);
  const uptimeM    = Math.floor((uptimeSec % 3600) / 60);
  const uptime     = `${uptimeH}h ${uptimeM}m`;

  const recentActivity = db.prepare(`
    SELECT action, entity_type, created_at FROM activity_log ORDER BY created_at DESC LIMIT 15
  `).all();

  const automationLog = db.prepare(`
    SELECT type, details, ran_at FROM automation_log ORDER BY ran_at DESC LIMIT 10
  `).all();

  const lastAutomation = db.prepare('SELECT ran_at FROM automation_log ORDER BY ran_at DESC LIMIT 1').get();

  const securityStatus = {
    session_secret_configured: !!process.env.SESSION_SECRET &&
      process.env.SESSION_SECRET !== 'change_this_to_a_long_random_string' &&
      process.env.SESSION_SECRET !== 'praxisonline24-dev-secret-change-in-production',
    owner_email_configured:    !!process.env.OWNER_EMAIL,
    smtp_configured:           !!process.env.SMTP_HOST && process.env.SMTP_HOST !== 'smtp.example.com',
    setup_token_active:        !!process.env.OWNER_SETUP_TOKEN,
    node_env:                  process.env.NODE_ENV || 'development',
    email_dev_mode:            process.env.EMAIL_DEV_MODE === 'true',
  };

  const updateHints = [
    'sql.js regelmäßig auf neueste Version aktualisieren',
    'bcrypt: aktuelle Major-Version sicherstellen',
    'Rate-Limiting für /api/auth/* Endpunkte prüfen',
    'NODE_ENV=production in Produktion setzen',
    'SESSION_SECRET mit mindestens 32 Zeichen konfigurieren',
    'SMTP konfigurieren für echte Passwort-Reset-Mails',
  ];

  res.json({
    generated_at:    now.toISOString(),
    db_stats:        dbStats,
    db_size:         dbSize,
    uptime,
    backups,
    last_automation: lastAutomation ? lastAutomation.ran_at : null,
    recent_activity: recentActivity,
    automation_log:  automationLog,
    security_status: securityStatus,
    update_hints:    updateHints,
  });
});

// ── Demo-Anfragen Tab ──────────────────────────────────────────────────────────
router.get('/tab/demos', requireOwner, (req, res) => {
  const db = getDb();
  const now = moment();
  const monthStart = now.clone().startOf('month').format('YYYY-MM-DD');
  const weekStart  = now.clone().startOf('isoWeek').format('YYYY-MM-DD');

  const requests = db.prepare(
    'SELECT id, practice, contact, email, phone, country, language, message, status, invited_user_id, created_at FROM demo_requests ORDER BY created_at DESC LIMIT 200'
  ).all();

  // Für jede Anfrage mit invited_user_id prüfen ob der User noch pending ist
  const pendingUserIds = new Set(
    db.prepare("SELECT id FROM users WHERE active = 0").all().map(u => u.id)
  );
  const enriched = requests.map(r => ({
    ...r,
    invite_pending: !!(r.invited_user_id && pendingUserIds.has(r.invited_user_id)),
  }));

  const stats = {
    total:       db.prepare('SELECT COUNT(*) as n FROM demo_requests').get().n,
    neu:         db.prepare("SELECT COUNT(*) as n FROM demo_requests WHERE status = 'neu'").get().n,
    eingeladen:  db.prepare("SELECT COUNT(*) as n FROM demo_requests WHERE status = 'eingeladen'").get().n,
    aktiviert:   db.prepare("SELECT COUNT(*) as n FROM demo_requests WHERE status = 'aktiviert'").get().n,
    kontaktiert: db.prepare("SELECT COUNT(*) as n FROM demo_requests WHERE status = 'kontaktiert'").get().n,
    erledigt:    db.prepare("SELECT COUNT(*) as n FROM demo_requests WHERE status = 'erledigt'").get().n,
    this_week:   db.prepare('SELECT COUNT(*) as n FROM demo_requests WHERE DATE(created_at) >= ?').get(weekStart).n,
    this_month:  db.prepare('SELECT COUNT(*) as n FROM demo_requests WHERE DATE(created_at) >= ?').get(monthStart).n,
  };

  res.json({ generated_at: now.toISOString(), requests: enriched, stats });
});

// ── Demo-Status aktualisieren ──────────────────────────────────────────────────
router.patch('/demo-requests/:id', requireOwner, (req, res) => {
  const { status } = req.body;
  if (!['neu', 'eingeladen', 'aktiviert', 'kontaktiert', 'erledigt'].includes(status))
    return res.status(400).json({ error: 'Ungültiger Status' });
  const db = getDb();
  const result = db.prepare('UPDATE demo_requests SET status = ? WHERE id = ?').run(status, req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Nicht gefunden' });
  res.json({ ok: true });
});

// ── Einladung erneut senden ────────────────────────────────────────────────────
router.post('/demo-requests/:id/resend-invite', requireOwner, async (req, res) => {
  const crypto = require('crypto');
  const { sendInviteEmail } = require('../utils/email');
  const db = getDb();

  const demo = db.prepare('SELECT * FROM demo_requests WHERE id = ?').get(req.params.id);
  if (!demo) return res.status(404).json({ error: 'Demo-Anfrage nicht gefunden' });
  if (!demo.invited_user_id) return res.status(400).json({ error: 'Kein verknüpfter Benutzer – Einladung kann nicht erneut gesendet werden' });

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(demo.invited_user_id);
  if (!user) return res.status(404).json({ error: 'Benutzer nicht gefunden' });
  if (user.active === 1 || user.active === '1') return res.status(400).json({ error: 'Konto ist bereits aktiv – keine erneute Einladung nötig' });

  // Alte Token ungültig machen
  db.prepare('UPDATE invite_tokens SET used = 1 WHERE user_id = ?').run(user.id);

  // Neuen Token generieren
  const raw = crypto.randomBytes(32).toString('hex');
  const hash = crypto.createHash('sha256').update(raw).digest('hex');
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().replace('T', ' ').slice(0, 19);
  const inviteLang = demo.language || 'de';
  db.prepare('INSERT INTO invite_tokens (id, user_id, token_hash, expires_at, language) VALUES (?, ?, ?, ?, ?)')
    .run(require('uuid').v4(), user.id, hash, expiresAt, inviteLang);

  // Demo-Status zurück auf 'eingeladen'
  db.prepare("UPDATE demo_requests SET status = 'eingeladen' WHERE id = ?").run(demo.id);

  const appUrl = process.env.APP_URL || 'https://praxisonline24.onrender.com';
  // Kurz-Link: /i/<token> → 302 → /set-password.html?token=…&lang=… (server
  // schaut Sprache aus invite_tokens.language nach). Damit der Mail-Link in
  // mobilen Mail-Clients nicht an ?/& umgebrochen wird.
  const setPasswordUrl = `${appUrl}/i/${raw}`;

  try {
    await sendInviteEmail({
      contact: demo.contact,
      practice: demo.practice,
      email: demo.email,
      setPasswordUrl,
      lang: demo.language || 'de',
    });
    console.log(`[invite] Einladung erneut gesendet an ${demo.email}`);
  } catch (err) {
    console.error('[invite] Resend-Fehler:', err.message);
    console.log(`[invite] Invite-Link (Fallback): ${setPasswordUrl}`);
  }

  res.json({ ok: true, email: demo.email });
});

// ── Demo-Anfrage löschen (Owner) ───────────────────────────────────────────────
router.delete('/demo-requests/:id', requireOwner, (req, res) => {
  const db = getDb();
  const result = db.prepare('DELETE FROM demo_requests WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Nicht gefunden' });
  res.json({ ok: true, deleted: req.params.id });
});

// ── Einmal-Purge via OWNER_SETUP_TOKEN (löscht nach E-Mail-Liste) ─────────────
router.post('/purge-demo-requests', (req, res) => {
  const setupToken = process.env.OWNER_SETUP_TOKEN;
  if (!setupToken) return res.status(403).json({ error: 'Not available' });
  const { token, emails } = req.body;
  if (token !== setupToken) return res.status(403).json({ error: 'Invalid token' });
  if (!Array.isArray(emails) || emails.length === 0)
    return res.status(400).json({ error: 'emails[] erforderlich' });

  const db = getDb();
  const vorher = db.prepare('SELECT COUNT(*) as n FROM demo_requests').get().n;
  const placeholders = emails.map(() => '?').join(',');
  const lowerEmails = emails.map(e => e.toLowerCase());
  db.prepare(`DELETE FROM demo_requests WHERE LOWER(email) IN (${placeholders})`).run(lowerEmails);
  const nachher = db.prepare('SELECT COUNT(*) as n FROM demo_requests').get().n;
  const geloescht = vorher - nachher;

  console.log(`[purge] ${geloescht} Demo-Anfrage(n) gelöscht (${emails.join(', ')})`);
  res.json({ ok: true, vorher, nachher, geloescht, emails });
});

// ── CEO Command Center: Read-Only Aggregations ───────────────────────────────
// Drei dedizierte Endpunkte für das CEO Command Center.
// Strikt read-only: ausschließlich SELECT-Queries, keine Mutationen, keine
// sensiblen Felder (Passwort-Hashes, Secrets, Patientennamen, E-Mails von
// Patient:innen, Details-Blobs des Activity-Logs) werden zurückgegeben.

router.get('/command-center/summary', requireOwner, (req, res) => {
  const db = getDb();
  const now = moment();
  const today = now.format('YYYY-MM-DD');
  const monthStart = now.clone().startOf('month').format('YYYY-MM-DD');
  const in7days = now.clone().add(7, 'days').format('YYYY-MM-DD');

  // Praxen
  const totalPractices  = db.prepare('SELECT COUNT(*) as n FROM practices').get().n;
  const activePractices = db.prepare("SELECT COUNT(*) as n FROM practices WHERE account_status = 'active' OR account_status IS NULL").get().n;
  const pausedPractices = db.prepare("SELECT COUNT(*) as n FROM practices WHERE account_status = 'paused'").get().n;
  const trialPractices  = db.prepare('SELECT COUNT(*) as n FROM practices WHERE trial_end_date >= ?').get(today).n;
  const trialsExpiring  = db.prepare('SELECT COUNT(*) as n FROM practices WHERE trial_end_date BETWEEN ? AND ?').get(today, in7days).n;
  const trialsExpired   = db.prepare("SELECT COUNT(*) as n FROM practices WHERE trial_end_date < ? AND (account_status IS NULL OR account_status = 'active')").get(today).n;

  // Termine
  const appointmentsToday = db.prepare("SELECT COUNT(*) as n FROM appointments WHERE appointment_date = ? AND status NOT IN ('cancelled','archived')").get(today).n;
  const appointmentsMonth = db.prepare("SELECT COUNT(*) as n FROM appointments WHERE appointment_date >= ? AND status NOT IN ('cancelled','archived')").get(monthStart).n;

  // Rechnungen
  const openInvoices = db.prepare("SELECT COUNT(*) as n FROM invoices WHERE status != 'paid'").get().n;

  // Bewertungen
  const pendingReviews = db.prepare('SELECT COUNT(*) as n FROM reviews WHERE visible = 0').get().n;

  // Demo-Anfragen
  const demoTotal = db.prepare('SELECT COUNT(*) as n FROM demo_requests').get().n;
  const demoNew   = db.prepare("SELECT COUNT(*) as n FROM demo_requests WHERE status = 'neu'").get().n;

  // Benutzer (nur Zählung, keine E-Mails/Hashes)
  const totalUsers  = db.prepare('SELECT COUNT(*) as n FROM users').get().n;
  const activeUsers = db.prepare('SELECT COUNT(*) as n FROM users WHERE active = 1').get().n;

  // Warnungen (immer aus Live-Zahlen abgeleitet, keine statischen Fake-Werte)
  const warnings = [];
  if (trialsExpired > 0)  warnings.push({ level: 'danger', code: 'trials_expired',   message: `${trialsExpired} Testphase(n) abgelaufen`, count: trialsExpired });
  if (trialsExpiring > 0) warnings.push({ level: 'warn',   code: 'trials_expiring',  message: `${trialsExpiring} Testphase(n) enden binnen 7 Tagen`, count: trialsExpiring });
  if (pausedPractices > 0) warnings.push({ level: 'warn',  code: 'practices_paused', message: `${pausedPractices} Praxis/Praxen pausiert`, count: pausedPractices });
  if (openInvoices > 0)   warnings.push({ level: 'info',   code: 'invoices_open',    message: `${openInvoices} offene Rechnung(en)`, count: openInvoices });
  if (pendingReviews > 0) warnings.push({ level: 'info',   code: 'reviews_pending',  message: `${pendingReviews} Bewertung(en) warten auf Freigabe`, count: pendingReviews });
  if (demoNew > 0)        warnings.push({ level: 'info',   code: 'demo_new',         message: `${demoNew} neue Demo-Anfrage(n)`, count: demoNew });

  let ampel = 'green';
  if (warnings.some(w => w.level === 'warn'))   ampel = 'yellow';
  if (warnings.some(w => w.level === 'danger')) ampel = 'red';

  res.json({
    generated_at: now.toISOString(),
    read_only: true,
    practices: {
      total:  totalPractices,
      active: activePractices,
      paused: pausedPractices,
      trial:  trialPractices,
    },
    appointments: {
      today:      appointmentsToday,
      this_month: appointmentsMonth,
    },
    invoices: {
      open: openInvoices,
    },
    reviews: {
      pending: pendingReviews,
    },
    demo_requests: {
      total: demoTotal,
      new:   demoNew,
    },
    users: {
      total:  totalUsers,
      active: activeUsers,
    },
    warnings,
    ampel,
  });
});

router.get('/command-center/health', requireOwner, (req, res) => {
  const db = getDb();
  const now = moment();
  const today = now.format('YYYY-MM-DD');

  const dbFilePath = process.env.DB_PATH || path.join(__dirname, '../data/praxisonline24.db');
  let dbSizeBytes = null;
  try { dbSizeBytes = fs.statSync(dbFilePath).size; } catch { /* DB-Datei nicht lesbar – kein Fehler an Client */ }

  const lastAutomation   = db.prepare('SELECT ran_at FROM automation_log ORDER BY ran_at DESC LIMIT 1').get();
  const automationsToday = db.prepare("SELECT COUNT(*) as n FROM automation_log WHERE DATE(ran_at) = ?").get(today).n;

  // Owner-Konto-Status, ohne E-Mail oder ID herauszugeben
  let ownerStatus;
  if (!process.env.OWNER_EMAIL) {
    ownerStatus = 'not_configured';
  } else {
    const owner = db.prepare('SELECT active FROM users WHERE LOWER(email) = LOWER(?)').get(process.env.OWNER_EMAIL);
    ownerStatus = owner ? (owner.active ? 'active' : 'inactive') : 'missing';
  }

  res.json({
    generated_at: now.toISOString(),
    read_only: true,
    server: {
      uptime_seconds: Math.floor(process.uptime()),
      node_env:       process.env.NODE_ENV || 'development',
    },
    database: {
      size_bytes:     dbSizeBytes,
      custom_path:    !!process.env.DB_PATH,
    },
    automation: {
      last_run_at: lastAutomation ? lastAutomation.ran_at : null,
      today:       automationsToday,
    },
    owner: {
      configured: !!process.env.OWNER_EMAIL,
      status:     ownerStatus,
    },
    // Keine Secret-Werte selbst – nur Boolean-Indikatoren.
    config: {
      session_secret_configured: !!process.env.SESSION_SECRET &&
        process.env.SESSION_SECRET !== 'change_this_to_a_long_random_string' &&
        process.env.SESSION_SECRET !== 'praxisonline24-dev-secret-change-in-production',
      smtp_configured:    !!process.env.SMTP_HOST && process.env.SMTP_HOST !== 'smtp.example.com',
      setup_token_active: !!process.env.OWNER_SETUP_TOKEN,
      email_dev_mode:     process.env.EMAIL_DEV_MODE === 'true',
    },
  });
});

router.get('/command-center/activity', requireOwner, (req, res) => {
  const db = getDb();
  const now = moment();

  // Nur Aktionstyp + Entität + Zeitstempel – KEINE user_email, KEINE entity_id,
  // KEINE details (kann freien Text mit PII enthalten).
  const recent = db.prepare(
    'SELECT action, entity_type, created_at FROM activity_log ORDER BY created_at DESC LIMIT 20'
  ).all();

  const automation = db.prepare(
    'SELECT type, ran_at FROM automation_log ORDER BY ran_at DESC LIMIT 10'
  ).all().map(r => ({ type: r.type, created_at: r.ran_at }));

  res.json({
    generated_at: now.toISOString(),
    read_only: true,
    recent,
    automation,
  });
});

// ── AI OS Read Models (System Health Panel) ──────────────────────────────────
// Liefert die acht versionierten Read-Models aus ai/os/<section>/read-model.v1.json
// als read-only Liste. Reine Spec-Auslieferung, keine DB-Zugriffe, keine Mutationen.
router.get('/read-models', requireOwner, (req, res) => {
  const root = path.join(__dirname, '..', 'ai', 'os');
  const sections = ['core', 'engine', 'departments', 'intelligence', 'operations', 'security', 'integrations', 'dashboard'];
  const models = sections.map(section => {
    const file = path.join(root, section, 'read-model.v1.json');
    try {
      const data = JSON.parse(fs.readFileSync(file, 'utf8'));
      return {
        section,
        id: data.id,
        name: data.name,
        status: data.status,
        health_score: data.health_score,
        last_updated: data.last_updated,
        summary: data.summary,
        warnings: Array.isArray(data.warnings) ? data.warnings : [],
        next_actions: Array.isArray(data.next_actions) ? data.next_actions : [],
      };
    } catch {
      return { section, error: 'not_readable' };
    }
  });
  res.json({
    generated_at: new Date().toISOString(),
    auto_execution_enabled: false,
    models,
  });
});

module.exports = router;
