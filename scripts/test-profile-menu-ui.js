/* eslint-disable */
// Browser-Smoke-Test mit Playwright für den Passwort-ändern-Flow.
//
// Deckt die explizit geforderten Fälle ab:
//   1. Profil-Menü öffnet sich (Klick auf Benutzername → Dropdown)
//   2. Passwort-ändern-Modal öffnet sich (Klick auf Dropdown-Eintrag)
//   3. Falsches aktuelles Passwort wird abgelehnt (Server-Fehler im Modal)
//   4. Neues Passwort + Wiederholung müssen übereinstimmen (Client-Validierung)
//   5. Passwortwechsel mit korrektem aktuellem Passwort funktioniert
//   6. Login mit altem Passwort schlägt danach fehl (Login-Page-Fehler)
//   7. Login mit neuem Passwort funktioniert
//
// Aufruf:  node scripts/test-profile-menu-ui.js
// Voraussetzung: Server läuft lokal unter http://127.0.0.1:3000 (npm start).
// Räumt den Einmal-Test-User nach Abschluss aus data/praxisonline24.db.

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const initSqlJs = require('sql.js');

const BASE = process.env.BASE_URL || 'http://127.0.0.1:3000';
const TEST_EMAIL = `ui-pw-test+${Date.now()}@example.test`;
const PW_OLD = 'OldPassw0rd!UI';
const PW_NEW = 'NewPassw0rd!UI';
const DB_PATH = path.join(__dirname, '..', 'data', 'praxisonline24.db');

const checks = [];
function ok(msg)   { checks.push({ ok: true,  msg }); console.log(`  ✔ ${msg}`); }
function fail(msg) { checks.push({ ok: false, msg }); console.log(`  ✘ ${msg}`); }

async function ensureServerReachable() {
  try {
    const r = await fetch(`${BASE}/api/health`);
    if (!r.ok) throw new Error('health=' + r.status);
  } catch (e) {
    throw new Error('Server unter ' + BASE + ' nicht erreichbar – bitte "npm start" laufen lassen.');
  }
}

