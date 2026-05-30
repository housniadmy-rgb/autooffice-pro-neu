"use client"
import { useState } from "react"
import Link from "next/link"

const SUPABASE_URL = "https://pocgddnekqurlzlkywyn.supabase.co"
const SUPABASE_KEY = "sb_publishable_hlfO39j5ABT-17h_sV1jDQ_6keQz0ij"

export default function PasswortVergessen() {
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    const res = await fetch(`${SUPABASE_URL}/auth/v1/recover`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "apikey": SUPABASE_KEY },
      body: JSON.stringify({ email }),
    })

    setLoading(false)
    if (res.ok) {
      setMessage("✅ Ein Link zum Zurücksetzen wurde an " + email + " gesendet. Bitte prüfen Sie Ihr Postfach.")
    } else {
      setMessage("❌ Fehler. Bitte versuchen Sie es erneut.")
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4 sm:p-8">
      <div className="bg-white border border-blue-200 shadow-lg p-6 sm:p-10 rounded-lg sm:rounded-xl max-w-full sm:max-w-md w-full">
        <h1 className="text-xl sm:text-2xl sm:text-3xl font-bold mb-4 text-center text-gray-900">Passwort vergessen</h1>
        <p className="text-gray-500 text-lg text-center mb-6">Geben Sie Ihre E-Mail ein. Wir senden Ihnen einen Link zum Zurücksetzen.</p>
        <form onSubmit={handleReset} className="space-y-5">
          <div><label className="block text-lg mb-2 text-gray-700">E-Mail</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-4 rounded-lg bg-white border border-blue-200 text-gray-900 text-lg" placeholder="ihre@email.de" required /></div>
          <button type="submit" disabled={loading} className="w-full bg-[#3B82F6] text-white text-xl font-semibold py-3 sm:py-4 rounded-lg hover:bg-blue-600 transition disabled:opacity-50">{loading ? "Wird gesendet..." : "Link zusenden"}</button>
        </form>
        {message && <p className="mt-4 text-center text-gray-700">{message}</p>}
        <p className="mt-6 text-center text-gray-500 text-lg"><Link href="/login" className="text-[#3B82F6] hover:text-blue-600 underline">← Zurück zum Login</Link></p>
      </div>
    </main>
  )
}
