import { NextResponse } from "next/server"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://pocgddnekqurlzlkywyn.supabase.co"
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_hlfO39j5ABT-17h_sV1jDQ_6keQz0ij"

export async function GET() {
  try {
    const usersRes = await fetch(`${SUPABASE_URL}/auth/v1/users`, {
      headers: { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}` },
    })
    const usersData = await usersRes.json()
    const userCount = usersData.users?.length ?? 0
    const heute = new Date().toLocaleDateString("de-DE")

    const report = {
      datum: heute,
      nutzer: userCount,
      status: "Automatischer CEO-Report",
      version: "1.0.0",
    }

    return NextResponse.json({ success: true, report })
  } catch {
    return NextResponse.json({ error: "Fehler beim Erstellen des Reports" }, { status: 500 })
  }
}
