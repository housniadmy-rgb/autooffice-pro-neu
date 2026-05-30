"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

const SUPABASE_URL = "https://pocgddnekqurlzlkywyn.supabase.co"
const SUPABASE_KEY = "sb_publishable_hlfO39j5ABT-17h_sV1jDQ_6keQz0ij"

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("supabase_token")
    if (!token) {
      router.push("/login")
      return
    }
    fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => {
        if (data.email) setUser(data)
        setLoading(false)
      })
      .catch(() => { setLoading(false); router.push("/login") })
  }, [])

  if (loading) return <main className="min-h-screen p-8 flex items-center justify-center"><p className="text-2xl">Lade...</p></main>
  if (!user) return <main className="min-h-screen p-8 flex items-center justify-center"><p className="text-2xl">Bitte anmelden.</p></main>

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Dashboard</h1>
        <div className="bg-white border border-blue-200 p-8 rounded-xl mb-8">
          <h2 className="text-2xl font-semibold mb-4">Willkommen, {user.user_metadata?.name || user.email}!</h2>
          <p className="text-lg text-gray-500 mb-2">E-Mail: {user.email}</p>
        </div>
        <button onClick={() => { localStorage.removeItem("supabase_token"); router.push("/") }} className="bg-red-600 text-gray-900 px-6 py-3 rounded-lg text-lg hover:bg-red-700 transition">Abmelden</button>
        <div className="mt-6"><Link href="/" className="text-gray-900 underline text-lg">← Zurück</Link></div>
      </div>
    </main>
  )
}
