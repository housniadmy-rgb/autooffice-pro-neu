import { NextRequest, NextResponse } from "next/server"

const SUPABASE_URL = "https://pocgddnekqurlzlkywyn.supabase.co"
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_hlfO39j5ABT-17h_sV1jDQ_6keQz0ij"

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
        "apikey": SUPABASE_KEY,
        "Authorization": `Bearer ${token}`
      }
    })
    
    const data = await res.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: "Fehler" }, { status: 500 })
  }
}