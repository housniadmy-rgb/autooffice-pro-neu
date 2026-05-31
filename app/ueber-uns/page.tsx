"use client"
import { useState, useEffect } from "react"
import Link from "next/link"

const texts: Record<string, any> = {
  de: { title: "Über uns", headline: "Wir machen Praxis-Automatisierung einfach", text: "PraxisOnline24 befreit Arztpraxen von unnötiger Bürokratie. Unsere DSGVO-sichere Plattform automatisiert Terminbuchung, Erinnerungen und Bewertungsmanagement – in 17 Sprachen, weltweit.", mission: "Unsere Mission", missionText: "Jeder Praxis die Freiheit geben, sich auf das Wesentliche zu konzentrieren: die Patienten.", back: "← Zurück" },
  en: { title: "About Us", headline: "We make practice automation simple", text: "PraxisOnline24 frees medical practices and law firms from unnecessary bureaucracy. Our GDPR-compliant platform automates booking, reminders and reviews – in 17 languages, worldwide.", mission: "Our Mission", missionText: "Give every practice the freedom to focus on what matters: their patients.", back: "← Back" },
  fr: { title: "À propos", headline: "Nous simplifions l'automatisation des cabinets", text: "PraxisOnline24 libère les cabinets médicaux de la bureaucratie. Notre plateforme conforme RGPD automatise la réservation, les rappels et les avis – en 17 langues.", mission: "Notre mission", missionText: "Donner à chaque cabinet la liberté de se concentrer sur l'essentiel : ses patients.", back: "← Retour" },
  es: { title: "Sobre nosotros", headline: "Simplificamos la automatización de consultas", text: "PraxisOnline24 libera a las consultas médicas de la burocracia. Nuestra plataforma RGPD automatiza reservas, recordatorios y reseñas – en 17 idiomas.", mission: "Nuestra misión", missionText: "Dar a cada consulta la libertad de centrarse en lo esencial: sus pacientes.", back: "← Volver" },
  it: { title: "Chi siamo", headline: "Rendiamo semplice l'automazione degli studi", text: "PraxisOnline24 libera gli studi medici dalla burocrazia. La nostra piattaforma GDPR automatizza prenotazioni, promemoria e recensioni – in 17 lingue.", mission: "La nostra missione", missionText: "Dare a ogni studio la libertà di concentrarsi su ciò che conta: i pazienti.", back: "← Indietro" },
  pt: { title: "Sobre nós", headline: "Simplificamos a automação de consultórios", text: "O PraxisOnline24 liberta consultórios médicos da burocracia. Nossa plataforma RGPD automatiza agendamentos, lembretes e avaliações – em 17 idiomas.", mission: "Nossa missão", missionText: "Dar a cada consultório a liberdade de focar no essencial: seus pacientes.", back: "← Voltar" },
  nl: { title: "Over ons", headline: "Wij maken praktijkautomatisering eenvoudig", text: "PraxisOnline24 bevrijdt medische praktijken van bureaucratie. Ons AVG-conforme platform automatiseert boekingen, herinneringen en reviews – in 17 talen.", mission: "Onze missie", missionText: "Elke praktijk de vrijheid geven om te focussen op wat telt: hun patiënten.", back: "← Terug" },
  pl: { title: "O nas", headline: "Upraszczamy automatyzację gabinetów", text: "PraxisOnline24 uwalnia gabinety medyczne od biurokracji. Nasza platforma RODO automatyzuje rezerwacje, przypomnienia i opinie – w 17 językach.", mission: "Nasza misja", missionText: "Dać każdemu gabinetowi swobodę skupienia się na tym, co ważne: pacjentach.", back: "← Wróć" },
  tr: { title: "Hakkımızda", headline: "Muayenehane otomasyonunu basitleştiriyoruz", text: "PraxisOnline24, muayenehaneleri bürokrasiden kurtarır. GDPR uyumlu platformumuz 17 dilde rezervasyon, hatırlatma ve yorumları otomatikleştirir.", mission: "Misyonumuz", missionText: "Her muayenehaneye önemli olana odaklanma özgürlüğü vermek: hastalarına.", back: "← Geri" },
  ja: { title: "会社概要", headline: "医院の自動化をシンプルに", text: "PraxisOnline24は医院を不要な事務処理から解放します。GDPR準拠のプラットフォームが17言語で予約、リマインダー、レビューを自動化します。", mission: "私たちの使命", missionText: "すべての医院に、最も重要なことである患者に集中する自由を提供します。", back: "← 戻る" },
  zh: { title: "关于我们", headline: "让诊所自动化更简单", text: "PraxisOnline24 将诊所从繁琐的行政事务中解放出来。我们符合GDPR的平台在17种语言中自动化预约、提醒和评论。", mission: "我们的使命", missionText: "让每个诊所都能专注于最重要的事情：他们的患者。", back: "← 返回" },
  cs: { title: "O nás", headline: "Zjednodušujeme automatizaci ordinací", text: "PraxisOnline24 osvobozuje ordinace od byrokracie. Naše platforma GDPR automatizuje rezervace, připomínky a recenze – v 17 jazycích.", mission: "Naše mise", missionText: "Dát každé ordinaci svobodu soustředit se na to nejdůležitější: pacienty.", back: "← Zpět" },
  sk: { title: "O nás", headline: "Zjednodušujeme automatizáciu ordinácií", text: "PraxisOnline24 oslobodzuje ordinácie od byrokracie. Naša platforma GDPR automatizuje rezervácie, pripomienky a recenzie – v 17 jazykoch.", mission: "Naša misia", missionText: "Dať každej ordinácii slobodu sústrediť sa na to najdôležitejšie: pacientov.", back: "← Späť" },
  sl: { title: "O nas", headline: "Poenostavljamo avtomatizacijo ordinacij", text: "PraxisOnline24 osvobaja ordinacije birokracije. Naša platforma GDPR avtomatizira rezervacije, opomnike in ocene – v 17 jezikih.", mission: "Naše poslanstvo", missionText: "Vsaki ordinaciji dati svobodo, da se osredotoči na tisto, kar šteje: paciente.", back: "← Nazaj" },
  sv: { title: "Om oss", headline: "Vi gör praktikautomatisering enkel", text: "PraxisOnline24 befriar mottagningar från byråkrati. Vår GDPR-plattform automatiserar bokning, påminnelser och recensioner – på 17 språk.", mission: "Vår mission", missionText: "Ge varje mottagning friheten att fokusera på det som räknas: patienterna.", back: "← Tillbaka" },
  no: { title: "Om oss", headline: "Vi gjør praksisautomatisering enkelt", text: "PraxisOnline24 frigjør praksiser fra byråkrati. Vår GDPR-plattform automatiserer bestilling, påminnelser og anmeldelser – på 17 språk.", mission: "Vår misjon", missionText: "Gi hver praksis friheten til å fokusere på det som teller: pasientene.", back: "← Tilbake" },
  da: { title: "Om os", headline: "Vi gør praksisautomatisering enkelt", text: "PraxisOnline24 befrier praksisser fra bureaukrati. Vores GDPR-platform automatiserer booking, påmindelser og anmeldelser – på 17 sprog.", mission: "Vores mission", missionText: "Giv hver praksis friheden til at fokusere på det, der tæller: patienterne.", back: "← Tilbage" },
}

