import { NextResponse } from "next/server"

const SUPABASE_URL = "https://pocgddnekqurlzlkywyn.supabase.co"
const SUPABASE_KEY = "sb_publishable_hlfO39j5ABT-17h_sV1jDQ_6keQz0ij"

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json()
    
    const res = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_KEY,
      },
      body: JSON.stringify({ email, password, data: { name } }),
    })
    
    const data = await res.json()
    
    if (!res.ok) return NextResponse.json({ error: data.msg || "Registrierung fehlgeschlagen" }, { status: 400 })
    
    return NextResponse.json({ message: "Registrierung erfolgreich!" })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server-Fehler" }, { status: 500 })
  }
}
