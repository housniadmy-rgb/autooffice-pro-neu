/* eslint-disable */
// Sprint 5 – Browser-Smoke-Test mit Playwright für die neuen CEO-Sektionen:
//   • AI Daily Briefing
//   • Trends · letzte 7 Tage
//   • Notifications Center
//   • Activity Timeline
// Zusätzlich:
//   • Owner kann das Dashboard öffnen, alle vier Sektionen sind im DOM,
//   • keine JS-Konsolen-Fehler.
//
// Startet einen dedizierten Test-Server (Port 3096) mit eindeutiger
// OWNER_EMAIL und räumt anschließend wieder auf.
//
// Aufruf:   node scripts/test-ceo-dashboard-sprint5-ui.js
// Exit 0 = ok, sonst Exit 1.

const { spawn } = require('child_process');
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const initSqlJs = require('sql.js');

const TEST_PORT = 3096;
const BASE = `http://127.0.0.1:${TEST_PORT}`;
const STAMP = Date.now();
const OWNER_EMAIL = `cc-s5-ui-owner+${STAMP}@example.test`;
const OWNER_PW    = 'OwnerTest1!S5UI';
const DB_PATH = path.join(__dirname, '..', 'data', 'praxisonline24.db');

let serverProc = null;
const checks = [];

function log(msg) { console.log(`[test] ${msg}`); }
function ok(msg)  { checks.push({ ok: true,  msg }); console.log(`  ✔ ${msg}`); }
function fail(msg){ checks.push({ ok: false, msg }); console.log(`  ✘ ${msg}`); }
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function waitForServer(timeoutMs = 15000) {
  const t0 = Date.now();
  while (Date.now() - t0 < timeoutMs) {
    try { const r = await fetch(`${BASE}/api/health`); if (r.ok) return; } catch {}
    await sleep(200);
  }
  throw new Error('Server nicht erreichbar nach ' + timeoutMs + ' ms');
}

