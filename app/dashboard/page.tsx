"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { translations, detectLanguage } from "../../lib/i18n"

export default function Dashboard() {
  const [lang, setLang] = useState("de")
  const [appointments, setAppointments] = useState<any[]>([])
  const [waitingList, setWaitingList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const s = localStorage.getItem("lang")
    if (s && translations[s]) setLang(s)
    else setLang(detectLanguage())
    
    loadAppointments()
  }, [])

  const loadAppointments = async () => {
    const token = localStorage.getItem("supabase_token")
    if (!token) { setLoading(false); return }
    
    const payload = JSON.parse(atob(token.split(".")[1]))
    const userId = payload.sub
    
    const [confirmedRes, waitingRes] = await Promise.all([
      fetch(`https://pocgddnekqurlzlkywyn.supabase.co/rest/v1/appointments?status=eq.confirmed&practice_id=eq.${userId}&order=appointment_date.asc,appointment_time.asc`, {
        headers: { "apikey": "sb_publishable_hlfO39j5ABT-17h_sV1jDQ_6keQz0ij", "Authorization": `Bearer ${token}` }
      }),
      fetch(`https://pocgddnekqurlzlkywyn.supabase.co/rest/v1/appointments?status=eq.waiting&practice_id=eq.${userId}&order=waiting_since.asc`, {
        headers: { "apikey": "sb_publishable_hlfO39j5ABT-17h_sV1jDQ_6keQz0ij", "Authorization": `Bearer ${token}` }
      })
    ])
    
    if (confirmedRes.ok) setAppointments(await confirmedRes.json())
    if (waitingRes.ok) setWaitingList(await waitingRes.json())
    setLoading(false)
  }

  const cancelAppointment = async (id: string) => {
    const token = localStorage.getItem("supabase_token")
    if (!token) return
    
    await fetch(`https://pocgddnekqurlzlkywyn.supabase.co/rest/v1/appointments?id=eq.${id}`, {
      method: "DELETE",
      headers: { "apikey": "sb_publishable_hlfO39j5ABT-17h_sV1jDQ_6keQz0ij", "Authorization": `Bearer ${token}` }
    })
    
    setAppointments(appointments.filter(a => a.id !== id))
  }

  const t = translations[lang] || translations.de
  const today = new Date().toISOString().split("T")[0]
  const todayApps = appointments.filter(a => a.appointment_date === today)

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
          <p className="text-gray-500">Willkommen in Ihrem Dashboard.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">Heutige Termine</p>
            <p className="text-2xl font-bold text-[#1E40AF]">{todayApps.length}</p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">Alle Termine</p>
            <p className="text-2xl font-bold text-[#1E40AF]">{appointments.length}</p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">Warteliste</p>
            <p className="text-2xl font-bold text-[#1E40AF]">{waitingList.length}</p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">Umsatz (Monat)</p>
            <p className="text-2xl font-bold text-[#1E40AF]">0 €</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Alle Termine</h2>
          {loading ? (
            <p className="text-gray-500 text-center py-4">Lade...</p>
          ) : appointments.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Keine Termine vorhanden</p>
          ) : (
            <div className="space-y-2">
              {appointments.map((a: any) => (
                <div key={a.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg group">
                  <div>
                    <p className="font-semibold">{a.patient_name}</p>
                    <p className="text-sm text-gray-500">{a.reason || "Kein Grund"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">{new Date(a.appointment_date).toLocaleDateString()}</p>
                    <p className="text-sm text-gray-500">{a.appointment_time?.slice(0,5)} Uhr</p>
                    <button onClick={() => cancelAppointment(a.id)} className="text-red-500 text-xs mt-1 opacity-0 group-hover:opacity-100 transition hover:underline">✕ Löschen</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">📋 Warteliste ({waitingList.length})</h2>
          {waitingList.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Keine Patienten auf Warteliste</p>
          ) : (
            <div className="space-y-2">
              {waitingList.map((a: any) => (
                <div key={a.id} className="flex justify-between items-center p-3 bg-amber-50 rounded-lg">
                  <div>
                    <p className="font-semibold">{a.patient_name}</p>
                    <p className="text-sm text-gray-500">{a.reason || "Kein Grund"}</p>
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    <p>Wartet seit {new Date(a.waiting_since).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}