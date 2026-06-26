/* eslint-disable */
// Sprint 4 – End-to-End-Test für den neuen Read-Only Insights-Endpoint
// des CEO Command Centers.
//
// Endpoint (requireOwner, GET-only):
//   /api/owner/command-center/insights
//
// Ablauf:
//   1. Startet einen Test-Server mit eindeutiger OWNER_EMAIL + Passwort.
//   2. Greift unauthentifiziert zu                 → erwartet 401.
//   3. Registriert/loggt einen Nicht-Owner-User ein → erwartet 403.
//   4. Loggt sich als Owner ein und ruft Endpoint  → erwartet 200 mit Schema:
//        { tasks: [], warnings: [], recommendations: [], counters: {}, read_only: true }
//      Tasks/Warnings/Recommendations sind aus Live-Werten abgeleitet:
//        - openDemos    > 0  → Task code=demo_requests_open    (department=ceo)
//        - pendingReviews>0  → Task code=reviews_pending       (department=support_marketing)
//        - openInvoices > 0  → Warning code=cfo_open_invoices  (department=cfo)
//        - lowHealth   > 0   → Warning code=cto_low_health_score (department=cto)
//        - aptsToday  == 0   → Recommendation code=no_appointments_today
//        - many trials       → Recommendation code=many_trials_followup
//   5. Schreib-Schutz: POST/PATCH/DELETE auf den Endpoint → muss >= 400 liefern.
//   6. Sucht in allen Owner-Antworten nach verbotenen Strings
//      (password, hash, secret, patient, token, bcrypt) → darf nicht vorkommen.
//   7. Räumt sämtliche Test-Datensätze auf, damit produktive Daten unberührt bleiben.
//
// Aufruf:   node scripts/test-command-center-insights.js
// Exit 0 = alle Checks ok, sonst Exit 1.
//
// Schreibt nichts ins Git, deployt nichts, keine externen Aufrufe.

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const initSqlJs = require('sql.js');

const TEST_PORT = 3099;
const BASE = `http://127.0.0.1:${TEST_PORT}`;
const STAMP = Date.now();
const OWNER_EMAIL = `cc-ins-owner+${STAMP}@example.test`;
const OWNER_PW    = 'OwnerTest1!INS';
const USER_EMAIL  = `cc-ins-user+${STAMP}@example.test`;
const USER_PW     = 'NonOwner1!INS';
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
      SESSION_SECRET: 'test-secret-only-for-insights-test',
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

const ENDPOINT = '/api/owner/command-center/insights';

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

function expectInsightsShape(body) {
  if (!body || typeof body !== 'object') { fail('Insights: Antwort ist kein JSON-Objekt'); return; }
  if (body.read_only !== true) fail('Insights: read_only !== true'); else ok('Insights: read_only-Flag korrekt');

  for (const key of ['tasks', 'warnings', 'recommendations']) {
    if (Array.isArray(body[key])) ok(`Insights: ${key} ist Array (${body[key].length} Einträge)`);
    else fail(`Insights: ${key} fehlt oder ist kein Array`);
  }

  if (body.counters && typeof body.counters === 'object') ok('Insights: counters-Block vorhanden');
  else fail('Insights: counters-Block fehlt');

  // Tasks: erlaubte Departments + Pflicht-Felder
  const allowedDept = new Set(['ceo', 'cfo', 'cto', 'support_marketing', 'ops']);
  for (const t of body.tasks || []) {
    if (!t.code || !t.title || !t.department) { fail(`Insights: Task ohne code/title/department: ${JSON.stringify(t)}`); break; }
    if (!allowedDept.has(t.department))      { fail(`Insights: Task mit unzulässigem department "${t.department}"`); break; }
  }
  // Warnings: erlaubte Level
  const allowedLevel = new Set(['warn', 'danger', 'info']);
  for (const w of body.warnings || []) {
    if (!w.code || !w.level || !w.message) { fail(`Insights: Warning ohne code/level/message: ${JSON.stringify(w)}`); break; }
    if (!allowedLevel.has(w.level))        { fail(`Insights: Warning mit unzulässigem level "${w.level}"`); break; }
  }
  // Recommendations: code/title vorhanden
  for (const r of body.recommendations || []) {
    if (!r.code || !r.title) { fail(`Insights: Recommendation ohne code/title: ${JSON.stringify(r)}`); break; }
  }

  // Mapping Rule-Checks: wenn counters > 0 dann muss entsprechender Eintrag existieren.
  const c = body.counters || {};
  const codes = new Set([
    ...(body.tasks || []).map(x => x.code),
    ...(body.warnings || []).map(x => x.code),
    ...(body.recommendations || []).map(x => x.code),
  ]);
  if (typeof c.open_demo_requests === 'number' && c.open_demo_requests > 0
      && !codes.has('demo_requests_open')) fail('Regel: offene Demos vorhanden, aber Task demo_requests_open fehlt');
  if (typeof c.open_demo_requests === 'number' && c.open_demo_requests > 0
      && codes.has('demo_requests_open')) ok('Regel: offene Demos → Task demo_requests_open vorhanden');

  if (typeof c.pending_reviews === 'number' && c.pending_reviews > 0
      && !codes.has('reviews_pending')) fail('Regel: offene Reviews vorhanden, aber Task reviews_pending fehlt');

  if (typeof c.open_invoices === 'number' && c.open_invoices > 0
      && !codes.has('cfo_open_invoices')) fail('Regel: offene Rechnungen, aber CFO-Warning fehlt');

  if (typeof c.appointments_today === 'number' && c.appointments_today === 0
      && !codes.has('no_appointments_today')) fail('Regel: keine Termine heute, aber Recommendation fehlt');
  if (typeof c.appointments_today === 'number' && c.appointments_today === 0
      && codes.has('no_appointments_today')) ok('Regel: keine Termine heute → Recommendation no_appointments_today vorhanden');
}

