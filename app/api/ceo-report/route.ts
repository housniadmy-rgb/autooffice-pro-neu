import { NextResponse } from "next/server"

const SUPABASE_URL = "https://pocgddnekqurlzlkywyn.supabase.co"
const SUPABASE_KEY = "sb_publishable_hlfO39j5ABT-17h_sV1jDQ_6keQz0ij"

export async function GET() {
  try {
    const usersRes = await fetch(`${SUPABASE_URL}/auth/v1/users`, {
      headers: { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}` },
    })
    const usersData = await usersRes.json()
    const users = usersData.users || []
    const heute = new Date().toLocaleDateString("de-DE")

    return NextResponse.json({ success: true, report: { datum: heute, nutzer: users.length, status: "Alles automatisch" } })
  } catch { return NextResponse.json({ error: "Fehler" }, { status: 500 }) }
}
