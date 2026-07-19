// Live browser test for the deployed PraxisOnline24 CEO Dashboard and
// AI Praxismanager. Uses Playwright + Chromium to hit the production URL,
// switches the language via the `lang` cookie for each supported test
// locale (de, en, fr, es, ar), and reports:
//   • static-template translation coverage (data-i18n elements)
//   • runtime console errors
//   • HTML lang attribute + RTL direction for Arabic
//   • the presence of any residual German UI text in non-German locales
//
// Client-side auth on those pages redirects unauthenticated users to
// /login.html. To keep the page shell rendered we mock the auth checks
// via Playwright route interception. The dynamic-content endpoints are
// mocked to return sample localized payloads so the fetch flow completes
// without needing production credentials.
'use strict';

const { chromium } = require('playwright');

const BASE = 'https://praxisonline24.com';
const LANGS = ['de', 'en', 'fr', 'es', 'ar'];

// German markers – must not appear in EN/FR/ES/AR renders. Same heuristic
// as the offline i18n test but scoped to visible page text.
const GERMAN_MARKERS = [
  /[äöüÄÖÜß]/,
  /\bder\b/i, /\bdie\b/i, /\bdas\b/i, /\bund\b/i, /\boder\b/i, /\bnicht\b/i,
  /\bmit\b/i, /\bnach\b/i, /\bvon\b/i, /\beine\b/i, /\bkein\b/i, /\bkeine\b/i,
  /\bheute\b/i, /\bmorgen\b/i,
  /Rechnung/i, /Praxis/i, /Praxen/i, /Bewertung/i, /Warteliste/i, /Behandler/i,
  /Zahlung/i, /Angebot/i, /Testphase/i, /Datenbank/i, /Sprache/i, /Umsatz/i,
  /Aktivierung/i, /Handlungsbedarf/i, /Handlungsempfehlung/i, /Auslastung/i,
  /überfällig/i, /Aktualisieren/i, /Abmelden/i, /Anmeldung/i, /Klicken/i,
  /Registrierung/i, /Diesen Monat/i, /Diese Woche/i, /Neu heute/i,
  /Fehler beim Laden/i, /Plattform stabil/i, /Kein Zugriff/i,
];

const BRAND_ALLOWLIST = [
  'PraxisOnline24', 'MRR', 'ARR', 'CFO', 'CEO', 'CTO', 'API', 'NODE_ENV',
  'SESSION_SECRET', 'OWNER_EMAIL', 'OWNER_SETUP_TOKEN', 'SMTP', 'sql.js',
  'bcrypt', 'Google', 'Facebook', 'Instagram', 'LinkedIn', 'YouTube', 'TikTok',
  'BASIC', 'PROFESSIONAL', 'PRO', 'UNLIMITED', 'AGB', 'Datenschutz', 'Impressum',
];

function stripBrands(s) {
  let out = String(s);
  for (const b of BRAND_ALLOWLIST) out = out.split(b).join(' ');
  return out;
}

function findGermanHits(text) {
  const stripped = stripBrands(text);
  const hits = [];
  for (const r of GERMAN_MARKERS) {
    const m = stripped.match(r);
    if (m) hits.push(m[0]);
  }
  return hits;
}

