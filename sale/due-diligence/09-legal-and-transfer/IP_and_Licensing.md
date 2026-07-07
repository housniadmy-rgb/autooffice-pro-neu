# PraxisOnline24 — Intellectual Property and Licensing

## Purpose

Formal declaration of intellectual property status for the PraxisOnline24 asset, and inventory of third-party licence obligations that transfer with the source code.

## Executive summary

**All original PraxisOnline24 code was authored by the seller as sole creator.** Every third-party dependency in `package.json` is permissively licensed (MIT, Apache 2.0 or ISC — no copyleft). No trademark is registered on "PraxisOnline24" in any jurisdiction. No patents apply.

## Original authorship declaration

- The seller is the sole author of all first-party source code, configuration files, documentation, screenshots, and video assets included in this sale.
- No code has been copied from proprietary third-party sources.
- No code has been generated or contributed under a `Contributor Licence Agreement` from any third party.
- The seller is not aware of any existing intellectual property claim by any third party against the codebase.
- The seller warrants full right and authority to transfer the intellectual property to the buyer as part of the asset sale.

This declaration is formalised in the Asset Purchase Agreement (template held in this folder).

## Trademark status

- **"PraxisOnline24" wordmark:** **not registered** as a trademark in any jurisdiction as of the sale date
- **Logo mark:** not registered as a trademark
- **Domain `praxisonline24.com`:** legally owned by the seller; transfer procedures documented in [Asset Transfer Checklist](./Asset_Transfer_Checklist.md)

The buyer receives the practical use of the name and marks but must decide whether to register their own trademark in the target jurisdiction after transfer. Typical registration cost: USD 300–500 per jurisdiction.

## Patents

- No patents are held by the seller on the PraxisOnline24 asset
- No patent claims are known to the seller against the codebase
- Not applicable to this asset sale

## Third-party dependency licensing

### Direct dependencies (production)

Every direct dependency listed in `package.json` is permissively licensed:

| Category | Dependency | Licence |
|---|---|---|
| HTTP framework | `express` | MIT |
| Session middleware | `express-session` | MIT |
| Cookie parsing | `cookie-parser` | MIT |
| Password hashing | `bcrypt` | MIT |
| PDF generation | `pdfkit` | MIT |
| Cron scheduling | `node-cron` | ISC |
| Storage engine | `sql.js` | MIT |
| UUID generation | `uuid` | MIT |
| CORS | `cors` | MIT |
| Environment variable loading | `dotenv` | BSD-2-Clause |
| Date manipulation | `moment` (deprecated; migrate to `date-fns`) | MIT |
| Nodemailer (installed, not currently used) | `nodemailer` | MIT |

> TODO — buyer's DD engineer should run `npx license-checker --production --summary` and confirm all transitive dependencies remain in the permissive set. Seller's spot-check has not identified any GPL, AGPL or other copyleft dependency.

### Development dependencies

- `nodemon` (MIT)
- `playwright` (Apache 2.0)

Development dependencies do not affect runtime IP obligations.

## Licence obligations that transfer to the buyer

- **Attribution:** the `LICENSE` files or notices of every third-party dependency remain in the transferred repository. Buyer must retain them.
- **Notice preservation:** any `NOTICE` files (particularly for Apache 2.0 dependencies) must be preserved in redistributed builds
- **No copyleft obligations:** because no copyleft dependencies are used, the buyer is free to keep the source code closed-source or open-source at their discretion

## First-party licence for buyer redistribution

Upon transfer, the buyer receives full ownership rights, including:

- The right to modify, extend, or replace any part of the code
- The right to distribute (or not distribute) the modified code
- The right to sell derived commercial products
- The right to relicence the code to their own customers or partners

Buyer's redistribution obligations are limited to preserving third-party attributions per each dependency's licence terms.

## Content licensing

- **Screenshots** in `sale/assets/flippa/screenshots/`: original works of the seller, transferred to the buyer
- **Demo videos** in `sale/assets/flippa/video/`: original works of the seller, transferred to the buyer
- **Brand assets** in `sale/assets/branding/`: original works of the seller, transferred to the buyer
- **Documentation** across `sale/`: original works of the seller, transferred to the buyer

No content in the transferred assets requires attribution to third-party creators, provided the buyer retains dependency `LICENSE` files as noted above.

## Fonts and typography

- No custom or licensed web fonts are loaded by the application
- System font stack (`-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif`) is used throughout
- No font licensing obligations transfer to the buyer

## Buyer's post-transfer IP checklist

- [ ] Register trademark in target market (if desired)
- [ ] Maintain third-party dependency `LICENSE` file preservation
- [ ] Update copyright notices to reflect the buyer as the new owner (if desired)
- [ ] Establish an IP monitoring cadence (Google Alerts on brand name; USPTO/EUIPO watch service if registering trademark)

## Warranties and disclaimers

The seller warrants:

- Original authorship of all first-party code
- No known third-party IP infringement
- Full right and authority to sell the asset
- No pending or threatened litigation regarding the asset

The seller disclaims:

- Any warranty regarding future third-party licence changes
- Any warranty regarding buyer's chosen registrations in target markets
- Any obligation to defend the asset against future third-party claims (this is the buyer's ongoing responsibility after transfer)

Full warranty language is in the Asset Purchase Agreement.

---

**NDA classification:** Confidential
**Last updated:** 2026-07-07
**Document owner:** The seller
**Related documents:** [Asset Transfer Checklist](./Asset_Transfer_Checklist.md), [Domain and Brand](../07-domain-and-brand-assets/Domain_and_Brand.md), [Technology Stack](../04-technical-documentation/Technology_Stack.md)
