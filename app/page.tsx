"use client"
import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { translations, languages, detectLanguage } from "../lib/i18n"

export default function Home() {
  const [lang, setLang] = useState("de")
  const [showLangs, setShowLangs] = useState(false)
  const [mobileMenu, setMobileMenu] = useState(false)
  const [showMobileLangs, setShowMobileLangs] = useState(false)
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
  const stripeLinks = {
  basic: `https://buy.stripe.com/fZu6oJgOA9SW4uDbGIfAc0c?locale=${lang}`,
  pro: `https://buy.stripe.com/5kQeVfdCo5CG3qz8uwfAc0d?locale=${lang}`,
  business: `https://buy.stripe.com/8x28wRdCo0im0eneSUfAc0e?locale=${lang}`,
};
  const handleCheckout = (plan: keyof typeof stripeLinks) => {
    window.location.href = stripeLinks[plan]
  }

  return (
    <main className="min-h-screen bg-white">
      <header className="bg-white border-b border-gray-100 py-2 sm:py-4 px-3 sm:px-6"><div className="max-w-6xl mx-auto flex justify-between items-center">
        <a href="/" className="text-base sm:text-2xl font-bold text-[#1E40AF]">Praxis<span className="text-[#3B82F6]">Online24</span></a>
        <div className="hidden sm:flex gap-3 items-center">
          <a href="/" className="text-lg text-gray-600 hover:text-[#3B82F6]">{t.home}</a>
          <a href={l("login")} className="text-lg text-gray-600 hover:text-[#3B82F6]">{t.login}</a>
          <a href={l("registrieren")} className="bg-[#1E40AF] text-white text-lg px-5 py-2 rounded-lg hover:bg-blue-800 transition">{t.register}</a>
<Link href="/arzt-suche" className="text-lg text-gray-600 hover:text-[#3B82F6]">Arzt suchen</Link>
          <div ref={dropdownRef}><button onClick={() => setShowLangs(!showLangs)} className="text-lg text-gray-500 hover:text-[#3B82F6] cursor-pointer">{t.switchLang} ▼</button>
            {showLangs && <div className="absolute right-auto top-10 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-2 w-44 max-h-60 overflow-y-auto">{languages.map(li => <button key={li.code} onMouseDown={(e) => { e.stopPropagation(); switchLang(li.code); }} className={`block w-full text-left px-3 py-1.5 text-sm hover:bg-blue-50 ${lang===li.code?"text-[#3B82F6] font-semibold":"text-gray-700"}`}>{li.label}</button>)}</div>}
          </div>
        </div>
        <button onClick={() => setMobileMenu(!mobileMenu)} className="sm:hidden text-2xl text-gray-700">{mobileMenu?"✕":"☰"}</button>
      </div></header>
            {/* Mobile Menu */}
      {mobileMenu && (
        <div className="sm:hidden bg-white border-b border-gray-100 px-4 py-3 space-y-3">
          <button onClick={() => { setMobileMenu(false); }} className="block w-full text-left text-gray-700 py-2">
            {t.home}
          </button>
          <button onClick={() => { window.location.href = l("login"); }} className="block w-full text-left text-gray-700 py-2">
            {t.login}
          </button>
          <button onClick={() => { window.location.href = l("registrieren"); }} className="block w-full bg-[#1E40AF] text-white text-center px-4 py-2 rounded-lg">
            {t.register}
          </button>
          
          <div className="pt-2 border-t border-gray-100">
            <div className="relative">
              <button onClick={() => setShowMobileLangs(!showMobileLangs)} className="w-full text-left text-gray-700 py-2 flex items-center justify-between">
                {t.switchLang} ▼
              </button>
              {showMobileLangs && (
                <div className="bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1 w-full max-h-40 overflow-y-auto mt-1">
                  {languages.map(li => (
                    <button
                      key={li.code}
                      onClick={() => {
                        switchLang(li.code);
                        setMobileMenu(false);
                        setShowMobileLangs(false);
                      }}
                      className={`block w-full text-left px-3 py-1 text-sm ${
                        lang === li.code ? "text-[#1E40AF] font-semibold" : "text-gray-700"
                      }`}
                    >
                      {li.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      <section className="relative text-center py-10 sm:py-20 px-3 sm:px-6 bg-gradient-to-r from-[#1E40AF] via-[#3B82F6] to-[#1E40AF] text-white"><div className="max-w-4xl mx-auto"><h1 className="text-lg sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-3">{t.hero}</h1><p className="text-sm sm:text-lg text-blue-100 mb-3 sm:mb-6 max-w-2xl mx-auto">{t.subtitle}</p><div className="flex flex-wrap justify-center gap-3 sm:gap-4 mt-6">
  <a href="/termin-buchen" className="bg-white text-[#1E40AF] border border-gray-200 text-sm sm:text-lg font-semibold px-6 sm:px-8 py-3 sm:py-4 rounded-full hover:bg-gray-100 transition shadow-md">
    👤 Für Patienten
  </a>
  <a href={l("registrieren")} className="bg-[#1E40AF] text-white text-sm sm:text-lg font-semibold px-6 sm:px-8 py-3 sm:py-4 rounded-full hover:bg-blue-800 transition shadow-md">
    🏥 Für Praxen / Einrichtungen
  </a>
</div></div></section>

      <section className="py-8 sm:py-16 px-3 sm:px-6 max-w-6xl mx-auto">
        <h2 className="text-lg sm:text-2xl font-bold mb-6 sm:mb-10 text-center text-gray-900">Features</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-blue-50 border border-blue-100 p-4 sm:p-5 rounded-xl shadow-sm"><h3 className="text-base sm:text-lg font-semibold mb-1 text-gray-900">{t.feat1title}</h3><p className="text-sm text-gray-500">{t.feat1desc}</p></div>
          <div className="bg-blue-50 border border-blue-100 p-4 sm:p-5 rounded-xl shadow-sm"><h3 className="text-base sm:text-lg font-semibold mb-1 text-gray-900">{t.feat2title}</h3><p className="text-sm text-gray-500">{t.feat2desc}</p></div>
          <div className="bg-blue-50 border border-blue-100 p-4 sm:p-5 rounded-xl shadow-sm"><h3 className="text-base sm:text-lg font-semibold mb-1 text-gray-900">{t.feat3title}</h3><p className="text-sm text-gray-500">{t.feat3desc}</p></div>
         
          
        </div>
      </section>

      <section className="py-8 sm:py-16 px-3 sm:px-6 text-center bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-lg sm:text-2xl font-bold mb-4 text-gray-900">{t.howTitle}</h2>
          <p className="text-sm sm:text-base text-gray-500 mb-10">{t.howSub}</p>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-blue-50 rounded-xl p-4 text-center">
              <div className="w-12 h-12 bg-[#1E40AF] text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-3">1</div>
              <h3 className="font-semibold text-gray-900">{t.step1}</h3>
              <p className="text-sm text-gray-500">{t.step1Desc}</p>
              <div className="text-[#1E40AF] text-2xl mt-2">→</div>
            </div>
            <div className="bg-blue-50 rounded-xl p-4 text-center">
              <div className="w-12 h-12 bg-[#1E40AF] text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-3">2</div>
              <h3 className="font-semibold text-gray-900">{t.step2}</h3>
              <p className="text-sm text-gray-500">{t.step2Desc}</p>
              <div className="text-[#1E40AF] text-2xl mt-2">→</div>
            </div>
            <div className="bg-blue-50 rounded-xl p-4 text-center">
              <div className="w-12 h-12 bg-[#1E40AF] text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-3">3</div>
              <h3 className="font-semibold text-gray-900">{t.step3}</h3>
              <p className="text-sm text-gray-500">{t.step3Desc}</p>
              <div className="text-[#1E40AF] text-2xl mt-2">→</div>
            </div>
            <div className="bg-blue-50 rounded-xl p-4 text-center">
              <div className="w-12 h-12 bg-[#1E40AF] text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-3">4</div>
              <h3 className="font-semibold text-gray-900">{t.step4}</h3>
              <p className="text-sm text-gray-500">{t.step4Desc}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-8 sm:py-16 px-3 sm:px-6 text-center bg-blue-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-lg sm:text-2xl font-bold mb-4 text-gray-900">{t.integrationsTitle}</h2>
          <p className="text-sm text-gray-500 mb-8">{t.integrationsSub}</p>
          <div className="flex flex-wrap justify-center gap-3">
            <span className="bg-blue-100 border border-blue-200 rounded-full px-4 py-2 text-sm">{t.integration1}</span>
<span className="bg-blue-100 border border-blue-200 rounded-full px-4 py-2 text-sm">{t.integration2}</span>
<span className="bg-blue-100 border border-blue-200 rounded-full px-4 py-2 text-sm">{t.integration3}</span>
<span className="bg-blue-100 border border-blue-200 rounded-full px-4 py-2 text-sm">{t.integration4}</span>
          </div>
        </div>
      </section>

      <section className="py-8 sm:py-16 px-3 sm:px-6 text-center bg-[#F5F9FF]"><h2 className="text-lg sm:text-2xl font-bold mb-6 sm:mb-10">{t.prices}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8 max-w-5xl mx-auto">
          <div className="bg-white border border-gray-100 p-4 sm:p-6 rounded-xl shadow-sm"><h3 className="text-base sm:text-lg font-semibold mb-1">{t.basic}</h3><p className="text-xl sm:text-2xl font-bold mb-2 text-[#1E40AF]">39€<span className="text-xs text-gray-400">{t.perMonth}</span></p><ul className="text-left text-xs sm:text-sm text-gray-500 space-y-1 mb-4"><li>{t.basic1}</li><li>{t.basic2}</li><li>{t.basic3}</li></ul><button onClick={() => handleCheckout("basic")} className="block w-full bg-[#1E40AF] text-white font-semibold py-2 rounded-full hover:bg-blue-800 transition text-sm cursor-pointer">{t.start}</button></div>
          <div className="bg-[#1E40AF] text-white p-4 sm:p-6 rounded-xl shadow-lg sm:scale-105"><h3 className="text-base sm:text-lg font-semibold mt-2 mb-1">{t.pro}</h3><p className="text-xl sm:text-2xl font-bold mb-2">79€<span className="text-xs text-blue-200">{t.perMonth}</span></p><ul className="text-left text-xs sm:text-sm text-white space-y-1 mb-4"><li>{t.pro1}</li><li>{t.pro2}</li><li>{t.pro3}</li></ul><button onClick={() => handleCheckout("pro")} className="block w-full bg-white text-[#1E40AF] font-semibold py-2 rounded-full hover:bg-gray-100 transition text-sm cursor-pointer">{t.start}</button></div>
          <div className="bg-white border border-gray-100 p-4 sm:p-6 rounded-xl shadow-sm"><h3 className="text-base sm:text-lg font-semibold mb-1">{t.business}</h3><p className="text-xl sm:text-2xl font-bold mb-2 text-[#1E40AF]">149€<span className="text-xs text-gray-400">{t.perMonth}</span></p><ul className="text-left text-xs sm:text-sm text-gray-500 space-y-1 mb-4"><li>{t.bus1}</li><li>{t.bus2}</li><li>{t.bus3}</li></ul><button onClick={() => handleCheckout("business")} className="block w-full bg-[#3B82F6] text-white font-semibold py-2 rounded-full hover:bg-blue-600 transition text-sm cursor-pointer">{t.start}</button></div>
        </div>
      </section>
    </main>
  )
}
