"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { translations, detectLanguage } from "../../../lib/i18n"

export default function DashboardStatistiken() {
  const [lang, setLang] = useState("de")

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

      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">📊 Praxis-Statistiken</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500 mb-1">Patienten gesamt (Jahr)</p>
            <p className="text-3xl font-bold text-[#1E40AF]">1.247</p>
            <p className="text-xs text-green-600 mt-2">↑ +12% zum Vormonat</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500 mb-1">Termine (dieser Monat)</p>
            <p className="text-3xl font-bold text-[#1E40AF]">342</p>
            <p className="text-xs text-green-600 mt-2">↑ +8% zum Vormonat</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500 mb-1">Umsatz (dieser Monat)</p>
            <p className="text-3xl font-bold text-[#1E40AF]">4.230 €</p>
            <p className="text-xs text-green-600 mt-2">↑ +15% zum Vormonat</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500 mb-1">Ø Bewertung</p>
            <p className="text-3xl font-bold text-[#1E40AF]">4.8 ★</p>
            <p className="text-xs text-green-600 mt-2">Aus 42 Bewertungen</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Termine pro Woche</h2>
          <div className="flex items-end gap-4 h-48">
            {[65, 72, 68, 84, 79, 71, 68].map((val, i) => (
              <div key={i} className="flex-1 flex flex-col items-center">
                <div className="w-full bg-[#1E40AF] rounded-t-lg" style={{ height: `${(val / 90) * 100}%` }}></div>
                <span className="text-xs text-gray-500 mt-2">{["Mo","Di","Mi","Do","Fr","Sa","So"][i]}</span>
                <span className="text-xs font-semibold text-gray-700">{val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