export default function UeberUns() {
  const [lang, setLang] = useState("de")
  useEffect(() => {
    const p = new URLSearchParams(window.location.search)
    const ul = p.get("setLang")
    const stored = ul || localStorage.getItem("lang")
    if (stored && texts[stored]) setLang(stored)
    else setLang("en")
  }, [])
  const t = texts[lang] || texts.en

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white border border-blue-200 shadow-sm rounded-xl p-6 sm:p-10">
          <h1 className="text-2xl sm:text-4xl font-bold mb-4 text-gray-900">{t.title}</h1>
          <h2 className="text-lg sm:text-2xl font-semibold mb-6 text-[#1E40AF]">{t.headline}</h2>
          <p className="text-sm sm:text-lg text-gray-700 mb-10">{t.text}</p>
          <div className="bg-gradient-to-r from-[#3B82F6] to-[#1E40AF] text-white p-6 sm:p-8 rounded-xl">
            <h3 className="text-lg sm:text-2xl font-semibold mb-3">{t.mission}</h3>
            <p className="text-base sm:text-xl">"{t.missionText}"</p>
          </div>
        </div>
        <div className="mt-6 text-center"><Link href="/" className="text-[#3B82F6] hover:text-blue-600 underline text-base sm:text-lg">{t.back}</Link></div>
      </div>
    </main>
  )
}
