"use client"
import { useState, useEffect } from "react"
import Link from "next/link"

const texts: Record<string, Record<string, string>> = {
  de: {
    title: "Preise",
    subtitle: "1 Monat kostenlos testen – danach flexibel monatlich kündbar",
    basic: "Basic",
    pro: "Pro",
    business: "Business",
    perMonth: "/Monat",
    basic1: "Online-Terminbuchung",
    basic2: "E-Mail-Erinnerungen",
    basic3: "Für kleine Praxen",
    pro1: "Alles aus Basic",
    pro2: "Bewertungssteuerung",
    pro3: "Für wachsende Praxen",
    bus1: "Alles aus Pro",
    bus2: "Storno + Warteliste",
    bus3: "Für größere Praxen",
    start: "Kostenlos starten",
    freeMonth: "1 Monat kostenlos",
    back: "← Zurück zur Startseite",
  },
  en: {
    title: "Pricing",
    subtitle: "Try free for 1 month – then flexible monthly cancellation",
    basic: "Basic",
    pro: "Pro",
    business: "Business",
    perMonth: "/month",
    basic1: "Online Booking",
    basic2: "Email Reminders",
    basic3: "For small practices",
    pro1: "Everything from Basic",
    pro2: "Review Management",
    pro3: "For growing practices",
    bus1: "Everything from Pro",
    bus2: "Cancellation + waitlist",
    bus3: "For larger practices",
    start: "Start free",
    freeMonth: "1 month free",
    back: "← Back to home",
  },
  fr: {
    title: "Tarifs",
    subtitle: "1 mois d'essai gratuit – puis résiliation flexible mensuelle",
    basic: "Basique",
    pro: "Professionnel",
    business: "Entreprise",
    perMonth: "/mois",
    basic1: "Rendez-vous en ligne",
    basic2: "Rappels email",
    basic3: "Pour petits cabinets",
    pro1: "Tout de Basique",
    pro2: "Gestion des avis",
    pro3: "Pour cabinets en croissance",
    bus1: "Tout de Pro",
    bus2: "Annulation + liste d'attente",
    bus3: "Pour grands cabinets",
    start: "Démarrer gratuitement",
    freeMonth: "1 mois gratuit",
    back: "← Retour à l'accueil",
  },
  es: {
    title: "Precios",
    subtitle: "1 mes de prueba gratis – cancelación flexible mensual",
    basic: "Básico",
    pro: "Profesional",
    business: "Empresa",
    perMonth: "/mes",
    basic1: "Reservas online",
    basic2: "Recordatorios email",
    basic3: "Para pequeños consultorios",
    pro1: "Todo de Básico",
    pro2: "Gestión de opiniones",
    pro3: "Para consultorios en crecimiento",
    bus1: "Todo de Pro",
    bus2: "Cancelación + lista de espera",
    bus3: "Para grandes consultorios",
    start: "Comenzar gratis",
    freeMonth: "1 mes gratis",
    back: "← Volver al inicio",
  },
  it: {
    title: "Prezzi",
    subtitle: "1 mese di prova gratuita – poi disdetta mensile flessibile",
    basic: "Base",
    pro: "Professionale",
    business: "Azienda",
    perMonth: "/mese",
    basic1: "Prenotazioni online",
    basic2: "Promemoria email",
    basic3: "Per piccoli studi",
    pro1: "Tutto di Base",
    pro2: "Gestione recensioni",
    pro3: "Per studi in crescita",
    bus1: "Tutto di Pro",
    bus2: "Cancellazione + lista d'attesa",
    bus3: "Per grandi studi",
    start: "Inizia gratis",
    freeMonth: "1 mese gratis",
    back: "← Torna alla home",
  },
  pt: {
    title: "Preços",
    subtitle: "1 mês grátis para testar – cancelamento mensal flexível",
    basic: "Básico",
    pro: "Profissional",
    business: "Empresa",
    perMonth: "/mês",
    basic1: "Agendamento online",
    basic2: "Lembretes email",
    basic3: "Para pequenas clínicas",
    pro1: "Tudo do Básico",
    pro2: "Gestão de avaliações",
    pro3: "Para clínicas em crescimento",
    bus1: "Tudo do Pro",
    bus2: "Cancelamento + lista de espera",
    bus3: "Para grandes clínicas",
    start: "Começar grátis",
    freeMonth: "1 mês grátis",
    back: "← Voltar ao início",
  },
  nl: {
    title: "Prijzen",
    subtitle: "1 maand gratis proberen – daarna flexibel maandelijks opzegbaar",
    basic: "Basis",
    pro: "Professioneel",
    business: "Zakelijk",
    perMonth: "/maand",
    basic1: "Online afspraken",
    basic2: "Email herinneringen",
    basic3: "Voor kleine praktijken",
    pro1: "Alles van Basis",
    pro2: "Beoordelingsbeheer",
    pro3: "Voor groeiende praktijken",
    bus1: "Alles van Pro",
    bus2: "Annulering + wachtlijst",
    bus3: "Voor grote praktijken",
    start: "Gratis starten",
    freeMonth: "1 maand gratis",
    back: "← Terug naar home",
  },
  pl: {
    title: "Ceny",
    subtitle: "1 miesiąc za darmo – potem elastyczne miesięczne wypowiedzenie",
    basic: "Podstawowy",
    pro: "Profesjonalny",
    business: "Biznes",
    perMonth: "/miesiąc",
    basic1: "Rezerwacje online",
    basic2: "Przypomnienia email",
    basic3: "Dla małych praktyk",
    pro1: "Wszystko z Podstawowego",
    pro2: "Zarządzanie opiniami",
    pro3: "Dla rozwijających się praktyk",
    bus1: "Wszystko z Pro",
    bus2: "Anulowanie + lista oczekujących",
    bus3: "Dla dużych praktyk",
    start: "Zacznij za darmo",
    freeMonth: "1 miesiąc za darmo",
    back: "← Powrót do strony głównej",
  },
  tr: {
    title: "Fiyatlar",
    subtitle: "1 ay ücretsiz dene – sonra esnek aylık iptal",
    basic: "Temel",
    pro: "Profesyonel",
    business: "Kurumsal",
    perMonth: "/ay",
    basic1: "Online Randevu",
    basic2: "Email Hatırlatmalar",
    basic3: "Küçük pratikler için",
    pro1: "Temel'deki her şey",
    pro2: "Değerlendirme Yönetimi",
    pro3: "Büyüyen pratikler için",
    bus1: "Pro'daki her şey",
    bus2: "İptal + bekleme listesi",
    bus3: "Büyük pratikler için",
    start: "Ücretsiz başla",
    freeMonth: "1 ay ücretsiz",
    back: "← Ana sayfaya dön",
  },
}

