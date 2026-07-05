# PraxisOnline24 — Final Flippa Upload Checklist

> One-page operating manual for the seller. Every listing field maps to an existing file under `sale/`. Follow top-to-bottom; expect ~30 minutes of upload work plus ~1 hour of listing polish before submitting for review.

---

## 0. Pre-flight (do these before opening the Flippa editor)

- [ ] **Live site is up:** `curl -s -o /dev/null -w "%{http_code}" https://praxisonline24.com/api/health` returns `200`.
- [ ] **Email deliverability is working:** SPF, DKIM, DMARC verified on `praxisonline24.com`. A test demo request from an incognito browser lands in the admin inbox within 60 s. (See `sale/assets/flippa/video/README.md` for a reproduction of the flow.)
- [ ] **DNS is stable:** Cloudflare zone points to Render; no half-migrated records.
- [ ] **Escrow method chosen:** Flippa Escrow is enabled on your Flippa account. Wire transfer or credit card is set up as backup.
- [ ] **Contact email is monitored:** you'll get buyer questions within hours of publishing — decide now whether to use your personal or a dedicated address.
- [ ] **Timezone matters:** buyers browse in UTC / US / EU business hours. Aim to publish Tuesday–Thursday 09:00 UTC for best first-24-hour visibility.

---

## 1. Listing text sections — which markdown file goes where

Flippa's listing editor has separate fields; paste from these files:

| Flippa field | Source file | What to paste |
|---|---|---|
| **Title** | `sale/flippa/listing-draft.md` → section "Title" | Use the primary title (79 chars) or an A/B alternative |
| **Short summary / tagline** | `sale/flippa/listing-draft.md` → "Short Summary" | Paste 100–140 words hero copy |
| **Full description** | `sale/flippa/listing-draft.md` → "Full Description" | Paste everything from "What you're buying" through "Risks and honest disclosures" |
| **Why selling** | `sale/flippa/listing-draft.md` → "Why the owner is selling" | Single-paragraph honest answer |
| **Monetisation** | `sale/flippa/listing-draft.md` → "Monetisation opportunities" | Numbered list, five angles |
| **Included assets / buyer package** | `sale/flippa/listing-draft.md` → "Buyer package" | Table format — Flippa accepts markdown-style lists |
| **Technical details** | `sale/flippa/listing-draft.md` → "Technical overview" | Stack + architecture summary |
| **Ideal buyer** | `sale/flippa/listing-draft.md` → "Ideal buyer" | Two lists (good fit / poor fit) |
| **Risks / honest disclosures** | `sale/flippa/listing-draft.md` → "Risks and honest disclosures" | ⚠️ Don't skip. Flippa favours transparent listings and boosts them algorithmically. |
| **Terms** | `sale/flippa/listing-draft.md` → "Terms" | Escrow + transfer window + hosting cost inheritance |

**Alternative titles for A/B testing:** section "Alternative titles" in `listing-draft.md`. Flippa allows title changes during the listing period.

---

## 2. Photos / Screenshots — upload order

Upload all 15 in the numeric filename order. The first uploaded is auto-selected as the cover image (buyer sees it before opening the listing).

| Order | File | Cover-candidate? | Caption (paste as alt text; Flippa accepts up to 140 chars) |
|---:|---|:-:|---|
| 1 | `01_homepage.png` | ✅ recommended | Multilingual public landing page in English — 12 locales built in |
| 2 | `02_pricing.png` | | Three pricing tiers driven by a single central config file |
| 3 | `03_demo_request.png` | | Automated demo onboarding form — creates practice + user + invite in seconds |
| 4 | `04_login.png` | | Bcrypt-hashed authentication with rate limiting |
| 5 | `05_dashboard.png` | alt cover | KPI cards + AI briefing + trial banner — what the operator sees on day one |
| 6 | `06_calendar.png` | | Day / week / month views · per-practitioner availability · waitlist auto-offer |
| 7 | `07_patients.png` | | Lightweight privacy-conscious patient records |
| 8 | `08_patient_profile.png` | | Individual patient history with appointment log and tags |
| 9 | `09_ai_assistant.png` | alt cover | LLM-backed daily briefing — swappable Claude / OpenAI adapter |
| 10 | `10_invoices.png` | | PDF invoice generation via pdfkit — paid / sent / draft workflow |
| 11 | `11_online_booking.png` | | Public practice profile + patient-facing booking flow |
| 12 | `12_settings.png` | | Practice configuration — hours, cancellation policy, integrations |
| 13 | `13_multilanguage.png` | ✅ strong candidate | Twelve languages including RTL Arabic — the differentiator screen |
| 14 | `14_mobile_view.png` | | Fully responsive PWA-ready mobile view on iPhone 15 Pro |
| 15 | `15_security.png` | | Set-password flow with visibility toggle — security-conscious onboarding |

