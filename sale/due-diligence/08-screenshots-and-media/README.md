# 08 — Screenshots & Media

## Purpose

Visual proof that the product exists, works, and looks professional. Reduces the "is this a real product?" question to a two-minute browsing exercise.

## Files that will be added

- `screenshot-index.md` — inventory table matching `sale/assets/flippa/screenshots/README.md`
- `screenshots/01_homepage.png` through `screenshots/15_security.png` — copies or symlinks to the 15 Flippa gallery screenshots
- `demo-video.mp4` — silent 1:53.9 walkthrough (copy of `sale/assets/flippa/video/demo-video.mp4`)
- `demo-video-burned.mp4` — same video with English subtitles burned in (upload-ready version)
- `captions.srt` — subtitle track for the silent version
- `mobile-preview.png` — mobile responsive capture (from screenshot 14)

## NDA classification

**Public.** All materials in this folder are shown on the Flippa listing itself. There is no marginal risk to distributing them under NDA-only terms — they are already public.

## Reader notes

- Screenshots use realistic English demo data ("Downtown Medical Clinic, London") with placeholder patient names. No real user data appears in any frame.
- The demo video is silent by design. A narration script is available in `sale/assets/flippa/video/narration-script.md` — buyer can commission a voice-over addition post-purchase.
- Screenshots are captured at 1440 × 900 CSS viewport with 2× Retina density, resulting in 2880 × 1800 base resolution (mobile capture at 390 × 844, 3× density → 1170 × 2532).
- If the buyer requests screen captures of any specific area not in the standard set, the Playwright capture script is reusable from `sale/assets/flippa/screenshots/README.md` — regeneration is a 5-minute operation.
