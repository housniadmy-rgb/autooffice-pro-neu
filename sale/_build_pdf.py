"""Build Executive_Summary.pdf — one-pager perfect for Acquire.com."""
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm, mm
from reportlab.lib.colors import HexColor, white, black
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT, TA_JUSTIFY
from reportlab.platypus import (SimpleDocTemplate, Paragraph, Spacer, Table,
                                TableStyle, KeepTogether, HRFlowable)
from reportlab.pdfgen import canvas
from pathlib import Path

OUT = Path(__file__).parent / "Executive_Summary.pdf"

# ── Brand palette ────────────────────────────────────────────────────────
PRIMARY = HexColor("#1F497D")
ACCENT  = HexColor("#2A80D9")
LIGHTBG = HexColor("#F2F6FB")
GREY    = HexColor("#666666")
DARKGRY = HexColor("#333333")

# ── Custom canvas for header + footer ────────────────────────────────────
def on_page(canv, doc):
    width, height = A4
    # Top brand stripe
    canv.setFillColor(PRIMARY)
    canv.rect(0, height - 8*mm, width, 8*mm, fill=1, stroke=0)
    # Footer
    canv.setFillColor(GREY)
    canv.setFont("Helvetica", 8)
    canv.drawString(18*mm, 12*mm, "PraxisOnline24 — Executive Summary  |  Pre-Revenue SaaS Asset for Acquisition")
    canv.drawRightString(width - 18*mm, 12*mm, "https://www.praxisonline24.com")

# ── Document setup ───────────────────────────────────────────────────────
doc = SimpleDocTemplate(
    str(OUT), pagesize=A4,
    leftMargin=18*mm, rightMargin=18*mm,
    topMargin=20*mm, bottomMargin=18*mm,
    title="PraxisOnline24 — Executive Summary",
    author="PraxisOnline24",
)

styles = getSampleStyleSheet()
H1 = ParagraphStyle('H1', parent=styles['Heading1'],
                    fontName='Helvetica-Bold', fontSize=22,
                    textColor=PRIMARY, leading=24, spaceAfter=2, spaceBefore=2)
SUB = ParagraphStyle('SUB', parent=styles['Normal'],
                     fontName='Helvetica-Oblique', fontSize=10.5,
                     textColor=GREY, leading=13, spaceAfter=8)
H2 = ParagraphStyle('H2', parent=styles['Heading2'],
                    fontName='Helvetica-Bold', fontSize=10.5,
                    textColor=ACCENT, leading=13, spaceBefore=6, spaceAfter=2)
BODY = ParagraphStyle('BODY', parent=styles['Normal'],
                      fontName='Helvetica', fontSize=9.5, textColor=DARKGRY,
                      leading=12.5, alignment=TA_JUSTIFY, spaceAfter=3)
BULLET = ParagraphStyle('BULLET', parent=BODY, leftIndent=10, bulletIndent=0,
                        spaceAfter=1, leading=12)
SMALL = ParagraphStyle('SMALL', parent=styles['Normal'], fontName='Helvetica',
                       fontSize=8.5, textColor=GREY, leading=11, alignment=TA_LEFT)
FOOTNOTE = ParagraphStyle('FOOTNOTE', parent=styles['Normal'],
                          fontName='Helvetica-Oblique', fontSize=8,
                          textColor=GREY, leading=10, alignment=TA_LEFT)

story = []

# ── Title block ──────────────────────────────────────────────────────────
story.append(Paragraph("PraxisOnline24", H1))
story.append(Paragraph(
    "Production-ready, 12-language SaaS for medical practices "
    "&middot; Pre-revenue acquisition opportunity",
    SUB))
story.append(HRFlowable(width="100%", thickness=0.6, color=PRIMARY,
                        spaceBefore=2, spaceAfter=6))

# ── At a glance (3-column header) ────────────────────────────────────────
def stat(label, value):
    return [Paragraph(f"<font size=8 color='#666666'>{label}</font>", BODY),
            Paragraph(f"<font size=14 color='#1F497D'><b>{value}</b></font>", BODY)]

