import { NextRequest, NextResponse } from "next/server"

const BREVO_API_KEY = process.env.BREVO_API_KEY || "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"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { to, toName, subject, htmlContent } = body

    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": BREVO_API_KEY,
        "accept": "application/json",
      },
      body: JSON.stringify({
        sender: { name: "PraxisOnline24", email: "housniadmy@yahoo.de" },
        to: [{ email: to, name: toName || to }],
        subject: subject,
        htmlContent: htmlContent,
      }),
    })

    if (res.ok) {
      return NextResponse.json({ success: true })
    } else {
      const err = await res.json()
      return NextResponse.json({ error: err }, { status: 400 })
    }
  } catch {
    return NextResponse.json({ error: "Fehler" }, { status: 500 })
  }
}
