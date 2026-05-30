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
    <main className="min-h-screen p-4 sm:p-8 flex items-center justify-center">
      <div className="bg-white border border-blue-200 p-6 sm:p-10 rounded-lg sm:rounded-xl max-w-full sm:max-w-lg w-full">
        {!storniert ? (
          <>
            <h1 className="text-xl sm:text-2xl sm:text-3xl font-bold mb-6 text-center">Termin stornieren</h1>
            <form onSubmit={handleStorno} className="space-y-5">
              <div>
                <label className="block text-lg mb-2">Ihre E-Mail</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-4 rounded-lg bg-white border border-blue-200 text-gray-900 text-lg" placeholder="ihre@email.de" required />
              </div>
              <div>
                <label className="block text-lg mb-2">Grund (optional)</label>
                <input type="text" value={grund} onChange={(e) => setGrund(e.target.value)} className="w-full p-4 rounded-lg bg-white border border-blue-200 text-gray-900 text-lg" placeholder="z.B. Termin passt nicht" />
              </div>
              <button type="submit" className="w-full bg-red-600 text-gray-900 text-xl font-semibold py-3 sm:py-4 rounded-lg hover:bg-red-700 transition">Termin stornieren</button>
            </form>
          </>
        ) : (
          <div className="text-center">
            <h2 className="text-xl sm:text-2xl sm:text-3xl font-bold mb-4 text-green-400">Termin storniert</h2>
            <p className="text-lg text-gray-600 mb-6">Die Praxis wurde benachrichtigt. Falls ein anderer Termin frei wird, informieren wir Sie.</p>
            <Link href="/warteliste" className="inline-block bg-[#1E40AF] text-white text-lg font-semibold px-4 sm:px-6 py-3 rounded-lg hover:bg-green-600 transition">Auf Warteliste setzen</Link>
          </div>
        )}
        <div className="mt-6 text-center">
          <Link href="/" className="text-gray-900 underline text-lg">← Zurück</Link>
        </div>
      </div>
    </main>
  )
}
