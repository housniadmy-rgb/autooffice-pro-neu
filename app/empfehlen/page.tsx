"use client"

import { useState } from "react"
import Link from "next/link"

export default function Empfehlen() {
  const [copied, setCopied] = useState(false)
  const link = "https://autooffice-pro-neu.vercel.app/registrieren?ref=empfehlung"

  const copyLink = () => {
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 3000)
  }

  return (
    <main className="min-h-screen p-4 sm:p-8 max-w-full sm:max-w-3xl mx-auto text-center">
      <h1 className="text-xl sm:text-2xl sm:text-3xl sm:text-4xl font-bold mb-4">🎁 Empfehlen & Belohnung erhalten</h1>
      <p className="text-xl text-gray-500 mb-8">Teilen Sie AutoOffice Pro mit Kollegen – Sie erhalten 1 Monat gratis!</p>
      
      <div className="bg-white border border-blue-200 p-4 sm:p-8 rounded-lg sm:rounded-xl mb-8">
        <p className="text-lg text-gray-600 mb-4">Ihr persönlicher Empfehlungslink:</p>
        <div className="bg-white border border-blue-200 p-4 rounded-lg text-gray-900 text-lg break-all mb-4">{link}</div>
        <button onClick={copyLink} className="bg-[#1E40AF] text-white text-xl font-semibold px-8 py-3 sm:py-4 rounded-lg hover:bg-green-600 transition">
          {copied ? "✅ Kopiert!" : "📋 Link kopieren"}
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-4 text-center mb-10">
        <div className="bg-white border border-blue-200 p-6 rounded-lg sm:rounded-xl">
          <p className="text-xl sm:text-2xl sm:text-3xl font-bold mb-2">1.</p>
          <p className="text-gray-500">Link teilen</p>
        </div>
        <div className="bg-white border border-blue-200 p-6 rounded-lg sm:rounded-xl">
          <p className="text-xl sm:text-2xl sm:text-3xl font-bold mb-2">2.</p>
          <p className="text-gray-500">Kollege meldet sich an</p>
        </div>
        <div className="bg-white border border-blue-200 p-6 rounded-lg sm:rounded-xl">
          <p className="text-xl sm:text-2xl sm:text-3xl font-bold mb-2">3.</p>
          <p className="text-gray-500">Sie erhalten 1 Monat gratis</p>
        </div>
      </div>

      <Link href="/" className="text-gray-900 underline text-lg">← Zurück</Link>
    </main>
  )
}
