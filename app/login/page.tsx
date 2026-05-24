"use client"
import { useState } from "react"
import Link from "next/link"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState("")

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="bg-gray-900 border border-gray-700 p-10 rounded-xl w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-center">Anmelden</h1>
        <form onSubmit={(e) => { e.preventDefault(); setMessage("Anmeldung erfolgreich!"); }} className="space-y-5">
          <div><label className="block text-lg mb-2">E-Mail</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-4 rounded-lg bg-black border border-gray-700 text-white text-lg" placeholder="ihre@email.de" required /></div>
          <div><label className="block text-lg mb-2">Passwort</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-4 rounded-lg bg-black border border-gray-700 text-white text-lg" placeholder="••••••••" required /></div>
          <button type="submit" className="w-full bg-white text-black text-xl font-semibold py-4 rounded-lg hover:bg-gray-200 transition">Anmelden</button>
        </form>
        {message && <p className="mt-4 text-center text-gray-400">{message}</p>}
        <p className="mt-6 text-center text-gray-400 text-lg">Noch kein Konto? <Link href="/registrieren" className="text-white underline">Jetzt registrieren</Link></p>
      </div>
    </main>
  )
}
