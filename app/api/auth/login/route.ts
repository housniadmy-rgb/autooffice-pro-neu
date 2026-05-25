import { NextResponse } from "next/server"

const SUPABASE_URL = "https://pocgddnekqurlzlkywyn.supabase.co"
const SUPABASE_KEY = "sb_publishable_hlfO39j5ABT-17h_sV1jDQ_6keQz0ij"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()
    
    const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_KEY,
      },
      body: JSON.stringify({ email, password }),
    })
    
    const data = await res.json()
    
    if (!res.ok) return NextResponse.json({ error: data.error_description || "Login fehlgeschlagen" }, { status: 400 })
    
    return NextResponse.json({ message: "Login erfolgreich!" })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server-Fehler" }, { status: 500 })
  }
}
