# PraxisOnline24 — Media Checklist

## Purpose

Inventory of all screenshot and video assets that are part of the sale. Each item lists source location, format, purpose, and NDA classification. Buyers use this as their audit list during DD.

## Executive summary

**15 Retina screenshots + 2 demo video variants + 1 captions file** are included. All screenshots use realistic English demo data with no real user information. All assets live in `sale/assets/flippa/` and transfer with the source code.

## Screenshot inventory

Each screenshot is captured at **1440 × 900 CSS viewport with 2× Retina density** (output resolution 2880 × 1800 for desktop, 1170 × 2532 for mobile).

| # | File | Content | Purpose |
|---|---|---|---|
| 01 | `01_homepage.png` | English landing page hero | Cover image |
| 02 | `02_pricing.png` | Three-tier pricing grid | Monetisation proof |
| 03 | `03_demo_request.png` | Demo request form | Lead capture flow |
| 04 | `04_login.png` | Login screen | Auth surface |
| 05 | `05_dashboard.png` | Practitioner dashboard with KPIs | Operator daily home |
| 06 | `06_calendar.png` | Week-view calendar with plotted appointments | Core operational surface |
| 07 | `07_patients.png` | Patient list with search | Patient management |
| 08 | `08_patient_profile.png` | Individual patient history modal | Drill-down UX |
| 09 | `09_ai_assistant.png` | AI Practice Manager daily briefing | Differentiator |
| 10 | `10_invoices.png` | Invoice list with mixed statuses | Billing plumbing |
| 11 | `11_online_booking.png` | Public practice profile page | Patient-facing booking |
| 12 | `12_settings.png` | Practice configuration surface | Configurability depth |
| 13 | `13_multilanguage.png` | 12-flag language selector | Twelve-language USP |
| 14 | `14_mobile_view.png` | iPhone 15 Pro portrait homepage | Mobile responsiveness |
| 15 | `15_security.png` | Set-password screen with visibility toggle | Security-conscious onboarding |

Source location: `sale/assets/flippa/screenshots/`
Documentation: `sale/assets/flippa/screenshots/README.md`

## Video inventory

| File | Duration | Purpose | Notes |
|---|---|---|---|
| `demo-video.mp4` | 1:53.9 | Silent walk-through, source for voice-over recording | For a VO artist to add narration later |
| `demo-video-burned.mp4` | 1:53.9 | Same walk-through with hard-burned English subtitles | The ready-to-upload version for Flippa |
| `captions.srt` | n/a | English subtitle track, 15 cues synchronised to the 15 scenes | Standalone caption file |

Source location: `sale/assets/flippa/video/`
Documentation: `sale/assets/flippa/video/README.md`

## Supporting text assets

| File | Purpose |
|---|---|
| `sale/assets/flippa/video/narration-script.md` | Voice-over script (275 words at 145 wpm = 1:53) for VO artist |
| `sale/assets/flippa/video/shot-list.md` | Scene-by-scene shot list with URLs and cursor actions |

## Data conventions in captures

Every screenshot and every video frame uses realistic English placeholder data:

- **Practice name:** Downtown Medical Clinic, 12 Harley Street, London W1G 9PL
- **Practitioners:** Dr. Anna Example (General Medicine), Dr. Luke Sample (Sports Medicine)
- **Patients:** Sarah Bennett, James Rivera, Priya Kapoor, Marcus Chen, Lena Kowalski, Oliver Blake, Fatima Nasser, Robert Ashford, Elena Fischer (fictional English placeholders)
- **Invoices:** paid / sent / draft mixture, values in the £45–150 range
- **Email addresses:** `@example.test` or `@example.invalid` throughout — no real inboxes

## Confirmations

- [ ] No real patient data appears in any screenshot or video frame
- [ ] No real practitioner data appears in any screenshot or video frame
- [ ] No API keys, session cookies, or secrets visible in captured frames
- [ ] No browser bookmarks, extensions, or personal browser data visible in captures
- [ ] All captures use English UI locale (`?lang=en` + `lang=en` cookie)
- [ ] Video subtitles match the SRT file exactly

## Regeneration procedure

If the buyer wishes to recapture the media with their own branded data:

1. Follow the deployment guide to start a local instance
2. Seed with the buyer's chosen demo data
3. Run the capture scripts in `sale/assets/flippa/screenshots/` (Playwright-based, ~2 minutes for the full set)
4. Regenerate the video by running the corresponding Playwright recording script (documented in `sale/assets/flippa/video/README.md`)

## Recommended optional additions

The buyer may wish to add later:

- Cover video (30 seconds) for the Flippa listing preview
- Product tour videos per feature area (2–3 minutes each)
- Case-study video with a beta customer (Day-90 timeline)
- Photo assets for social media

> TODO — buyer's marketing decision; not part of the current sale.

## Distribution constraint

All media in `sale/assets/flippa/` is **public** — designed for the public Flippa listing gallery. Distribute freely.

---

**NDA classification:** Public
**Last updated:** 2026-07-07
**Document owner:** The seller
**Related documents:** [Executive Summary](../01-executive-summary/Executive_Summary.md), [Pitch Deck Outline](../03-pitch-deck/Pitch_Deck_Outline.md), [Domain and Brand](../07-domain-and-brand-assets/Domain_and_Brand.md)