stat_table = Table([
    [stat("STATUS",          "Pre-Revenue"),
     stat("LIVE URL",        "praxisonline24.com"),
     stat("LANGUAGES",       "12 (incl. RTL Arabic)")],
    [stat("CODEBASE",        "~17,200 LoC JS"),
     stat("DATABASE",        "18 SQL tables"),
     stat("AUTOMATION",      "8 cron jobs")],
], colWidths=[59*mm, 59*mm, 59*mm], rowHeights=[14*mm, 14*mm])
stat_table.setStyle(TableStyle([
    ('BACKGROUND', (0,0), (-1,-1), LIGHTBG),
    ('BOX', (0,0), (-1,-1), 0.4, HexColor('#DCE3EC')),
    ('GRID', (0,0), (-1,-1), 0.4, HexColor('#DCE3EC')),
    ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ('LEFTPADDING', (0,0), (-1,-1), 6),
    ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ('TOPPADDING', (0,0), (-1,-1), 4),
    ('BOTTOMPADDING', (0,0), (-1,-1), 4),
]))
story.append(stat_table)
story.append(Spacer(1, 6))

# ── The product ──────────────────────────────────────────────────────────
story.append(Paragraph("The Product", H2))
story.append(Paragraph(
    "PraxisOnline24 is a fully built, deployed B2B SaaS for medical practices and "
    "small service businesses. It covers the entire patient lifecycle &mdash; public "
    "24/7 online booking, multi-practitioner calendar with conflict detection, "
    "patient portal, PDF invoicing with VAT, cron-driven waitlist auto-offer, "
    "review collection &amp; moderation, and a rule-based "
    "<b>AI Practice Manager</b> dashboard that turns daily operations data into "
    "prioritised actions across 14 sections. All UI shipped in <b>12 languages</b>, "
    "including RTL Arabic. Privacy-by-design: no health data ever stored; "
    "automatic patient-PII anonymisation 30 days after appointment.",
    BODY))

# ── What you get ─────────────────────────────────────────────────────────
story.append(Paragraph("What the Buyer Gets", H2))
items = [
    "Full Git repository (clean main, 16 phases shipped)",
    "Domain praxisonline24.com + Cloudflare zone",
    "Live Render.com deployment (Frankfurt) with render.yaml committed",
    "Brand assets: name, slogan, logo system, 33 HTML pages, 902-line CSS",
    "12 i18n catalogs + localized e-mail templates (booking, reminder, waitlist, trial, review)",
    "Documentation: 227-line README, 165-line DEPLOYMENT, 187-point QA checklist",
    "Full sale/ folder: investor report (DOCX), 12-slide pitch deck (PPTX), DD pack, transfer checklist",
]
for it in items:
    story.append(Paragraph("&bull; " + it, BULLET))

# ── Tech stack ───────────────────────────────────────────────────────────
story.append(Paragraph("Stack", H2))
story.append(Paragraph(
    "Node.js 18+ &middot; Express 4.18 &middot; SQLite via sql.js (Postgres "
    "migration path documented) &middot; bcrypt + session auth &middot; pdfkit "
    "&middot; node-cron &middot; nodemailer + Brevo &middot; vanilla HTML/CSS/JS "
    "frontend (no framework lock-in) &middot; Render.com Frankfurt &middot; "
    "Cloudflare TLS + CDN.",
    BODY))

# ── Valuation strip ──────────────────────────────────────────────────────
story.append(Paragraph("Valuation Guidance", H2))
def tier(label, range_text, note, accent_hex):
    return [
        Paragraph(f"<font size=8 color='white'><b>{label}</b></font>", BODY),
        Paragraph(f"<font size=12 color='#1F497D'><b>{range_text}</b></font>", BODY),
        Paragraph(f"<font size=7.5 color='#666666'>{note}</font>", BODY),
    ]

