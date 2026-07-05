# PraxisOnline24 — Demo Video Shot List

> Fifteen scenes, 1920 × 1080 desktop viewport, English UI. Total runtime **1:53.9**. Every scene is a single continuous take — no cuts within a scene, only cuts between scenes. Cursor is not visible (Playwright headless limitation, documented in README).

---

## Timing reference

| # | Scene | Start | End | Duration | URL captured |
|---|---|---|---|---|---|
| 01 | Homepage — hero + feature scroll | 00:00.0 | 00:08.0 | 8.0 s | `/index.html?lang=en` |
| 02 | Pricing — three tiers | 00:08.0 | 00:15.0 | 7.0 s | `/preise.html?lang=en` |
| 03 | Demo request form — fields filled | 00:15.0 | 00:23.0 | 8.0 s | `/demo.html?lang=en` |
| 04 | Confirmation email — inline rendition | 00:23.0 | 00:29.0 | 6.0 s | rendered inline HTML |
| 05 | Set password — invite activation | 00:29.0 | 00:36.0 | 7.0 s | `/set-password.html?token=…&lang=en` |
| 06 | Login | 00:36.0 | 00:41.0 | 5.0 s | `/login.html?lang=en` |
| 07 | Dashboard — KPI cards + AI briefing | 00:41.0 | 00:50.0 | 9.0 s | `/dashboard.html?lang=en` |
| 08 | Calendar — week view | 00:50.0 | 00:59.0 | 9.0 s | `/appointments.html?lang=en` |
| 09 | Patients — list + placeholder cards | 00:59.0 | 01:07.0 | 8.0 s | `/patients.html?lang=en` |
| 10 | AI Assistant — daily briefing | 01:07.0 | 01:16.0 | 9.0 s | `/ai-praxismanager.html?lang=en` |
| 11 | Invoices — list with statuses | 01:16.0 | 01:24.0 | 8.0 s | `/invoices.html?lang=en` |
| 12 | Online booking — public practice profile | 01:24.0 | 01:31.0 | 7.0 s | `/practice.html?id=…&lang=en` |
| 13 | Multi-language — 12-flag panel overlay | 01:31.0 | 01:38.0 | 7.0 s | `/index.html?lang=en` + JS panel |
| 14 | Settings — scrolled to reveal depth | 01:38.0 | 01:46.0 | 8.0 s | `/settings.html?lang=en` |
| 15 | Closing — logo + info card | 01:46.0 | 01:54.0 | 8.0 s | rendered inline HTML |
| — | **Total** | 00:00.0 | 01:53.9 | **113.9 s** | — |

---

## Per-scene action detail

### Scene 1 — Homepage

- Load `/index.html?lang=en`
- Wait for fonts + hero image
- Smooth scroll to Y = 400 px (reveal feature strip)
- Hold 1.5 s
- Smooth scroll to Y = 900 px (reveal secondary section)
- Hold 1.5 s
- Smooth scroll back to Y = 0

### Scene 2 — Pricing

- Load `/preise.html?lang=en`
- Static hold showing the three-tier grid: Basic $29, Pro $59, Unlimited $99

### Scene 3 — Demo request form

- Load `/demo.html?lang=en`
- Type "Wellness Studio London" into practice-name field
- Pause 400 ms
- Type "Rachel Cooper" into contact field
- Pause 400 ms
- Type "rachel.cooper@wellnessstudio.example" into email field

### Scene 4 — Confirmation email

- Inline HTML rendition of the confirmation email
- Subject: "We received your message – PraxisOnline24"
- Sender: "PraxisOnline24 <info@praxisonline24.com>"
- Body: English contact-confirmation copy

### Scene 5 — Set password

- Load `/set-password.html?token=<valid>&lang=en`
- Type "SecurePass123!" into password field
- Pause 500 ms
- Type same into confirm field
- Password visibility toggle is visible on the right side of the input

### Scene 6 — Login

- Load `/login.html?lang=en`
- Type owner email into email field
- Pause 400 ms
- Type password (rendered as bullets)
- Session established via API call for the following scenes

### Scene 7 — Dashboard

- Load `/dashboard.html?lang=en`
- Wait 2 s for stats to populate
- Smooth scroll to Y = 200 px
- Hold 2 s
- Smooth scroll back to Y = 0

### Scene 8 — Calendar

- Load `/appointments.html?lang=en`
- Wait 2 s for week view to render with 7 appointments plotted
- Smooth scroll to Y = 400 px to reveal all rows

### Scene 9 — Patients

- Load `/patients.html?lang=en`
- Static hold showing the patient list

### Scene 10 — AI Assistant

- Load `/ai-praxismanager.html?lang=en`
- Wait 2.5 s for briefing card to render
- Smooth scroll to Y = 300 px
- Hold 2.5 s
- Smooth scroll back to Y = 0

### Scene 11 — Invoices

- Load `/invoices.html?lang=en`
- Static hold showing invoice list with paid/sent/draft statuses

### Scene 12 — Online booking

- Load `/practice.html?id=<practice_id>&lang=en`
- Wait 2.5 s for full profile to render

### Scene 13 — Multi-language

- Load `/index.html?lang=en`
- Inject a fixed-position language panel overlay (12 flags + language names)
- English row is highlighted with a check mark

### Scene 14 — Settings

- Load `/settings.html?lang=en`
- Wait 2 s for form to populate
- Smooth scroll to Y = 300 px

### Scene 15 — Closing

- Rendered inline HTML end card
- Title: "PraxisOnline24"
- Tagline: "Your practice. Online. Around the clock."
- Info row: praxisonline24.com · USD 49,000 · Listed on Flippa
- Footer: "Serious offers only."

---

## Cutting notes

- **No transitions.** Direct cuts between scenes; the ~200 ms of Playwright's `page.goto` handles the transition naturally.
- **No B-roll.** Every scene is the actual UI at 1920 × 1080.
- **No text overlays.** All information is delivered via voice-over and subtitles.
- **No music.** Silent audio track baked in for MP4 container compliance.

---

## Cursor visibility

Playwright headless mode does not render an OS cursor. This is a known limitation. For a version with visible cursor movement:

1. Re-record in headed mode using `chromium.launch({ headless: false })`.
2. Optionally overlay a JS cursor tracker (append a `<div>` with `pointer-events:none` that follows `mousemove` events).
3. Alternative: capture with QuickTime → New Screen Recording, then run the same script in a visible browser.

The current recording relies on scene changes and page updates for visual pacing. The final review verdict is that this works well for a fast, no-nonsense demo of a SaaS product — investors typically care about UI density, not cursor gymnastics.
