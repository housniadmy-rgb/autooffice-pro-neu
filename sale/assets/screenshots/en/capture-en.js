#!/usr/bin/env node
/**
 * PraxisOnline24 — English screenshot pipeline for Acquire.com.
 *
 * Captures 1920×1080 PNGs of the real, running application in English.
 *
 *   - public pages (homepage, pricing, request demo, login) are captured
 *     with the `lang=en` cookie pre-set so client-side i18n renders English.
 *   - admin pages (dashboard, calendar/appointments, patients, invoices,
 *     analytics, settings) require login; we authenticate as the owner,
 *     seed clearly-fictitious English demo data, then capture.
 *
 * Output: sale/assets/screenshots/en/*.png
 * Credentials read from repo .env (never logged).
 */

const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..', '..', '..', '..');
const OUT_DIR = __dirname;

function loadEnv() {
  const env = {};
  const envPath = path.join(ROOT, '.env');
  if (!fs.existsSync(envPath)) return env;
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)\s*=\s*(.*)$/);
    if (!m) continue;
    let v = m[2].trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    env[m[1]] = v;
  }
  return env;
}
const ENV = loadEnv();
const BASE = `http://localhost:${ENV.PORT || 3000}`;
const OWNER_EMAIL = ENV.OWNER_EMAIL;
const OWNER_PASSWORD = ENV.OWNER_INITIAL_PASSWORD;

if (!OWNER_EMAIL || !OWNER_PASSWORD) {
  console.error('OWNER_EMAIL / OWNER_INITIAL_PASSWORD missing in .env');
  process.exit(1);
}

async function api(page, method, url, body) {
  return page.evaluate(async ([m, u, b]) => {
    const r = await fetch(u, {
      method: m,
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: b ? JSON.stringify(b) : undefined,
    });
    if (!r.ok) return { _error: r.status, _body: await r.text() };
    try { return await r.json(); } catch { return await r.text(); }
  }, [method, url, body]);
}

async function loginAsOwner(page) {
  await page.evaluate(async ([email, pw]) => {
    const r = await fetch('/api/auth/login', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: pw }),
    });
    if (!r.ok) throw new Error('login failed: ' + r.status);
  }, [OWNER_EMAIL, OWNER_PASSWORD]);
}

async function setEnglishOnAccount(page) {
  // Persist English as the practice's saved language too, so it survives reloads.
  await api(page, 'PUT', '/api/practices/language', { language: 'en' }).catch(() => {});
}

async function seedEnglishDemoData(page) {
  // Practice profile — clearly fictitious English placeholders.
  await api(page, 'PUT', '/api/practices/info', {
    name: 'Demo Practice London',
    address: '1 Example Street',
    zip: 'EC1A 1AA',
    city: 'London',
    phone: '+44 20 0000 0000',
    email: 'demo@example.test',
    website: 'https://example.test',
    description: 'Fictitious demo practice — all data are placeholders.',
  }).catch(() => {});

  // Idempotency: clear previous demo data so re-runs don't produce duplicates.
  const existingApts = await api(page, 'GET', '/api/appointments?status=all');
  if (Array.isArray(existingApts)) {
    for (const a of existingApts) {
      if (a && a.id) await api(page, 'DELETE', `/api/appointments/${a.id}`).catch(() => {});
    }
  }
  const existingInv = await api(page, 'GET', '/api/invoices');
  if (Array.isArray(existingInv)) {
    for (const v of existingInv) {
      if (v && v.id) await api(page, 'DELETE', `/api/invoices/${v.id}`).catch(() => {});
    }
  }
  const existingPr = await api(page, 'GET', '/api/practitioners');
  if (Array.isArray(existingPr)) {
    for (const p of existingPr) {
      if (p && p.id) await api(page, 'DELETE', `/api/practitioners/${p.id}`).catch(() => {});
    }
  }

  // Practitioners
  const pr1 = await api(page, 'POST', '/api/practitioners', {
    first_name: 'Anna', last_name: 'Example', title: 'Dr.',
    specialty: 'General Medicine', email: 'anna@example.test',
    phone: '+44 20 0000 0001', bio: 'Demo profile',
  });
  const pr2 = await api(page, 'POST', '/api/practitioners', {
    first_name: 'Luke', last_name: 'Sample', title: 'Dr.',
    specialty: 'Sports Medicine', email: 'luke@example.test',
    phone: '+44 20 0000 0002', bio: 'Demo profile',
  });
  const pr1Id = pr1 && (pr1.id || pr1.practitioner_id);
  const pr2Id = pr2 && (pr2.id || pr2.practitioner_id);

  // Availability Mon-Fri 09:00-17:00
  for (const id of [pr1Id, pr2Id].filter(Boolean)) {
    for (const dow of [1, 2, 3, 4, 5]) {
      await api(page, 'POST', `/api/practitioners/${id}/availability`, {
        day_of_week: dow, start_time: '09:00', end_time: '17:00',
      }).catch(() => {});
    }
  }

  const today = new Date();
  const tomorrow = new Date(today.getTime() + 86400000);
  const yesterday = new Date(today.getTime() - 86400000);
  const fmt = d => d.toISOString().slice(0, 10);

  const apts = [
    { pr: pr1Id, date: fmt(today),     time: '09:00', fn: 'John',   ln: 'Sample',  em: 'john@example.test',   type: 'First consultation', st: 'scheduled' },
    { pr: pr1Id, date: fmt(today),     time: '10:30', fn: 'Emily',  ln: 'Demo',    em: 'emily@example.test',  type: 'Follow-up',          st: 'scheduled' },
    { pr: pr2Id, date: fmt(today),     time: '14:00', fn: 'Anna',   ln: 'Example', em: 'anna@example.test',   type: 'Consultation',       st: 'scheduled' },
    { pr: pr1Id, date: fmt(tomorrow),  time: '09:30', fn: 'Luke',   ln: 'Demo',    em: 'luke@example.test',   type: 'Check-up',           st: 'scheduled' },
    { pr: pr2Id, date: fmt(tomorrow),  time: '11:00', fn: 'John',   ln: 'Sample',  em: 'john@example.test',   type: 'Follow-up',          st: 'scheduled' },
    { pr: pr1Id, date: fmt(yesterday), time: '10:00', fn: 'Emily',  ln: 'Demo',    em: 'emily@example.test',  type: 'First consultation', st: 'completed' },
  ].filter(a => a.pr);

  for (const a of apts) {
    await api(page, 'POST', '/api/appointments', {
      practitioner_id: a.pr,
      patient_first_name: a.fn, patient_last_name: a.ln,
      patient_email: a.em, patient_phone: '+44 20 0000 0099',
      appointment_date: a.date, appointment_time: a.time,
      duration_minutes: 30, appointment_type: a.type, status: a.st,
      notes: 'Demo appointment',
    }).catch(() => {});
  }

  const inv = [
    { fn: 'John',  ln: 'Sample',  total: 75.00,  status: 'paid' },
    { fn: 'Emily', ln: 'Demo',    total: 120.00, status: 'open' },
    { fn: 'Anna',  ln: 'Example', total: 95.50,  status: 'overdue' },
  ];
  for (const v of inv) {
    await api(page, 'POST', '/api/invoices', {
      patient_first_name: v.fn, patient_last_name: v.ln,
      patient_address: '1 Example Street, London EC1A 1AA',
      items: JSON.stringify([{ description: 'Consultation 30 min', amount: v.total }]),
      amount: v.total, tax_rate: 0, tax_amount: 0, total_amount: v.total,
      invoice_date: fmt(today),
      due_date: fmt(new Date(today.getTime() + 14 * 86400000)),
      status: v.status,
      notes: 'Demo invoice',
    }).catch(() => {});
  }

  // Reviews
  const me = await api(page, 'GET', '/api/dashboard');
  const practiceId = me && (me.practice_id || (me.practice && me.practice.id));
  if (practiceId) {
    for (const r of [
      { stars: 5, name: 'John S.',  text: 'Very friendly and efficient service.' },
      { stars: 4, name: 'Emily D.', text: 'Great experience — would recommend.' },
    ]) {
      await api(page, 'POST', `/api/public/reviews/${practiceId}`, {
        rating: r.stars, comment: r.text, author_name: r.name,
      }).catch(() => {});
    }
  }
  console.log('  seeded English demo data');
}

