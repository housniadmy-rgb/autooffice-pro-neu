#!/usr/bin/env node
/**
 * PraxisOnline24 — English demo video (silent, 1920×1080, ~75 s).
 *
 * Builds the video entirely from the English screenshots in
 * sale/assets/screenshots/en/ plus two rendered brand cards.
 *
 * Stages:
 *   1. Render brand intro/outro PNGs and per-scene English text overlays.
 *   2. Compose each scene with ffmpeg: Ken Burns drift + overlay + fades.
 *   3. Concatenate to praxisonline24-demo-en.mp4.
 */

const path = require('path');
const fs = require('fs');
const { spawn, spawnSync } = require('child_process');
const { chromium } = require('playwright');

const HERE = __dirname;
const SCREENSHOTS = path.resolve(HERE, '..', 'screenshots', 'en');
const WORK = path.join(HERE, 'frames-en');
const OUT = path.join(HERE, 'praxisonline24-demo-en.mp4');
fs.mkdirSync(WORK, { recursive: true });

function findFFmpeg() {
  if (process.env.FFMPEG_BIN && fs.existsSync(process.env.FFMPEG_BIN)) return process.env.FFMPEG_BIN;
  const sys = spawnSync('which', ['ffmpeg']).stdout.toString().trim();
  if (sys && fs.existsSync(sys)) return sys;
  return null;
}
const FFMPEG = findFFmpeg();
if (!FFMPEG) { console.error('ffmpeg not found'); process.exit(1); }
console.log(`ffmpeg: ${FFMPEG}`);

// ── scene definitions ──────────────────────────────────────────────
// Each scene maps to an existing screenshot or a rendered brand card.
const SCENES = [
  { id: '01-intro',        src: 'brand-intro.png',         dur: 5, title: '',                                       subtitle: '' },
  { id: '02-homepage',     src: '01-homepage.png',         dur: 7, title: 'All-in-One Practice Management',        subtitle: '24/7 online booking · Patients · Invoicing · Reviews' },
  { id: '03-pricing',      src: '03-pricing.png',          dur: 6, title: 'Three Clear Plans',                      subtitle: 'Basic  ·  Pro  ·  Unlimited' },
  { id: '04-request-demo', src: '04-request-demo.png',     dur: 5, title: 'Request a Demo',                         subtitle: '30-day free trial — no credit card required' },
  { id: '05-dashboard',    src: '05-dashboard.png',        dur: 7, title: 'Smart Admin Dashboard',                  subtitle: 'Daily KPIs · Today\'s appointments · Automations' },
  { id: '06-calendar',     src: '06-calendar.png',         dur: 7, title: 'Smart Calendar & Scheduling',            subtitle: 'Conflict-free booking across practitioners' },
  { id: '07-patients',     src: '07-patients.png',         dur: 7, title: 'Privacy-by-Design Patient Management',   subtitle: 'GDPR compliant — no health data stored' },
  { id: '08-invoices',     src: '08-invoices.png',         dur: 7, title: 'Professional PDF Invoicing',             subtitle: 'Generate, send and track invoices in seconds' },
  { id: '09-settings',     src: '09-settings.png',         dur: 7, title: 'Multi-Language Platform',                subtitle: '12 languages incl. RTL Arabic · Hosted in Germany' },
  { id: '10-outro',        src: 'brand-outro.png',         dur: 8, title: '',                                       subtitle: '' },
];

