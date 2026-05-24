"use client"
import { useState } from "react"
import Link from "next/link"

export default function Dashboard() {
  const [user] = useState({ name: "Max Mustermann", email: "max@example.com", tier: "Pro" })
  return (
    <main className="min-h-screen p-8"><div className="max-w-4xl mx-auto"><h1 className="text-4xl font-bold mb-8">Dashboard</h1><div className="bg-gray-900 border border-gray-700 p-8 rounded-xl mb-8"><h2 className="text-2xl font-semibold mb-4">Willkommen, {user.name}!</h2><p className="text-lg text-gray-400 mb-2">E-Mail: {user.email}</p><p className="text-lg text-gray-400">Abo: <span className="text-white font-semibold">{user.tier}</span></p></div><Link href="/" className="text-white underline text-lg">← Zurück</Link></div></main>
  )
}