**Cover-image recommendation:** upload `01_homepage.png` first (defaults to cover), or after upload manually re-select `13_multilanguage.png` — the 12-language grid is the strongest single-image differentiator against competitor SaaS listings.

**Sources for captions:** `sale/assets/flippa/screenshots/README.md` — "Gallery ordering" table.

---

## 3. Video — the single file to upload

**Upload this one:**

```
sale/assets/flippa/video/demo-video-burned.mp4
```

- Size: **6.9 MB** (well under Flippa's 100 MB cap)
- Duration: **1:53.9**
- Resolution: **1920 × 1080**
- Codec: **H.264 High** + **AAC** (silent) — Flippa-native
- Subtitles: **hard-burned** — no separate SRT track needed (Flippa's player doesn't render sidecar SRT anyway)
- Cursor: not visible (headless recording limitation; documented in `sale/assets/flippa/video/README.md`)
- Audio: silent by design (VO can be added post-purchase; script in `narration-script.md` is ready for a voice-over artist)

**Do NOT upload** `demo-video.mp4` (silent original — that's the source for VO later, not the buyer-facing version).

**Post-upload verification** (do these in the Flippa preview player):
- [ ] First frame ≈ Homepage (not black)
- [ ] Subtitle at second 2 reads "This is PraxisOnline24, a multilingual practice management platform…"
- [ ] Subtitle at second 10 reads "Three subscription tiers…"
- [ ] Subtitle at second 45 reads "The dashboard is the operator's daily home…"
- [ ] Duration shows **1:54** (Flippa rounds)
- [ ] Video plays without buffering after Flippa's internal transcode (~30–90 s)

If Flippa rejects the upload, check `sale/assets/flippa/video/README.md` section "How to re-record" for a re-transcode command that adds broader codec compatibility.

---

## 4. Buyer-facing documents (not uploaded to Flippa; linked to during due diligence)

Keep these files staged for buyer requests. Flippa's messaging system allows file attachments up to 25 MB — you'll paste snippets or attach whole files upon request.

| File | Send when buyer asks about… |
|---|---|
| `sale/flippa/buyer-faq.md` | Any first-round question — often answers before they even ask |
| `sale/flippa/due-diligence-checklist.md` | Serious buyers running structured DD |
| `sale/flippa/growth-roadmap.md` | Buyers asking "what would you do next?" |
| `sale/Technical_Due_Diligence.md` | Buyers with in-house engineering doing code review |
| `sale/Transfer_Checklist.md` | After offer-accepted, before escrow — walk them through handover |
| `sale/Pricing_Strategy.md` | Buyers questioning the price ceiling or unit economics |
| `sale/Executive_Summary.pdf` | Buyers who prefer a polished single-file overview |
| `sale/Investor_Pitch_Deck.pptx` | Buyers who are a fund or portfolio operator |
| `sale/PraxisOnline24_Investment_Report.docx` | Deep-dive institutional buyers |
| `sale/assets/flippa/video/README.md` | Buyers asking about video specs / VO addition |
| `sale/assets/flippa/video/narration-script.md` | Buyers wanting to commission a voice-over version |
| `sale/assets/flippa/video/shot-list.md` | Buyers wanting to re-record their own demo variant |

**Pro tip:** don't dump all documents on first contact. Send one file that matches the specific question. Buyers who receive 12 documents at once often disappear.

---

## 5. Final pre-publish checks (last hour before hitting "Submit")

**Product / infrastructure:**
- [ ] `curl https://praxisonline24.com/api/health` → `200`
- [ ] `curl https://praxisonline24.com/js/pricing-config.js` → returns `{"currency":"$","plans":{"BASIC":{"amount":29}…}}`
- [ ] Live homepage in English (`?lang=en`) shows correctly-rendered pricing $29 / $59 / $99
- [ ] A test demo request from incognito reaches admin inbox in < 60 s
- [ ] DNS SPF+DKIM+DMARC still valid: `dig +short TXT praxisonline24.com`
- [ ] Render deployment is on the intended commit; no accidental rollback
- [ ] `.env` files are NOT in git (git ls-files | grep -E "^\.env" should be empty)

**Listing consistency:**
- [ ] Every price in the listing text matches the live site ($29 / $59 / $99)
- [ ] Every screenshot filename matches the caption you paste
- [ ] The video's first-frame preview matches the "Homepage" screenshot (both are `/index.html?lang=en`)
- [ ] No stale references to "Business" tier — current live tiers are Basic / Pro / Unlimited
- [ ] Currency is `$` everywhere; if you later change to `€`, update `config/pricing.js` and the listing text simultaneously

**Legal / factual:**
- [ ] No claim of paying customers, MRR, ARR, or product-market fit
- [ ] No claim of HIPAA compliance
- [ ] "GDPR-conscious schema" language used, not "GDPR compliant"
- [ ] Trademark disclosure: "PraxisOnline24" is not registered — buyer can register in target market
- [ ] Escrow method and transfer window (7 days) stated explicitly

**Editor sanity:**
- [ ] All 15 screenshots visible in the gallery; ordering matches the numeric prefix
- [ ] Video preview player loads and plays
- [ ] "Asking price" set to **USD 49,000** (or your negotiated floor)
- [ ] Listing is set to correct category: **Businesses → SaaS → Pre-revenue** (or the closest Flippa equivalent)
- [ ] Listing is set to correct auction type: **Buy It Now** (recommended for pre-revenue), or **Auction** if you want price discovery

---

## 6. What NOT to upload to Flippa

These files exist for your reference and buyer-facing DD, but should stay OUT of the public listing.

| Do NOT upload | Reason |
|---|---|
| `sale/assets/flippa/video/demo-video.mp4` | Silent original — buyer-facing version is the burned one |
| `sale/assets/flippa/video/captions.srt` | Flippa's player ignores SRT sidecar files |
| `sale/assets/flippa/video/narration-script.md` | For a VO artist post-sale, not a listing asset |
| `sale/assets/flippa/video/shot-list.md` | Production doc for re-recording, not a listing asset |
| `sale/assets/flippa/video/README.md` | Internal video-spec doc |
| `sale/assets/flippa/screenshots/README.md` | Gallery meta-doc, not a screenshot |
| `sale/flippa/final-upload-checklist.md` | This file. Meta-doc for the seller only. |
| `sale/flippa/demo-video-script.md` | Earlier draft of the VO script — superseded by `sale/assets/flippa/video/narration-script.md` |
| `sale/flippa/screenshot-plan.md` | Earlier planning doc — superseded by the actual screenshot set |
| `sale/_build_*.py` | Build tooling for regenerating PDFs / DOCX / PPTX — for the buyer after transfer, not for Flippa |
| `sale/assets/branding/build-branding.js` | Same — buyer-side tooling |
| `sale/assets/demo/{captures,frames,frames-en}/` | Gitignored build artifacts. Not in the repo, definitely not on Flippa. |
| `sale/assets/screenshots/en/` | Older, lower-quality screenshot set — superseded by `sale/assets/flippa/screenshots/`. Do NOT upload duplicates. |
| `sale/assets/demo/praxisonline24-demo-en.mp4` | Older EN demo video (1.7 MB) — superseded by the Flippa video (6.9 MB burned) |
| `.env`, `.env.local` | Contains local secrets. Also gitignored — no accidental upload risk. |
| Any file with API keys, passwords, real user data | Belongs in Render dashboard / your password manager, never in Flippa |

---

## 7. Post-publish first-week actions

- [ ] Screenshot the published listing URL for your records
- [ ] Set a calendar reminder for day-3 (adjust title/tagline if traffic is low)
- [ ] Set a reminder for day-14 (Flippa's algo often quiets down after 2 weeks — refresh with a new intro paragraph)
- [ ] Enable Flippa's messaging notifications on your phone
- [ ] Keep a paper log of every serious enquiry: name, buyer profile, follow-up date
- [ ] If no serious enquiry after 21 days: revise asking price down or add a case-study-style testimonial (only if you can honestly obtain one from a beta practice)

---

## 8. What to do if a buyer wants to close fast

- [ ] Open a Loom or short call — pre-scheduled 30 min slot
- [ ] Share the GitHub repo via time-limited read access
- [ ] Grant a demo login to the live instance (the owner account you set up via `OWNER_INITIAL_PASSWORD`)
- [ ] Walk through `sale/flippa/due-diligence-checklist.md` sections A–J
- [ ] Agree on escrow terms — 7 day transfer window is standard
- [ ] Sign an asset purchase agreement (get one from Flippa's legal templates or your own attorney)
- [ ] Initiate escrow → transfer domain / GitHub / Render / Brevo per `sale/Transfer_Checklist.md`
- [ ] Release escrow after 7-day handover verification

---

## Reference — file map

Everything in this checklist points to files that already exist in the repo:

```
sale/
├── flippa/
│   ├── listing-draft.md              ← your listing copy
│   ├── buyer-faq.md                  ← buyer DD Q&A
│   ├── due-diligence-checklist.md    ← structured DD
│   ├── growth-roadmap.md             ← 12-month roadmap
│   ├── demo-video-script.md          ← superseded (older VO draft)
│   ├── screenshot-plan.md            ← superseded (planning doc)
│   └── final-upload-checklist.md     ← this file
└── assets/
    └── flippa/
        ├── screenshots/              ← 15 PNG uploads + README
        └── video/                    ← MP4 upload + narration + SRT + shot list
```

All commit hashes for these files are in the git log — search `Add Flippa` in `git log --oneline` to see the four commits that ship this package.

---

**No app code modified. No commit. No push.**
