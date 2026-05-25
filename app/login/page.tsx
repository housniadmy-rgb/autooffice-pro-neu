"use client"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function Login() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()
    setLoading(false)

    if (data.error) {
      setMessage(data.error)
    } else {
      setMessage("Login erfolgreich! Leite weiter...")
      setTimeout(() => router.push("/dashboard"), 1500)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="bg-gray-900 border border-gray-700 p-10 rounded-xl w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-center">Anmelden</h1>
        <form onSubmit={handleLogin} className="space-y-5">
          <div><label className="block text-lg mb-2">E-Mail</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-4 rounded-lg bg-black border border-gray-700 text-white text-lg" placeholder="ihre@email.de" required /></div>
          <div><label className="block text-lg mb-2">Passwort</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-4 rounded-lg bg-black border border-gray-700 text-white text-lg" placeholder="••••••••" required /></div>
          <button type="submit" disabled={loading} className="w-full bg-white text-black text-xl font-semibold py-4 rounded-lg hover:bg-gray-200 transition disabled:opacity-50">{loading ? "Wird angemeldet..." : "Anmelden"}</button>
        </form>
        {message && <p className="mt-4 text-center text-gray-400">{message}</p>}
        <p className="mt-6 text-center text-gray-400 text-lg">Noch kein Konto? <Link href="/registrieren" className="text-white underline">Jetzt registrieren</Link></p>
      </div>
    </main>
  )
}
