import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()
    
    const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
      },
      body: JSON.stringify({ email, password }),
    })
    
    const data = await res.json()
    
    if (!res.ok) return NextResponse.json({ error: data.error_description || "Login fehlgeschlagen" }, { status: 400 })
    
    return NextResponse.json({ message: "Login erfolgreich!" })
  } catch {
    return NextResponse.json({ error: "Server-Fehler" }, { status: 500 })
  }
}
