/* eslint-disable */
// Lokaler End-to-End-Test für die Passwort-Ändern-Funktion.
//
// Ablauf:
//   1. Startet den App-Server als Kindprozess auf einem Test-Port.
//   2. Legt per /api/auth/register einen Test-User mit Passwort A an.
//   3. Loggt sich neu mit Passwort A ein           → muss 200 OK liefern.
//   4. Ändert das Passwort A → B per PUT /api/auth/password.
//   5. Loggt sich erneut mit altem Passwort A ein  → muss 401 liefern.
//   6. Loggt sich mit neuem Passwort B ein         → muss 200 OK liefern.
//   7. Stoppt den Server und räumt den Test-User aus der DB.
//
// Aufruf:   node scripts/test-password-change.js
// Exit 0 = alle Checks ok, Exit 1 = mindestens ein Check fehlgeschlagen.
//
// Wichtig: läuft strikt lokal, schreibt nichts ins Git, deployt nichts.

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const initSqlJs = require('sql.js');

const TEST_PORT = 3099;
const BASE = `http://127.0.0.1:${TEST_PORT}`;
const TEST_EMAIL = `pw-test+${Date.now()}@example.test`;
const PW_OLD = 'OldPassw0rd!XYZ';
const PW_NEW = 'NewPassw0rd!XYZ';
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
    try {
      const r = await fetch(`${BASE}/api/health`);
      if (r.ok) return;
    } catch {}
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
      SESSION_SECRET: 'test-secret-only-for-pw-change-test',
      APP_URL: BASE,
      // Deaktiviert Mailversand (existiert keine Mail-Server-Konfiguration) –
      // utils/email behandelt fehlende Konfig still, also nichts weiter nötig.
    };
    serverProc = spawn('node', ['server.js'], {
      cwd: path.join(__dirname, '..'),
      env,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let started = false;
    serverProc.stdout.on('data', (buf) => {
      const s = buf.toString();
      if (!started && /läuft auf http/.test(s)) {
        started = true;
        resolve();
      }
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
    setTimeout(() => {
      try { serverProc.kill('SIGKILL'); } catch {}
      resolve();
    }, 4000);
  });
}

// Mini-Cookie-Jar: speichert pro Session den Cookie-Header.
function newJar() {
  return {
    cookie: '',
    absorb(setCookieHeader) {
      if (!setCookieHeader) return;
      // raw -> string[] (Node 18 returns combined string)
      const arr = Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader];
      const map = new Map();
      // bestehende Cookies parsen
      if (this.cookie) {
        for (const part of this.cookie.split('; ')) {
          const i = part.indexOf('=');
          if (i > 0) map.set(part.slice(0, i), part.slice(i + 1));
        }
      }
      for (const sc of arr) {
        const first = sc.split(';')[0];
        const i = first.indexOf('=');
        if (i > 0) map.set(first.slice(0, i).trim(), first.slice(i + 1).trim());
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
  let json = null;
  try { json = text ? JSON.parse(text) : null; } catch { /* not json */ }
  return { status: res.status, body: json, raw: text };
}

async function runScenario() {
  // 1) User registrieren
  log(`Test-User registrieren: ${TEST_EMAIL}`);
  const jar1 = newJar();
  const reg = await http('POST', '/api/auth/register', {
    email: TEST_EMAIL,
    password: PW_OLD,
    first_name: 'Pw',
    last_name: 'Test',
    practice_name: 'Pw-Test-Praxis',
    language: 'de',
  }, jar1);
  if (reg.status !== 201) {
    fail(`Register: erwartet 201, erhalten ${reg.status} – ${reg.raw.slice(0, 200)}`);
    return;
  }
  ok('Register: Account angelegt (HTTP 201)');

  // 2) Frisch einloggen mit ALTEM Passwort → muss 200 sein
  const jar2 = newJar();
  const login1 = await http('POST', '/api/auth/login', { email: TEST_EMAIL, password: PW_OLD }, jar2);
  if (login1.status === 200) ok('Login mit altem Passwort: erfolgreich (HTTP 200)');
  else fail(`Login mit altem Passwort: erwartet 200, erhalten ${login1.status} – ${login1.raw.slice(0, 200)}`);

  // 3) Passwort ändern – verwendet die Session aus jar2
  const change = await http('PUT', '/api/auth/password', {
    current_password: PW_OLD,
    new_password: PW_NEW,
  }, jar2);
  if (change.status === 200 && change.body && change.body.success === true) {
    ok('Passwort ändern: HTTP 200 + {success:true}');
  } else {
    fail(`Passwort ändern: erwartet 200, erhalten ${change.status} – ${change.raw.slice(0, 200)}`);
  }

  // 3b) /api/auth/me während derselben Session – Session muss bestehen bleiben
  const me = await http('GET', '/api/auth/me', undefined, jar2);
  if (me.status === 200 && me.body && me.body.email === TEST_EMAIL.toLowerCase()) {
    ok('Session bleibt nach Passwortwechsel bestehen (/api/auth/me liefert User)');
  } else {
    fail(`Session nach Passwortwechsel: /api/auth/me erwartet 200, erhalten ${me.status}`);
  }

  // 4) Neue Session, mit ALTEM Passwort einloggen → muss 401 liefern
  const jar3 = newJar();
  const login2 = await http('POST', '/api/auth/login', { email: TEST_EMAIL, password: PW_OLD }, jar3);
  if (login2.status === 401) ok('Login mit altem Passwort nach Wechsel: korrekt abgewiesen (HTTP 401)');
  else fail(`Login mit altem Passwort nach Wechsel: erwartet 401, erhalten ${login2.status} – ${login2.raw.slice(0, 200)}`);

  // 5) Neue Session, mit NEUEM Passwort einloggen → muss 200 liefern
  const jar4 = newJar();
  const login3 = await http('POST', '/api/auth/login', { email: TEST_EMAIL, password: PW_NEW }, jar4);
  if (login3.status === 200) ok('Login mit neuem Passwort: erfolgreich (HTTP 200)');
  else fail(`Login mit neuem Passwort: erwartet 200, erhalten ${login3.status} – ${login3.raw.slice(0, 200)}`);

  // 6) Fehlerfälle: falsches aktuelles Passwort beim Ändern
  const jar5 = newJar();
  await http('POST', '/api/auth/login', { email: TEST_EMAIL, password: PW_NEW }, jar5);
  const wrongCurrent = await http('PUT', '/api/auth/password', {
    current_password: 'völligFalsch123!',
    new_password: 'AnderesPasswort1!',
  }, jar5);
  if (wrongCurrent.status === 401) ok('Passwort ändern mit falschem aktuellem Passwort: korrekt abgelehnt (HTTP 401)');
  else fail(`Passwort ändern mit falschem aktuellem Passwort: erwartet 401, erhalten ${wrongCurrent.status}`);

  // 7) Fehlerfälle: zu kurzes neues Passwort
  const tooShort = await http('PUT', '/api/auth/password', {
    current_password: PW_NEW,
    new_password: 'kurz',
  }, jar5);
  if (tooShort.status === 400) ok('Passwort ändern mit zu kurzem neuem Passwort: korrekt abgelehnt (HTTP 400)');
  else fail(`Passwort ändern mit zu kurzem neuem Passwort: erwartet 400, erhalten ${tooShort.status}`);
}

async function cleanupTestUser() {
  if (!fs.existsSync(DB_PATH)) return;
  try {
    const wasm = fs.readFileSync(path.join(__dirname, '..', 'node_modules/sql.js/dist/sql-wasm.wasm'));
    const SQL = await initSqlJs({ wasmBinary: wasm });
    const db = new SQL.Database(fs.readFileSync(DB_PATH));
    db.run('PRAGMA foreign_keys = ON');

    const stmt = db.prepare('SELECT id, practice_id FROM users WHERE LOWER(email) = LOWER(?)');
    stmt.bind([TEST_EMAIL]);
    let user = null;
    if (stmt.step()) user = stmt.getAsObject();
    stmt.free();
    if (!user) { log('Cleanup: kein Test-User in DB gefunden'); db.close(); return; }

    db.run('DELETE FROM password_reset_tokens WHERE user_id = ?', [user.id]);
    db.run('DELETE FROM invite_tokens WHERE user_id = ?', [user.id]);
    db.run('DELETE FROM users WHERE id = ?', [user.id]);
    if (user.practice_id) {
      // Praxis nur löschen, wenn keine weiteren User dran hängen
      const cnt = db.prepare('SELECT COUNT(*) AS c FROM users WHERE practice_id = ?');
      cnt.bind([user.practice_id]);
      cnt.step();
      const c = cnt.getAsObject().c;
      cnt.free();
      if (c === 0) db.run('DELETE FROM practices WHERE id = ?', [user.practice_id]);
    }
    const data = db.export();
    fs.writeFileSync(DB_PATH, Buffer.from(data));
    db.close();
    log('Cleanup: Test-User entfernt');
  } catch (e) {
    log('Cleanup-Fehler (nicht kritisch): ' + (e.message || e));
  }
}

(async () => {
  log(`Starte Server auf Port ${TEST_PORT}…`);
  try {
    await startServer();
    await waitForServer();
    log('Server bereit – führe Tests aus.');
    await runScenario();
  } catch (e) {
    fail('Fataler Testfehler: ' + (e.message || e));
  } finally {
    await stopServer();
    await cleanupTestUser();
  }

  const passed = checks.filter(c => c.ok).length;
  const failed = checks.filter(c => !c.ok).length;
  console.log(`\n[test] ${passed}/${checks.length} Checks bestanden, ${failed} fehlgeschlagen.`);
  process.exit(failed === 0 ? 0 : 1);
})();
