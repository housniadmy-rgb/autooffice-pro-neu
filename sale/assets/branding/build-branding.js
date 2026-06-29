#!/usr/bin/env node
/**
 * PraxisOnline24 — render branding PNGs from the project's real wordmark/icon.
 *
 * Source of truth:
 *   - wordmark "PraxisOnline24" (as used throughout the live app)
 *   - brand colour #2563EB (public/css/style.css :root --primary)
 *
 * Outputs into sale/assets/branding/:
 *   - wordmark-logo.png  (2400×600, transparent)
 *   - icon.png           (1024×1024, transparent outside the rounded square)
 *   - favicon.png        (256×256)
 *   - acquire-logo.png   (800×800, square, suitable for Acquire.com listing card)
 */

const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');

const HERE = __dirname;

async function renderHTMLtoPNG(page, html, width, height, outFile, transparent) {
  await page.setViewportSize({ width, height });
  await page.setContent(html, { waitUntil: 'load' });
  await page.waitForTimeout(120);
  await page.screenshot({
    path: outFile,
    fullPage: false,
    omitBackground: !!transparent,
    clip: { x: 0, y: 0, width, height },
  });
  console.log(`  wrote ${path.basename(outFile)} (${width}×${height})`);
}

const FONT_STACK = "-apple-system,BlinkMacSystemFont,'SF Pro Display','Helvetica Neue',Inter,Arial,sans-serif";
const BRAND = '#2563EB';

function wordmarkHTML(width, height, color = BRAND) {
  return `<!doctype html><html><head><meta charset="utf-8"><style>
    html,body { margin:0; padding:0; background:transparent; width:${width}px; height:${height}px;
      display:flex; align-items:center; justify-content:center;
      font-family:${FONT_STACK}; }
    .mark { font-weight:800; letter-spacing:-0.03em; color:${color};
      font-size:${Math.round(height * 0.62)}px; line-height:1; }
  </style></head><body><div class="mark">PraxisOnline24</div></body></html>`;
}

function iconHTML(size, fill = BRAND, fg = '#FFFFFF') {
  const radius = Math.round(size * 0.215);
  const font = Math.round(size * 0.42);
  return `<!doctype html><html><head><meta charset="utf-8"><style>
    html,body { margin:0; padding:0; background:transparent; width:${size}px; height:${size}px;
      font-family:${FONT_STACK}; }
    .tile { width:${size}px; height:${size}px; border-radius:${radius}px; background:${fill};
      display:flex; align-items:center; justify-content:center; }
    .mono { color:${fg}; font-weight:800; letter-spacing:-0.04em; font-size:${font}px; line-height:1; }
  </style></head><body><div class="tile"><div class="mono">P24</div></div></body></html>`;
}

// Acquire listing card: square 800×800 with brand background + white wordmark + slogan.
function acquireHTML(size) {
  return `<!doctype html><html><head><meta charset="utf-8"><style>
    html,body { margin:0; padding:0; width:${size}px; height:${size}px;
      font-family:${FONT_STACK}; background:transparent; }
    .card { width:${size}px; height:${size}px; background:${BRAND};
      display:flex; flex-direction:column; align-items:center; justify-content:center;
      color:#FFFFFF; text-align:center; padding:0 ${Math.round(size * 0.08)}px;
      box-sizing:border-box; }
    .word { font-weight:800; letter-spacing:-0.03em; font-size:${Math.round(size * 0.12)}px; line-height:1; }
    .rule { width:${Math.round(size * 0.18)}px; height:${Math.round(size * 0.006)}px;
      background:rgba(255,255,255,0.7); margin:${Math.round(size * 0.045)}px auto; border-radius:2px; }
    .slogan { font-weight:300; opacity:0.92; font-size:${Math.round(size * 0.038)}px;
      letter-spacing:0.01em; line-height:1.35; }
  </style></head><body><div class="card">
    <div class="word">PraxisOnline24</div>
    <div class="rule"></div>
    <div class="slogan">The All-in-One Practice Management Platform</div>
  </div></body></html>`;
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ deviceScaleFactor: 1 });
  const page = await ctx.newPage();

  // 1) wordmark-logo.png — horizontal, transparent background, high-res
  await renderHTMLtoPNG(page, wordmarkHTML(2400, 600), 2400, 600,
    path.join(HERE, 'wordmark-logo.png'), true);

  // 2) icon.png — 1024×1024 rounded square, transparent outside the tile
  await renderHTMLtoPNG(page, iconHTML(1024), 1024, 1024,
    path.join(HERE, 'icon.png'), true);

  // 3) favicon.png — 256×256
  await renderHTMLtoPNG(page, iconHTML(256), 256, 256,
    path.join(HERE, 'favicon.png'), true);

  // 4) acquire-logo.png — 800×800 square listing card
  await renderHTMLtoPNG(page, acquireHTML(800), 800, 800,
    path.join(HERE, 'acquire-logo.png'), false);

  await browser.close();
  console.log('done.');
})().catch(err => { console.error('failed:', err.message); process.exitCode = 1; });
