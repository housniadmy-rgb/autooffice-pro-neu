"use client"

import { useState } from "react"
import Link from "next/link"

export default function Termin() {
  const [email, setEmail] = useState("")
  const [datum, setDatum] = useState("")
  const [uhrzeit, setUhrzeit] = useState("")
  const [gesendet, setGesendet] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setGesendet(true)
  }

  return (
    <main className="min-h-screen p-8 flex items-center justify-center">
      <div className="bg-gray-900 border border-gray-700 p-10 rounded-xl max-w-lg w-full">
        {!gesendet ? (
          <>
            <h1 className="text-3xl font-bold mb-6 text-center">Termin-Erinnerung</h1>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-lg mb-2">E-Mail des Patienten</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-4 rounded-lg bg-black border border-gray-700 text-white text-lg" placeholder="patient@email.de" required />
              </div>
              <div>
                <label className="block text-lg mb-2">Datum</label>
                <input type="date" value={datum} onChange={(e) => setDatum(e.target.value)} className="w-full p-4 rounded-lg bg-black border border-gray-700 text-white text-lg" required />
              </div>
              <div>
                <label className="block text-lg mb-2">Uhrzeit</label>
                <input type="time" value={uhrzeit} onChange={(e) => setUhrzeit(e.target.value)} className="w-full p-4 rounded-lg bg-black border border-gray-700 text-white text-lg" required />
              </div>
              <button type="submit" className="w-full bg-white text-black text-xl font-semibold py-4 rounded-lg hover:bg-gray-200 transition">Erinnerung senden</button>
            </form>
          </>
        ) : (
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4 text-green-400">Erinnerung gesendet!</h2>
            <p className="text-lg text-gray-300 mb-2">Termin: {datum} um {uhrzeit} Uhr</p>
            <p className="text-lg text-gray-300 mb-6">Patient: {email}</p>
            <button onClick={() => setGesendet(false)} className="bg-white text-black text-lg font-semibold px-6 py-3 rounded-lg hover:bg-gray-200 transition">Neue Erinnerung</button>
          </div>
        )}
        <div className="mt-6 text-center">
          <Link href="/" className="text-white underline text-lg">← Zurück</Link>
        </div>
      </div>
    </main>
  )
}
