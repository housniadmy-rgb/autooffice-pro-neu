// Regression tests for internationalisation of the AI Praxismanager and the
// CEO / CFO / Marketing / CTO Management Center dashboards.
//
// The tests deliberately stay dependency-free: they use Node's built-in
// `node:assert` module so they run under any Node 18+ install with a single
// `node tests/i18n-owner-ai.test.js` invocation. No test framework required.
//
// What we protect against:
//   1. `utils/ownerLocales.js` (owner dashboards backend) must return
//      strings free of German-only characters for EN and FR.
//   2. `utils/aiLocales.js` (AI Praxismanager backend) must do the same.
//   3. `public/js/ceo-i18n.js` (frontend keys for Management Center) must
//      contain no residual German literals in the EN or FR blocks.
//   4. The static HTML files `public/ai-praxismanager.html` and
//      `public/ceo-dashboard.html` must not contain new hard-coded German
//      UI strings outside `data-i18n` fallbacks and the German dictionary
//      blocks.

'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');

// A pragmatic “this is German-looking” heuristic. We look for umlauts and a
// short list of high-signal German-only words that would never appear in an
// English or French sentence. Anything that trips this in an EN/FR string is
// a fail.
const GERMAN_UMLAUTS = /[äöüÄÖÜß]/;
// The markers below are chosen to be German-unique. We deliberately avoid
// words that share a stem with a French cognate (e.g. `Termin` clashes with
// FR `terminer`, `Kontakt` with FR `contact`). Umlauts alone catch the bulk
// of leaks; the phrase-level markers below catch the umlaut-free German UI
// strings we historically hard-coded.
const GERMAN_MARKERS = [
  // German function words / articles / prepositions
  /\bder\b/i, /\bdie\b/i, /\bdas\b/i, /\bund\b/i, /\boder\b/i, /\bnicht\b/i,
  /\bmit\b/i, /\bnach\b/i, /\bvon\b/i, /\bzu\b/i, /\beine\b/i, /\bkein\b/i,
  /\bkeine\b/i, /\bnoch\b/i, /\bheute\b/i, /\bmorgen\b/i,
  // German-only high-signal noun stems (no French/English cognate).
  /Rechnung/i, /Rechnungen/i, /Praxis/i, /Praxen/i, /Bewertung/i, /Bewertungen/i,
  /Warteliste/i, /Behandler/i, /Zahlung/i, /Zahlungen/i, /Angebot/i, /Angebote/i,
  /Testphase/i, /Trial-Ende/i, /Datenbank/i, /Sprache/i, /Sprachen/i,
  /Umsatz/i, /Aktivierung/i, /Verwaltung/i, /Neuregistrierung/i, /Neuanmeldung/i,
  /Handlungsbedarf/i, /Handlungsempfehlung/i, /Auslastung/i, /überfällig/i,
  /Aktualisieren/i, /Abmelden/i, /Anmeldung/i, /Klicken/i, /Registrierung/i,
  /Diesen Monat/i, /Diese Woche/i, /Neu heute/i,
  // Phrase-level markers (safe against FR/EN overlap).
  /Fehler beim Laden/i, /Plattform stabil/i, /Kein Zugriff/i,
];

// Words that are ambiguous between languages (e.g. "Instagram", "Google",
// "Facebook", "LinkedIn", "PraxisOnline24", technical identifiers, etc.).
// We allow them everywhere.
const BRAND_ALLOWLIST = [
  'PraxisOnline24', 'MRR', 'ARR', 'CFO', 'CEO', 'CTO', 'API', 'NODE_ENV',
  'SESSION_SECRET', 'OWNER_EMAIL', 'OWNER_SETUP_TOKEN', 'SMTP', 'sql.js',
  'bcrypt', 'Google', 'Facebook', 'Instagram', 'LinkedIn', 'YouTube',
  'TikTok', 'BASIC', 'PROFESSIONAL', 'PRO', 'UNLIMITED',
];

function stripBrands(s) {
  let out = String(s);
  for (const b of BRAND_ALLOWLIST) {
    out = out.split(b).join(' ');
  }
  return out;
}

function looksGerman(str) {
  const stripped = stripBrands(str);
  if (GERMAN_UMLAUTS.test(stripped)) return true;
  return GERMAN_MARKERS.some((r) => r.test(stripped));
}

// Walk a dictionary object recursively and return every leaf string, evaluating
// function-typed leaves with sample arguments so we exercise the interpolation
// branches too.
function collectStrings(dict) {
  const out = [];
  const sampleArgs = [3, '2026-08-01', 4.5, 12, 30];
  for (const key of Object.keys(dict)) {
    const v = dict[key];
    if (typeof v === 'string') {
      out.push({ key, value: v });
    } else if (typeof v === 'function') {
      try {
        const evaluated = v.apply(null, sampleArgs.slice(0, v.length || 1));
        out.push({ key, value: String(evaluated) });
      } catch {
        // Ignore functions we cannot invoke with dummy args.
      }
    }
  }
  return out;
}

