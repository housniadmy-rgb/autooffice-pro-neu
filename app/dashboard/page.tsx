"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { translations, detectLanguage } from "../lib/i18n"

export default function Dashboard() {
  const [lang, setLang] = useState("de")

  useEffect(() => {
    const s = localStorage.getItem("lang")
    if (s && translations[s]) setLang(s)
    else setLang(detectLanguage())
  }, [])

  const t = translations[lang] || translations.de

  // Demo-Termine für heute
  const todayAppointments = [
    { time: "09:00", patient: "Anna Schmidt", type: "Hausarzt" },
    { time: "10:30", patient: "Thomas Weber", type: "Vorsorge" },
    { time: "11:00", patient: "Lisa Müller", type: "Impfung" },
    { time: "14:00", patient: "Klaus Richter", type: "Folgetermin" },
    { time: "15:30", patient: "Maria Bauer", type: "Ersttermin" },
  ]

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 py-4 px-6">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-xl font-bold text-[#1E40AF]">Praxis<span className="text-[#3B82F6]">Online24</span></Link>
          <Link href="/" className="text-sm text-gray-500 hover:text-[#1E40AF]">{t.back || "← Zurück"}</Link>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Begrüßung */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500">Willkommen, Testpraxis!</p>
        </div>

        {/* KPI-Karten */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">Heutige Termine</p>
            <p className="text-2xl font-bold text-[#1E40AF]">{todayAppointments.length}</p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">Patienten (Monat)</p>
            <p className="text-2xl font-bold text-[#1E40AF]">147</p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">Bewertungen</p>
            <p className="text-2xl font-bold text-[#1E40AF]">4.8 ★</p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">Umsatz (Monat)</p>
            <p className="text-2xl font-bold text-[#1E40AF]">4.230 €</p>
          </div>
        </div>

        {/* Terminliste heute */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Heutige Termine</h2>
          <div className="space-y-3">
            {todayAppointments.map((apt, i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-semibold text-[#1E40AF] w-16">{apt.time}</span>
                  <div>
                    <p className="font-medium text-gray-900">{apt.patient}</p>
                    <p className="text-xs text-gray-500">{apt.type}</p>
                  </div>
                </div>
                <button className="text-xs text-gray-400 hover:text-[#1E40AF]">Details</button>
              </div>
            ))}
          </div>
        </div>

        {/* Quick-Links zu Features */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link href="/anamnese" className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
            <h3 className="font-semibold text-gray-900">📋 Anamnese-Bögen</h3>
            <p className="text-sm text-gray-500 mt-1">Ausgefüllte Fragebögen einsehen</p>
          </Link>
          <Link href="/erezept" className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
            <h3 className="font-semibold text-gray-900">💊 E-Rezept</h3>
            <p className="text-sm text-gray-500 mt-1">Neue Rezepte ausstellen</p>
          </Link>
          <Link href="/statistiken" className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
            <h3 className="font-semibold text-gray-900">📊 Statistiken</h3>
            <p className="text-sm text-gray-500 mt-1">Alle Kennzahlen im Überblick</p>
          </Link>
        </div>
      </div>
    </main>
  )
}