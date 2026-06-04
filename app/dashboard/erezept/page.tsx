"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { translations, detectLanguage } from "../../../lib/i18n"

export default function DashboardERezept() {
  const [lang, setLang] = useState("de")
  const [sent, setSent] = useState(false)

  useEffect(() => {
    const s = localStorage.getItem("lang")
    if (s && translations[s]) setLang(s)
    else setLang(detectLanguage())
  }, [])

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 py-4 px-6">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-xl font-bold text-[#1E40AF]">Praxis<span className="text-[#3B82F6]">Online24</span></Link>
          <Link href="/dashboard" className="text-sm text-gray-500 hover:text-[#1E40AF]">← Zurück zum Dashboard</Link>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">💊 E-Rezept ausstellen</h1>

        {sent ? (
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
            <p className="text-green-700 font-semibold">✅ Rezept wurde an die Apotheke gesendet!</p>
            <button onClick={() => setSent(false)} className="mt-4 text-sm text-[#1E40AF] underline">+ Weiteres Rezept</button>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Patient</label>
              <input type="text" className="w-full p-3 border border-gray-300 rounded-lg" placeholder="Name des Patienten" />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Medikament</label>
              <input type="text" className="w-full p-3 border border-gray-300 rounded-lg" placeholder="z.B. Ibuprofen 400mg" />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Dosierung</label>
              <input type="text" className="w-full p-3 border border-gray-300 rounded-lg" placeholder="z.B. 3x täglich" />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Apotheke</label>
              <input type="text" className="w-full p-3 border border-gray-300 rounded-lg" placeholder="Apotheke auswählen" />
            </div>
            <button onClick={() => setSent(true)} className="w-full bg-[#1E40AF] text-white py-3 rounded-lg font-semibold hover:bg-blue-800 transition">E-Rezept senden</button>
          </div>
        )}
      </div>
    </main>
  )
}