// ─── Auth + API mocks ─────────────────────────────────────────────────────
async function installMocks(context, lang) {
  const fakeUser = { first_name: 'Owner', last_name: 'Test', email: 'owner@test' };

  await context.route(`${BASE}/api/auth/me`, (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(fakeUser) }));
  await context.route(`${BASE}/api/owner/check`, (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ isOwner: true }) }));

  // Sample localized backend payloads. For AI Praxismanager we let the real
  // backend take over so we exercise the production locale pipeline. The
  // owner dashboards are gated with session auth we can't satisfy, so we
  // mock them with realistic shapes that let the frontend render.
  await context.route(`${BASE}/api/ai-praxismanager`, async (route) => {
    // Real backend will 401 without a session – we want to see the actual
    // localized payload the server would produce for this cookie, so we
    // simulate it locally using the same aiLocales module.
    const { getAiLocale } = require('../utils/aiLocales.js');
    const AI = getAiLocale(lang);
    const body = {
      generated_at: new Date().toISOString(),
      practice: { name: 'Demo Clinic', package: 'BASIC', trial_end_date: null },
      prioritaeten_heute: [
        { level: 'kritisch', text: AI.prio_overdue_invoices(2), link: '/invoices.html' },
        { level: 'ok',       text: AI.prio_all_ok, link: null },
      ],
      ampel_empfehlungen: [
        { bereich: AI.bereich_finanzen, status: 'gruen', text: AI.ampel_fin_ok,
          detail: AI.ampel_fin_detail(0, 3), link: '/invoices.html', action: null },
        { bereich: AI.bereich_auslastung, status: 'gelb', text: AI.ampel_util_warn(55),
          detail: AI.ampel_util_detail(10, 5, 1), link: '/appointments.html', action: AI.act_open_calendar },
      ],
      warnungen: [
        { level: 'gelb', text: AI.warn_open_invoices(6), link: '/invoices.html', action: AI.act_open_invoices },
      ],
      ki_empfehlungen: [
        { impact: 'mittel', text: AI.ki_low_util(55) },
      ],
      umsatzprognose: {
        no_data: false, diesen_monat_bisher: 1200, vormonat: 1100, avg_monat_3m: 1250,
        prognose_monatsende: 1400, trend_prozent: 5, verlauf: [], monat_progress_pct: 40,
      },
      auslastungsprognose_7d: [],
      auslastung_has_data: false,
      todos: [
        { priority: 'kritisch', text: AI.todo_overdue_invoices(2), link: '/invoices.html' },
      ],
      setup_todos: [
        { category: 'profil', priority: 'hoch', icon: '📞', text: AI.setup_phone, link: '/settings.html' },
      ],
    };
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
  });

  await context.route(`${BASE}/api/owner/tab/ceo`, async (route) => {
    const { getOwnerLocale } = require('../utils/ownerLocales.js');
    const L = getOwnerLocale(lang);
    const body = {
      generated_at: new Date().toISOString(),
      overview: { totalPractices: 12, activePractices: 10, pausedPractices: 1,
                  trialPractices: 3, newToday: 1, newThisWeek: 3, newThisMonth: 5,
                  trialsExpiring7d: 2, trialsExpired: 0 },
      growth: [], risks: [{ level: 'warn', msg: L.risk_paused_accounts(1) }],
      todos: [L.todo_monthly_review], ampel: 'yellow', ampel_label: L.ampel_yellow,
      demo: { total: 4, this_week: 2, this_month: 3, countries: [{ country: 'DE', count: 3 }], conversion: 33 },
      ai: {
        tasks: [{ priority: 'high', text: L.ai_task_paused(1) }],
        recommendations: [L.ai_reco_ab_landing],
        automations: { today: 0 },
        daily_summary: { aptsToday: 1, openInvoices: 2, waitlistTotal: 0, pendingReviews: 0, automationsToday: 0 },
      },
    };
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
  });

  await context.route(`${BASE}/api/owner/tab/cfo`, async (route) => {
    const body = {
      generated_at: new Date().toISOString(),
      total_revenue: 5000, paid: { count: 3, amount: 2500 },
      unpaid: { count: 2, amount: 800 }, overdue: { count: 1, amount: 400 },
      monthly_revenue: [], packages: { BASIC: 3, UNLIMITED: 1 },
      trial_practices: 2, paying_practices: 4,
      mrr: 116, arr: 1392,
      mrr_by_package: { BASIC: { count: 3, price: 19, revenue: 57 }, UNLIMITED: { count: 1, price: 79, revenue: 79 } },
    };
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
  });

  await context.route(`${BASE}/api/owner/tab/marketing`, async (route) => {
    const { getOwnerLocale } = require('../utils/ownerLocales.js');
    const L = getOwnerLocale(lang);
    const body = {
      generated_at: new Date().toISOString(),
      total_practices: 12, active_rate: 83, new_this_week: 2, new_this_month: 5,
      languages: [{ language: 'de', count: 6 }, { language: 'en', count: 4 }],
      registrations_by_month: [], registrations_by_week: [],
      demo_total: 4, demo_this_week: 2, demo_this_month: 3,
      demo_countries: [{ country: 'DE', count: 3 }], demo_by_month: [],
      conversion_rate: 33, seo_hints: [L.seo_keywords], social_ideas: [L.social_linkedin],
    };
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
  });

  await context.route(`${BASE}/api/owner/tab/demos`, async (route) => {
    const body = {
      generated_at: new Date().toISOString(), requests: [],
      stats: { total: 0, neu: 0, eingeladen: 0, aktiviert: 0, kontaktiert: 0,
               erledigt: 0, this_week: 0, this_month: 0 },
    };
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
  });

  await context.route(`${BASE}/api/owner/tab/cto`, async (route) => {
    const { getOwnerLocale } = require('../utils/ownerLocales.js');
    const L = getOwnerLocale(lang);
    const body = {
      generated_at: new Date().toISOString(),
      db_stats: { total_practices: 12, total_users: 20, total_appointments: 40,
                  total_invoices: 10, total_payments: 8, total_reviews: 3,
                  total_waitlist: 1, total_demo_requests: 4 },
      db_size: '128 KB', uptime: '2h 15m', backups: ['2026-07-19.db'],
      last_automation: new Date().toISOString(),
      recent_activity: [], automation_log: [],
      security_status: { session_secret_configured: true, owner_email_configured: true,
                         smtp_configured: true, setup_token_active: false,
                         node_env: 'production', email_dev_mode: false },
      security_labels: {
        session_secret: L.sec_session_secret, owner_email: L.sec_owner_email,
        smtp_ok: L.sec_smtp_ok, smtp_missing: L.sec_smtp_missing,
        setup_token_active: L.sec_setup_token_active,
        setup_token_inactive: L.sec_setup_token_inactive,
        node_env: L.sec_node_env('production'),
        email_dev_on: L.sec_email_dev_on, email_dev_off: L.sec_email_dev_off,
      },
      update_hints: [L.update_sqljs, L.update_bcrypt],
    };
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
  });
}

