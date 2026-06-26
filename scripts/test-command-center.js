/* eslint-disable */
// Lokaler End-to-End-Test für die neue Read-Only Command-Center API.
//
// Endpunkte (alle requireOwner, GET-only):
//   /api/owner/command-center/summary
//   /api/owner/command-center/health
//   /api/owner/command-center/activity
//
// Ablauf:
//   1. Startet einen Test-Server mit eindeutiger OWNER_EMAIL + Passwort
//      (OWNER_FORCE_RESET=true, damit auch bei wiederholtem Lauf das Owner-
//      Passwort eindeutig auf den Testwert gesetzt wird).
//   2. Greift unauthentifiziert zu  → erwartet 401.
//   3. Registriert/loggt einen Nicht-Owner-User ein → erwartet 403.
//   4. Loggt sich als Owner ein → erwartet 200 + erwartete Schema-Felder.
//   5. Sucht in allen Owner-Antworten nach verbotenen Strings
//      (password, hash, secret, patient, token) → darf nicht vorkommen.
//   6. Räumt sämtliche Test-Datensätze (Owner, Nicht-Owner, beide Praxen) auf,
//      damit produktive Daten unberührt bleiben.
//
// Aufruf:   node scripts/test-command-center.js
// Exit 0 = alle Checks ok, sonst Exit 1.
//
// Schreibt nichts ins Git, deployt nichts, keine externen Aufrufe.

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const initSqlJs = require('sql.js');

const TEST_PORT = 3098;
const BASE = `http://127.0.0.1:${TEST_PORT}`;
const STAMP = Date.now();
const OWNER_EMAIL = `cc-owner+${STAMP}@example.test`;
const OWNER_PW    = 'OwnerTest1!XYZ';
const USER_EMAIL  = `cc-user+${STAMP}@example.test`;
const USER_PW     = 'NonOwner1!XYZ';
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
      SESSION_SECRET: 'test-secret-only-for-command-center-test',
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
      const s = buf.toString();
      if (!started && /läuft auf http/.test(s)) { started = true; resolve(); }
    });
    serverProc.stderr.on('data', (buf) => {
      const s = buf.toString().trim();
      if (s) process.stderr.write(`[server-err] ${s}\n`);
    });
    serverProc.on('exit', (code) => {
      if (!started) reject(new Error('Server beendet vor Start (code ' + code + ')'));
    });
    setTimeout(() => {
      if (!started) reject(new Error('Server startet nicht innerhalb von 15s'));
    }, 15000);
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

function newJar() {
  return {
    cookie: '',
    absorb(setCookieHeader) {
      if (!setCookieHeader) return;
      const arr = Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader];
      const map = new Map();
      if (this.cookie) for (const part of this.cookie.split('; ')) {
        const i = part.indexOf('='); if (i > 0) map.set(part.slice(0, i), part.slice(i + 1));
      }
      for (const sc of arr) {
        const first = sc.split(';')[0];
        const i = first.indexOf('='); if (i > 0) map.set(first.slice(0, i).trim(), first.slice(i + 1).trim());
      }
      this.cookie = Array.from(map.entries()).map(([k, v]) => `${k}=${v}`).join('; ');
    },
  };
}

