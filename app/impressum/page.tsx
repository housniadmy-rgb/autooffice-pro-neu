"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { translations, detectLanguage } from "../../lib/i18n"

export default function ImpressumPage() {
  const [lang, setLang] = useState("de")

  useEffect(() => {
    const s = localStorage.getItem("lang")
    if (s && translations[s]) setLang(s)
    else setLang(detectLanguage())
  }, [])

  const t = translations[lang] || translations.de

  return (
    <main className="min-h-screen bg-white py-8">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-2xl font-bold mb-6">{t.title || "Impressum"}</h1>
        
        <div className="space-y-4">
          <p><strong>{t.provider || "Anbieter dieser Seite:"}</strong><br />{t.company}</p>
          <p><strong>Inhaber:</strong><br />{t.owner}</p>
          <p><strong>Anschrift:</strong><br />
            {t.street}<br />
            {t.city}<br />
            {t.country}
          </p>
          <p><strong>Kontakt:</strong><br />
            {t.email}<br />
            {t.phone}
          </p>
          <p><strong>{t.vat}</strong></p>
          <p><strong>{t.copyright}</strong><br />{t.copyrightText}</p>
          <p><strong>{t.odr}</strong><br />{t.odrText}</p>
          <p>{t.noParticipation}</p>
          <p><strong>{t.liability}</strong><br />{t.liabilityText}</p>
          <p><strong>{t.linkLiability}</strong><br />{t.linkLiabilityText}</p>
        </div>
        
        <Link href="/" className="inline-block mt-8 text-[#1E40AF] underline">← {t.back || "Zurück"}</Link>
      </div>
    </main>
  )
}