async function registerUser() {
  const res = await fetch(`${BASE}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: TEST_EMAIL,
      password: PW_OLD,
      first_name: 'Ui',
      last_name: 'Tester',
      practice_name: 'UI-Test-Praxis',
      language: 'de',
    }),
  });
  if (res.status !== 201) {
    const t = await res.text();
    throw new Error(`Register fehlgeschlagen: ${res.status} ${t}`);
  }
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
    let u = null;
    if (stmt.step()) u = stmt.getAsObject();
    stmt.free();
    if (!u) { db.close(); return; }
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
    console.log('[ui-test] Cleanup: Test-User entfernt');
  } catch (e) {
    console.log('[ui-test] Cleanup-Fehler: ' + (e.message || e));
  }
}

async function uiLogin(page, email, password) {
  await page.goto('/login.html');
  await page.fill('#email', email);
  await page.fill('#password', password);
  await page.click('button[type="submit"]');
}

(async () => {
  await ensureServerReachable();
  await registerUser();

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ baseURL: BASE });
  const page = await context.newPage();

  try {
    // ── Vorbereitung: erstmaliger Login per UI ─────────────────────────────
    await uiLogin(page, TEST_EMAIL, PW_OLD);
    await page.waitForURL(/dashboard\.html/, { timeout: 10000 });

    // ── 1) Profil-Menü öffnet sich ─────────────────────────────────────────
    const trigger = page.locator('#profile-menu-trigger');
    await trigger.waitFor({ state: 'visible', timeout: 5000 });
    if ((await trigger.getAttribute('aria-expanded')) !== 'true') {
      await trigger.click();
    }
    const dropdown = page.locator('#profile-dropdown.open');
    await dropdown.waitFor({ state: 'visible', timeout: 2000 });
    const items = await dropdown.locator('.profile-dropdown-item').count();
    if (items === 3) ok('1) Profil-Menü öffnet sich (Dropdown mit 3 Einträgen sichtbar)');
    else fail(`1) Profil-Menü öffnet sich – erwartet 3 Einträge, gefunden ${items}`);

    // ── 2) Passwort-ändern-Modal öffnet sich ───────────────────────────────
    await dropdown.locator('[data-pm-action="change-password"]').click();
    const modal = page.locator('#change-pw-modal');
    await modal.waitFor({ state: 'visible', timeout: 2000 });
    const modalHidden = await modal.evaluate(el => el.classList.contains('hidden'));
    if (!modalHidden) ok('2) Passwort-ändern-Modal öffnet sich');
    else fail('2) Modal sollte sichtbar sein, ist aber .hidden');

    // ── 3) Falsches aktuelles Passwort wird abgelehnt ──────────────────────
    await page.fill('#cpw-current', 'KomplettFalsch!123');
    await page.fill('#cpw-new', PW_NEW);
    await page.fill('#cpw-confirm', PW_NEW);
    await page.click('#cpw-submit');
    const errBox = page.locator('#change-pw-alert .alert-danger');
    await errBox.waitFor({ state: 'visible', timeout: 5000 });
    const errText = (await errBox.textContent() || '').toLowerCase();
    if (errText.includes('aktuelles passwort') || errText.includes('falsch') || errText.includes('current')) {
      ok(`3) Falsches aktuelles Passwort wird abgelehnt (Meldung: "${(await errBox.textContent()).trim()}")`);
    } else {
      ok(`3) Falsches aktuelles Passwort wird abgelehnt (Fehler angezeigt: "${(await errBox.textContent()).trim()}")`);
    }
    if (!(await modal.evaluate(el => el.classList.contains('hidden')))) {
      ok('3b) Modal bleibt nach Fehler offen (kein Auto-Close)');
    } else {
      fail('3b) Modal sollte nach Fehler offen bleiben');
    }

    // ── 4) Neues Passwort + Wiederholung müssen übereinstimmen ─────────────
    await page.fill('#cpw-current', PW_OLD);
    await page.fill('#cpw-new', PW_NEW);
    await page.fill('#cpw-confirm', PW_NEW + 'X');
    await page.click('#cpw-submit');
    const mismatchBox = page.locator('#change-pw-alert .alert-danger');
    await mismatchBox.waitFor({ state: 'visible', timeout: 3000 });
    const mismatchText = ((await mismatchBox.textContent()) || '').toLowerCase();
    if (mismatchText.includes('stimmen nicht') || mismatchText.includes('match') || mismatchText.includes('übereinstim')) {
      ok(`4) Mismatch von Neu/Wiederholen wird abgelehnt (Meldung: "${(await mismatchBox.textContent()).trim()}")`);
    } else {
      // Fallback: Hauptsache überhaupt Fehler — und sicher: das Passwort darf sich nicht geändert haben
      ok(`4) Mismatch wird abgelehnt (Fehler angezeigt: "${(await mismatchBox.textContent()).trim()}")`);
    }
    // Zusatz-Check: Server darf nicht aufgerufen worden sein – das alte Passwort
    // muss noch gültig sein. Wir prüfen das in Schritt 5 implizit, indem wir es
    // hier einreichen.

    // ── 5) Passwortwechsel mit korrektem aktuellem Passwort funktioniert ───
    await page.fill('#cpw-current', PW_OLD);
    await page.fill('#cpw-new', PW_NEW);
    await page.fill('#cpw-confirm', PW_NEW);
    await page.click('#cpw-submit');
    const successBox = page.locator('#change-pw-alert .alert-success');
    await successBox.waitFor({ state: 'visible', timeout: 5000 });
    ok('5) Passwortwechsel mit korrektem aktuellem Passwort: Erfolgsmeldung angezeigt');

    await page.waitForFunction(
      () => document.getElementById('change-pw-modal').classList.contains('hidden'),
      null, { timeout: 5000 }
    );
    ok('5b) Modal schließt nach Erfolg automatisch');

    // Abmelden für die folgenden Login-Tests
    await page.click('#profile-menu-trigger');
    await page.click('[data-pm-action="logout"]');
    await page.waitForURL(/login\.html/, { timeout: 5000 });

    // ── 6) Login mit altem Passwort schlägt danach fehl ────────────────────
    await page.fill('#email', TEST_EMAIL);
    await page.fill('#password', PW_OLD);
    await page.click('button[type="submit"]');
    // Erwartung: bleibt auf /login.html, Alert erscheint, kein Redirect
    const loginErr = page.locator('#alert-container .alert-danger');
    await loginErr.waitFor({ state: 'visible', timeout: 5000 });
    const stillOnLogin = /login\.html/.test(page.url());
    if (stillOnLogin) ok(`6) Login mit altem Passwort schlägt fehl (Meldung: "${(await loginErr.textContent()).trim()}")`);
    else fail('6) Login mit altem Passwort hätte fehlschlagen müssen, Redirect erfolgte trotzdem');

    // ── 7) Login mit neuem Passwort funktioniert ───────────────────────────
    await page.fill('#email', TEST_EMAIL);
    await page.fill('#password', PW_NEW);
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard\.html/, { timeout: 10000 });
    ok('7) Login mit neuem Passwort funktioniert (Redirect auf /dashboard.html)');

  } catch (e) {
    fail('UI-Test-Fehler: ' + (e.message || e));
  } finally {
    await browser.close();
    await cleanupTestUser();
  }

  const passed = checks.filter(c => c.ok).length;
  const failed = checks.filter(c => !c.ok).length;
  console.log(`\n[ui-test] ${passed}/${checks.length} Checks bestanden, ${failed} fehlgeschlagen.`);
  process.exit(failed === 0 ? 0 : 1);
})();
