/* eslint-disable */
// Sprint 4 – Browser-Smoke-Test mit Playwright für das CEO Command Center.
//
// Stellt sicher:
//   • Dashboard lädt für den Owner ohne JS-Konsolen-Fehler.
//   • Der neue Insights-Block (Tasks · Warnings · Recommendations) ist sichtbar
//     und enthält jeweils eine Sektion.
//
// Startet einen dedizierten Test-Server (Port 3097) mit eindeutiger
// OWNER_EMAIL und räumt den Test-Owner anschließend wieder aus der DB.
//
// Aufruf:   node scripts/test-ceo-dashboard-ui.js
// Exit 0 = ok, sonst Exit 1.

const { spawn } = require('child_process');
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const initSqlJs = require('sql.js');

const TEST_PORT = 3097;
const BASE = `http://127.0.0.1:${TEST_PORT}`;
const STAMP = Date.now();
const OWNER_EMAIL = `cc-ui-owner+${STAMP}@example.test`;
const OWNER_PW    = 'OwnerTest1!UI';
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
      SESSION_SECRET: 'test-secret-ceo-dashboard-ui',
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
  // dashboard.js wirft beim direkten Wegnavigieren ein transientes
  // „Failed to fetch" – das ist Navigations-Rauschen aus /dashboard.html,
  // nicht aus dem CEO-Dashboard, und wird hier ausgefiltert.
  const isBenign = txt => /\/js\/dashboard\.js/.test(txt) && /Failed to fetch/i.test(txt);
  page.on('pageerror', err => { const m = 'pageerror: ' + err.message; if (!isBenign(m)) consoleErrors.push(m); });
  page.on('console', msg => {
    if (msg.type() !== 'error') return;
    const m = 'console.error: ' + msg.text() + ' @ ' + (msg.location().url || '');
    if (!isBenign(m)) consoleErrors.push(m);
  });

  // 1) Login direkt per Auth-API – vermeidet den /dashboard.html-Zwischenstopp,
  //    bei dem dashboard.js Fetches startet, die durch unsere unmittelbare
  //    Weiternavigation abgebrochen würden.
  await page.goto(`${BASE}/login.html`);
  await page.evaluate(async ({ email, password }) => {
    await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include',
    });
  }, { email: OWNER_EMAIL, password: OWNER_PW });

  // 2) CEO-Dashboard öffnen und warten, bis Inhalt sichtbar ist.
  await page.goto(`${BASE}/ceo-dashboard.html`);
  await page.waitForSelector('#main-ui', { state: 'visible', timeout: 10000 });
  // Loading-Spinner muss verschwinden, Content-Container muss display:block sein
  await page.waitForFunction(() => {
    const c = document.getElementById('content-ceo');
    return c && c.style.display !== 'none' && c.innerHTML.includes('CEO Tasks');
  }, null, { timeout: 15000 });

  ok('CEO Command Center geladen');

  // 3) Drei Sektionen sichtbar (innerText kann durch CSS text-transform:uppercase
  //    in Großbuchstaben erscheinen → Regex case-insensitive)
  const sectionsVisible = await page.evaluate(() => {
    const body = document.querySelector('#content-ceo');
    if (!body) return null;
    const txt = body.innerText || '';
    return {
      hasTasks: /Aufgaben/i.test(txt),
      hasWarnings: /Warnungen/i.test(txt),
      hasRecommendations: /Empfehlungen/i.test(txt),
      hasInsightsCard: /CEO Tasks · Warnings · Recommendations/i.test(txt),
    };
  });

  if (sectionsVisible && sectionsVisible.hasInsightsCard) ok('Insights-Karte im DOM sichtbar');
  else fail('Insights-Karte nicht gefunden');
  if (sectionsVisible && sectionsVisible.hasTasks)           ok('Sektion „Aufgaben" sichtbar');
  else fail('Sektion „Aufgaben" nicht gefunden');
  if (sectionsVisible && sectionsVisible.hasWarnings)        ok('Sektion „Warnungen" sichtbar');
  else fail('Sektion „Warnungen" nicht gefunden');
  if (sectionsVisible && sectionsVisible.hasRecommendations) ok('Sektion „Empfehlungen" sichtbar');
  else fail('Sektion „Empfehlungen" nicht gefunden');

  // 4) Keine JS-Fehler in der Konsole
  if (consoleErrors.length === 0) ok('Dashboard lädt ohne JS-Konsolen-Fehler');
  else fail('Console-/Page-Errors aufgetreten:\n  - ' + consoleErrors.join('\n  - '));

  await browser.close();
}

(async () => {
  log(`Starte Server auf Port ${TEST_PORT} (OWNER_EMAIL=${OWNER_EMAIL})…`);
  try {
    await startServer();
    await waitForServer();
    log('Server bereit – starte Browser-Smoke-Test.');
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
