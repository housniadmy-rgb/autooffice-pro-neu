"use client"
import { useState } from "react"
import Link from "next/link"

export default function TerminStornieren() {
  const [cancelled, setCancelled] = useState(false)
  const [email, setEmail] = useState("")
  const [terminId, setTerminId] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

    const handleCancel = async () => {
    if (!email) return
    setLoading(true)
    setError("")
    
    try {
    const res = await fetch("/api/appointments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email })
      })
      
      if (res.ok) {
        setCancelled(true)
      } else {
        setError("Kein aktiver Termin mit dieser E-Mail gefunden.")
      }
    } catch {
      setError("Ein Fehler ist aufgetreten.")
    }
    setLoading(false)
  }
    
  
  if (cancelled) {
    return (
      <main className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">❌</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Termin storniert</h1>
          <p className="text-gray-500 mb-4">Ihr Termin wurde erfolgreich storniert. Der Praxis wurde automatisch Bescheid gegeben.</p>
          <Link href="/" className="inline-block bg-[#1E40AF] text-white px-6 py-2 rounded-lg hover:bg-blue-800 transition">Zur Startseite</Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="text-sm text-gray-500 hover:text-gray-700 mb-6 inline-block">← Zurück</Link>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Termin stornieren</h1>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">E-Mail-Adresse *</label>
              <input type="email" className="w-full p-3 border border-gray-300 rounded-lg" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            
            {error && <p className="text-red-500 text-sm">{error}</p>}
                        <button onClick={handleCancel} disabled={!email || loading} className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50">
              {loading ? "Wird storniert..." : "Nächsten Termin stornieren"}
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
