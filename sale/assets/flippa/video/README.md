# PraxisOnline24 — Demo Video Package

Investor-oriented demo video for the Flippa listing. Silent screen capture at 1920 × 1080, with a synchronised English caption track (`captions.srt`) and a matching narration script (`narration-script.md`) for a voice-over artist to record.

---

## Files

| File | Purpose |
|---|---|
| `demo-video.mp4` | The final 1:53.9 silent screen capture, ready to upload to Flippa. |
| `captions.srt` | English subtitles synchronised to the 15 scenes. |
| `narration-script.md` | Voice-over script matching the captions; hand off to a VO artist to add audio. |
| `shot-list.md` | Scene-by-scene action detail, timecodes, and URLs captured. |
| `README.md` | This file. |

---

## Technical spec

| Attribute | Value |
|---|---|
| **Duration** | 1:53.9 (113.92 s) |
| **Resolution** | 1920 × 1080 |
| **Video codec** | H.264 High Profile, Level 4.2, yuv420p |
| **Encoder settings** | `libx264 -preset slow -crf 18` (visually lossless) |
| **Frame rate** | 25 fps *(see recording notes)* |
| **Audio codec** | AAC 128 kbps, stereo, silent track baked in for container compliance |
| **Container** | MP4 with `+faststart` for progressive streaming |
| **File size** | ~5.9 MB |
| **Recording date** | 2026-07-05 (UTC 09:08–09:10) |

---

## Scenes included

Total 15 scenes, ~7.6 s average.

1. Homepage — hero + feature scroll
2. Pricing — three tiers at 29 / 59 / 99 USD
3. Demo request form — fields typed in real time
4. Confirmation email — inline HTML rendition of the actual email template
5. Set password — invite-token activation flow with visibility toggle
6. Login — email + password
7. Dashboard — KPI cards + AI briefing
8. Calendar — week view with 7 appointments plotted
9. Patient management — English placeholder patient list
10. AI Assistant — daily briefing + warnings + recommendations
11. Invoice management — list with mixed statuses (paid, sent, draft)
12. Online booking — public practice profile page
13. Multi-language — 12-language selector panel
14. Settings — practice configuration surface
15. Closing shot — logo, tagline, listing info

Timecodes and captions are in `captions.srt`.

---

## Recording notes and honest disclosures

- **Frame rate is 25 fps, not 60 fps.** The user brief requested 60 fps "if possible". Playwright's built-in screen recording is capped at Chromium's native compositor rate, effectively ~25 fps for headless captures. Achieving 60 fps would require a different recording pipeline (OBS + headed browser, or a native macOS `screencapture -v`). If 60 fps is a hard requirement, re-record with OBS Studio at 60 fps using the same shot list.
- **No visible cursor.** Headless Chromium does not render an OS cursor. The video communicates through page transitions and content, not mouse movements. If cursor movement is important for the target audience, re-record in headed mode with an on-screen cursor overlay (see `shot-list.md` for the exact re-recording steps).
- **No audio narration.** The video ships silent by design — the `.mp4` contains a silent AAC track only for container compatibility. Deliver the file to a professional voice-over artist along with `narration-script.md`; the timing is designed to fit ~275 words at 145 wpm.
- **English UI throughout.** Every page was loaded with `?lang=en` and a `lang=en` cookie. Practice name, patients, appointments, invoices — all use realistic English demo data (Downtown Medical Clinic, London).
- **No sound effects. No music.** As specified in the brief.
- **Cuts only, no transitions.** As specified in the brief.
- **Sensitive data.** None. All patient names are fictional English placeholders. All email addresses are RFC-safe (`example.test` / `example.invalid`). No real-user data, no API keys, no secrets appear anywhere in frame.

---

## How to add narration audio

1. Read `narration-script.md`. Time budget: 275 words × 60 s ÷ 145 wpm ≈ 113 s (matches video duration).
2. Record in a treated room, cardioid microphone, 48 kHz 16-bit mono.
3. Normalise to −18 dB LUFS integrated, −3 dB peak.
4. In a video editor (DaVinci Resolve, Final Cut, Premiere), import both `demo-video.mp4` and the voice-over WAV.
5. Align each narration segment to the timecodes in `captions.srt`.
6. Export MP4 with a stereo AAC 192 kbps voice track, keep the same video codec.

Optional: burn in the captions as an accessible subtitle track for Flippa upload — most editors export SRT as a soft-subtitle stream, which Flippa's player renders natively.

---

## How to re-record with different specs

The recording pipeline is `/tmp/video-record.js` (single-file Playwright script) plus a seeded local server on port 3999. To reproduce or modify:

1. Start the local dev server with English UI seed data (see `sale/flippa/screenshot-plan.md` for the exact seed).
2. Adjust scene timings in the `SCENES` array of the Playwright script.
3. `node video-record.js` produces a WebM in `.raw/`.
4. Transcode with:
   ```
   ffmpeg -y -i input.webm \
     -f lavfi -i anullsrc=r=48000:cl=stereo \
     -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p \
     -profile:v high -level 4.2 -movflags +faststart \
     -c:a aac -b:a 128k -shortest \
     demo-video.mp4
   ```
5. Regenerate `captions.srt` timings using the scene timings logged during recording.

---

## Verification

To verify the video plays cleanly before upload:

```
ffprobe -v error -show_entries format=duration,size \
  -show_entries stream=codec_name,width,height,r_frame_rate \
  demo-video.mp4
```

Expected output: duration ≈ 113.92 s, resolution 1920 × 1080, video codec `h264`, audio codec `aac`.

Open in QuickTime or VLC. If both play without a codec prompt, Flippa's upload will accept it too.
