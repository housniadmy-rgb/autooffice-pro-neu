# PraxisOnline24 — Screenshot Plan for Flippa Listing

> Ten screenshots, sequenced to walk a Flippa browser from **"what does this do?"** to **"what does the buyer actually own?"** in under two minutes. Use these filenames verbatim so the ordering is preserved in Flippa's gallery upload.

---

## Capture standards

- **Resolution:** minimum 1920 × 1080; retina (2×) preferred.
- **Format:** PNG, sRGB, no alpha channel.
- **Browser chrome:** hidden. Show the page content only. Chrome DevTools → Cmd+Shift+P → "Capture full size screenshot" is the cleanest method.
- **Zoom:** 100 %.
- **Locale for capture:** English (`?lang=en` where available) so international buyers can read the UI. Add German captures as a second batch if space permits.
- **Content:** Use realistic **demo data**. Do not screenshot with real practitioner or patient names. Use placeholder names like "Dr Anna Weber", "Practice Berlin Mitte", "Patient A. Müller".
- **Time overlay:** hide clocks that reveal the capture date; use consistent demo dates (e.g. all appointments in the same illustrative week).
- **Aspect ratio:** Flippa gallery renders 16:9; captures wider than that will letter-box.

---

## The 10 screenshots

### 01-homepage.png — "Landing page (public)"

- **URL:** `https://praxisonline24.com/?lang=en`
- **Frame:** whole hero + first content section down to the second CTA.
- **Caption (max 140 chars):**
  > Multilingual public landing page. Twelve locales built in. Domain and branding included in the sale.

---

### 02-pricing.png — "Pricing tiers, wired to registration"

- **URL:** `https://praxisonline24.com/preise.html?lang=en`
- **Frame:** full three-tier pricing grid + VAT note + trust strip.
- **Caption:**
  > Three pricing tiers driven by a single central config (`config/pricing.js`). Change once, propagates to every page + MRR calculation.

---

### 03-demo-request.png — "Demo request form"

- **URL:** `https://praxisonline24.com/demo.html?lang=en`
- **Frame:** the full form including fields + submit button + trust icons.
- **Caption:**
  > Auto-onboarding demo flow. Creates practice + user + invite token synchronously; admin + confirmation + activation emails follow asynchronously.

---

### 04-dashboard.png — "Practitioner dashboard"

- **URL:** `https://praxisonline24.com/dashboard.html` (requires demo login)
- **Frame:** the KPI cards + upcoming-appointments panel + trial banner.
- **Setup:** log in with a demo account first. Populate 3–5 upcoming appointments in the seed data before the capture.
- **Caption:**
  > At-a-glance operational dashboard. Appointments today, this month, revenue, AI-generated insights.

---

### 05-calendar.png — "Multi-view calendar"

- **URL:** `https://praxisonline24.com/appointments.html`
- **Frame:** week view with 4–6 appointments plotted, sidebar and header visible.
- **Setup:** ensure the week has plotted appointments across multiple practitioners.
- **Caption:**
  > Day / week / month calendar views. Availability windows per practitioner; drag to reschedule; token-based patient cancellation.

---

### 06-patients.png — "Patient management"

- **URL:** `https://praxisonline24.com/patients.html`
- **Frame:** patient list with 6–10 rows + search bar + "Add patient" affordance.
- **Setup:** GDPR-conscious placeholder data ("Patient A. Müller", "Patient B. Chen"), no diagnoses shown.
- **Caption:**
  > Lightweight patient records. Deliberately no diagnoses, medication or DOB stored — privacy-by-design schema.

---

### 07-invoices.png — "Invoicing"

- **URL:** `https://praxisonline24.com/invoices.html`
- **Frame:** invoice list + summary totals + "Create invoice" button.
- **Setup:** 4–6 sample invoices in mixed states (draft, sent, paid).
- **Caption:**
  > PDF invoice generation via pdfkit. Payment tracking, status workflow, reminder cron.

---

### 08-ai-assistant.png — "AI practice manager"

- **URL:** `https://praxisonline24.com/ai-praxismanager.html`
- **Frame:** the daily briefing card + warnings section + recommended actions.
- **Setup:** ensure the AI module has generated a fresh briefing (or use a captured snapshot).
- **Caption:**
  > LLM-backed practice assistant. Daily briefings, idle-capacity warnings, recommended actions. Swappable Claude / OpenAI adapter.

---

### 09-multilingual.png — "12 languages, side by side"

- **URL:** `https://praxisonline24.com/preise.html` — captured 4 times in 4 languages (DE, AR, ZH, TH), then composed into a single 2×2 grid image.
- **Frame:** each quadrant shows the pricing hero in one language; the Arabic capture must be RTL.
- **Tooling:** simple image editor (Preview → Screenshot → Grid) or Figma frame.
- **Caption:**
  > Twelve languages, including RTL. Full UI + email templates translated. Centralised in `emailLocales.js` and `public-i18n.js`.

---

### 10-owner-dashboard.png — "CEO / owner insights"

- **URL:** `https://praxisonline24.com/ceo-dashboard.html` (owner-only)
- **Frame:** MRR + practice-count + package-distribution charts, executive timeline.
- **Setup:** owner login required; seed the demo DB with 6–10 practices across all three tiers so charts have shape.
- **Caption:**
  > Platform-owner view: MRR by tier, cohort split, executive timeline, notifications. Everything a buyer needs to run the business from day 1.

---

## Optional additional captures

If Flippa allows more than 10 images, consider adding:

- `11-set-password.png` — invite-activation page with the eye-icon password toggle visible.
- `12-mobile-dashboard.png` — 375 × 812 iPhone-shaped mobile capture of the dashboard.
- `13-brevo-dns-verified.png` — Brevo dashboard showing SPF / DKIM / DMARC as verified (proves deliverability claim).
- `14-render-deploy-log.png` — Render dashboard showing a successful production deploy with `/api/health` green.
- `15-github-repo-tree.png` — top-level file tree of the private GitHub repository, so buyers see what code they get.

---

## Naming convention

All filenames use lowercase, two-digit prefix, kebab-case:
```
01-homepage.png
02-pricing.png
03-demo-request.png
...
```

The numeric prefix guarantees ordering across upload UIs. Keep the same prefixes across variants (`01-homepage-en.png`, `01-homepage-de.png`) so future updates don't reshuffle the gallery.

---

## Post-capture checklist

- [ ] Every image reviewed for accidental real-user data (mobile numbers, real emails, real names).
- [ ] Every image exported at 2× density (retina).
- [ ] Every image compressed with `tinypng` or `oxipng` before upload (Flippa has file-size limits).
- [ ] Alt text prepared for each (paste the caption above; matches accessibility + SEO best practice).
- [ ] Full set uploaded to Flippa gallery in the numeric order specified.

---

## Where to store the source captures

Save originals under `sale/flippa/screenshots/` (create the folder when you capture). Keep the raw uncompressed PNGs + the compressed uploads separately, in case Flippa requires re-uploads at higher resolution.
