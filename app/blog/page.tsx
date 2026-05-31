"use client"
import { useState, useEffect } from "react"
import Link from "next/link"

const texts: Record<string, any> = {
  de: { title: "📝 PraxisOnline24 Blog", subtitle: "Tipps & Wissen", readMore: "Weiterlesen →", back: "← Zurück" },
  en: { title: "📝 Blog", subtitle: "Tips & Knowledge", readMore: "Read more →", back: "← Back" },
  fr: { title: "📝 Blog", subtitle: "Conseils", readMore: "Lire la suite →", back: "← Retour" },
  es: { title: "📝 Blog", subtitle: "Consejos", readMore: "Leer más →", back: "← Volver" },
  it: { title: "📝 Blog", subtitle: "Consigli", readMore: "Leggi →", back: "← Indietro" },
  pt: { title: "📝 Blog", subtitle: "Dicas", readMore: "Ler →", back: "← Voltar" },
  nl: { title: "📝 Blog", subtitle: "Tips", readMore: "Lees →", back: "← Terug" },
  pl: { title: "📝 Blog", subtitle: "Porady", readMore: "Czytaj →", back: "← Wróć" },
  tr: { title: "📝 Blog", subtitle: "İpuçları", readMore: "Oku →", back: "← Geri" },
  ja: { title: "📝 ブログ", subtitle: "ヒント", readMore: "読む →", back: "← 戻る" },
  zh: { title: "📝 博客", subtitle: "技巧", readMore: "阅读 →", back: "← 返回" },
  cs: { title: "📝 Blog", subtitle: "Tipy", readMore: "Číst →", back: "← Zpět" },
  sk: { title: "📝 Blog", subtitle: "Tipy", readMore: "Čítať →", back: "← Späť" },
  sl: { title: "📝 Blog", subtitle: "Nasveti", readMore: "Beri →", back: "← Nazaj" },
  sv: { title: "📝 Blogg", subtitle: "Tips", readMore: "Läs →", back: "← Tillbaka" },
  no: { title: "📝 Blogg", subtitle: "Tips", readMore: "Les →", back: "← Tilbake" },
  da: { title: "📝 Blog", subtitle: "Tips", readMore: "Læs →", back: "← Tilbage" },
}

