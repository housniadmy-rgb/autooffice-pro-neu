"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { translations, detectLanguage } from "../../../lib/i18n"

export default function DashboardAnamnese() {
  const [lang, setLang] = useState("de")

  useEffect(() => {
    const s = localStorage.getItem("lang")
    if (s && translations[s]) setLang(s)
    else setLang(detectLanguage())
  }, [])

  const t = translations[lang] || translations.de

  // Demo-Bögen von Patienten
  const demoBogen = [
    { patient: "Anna Schmidt", date: "04.06.2026", status: "Neu" },
    { patient: "Thomas Weber", date: "03.06.2026", status: "Gelesen" },
    { patient: "Lisa Müller", date: "02.06.2026", status: "Gelesen" },
  ]

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 py-4 px-6">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-xl font-bold text-[#1E40AF]">Praxis<span className="text-[#3B82F6]">Online24</span></Link>
          <Link href="/dashboard" className="text-sm text-gray-500 hover:text-[#1E40AF]">← Zurück zum Dashboard</Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">📋 Anamnese-Bögen</h1>
        <p className="text-gray-500 mb-6">Hier sehen Sie alle eingegangenen Patientenfragebögen.</p>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-sm font-semibold text-gray-700">Patient</th>
                <th className="px-6 py-3 text-sm font-semibold text-gray-700">Datum</th>
                <th className="px-6 py-3 text-sm font-semibold text-gray-700">Status</th>
                <th className="px-6 py-3 text-sm font-semibold text-gray-700"></th>
              </tr>
            </thead>
            <tbody>
              {demoBogen.map((b, i) => (
                <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-6 py-3 text-sm text-gray-900">{b.patient}</td>
                  <td className="px-6 py-3 text-sm text-gray-500">{b.date}</td>
                  <td className="px-6 py-3"><span className={`text-xs px-2 py-1 rounded-full ${b.status === "Neu" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>{b.status}</span></td>
                  <td className="px-6 py-3"><button className="text-sm text-[#1E40AF] hover:underline">Ansehen</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}
