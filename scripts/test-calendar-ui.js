/* eslint-disable */
// Browser smoke test for the modernized calendar (appointments.html).
// Verifies: day/week/month view tabs, left filter panel, right detail drawer,
// colored appointment chips, responsive mobile width, dark-mode preparedness.
// Cleans up the test user after running.
//
// Usage: node scripts/test-calendar-ui.js
// Requires server running on http://127.0.0.1:3000

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const initSqlJs = require('sql.js');

const BASE = process.env.BASE_URL || 'http://127.0.0.1:3000';
const STAMP = Date.now();
const TEST_EMAIL = `ui-cal-test+${STAMP}@example.test`;
const TEST_PW    = 'CalTestPw0rd!';
const DB_PATH    = path.join(__dirname, '..', 'data', 'praxisonline24.db');

const checks = [];
function ok(msg)   { checks.push({ ok: true,  msg }); console.log(`  ✔ ${msg}`); }
function fail(msg) { checks.push({ ok: false, msg }); console.log(`  ✘ ${msg}`); }

function p2(n) { return String(n).padStart(2, '0'); }
function iso(d){ return `${d.getFullYear()}-${p2(d.getMonth()+1)}-${p2(d.getDate())}`; }

async function ensureServer() {
  try { const r = await fetch(`${BASE}/api/health`); if (!r.ok) throw new Error(r.status); }
  catch (e) { throw new Error(`Server unter ${BASE} nicht erreichbar – bitte "node server.js" laufen lassen. (${e.message})`); }
}

class Jar {
  constructor() { this.cookie = ''; }
  consume(setCookieRaw) {
    if (!setCookieRaw) return;
    const arr = Array.isArray(setCookieRaw) ? setCookieRaw : String(setCookieRaw).split(/,(?=[^;]+=[^;]+)/);
    const map = new Map();
    if (this.cookie) for (const part of this.cookie.split('; ')) {
      const [k, ...v] = part.split('='); map.set(k, v.join('='));
    }
    for (const sc of arr) {
      const first = sc.split(';')[0]; const eq = first.indexOf('=');
      if (eq < 0) continue;
      map.set(first.slice(0, eq).trim(), first.slice(eq + 1).trim());
    }
    this.cookie = Array.from(map.entries()).map(([k, v]) => `${k}=${v}`).join('; ');
  }
}

async function http(method, p, body, jar) {
  const headers = { 'Content-Type': 'application/json' };
  if (jar && jar.cookie) headers.Cookie = jar.cookie;
  const r = await fetch(`${BASE}${p}`, {
    method, headers, body: body ? JSON.stringify(body) : undefined,
  });
  const setCookie = r.headers.getSetCookie ? r.headers.getSetCookie() : r.headers.get('set-cookie');
  if (jar) jar.consume(setCookie);
  const text = await r.text();
  let json = null; try { json = JSON.parse(text); } catch {}
  return { status: r.status, body: json, raw: text };
}

