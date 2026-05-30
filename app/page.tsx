"use client"
import { useState, useEffect, useRef } from "react"
import { translations, languages, detectLanguage } from "../lib/i18n"
import { howItWorks } from "../lib/howItWorks"
import { trustTexts, demoTexts } from "../lib/trust"

export default function Home() {
  const [lang, setLang] = useState("de")
  const [showLangs, setShowLangs] = useState(false)
  const [mobileMenu, setMobileMenu] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const s = localStorage.getItem("lang")
    if (s && translations[s]) setLang(s)
    else setLang(detectLanguage())
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setShowLangs(false)
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const t = translations[lang] || translations.de
  const how = howItWorks[lang] || howItWorks.en
  const trust = trustTexts[lang] || trustTexts.en
  const demo = demoTexts[lang] || demoTexts.en
  const switchLang = (c: string) => { localStorage.setItem("lang", c); window.location.href = "/?setLang=" + c }
  const l = (p: string) => `/${p}?setLang=${lang}`
  const prices = { basic: "price_1Tcn1FJXpW5OGkcsCIwC7D3i", pro: "price_1Tcn3AJXpW5OGkcs8LtJgV3D", business: "price_1Tcn4HJXpW5OGkcsqILnNtZN" }
  const handleCheckout = async (pid: string) => { try { const r = await fetch("/api/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ priceId: pid, lang }) }); const d = await r.json(); if (d.url) window.location.href = d.url } catch (e) {} }

  return (
    <main className="min-h-screen bg-white">
      <header className="bg-white border-b border-gray-100 py-2 sm:py-4 px-3 sm:px-6">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <a href="/" className="text-base sm:text-2xl font-bold text-[#1E40AF]">Praxis<span className="text-[#3B82F6]">Online</span></a>
          <div className="hidden sm:flex gap-3 items-center">
            <a href="/" className="text-lg text-gray-600 hover:text-[#3B82F6]">{t.home}</a>
            <a href={l("login")} className="text-lg text-gray-600 hover:text-[#3B82F6]">{t.login}</a>
            <a href={l("registrieren")} className="bg-[#1E40AF] text-white text-lg px-5 py-2 rounded-lg hover:bg-blue-800 transition">{t.register}</a>
            <div ref={dropdownRef}><button onClick={() => setShowLangs(!showLangs)} className="text-lg text-gray-500 hover:text-[#3B82F6]">{t.switchLang} ▼</button>
              {showLangs && <div className="absolute right-0 top-10 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-2 w-44 max-h-60 overflow-y-auto">{languages.map(li => <button key={li.code} onClick={() => switchLang(li.code)} className={`block w-full text-left px-3 py-1.5 text-sm hover:bg-blue-50 ${lang===li.code?"text-[#3B82F6] font-semibold":"text-gray-700"}`}>{li.label}</button>)}</div>}
            </div>
          </div>
          <button onClick={() => setMobileMenu(!mobileMenu)} className="sm:hidden text-2xl text-gray-700">{mobileMenu?"✕":"☰"}</button>
        </div>
        {mobileMenu && (
          <div className="sm:hidden mt-2 pb-2 border-t border-gray-100 pt-2">
            <a href="/" className="block text-sm text-gray-700 py-2" onClick={() => setMobileMenu(false)}>{t.home}</a>
            <a href={l("login")} className="block text-sm text-gray-700 py-2" onClick={() => setMobileMenu(false)}>{t.login}</a>
            <a href={l("registrieren")} className="block bg-[#1E40AF] text-white text-sm px-4 py-2 rounded-lg text-center mt-1" onClick={() => setMobileMenu(false)}>{t.register}</a>
            <div className="mt-2"><button onClick={() => setShowLangs(!showLangs)} className="text-sm text-gray-500 py-1">{t.switchLang} ▼</button>
              {showLangs && <div className="bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1 w-full max-h-40 overflow-y-auto mt-1">{languages.map(li => <button key={li.code} onClick={() => switchLang(li.code)} className={`block w-full text-left px-3 py-1 text-xs hover:bg-blue-50 ${lang===li.code?"text-[#3B82F6] font-semibold":"text-gray-700"}`}>{li.label}</button>)}</div>}
            </div>
          </div>
        )}
      </header>

     <section className="relative text-center py-10 sm:py-20 px-3 sm:px-6 bg-gradient-to-r from-[#1E40AF] via-[#3B82F6] to-[#1E40AF] text-white"><div className="max-w-4xl mx-auto"><h1 className="text-lg sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-3 leading-snug text-white">{t.hero}</h1><p className="text-sm sm:text-lg text-blue-100 mb-3 sm:mb-6 max-w-2xl mx-auto">{t.subtitle}</p><div className="flex flex-wrap justify-center gap-2 sm:gap-4"><a href={l("registrieren")} className="bg-[#1E40AF] text-white text-sm sm:text-lg font-semibold px-6 sm:px-10 py-3 sm:py-4 rounded-full hover:bg-blue-800 transition shadow-lg">{t.start}</a><a href={l("termin-buchen")} className="border-2 border-[#1E40AF] text-[#1E40AF] text-sm sm:text-lg font-semibold px-6 sm:px-10 py-3 sm:py-4 rounded-full hover:bg-blue-50 transition">{demo.btn}</a></div></div></section>
      <section className="py-3 sm:py-8 px-3 sm:px-6 max-w-4xl mx-auto text-center bg-[#F8FAFC]"><h2 className="text-lg sm:text-2xl font-bold mb-4 sm:mb-8 text-gray-900">{trust.title}</h2><div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6">{[trust.d1, trust.d2, trust.d3, trust.d4].map((item, i) => <div key={i} className="bg-white border border-gray-200 rounded-xl p-3 sm:p-5 text-sm sm:text-base font-semibold text-[#1E40AF]">{item}</div>)}</div></section>
      <section className="py-3 sm:py-8 px-3 sm:px-6 max-w-4xl mx-auto text-center"><h2 className="text-lg sm:text-2xl font-bold mb-4 sm:mb-8 text-gray-900">{how.title}</h2><div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8">{[{ icon: "1", title: how.s1t, desc: how.s1d },{ icon: "2", title: how.s2t, desc: how.s2d },{ icon: "3", title: how.s3t, desc: how.s3d }].map((step, i) => (<div key={i} className="bg-white border border-gray-100 p-4 sm:p-6 rounded-xl shadow-sm"><span className="text-2xl sm:text-3xl font-bold text-[#1E40AF]">{step.icon}</span><h3 className="text-base sm:text-lg font-semibold mt-2 mb-1 text-gray-900">{step.title}</h3><p className="text-xs sm:text-base text-gray-500">{step.desc}</p></div>))}</div></section>
      <section className="py-3 sm:py-8 px-3 sm:px-6 max-w-4xl mx-auto text-center bg-[#F8FAFC]"><div className="border border-gray-200 rounded-2xl p-6 sm:p-10 bg-white"><h2 className="text-lg sm:text-2xl font-bold mb-2 sm:mb-4 text-gray-900">{demo.title}</h2><p className="text-sm sm:text-base text-gray-500 mb-4 sm:mb-6">{demo.desc}</p><div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 sm:p-6 max-w-2xl mx-auto mb-4 sm:mb-6 text-left"><div className="flex items-center justify-between mb-3 sm:mb-4"><p className="text-sm font-bold text-gray-900">Dashboard – Dr. Müller</p><p className="text-xs text-gray-400">12. Juni 2026</p></div><div className="grid grid-cols-3 gap-2 sm:gap-3 mb-3 sm:mb-4"><div className="bg-blue-50 rounded-lg p-2 sm:p-3 text-center"><p className="text-base sm:text-lg font-bold text-[#1E40AF]">24</p><p className="text-xs text-gray-500">Heute</p></div><div className="bg-green-50 rounded-lg p-2 sm:p-3 text-center"><p className="text-base sm:text-lg font-bold text-green-600">147</p><p className="text-xs text-gray-500">Patienten</p></div><div className="bg-yellow-50 rounded-lg p-2 sm:p-3 text-center"><p className="text-base sm:text-lg font-bold text-yellow-600">98%</p><p className="text-xs text-gray-500">Zufrieden</p></div></div><div className="border-t border-gray-100 pt-2 sm:pt-3 space-y-1"><div className="flex justify-between text-xs sm:text-sm"><span className="text-gray-700">08:00 – Frau Schmidt</span><span className="text-green-600 font-medium">Bestätigt</span></div><div className="flex justify-between text-xs sm:text-sm"><span className="text-gray-700">09:15 – Herr Müller</span><span className="text-blue-600 font-medium">Erinnert</span></div><div className="flex justify-between text-xs sm:text-sm"><span className="text-gray-400">10:30</span><span className="text-gray-400 italic">Verfügbar</span></div></div></div><a href={l("registrieren")} className="inline-block bg-[#1E40AF] text-white text-sm sm:text-base font-semibold px-6 sm:px-8 py-2 sm:py-3 rounded-full hover:bg-blue-800 transition">{demo.cta}</a></div></section>
      <section className="py-3 sm:py-8 px-3 sm:px-6 max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-8 bg-[#F8FAFC]"><div className="bg-white border border-gray-100 p-4 sm:p-6 rounded-xl shadow-sm"><h2 className="text-base sm:text-lg font-semibold mb-2">🖥️ {t.feat1title}</h2><p className="text-sm text-gray-500">{t.feat1desc}</p></div><div className="bg-white border border-gray-100 p-4 sm:p-6 rounded-xl shadow-sm"><h2 className="text-base sm:text-lg font-semibold mb-2">🔔 {t.feat2title}</h2><p className="text-sm text-gray-500">{t.feat2desc}</p></div><div className="bg-white border border-gray-100 p-4 sm:p-6 rounded-xl shadow-sm"><h2 className="text-base sm:text-lg font-semibold mb-2">⭐ {t.feat3title}</h2><p className="text-sm text-gray-500">{t.feat3desc}</p></div></section>
      <section className="py-4 sm:py-10 px-3 sm:px-6 text-center bg-[#F5F9FF]"><h2 className="text-lg sm:text-2xl font-bold mb-4 sm:mb-8">{t.prices}</h2><div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-8 max-w-5xl mx-auto"><div className="bg-white border border-gray-100 p-4 sm:p-6 rounded-xl shadow-sm"><h3 className="text-base sm:text-lg font-semibold mb-1">{t.basic}</h3><p className="text-xl sm:text-2xl font-bold mb-2 text-[#1E40AF]">49€<span className="text-xs text-gray-400">{t.perMonth}</span></p><ul className="text-left text-xs sm:text-sm text-gray-500 space-y-1 mb-4"><li>{t.basic1}</li><li>{t.basic2}</li><li>{t.basic3}</li></ul><button onClick={() => handleCheckout(prices.basic)} className="block w-full bg-[#1E40AF] text-white font-semibold py-2 rounded-full hover:bg-blue-800 transition text-sm">{t.start}</button></div><div className="bg-[#1E40AF] text-white p-4 sm:p-6 rounded-xl shadow-lg sm:scale-105"><h3 className="text-base sm:text-lg font-semibold mt-2 mb-1">{t.pro}</h3><p className="text-xl sm:text-2xl font-bold mb-2">89€<span className="text-xs text-blue-200">{t.perMonth}</span></p><ul className="text-left text-xs sm:text-sm text-white space-y-1 mb-4"><li>{t.pro1}</li><li>{t.pro2}</li><li>{t.pro3}</li></ul><button onClick={() => handleCheckout(prices.pro)} className="block w-full bg-white text-[#1E40AF] font-semibold py-2 rounded-full hover:bg-gray-100 transition text-sm">{t.start}</button></div><div className="bg-white border border-gray-100 p-4 sm:p-6 rounded-xl shadow-sm"><h3 className="text-base sm:text-lg font-semibold mb-1">{t.business}</h3><p className="text-xl sm:text-2xl font-bold mb-2 text-[#1E40AF]">199€<span className="text-xs text-gray-400">{t.perMonth}</span></p><ul className="text-left text-xs sm:text-sm text-gray-500 space-y-1 mb-4"><li>{t.bus1}</li><li>{t.bus2}</li><li>{t.bus3}</li></ul><button onClick={() => handleCheckout(prices.business)} className="block w-full bg-[#3B82F6] text-white font-semibold py-2 rounded-full hover:bg-blue-600 transition text-sm">{t.start}</button></div></div></section>
    </main>
  )
}
