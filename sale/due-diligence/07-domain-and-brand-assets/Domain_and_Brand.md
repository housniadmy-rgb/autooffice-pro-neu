# PraxisOnline24 — Domain and Brand

## Purpose

Documents the ownership of the `praxisonline24.com` domain and the transferable brand kit. Answers: *what real intellectual property does the buyer inherit?*

## Executive summary

**Domain `praxisonline24.com`** is registered and transferable. The full **brand kit** — logo variants, favicon, wordmark, colour palette — is committed in the repository at `sale/assets/branding/` and transfers with the source code. **No trademark** is registered on the "PraxisOnline24" name; the buyer may register in their target market.

## Domain

- **Domain:** `praxisonline24.com`
- **Registrar:** Hostinger
- **DNS provider:** Cloudflare (delegated from Hostinger)
- **Registration status:** > TODO — insert current registration expiry date and renewal cadence at DD stage
- **Whois transparency:** > TODO — confirm whether whois privacy is currently enabled
- **Transferability:** yes, via standard EPP auth-code process

### Transfer procedure

1. Seller unlocks the domain in the Hostinger registrar dashboard
2. Seller generates the EPP auth-code and shares it with the buyer (via escrow-protected channel)
3. Buyer initiates transfer at their preferred registrar
4. Buyer approves the transfer email
5. Transfer completes typically within 5–7 days
6. DNS remains delegated to Cloudflare during transfer (no interruption)

### Related subdomains and sister products

- `www.praxisonline24.com` — canonical redirect to apex domain (301)
- **Sister product** at `doctoronline24.com` — separate repository, separate deployment, shared origin codebase; **not part of this sale** and remains with the seller

## Trademark

- **Registered trademarks on "PraxisOnline24":** none
- **Registration in target market:** buyer's opportunity; typical cost USD 300–500 per jurisdiction
- **Freedom-to-operate check:** > TODO — buyer should perform a trademark search in their intended market before launch; no seller-side conflicts are known

## Brand assets

### Logo and identity

The complete brand kit lives in `sale/assets/branding/` and comprises:

| File | Purpose | Format |
|---|---|---|
| `wordmark-logo.svg` | Voll-wordmark, scalable vector | SVG |
| `wordmark-logo.png` | Voll-wordmark, raster fallback | PNG |
| `icon.svg` | Icon-only mark, scalable vector | SVG |
| `icon.png` | Icon-only mark, raster fallback | PNG |
| `favicon.png` | Favicon 32×32 | PNG |
| `acquire-logo.png` | Alternate placement for header contexts | PNG |
| `build-branding.js` | Node script to regenerate PNGs from SVGs | JavaScript |

### Colour palette

Colour tokens are defined in `public/css/style.css` as CSS variables:

> TODO — extract exact hex values from `public/css/style.css` and list here (typically `--primary`, `--secondary`, `--text`, `--bg`, `--border`)

Approximate palette (visual inspection): blue accent as primary, warm neutral greys, black text on white background, single-shade success/warning/danger accents.

### Typography

- Body text: system font stack (San Francisco / Segoe UI / Roboto)
- No custom web fonts loaded — deliberate choice to eliminate FOUT and reduce load time
- Fallback: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`

### Brand voice guidelines

> TODO — buyer to formalise if they wish. Current tone (visible across the app and email templates): professional, calm, no marketing hyperbole, clear German → clear English equivalents, no exclamation marks in transactional communications.

## Marketing screenshots and media

Separate documentation lives in [Media Checklist](../08-screenshots-and-media/Media_Checklist.md). Summary: 15 Retina-quality product screenshots plus a 1:53 demo video, all captured with realistic English demo data.

## What the buyer inherits versus what they build

**Inherits:** domain, DNS zone, TLS certificates, brand kit, favicon, product screenshots, demo video.

**Must build:** brand guidelines document (if formality required), any additional marketing assets (blog banners, social media cards, presentation templates), any translated marketing copy beyond the transactional email templates.

## Transfer sequence for brand + domain

1. **Under NDA:** buyer receives copies of the brand kit and screenshots for evaluation
2. **After LOI:** buyer receives full commit history of `sale/assets/branding/`
3. **In escrow:** domain unlock code shared via escrow-protected channel
4. **Post-escrow:** domain registrar transfer initiated; brand kit copies confirmed on buyer's storage
5. **Day 30:** any residual brand asset requests handled through the async support window

## Buyer verification steps

- Whois lookup on `praxisonline24.com` to confirm current ownership
- View source of the live homepage to confirm the SVG logo loads correctly
- Confirm all brand asset files are in the transferred repository
- Confirm CSS variables in `public/css/style.css` match documented palette

---

**NDA classification:** Public (previews) → Share after NDA (transfer specifics)
**Last updated:** 2026-07-07
**Document owner:** The seller
**Related documents:** [Media Checklist](../08-screenshots-and-media/Media_Checklist.md), [Asset Transfer Checklist](../09-legal-and-transfer/Asset_Transfer_Checklist.md), [Infrastructure](../05-architecture/Infrastructure.md)