// ── render brand cards + text overlays via headless Chromium ───────
async function renderAssets() {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await ctx.newPage();

  async function renderHTML(html, file) {
    await page.setContent(html);
    await page.waitForTimeout(150);
    await page.screenshot({ path: file, fullPage: false, omitBackground: file.endsWith('-overlay.png') });
    console.log(`  rendered ${path.basename(file)}`);
  }

  const brandIntro = `
    <html lang="en"><head><meta charset="utf-8"><style>
      html,body { margin:0; padding:0; background:#0f1a2e; color:white;
        font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display',Inter,sans-serif;
        width:1920px; height:1080px; display:flex; align-items:center; justify-content:center; }
      .card { text-align:center; }
      .brand { font-size:128px; font-weight:800; letter-spacing:-2px;
        background:linear-gradient(120deg,#FFFFFF,#7CB7FF); -webkit-background-clip:text; color:transparent; }
      .slogan { font-size:36px; opacity:.85; margin-top:24px; font-weight:300; }
      .url { font-size:28px; opacity:.65; margin-top:60px; letter-spacing:2px; font-weight:500; }
      .underline { width:160px; height:3px; background:#7CB7FF; margin:40px auto; border-radius:2px; opacity:.7; }
    </style></head><body><div class="card">
      <div class="brand">PraxisOnline24</div>
      <div class="slogan">The All-in-One Practice Management Platform</div>
      <div class="underline"></div>
      <div class="url">praxisonline24.com</div>
    </div></body></html>`;

  const brandOutro = `
    <html lang="en"><head><meta charset="utf-8"><style>
      html,body { margin:0; padding:0; background:#0f1a2e; color:white;
        font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display',Inter,sans-serif;
        width:1920px; height:1080px; display:flex; align-items:center; justify-content:center; }
      .card { text-align:center; }
      .brand { font-size:128px; font-weight:800; letter-spacing:-2px;
        background:linear-gradient(120deg,#FFFFFF,#7CB7FF); -webkit-background-clip:text; color:transparent; }
      .slogan { font-size:36px; opacity:.85; margin-top:24px; font-weight:300; }
      .url { font-size:28px; opacity:.65; margin-top:60px; letter-spacing:2px; font-weight:500; }
      .tag { font-size:24px; opacity:.7; margin-top:18px; font-weight:400; color:#A8C8FF; }
      .underline { width:160px; height:3px; background:#7CB7FF; margin:40px auto; border-radius:2px; opacity:.7; }
    </style></head><body><div class="card">
      <div class="brand">PraxisOnline24</div>
      <div class="slogan">The All-in-One Practice Management Platform</div>
      <div class="underline"></div>
      <div class="url">https://www.praxisonline24.com</div>
      <div class="tag">Pre-Revenue SaaS Available for Acquisition</div>
    </div></body></html>`;

  await renderHTML(brandIntro, path.join(WORK, 'brand-intro.png'));
  await renderHTML(brandOutro, path.join(WORK, 'brand-outro.png'));

  // Per-scene text overlay PNGs (transparent background)
  for (const s of SCENES) {
    if (!s.title) continue;
    const safe = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;');
    const html = `
      <html><head><meta charset="utf-8"><style>
        html,body { margin:0; padding:0; width:1920px; height:1080px;
          background:transparent;
          font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display',Inter,sans-serif; }
        .band { position:absolute; left:0; right:0; bottom:0; height:260px;
          background:linear-gradient(180deg, rgba(15,26,46,0) 0%, rgba(15,26,46,0.88) 55%, rgba(15,26,46,0.94) 100%);
          display:flex; flex-direction:column; align-items:center; justify-content:center; }
        .title { color:#FFFFFF; font-size:56px; font-weight:700; letter-spacing:-0.5px;
          text-shadow:0 2px 8px rgba(0,0,0,0.6); margin-bottom:18px; text-align:center; }
        .subtitle { color:#A8C8FF; font-size:30px; font-weight:400; letter-spacing:0.2px;
          text-shadow:0 1px 4px rgba(0,0,0,0.6); text-align:center; padding:0 60px; }
      </style></head><body>
        <div class="band">
          <div class="title">${safe(s.title)}</div>
          <div class="subtitle">${safe(s.subtitle)}</div>
        </div>
      </body></html>`;
    await renderHTML(html, path.join(WORK, s.id + '-overlay.png'));
  }

  await browser.close();
}