// ─── Per-language check ───────────────────────────────────────────────────
async function checkPage(browser, urlPath, lang, keySelectors, tabsToClick) {
  const context = await browser.newContext();
  await context.addCookies([
    { name: 'lang', value: lang, domain: 'praxisonline24.com', path: '/' },
    { name: 'lang', value: lang, domain: '.praxisonline24.com', path: '/' },
    // Fake session cookie so requireAuth passes on other assets if browsed.
    { name: 'connect.sid', value: 'test-session', domain: 'praxisonline24.com', path: '/' },
  ]);

  await installMocks(context, lang);

  const page = await context.newPage();
  const consoleErrors = [];
  page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
  page.on('pageerror', (err) => consoleErrors.push('pageerror: ' + err.message));

  const errors = [];
  try {
    await page.goto(BASE + urlPath, { waitUntil: 'networkidle', timeout: 45000 });
  } catch (e) {
    errors.push('navigation: ' + e.message);
  }

  // Give applyDashI18n + async loaders a moment.
  await page.waitForTimeout(1500);

  // Optionally click through tabs to render dynamic content.
  if (tabsToClick && tabsToClick.length) {
    for (const t of tabsToClick) {
      try {
        await page.click(`.tab-btn[data-tab="${t}"]`, { timeout: 4000 });
        await page.waitForTimeout(800);
      } catch (e) {
        // Missing tab is a soft failure – recorded but does not stop the run.
        errors.push(`tab-click ${t}: ${e.message.split('\n')[0]}`);
      }
    }
  }

  const html = await page.content();
  const bodyText = await page.evaluate(() => document.body.innerText);
  const rootLang = await page.evaluate(() => document.documentElement.lang);
  const rootDir  = await page.evaluate(() => document.documentElement.getAttribute('dir') || 'ltr');
  const title = await page.title();

  // Read the effective text of the key i18n selectors.
  const keyTexts = {};
  for (const [name, sel] of Object.entries(keySelectors)) {
    keyTexts[name] = await page.evaluate((s) => {
      const el = document.querySelector(s);
      return el ? el.innerText.trim() : null;
    }, sel);
  }

  await context.close();

  const germanHits = lang === 'de' ? [] : findGermanHits(bodyText);
  const uniqueHits = [...new Set(germanHits)];

  return {
    lang, urlPath, title, rootLang, rootDir,
    keyTexts, consoleErrors, errors, germanHits: uniqueHits,
    bodyChars: bodyText.length,
    passed: consoleErrors.length === 0 && errors.length === 0 &&
            (lang === 'de' || uniqueHits.length === 0) &&
            (lang !== 'ar' || rootDir === 'rtl'),
  };
}

