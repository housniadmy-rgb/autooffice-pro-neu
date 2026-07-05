# PraxisOnline24 — Demo Video Narration Script

> Investor-oriented voice-over script for the 2-minute demo video. Total word budget: ~275 words at 145 wpm — reads in 1:53, matches the video length of 1:53.9. Factual, no product-market-fit claims, no revenue/customer references.

---

## Recording notes

- **Voice:** neutral, professional. English. No music, no sound effects. Male or female is fine — consistency matters more than voice choice.
- **Delivery:** clear articulation, no rushed cadence. Approximately 145 words per minute. Slight pauses at commas, longer at scene changes.
- **Silence between scenes:** 300–500 ms is natural. Do NOT try to hit every second — the video works with sync tolerances of ±1 s.
- **Recording setup:** cardioid microphone, sample rate 48 kHz, single mono track. Normalise to −3 dB peak, −18 dB integrated LUFS.
- **Format for delivery:** WAV 48 kHz 16-bit, timed to the SRT file.

---

## Per-scene narration

Each block corresponds to one video scene. Timecodes match `captions.srt`.

### Scene 1 — Homepage (0:00–0:08)

> This is PraxisOnline24, a multilingual practice management platform. The landing page introduces a single value proposition: run your entire practice online, in twelve languages.

### Scene 2 — Pricing (0:08–0:15)

> The commercial model is priced in from day one. Three subscription tiers — Basic, Pro and Unlimited — at 29, 59, and 99 dollars per month.

### Scene 3 — Demo request form (0:15–0:23)

> Every visitor can request a demo in seconds. The form captures practice name, contact and email — all validated client-side and server-side.

### Scene 4 — Confirmation email (0:23–0:29)

> Immediately after submission, the practice receives an automated confirmation email in their chosen language. Delivered through Brevo with verified SPF, DKIM and DMARC.

### Scene 5 — Set password / account activation (0:29–0:36)

> A one-click activation link creates the account. The password field ships with a visibility toggle — a small usability detail that reduces onboarding friction.

### Scene 6 — Login (0:36–0:41)

> Standard email and password authentication. Bcrypt hashing at cost twelve, rate-limited endpoints, session cookies over HTTPS.

### Scene 7 — Dashboard (0:41–0:50)

> The dashboard is the operator's daily home. Appointments today, appointments this month, revenue, trial countdown, and an AI-generated briefing card on the right.

### Scene 8 — Calendar (0:50–0:59)

> The calendar handles day, week and month views. Per-practitioner availability windows, waitlist auto-offer, and token-based patient cancellation with no login required for the patient.

### Scene 9 — Patient management (0:59–1:07)

> Patient records are deliberately lightweight — no diagnoses, no medication, no dates of birth. Privacy by design, ready for GDPR alignment.

### Scene 10 — AI Assistant (1:07–1:16)

> The AI Practice Manager produces daily briefings, capacity warnings, and recommended actions. It runs through a swappable adapter — Claude or OpenAI, your choice.

### Scene 11 — Invoices (1:16–1:24)

> Invoicing generates PDFs through pdfkit. Payment tracking, status workflow, automated reminders via cron. All the billing plumbing is complete.

### Scene 12 — Online booking (1:24–1:31)

> Each practice gets a public profile page. Patients see practitioners, reviews and opening hours, then click through to a booking flow that takes no accounts.

### Scene 13 — Multi-language support (1:31–1:38)

> Twelve languages ship out of the box, including right-to-left Arabic and traditional Chinese. Full UI, full email templates, all centrally maintained.

### Scene 14 — Settings (1:38–1:46)

> The settings surface covers everything an operator needs to configure — practice details, opening hours, cancellation policy, invoice defaults, integrations.

### Scene 15 — Closing (1:46–1:54)

> PraxisOnline24. The product is complete. The domain, the deployment, the branding, the source code — asking price thirty-nine thousand dollars. Serious offers via Flippa.

---

## Total word count

Approximately 275 spoken words. At 145 wpm this reads in 1:53 with natural pauses — matches the 1:53.9 video runtime with a 1-second closing hold at end of scene 15.

## Trimming for a 1-minute cut

If Flippa's video slot requires 60 seconds, use scenes 1, 2, 7, 8, 10, 13, 15 only. Adjust the narration accordingly:

> This is PraxisOnline24 — a multilingual practice management platform. Twelve languages, three pricing tiers, complete dashboard, calendar with waitlist, and an AI-powered daily briefing. Thirty-nine thousand dollars. Full source, domain and deployment included. Serious offers via Flippa.
