"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

const SUPABASE_URL = "https://pocgddnekqurlzlkywyn.supabase.co"
const SUPABASE_KEY = "sb_publishable_hlfO39j5ABT-17h_sV1jDQ_6keQz0ij"

export default function Admin() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<"users" | "stornos" | "warteliste">("users")

  const stornos = [
    { email: "patient@test.de", datum: "01.06.2026", uhrzeit: "10:00", grund: "Termin passt nicht", status: "Storniert" },
    { email: "andere@test.de", datum: "02.06.2026", uhrzeit: "14:00", grund: "", status: "Storniert" },
  ]

  const warteliste = [
    { email: "warte@test.de", position: 1, wunsch: "Vormittags" },
    { email: "dringend@test.de", position: 2, wunsch: "Nachmittags" },
    { email: "neu@test.de", position: 3, wunsch: "" },
  ]

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${SUPABASE_URL}/auth/v1/users`, {
        headers: { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}` },
      })
      const data = await res.json()
      if (data.users) setUsers(data.users)
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  if (loading) return <main className="min-h-screen p-8"><p className="text-2xl">Lade Admin-Panel...</p></main>

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Admin-Panel</h1>

        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          <button onClick={() => setTab("users")} className={`px-6 py-3 rounded-lg text-lg font-semibold transition ${tab === "users" ? "bg-white text-black" : "bg-gray-800 text-white hover:bg-gray-700"}`}>Nutzer</button>
          <button onClick={() => setTab("stornos")} className={`px-6 py-3 rounded-lg text-lg font-semibold transition ${tab === "stornos" ? "bg-white text-black" : "bg-gray-800 text-white hover:bg-gray-700"}`}>Stornierungen</button>
          <button onClick={() => setTab("warteliste")} className={`px-6 py-3 rounded-lg text-lg font-semibold transition ${tab === "warteliste" ? "bg-white text-black" : "bg-gray-800 text-white hover:bg-gray-700"}`}>Warteliste</button>
        </div>

        {/* Users Tab */}
        {tab === "users" && (
          <div className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden">
            <div className="p-6 border-b border-gray-700"><h2 className="text-2xl font-semibold">Alle Nutzer ({users.length})</h2></div>
            <table className="w-full text-left text-lg">
              <thead className="bg-gray-800"><tr><th className="p-4">Name</th><th className="p-4">E-Mail</th><th className="p-4">Registriert</th></tr></thead>
              <tbody>
                {users.map((user: any, i: number) => (
                  <tr key={i} className="border-t border-gray-700">
                    <td className="p-4">{user.user_metadata?.name || "-"}</td>
                    <td className="p-4 text-gray-400">{user.email || "-"}</td>
                    <td className="p-4 text-gray-400">{user.created_at ? new Date(user.created_at).toLocaleDateString("de-DE") : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Stornos Tab */}
        {tab === "stornos" && (
          <div className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden">
            <div className="p-6 border-b border-gray-700 flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Stornierungen ({stornos.length})</h2>
              <span className="text-red-400 text-lg">Benachrichtigt: Warteliste</span>
            </div>
            <table className="w-full text-left text-lg">
              <thead className="bg-gray-800"><tr><th className="p-4">Patient</th><th className="p-4">Datum</th><th className="p-4">Uhrzeit</th><th className="p-4">Grund</th><th className="p-4">Status</th></tr></thead>
              <tbody>
                {stornos.map((s, i) => (
                  <tr key={i} className="border-t border-gray-700">
                    <td className="p-4">{s.email}</td>
                    <td className="p-4 text-gray-400">{s.datum}</td>
                    <td className="p-4 text-gray-400">{s.uhrzeit}</td>
                    <td className="p-4 text-gray-400">{s.grund || "-"}</td>
                    <td className="p-4"><span className="text-red-400">{s.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Warteliste Tab */}
        {tab === "warteliste" && (
          <div className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden">
            <div className="p-6 border-b border-gray-700 flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Warteliste ({warteliste.length})</h2>
              <button className="bg-green-600 text-white px-4 py-2 rounded-lg text-lg hover:bg-green-700 transition">Nächsten benachrichtigen</button>
            </div>
            <table className="w-full text-left text-lg">
              <thead className="bg-gray-800"><tr><th className="p-4">Position</th><th className="p-4">Patient</th><th className="p-4">Wunsch</th><th className="p-4">Aktion</th></tr></thead>
              <tbody>
                {warteliste.map((w, i) => (
                  <tr key={i} className="border-t border-gray-700">
                    <td className="p-4 font-bold text-xl">#{w.position}</td>
                    <td className="p-4 text-gray-400">{w.email}</td>
                    <td className="p-4 text-gray-400">{w.wunsch || "-"}</td>
                    <td className="p-4"><button className="bg-white text-black px-4 py-1 rounded-lg text-lg hover:bg-gray-200 transition">Termin anbieten</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-8"><Link href="/" className="text-white underline text-lg">← Zurück</Link></div>
      </div>
    </main>
  )
}
