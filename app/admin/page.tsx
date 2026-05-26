"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

const SUPABASE_URL = "https://pocgddnekqurlzlkywyn.supabase.co"
const SUPABASE_KEY = "sb_publishable_hlfO39j5ABT-17h_sV1jDQ_6keQz0ij"

export default function Admin() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ total: 0, newToday: 0, active: 0 })

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${SUPABASE_URL}/auth/v1/users`, {
        headers: { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}` },
      })
      const data = await res.json()
      if (data.users) {
        setUsers(data.users)
        const today = new Date().toISOString().split("T")[0]
        setStats({
          total: data.users.length,
          newToday: data.users.filter((u: any) => u.created_at?.startsWith(today)).length,
          active: data.users.filter((u: any) => u.last_sign_in_at).length,
        })
      }
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
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          <div className="bg-gray-900 border border-gray-700 p-6 rounded-xl text-center">
            <p className="text-3xl font-bold">{stats.total}</p>
            <p className="text-gray-400 text-lg">Nutzer</p>
          </div>
          <div className="bg-gray-900 border border-gray-700 p-6 rounded-xl text-center">
            <p className="text-3xl font-bold text-green-400">{stats.newToday}</p>
            <p className="text-gray-400 text-lg">Neu heute</p>
          </div>
          <div className="bg-gray-900 border border-gray-700 p-6 rounded-xl text-center">
            <p className="text-3xl font-bold text-blue-400">{stats.active}</p>
            <p className="text-gray-400 text-lg">Aktiv</p>
          </div>
        </div>
        <button onClick={fetchUsers} className="bg-white text-black px-6 py-3 rounded-lg text-lg font-semibold hover:bg-gray-200 transition">Aktualisieren</button>
        <Link href="/" className="text-white underline text-lg ml-4">Zurück</Link>
      </div>
    </main>
  )
}
