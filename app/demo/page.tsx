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
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{t.demoTitle}</h1>
          <p className="text-lg text-blue-100">{t.demoSub}</p>
        </div>
      </section>

      <section className="py-16 px-6 max-w-4xl mx-auto">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{t.demoHow}</h2>
          
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-[#1E40AF] text-white rounded-full flex items-center justify-center font-bold">1</div>
              <div>
                <h3 className="font-semibold text-gray-900">{t.demoStep1Title}</h3>
                <p className="text-gray-500">{t.demoStep1Desc}</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-[#1E40AF] text-white rounded-full flex items-center justify-center font-bold">2</div>
              <div>
                <h3 className="font-semibold text-gray-900">{t.demoStep2Title}</h3>
                <p className="text-gray-500">{t.demoStep2Desc}</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-[#1E40AF] text-white rounded-full flex items-center justify-center font-bold">3</div>
              <div>
                <h3 className="font-semibold text-gray-900">{t.demoStep3Title}</h3>
                <p className="text-gray-500">{t.demoStep3Desc}</p>
              </div>
            </div>
          </div>

          <div className="mt-10 text-center">
            <p className="text-gray-600 mb-4">{t.demoPhone} <strong>+49 123 456789</strong></p>
            <p className="text-gray-600 mb-6">{t.demoEmail} <strong>demo@praxisonline24.com</strong></p>
          </div>

          {sent ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <p className="text-green-700">{t.demoThanks}</p>
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); setSent(true) }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.demoName} *</label>
                <input type="text" required className="w-full p-3 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.demoPractice} *</label>
                <input type="text" required className="w-full p-3 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.demoEmailLabel} *</label>
                <input type="email" required className="w-full p-3 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.demoPhoneLabel}</label>
                <input type="tel" className="w-full p-3 border border-gray-300 rounded-lg" />
              </div>
              <button type="submit" className="w-full bg-[#1E40AF] text-white py-3 rounded-lg font-semibold hover:bg-blue-800 transition cursor-pointer">{t.demoSubmit}</button>
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
