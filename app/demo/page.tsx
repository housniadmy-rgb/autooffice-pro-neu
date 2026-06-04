"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { translations, detectLanguage } from "../../lib/i18n"

export default function DemoPage() {
  const [lang, setLang] = useState("de")
  const [sent, setSent] = useState(false)

  useEffect(() => {
    const s = localStorage.getItem("lang")
    if (s && translations[s]) setLang(s)
    else setLang(detectLanguage())
  }, [])

  const t = translations[lang] || translations.de

  return (
    <main className="min-h-screen bg-white">
      <header className="bg-white border-b border-gray-100 py-4 px-6">
        <div className="max-w-6xl mx-auto">
          <Link href="/" className="text-2xl font-bold text-[#1E40AF]">Praxis<span className="text-[#3B82F6]">Online24</span></Link>
        </div>
      </header>

      <section className="py-16 px-6 text-center bg-gradient-to-r from-[#1E40AF] via-[#3B82F6] to-[#1E40AF] text-white">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Demo anfordern</h1>
          <p className="text-lg text-blue-100">Erleben Sie PraxisOnline24 in einer persönlichen Live-Demo</p>
        </div>
      </section>

      <section className="py-16 px-6 max-w-4xl mx-auto">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">So läuft die Demo ab:</h2>
          
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-[#1E40AF] text-white rounded-full flex items-center justify-center font-bold">1</div>
              <div>
                <h3 className="font-semibold text-gray-900">Kostenlose 30-minütige Demo</h3>
                <p className="text-gray-500">Wir zeigen Ihnen alle Funktionen live am Bildschirm</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-[#1E40AF] text-white rounded-full flex items-center justify-center font-bold">2</div>
              <div>
                <h3 className="font-semibold text-gray-900">Ihre Fragen werden beantwortet</h3>
                <p className="text-gray-500">Individuelle Beratung für Ihre Praxis</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-[#1E40AF] text-white rounded-full flex items-center justify-center font-bold">3</div>
              <div>
                <h3 className="font-semibold text-gray-900">Unverbindliches Angebot</h3>
                <p className="text-gray-500">Sie erhalten ein maßgeschneidertes Angebot</p>
              </div>
            </div>
          </div>

          <div className="mt-10 text-center">
            <p className="text-gray-600 mb-4">📞 Oder rufen Sie uns an: <strong>+49 123 456789</strong></p>
            <p className="text-gray-600 mb-6">✉️ Oder schreiben Sie uns: <strong>demo@praxisonline24.com</strong></p>
          </div>

          {sent ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <p className="text-green-700">Vielen Dank! Wir melden uns innerhalb von 24 Stunden bei Ihnen.</p>
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); setSent(true) }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input type="text" required className="w-full p-3 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Praxisname *</label>
                <input type="text" required className="w-full p-3 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">E-Mail *</label>
                <input type="email" required className="w-full p-3 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                <input type="tel" className="w-full p-3 border border-gray-300 rounded-lg" />
              </div>
              <button type="submit" className="w-full bg-[#1E40AF] text-white py-3 rounded-lg font-semibold hover:bg-blue-800 transition">Demo anfordern</button>
            </form>
          )}
        </div>
      </section>

      <footer className="bg-gray-100 border-t border-gray-200 py-8 text-center text-gray-500 text-sm">
        <div className="max-w-6xl mx-auto px-4">
          <p>© 2026 PraxisOnline24</p>
        </div>
      </footer>
    </main>
  )
}