// ── ffmpeg helpers ─────────────────────────────────────────────────
function ffmpegRun(args, label) {
  return new Promise((resolve, reject) => {
    const p = spawn(FFMPEG, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let stderr = '';
    p.stderr.on('data', d => { stderr += d.toString(); });
    p.on('close', code => {
      if (code === 0) resolve();
      else { process.stderr.write(stderr); reject(new Error(`${label} exit ${code}`)); }
    });
  });
}

function resolveSrc(s) {
  const brand = path.join(WORK, s.src);
  if (fs.existsSync(brand)) return brand;
  return path.join(SCREENSHOTS, s.src);
}

async function renderScene(s, idx) {
  const inFile = resolveSrc(s);
  if (!fs.existsSync(inFile)) throw new Error(`source missing: ${inFile}`);
  const overlayFile = path.join(WORK, s.id + '-overlay.png');
  const outFile = path.join(WORK, s.id + '.mp4');
  const fps = 30;
  const dFrames = s.dur * fps;
  const isBrand = s.id === '01-intro' || s.id === '10-outro';

  let cmd;
  if (isBrand) {
    const vf = `scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,` +
               `fade=t=in:st=0:d=0.5:alpha=1,fade=t=out:st=${(s.dur - 0.6).toFixed(2)}:d=0.6:alpha=1,` +
               `format=yuv420p`;
    cmd = ['-y', '-loop', '1', '-i', inFile, '-vf', vf,
           '-frames:v', String(dFrames), '-c:v', 'libx264', '-r', String(fps),
           '-preset', 'fast', '-crf', '20', outFile];
  } else {
    const driftPxPerSec = 160 / s.dur;
    const filter =
      `[0:v]scale=2080:1170,setsar=1,` +
        `crop=1920:1080:x='${driftPxPerSec.toFixed(3)}*t':y='45'[bg];` +
      `[1:v]scale=1920:1080,setsar=1[ol];` +
      `[bg][ol]overlay=0:0:format=auto,` +
        `fade=t=in:st=0:d=0.4:alpha=1,` +
        `fade=t=out:st=${(s.dur - 0.4).toFixed(2)}:d=0.4:alpha=1,` +
        `format=yuv420p[v]`;
    cmd = ['-y', '-loop', '1', '-i', inFile, '-loop', '1', '-i', overlayFile,
           '-filter_complex', filter, '-map', '[v]',
           '-frames:v', String(dFrames), '-c:v', 'libx264', '-r', String(fps),
           '-preset', 'fast', '-crf', '20', outFile];
  }

  await ffmpegRun(cmd, `render ${s.id}`);
  console.log(`  scene ${String(idx + 1).padStart(2, '0')} — ${s.id} (${s.dur}s)`);
}

async function concatScenes() {
  const listPath = path.join(WORK, '_concat.txt');
  fs.writeFileSync(listPath, SCENES.map(s => `file '${path.join(WORK, s.id + '.mp4')}'`).join('\n'));
  await ffmpegRun(['-y', '-f', 'concat', '-safe', '0', '-i', listPath, '-c', 'copy', OUT], 'concat');
  console.log(`  concatenated → ${path.basename(OUT)}`);
}

async function probe(file) {
  return new Promise(resolve => {
    const p = spawn(FFMPEG, ['-i', file], { stdio: ['ignore', 'pipe', 'pipe'] });
    let s = '';
    p.stderr.on('data', d => { s += d.toString(); });
    p.on('close', () => {
      const m = s.match(/Duration:\s+(\d{2}):(\d{2}):(\d{2}\.\d{2})/);
      const r = s.match(/(\d+)x(\d+)/);
      resolve({
        duration: m ? +m[1] * 3600 + +m[2] * 60 + +m[3] : null,
        width: r ? +r[1] : null, height: r ? +r[2] : null,
      });
    });
  });
}

(async () => {
  console.log('Stage 1/2: rendering brand cards and text overlays…');
  await renderAssets();
  console.log('Stage 2/2: rendering scenes…');
  for (let i = 0; i < SCENES.length; i++) await renderScene(SCENES[i], i);
  await concatScenes();

  const meta = await probe(OUT);
  console.log('');
  console.log(`Demo video built: ${OUT}`);
  console.log(`  resolution: ${meta.width}x${meta.height}`);
  console.log(`  duration:   ${meta.duration ? meta.duration.toFixed(2) : '?'} s`);
  console.log(`  audio:      none (silent)`);
})().catch(err => { console.error('failed:', err.message); process.exitCode = 1; });
