# Demo Guide — PraxisOnline24

> What to test, in what order, during your 15–30 minute evaluation.

The goal is to verify the product is real, deployed, and behaves as described — not to certify production readiness. Production hardening tasks are listed in `Technical_Due_Diligence.md` §16.

---

## Step 0 — Quick Sanity Check (1 min)

Open the live site: **https://www.praxisonline24.com**

Confirm:
- ✅ Page loads, design is consistent
- ✅ Top-right language switcher shows multiple languages (DE / EN / FR / ES / PT / AR / RU / ZH / HI / TH / TR / ID)
- ✅ Pricing page (`/preise.html`) shows three tiers — Basic / Pro / Business — at 29 / 59 / 99 €/month
- ✅ Legal pages (`/agb.html`, `/datenschutz.html`, `/impressum.html`) exist

If these load, the deployment chain (Cloudflare → Render → Node) is healthy.

---

## Step 1 — Create a Test Account (3 min)

1. Click **"Kostenlos starten"** in the header, or visit `/register.html`
2. Fill in:
   - First name: `Test`
   - Last name: `User`
   - Practice name: `Test Praxis`
   - E-mail: a real address you can check
   - Password: at least 8 chars
   - Package: `BASIC`
3. Submit → you should be redirected to the dashboard
4. Verify in the e-mail inbox: a registration confirmation should arrive (if the SMTP env is configured on the live deployment; otherwise the e-mail content is in the server logs)

**What you have just verified:**
- 30-day trial start (visible in `subscription.html`)
- bcrypt password hashing (you cannot guess what was stored)
- E-mail templating in your selected language
- Multi-tenant practice creation (one `practices` row + one `users` row)

---

## Step 2 — Set Up a Practitioner (2 min)

1. Dashboard → **Behandler / Practitioners** → `/practitioners.html`
2. Click **+ Neuer Behandler** (New Practitioner)
3. Fill: First / last name, title (e.g. Dr.), specialty, e-mail
4. Save
5. Click the **clock icon** on the new row to set availability (e.g., Mon–Fri 09:00–17:00)
6. Save

**What you have just verified:**
- Practitioner CRUD + availability table (`practitioner_availability`)
- BASIC plan cap (try creating a 4th — you should see an upsell error)

---

## Step 3 — Test the Public Booking Flow (5 min)

1. Get your practice ID from `/settings.html` or the URL parameter shown on the dashboard
2. Open `/booking.html?p=YOUR_PRACTICE_ID` in a private/incognito window (so it is treated like a patient)
3. Try switching languages with the top-right flag dropdown — labels should change to the selected language; Arabic should flip to RTL
4. Step 1: pick the practitioner you created
5. Step 2: pick a date — only the days where you set availability should be selectable
6. Step 3: pick a time slot
7. Step 4: enter patient name, e-mail
8. Submit
9. Verify:
   - ✅ Confirmation page shows, with a cancel link and a download-ICS button
   - ✅ Booking confirmation arrives in patient's inbox (or appears in server logs if dev-mode mail)
   - ✅ The slot is gone from the picker if you try to book it again
10. **Optional:** test the cancel link — it should open `/cancel.html?token=...` and ask for confirmation; cancelling should free the slot

**What you have just verified:**
- Public booking with no auth
- Availability constraints actually enforced
- Conflict detection (no double-booking)
- ICS calendar export
- Token-based cancellation (one-time use)
- Multilingual UX including RTL

---

## Step 4 — Test the Admin Calendar (2 min)

Log back into the admin dashboard.

1. `/appointments.html` should show the appointment you just booked as a patient
2. Switch between Day / Week / Month views
3. Click the appointment → confirm status workflow (scheduled → completed / cancelled / no-show)
4. Try the **Archived appointments** filter

**What you have verified:**
- Real-time admin reflection of patient-side activity
- Status workflow + archive filter

---

## Step 5 — Test the Invoicing (3 min)

1. `/invoices.html` → **Neue Rechnung**
2. Pick patient (auto-populated from appointments), add 1–2 line items, set VAT
3. Save → status `draft`
4. Click **PDF**
5. Verify the PDF downloads, contains practice name, address, patient name, line items, total, German disclaimer