async function seedTestData() {
  const jar = new Jar();

  // Register
  const reg = await http('POST', '/api/auth/register', {
    email: TEST_EMAIL, password: TEST_PW,
    first_name: 'Cal', last_name: 'Tester',
    practice_name: 'Calendar-UI-Test-Praxis', language: 'de',
  }, jar);
  if (reg.status !== 201) throw new Error(`register fail ${reg.status} ${reg.raw.slice(0,200)}`);

  // Add practitioner
  const pr = await http('POST', '/api/practitioners', {
    title: 'Dr.', first_name: 'Alex', last_name: 'Müller',
    specialty: 'Allgemeinmedizin', active: true,
  }, jar);
  if (pr.status !== 201) throw new Error(`practitioner fail ${pr.status} ${pr.raw.slice(0,200)}`);
  const practitionerId = pr.body.id;

  // Add appointments today + tomorrow with various statuses
  const today = new Date();
  const todayIso = iso(today);
  const tmw = new Date(today); tmw.setDate(tmw.getDate() + 1);
  const tmwIso = iso(tmw);

  const samples = [
    { date: todayIso, time: '09:00', dur: 30, first: 'Anna',  last: 'Beispiel', email: 'anna@example.test',  type: 'Ersttermin' },
    { date: todayIso, time: '11:00', dur: 45, first: 'Bruno', last: 'Beispiel', email: 'bruno@example.test', type: 'Folgetermin' },
    { date: todayIso, time: '14:30', dur: 60, first: 'Clara', last: 'Beispiel', email: 'clara@example.test', type: 'Beratung'   },
    { date: tmwIso,   time: '10:00', dur: 30, first: 'David', last: 'Beispiel', email: 'david@example.test', type: 'Vorsorge'   },
  ];

  const ids = [];
  for (const a of samples) {
    const r = await http('POST', '/api/appointments', {
      practitioner_id: practitionerId,
      appointment_date: a.date,
      appointment_time: a.time,
      duration_minutes: a.dur,
      appointment_type: a.type,
      patient_first_name: a.first,
      patient_last_name: a.last,
      patient_email: a.email,
    }, jar);
    if (r.status !== 201) throw new Error(`appointment fail ${r.status} ${r.raw.slice(0,200)}`);
    ids.push(r.body.id);
  }

  // Mark one completed via PUT
  await http('PUT', `/api/appointments/${ids[0]}`, { status: 'completed' }, jar);
}

async function uiLogin(page) {
  await page.goto(`${BASE}/login.html`);
  await page.fill('#email', TEST_EMAIL);
  await page.fill('#password', TEST_PW);
  await page.click('button[type="submit"]');
  await page.waitForURL(/dashboard\.html/, { timeout: 10000 });
}

async function cleanup() {
  if (!fs.existsSync(DB_PATH)) return;
  try {
    const wasm = fs.readFileSync(path.join(__dirname, '..', 'node_modules/sql.js/dist/sql-wasm.wasm'));
    const SQL = await initSqlJs({ wasmBinary: wasm });
    const db = new SQL.Database(fs.readFileSync(DB_PATH));
    db.run('PRAGMA foreign_keys = ON');
    const stmt = db.prepare('SELECT id, practice_id FROM users WHERE LOWER(email) = LOWER(?)');
    stmt.bind([TEST_EMAIL]);
    let u = null; if (stmt.step()) u = stmt.getAsObject(); stmt.free();
    if (!u) { db.close(); return; }
    db.run('DELETE FROM appointments WHERE practice_id = ?', [u.practice_id]);
    db.run('DELETE FROM practitioners  WHERE practice_id = ?', [u.practice_id]);
    db.run('DELETE FROM password_reset_tokens WHERE user_id = ?', [u.id]);
    db.run('DELETE FROM invite_tokens WHERE user_id = ?', [u.id]);
    db.run('DELETE FROM users WHERE id = ?', [u.id]);
    if (u.practice_id) {
      const c = db.prepare('SELECT COUNT(*) AS c FROM users WHERE practice_id = ?');
      c.bind([u.practice_id]); c.step();
      const n = c.getAsObject().c; c.free();
      if (n === 0) db.run('DELETE FROM practices WHERE id = ?', [u.practice_id]);
    }
    fs.writeFileSync(DB_PATH, Buffer.from(db.export()));
    db.close();
  } catch (e) {
    console.log(`(cleanup warn: ${e.message})`);
  }
}