function assertNoGerman(strings, lang, source) {
  const bad = strings.filter((s) => looksGerman(s.value));
  if (bad.length > 0) {
    const preview = bad.slice(0, 5).map((s) => `  ${s.key}: ${s.value}`).join('\n');
    throw new Error(
      `${source} contains German-looking text in '${lang}' locale (${bad.length} hits):\n${preview}`
    );
  }
}

// ── Test 1: utils/ownerLocales.js (backend) ───────────────────────────────
function testOwnerLocales() {
  const { OWNER_LOCALES, getOwnerLocale } = require(path.join(ROOT, 'utils', 'ownerLocales.js'));

  assert.ok(OWNER_LOCALES.de, 'German owner locale exists');
  assert.ok(OWNER_LOCALES.en, 'English owner locale exists');
  assert.ok(OWNER_LOCALES.fr, 'French owner locale exists');

  // Every locale must expose the same key surface as German.
  const deKeys = Object.keys(OWNER_LOCALES.de);
  for (const lang of Object.keys(OWNER_LOCALES)) {
    for (const k of deKeys) {
      assert.ok(OWNER_LOCALES[lang][k] !== undefined,
        `owner locale '${lang}' is missing key '${k}'`);
    }
  }

  // German must contain German markers – otherwise our heuristic is off.
  const deStrings = collectStrings(OWNER_LOCALES.de);
  const germanCount = deStrings.filter((s) => looksGerman(s.value)).length;
  assert.ok(germanCount > 5,
    `sanity check: at least a few German entries should match German heuristics (got ${germanCount})`);

  // English and French must never look German.
  assertNoGerman(collectStrings(OWNER_LOCALES.en), 'en', 'utils/ownerLocales.js');
  assertNoGerman(collectStrings(OWNER_LOCALES.fr), 'fr', 'utils/ownerLocales.js');

  // Unknown language falls back to en.
  const unknown = getOwnerLocale('xx');
  assert.equal(unknown, OWNER_LOCALES.en, 'unknown language falls back to English');
}

// ── Test 2: utils/aiLocales.js (backend) ──────────────────────────────────
function testAiLocales() {
  const { AI_LOCALES, getAiLocale } = require(path.join(ROOT, 'utils', 'aiLocales.js'));

  assert.ok(AI_LOCALES.en, 'English AI locale exists');
  assert.ok(AI_LOCALES.fr, 'French AI locale exists');

  assertNoGerman(collectStrings(AI_LOCALES.en), 'en', 'utils/aiLocales.js');
  assertNoGerman(collectStrings(AI_LOCALES.fr), 'fr', 'utils/aiLocales.js');

  const unknown = getAiLocale('xx');
  assert.equal(unknown, AI_LOCALES.en, 'unknown AI language falls back to English');
}

// ── Test 3: public/js/ceo-i18n.js (frontend) ──────────────────────────────
function testCeoI18nFrontend() {
  // Simulate the browser environment for the IIFE and read the merged
  // DASH_T dictionary afterwards.
  const dashPath = path.join(ROOT, 'public', 'js', 'dashboard-i18n.js');
  const ceoPath  = path.join(ROOT, 'public', 'js', 'ceo-i18n.js');

  const dashSrc = fs.readFileSync(dashPath, 'utf8');
  const ceoSrc  = fs.readFileSync(ceoPath, 'utf8');

  const fakeWindow = {};
  const fakeDoc = {
    cookie: '',
    documentElement: { lang: 'en', setAttribute() {}, removeAttribute() {} },
    querySelectorAll: () => [],
    getElementById: () => null,
    readyState: 'complete',
    addEventListener: () => {},
  };

  // eslint-disable-next-line no-new-func
  const runner = new Function('window', 'document', 'console',
    dashSrc + '\n' + ceoSrc + '\nreturn window;');
  const w = runner(fakeWindow, fakeDoc, console);

  assert.ok(w.DASH_T, 'DASH_T is populated');
  assert.ok(w.DASH_T.en, 'DASH_T.en is populated');
  assert.ok(w.DASH_T.fr, 'DASH_T.fr is populated');
  assert.ok(w.DASH_T.en.ceo_ampel_green, 'ceo_ampel_green exists in EN');
  assert.ok(w.DASH_T.fr.ceo_ampel_green, 'ceo_ampel_green exists in FR');

  // The keys we specifically added must not be German in EN/FR.
  const OUR_KEYS = [
    'ceo_ampel_green', 'ceo_ampel_yellow', 'ceo_ampel_red',
    'ceo_tab_ceo', 'ceo_tab_cfo', 'ceo_tab_marketing', 'ceo_tab_demos', 'ceo_tab_cto',
    'ceo_kpi_total', 'ceo_kpi_active', 'ceo_kpi_paused',
    'ceo_demo_none', 'ceo_no_data', 'ceo_no_risks',
    'ceo_ai_pm', 'ceo_ai_pl', 'ceo_ai_tasks', 'ceo_ai_recos',
    'cfo_mrr_by_pkg', 'cfo_invoice_overview', 'cfo_no_paying',
    'mkt_registrations', 'mkt_conv_gut', 'mkt_conv_mittel', 'mkt_conv_niedrig',
    'demo_all_requests', 'demo_no_requests_yet',
    'cto_security', 'cto_server_db', 'cto_last_activity',
    'err_load_data',
  ];

  for (const lang of ['en', 'fr']) {
    const slice = OUR_KEYS.map((k) => ({ key: k, value: String(w.DASH_T[lang][k] || '') }));
    assertNoGerman(slice, lang, `public/js/ceo-i18n.js (DASH_T.${lang})`);
  }
}