**What you have verified:**
- pdfkit integration
- Multi-tenant invoicing
- VAT calculation

---

## Step 6 — Test the AI Practice Manager (3 min)

1. `/ai-praxismanager.html`
2. Wait for the JSON payload to render — this calls `GET /api/ai-praxismanager`
3. Inspect the sections:
   - **Tagesbericht** (Today's report)
   - **Finanzübersicht** (Financial overview)
   - **Termin-Analyse** (Appointment analytics)
   - **Bewertungen** (Reviews) — empty for new account
   - **Warteliste** (Waitlist)
   - **Hinweise** (Hints — in your account language)
   - **Prioritäten heute** (Today's priorities)
   - **KI-Empfehlungen** (KI recommendations)
   - **Umsatzprognose** (Revenue forecast)
   - **Auslastungsprognose 7 Tage** (7-day utilization forecast)
   - **Warnungen** (Warnings)
   - **Setup-Todos** (auto-generated setup tasks)
   - **Ampel-Empfehlungen** (Traffic-light Finance / Utilization / Reviews / Waitlist)

**What you have verified:**
- The "AI" is a deterministic rule engine — fast, predictable, localizable
- 14 sections produced from current DB state
- All hints localized to the practice's selected language

> **Note:** This is **not** an LLM. The label is marketing. If you want a real LLM summary, the JSON output is a perfect input — plug Claude / GPT in via one function (1–2 days work).

---

## Step 7 — Test the Waitlist (3 min)

1. Open `/waitlist.html?p=YOUR_PRACTICE_ID` in a private window (as a patient)
2. Sign up with a different e-mail
3. Back in admin → cancel the appointment from Step 3
4. Wait a few seconds → check the waitlist admin (`/waitlist-admin.html`) — the waiting patient should now have an "offered" status with a token expiring in 4 hours
5. As the patient, open the offer link → `/waitlist-accept.html?token=...` → claim the slot

**What you have verified:**
- Cron-triggered waitlist offer engine
- 4-hour token expiry
- Status transitions (waiting → offered → booked)

---

## Step 8 — Test Reviews (2 min)

1. Public review form: `/review.html?p=YOUR_PRACTICE_ID`
2. Submit a 5-star review with a comment
3. Admin: `/reviews.html` → new review appears with **visible=0**
4. Approve → it now shows on the public practice page `/practice.html?p=YOUR_PRACTICE_ID`
5. Try a 1-star review → in the AI Praxismanager dashboard, you should see a red warning the next refresh

**What you have verified:**
- Review submission with no auth
- Admin moderation workflow
- Public practice page

---

## Step 9 — Multi-Language Spot Check (2 min)

Switch your account language at `/settings.html` to something exotic (e.g., Arabic or Thai). Reload the dashboard.

Confirm:
- All labels switched
- Arabic dashboard layout is RTL
- The AI Practice Manager hints render in your selected language

**What you have verified:**
- 12-language i18n is real, not stubs

---

## Step 10 — API Health & Server Logs (1 min)

1. Open `https://www.praxisonline24.com/api/health`
2. Should return `{"status":"ok","app":"PraxisOnline24"}`
3. (Optional, if seller grants Render dashboard access): inspect the logs to see cron jobs firing on schedule

---

## What This Demo Does NOT Cover

- Production load behaviour (no load testing data exists)
- 2FA, CSRF, CSP (these gaps are documented; addable post-close)
- Real Stripe checkout (deactivated; the `/praxis-anfragen` form is wired up instead)
- Native-quality translations for RU / ZH / HI / TH (machine-translated baseline)

---

## Estimated Total Demo Time

| Step | Min |
|---|---|
| 0. Sanity check | 1 |
| 1. Register | 3 |
| 2. Practitioner | 2 |
| 3. Public booking | 5 |
| 4. Admin calendar | 2 |
| 5. Invoicing | 3 |
| 6. AI Practice Manager | 3 |
| 7. Waitlist | 3 |
| 8. Reviews | 2 |
| 9. Language switch | 2 |
| 10. Health check | 1 |
| **Total** | **27 min** |

After 27 minutes you have hands-on confirmation of every value claim in the listing.
