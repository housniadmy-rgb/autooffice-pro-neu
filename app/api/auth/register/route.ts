import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
)

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json()
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } }
    })

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    return NextResponse.json({ message: "Registrierung erfolgreich!", user: data.user })
  } catch {
    return NextResponse.json({ error: "Server-Fehler" }, { status: 500 })
  }
}