const articles: Record<string, any[]> = {
  de: [{t:"Terminausfälle reduzieren",d:"Automatische Erinnerungen sparen 30% der Ausfälle.",s:"a1"},{t:"DSGVO-Patientenerinnerung",d:"E-Mail & SMS rechtssicher nutzen.",s:"a2"},{t:"Mehr Google-Bewertungen",d:"Positives Feedback automatisch sammeln.",s:"a3"}],
  en: [{t:"Reduce No-Shows",d:"Automatic reminders save 30% of missed appointments.",s:"a1"},{t:"GDPR Patient Reminders",d:"Use email & SMS legally compliant.",s:"a2"},{t:"More Google Reviews",d:"Automatically collect positive feedback.",s:"a3"}],
  fr: [{t:"Réduire les absences",d:"Les rappels automatiques économisent 30%.",s:"a1"},{t:"Rappels RGPD",d:"Utilisez email et SMS en toute conformité.",s:"a2"},{t:"Plus d'avis Google",d:"Collectez automatiquement des avis positifs.",s:"a3"}],
  es: [{t:"Reducir ausencias",d:"Recordatorios automáticos ahorran un 30%.",s:"a1"},{t:"Recordatorios RGPD",d:"Use correo y SMS de forma legal.",s:"a2"},{t:"Más reseñas Google",d:"Recopile reseñas positivas automáticamente.",s:"a3"}],
  it: [{t:"Ridurre assenze",d:"Promemoria automatici riducono del 30%.",s:"a1"},{t:"Promemoria GDPR",d:"Usa email e SMS in modo conforme.",s:"a2"},{t:"Più recensioni Google",d:"Raccogli recensioni positive automaticamente.",s:"a3"}],
  pt: [{t:"Reduzir faltas",d:"Lembretes automáticos poupam 30%.",s:"a1"},{t:"Lembretes RGPD",d:"Use email e SMS de forma legal.",s:"a2"},{t:"Mais avaliações Google",d:"Colete avaliações positivas automaticamente.",s:"a3"}],
  nl: [{t:"No-shows verminderen",d:"Automatische herinneringen besparen 30%.",s:"a1"},{t:"AVG-herinneringen",d:"Gebruik e-mail en SMS juridisch correct.",s:"a2"},{t:"Meer Google-reviews",d:"Verzamel automatisch positieve reviews.",s:"a3"}],
  pl: [{t:"Zmniejsz nieobecności",d:"Automatyczne przypomnienia oszczędzają 30%.",s:"a1"},{t:"Przypomnienia RODO",d:"Korzystaj z e-mail i SMS zgodnie z prawem.",s:"a2"},{t:"Więcej opinii Google",d:"Zbieraj pozytywne opinie automatycznie.",s:"a3"}],
  tr: [{t:"Gelmeyenleri azaltın",d:"Otomatik hatırlatmalar %30 tasarruf sağlar.",s:"a1"},{t:"GDPR hatırlatmaları",d:"E-posta ve SMS'i yasal olarak kullanın.",s:"a2"},{t:"Daha fazla Google yorumu",d:"Olumlu yorumları otomatik toplayın.",s:"a3"}],
  ja: [{t:"無断キャンセル削減",d:"自動リマインダーで30%削減。",s:"a1"},{t:"GDPR準拠リマインダー",d:"メールとSMSを合法的に使用。",s:"a2"},{t:"Googleレビュー増加",d:"肯定的なレビューを自動収集。",s:"a3"}],
  zh: [{t:"减少爽约",d:"自动提醒可减少30%的爽约。",s:"a1"},{t:"GDPR患者提醒",d:"合法使用电子邮件和短信。",s:"a2"},{t:"更多谷歌评论",d:"自动收集好评。",s:"a3"}],
  cs: [{t:"Snížení nedostavení",d:"Automatické připomínky ušetří 30%.",s:"a1"},{t:"GDPR připomínky",d:"Používejte e-mail a SMS legálně.",s:"a2"},{t:"Více Google recenzí",d:"Automaticky sbírejte pozitivní zpětnou vazbu.",s:"a3"}],
  sk: [{t:"Zníženie nedostavenia",d:"Automatické pripomienky ušetria 30%.",s:"a1"},{t:"GDPR pripomienky",d:"Používajte e-mail a SMS legálne.",s:"a2"},{t:"Viac Google recenzií",d:"Automaticky zbierajte pozitívnu spätnú väzbu.",s:"a3"}],
  sl: [{t:"Zmanjšanje izostankov",d:"Samodejni opomniki prihranijo 30%.",s:"a1"},{t:"GDPR opomniki",d:"Uporabljajte e-pošto in SMS zakonito.",s:"a2"},{t:"Več Google ocen",d:"Samodejno zbirajte pozitivne povratne informacije.",s:"a3"}],
  sv: [{t:"Minska uteblivande",d:"Automatiska påminnelser sparar 30%.",s:"a1"},{t:"GDPR-påminnelser",d:"Använd e-post och SMS lagligt.",s:"a2"},{t:"Fler Google-recensioner",d:"Samla automatiskt in positiv feedback.",s:"a3"}],
  no: [{t:"Redusere uteblivelser",d:"Automatiske påminnelser sparer 30%.",s:"a1"},{t:"GDPR-påminnelser",d:"Bruk e-post og SMS lovlig.",s:"a2"},{t:"Flere Google-anmeldelser",d:"Samle automatisk inn positive tilbakemeldinger.",s:"a3"}],
  da: [{t:"Reducer udeblivelser",d:"Automatiske påmindelser sparer 30%.",s:"a1"},{t:"GDPR-påmindelser",d:"Brug e-mail og SMS lovligt.",s:"a2"},{t:"Flere Google-anmeldelser",d:"Indsaml automatisk positive tilbagemeldinger.",s:"a3"}],
}

export default function Blog() {
  const [lang, setLang] = useState("de")
  useEffect(() => {
    const p = new URLSearchParams(window.location.search)
    const ul = p.get("setLang")
    const stored = ul || localStorage.getItem("lang")
    if (stored && texts[stored]) setLang(stored)
    else setLang("en")
  }, [])
  const t = texts[lang] || texts.en
  const a = articles[lang] || articles.en

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4 sm:p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl sm:text-4xl font-bold mb-2 text-gray-900">{t.title}</h1>
      <p className="text-base sm:text-xl text-gray-500 mb-6 sm:mb-10">{t.subtitle}</p>
      <div className="space-y-4">
        {a.map((art, i) => (
          <div key={i} className="bg-white border border-blue-100 p-4 sm:p-6 rounded-xl shadow-sm">
            <h2 className="text-lg sm:text-2xl font-semibold mb-2 text-gray-900">{art.t}</h2>
            <p className="text-gray-500 text-sm sm:text-lg mb-3">{art.d}</p>
            <Link href={`/blog/${art.s}?setLang=${lang}`} className="text-[#3B82F6] hover:text-blue-600 underline">{t.readMore}</Link>
          </div>
        ))}
      </div>
      <div className="mt-8"><Link href="/" className="text-[#3B82F6] hover:text-blue-600 underline">{t.back}</Link></div>
    </main>
  )
}