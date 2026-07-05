# Flippa Screenshot Package — PraxisOnline24

15 professionally captured screenshots for the Flippa listing gallery. All captures use realistic English demo data, a 1440 × 900 desktop viewport at 2× Retina density (2880 × 1800 output — resized fullPage where the content exceeds one viewport), and a 390 × 844 mobile viewport at 3× density (1170 × 2532 output) for the responsive capture.

Source instance for all captures: local development server on `http://localhost:3999`, seeded with a realistic English clinic ("Downtown Medical Clinic", London) including nine upcoming appointments across three days, four billed invoices, a patient history, and a fresh invite token for the set-password screen. The DB was restored to its previous state after capture. No production data was written or exposed.

---

## Gallery ordering

The two-digit prefix determines the order in the Flippa gallery. Do not renumber unless you re-shoot the entire set.

| # | Filename | Page captured | Purpose in Flippa gallery |
|---|---|---|---|
| 01 | `01_homepage.png` | `/index.html?lang=en` | **Cover shot.** First impression: brand, tagline, hero CTA, feature strip. Sells "what is it?" in two seconds. |
| 02 | `02_pricing.png` | `/preise.html?lang=en` | **Commercial model.** Three-tier pricing card ($29 / $59 / $99). Shows a buyer that monetisation is already wired. |
| 03 | `03_demo_request.png` | `/demo.html?lang=en` | **Lead-capture flow.** Automated demo onboarding form. Shows product visitors can experience the funnel end-to-end. |
| 04 | `04_login.png` | `/login.html?lang=en` | **Auth surface.** Clean login screen. Signals the product has a working authenticated area (necessary for a SaaS). |
| 05 | `05_dashboard.png` | `/dashboard.html?lang=en` | **What the practitioner sees on day one.** KPI cards, upcoming appointments, trial banner. Anchor screen for the value proposition. |
| 06 | `06_calendar.png` | `/appointments.html?lang=en` | **Core operational surface.** Multi-view calendar with real appointments plotted across the current week. |
| 07 | `07_patients.png` | `/patients.html?lang=en` | **Patient list.** Lightweight patient management with search + counts. Emphasises privacy-conscious schema. |
| 08 | `08_patient_profile.png` | `/patients.html` — history modal open on Sarah Bennett | **Individual patient detail.** Appointment history table, tags, contact info. Shows the drill-down UX. |
| 09 | `09_ai_assistant.png` | `/ai-praxismanager.html?lang=en` | **Differentiator.** LLM-backed daily briefing, warnings, recommended actions. Buyer wedge: "AI-powered". |
| 10 | `10_invoices.png` | `/invoices.html?lang=en` | **Billing surface.** Invoice list with mixed statuses (paid / sent / draft). Signals revenue-plumbing is complete. |
| 11 | `11_online_booking.png` | `/practice.html?id=…&lang=en` | **Patient-facing booking.** Public practice profile the buyer's future customers will share with their patients. |
| 12 | `12_settings.png` | `/settings.html?lang=en` | **Practice configuration.** Full settings surface — opening hours, cancellation policy, integrations. Shows configurability depth. |
| 13 | `13_multilanguage.png` | `/index.html` with a 12-flag language panel overlaid | **The unique selling point.** Twelve languages visible at a glance (English default, plus DE FR ES PT AR TR RU ZH HI TH ID). Illustrates the "months of translation work already banked" claim in the listing. |
| 14 | `14_mobile_view.png` | `/index.html?lang=en` at 390 × 844 iPhone viewport | **Mobile responsiveness.** Full-page mobile capture proving the platform works on phones without a native app. |
| 15 | `15_security.png` | `/set-password.html?token=<valid>&lang=en` with password fields populated | **Authentication surface.** Set-password / invite-activation flow with the password visibility toggle visible. Shows the security-conscious onboarding. |

---

## Capture standards used

- **Desktop viewport:** 1440 × 900 CSS, `deviceScaleFactor: 2` (Retina output at 2880 × 1800 base).
- **Mobile viewport:** 390 × 844 CSS (iPhone 15 Pro portrait), `deviceScaleFactor: 3`, `isMobile: true`, `hasTouch: true`.
- **Full-page mode:** enabled for content-heavy pages (calendar, settings, patients, mobile homepage). Viewport-only for tight overlays (13 multilanguage).
- **Locale:** `en-US` browser locale; `lang=en` cookie + `?lang=en` query param. All UI copy renders in English.
- **Animations:** disabled at screenshot time to avoid mid-transition captures.
- **Browser chrome:** entirely hidden (Playwright captures only the page content — no URL bar, no bookmarks, no tabs).
- **Fonts:** `document.fonts.ready` awaited before every capture to prevent FOUT.
- **Zoom:** 100 % (default browser).

---

## Data conventions

- **Practice name:** Downtown Medical Clinic (12 Harley Street, London W1G 9PL)
- **Practitioners:** Dr. Anna Example (General Medicine), Dr. Luke Sample (Sports Medicine)
- **Patients:** all realistic English placeholders — Sarah Bennett, James Rivera, Priya Kapoor, Marcus Chen, Lena Kowalski, Oliver Blake, Fatima Nasser, Robert Ashford, Elena Fischer, and a few carried over from the previous dev seed (Emily Demo, John Sample). No real patient data.
- **Invoices:** mix of paid / sent / draft states, total volume ~£450 across four invoices.
- **Time reference:** appointments plotted for 2026-07-05 through 2026-07-09 (this week + next).
- **Invite token (screenshot 15):** a fresh, valid token that was generated for a demo `example.invalid` recipient during capture.

---

## Post-capture optimisation (recommended)

Before uploading to Flippa, optionally compress with `oxipng` or `pngcrush` — typical 20–30 % size reduction with no visible quality loss. The largest files here (13 and 14 at ~1 MB) are excellent candidates.

```
oxipng --opt max --strip safe sale/assets/flippa/screenshots/*.png
```

---

## Naming convention

Two-digit prefix + underscore + kebab-lowercase descriptor + `.png`. Do not use hyphens for the numeric prefix; underscore is Flippa-friendly for alphabetical ordering.

---

## Storage

Originals live in this folder. Flippa uploads should be exactly what's here — no manual edits recommended. If you need to re-shoot, use the same viewport, locale and seed data described above to keep the set visually consistent.
