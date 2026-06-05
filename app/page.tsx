"use client"
import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { translations, languages, detectLanguage } from "../lib/i18n"

export default function Home() {
  const [lang, setLang] = useState("de")
  const [showLangs, setShowLangs] = useState(false)
  const [mobileMenu, setMobileMenu] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const s = localStorage.getItem("lang")
    if (s && translations[s]) setLang(s)
    else setLang(detectLanguage())
    const h = (e: MouseEvent) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setShowLangs(false) }
    document.addEventListener("mousedown", h)
    return () => document.removeEventListener("mousedown", h)
  }, [])

  const t = translations[lang] || translations.de
  const switchLang = (c: string) => { localStorage.setItem("lang", c); window.location.href = "/?setLang=" + c }
  const l = (p: string) => `/${p}?setLang=${lang}`
  const prices = { basic: "price_1TeYmcJXpW5OGkcsq13z201p", pro: "price_1TeYikJXpW5OGkcs0ZUTVvV3", business: "price_1TeYlJJXpW5OGkcsKUpto8QO" }
  const handleCheckout = async (pid: string) => { try { const r = await fetch("/api/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ priceId: pid }) }); const d = await r.json(); if (d.url) window.location.href = d.url } catch (e) {} }

  return (
    <main className="min-h-screen bg-white">
      <header className="bg-white border-b border-gray-100 py-2 sm:py-4 px-3 sm:px-6"><div className="max-w-6xl mx-auto flex justify-between items-center">
        <a href="/" className="text-base sm:text-2xl font-bold text-[#1E40AF]">Praxis<span className="text-[#3B82F6]">Online24</span></a>
        <div className="hidden sm:flex gap-3 items-center">
          <a href="/" className="text-lg text-gray-600 hover:text-[#3B82F6]">{t.home}</a>
          <a href={l("login")} className="text-lg text-gray-600 hover:text-[#3B82F6]">{t.login}</a>
          <a href={l("registrieren")} className="bg-[#1E40AF] text-white text-lg px-5 py-2 rounded-lg hover:bg-blue-800 transition">{t.register}</a>
          <div ref={dropdownRef}><button onClick={() => setShowLangs(!showLangs)} className="text-lg text-gray-500 hover:text-[#3B82F6] cursor-pointer">{t.switchLang} ▼</button>
            {showLangs && <div className="absolute right-0 top-10 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-2 w-44 max-h-60 overflow-y-auto">{languages.map(li => <button key={li.code} onMouseDown={(e) => { e.stopPropagation(); switchLang(li.code); }} className={`block w-full text-left px-3 py-1.5 text-sm hover:bg-blue-50 ${lang===li.code?"text-[#3B82F6] font-semibold":"text-gray-700"}`}>{li.label}</button>)}</div>}
          </div>
        </div>
        <button onClick={() => setMobileMenu(!mobileMenu)} className="sm:hidden text-2xl text-gray-700">{mobileMenu?"✕":"☰"}</button>
      </div></header>

      <section className="relative text-center py-10 sm:py-20 px-3 sm:px-6 bg-gradient-to-r from-[#1E40AF] via-[#3B82F6] to-[#1E40AF] text-white"><div className="max-w-4xl mx-auto"><h1 className="text-lg sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-3">{t.hero}</h1><p className="text-sm sm:text-lg text-blue-100 mb-3 sm:mb-6 max-w-2xl mx-auto">{t.subtitle}</p><div className="flex flex-wrap justify-center gap-2 sm:gap-4">
  <a href={l("registrieren")} className="bg-white text-[#1E40AF] border border-gray-200 text-sm sm:text-lg font-semibold px-6 sm:px-10 py-3 sm:py-4 rounded-full hover:bg-gray-100 transition shadow-lg">{t.start}</a>
<a href={l("demo")} className="bg-white text-[#1E40AF] border border-gray-200 text-sm sm:text-lg font-semibold px-6 sm:px-10 py-3 sm:py-4 rounded-full hover:bg-gray-100 transition shadow-lg">{t.demo}</a>
<a href="/termin-buchen" className="bg-white text-[#1E40AF] border border-gray-200 text-sm sm:text-lg font-semibold px-6 sm:px-10 py-3 sm:py-4 rounded-full hover:bg-gray-100 transition shadow-lg">{t.bookAppointment}</a>
</div></div></section>

      <section className="py-8 sm:py-16 px-3 sm:px-6 max-w-6xl mx-auto">
        <h2 className="text-lg sm:text-2xl font-bold mb-6 sm:mb-10 text-center text-gray-900">Features</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-white border border-gray-100 p-4 sm:p-5 rounded-xl shadow-sm"><h3 className="text-base sm:text-lg font-semibold mb-1 text-gray-900">{t.feat1title}</h3><p className="text-sm text-gray-500">{t.feat1desc}</p></div>
          <div className="bg-white border border-gray-100 p-4 sm:p-5 rounded-xl shadow-sm"><h3 className="text-base sm:text-lg font-semibold mb-1 text-gray-900">{t.feat2title}</h3><p className="text-sm text-gray-500">{t.feat2desc}</p></div>
          <div className="bg-white border border-gray-100 p-4 sm:p-5 rounded-xl shadow-sm"><h3 className="text-base sm:text-lg font-semibold mb-1 text-gray-900">{t.feat3title}</h3><p className="text-sm text-gray-500">{t.feat3desc}</p></div>
          <div className="bg-white border border-gray-100 p-4 sm:p-5 rounded-xl shadow-sm"><h3 className="text-base sm:text-lg font-semibold mb-1 text-gray-900">{t.anamnese}</h3><p className="text-sm text-gray-500">{t.anamneseDesc}</p></div>
          <div className="bg-white border border-gray-100 p-4 sm:p-5 rounded-xl shadow-sm"><h3 className="text-base sm:text-lg font-semibold mb-1 text-gray-900">{t.erezept}</h3><p className="text-sm text-gray-500">{t.erezeptDesc}</p></div>
          <div className="bg-white border border-gray-100 p-4 sm:p-5 rounded-xl shadow-sm"><h3 className="text-base sm:text-lg font-semibold mb-1 text-gray-900">{t.statistiken}</h3><p className="text-sm text-gray-500">{t.statistikenDesc}</p></div>
        </div>
      </section>

      <section className="py-8 sm:py-16 px-3 sm:px-6 text-center bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-lg sm:text-2xl font-bold mb-4 text-gray-900">{t.howTitle}</h2>
          <p className="text-sm sm:text-base text-gray-500 mb-10">{t.howSub}</p>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 sm:gap-6">
            <div className="text-center"><div className="w-12 h-12 bg-[#1E40AF] text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-3">1</div><h3 className="font-semibold text-gray-900">{t.step1}</h3><p className="text-sm text-gray-500">{t.step1Desc}</p><div className="text-[#1E40AF] text-2xl mt-2">→</div></div>
            <div className="text-center"><div className="w-12 h-12 bg-[#1E40AF] text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-3">2</div><h3 className="font-semibold text-gray-900">{t.step2}</h3><p className="text-sm text-gray-500">{t.step2Desc}</p><div className="text-[#1E40AF] text-2xl mt-2">→</div></div>
            <div className="text-center"><div className="w-12 h-12 bg-[#1E40AF] text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-3">3</div><h3 className="font-semibold text-gray-900">{t.step3}</h3><p className="text-sm text-gray-500">{t.step3Desc}</p><div className="text-[#1E40AF] text-2xl mt-2">→</div></div>
            <div className="text-center"><div className="w-12 h-12 bg-[#1E40AF] text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-3">4</div><h3 className="font-semibold text-gray-900">{t.step4}</h3><p className="text-sm text-gray-500">{t.step4Desc}</p></div>
          </div>
        </div>
      </section>

      <section className="py-8 sm:py-16 px-3 sm:px-6 text-center bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-lg sm:text-2xl font-bold mb-4 text-gray-900">Integrationen</h2>
          <p className="text-sm text-gray-500 mb-8">PraxisOnline24 funktioniert mit allen gängigen Systemen</p>
          <div className="flex flex-wrap justify-center gap-3">
            <span className="bg-white border border-gray-200 rounded-full px-4 py-2 text-sm">✓ Praxisverwaltungssysteme</span>
            <span className="bg-white border border-gray-200 rounded-full px-4 py-2 text-sm">✓ Kassenärztliche Vereinigung</span>
            <span className="bg-white border border-gray-200 rounded-full px-4 py-2 text-sm">✓ TI-Konnektor</span>
            <span className="bg-white border border-gray-200 rounded-full px-4 py-2 text-sm">✓ E-Rezept-Fachdienst</span>
          </div>
        </div>
      </section>

      <section className="py-8 sm:py-16 px-3 sm:px-6 text-center bg-[#F5F9FF]"><h2 className="text-lg sm:text-2xl font-bold mb-6 sm:mb-10">{t.prices}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8 max-w-5xl mx-auto">
          <div className="bg-white border border-gray-100 p-4 sm:p-6 rounded-xl shadow-sm"><h3 className="text-base sm:text-lg font-semibold mb-1">{t.basic}</h3><p className="text-xl sm:text-2xl font-bold mb-2 text-[#1E40AF]">39€<span className="text-xs text-gray-400">{t.perMonth}</span></p><ul className="text-left text-xs sm:text-sm text-gray-500 space-y-1 mb-4"><li>{t.basic1}</li><li>{t.basic2}</li><li>{t.basic3}</li></ul><button onClick={() => handleCheckout(prices.basic)} className="block w-full bg-[#1E40AF] text-white font-semibold py-2 rounded-full hover:bg-blue-800 transition text-sm">{t.start}</button></div>
          <div className="bg-[#1E40AF] text-white p-4 sm:p-6 rounded-xl shadow-lg sm:scale-105"><h3 className="text-base sm:text-lg font-semibold mt-2 mb-1">{t.pro}</h3><p className="text-xl sm:text-2xl font-bold mb-2">79€<span className="text-xs text-blue-200">{t.perMonth}</span></p><ul className="text-left text-xs sm:text-sm text-white space-y-1 mb-4"><li>{t.pro1}</li><li>{t.pro2}</li><li>{t.pro3}</li></ul><button onClick={() => handleCheckout(prices.pro)} className="block w-full bg-white text-[#1E40AF] font-semibold py-2 rounded-full hover:bg-gray-100 transition text-sm">{t.start}</button></div>
          <div className="bg-white border border-gray-100 p-4 sm:p-6 rounded-xl shadow-sm"><h3 className="text-base sm:text-lg font-semibold mb-1">{t.business}</h3><p className="text-xl sm:text-2xl font-bold mb-2 text-[#1E40AF]">149€<span className="text-xs text-gray-400">{t.perMonth}</span></p><ul className="text-left text-xs sm:text-sm text-gray-500 space-y-1 mb-4"><li>{t.bus1}</li><li>{t.bus2}</li><li>{t.bus3}</li></ul><button onClick={() => handleCheckout(prices.business)} className="block w-full bg-[#3B82F6] text-white font-semibold py-2 rounded-full hover:bg-blue-600 transition text-sm">{t.start}</button></div>
        </div>
      </section>
    </main>
  )
}