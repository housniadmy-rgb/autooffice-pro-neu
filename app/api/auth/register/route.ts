import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json()
    
    const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
        "Authorization": `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""}`,
      },
      body: JSON.stringify({ email, password, data: { name } }),
    })
    
    const data = await res.json()
    console.log("REGISTER RESPONSE:", data)
    
    if (!res.ok) return NextResponse.json({ error: data.msg || data.message || "Registrierung fehlgeschlagen" }, { status: 400 })
    
    return NextResponse.json({ message: "Registrierung erfolgreich!" })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server-Fehler" }, { status: 500 })
  }
}