(async () => {
  console.log(`\n▶ Calendar UI Smoke Test  (${BASE})`);

  await ensureServer();
  await seedTestData();

  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ baseURL: BASE });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('console error: ' + m.text()); });

  try {
    await uiLogin(page);
    await page.goto(`${BASE}/appointments.html`);
    await page.waitForLoadState('networkidle');

    // ── 1) Toolbar + view tabs present ────────────────────────────────────
    const tabsExist = await page.locator('.pcal-view-tab').count();
    if (tabsExist === 3) ok('1) Drei View-Tabs vorhanden (Tag/Woche/Monat)');
    else fail(`1) Erwartete 3 Tabs, gefunden ${tabsExist}`);

    // ── 2) Default month view shows colored chips ─────────────────────────
    const monthVisible = await page.locator('#view-month').isVisible();
    if (monthVisible) ok('2a) Monatsansicht ist Default sichtbar');
    else fail('2a) Monatsansicht sollte sichtbar sein');

    const chips = page.locator('.pcal-chip');
    const chipCount = await chips.count();
    if (chipCount >= 3) ok(`2b) ${chipCount} farbige Termin-Chips im Monatsraster`);
    else fail(`2b) Erwartete ≥3 Termin-Chips, gefunden ${chipCount}`);

    // Check at least one chip has the colored status background
    const hasStatusClass = await page.locator('.pcal-chip.status-scheduled, .pcal-chip.status-completed').count();
    if (hasStatusClass > 0) ok('2c) Chips tragen Status-CSS-Klassen (Farbcodierung)');
    else fail('2c) Keine Chips mit status-Klassen gefunden');

    // ── 3) Switch to week view ────────────────────────────────────────────
    await page.locator('.pcal-view-tab[data-view="week"]').click();
    await page.waitForTimeout(400);
    if (await page.locator('#view-week').isVisible()) ok('3a) Wochenansicht öffnet sich');
    else fail('3a) Wochenansicht nicht sichtbar nach Tab-Klick');

    const weekBlocks = await page.locator('#view-week .pcal-time-block').count();
    if (weekBlocks >= 3) ok(`3b) ${weekBlocks} Termin-Blöcke in Wochenansicht`);
    else fail(`3b) Erwartete ≥3 Termin-Blöcke, gefunden ${weekBlocks}`);

    const todayHeader = await page.locator('#view-week .pcal-week-dow.is-today').count();
    if (todayHeader === 1) ok('3c) Heute-Tag im Wochenheader hervorgehoben');
    else fail(`3c) Erwartet 1 hervorgehobener Tag, gefunden ${todayHeader}`);

    // ── 4) Switch to day view ─────────────────────────────────────────────
    await page.locator('.pcal-view-tab[data-view="day"]').click();
    await page.waitForTimeout(300);
    if (await page.locator('#view-day').isVisible()) ok('4a) Tagesansicht öffnet sich');
    else fail('4a) Tagesansicht nicht sichtbar');

    const dayBlocks = await page.locator('#view-day .pcal-time-block').count();
    if (dayBlocks >= 3) ok(`4b) ${dayBlocks} Termin-Blöcke in Tagesansicht (heute)`);
    else fail(`4b) Erwartete ≥3 Blöcke heute, gefunden ${dayBlocks}`);

    // ── 5) Click an appointment → right detail drawer opens ──────────────
    await page.locator('#view-day .pcal-time-block').first().click();
    await page.waitForTimeout(350);
    const drawerOpen = await page.locator('#pcal-detail.is-open').count();
    if (drawerOpen === 1) ok('5a) Rechter Detail-Drawer öffnet sich beim Klick');
    else fail('5a) Detail-Drawer öffnet sich NICHT');

    const drawerHasName = await page.locator('#pcal-detail .pcal-detail-name').count();
    if (drawerHasName === 1) ok('5b) Drawer zeigt Patienten-Namen');
    else fail('5b) Patientenname im Drawer fehlt');

    const drawerHasStatus = await page.locator('#pcal-detail .pcal-detail-status').count();
    if (drawerHasStatus === 1) ok('5c) Drawer zeigt Status-Pill');
    else fail('5c) Status-Pill im Drawer fehlt');

    const editBtn = await page.locator('#btn-detail-edit').count();
    if (editBtn === 1) ok('5d) Bearbeiten-Button im Drawer vorhanden');
    else fail('5d) Bearbeiten-Button fehlt');

    // Close drawer
    await page.locator('#btn-close-detail').click();
    await page.waitForTimeout(300);
    const drawerClosed = await page.locator('#pcal-detail.is-open').count();
    if (drawerClosed === 0) ok('5e) Drawer schließt mit ×-Button');
    else fail('5e) Drawer bleibt offen nach ×');

    // ── 6) Left filter panel filtering ────────────────────────────────────
    const filterChipCount = await page.locator('#filter-status-chips .pcal-filter-chip').count();
    if (filterChipCount === 5) ok('6a) 5 Status-Filter-Chips im Filterpanel');
    else fail(`6a) Erwartete 5 Status-Chips, gefunden ${filterChipCount}`);

    // Toggle off "completed" and check the completed termin disappears
    await page.locator('.pcal-view-tab[data-view="month"]').click();
    await page.waitForTimeout(300);
    const beforeFilter = await page.locator('.pcal-chip.status-completed').count();
    await page.locator('#filter-status-chips .pcal-filter-chip[data-status="completed"]').click();
    await page.waitForTimeout(250);
    const afterFilter = await page.locator('.pcal-chip.status-completed').count();
    if (afterFilter < beforeFilter && afterFilter === 0) ok(`6b) Completed-Filter blendet ${beforeFilter} Termine aus`);
    else fail(`6b) Filter wirkt nicht: vor=${beforeFilter}, nach=${afterFilter}`);
    // re-enable
    await page.locator('#filter-status-chips .pcal-filter-chip[data-status="completed"]').click();
    await page.waitForTimeout(200);

    // ── 7) Responsive: 720px width ───────────────────────────────────────
    await page.setViewportSize({ width: 700, height: 900 });
    await page.waitForTimeout(250);
    const filterPanelHidden = await page.locator('#pcal-filters').evaluate(el => {
      const r = el.getBoundingClientRect();
      // On mobile the filter panel is positioned off-screen via transform
      const style = window.getComputedStyle(el);
      return style.position === 'fixed' && (r.left < 0 || el.classList.contains('is-open') === false);
    });
    if (filterPanelHidden) ok('7a) Filter-Panel ist auf 700px versteckt (slide-in)');
    else fail('7a) Filter-Panel sollte auf Mobil ausgeblendet sein');

    const toggleVisible = await page.locator('#btn-toggle-filters').isVisible();
    if (toggleVisible) ok('7b) Filter-Toggle-Button erscheint auf Mobil');
    else fail('7b) Filter-Toggle fehlt auf Mobil');

    // Open mobile filter
    await page.locator('#btn-toggle-filters').click();
    await page.waitForTimeout(300);
    const filterOpen = await page.locator('#pcal-filters.is-open').count();
    if (filterOpen === 1) ok('7c) Filter-Panel öffnet sich als Slide-in');
    else fail('7c) Filter-Panel-Slide-in funktioniert nicht');

    // ── 8) Dark mode preparedness ────────────────────────────────────────
    await page.setViewportSize({ width: 1400, height: 900 });
    await page.waitForTimeout(200);
    const beforeBg = await page.locator('.pcal-main').evaluate(el =>
      window.getComputedStyle(el).backgroundColor
    );
    await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
    await page.waitForTimeout(150);
    const afterBg = await page.locator('.pcal-main').evaluate(el =>
      window.getComputedStyle(el).backgroundColor
    );
    if (afterBg !== beforeBg) ok(`8) Dark-Mode-Tokens umschalten: ${beforeBg} → ${afterBg}`);
    else fail(`8) Dark-Mode-Tokens NICHT umgeschaltet (${beforeBg})`);
    await page.evaluate(() => document.documentElement.removeAttribute('data-theme'));

    // ── 9) No console / page errors during the run ────────────────────────
    if (errors.length === 0) ok('9) Keine Browser-Fehler während der Tests');
    else fail(`9) Browser-Fehler: ${errors.slice(0, 3).join(' | ')}`);

    // ── 10) Screenshot for sanity ─────────────────────────────────────────
    const shot = path.join(__dirname, '..', 'tmp-cal-shot.png');
    await page.screenshot({ path: shot, fullPage: false });
    ok(`10) Screenshot abgelegt: ${shot}`);
  } catch (e) {
    fail('FATAL: ' + e.message);
  } finally {
    await browser.close();
    await cleanup();
  }

  const fails = checks.filter(c => !c.ok);
  console.log(`\n──────────────  ${checks.length - fails.length} ✔  /  ${fails.length} ✘  ──────────────`);
  process.exit(fails.length === 0 ? 0 : 1);
})();
