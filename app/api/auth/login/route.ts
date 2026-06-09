import { NextResponse } from "next/server"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://pocgddnekqurlzlkywyn.supabase.co"
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_hlfO39j5ABT-17h_sV1jDQ_6keQz0ij"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()
    const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "apikey": SUPABASE_KEY },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()
    if (!res.ok) return NextResponse.json({ error: data.error_description || "Login fehlgeschlagen" }, { status: 401 })
    return NextResponse.json({ access_token: data.access_token, user: data.user })
  } catch {
    return NextResponse.json({ error: "Serverfehler" }, { status: 500 })
  }
}
