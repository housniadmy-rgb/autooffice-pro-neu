"use client"
import { useState } from "react"
import Link from "next/link"

export default function Termin() {
  const [email, setEmail] = useState("")
  const [datum, setDatum] = useState("")
  const [uhrzeit, setUhrzeit] = useState("")
  const [gesendet, setGesendet] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: email,
          subject: "Ihre Termin-Erinnerung",
          html: `<h2>Termin-Erinnerung</h2><p>Ihr Termin am <strong>${datum}</strong> um <strong>${uhrzeit} Uhr</strong>.</p><p><a href="https://autooffice-pro-neu.vercel.app/storno">Termin stornieren</a></p>`,
        }),
      })
      setGesendet(true)
    } catch (err) {
      alert("Fehler beim Senden")
    }
    setLoading(false)
  }

  return (
    <main className="min-h-screen p-4 sm:p-8 flex items-center justify-center">
      <div className="bg-white border border-blue-200 p-6 sm:p-10 rounded-lg sm:rounded-xl max-w-full sm:max-w-lg w-full">
        {!gesendet ? (
          <>
            <h1 className="text-xl sm:text-2xl sm:text-3xl font-bold mb-6 text-center">Termin-Erinnerung</h1>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div><label className="block text-lg mb-2">E-Mail des Patienten</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-4 rounded-lg bg-white border border-blue-200 text-gray-900 text-lg" placeholder="patient@email.de" required /></div>
              <div><label className="block text-lg mb-2">Datum</label><input type="date" value={datum} onChange={(e) => setDatum(e.target.value)} className="w-full p-4 rounded-lg bg-white border border-blue-200 text-gray-900 text-lg" required /></div>
              <div><label className="block text-lg mb-2">Uhrzeit</label><input type="time" value={uhrzeit} onChange={(e) => setUhrzeit(e.target.value)} className="w-full p-4 rounded-lg bg-white border border-blue-200 text-gray-900 text-lg" required /></div>
              <button type="submit" disabled={loading} className="w-full bg-[#1E40AF] text-white text-xl font-semibold py-3 sm:py-4 rounded-lg hover:bg-green-600 transition disabled:opacity-50">{loading ? "Sende..." : "Erinnerung senden"}</button>
            </form>
          </>
        ) : (
          <div className="text-center">
            <h2 className="text-xl sm:text-2xl sm:text-3xl font-bold mb-4 text-green-400">E-Mail gesendet!</h2>
            <p className="text-lg text-gray-600 mb-2">Termin: {datum} um {uhrzeit} Uhr</p>
            <p className="text-lg text-gray-600 mb-6">Patient: {email}</p>
            <button onClick={() => setGesendet(false)} className="bg-[#1E40AF] text-white text-lg font-semibold px-4 sm:px-6 py-3 rounded-lg hover:bg-green-600 transition">Neue Erinnerung</button>
          </div>
        )}
        <div className="mt-6 text-center"><Link href="/" className="text-gray-900 underline text-lg">← Zurück</Link></div>
      </div>
    </main>
  )
}
