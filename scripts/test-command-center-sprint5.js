/* eslint-disable */
// Sprint 5 – End-to-End-Test für die vier neuen Read-Only Endpoints des
// CEO Command Centers (Activity Timeline · Notifications · Trends · AI Daily
// Briefing).
//
// Endpoints (alle requireOwner, GET-only):
//   /api/owner/command-center/timeline
//   /api/owner/command-center/notifications
//   /api/owner/command-center/trends
//   /api/owner/command-center/briefing
//
// Prüfungen:
//   • Anonymer Zugriff       → 401 für jeden Endpoint
//   • Nicht-Owner-User       → 403 für jeden Endpoint
//   • Owner                  → 200, Schema-Check, read_only=true
//   • Stabilität             → zweiter Aufruf liefert identische Form
//   • Schreib-Schutz         → POST/PUT/PATCH/DELETE blockiert (>= 400)
//   • PII-Scan               → keine sensiblen Felder im Response-Body
//
// Räumt sämtliche Test-Datensätze nach dem Lauf wieder auf.
//
// Aufruf:   node scripts/test-command-center-sprint5.js
// Exit 0 = alle Checks ok, sonst Exit 1.

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const initSqlJs = require('sql.js');

const TEST_PORT = 3098;
const BASE = `http://127.0.0.1:${TEST_PORT}`;
const STAMP = Date.now();
const OWNER_EMAIL = `cc-s5-owner+${STAMP}@example.test`;
const OWNER_PW    = 'OwnerTest1!S5X';
const USER_EMAIL  = `cc-s5-user+${STAMP}@example.test`;
const USER_PW     = 'NonOwner1!S5X';
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
      SESSION_SECRET: 'test-secret-only-for-sprint5-test',
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
  '/api/owner/command-center/timeline',
  '/api/owner/command-center/notifications',
  '/api/owner/command-center/trends',
  '/api/owner/command-center/briefing',
];

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

function expectReadOnly(label, body) {
  if (body && body.read_only === true) ok(`${label}: read_only-Flag korrekt`);
  else fail(`${label}: read_only !== true`);
}

function expectTimelineShape(body) {
  if (!body || typeof body !== 'object') { fail('Timeline: Antwort kein JSON-Objekt'); return; }
  expectReadOnly('Timeline', body);
  if (typeof body.window_hours === 'number') ok(`Timeline: window_hours=${body.window_hours}`); else fail('Timeline: window_hours fehlt');
  if (typeof body.total_events === 'number') ok(`Timeline: total_events=${body.total_events}`); else fail('Timeline: total_events fehlt');
  if (Array.isArray(body.days)) ok(`Timeline: days ist Array (${body.days.length} Buckets)`);
  else { fail('Timeline: days fehlt oder ist kein Array'); return; }
  for (const d of body.days) {
    if (!d.day || typeof d.count !== 'number' || !Array.isArray(d.events)) {
      fail(`Timeline: Day-Bucket unvollständig: ${JSON.stringify(d).slice(0,80)}`); return;
    }
    for (const ev of d.events) {
      if (!ev.source || !ev.category || typeof ev.at === 'undefined') {
        fail(`Timeline: Event ohne source/category/at: ${JSON.stringify(ev).slice(0,120)}`); return;
      }
    }
  }
  ok('Timeline: Tag-Buckets + Events strukturell vollständig');
}

function expectNotificationsShape(body) {
  if (!body || typeof body !== 'object') { fail('Notifications: Antwort kein JSON-Objekt'); return; }
  expectReadOnly('Notifications', body);
  if (!body.counts || typeof body.counts !== 'object') { fail('Notifications: counts-Block fehlt'); return; }
  for (const k of ['danger', 'warn', 'info', 'total']) {
    if (typeof body.counts[k] !== 'number') { fail(`Notifications: counts.${k} fehlt oder kein number`); return; }
  }
  ok('Notifications: counts-Block vollständig');
  if (!Array.isArray(body.items)) { fail('Notifications: items fehlt oder ist kein Array'); return; }
  const allowed = new Set(['danger', 'warn', 'info']);
  for (const it of body.items) {
    if (!it.code || !it.level || !it.title) { fail(`Notifications: Item ohne code/level/title: ${JSON.stringify(it).slice(0,120)}`); return; }
    if (!allowed.has(it.level))            { fail(`Notifications: Item mit unzulässigem level "${it.level}"`); return; }
  }
  ok(`Notifications: ${body.items.length} Item(s) – Felder + Level korrekt`);
  const sum = body.counts.danger + body.counts.warn + body.counts.info;
  if (sum === body.counts.total && sum === body.items.length) ok('Notifications: counts konsistent mit items');
  else fail(`Notifications: counts (${sum}/${body.counts.total}) inkonsistent zu items (${body.items.length})`);
}

function expectTrendsShape(body) {
  if (!body || typeof body !== 'object') { fail('Trends: Antwort kein JSON-Objekt'); return; }
  expectReadOnly('Trends', body);
  if (body.window_days !== 7) fail(`Trends: window_days !== 7 (war ${body.window_days})`); else ok('Trends: window_days=7');
  if (!body.trends || typeof body.trends !== 'object') { fail('Trends: trends-Block fehlt'); return; }
  const required = ['appointments_booked', 'registrations', 'demo_requests', 'activity_events', 'reviews_received', 'revenue_paid'];
  for (const k of required) {
    const t = body.trends[k];
    if (!t) { fail(`Trends: ${k} fehlt`); return; }
    if (!Array.isArray(t.series_7d) || t.series_7d.length !== 7) { fail(`Trends: ${k}.series_7d falsche Länge`); return; }
    if (!Array.isArray(t.previous_7d) || t.previous_7d.length !== 7) { fail(`Trends: ${k}.previous_7d falsche Länge`); return; }
    if (typeof t.total_7d !== 'number')       { fail(`Trends: ${k}.total_7d fehlt`); return; }
    if (typeof t.delta !== 'number')          { fail(`Trends: ${k}.delta fehlt`); return; }
    if (typeof t.delta_percent !== 'number')  { fail(`Trends: ${k}.delta_percent fehlt`); return; }
    if (!['up', 'down', 'flat'].includes(t.direction)) { fail(`Trends: ${k}.direction ungültig`); return; }
    for (const p of t.series_7d) {
      if (!p.date || typeof p.count !== 'number') { fail(`Trends: ${k}.series_7d enthält ungültigen Punkt`); return; }
    }
  }
  ok(`Trends: alle ${required.length} Trends mit korrektem 7-Tage-Schema`);
}