// ── Test 4: static HTML free of stray German literals ─────────────────────
function testHtmlPagesFreeOfHardcodedGerman() {
  const pages = ['public/ai-praxismanager.html', 'public/ceo-dashboard.html'];

  // Extract visible text nodes only. This is a small, approximate parser: it
  // strips `<script>`, `<style>` and HTML comments, then trims whitespace.
  // We also drop the inner text of any element that has a `data-i18n`
  // attribute, because those texts are static German fallbacks that
  // dashboard-i18n.js overwrites with the translated string on load.
  function extractText(html) {
    return html
      .replace(/<script[\s\S]*?<\/script>/g, ' ')
      .replace(/<style[\s\S]*?<\/style>/g, ' ')
      .replace(/<!--[\s\S]*?-->/g, ' ')
      // Strip inner text of any element carrying data-i18n / data-i18n-ph /
      // data-i18n-title (they are replaced by dT() at runtime).
      .replace(/<([a-zA-Z][a-zA-Z0-9]*)([^>]*?\bdata-i18n[a-zA-Z-]*="[^"]+"[^>]*)>([\s\S]*?)<\/\1>/g,
               (_, tag, attrs) => `<${tag}${attrs}></${tag}>`)
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;|&middot;|&amp;/g, ' ')
      .split(/\s+/)
      .join(' ');
  }

  // Known German words we historically had baked into the templates that
  // must now come from i18n. The absence of these words in the visible text
  // is our safety net.
  const FORBIDDEN = [
    'Plattform stabil', 'Handlungsbedarf', 'sofortiger Handlungsbedarf',
    'Fehler beim Laden', 'Kein Zugriff', 'Praxen gesamt', 'Neu heute',
    'Neu diese Woche', 'Neu diesen Monat', 'Anfragen gesamt',
    'Wachstum – letzte 12 Monate', 'Rechnungsübersicht', 'MRR nach Paket',
    'Paket-Verteilung', 'Marketing-Ziele', 'Demo-Anfragen nach Land',
    'Sicherheitsstatus', 'Server & Datenbank', 'Automation-Log',
    'Letzte Aktivitäten', 'Nur Aktionstypen',
  ];

  // The German dictionary blocks obviously contain German text — allow them
  // by scoping the check to text extracted from HTML (not JS strings).
  for (const rel of pages) {
    const src = fs.readFileSync(path.join(ROOT, rel), 'utf8');
    const text = extractText(src);
    for (const bad of FORBIDDEN) {
      assert.ok(!text.includes(bad),
        `${rel} still contains hard-coded German string '${bad}' in visible template`);
    }
  }
}

// ── runner ────────────────────────────────────────────────────────────────
const tests = [
  ['ownerLocales EN/FR contain no German', testOwnerLocales],
  ['aiLocales EN/FR contain no German',    testAiLocales],
  ['ceo-i18n merges into DASH_T and stays non-German for EN/FR', testCeoI18nFrontend],
  ['ai-praxismanager.html & ceo-dashboard.html templates have no hard-coded German', testHtmlPagesFreeOfHardcodedGerman],
];

let failed = 0;
for (const [name, fn] of tests) {
  try {
    fn();
    console.log(`ok  - ${name}`);
  } catch (err) {
    failed += 1;
    console.error(`FAIL - ${name}`);
    console.error('       ' + (err.message || err));
  }
}

if (failed > 0) {
  console.error(`\n${failed} test(s) failed`);
  process.exit(1);
}
console.log(`\nAll ${tests.length} tests passed`);
