"use client"

import { useState } from "react"
import Link from "next/link"

export default function Storno() {
  const [email, setEmail] = useState("")
  const [grund, setGrund] = useState("")
  const [storniert, setStorniert] = useState(false)

  const handleStorno = (e: React.FormEvent) => {
    e.preventDefault()
    setStorniert(true)
  }

  return (
    <main className="min-h-screen p-8 flex items-center justify-center">
      <div className="bg-gray-900 border border-gray-700 p-10 rounded-xl max-w-lg w-full">
        {!storniert ? (
          <>
            <h1 className="text-3xl font-bold mb-6 text-center">Termin stornieren</h1>
            <form onSubmit={handleStorno} className="space-y-5">
              <div>
                <label className="block text-lg mb-2">Ihre E-Mail</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-4 rounded-lg bg-black border border-gray-700 text-white text-lg" placeholder="ihre@email.de" required />
              </div>
              <div>
                <label className="block text-lg mb-2">Grund (optional)</label>
                <input type="text" value={grund} onChange={(e) => setGrund(e.target.value)} className="w-full p-4 rounded-lg bg-black border border-gray-700 text-white text-lg" placeholder="z.B. Termin passt nicht" />
              </div>
              <button type="submit" className="w-full bg-red-600 text-white text-xl font-semibold py-4 rounded-lg hover:bg-red-700 transition">Termin stornieren</button>
            </form>
          </>
        ) : (
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4 text-green-400">Termin storniert</h2>
            <p className="text-lg text-gray-300 mb-6">Die Praxis wurde benachrichtigt. Falls ein anderer Termin frei wird, informieren wir Sie.</p>
            <Link href="/warteliste" className="inline-block bg-white text-black text-lg font-semibold px-6 py-3 rounded-lg hover:bg-gray-200 transition">Auf Warteliste setzen</Link>
          </div>
        )}
        <div className="mt-6 text-center">
          <Link href="/" className="text-white underline text-lg">← Zurück</Link>
        </div>
      </div>
    </main>
  )
}