async function runScenario() {
  // 1) Unauthentifiziert → 401
  log('Phase 1 · Unauthentifizierte Anfrage');
  const anonJar = newJar();
  const r1 = await http('GET', ENDPOINT, undefined, anonJar);
  if (r1.status === 401) ok(`anonymous GET ${ENDPOINT} → 401`);
  else fail(`anonymous GET ${ENDPOINT} → erwartet 401, erhalten ${r1.status}`);

  // 2) Nicht-Owner → 403
  log('Phase 2 · Nicht-Owner-User');
  const userJar = newJar();
  const reg = await http('POST', '/api/auth/register', {
    email: USER_EMAIL, password: USER_PW,
    first_name: 'Non', last_name: 'Owner',
    practice_name: 'Non-Owner-Praxis-Insights', language: 'de',
  }, userJar);
  if (reg.status !== 201) fail(`Non-Owner-Register: erwartet 201, erhalten ${reg.status}`);
  else ok('Non-Owner-User registriert');

  const r2 = await http('GET', ENDPOINT, undefined, userJar);
  if (r2.status === 403) ok(`non-owner GET ${ENDPOINT} → 403`);
  else fail(`non-owner GET ${ENDPOINT} → erwartet 403, erhalten ${r2.status}`);

  // 3) Owner-Login → 200
  log('Phase 3 · Owner-Login + Schema + Sensiblen-Felder-Scan');
  const ownerJar = newJar();
  const ownerLogin = await http('POST', '/api/auth/login', { email: OWNER_EMAIL, password: OWNER_PW }, ownerJar);
  if (ownerLogin.status !== 200) {
    fail(`Owner-Login: erwartet 200, erhalten ${ownerLogin.status} – ${ownerLogin.raw.slice(0,200)}`);
    return;
  }
  ok('Owner eingeloggt (HTTP 200)');

  const r3 = await http('GET', ENDPOINT, undefined, ownerJar);
  if (r3.status !== 200) { fail(`owner GET ${ENDPOINT} → erwartet 200, erhalten ${r3.status}`); return; }
  ok(`owner GET ${ENDPOINT} → 200`);
  expectInsightsShape(r3.body);
  scanForbidden(ENDPOINT, r3.raw);

  // Idempotenz: zweiter Aufruf liefert identische Werte ohne Side-Effects
  const r3b = await http('GET', ENDPOINT, undefined, ownerJar);
  if (r3b.status === 200
      && r3b.body
      && Array.isArray(r3b.body.tasks)
      && r3b.body.tasks.length === r3.body.tasks.length
      && Array.isArray(r3b.body.warnings)
      && r3b.body.warnings.length === r3.body.warnings.length
      && Array.isArray(r3b.body.recommendations)
      && r3b.body.recommendations.length === r3.body.recommendations.length) {
    ok('Insights: zweiter Aufruf liefert stabiles Ergebnis (keine Mutation)');
  } else {
    fail('Insights: zweiter Aufruf liefert abweichende Ergebnisse oder Fehler');
  }

  // 4) Schreib-Schutz
  log('Phase 4 · Schreib-Schutz auf den Endpoint');
  for (const method of ['POST', 'PUT', 'PATCH', 'DELETE']) {
    const rw = await http(method, ENDPOINT, { hack: 1 }, ownerJar);
    if (rw.status >= 400) ok(`owner ${method} ${ENDPOINT} blockiert (HTTP ${rw.status})`);
    else fail(`owner ${method} ${ENDPOINT} sollte blockiert sein, erhielt ${rw.status}`);
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
