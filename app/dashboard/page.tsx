"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { translations, detectLanguage } from "../../lib/i18n"

export default function Dashboard() {
  const [lang, setLang] = useState("de")

  useEffect(() => {
    const s = localStorage.getItem("lang")
    if (s && translations[s]) setLang(s)
    else setLang(detectLanguage())
  }, [])

  const t = translations[lang] || translations.de

  

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 py-4 px-6">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-xl font-bold text-[#1E40AF]">Praxis<span className="text-[#3B82F6]">Online24</span></Link>
          <Link href="/" className="text-sm text-gray-500 hover:text-[#1E40AF]">← Zurück</Link>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500">Willkommen, Testpraxis!</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">Heutige Termine</p>
            <p className="text-2xl font-bold text-[#1E40AF]">0</p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">Patienten (Monat)</p>
            <p className="text-2xl font-bold text-[#1E40AF]">0</p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">Bewertungen</p>
            <p className="text-2xl font-bold text-[#1E40AF]">0 ★</p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">Umsatz (Monat)</p>
            <p className="text-2xl font-bold text-[#1E40AF]">0 €</p>
          </div>
        </div>

       <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
  <h2 className="text-lg font-semibold text-gray-900 mb-4">Heutige Termine</h2>
  <p className="text-gray-500 text-center py-4">Keine Termine für heute</p>
</div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link href="/dashboard/anamnese" className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
            <h3 className="font-semibold text-gray-900">📋 Anamnese-Bögen</h3>
            <p className="text-sm text-gray-500 mt-1">Ausgefüllte Fragebögen einsehen</p>
          </Link>
          <Link href="/dashboard/erezept" className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
            <h3 className="font-semibold text-gray-900">💊 E-Rezept</h3>
            <p className="text-sm text-gray-500 mt-1">Neue Rezepte ausstellen</p>
          </Link>
          <Link href="/dashboard/statistiken" className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
            <h3 className="font-semibold text-gray-900">📊 Statistiken</h3>
            <p className="text-sm text-gray-500 mt-1">Alle Kennzahlen im Überblick</p>
          </Link>
        </div>
      </div>
    </main>
  )
}
