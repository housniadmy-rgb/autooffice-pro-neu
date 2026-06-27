// Seeds a test user + appointments, captures 5 calendar screenshots, cleans up.
const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');
const initSqlJs = require('sql.js');

const BASE = 'http://127.0.0.1:3000';
const STAMP = Date.now();
const EMAIL = `shot+${STAMP}@example.test`;
const PW = 'ShotTest1!XX';
const DB_PATH = path.join(__dirname, 'data', 'praxisonline24.db');

class Jar {
  constructor() { this.cookie = ''; }
  consume(sc) {
    if (!sc) return;
    const arr = Array.isArray(sc) ? sc : String(sc).split(/,(?=[^;]+=[^;]+)/);
    const m = new Map();
    if (this.cookie) for (const p of this.cookie.split('; ')) {
      const [k, ...v] = p.split('='); m.set(k, v.join('='));
    }
    for (const s of arr) {
      const f = s.split(';')[0]; const eq = f.indexOf('=');
      if (eq < 0) continue;
      m.set(f.slice(0, eq).trim(), f.slice(eq + 1).trim());
    }
    this.cookie = [...m.entries()].map(([k, v]) => `${k}=${v}`).join('; ');
  }
}

async function http(method, p, body, jar) {
  const headers = { 'Content-Type': 'application/json' };
  if (jar && jar.cookie) headers.Cookie = jar.cookie;
  const r = await fetch(`${BASE}${p}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
  const sc = r.headers.getSetCookie ? r.headers.getSetCookie() : r.headers.get('set-cookie');
  if (jar) jar.consume(sc);
  const text = await r.text();
  let json = null; try { json = JSON.parse(text); } catch {}
  return { status: r.status, body: json, raw: text };
}

function p2(n) { return String(n).padStart(2, '0'); }
function iso(d) { return `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`; }

async function waitForServer(timeoutMs = 10000) {
  const t0 = Date.now();
  while (Date.now() - t0 < timeoutMs) {
    try { const r = await fetch(`${BASE}/api/health`); if (r.ok) return; } catch {}
    await new Promise(r => setTimeout(r, 250));
  }
  throw new Error('Server not reachable');
}

async function seed() {
  const jar = new Jar();
  await http('POST', '/api/auth/register', {
    email: EMAIL, password: PW, first_name: 'Demo', last_name: 'User',
    practice_name: 'Demo-Praxis', language: 'de',
  }, jar);
  const pr = await http('POST', '/api/practitioners', {
    title: 'Dr.', first_name: 'Alex', last_name: 'Müller',
    specialty: 'Allgemeinmedizin', active: true,
  }, jar);
  const prId = pr.body.id;
  const today = new Date();
  const t = iso(today);
  const tmw = new Date(today); tmw.setDate(tmw.getDate() + 1); const t2 = iso(tmw);
  const samples = [
    { d: t,  ti: '09:00', dur: 30, f: 'Anna',   l: 'Beispiel', e: 'anna@example.test',   ty: 'Ersttermin' },
    { d: t,  ti: '10:30', dur: 30, f: 'Bruno',  l: 'Beispiel', e: 'bruno@example.test',  ty: 'Folgetermin' },
    { d: t,  ti: '13:00', dur: 60, f: 'Clara',  l: 'Beispiel', e: 'clara@example.test',  ty: 'Beratung' },
    { d: t,  ti: '15:30', dur: 45, f: 'Dennis', l: 'Beispiel', e: 'dennis@example.test', ty: 'Vorsorge' },
    { d: t2, ti: '10:00', dur: 30, f: 'Eva',    l: 'Beispiel', e: 'eva@example.test',    ty: 'Ersttermin' },
    { d: t2, ti: '14:00', dur: 45, f: 'Frank',  l: 'Beispiel', e: 'frank@example.test',  ty: 'Beratung' },
  ];
  const ids = [];
  for (const a of samples) {
    const r = await http('POST', '/api/appointments', {
      practitioner_id: prId,
      appointment_date: a.d,
      appointment_time: a.ti,
      duration_minutes: a.dur,
      appointment_type: a.ty,
      patient_first_name: a.f,
      patient_last_name: a.l,
      patient_email: a.e,
    }, jar);
    ids.push(r.body.id);
  }
  await http('PUT', `/api/appointments/${ids[0]}`, { status: 'completed' }, jar);
  await http('PUT', `/api/appointments/${ids[2]}`, { status: 'noshow' }, jar);
}

async function cleanup() {
  if (!fs.existsSync(DB_PATH)) return;
  try {
    const wasm = fs.readFileSync(path.join(__dirname, 'node_modules/sql.js/dist/sql-wasm.wasm'));
    const SQL = await initSqlJs({ wasmBinary: wasm });
    const db = new SQL.Database(fs.readFileSync(DB_PATH));
    db.run('PRAGMA foreign_keys = ON');
    const s = db.prepare('SELECT id, practice_id FROM users WHERE LOWER(email) = LOWER(?)');
    s.bind([EMAIL]); let u = null; if (s.step()) u = s.getAsObject(); s.free();
    if (u) {
      db.run('DELETE FROM appointments WHERE practice_id = ?', [u.practice_id]);
      db.run('DELETE FROM practitioners WHERE practice_id = ?', [u.practice_id]);
      db.run('DELETE FROM password_reset_tokens WHERE user_id = ?', [u.id]);
      db.run('DELETE FROM invite_tokens WHERE user_id = ?', [u.id]);
      db.run('DELETE FROM users WHERE id = ?', [u.id]);
      if (u.practice_id) {
        const c = db.prepare('SELECT COUNT(*) AS c FROM users WHERE practice_id = ?');
        c.bind([u.practice_id]); c.step(); const n = c.getAsObject().c; c.free();
        if (n === 0) db.run('DELETE FROM practices WHERE id = ?', [u.practice_id]);
      }
      fs.writeFileSync(DB_PATH, Buffer.from(db.export()));
    }
    db.close();
  } catch (e) { console.log('cleanup warn:', e.message); }
}

async function takeShots() {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ baseURL: BASE, colorScheme: 'light', viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/login.html`);
  await page.fill('#email', EMAIL);
  await page.fill('#password', PW);
  await page.click('button[type="submit"]');
  await page.waitForURL(/dashboard\.html/);
  await page.goto(`${BASE}/appointments.html`);
  await page.waitForLoadState('networkidle');

  // 1) Monatsansicht (Default-View)
  await page.screenshot({ path: path.join(__dirname, 'screenshots-cal/01-monatsansicht.png') });

  // 2) Wochenansicht
  await page.locator('.pcal-view-tab[data-view="week"]').click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(__dirname, 'screenshots-cal/02-wochenansicht.png') });

  // 3) Tagesansicht
  await page.locator('.pcal-view-tab[data-view="day"]').click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(__dirname, 'screenshots-cal/03-tagesansicht.png') });

  // 4) Termin-Detail-Drawer (in Tagesansicht ersten Termin klicken)
  await page.locator('#view-day .pcal-time-block').first().click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(__dirname, 'screenshots-cal/04-detail-drawer.png') });

  // 5) Mobile (390 × 800, Monatsansicht mit ausgeklapptem Filter-Slide-in)
  await page.locator('#btn-close-detail').click();
  await page.waitForTimeout(200);
  await page.setViewportSize({ width: 390, height: 800 });
  await page.locator('.pcal-view-tab[data-view="month"]').click();
  await page.waitForTimeout(300);
  await page.locator('#btn-toggle-filters').click();
  await page.waitForTimeout(350);
  await page.screenshot({ path: path.join(__dirname, 'screenshots-cal/05-mobile-slide-in.png') });

  await browser.close();
}

(async () => {
  fs.mkdirSync(path.join(__dirname, 'screenshots-cal'), { recursive: true });
  await waitForServer();
  await seed();
  try { await takeShots(); }
  finally { await cleanup(); }
  console.log('shots done');
})();