async function http(method, urlPath, body, jar) {
  const headers = { 'Accept': 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (jar && jar.cookie) headers['Cookie'] = jar.cookie;
  const res = await fetch(`${BASE}${urlPath}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const setCookie = res.headers.getSetCookie ? res.headers.getSetCookie() : res.headers.get('set-cookie');
  if (jar && setCookie) jar.absorb(setCookie);
  const text = await res.text();
  let json = null; try { json = text ? JSON.parse(text) : null; } catch {}
  return { status: res.status, body: json, raw: text };
}

const ENDPOINTS = [
  '/api/owner/command-center/summary',
  '/api/owner/command-center/health',
  '/api/owner/command-center/activity',
];

// Verbotene Schlüssel/Werte: dürfen NIE in einer Owner-Antwort auftauchen.
const FORBIDDEN_PATTERNS = [
  /password/i,
  /password_hash/i,
  /\bhash\b/i,
  /\bsecret\b/i,
  /patient_first_name/i,
  /patient_last_name/i,
  /patient_email/i,
  /token_hash/i,
  /bcrypt/i,
];

function scanForbidden(label, raw) {
  let problems = 0;
  for (const pat of FORBIDDEN_PATTERNS) {
    if (pat.test(raw)) { fail(`${label}: verbotenes Muster gefunden: ${pat}`); problems++; }
  }
  if (problems === 0) ok(`${label}: keine sensiblen Felder in der Antwort`);
}

function expectShape(label, body) {
  if (!body || typeof body !== 'object') { fail(`${label}: Antwort ist kein JSON-Objekt`); return; }
  if (label.endsWith('summary')) {
    const keys = ['practices', 'appointments', 'invoices', 'reviews', 'demo_requests', 'users', 'warnings', 'ampel'];
    const missing = keys.filter(k => !(k in body));
    if (missing.length) fail(`${label}: fehlende Felder ${missing.join(', ')}`);
    else ok(`${label}: erwartete Felder vorhanden`);
    if (body.read_only !== true) fail(`${label}: read_only !== true`);
    else ok(`${label}: read_only-Flag korrekt gesetzt`);
    if (typeof body.practices?.total === 'number') ok(`${label}: practices.total ist Zahl (= ${body.practices.total})`);
    else fail(`${label}: practices.total ist keine Zahl`);
    if (typeof body.appointments?.today === 'number' && typeof body.appointments?.this_month === 'number')
      ok(`${label}: appointments.today/this_month sind Zahlen`);
    else fail(`${label}: appointments-Felder fehlen oder sind keine Zahlen`);
  } else if (label.endsWith('health')) {
    const keys = ['server', 'database', 'automation', 'owner', 'config'];
    const missing = keys.filter(k => !(k in body));
    if (missing.length) fail(`${label}: fehlende Felder ${missing.join(', ')}`);
    else ok(`${label}: erwartete Felder vorhanden`);
    if (body.config && 'session_secret_configured' in body.config) ok(`${label}: config-Flags vorhanden`);
    else fail(`${label}: config-Flags fehlen`);
  } else if (label.endsWith('activity')) {
    if (!Array.isArray(body.recent) || !Array.isArray(body.automation))
      fail(`${label}: recent / automation müssen Arrays sein`);
    else ok(`${label}: recent + automation sind Arrays`);
    // recent darf nur diese Felder enthalten – keine user_email, kein entity_id, kein details
    const allowed = new Set(['action', 'entity_type', 'created_at']);
    let bad = 0;
    for (const r of body.recent) {
      for (const k of Object.keys(r)) if (!allowed.has(k)) { fail(`${label}: recent-Eintrag enthält unerlaubtes Feld "${k}"`); bad++; break; }
    }
    if (bad === 0) ok(`${label}: recent-Einträge enthalten nur erlaubte Felder`);
  }
}

async function runScenario() {
  // 1) Unauthentifiziert → 401
  log('Phase 1 · Unauthentifizierte Anfragen');
  const anonJar = newJar();
  for (const ep of ENDPOINTS) {
    const r = await http('GET', ep, undefined, anonJar);
    if (r.status === 401) ok(`anonymous GET ${ep} → 401`);
    else fail(`anonymous GET ${ep} → erwartet 401, erhalten ${r.status}`);
  }

  // 2) Nicht-Owner → 403
  log('Phase 2 · Nicht-Owner-User');
  const userJar = newJar();
  const reg = await http('POST', '/api/auth/register', {
    email: USER_EMAIL, password: USER_PW,
    first_name: 'Non', last_name: 'Owner',
    practice_name: 'Non-Owner-Praxis', language: 'de',
  }, userJar);
  if (reg.status !== 201) { fail(`Non-Owner-Register: erwartet 201, erhalten ${reg.status}`); }
  else ok('Non-Owner-User registriert');

  for (const ep of ENDPOINTS) {
    const r = await http('GET', ep, undefined, userJar);
    if (r.status === 403) ok(`non-owner GET ${ep} → 403`);
    else fail(`non-owner GET ${ep} → erwartet 403, erhalten ${r.status}`);
  }

  // 3) Owner-Login → 200
  log('Phase 3 · Owner-Login + Schema-Check + Sensiblen-Felder-Scan');
  const ownerJar = newJar();
  const ownerLogin = await http('POST', '/api/auth/login', { email: OWNER_EMAIL, password: OWNER_PW }, ownerJar);
  if (ownerLogin.status !== 200) {
    fail(`Owner-Login: erwartet 200, erhalten ${ownerLogin.status} – ${ownerLogin.raw.slice(0,200)}`);
    return;
  }
  ok('Owner eingeloggt (HTTP 200)');

  const ownerCheck = await http('GET', '/api/owner/check', undefined, ownerJar);
  if (ownerCheck.body && ownerCheck.body.isOwner === true) ok('/api/owner/check bestätigt Owner-Status');
  else fail(`/api/owner/check liefert nicht isOwner=true (${JSON.stringify(ownerCheck.body)})`);

  for (const ep of ENDPOINTS) {
    const label = ep;
    const r = await http('GET', ep, undefined, ownerJar);
    if (r.status !== 200) { fail(`owner GET ${ep} → erwartet 200, erhalten ${r.status}`); continue; }
    ok(`owner GET ${ep} → 200`);
    expectShape(label, r.body);
    scanForbidden(label, r.raw);
  }

  // 4) Write-Schutz: POST/PUT/DELETE auf Endpunkte → nicht 200 (kein Mutations-Pfad)
  log('Phase 4 · Write-Schutz');
  for (const ep of ENDPOINTS) {
    const rPost = await http('POST', ep, { hack: 1 }, ownerJar);
    if (rPost.status >= 400) ok(`owner POST ${ep} blockiert (HTTP ${rPost.status})`);
    else fail(`owner POST ${ep} sollte blockiert sein, erhielt ${rPost.status}`);
  }
}

async function cleanupTestData() {
  if (!fs.existsSync(DB_PATH)) return;
  try {
    const wasm = fs.readFileSync(path.join(__dirname, '..', 'node_modules/sql.js/dist/sql-wasm.wasm'));
    const SQL = await initSqlJs({ wasmBinary: wasm });
    const db = new SQL.Database(fs.readFileSync(DB_PATH));
    db.run('PRAGMA foreign_keys = ON');

    function purge(email) {
      const sel = db.prepare('SELECT id, practice_id FROM users WHERE LOWER(email) = LOWER(?)');
      sel.bind([email]);
      let user = null;
      if (sel.step()) user = sel.getAsObject();
      sel.free();
      if (!user) return;
      db.run('DELETE FROM password_reset_tokens WHERE user_id = ?', [user.id]);
      db.run('DELETE FROM invite_tokens WHERE user_id = ?', [user.id]);
      db.run('DELETE FROM activity_log WHERE practice_id = ?', [user.practice_id]);
      db.run('DELETE FROM users WHERE id = ?', [user.id]);
      if (user.practice_id) {
        const cnt = db.prepare('SELECT COUNT(*) AS c FROM users WHERE practice_id = ?');
        cnt.bind([user.practice_id]); cnt.step();
        const c = cnt.getAsObject().c; cnt.free();
        if (c === 0) db.run('DELETE FROM practices WHERE id = ?', [user.practice_id]);
      }
    }
    purge(OWNER_EMAIL);
    purge(USER_EMAIL);

    const data = db.export();
    fs.writeFileSync(DB_PATH, Buffer.from(data));
    db.close();
    log('Cleanup: Test-Owner + Test-User entfernt');
  } catch (e) {
    log('Cleanup-Fehler (nicht kritisch): ' + (e.message || e));
  }
}

(async () => {
  log(`Starte Server auf Port ${TEST_PORT} (OWNER_EMAIL=${OWNER_EMAIL})…`);
  try {
    await startServer();
    await waitForServer();
    log('Server bereit – führe Tests aus.');
    await runScenario();
  } catch (e) {
    fail('Fataler Testfehler: ' + (e.message || e));
  } finally {
    await stopServer();
    await cleanupTestData();
  }

  const passed = checks.filter(c => c.ok).length;
  const failed = checks.filter(c => !c.ok).length;
  console.log(`\n[test] ${passed}/${checks.length} Checks bestanden, ${failed} fehlgeschlagen.`);
  process.exit(failed === 0 ? 0 : 1);
})();