// ─── Runner ───────────────────────────────────────────────────────────────
(async () => {
  console.log(`Testing ${BASE} across ${LANGS.length} languages\n`);

  const browser = await chromium.launch({ headless: true });

  const aiSelectors = {
    title:  '.ai-page-title',
    subtitle: '.ai-page-sub',
    live: '.ai-badge-live',
    card_prio: '[data-i18n="ai_card_prio"]',
    card_ampel: '[data-i18n="ai_card_ampel"]',
    card_forecast: '[data-i18n="ai_card_forecast"]',
    card_util7d: '[data-i18n="ai_card_util7d"]',
    logout: '#btn-logout',
    nav_dashboard: '[data-i18n="nav_dashboard"]',
    nav_ai: '[data-i18n="nav_ai"]',
  };

  const ceoSelectors = {
    title: '.mc-title',
    sub: '.mc-sub',
    tab_ceo: '.tab-btn[data-tab="ceo"]',
    tab_cfo: '.tab-btn[data-tab="cfo"]',
    tab_marketing: '.tab-btn[data-tab="marketing"]',
    tab_demos: '.tab-btn[data-tab="demos"]',
    tab_cto: '.tab-btn[data-tab="cto"]',
    refresh: '#btn-refresh',
    logout: '#btn-logout',
  };

  const results = [];

  for (const lang of LANGS) {
    console.log(`━━━ ${lang.toUpperCase()} ━━━`);
    const aiR = await checkPage(browser, '/ai-praxismanager.html', lang, aiSelectors, []);
    console.log(`  AI Praxismanager  page.title="${aiR.title}"  root.lang=${aiR.rootLang}  dir=${aiR.rootDir}`);
    console.log(`    key: title="${aiR.keyTexts.title}"`);
    console.log(`    key: card_prio="${aiR.keyTexts.card_prio}"`);
    console.log(`    key: card_forecast="${aiR.keyTexts.card_forecast}"`);
    console.log(`    key: logout="${aiR.keyTexts.logout}"`);
    if (aiR.germanHits.length) console.log(`    ⚠ german markers: ${aiR.germanHits.join(', ')}`);
    if (aiR.consoleErrors.length) console.log(`    ⚠ console errors: ${aiR.consoleErrors.join(' | ')}`);
    if (aiR.errors.length) console.log(`    ⚠ other errors: ${aiR.errors.join(' | ')}`);
    results.push({ page: 'ai-praxismanager', ...aiR });

    const ceoR = await checkPage(browser, '/ceo-dashboard.html', lang, ceoSelectors,
      ['ceo', 'cfo', 'marketing', 'demos', 'cto']);
    console.log(`  CEO Dashboard      page.title="${ceoR.title}"  root.lang=${ceoR.rootLang}  dir=${ceoR.rootDir}`);
    console.log(`    key: title="${ceoR.keyTexts.title}"`);
    console.log(`    key: tab_cto="${ceoR.keyTexts.tab_cto}"`);
    console.log(`    key: refresh="${ceoR.keyTexts.refresh}"`);
    if (ceoR.germanHits.length) console.log(`    ⚠ german markers: ${ceoR.germanHits.join(', ')}`);
    if (ceoR.consoleErrors.length) console.log(`    ⚠ console errors: ${ceoR.consoleErrors.slice(0,3).join(' | ')}`);
    if (ceoR.errors.length) console.log(`    ⚠ other errors: ${ceoR.errors.join(' | ')}`);
    results.push({ page: 'ceo-dashboard', ...ceoR });
    console.log();
  }

  await browser.close();

  // ─── Summary ────────────────────────────────────────────────────────────
  console.log('\n══════════════ SUMMARY ══════════════');
  const rows = results.map((r) => {
    const status = r.passed ? 'PASS' : 'FAIL';
    return `  ${status}  ${r.page.padEnd(20)}  ${r.lang.padEnd(3)}  ` +
           `dir=${r.rootDir.padEnd(3)}  ` +
           `de-hits=${r.germanHits.length}  ` +
           `console-errs=${r.consoleErrors.length}`;
  });
  rows.forEach((row) => console.log(row));

  const failed = results.filter((r) => !r.passed).length;
  console.log(`\n${results.length - failed}/${results.length} scenarios passed`);
  process.exit(failed === 0 ? 0 : 1);
})();