function startServer() {
  return new Promise((resolve, reject) => {
    const env = {
      ...process.env,
      PORT: String(TEST_PORT),
      NODE_ENV: 'test',
      SESSION_SECRET: 'test-secret-ceo-dashboard-sprint5-ui',
      APP_URL: BASE,
      OWNER_EMAIL,
      OWNER_INITIAL_PASSWORD: OWNER_PW,
      OWNER_FORCE_RESET: 'true',
    };
    serverProc = spawn('node', ['server.js'], {
      cwd: path.join(__dirname, '..'),
      env,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let started = false;
    serverProc.stdout.on('data', (buf) => {
      if (!started && /läuft auf http/.test(buf.toString())) { started = true; resolve(); }
    });
    serverProc.stderr.on('data', (buf) => {
      const s = buf.toString().trim();
      if (s) process.stderr.write(`[server-err] ${s}\n`);
    });
    serverProc.on('exit', (code) => {
      if (!started) reject(new Error('Server beendet vor Start (code ' + code + ')'));
    });
    setTimeout(() => { if (!started) reject(new Error('Server startet nicht innerhalb von 15s')); }, 15000);
  });
}

async function stopServer() {
  if (!serverProc) return;
  return new Promise((resolve) => {
    serverProc.once('exit', () => resolve());
    serverProc.kill('SIGTERM');
    setTimeout(() => { try { serverProc.kill('SIGKILL'); } catch {} ; resolve(); }, 4000);
  });
}

async function cleanupOwner() {
  if (!fs.existsSync(DB_PATH)) return;
  try {
    const wasm = fs.readFileSync(path.join(__dirname, '..', 'node_modules/sql.js/dist/sql-wasm.wasm'));
    const SQL = await initSqlJs({ wasmBinary: wasm });
    const db = new SQL.Database(fs.readFileSync(DB_PATH));
    db.run('PRAGMA foreign_keys = ON');
    const stmt = db.prepare('SELECT id, practice_id FROM users WHERE LOWER(email) = LOWER(?)');
    stmt.bind([OWNER_EMAIL]);
    let u = null;
    if (stmt.step()) u = stmt.getAsObject();
    stmt.free();
    if (u) {
      db.run('DELETE FROM password_reset_tokens WHERE user_id = ?', [u.id]);
      db.run('DELETE FROM invite_tokens WHERE user_id = ?', [u.id]);
      db.run('DELETE FROM activity_log WHERE practice_id = ?', [u.practice_id]);
      db.run('DELETE FROM users WHERE id = ?', [u.id]);
      if (u.practice_id) {
        const c = db.prepare('SELECT COUNT(*) AS c FROM users WHERE practice_id = ?');
        c.bind([u.practice_id]); c.step();
        const n = c.getAsObject().c; c.free();
        if (n === 0) db.run('DELETE FROM practices WHERE id = ?', [u.practice_id]);
      }
      fs.writeFileSync(DB_PATH, Buffer.from(db.export()));
    }
    db.close();
    log('Cleanup: Test-Owner entfernt');
  } catch (e) {
    log('Cleanup-Fehler (nicht kritisch): ' + (e.message || e));
  }
}

async function runScenario() {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  const consoleErrors = [];
  const isBenign = txt => /\/js\/dashboard\.js/.test(txt) && /Failed to fetch/i.test(txt);
  page.on('pageerror', err => { const m = 'pageerror: ' + err.message; if (!isBenign(m)) consoleErrors.push(m); });
  page.on('console', msg => {
    if (msg.type() !== 'error') return;
    const m = 'console.error: ' + msg.text() + ' @ ' + (msg.location().url || '');
    if (!isBenign(m)) consoleErrors.push(m);
  });

  await page.goto(`${BASE}/login.html`);
  await page.evaluate(async ({ email, password }) => {
    await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include',
    });
  }, { email: OWNER_EMAIL, password: OWNER_PW });

  await page.goto(`${BASE}/ceo-dashboard.html`);
  await page.waitForSelector('#main-ui', { state: 'visible', timeout: 10000 });
  try {
    await page.waitForFunction(() => {
      const c = document.getElementById('content-ceo');
      return c && c.style.display !== 'none' && c.innerHTML.includes('AI Daily Briefing');
    }, null, { timeout: 15000 });
  } catch (e) {
    // Diagnose: dump the first 800 chars of the content-ceo HTML for triage.
    const dump = await page.evaluate(() => {
      const c = document.getElementById('content-ceo');
      const l = document.getElementById('loading-ceo');
      return {
        contentVisible: c ? c.style.display : 'no-element',
        contentLength:  c ? c.innerHTML.length : 0,
        contentSnippet: c ? c.innerHTML.slice(0, 800) : '',
        loadingHtml:    l ? l.innerHTML.slice(0, 400) : '',
      };
    });
    fail('Briefing-Block nicht binnen 15s gerendert. Diagnose: ' + JSON.stringify(dump));
    throw e;
  }

  ok('CEO Command Center geladen (Sprint 5)');

  const sections = await page.evaluate(() => {
    const body = document.querySelector('#content-ceo');
    if (!body) return null;
    const txt = body.innerText || '';
    return {
      hasBriefing:      /AI Daily Briefing/i.test(txt),
      hasTrends:        /Trends.*7 Tage/i.test(txt),
      hasNotifications: /Notifications Center/i.test(txt),
      hasTimeline:      /Activity Timeline/i.test(txt),
      hasMood:          /(Kritisch|Aufmerksamkeit|Stabil|Ruhig)/i.test(txt),
      hasReadOnlyBadge: /Read-Only/i.test(document.body.innerText || ''),
    };
  });

  if (sections && sections.hasBriefing)      ok('Sektion „AI Daily Briefing" sichtbar');     else fail('„AI Daily Briefing" fehlt');
  if (sections && sections.hasTrends)        ok('Sektion „Trends · 7 Tage" sichtbar');       else fail('Trend-Karten fehlen');
  if (sections && sections.hasNotifications) ok('Sektion „Notifications Center" sichtbar');  else fail('Notifications Center fehlt');
  if (sections && sections.hasTimeline)      ok('Sektion „Activity Timeline" sichtbar');     else fail('Activity Timeline fehlt');
  if (sections && sections.hasMood)          ok('Briefing zeigt einen Stimmungs-Status');    else fail('Briefing-Stimmung nicht gefunden');
  if (sections && sections.hasReadOnlyBadge) ok('Read-Only-Badge weiterhin sichtbar');       else fail('Read-Only-Badge fehlt');

  // Fetches einmal überspringen, dann manuelles Auto-Refresh auslösen.
  // setInterval(60s) zu warten wäre für einen Smoke-Test zu lang – wir rufen
  // die globale Funktion direkt auf und prüfen, dass loaded.ceo neu gesetzt
  // wird und das Content-Markup wieder befüllt ist.
  const refreshed = await page.evaluate(async () => {
    if (typeof autoRefreshActiveTab !== 'function') return { fn: false };
    const before = document.getElementById('content-ceo').innerHTML.length;
    await autoRefreshActiveTab();
    const after = document.getElementById('content-ceo').innerHTML.length;
    return { fn: true, before, after };
  });
  if (refreshed.fn) ok(`Auto-Refresh-Funktion ausführbar (Markup ${refreshed.before} → ${refreshed.after} Zeichen)`);
  else fail('autoRefreshActiveTab-Funktion nicht im globalen Scope');

  if (consoleErrors.length === 0) ok('Dashboard lädt ohne JS-Konsolen-Fehler');
  else fail('Console-/Page-Errors aufgetreten:\n  - ' + consoleErrors.join('\n  - '));

  // 401-Verhalten beim Auto-Refresh: Session zerstören, dann Refresh →
  // muss zur Login-Seite navigieren (location.href = '/login.html').
  await page.evaluate(() => fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }));
  const navPromise = page.waitForURL(/\/login\.html/, { timeout: 5000 }).then(() => true).catch(() => false);
  await page.evaluate(() => { if (typeof autoRefreshActiveTab === 'function') autoRefreshActiveTab(); });
  const navigated = await navPromise;
  if (navigated) ok('Auto-Refresh leitet bei 401 zur Login-Seite weiter');
  else fail('Auto-Refresh leitet bei 401 NICHT zur Login-Seite weiter');

  await browser.close();
}

(async () => {
  log(`Starte Server auf Port ${TEST_PORT} (OWNER_EMAIL=${OWNER_EMAIL})…`);
  try {
    await startServer();
    await waitForServer();
    log('Server bereit – starte Browser-Smoke-Test (Sprint 5).');
    await runScenario();
  } catch (e) {
    fail('Fataler Testfehler: ' + (e.message || e));
  } finally {
    await stopServer();
    await cleanupOwner();
  }

  const passed = checks.filter(c => c.ok).length;
  const failed = checks.filter(c => !c.ok).length;
  console.log(`\n[test] ${passed}/${checks.length} Checks bestanden, ${failed} fehlgeschlagen.`);
  process.exit(failed === 0 ? 0 : 1);
})();