function expectBriefingShape(body) {
  if (!body || typeof body !== 'object') { fail('Briefing: Antwort kein JSON-Objekt'); return; }
  expectReadOnly('Briefing', body);
  for (const k of ['greeting', 'date', 'mood', 'conclusion']) {
    if (typeof body[k] !== 'string' || !body[k]) { fail(`Briefing: ${k} fehlt oder leer`); return; }
  }
  if (!['critical', 'attention', 'steady', 'calm'].includes(body.mood)) {
    fail(`Briefing: mood ungültig (${body.mood})`); return;
  }
  ok(`Briefing: Greeting + Datum + Mood ("${body.mood}") + Conclusion vorhanden`);
  if (!Array.isArray(body.headlines)) { fail('Briefing: headlines fehlt oder kein Array'); return; }
  if (!Array.isArray(body.priorities)) { fail('Briefing: priorities fehlt oder kein Array'); return; }
  for (const p of body.priorities) {
    if (!p.level || !p.text)             { fail(`Briefing: Priority ohne level/text: ${JSON.stringify(p).slice(0,120)}`); return; }
    if (!['high','medium','low'].includes(p.level)) { fail(`Briefing: Priority-Level ungültig (${p.level})`); return; }
  }
  ok(`Briefing: ${body.headlines.length} Headline(s), ${body.priorities.length} Priorität(en)`);
  if (!body.counters || typeof body.counters !== 'object') fail('Briefing: counters-Block fehlt');
  else ok('Briefing: counters-Block vorhanden');
}

const SHAPE_CHECKS = {
  '/api/owner/command-center/timeline':      expectTimelineShape,
  '/api/owner/command-center/notifications': expectNotificationsShape,
  '/api/owner/command-center/trends':        expectTrendsShape,
  '/api/owner/command-center/briefing':      expectBriefingShape,
};

async function runScenario() {
  // 1) Unauthentifiziert → 401 für alle vier Endpoints
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
    practice_name: 'Non-Owner-Praxis-Sprint5', language: 'de',
  }, userJar);
  if (reg.status !== 201) fail(`Non-Owner-Register: erwartet 201, erhalten ${reg.status}`);
  else ok('Non-Owner-User registriert');

  for (const ep of ENDPOINTS) {
    const r = await http('GET', ep, undefined, userJar);
    if (r.status === 403) ok(`non-owner GET ${ep} → 403`);
    else fail(`non-owner GET ${ep} → erwartet 403, erhalten ${r.status}`);
  }

  // 3) Owner-Login → 200 + Schema + PII-Scan
  log('Phase 3 · Owner-Login + Schema + PII-Scan');
  const ownerJar = newJar();
  const ownerLogin = await http('POST', '/api/auth/login', { email: OWNER_EMAIL, password: OWNER_PW }, ownerJar);
  if (ownerLogin.status !== 200) {
    fail(`Owner-Login: erwartet 200, erhalten ${ownerLogin.status} – ${ownerLogin.raw.slice(0,200)}`);
    return;
  }
  ok('Owner eingeloggt (HTTP 200)');

  const firstResponses = {};
  for (const ep of ENDPOINTS) {
    const r = await http('GET', ep, undefined, ownerJar);
    if (r.status !== 200) { fail(`owner GET ${ep} → erwartet 200, erhalten ${r.status}`); continue; }
    ok(`owner GET ${ep} → 200`);
    SHAPE_CHECKS[ep](r.body);
    scanForbidden(ep, r.raw);
    firstResponses[ep] = r;
  }

  // 4) Stabilität: zweiter Aufruf identisch (keine Mutation)
  log('Phase 4 · Stabilitäts-/Idempotenz-Check');
  for (const ep of ENDPOINTS) {
    if (!firstResponses[ep]) continue;
    const r2 = await http('GET', ep, undefined, ownerJar);
    if (r2.status !== 200) { fail(`owner GET (2nd) ${ep} → ${r2.status}`); continue; }
    // Tiefenvergleich exklusive generated_at (das darf sich ändern).
    const a = JSON.parse(JSON.stringify(firstResponses[ep].body)); delete a.generated_at;
    const b = JSON.parse(JSON.stringify(r2.body));                  delete b.generated_at;
    if (JSON.stringify(a) === JSON.stringify(b)) ok(`Stabilität OK: ${ep}`);
    else fail(`Stabilität verletzt: ${ep} – zweiter Aufruf liefert abweichende Daten`);
  }

  // 5) Schreib-Schutz
  log('Phase 5 · Schreib-Schutz');
  for (const ep of ENDPOINTS) {
    for (const method of ['POST', 'PUT', 'PATCH', 'DELETE']) {
      const rw = await http(method, ep, { hack: 1 }, ownerJar);
      if (rw.status >= 400) ok(`owner ${method} ${ep} blockiert (HTTP ${rw.status})`);
      else fail(`owner ${method} ${ep} sollte blockiert sein, erhielt ${rw.status}`);
    }
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
