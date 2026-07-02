/*
 * Read-only inspector for the Acquire.com "Technologies" dropdown.
 * Launches a headed Chromium with a persistent profile, waits (via a trigger
 * file, not stdin) for the user to log in + open the dropdown, then extracts
 * every visible option, scrolling the option list to the bottom until the
 * count stabilises. Output is written to acquire-technologies.json.
 */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.join(__dirname, '..');
const TRIGGER_READ = path.join(REPO_ROOT, '.acquire-trigger-read');
const TRIGGER_CLOSE = path.join(REPO_ROOT, '.acquire-trigger-close');
const OUT_PATH = path.join(REPO_ROOT, 'acquire-technologies.json');
const USER_DATA_DIR = path.join(REPO_ROOT, '.playwright-acquire-profile');

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

async function waitForTrigger(triggerPath, label) {
  console.log(`\n[WAIT] ${label}`);
  console.log(`       Trigger-Datei: ${triggerPath}`);
  while (!fs.existsSync(triggerPath)) {
    await sleep(400);
  }
  try { fs.unlinkSync(triggerPath); } catch { /* ignore */ }
  console.log(`[GO]   ${label} — Trigger erhalten.`);
}

async function findOpenListbox(page) {
  const candidates = [
    '[role="listbox"]',
    '[role="menu"]',
    '[class*="menu-list"]',
    '[class*="MenuList"]',
    '[class*="dropdown"][class*="menu"]',
    '[class*="options"]',
    '[class*="Options"]',
    'ul[class*="select"]',
  ];
  for (const sel of candidates) {
    const loc = page.locator(`${sel}:visible`).first();
    if (await loc.count().catch(() => 0)) {
      try {
        await loc.waitFor({ state: 'visible', timeout: 1500 });
        return { locator: loc, selector: sel };
      } catch { /* try next */ }
    }
  }
  return null;
}

async function extractOptions(page, listbox) {
  const optionSelectors = [
    '[role="option"]',
    'li[class*="option"]',
    'div[class*="option"]',
    'li',
  ];

  async function bestOptionSelector() {
    for (const sel of optionSelectors) {
      const n = await listbox.locator(sel).count().catch(() => 0);
      if (n > 0) return sel;
    }
    return null;
  }

  const optSel = await bestOptionSelector();
  if (!optSel) return { options: [], optionSelector: null };

  let prev = -1;
  let stableRounds = 0;
  for (let i = 0; i < 400; i++) {
    const count = await listbox.locator(optSel).count();
    if (count === prev) {
      stableRounds += 1;
      if (stableRounds >= 6) break;
    } else {
      stableRounds = 0;
    }
    prev = count;

    await listbox.evaluate((el) => {
      const scrollable = (function find(node) {
        if (!node) return null;
        const s = getComputedStyle(node);
        if (/(auto|scroll)/.test(s.overflowY) && node.scrollHeight > node.clientHeight + 4) return node;
        for (const c of node.children) {
          const r = find(c);
          if (r) return r;
        }
        return null;
      })(el) || el;
      scrollable.scrollTop = scrollable.scrollHeight;
    }).catch(() => {});
    await page.waitForTimeout(250);
  }

  const texts = await listbox.locator(optSel).evaluateAll((els) =>
    els.map((el) => (el.innerText || el.textContent || '').replace(/\s+/g, ' ').trim()).filter(Boolean)
  );
  const seen = new Set();
  const dedup = [];
  for (const t of texts) {
    if (!seen.has(t)) { seen.add(t); dedup.push(t); }
  }
  return { options: dedup, optionSelector: optSel };
}

(async () => {
  fs.mkdirSync(USER_DATA_DIR, { recursive: true });
  for (const f of [TRIGGER_READ, TRIGGER_CLOSE]) {
    try { fs.unlinkSync(f); } catch { /* ignore */ }
  }

  const ctx = await chromium.launchPersistentContext(USER_DATA_DIR, {
    headless: false,
    viewport: { width: 1440, height: 900 },
    args: ['--disable-blink-features=AutomationControlled'],
  });
  const page = ctx.pages()[0] || (await ctx.newPage());

  console.log('Oeffne Acquire.com im Browser-Fenster…');
  try {
    await page.goto('https://app.acquire.com/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  } catch (e) {
    console.log('Navigation zu app.acquire.com fehlgeschlagen, du kannst manuell hin navigieren. Fehler:', e.message);
  }

  console.log('\n=========================================================');
  console.log(' 1) Im Browser einloggen.');
  console.log(' 2) Zur Listing-Edit-Seite mit "Technologies"-Feld.');
  console.log(' 3) Technologies-Dropdown selbst OEFFNEN.');
  console.log(` 4) Sobald offen: "touch ${TRIGGER_READ}"`);
  console.log('=========================================================');

  await waitForTrigger(TRIGGER_READ, 'Warte, bis du sagst, dass das Dropdown offen ist…');

  const found = await findOpenListbox(page);
  if (!found) {
    const html = await page.content();
    const dumpPath = path.join(REPO_ROOT, 'acquire-page-dump.html');
    fs.writeFileSync(dumpPath, html);
    console.log(`\nKein offenes Listbox-/Menu-Element gefunden. Page dump: ${dumpPath}`);
  } else {
    console.log(`Listbox gefunden (selector hint: ${found.selector}).`);
    const result = await extractOptions(page, found.locator);
    console.log(`Optionen gefunden: ${result.options.length} (option-selector: ${result.optionSelector})`);

    const out = {
      capturedAt: new Date().toISOString(),
      url: page.url(),
      listboxSelector: found.selector,
      optionSelector: result.optionSelector,
      options: result.options,
    };
    fs.writeFileSync(OUT_PATH, JSON.stringify(out, null, 2));
    console.log(`Gespeichert: ${OUT_PATH}`);
    for (const t of result.options) console.log(`- ${t}`);
  }

  console.log(`\nBrowser bleibt offen. Zum Schliessen: "touch ${TRIGGER_CLOSE}"`);
  await waitForTrigger(TRIGGER_CLOSE, 'Warte auf Close-Signal…');
  await ctx.close();
})().catch((err) => {
  console.error('Fehler:', err);
  process.exit(1);
});