const stripeLinks: Record<string, string> = {
  basic: "https://buy.stripe.com/fZu6oJgOA9SW4uDbGIfAc0c",
  pro: "https://buy.stripe.com/5kQeVfdCo5CG3qz8uwfAc0d",
  business: "https://buy.stripe.com/8x28wRdCo0im0eneSUfAc0e",
}

export default function PreisePage() {
  const [lang, setLang] = useState("de")

  useEffect(() => {
    const s = localStorage.getItem("lang")
    if (s && texts[s]) setLang(s)
    else {
      const browserLang = navigator.language.split("-")[0]
      setLang(texts[browserLang] ? browserLang : "de")
    }
  }, [])

  const t = texts[lang] || texts.de

  const handleCheckout = (plan: string) => {
    window.open(stripeLinks[plan], "_blank")
  }

  return (
    <main className="min-h-screen bg-white py-8">
      <div className="max-w-5xl mx-auto px-4">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-center text-gray-900">{t.title}</h1>
        <p className="text-center text-sm sm:text-base text-gray-500 mb-8">{t.subtitle}</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8">
          {/* Basic */}
          <div className="bg-white border border-gray-200 p-4 sm:p-6 rounded-xl shadow-sm">
            <h3 className="text-base sm:text-lg font-semibold mb-1">{t.basic}</h3>
            <p className="text-xl sm:text-2xl font-bold mb-2 text-[#1E40AF]">19€<span className="text-xs text-gray-400">{t.perMonth}</span></p>
            <p className="text-xs text-green-600 font-semibold mb-2">✅ {t.freeMonth}</p>
            <ul className="text-left text-xs sm:text-sm text-gray-500 space-y-1 mb-4">
              <li>✓ {t.basic1}</li>
              <li>✓ {t.basic2}</li>
              <li>✓ {t.basic3}</li>
            </ul>
            <button onClick={() => handleCheckout("basic")} className="block w-full bg-[#1E40AF] text-white font-semibold py-2 rounded-full hover:bg-blue-800 transition text-sm cursor-pointer">
              {t.start}
            </button>
          </div>

          {/* Pro */}
          <div className="bg-[#1E40AF] text-white p-4 sm:p-6 rounded-xl shadow-lg sm:scale-105">
            <h3 className="text-base sm:text-lg font-semibold mt-2 mb-1">{t.pro}</h3>
            <p className="text-xl sm:text-2xl font-bold mb-2">49€<span className="text-xs text-blue-200">{t.perMonth}</span></p>
            <p className="text-xs text-green-300 font-semibold mb-2">✅ {t.freeMonth}</p>
            <ul className="text-left text-xs sm:text-sm text-blue-100 space-y-1 mb-4">
              <li>✓ {t.pro1}</li>
              <li>✓ {t.pro2}</li>
              <li>✓ {t.pro3}</li>
            </ul>
            <button onClick={() => handleCheckout("pro")} className="block w-full bg-white text-[#1E40AF] font-semibold py-2 rounded-full hover:bg-gray-100 transition text-sm cursor-pointer">
              {t.start}
            </button>
          </div>

          {/* Business */}
          <div className="bg-white border border-gray-200 p-4 sm:p-6 rounded-xl shadow-sm">
            <h3 className="text-base sm:text-lg font-semibold mb-1">{t.business}</h3>
            <p className="text-xl sm:text-2xl font-bold mb-2 text-[#1E40AF]">89€<span className="text-xs text-gray-400">{t.perMonth}</span></p>
            <p className="text-xs text-green-600 font-semibold mb-2">✅ {t.freeMonth}</p>
            <ul className="text-left text-xs sm:text-sm text-gray-500 space-y-1 mb-4">
              <li>✓ {t.bus1}</li>
              <li>✓ {t.bus2}</li>
              <li>✓ {t.bus3}</li>
            </ul>
            <button onClick={() => handleCheckout("business")} className="block w-full bg-[#3B82F6] text-white font-semibold py-2 rounded-full hover:bg-blue-600 transition text-sm cursor-pointer">
              {t.start}
            </button>
          </div>
        </div>

        <Link href="/" className="inline-block mt-8 text-[#1E40AF] underline text-sm">← {t.back}</Link>
      </div>
    </main>
  )
}