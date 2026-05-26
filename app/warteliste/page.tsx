"use client"

import { useState } from "react"
import Link from "next/link"

export default function Warteliste() {
  const [email, setEmail] = useState("")
  const [wuensche, setWuensche] = useState("")
  const [eingetragen, setEingetragen] = useState(false)
  const [position] = useState(Math.floor(Math.random() * 5) + 1)

  const handleEintrag = (e: React.FormEvent) => {
    e.preventDefault()
    setEingetragen(true)
  }

  return (
    <main className="min-h-screen p-8 flex items-center justify-center">
      <div className="bg-gray-900 border border-gray-700 p-10 rounded-xl max-w-lg w-full">
        {!eingetragen ? (
          <>
            <h1 className="text-3xl font-bold mb-6 text-center">Warteliste</h1>
            <p className="text-lg text-gray-400 mb-6 text-center">Tragen Sie sich ein – wir benachrichtigen Sie, sobald ein Termin frei wird.</p>
            <form onSubmit={handleEintrag} className="space-y-5">
              <div>
                <label className="block text-lg mb-2">Ihre E-Mail</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-4 rounded-lg bg-black border border-gray-700 text-white text-lg" placeholder="ihre@email.de" required />
              </div>
              <div>
                <label className="block text-lg mb-2">Bevorzugte Uhrzeit (optional)</label>
                <input type="text" value={wuensche} onChange={(e) => setWuensche(e.target.value)} className="w-full p-4 rounded-lg bg-black border border-gray-700 text-white text-lg" placeholder="z.B. Vormittags" />
              </div>
              <button type="submit" className="w-full bg-white text-black text-xl font-semibold py-4 rounded-lg hover:bg-gray-200 transition">Auf Warteliste setzen</button>
            </form>
          </>
        ) : (
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4 text-green-400">Sie sind auf der Warteliste!</h2>
            <p className="text-2xl font-bold text-white mb-4">Position: {position}</p>
            <p className="text-lg text-gray-300 mb-6">Sobald ein Termin frei wird, bekommen Sie automatisch eine E-Mail. Sie können den Termin dann mit einem Klick übernehmen.</p>
            <Link href="/" className="inline-block bg-white text-black text-lg font-semibold px-6 py-3 rounded-lg hover:bg-gray-200 transition">Zurück zur Startseite</Link>
          </div>
        )}
      </div>
    </main>
  )
}