async function shoot(page, urlPath, file) {
  await page.goto(BASE + urlPath, { waitUntil: 'networkidle', timeout: 30000 });
  // Let client-side i18n + charts paint
  await page.waitForTimeout(1500);
  // Hide any cookie / consent banners just in case
  await page.evaluate(() => {
    document.querySelectorAll('[class*=cookie i],[id*=cookie i],[class*=consent i],[id*=consent i]')
      .forEach(n => n.remove());
  });
  await page.screenshot({ path: path.join(OUT_DIR, file), fullPage: false });
  console.log(`  captured ${file}`);
}

(async () => {
  console.log('Launching browser…');
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    locale: 'en-GB',
    timezoneId: 'Europe/London',
  });
  // Pre-set lang=en cookie BEFORE first navigation so i18n renders English on first paint.
  await ctx.addCookies([{
    name: 'lang', value: 'en', domain: 'localhost', path: '/',
    expires: Math.floor(Date.now() / 1000) + 365 * 24 * 3600,
    httpOnly: false, secure: false, sameSite: 'Lax',
  }]);
  const page = await ctx.newPage();

  // ── Public pages ──────────────────────────────────────────────────
  await shoot(page, '/',                '01-homepage.png');
  await shoot(page, '/login.html',      '02-login.png');
  await shoot(page, '/preise.html',     '03-pricing.png');
  await shoot(page, '/demo.html',       '04-request-demo.png');

  // ── Admin pages (auth required) ───────────────────────────────────
  // Go to login first to be on the right origin for the API call
  await page.goto(BASE + '/login.html', { waitUntil: 'networkidle' });
  await loginAsOwner(page);
  console.log('  logged in');
  await setEnglishOnAccount(page);
  await seedEnglishDemoData(page);
  // Tiny pause for any background cron / dashboard to settle
  await page.waitForTimeout(800);

  await shoot(page, '/dashboard.html',         '05-dashboard.png');

  // Calendar — switch to day view for today so appointments are clearly visible
  await page.goto(BASE + '/appointments.html', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await page.evaluate(() => {
    const today = new Date().toISOString().slice(0, 10);
    const cell = document.querySelector(`.cal-cell[data-date="${today}"]`)
      || document.querySelector('.cal-cell.today')
      || document.querySelector('.cal-cell:has(.cal-apt)');
    if (cell) cell.click();
  });
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(OUT_DIR, '06-calendar.png'), fullPage: false });
  console.log('  captured 06-calendar.png');

  await shoot(page, '/patients.html',          '07-patients.png');
  await shoot(page, '/invoices.html',          '08-invoices.png');
  await shoot(page, '/settings.html',          '09-settings.png');

  await browser.close();
  console.log('done.');
})().catch(err => {
  console.error('capture failed:', err.message);
  process.exit(1);
});
