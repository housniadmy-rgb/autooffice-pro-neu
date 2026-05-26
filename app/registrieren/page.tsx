"use client"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

const SUPABASE_URL = "https://pocgddnekqurlzlkywyn.supabase.co"
const SUPABASE_KEY = "sb_publishable_hlfO39j5ABT-17h_sV1jDQ_6keQz0ij"

export default function Registrieren() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [dsgvo, setDsgvo] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!dsgvo) { setMessage("Bitte akzeptieren Sie die Datenschutzerklärung."); return }
    setLoading(true)
    setMessage("")
    const res = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "apikey": SUPABASE_KEY },
      body: JSON.stringify({ email, password, data: { name } }),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) { setMessage(data.msg || "Registrierung fehlgeschlagen") }
    else {
      if (data.access_token) localStorage.setItem("supabase_token", data.access_token)
      setMessage("Registrierung erfolgreich!")
      setTimeout(() => router.push("/dashboard"), 1000)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="bg-gray-900 border border-gray-700 p-10 rounded-xl w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-center">Registrieren</h1>
        <form onSubmit={handleRegister} className="space-y-5">
          <div><label className="block text-lg mb-2">Name</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-4 rounded-lg bg-black border border-gray-700 text-white text-lg" placeholder="Ihr Name" required /></div>
          <div><label className="block text-lg mb-2">E-Mail</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-4 rounded-lg bg-black border border-gray-700 text-white text-lg" placeholder="ihre@email.de" required /></div>
          <div><label className="block text-lg mb-2">Passwort</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-4 rounded-lg bg-black border border-gray-700 text-white text-lg" placeholder="••••••••" required /></div>
          <div className="flex items-start gap-3">
            <input type="checkbox" checked={dsgvo} onChange={(e) => setDsgvo(e.target.checked)} className="mt-1 w-5 h-5" />
            <label className="text-gray-400 text-lg">Ich akzeptiere die <Link href="/datenschutz" className="text-white underline" target="_blank">Datenschutzerklärung</Link></label>
          </div>
          <button type="submit" disabled={loading} className="w-full bg-white text-black text-xl font-semibold py-4 rounded-lg hover:bg-gray-200 transition disabled:opacity-50">{loading ? "Wird registriert..." : "Konto erstellen"}</button>
        </form>
        {message && <p className="mt-4 text-center text-gray-400">{message}</p>}
        <p className="mt-6 text-center text-gray-400 text-lg">Bereits registriert? <Link href="/login" className="text-white underline">Jetzt anmelden</Link></p>
      </div>
    </main>
  )
}
