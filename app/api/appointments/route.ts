import { NextRequest, NextResponse } from "next/server"

const SUPABASE_URL = "https://pocgddnekqurlzlkywyn.supabase.co"
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_hlfO39j5ABT-17h_sV1jDQ_6keQz0ij"
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || "sb_secret_Uo2vhqleUa90EOcCMlwBzg_QLeho1hQ"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const token = req.headers.get("authorization")?.replace("Bearer ", "")
    
    const res = await fetch(`${SUPABASE_URL}/rest/v1/appointments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_KEY,
        "Authorization": `Bearer ${token}`,
        "Prefer": "return=representation"
      },
      body: JSON.stringify(body)
    })
    
    const data = await res.json()
    return NextResponse.json(data, { status: res.ok ? 200 : 400 })
  } catch {
    return NextResponse.json({ error: "Fehler" }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "")
    const url = new URL(req.url)
    const practiceId = url.searchParams.get("practice_id")
    
    const res = await fetch(`${SUPABASE_URL}/rest/v1/appointments?practice_id=eq.${practiceId}&order=appointment_date.asc,appointment_time.asc`, {
      headers: {
        "apikey": SUPABASE_SERVICE_KEY,
        "Authorization": `Bearer ${token}`
      }
    })
    
    const data = await res.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: "Fehler" }, { status: 500 })
  }
}
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const email = body.email
    
    if (!email) {
      return NextResponse.json({ error: "E-Mail erforderlich" }, { status: 400 })
    }
    
    const res = await fetch(`${SUPABASE_URL}/rest/v1/appointments?patient_email=eq.${encodeURIComponent(email)}&status=eq.confirmed&order=created_at.desc&limit=1`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_KEY,
        "Prefer": "return=representation"
      },
      body: JSON.stringify({ status: "cancelled" })
    })
    
    if (res.ok) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ error: "Kein Termin gefunden" }, { status: 404 })
    }
  } catch {
    return NextResponse.json({ error: "Fehler" }, { status: 500 })
  }
}