"use client"

import { useState } from "react"
import Link from "next/link"

const posts = [
  {
    platform: "LinkedIn",
    icon: "💼",
    text: "⏰ Terminausfälle kosten Arztpraxen jährlich tausende Euro. Mit AutoOffice Pro automatisch Erinnerungen senden – DSGVO-sicher. Jetzt 14 Tage kostenlos testen: autooffice-pro-neu.vercel.app #PraxisAutomation #DSGVO"
  },
  {
    platform: "Facebook",
    icon: "📘",
    text: "📅 Schluss mit verpassten Terminen! Unsere Software erinnert Ihre Patienten automatisch – per E-Mail oder SMS. DSGVO-konform & weltweit nutzbar. Mehr Infos: autooffice-pro-neu.vercel.app"
  },
  {
    platform: "Instagram",
    icon: "📸",
    text: "⭐ Mehr Google-Bewertungen für Ihre Praxis – vollautomatisch! Positive Bewertungen direkt zu Google, Kritik zu Ihnen. So funktioniert's: autooffice-pro-neu.vercel.app #Bewertungsmanagement #PraxisTipp"
  },
  {
    platform: "Twitter/X",
    icon: "🐦",
    text: "Arztpraxen aufgepasst: Termin-Erinnerungen, Bewertungen & E-Mails komplett automatisch. DSGVO-sicher. 14 Tage gratis: autooffice-pro-neu.vercel.app"
  },
  {
    platform: "Foren/Gruppen",
    icon: "💬",
    text: "Hallo zusammen! Ich habe eine Software entdeckt, die Termin-Erinnerungen und Bewertungen für Praxen automatisiert – komplett DSGVO-sicher. 14 Tage kostenlos testen unter autooffice-pro-neu.vercel.app – vielleicht interessant für den ein oder anderen hier."
  }
]

export default function Social() {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const copyPost = (index: number) => {
    navigator.clipboard.writeText(posts[index].text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  return (
    <main className="min-h-screen p-4 sm:p-8 max-w-full sm:max-w-4xl mx-auto">
      <h1 className="text-xl sm:text-2xl sm:text-3xl sm:text-4xl font-bold mb-4">📢 Social-Media-Vorlagen</h1>
      <p className="text-xl text-gray-500 mb-8">Fertige Posts – einfach kopieren und teilen. Neue Kunden automatisch gewinnen.</p>
      
      <div className="space-y-4">
        {posts.map((post, i) => (
          <div key={i} className="bg-white border border-blue-200 p-6 rounded-lg sm:rounded-xl">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl sm:text-2xl">{post.icon}</span>
              <h2 className="text-xl font-semibold">{post.platform}</h2>
            </div>
            <p className="text-gray-600 text-lg mb-4">{post.text}</p>
            <button onClick={() => copyPost(i)} className="bg-[#1E40AF] text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-600 transition text-lg">
              {copiedIndex === i ? "✅ Kopiert!" : "📋 Kopieren"}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-10"><Link href="/" className="text-gray-900 underline text-lg">← Zurück</Link></div>
    </main>
  )
}