val_table = Table([
    [tier("QUICK SALE", "$8k–$15k", "10-15% of replacement cost",  "#C0392B"),
     tier("FAIR MARKET", "$18k–$32k", "Recommended list $24,500",   "#1F497D"),
     tier("OPTIMISTIC", "$35k–$55k", "Strategic 12-lang buyer",     "#27AE60")],
], colWidths=[59*mm, 59*mm, 59*mm])
val_table.setStyle(TableStyle([
    # background row by column (cell-level override below)
    ('BACKGROUND', (0,0), (0,0), HexColor("#C0392B")),
    ('BACKGROUND', (1,0), (1,0), HexColor("#1F497D")),
    ('BACKGROUND', (2,0), (2,0), HexColor("#27AE60")),
    ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ('LEFTPADDING', (0,0), (-1,-1), 6),
    ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ('TOPPADDING', (0,0), (-1,-1), 4),
    ('BOTTOMPADDING', (0,0), (-1,-1), 4),
]))
# Layer the white-bg main content below the colored header
val_body = Table([
    [Paragraph("<font size=12 color='#1F497D'><b>$8k–$15k</b></font>", BODY),
     Paragraph("<font size=12 color='#1F497D'><b>$18k–$32k</b></font>", BODY),
     Paragraph("<font size=12 color='#1F497D'><b>$35k–$55k</b></font>", BODY)],
    [Paragraph("<font size=7.5 color='#666666'>10–15% of repl. cost<br/>As-is, 7-day close</font>", BODY),
     Paragraph("<font size=7.5 color='#666666'>25–35% of repl. cost<br/>Recommended list $24,500</font>", BODY),
     Paragraph("<font size=7.5 color='#666666'>40–60% of repl. cost<br/>Strategic buyer w/ i18n monetisation</font>", BODY)],
], colWidths=[59*mm, 59*mm, 59*mm], rowHeights=[8*mm, 11*mm])
val_body.setStyle(TableStyle([
    ('BACKGROUND', (0,0), (-1,-1), LIGHTBG),
    ('GRID', (0,0), (-1,-1), 0.4, HexColor('#DCE3EC')),
    ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ('ALIGN', (0,0), (-1,-1), 'CENTER'),
    ('LEFTPADDING', (0,0), (-1,-1), 6),
    ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ('TOPPADDING', (0,0), (-1,-1), 4),
    ('BOTTOMPADDING', (0,0), (-1,-1), 4),
]))

# Header strip
val_header = Table([
    [Paragraph("<font size=8 color='white'><b>QUICK SALE</b></font>", BODY),
     Paragraph("<font size=8 color='white'><b>FAIR MARKET VALUE</b></font>", BODY),
     Paragraph("<font size=8 color='white'><b>OPTIMISTIC</b></font>", BODY)],
], colWidths=[59*mm, 59*mm, 59*mm], rowHeights=[6*mm])
val_header.setStyle(TableStyle([
    ('BACKGROUND', (0,0), (0,0), HexColor("#C0392B")),
    ('BACKGROUND', (1,0), (1,0), HexColor("#1F497D")),
    ('BACKGROUND', (2,0), (2,0), HexColor("#27AE60")),
    ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ('ALIGN', (0,0), (-1,-1), 'CENTER'),
    ('LEFTPADDING', (0,0), (-1,-1), 4),
    ('RIGHTPADDING', (0,0), (-1,-1), 4),
    ('TOPPADDING', (0,0), (-1,-1), 2),
    ('BOTTOMPADDING', (0,0), (-1,-1), 2),
]))

story.append(KeepTogether([val_header, val_body]))
story.append(Spacer(1, 3))
story.append(Paragraph(
    "Replacement-cost anchor: &euro;75k&ndash;&euro;120k (~$80k&ndash;$130k). "
    "Reasoning in <i>Pricing_Strategy.md</i>.",
    FOOTNOTE))

# ── Why ──────────────────────────────────────────────────────────────────
story.append(Paragraph("Why Now", H2))
story.append(Paragraph(
    "Owner built PraxisOnline24 as a learning + portfolio project; monetisation "
    "(Stripe) was paused in favor of a contact-form sales process, and the operator "
    "has shifted focus. The product is at a clean hand-off-ready state. Buyer "
    "inherits a deployed, multilingual, multi-tenant SaaS &mdash; ready to "
    "re-enable payment and launch into any of 12 language markets without "
    "rebuilding from scratch.",
    BODY))

# ── Next steps ───────────────────────────────────────────────────────────
story.append(Paragraph("Next Steps", H2))
story.append(Paragraph(
    "1. NDA &rarr; read-only repo invite. "
    "2. Walk Demo_Guide.md (27 min hands-on). "
    "3. Submit LOI via Acquire.com escrow. "
    "4. ~10 days to full handover incl. domain EPP transfer.",
    BODY))

doc.build(story, onFirstPage=on_page, onLaterPages=on_page)
print(f"Written: {OUT}")
