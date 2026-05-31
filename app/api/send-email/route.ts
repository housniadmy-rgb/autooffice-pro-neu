import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { to, subject, html } = await request.json()
    const apiKey = process.env.BREVO_API_KEY || ""
    
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey,
        "accept": "application/json",
      },
      body: JSON.stringify({
        sender: { email: "housniadmy@yahoo.de", name: "PraxisOnline24" },
        to: [{ email: to }],
        subject,
        htmlContent: html,
      }),
    })

    const text = await res.text()
    let data
    try { data = JSON.parse(text) } catch { data = { text } }

    return NextResponse.json({ ok: res.ok, status: res.status, data, apikeyLength: apiKey.length })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
