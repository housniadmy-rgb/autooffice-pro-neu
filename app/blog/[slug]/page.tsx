"use client"
import { useParams, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"

const articles: Record<string, any> = {
  a1: {
    de: { t:"Terminausfälle reduzieren", c:"Automatische Erinnerungen per E-Mail und SMS können bis zu 30% der Terminausfälle vermeiden. PraxisOnline sendet vollautomatisch Erinnerungen – DSGVO-konform und weltweit." },
    en: { t:"Reduce No-Shows", c:"Automatic email and SMS reminders can avoid up to 30% of missed appointments. PraxisOnline sends reminders fully automatically – GDPR-compliant and worldwide." },
    fr: { t:"Réduire les absences", c:"Les rappels automatiques par e-mail et SMS évitent jusqu'à 30% des rendez-vous manqués. PraxisOnline envoie des rappels entièrement automatiques." },
    es: { t:"Reducir ausencias", c:"Los recordatorios automáticos por email y SMS evitan hasta el 30% de citas perdidas. PraxisOnline envía recordatorios totalmente automáticos." },
    it: { t:"Ridurre le assenze", c:"I promemoria automatici via email e SMS evitano fino al 30% degli appuntamenti persi. PraxisOnline invia promemoria completamente automatici." },
    pt: { t:"Reduzir faltas", c:"Lembretes automáticos por e-mail e SMS evitam até 30% das consultas perdidas. PraxisOnline envia lembretes totalmente automáticos." },
    nl: { t:"No-shows verminderen", c:"Automatische e-mail- en sms-herinneringen voorkomen tot 30% van de no-shows. PraxisOnline verstuurt volledig automatische herinneringen." },
    pl: { t:"Zmniejsz nieobecności", c:"Automatyczne przypomnienia e-mail i SMS zapobiegają nawet 30% nieobecności. PraxisOnline wysyła w pełni automatyczne przypomnienia." },
    tr: { t:"Gelmeyenleri azaltın", c:"Otomatik e-posta ve SMS hatırlatmaları, kaçırılan randevuların %30'unu önler. PraxisOnline tam otomatik hatırlatmalar gönderir." },
    ja: { t:"無断キャンセルを減らす", c:"自動メールとSMSリマインダーで、無断キャンセルを最大30%削減できます。PraxisOnlineは完全自動でリマインダーを送信します。" },
    zh: { t:"减少爽约", c:"自动邮件和短信提醒可避免高达30%的爽约。PraxisOnline全自动发送提醒——符合GDPR，全球通用。" },
    cs: { t:"Snížit zmeškané termíny", c:"Automatické e-mailové a SMS připomínky mohou zabránit až 30% zmeškaných termínů. PraxisOnline odesílá plně automatické připomínky." },
    sk: { t:"Znížiť zmeškané termíny", c:"Automatické e-mailové a SMS pripomienky môžu zabrániť až 30% zmeškaných termínov. PraxisOnline odosiela plne automatické pripomienky." },
    sl: { t:"Zmanjšati zamujene termine", c:"Samodejni e-poštni in SMS opomniki lahko preprečijo do 30% zamujenih terminov. PraxisOnline pošilja popolnoma samodejne opomnike." },
    sv: { t:"Minska uteblivna besök", c:"Automatiska e-post- och SMS-påminnelser kan förhindra upp till 30% av uteblivna besök. PraxisOnline skickar helautomatiska påminnelser." },
    no: { t:"Redusere uteblivelser", c:"Automatiske e-post- og SMS-påminnelser kan forhindre opptil 30% av uteblivelser. PraxisOnline sender helautomatiske påminnelser." },
    da: { t:"Reducer udeblivelser", c:"Automatiske e-mail- og SMS-påmindelser kan forhindre op til 30% af udeblivelser. PraxisOnline sender fuldautomatiske påmindelser." },
  },
  a2: {
    de: { t:"DSGVO-Patientenerinnerung", c:"Die DSGVO stellt strenge Anforderungen. PraxisOnline verschlüsselt alle Daten und speichert sie ausschließlich auf EU-Servern – DSGVO-konform." },
    en: { t:"GDPR-Compliant Reminders", c:"GDPR places strict requirements. PraxisOnline encrypts all data and stores it exclusively on EU servers – fully compliant." },
    fr: { t:"Rappels conformes RGPD", c:"Le RGPD impose des exigences strictes. PraxisOnline crypte toutes les données et les stocke exclusivement sur des serveurs européens." },
    es: { t:"Recordatorios conformes RGPD", c:"El RGPD impone requisitos estrictos. PraxisOnline encripta todos los datos en servidores de la UE." },
    it: { t:"Promemoria conformi GDPR", c:"Il GDPR impone requisiti rigorosi. PraxisOnline crittografa tutti i dati su server UE." },
    pt: { t:"Lembretes conformes RGPD", c:"O RGPD impõe requisitos rigorosos. PraxisOnline criptografa todos os dados em servidores da UE." },
    nl: { t:"AVG-conforme herinneringen", c:"De AVG stelt strenge eisen. PraxisOnline versleutelt alle gegevens op EU-servers." },
    pl: { t:"Przypomnienia zgodne z RODO", c:"RODO stawia surowe wymagania. PraxisOnline szyfruje wszystkie dane na serwerach UE." },
    tr: { t:"GDPR uyumlu hatırlatmalar", c:"GDPR katı gereklilikler getirir. PraxisOnline tüm verileri AB sunucularında şifreler." },
    ja: { t:"GDPR準拠リマインダー", c:"GDPRは厳格な要件を課します。PraxisOnlineは全データを暗号化しEUサーバーに保存します。" },
    zh: { t:"符合GDPR的提醒", c:"GDPR要求严格。PraxisOnline加密所有数据并存储在欧盟服务器上。" },
    cs: { t:"GDPR připomínky", c:"GDPR klade přísné požadavky. PraxisOnline šifruje všechna data na serverech EU." },
    sk: { t:"GDPR pripomienky", c:"GDPR kladie prísne požiadavky. PraxisOnline šifruje všetky dáta na serveroch EÚ." },
    sl: { t:"GDPR opomniki", c:"GDPR postavlja stroge zahteve. PraxisOnline šifrira vse podatke na strežnikih EU." },
    sv: { t:"GDPR-påminnelser", c:"GDPR ställer strikta krav. PraxisOnline krypterar all data på EU-servrar." },
    no: { t:"GDPR-påminnelser", c:"GDPR stiller strenge krav. PraxisOnline krypterer alle data på EU-servere." },
    da: { t:"GDPR-påmindelser", c:"GDPR stiller strenge krav. PraxisOnline krypterer alle data på EU-servere." },
  },
  a3: {
    de: { t:"Mehr Google-Bewertungen", c:"Positive Google-Bewertungen bringen mehr Patienten. PraxisOnline sendet nach jedem Termin automatisch eine Bewertungsanfrage." },
    en: { t:"More Google Reviews", c:"Positive Google reviews bring more patients. PraxisOnline automatically sends a review request after each appointment." },
    fr: { t:"Plus d'avis Google", c:"Les avis Google positifs attirent plus de patients. PraxisOnline envoie automatiquement une demande d'avis après chaque rendez-vous." },
    es: { t:"Más reseñas Google", c:"Las reseñas positivas de Google atraen más pacientes. PraxisOnline envía automáticamente una solicitud de reseña." },
    it: { t:"Più recensioni Google", c:"Le recensioni positive su Google portano più pazienti. PraxisOnline invia automaticamente una richiesta di recensione." },
    pt: { t:"Mais avaliações Google", c:"Avaliações positivas no Google trazem mais pacientes. PraxisOnline envia automaticamente um pedido de avaliação." },
    nl: { t:"Meer Google-reviews", c:"Positieve Google-reviews brengen meer patiënten. PraxisOnline stuurt automatisch een reviewverzoek." },
    pl: { t:"Więcej opinii Google", c:"Pozytywne opinie Google przyciągają więcej pacjentów. PraxisOnline automatycznie wysyła prośbę o opinię." },
    tr: { t:"Daha fazla Google yorumu", c:"Olumlu Google yorumları daha fazla hasta getirir. PraxisOnline her randevudan sonra otomatik olarak yorum talebi gönderir." },
    ja: { t:"Googleレビューを増やす", c:"肯定的なGoogleレビューはより多くの患者を呼び込みます。PraxisOnlineは毎回の予約後に自動でレビュー依頼を送信します。" },
    zh: { t:"更多谷歌评论", c:"积极的谷歌评论能带来更多患者。PraxisOnline在每次预约后自动发送评论请求。" },
    cs: { t:"Více Google recenzí", c:"Pozitivní Google recenze přinášejí více pacientů. PraxisOnline automaticky odesílá žádost o recenzi po každé schůzce." },
    sk: { t:"Viac Google recenzií", c:"Pozitívne Google recenzie prinášajú viac pacientov. PraxisOnline automaticky odosiela žiadosť o recenziu." },
    sl: { t:"Več Google ocen", c:"Pozitivne Google ocene prinašajo več pacientov. PraxisOnline po vsakem terminu samodejno pošlje prošnjo za oceno." },
    sv: { t:"Fler Google-recensioner", c:"Positiva Google-recensioner ger fler patienter. PraxisOnline skickar automatiskt en recensionsförfrågan." },
    no: { t:"Flere Google-anmeldelser", c:"Positive Google-anmeldelser gir flere pasienter. PraxisOnline sender automatisk en anmeldelsesforespørsel." },
    da: { t:"Flere Google-anmeldelser", c:"Positive Google-anmeldelser giver flere patienter. PraxisOnline sender automatisk en anmeldelsesanmodning." },
  },
}

const ctas: Record<string, any> = {
  de: { text: "Möchten Sie PraxisOnline testen?", btn: "Kostenlos starten", back: "← Zurück zum Blog" },
  en: { text: "Want to try PraxisOnline?", btn: "Start Free", back: "← Back to Blog" },
  fr: { text: "Vous voulez tester PraxisOnline ?", btn: "Essai gratuit", back: "← Retour au blog" },
  es: { text: "¿Quiere probar PraxisOnline?", btn: "Empezar gratis", back: "← Volver al blog" },
  it: { text: "Vuoi provare PraxisOnline?", btn: "Inizia gratis", back: "← Torna al blog" },
  pt: { text: "Quer testar o PraxisOnline?", btn: "Começar grátis", back: "← Voltar ao blog" },
  nl: { text: "Wilt u PraxisOnline testen?", btn: "Gratis starten", back: "← Terug naar blog" },
  pl: { text: "Chcesz przetestować PraxisOnline?", btn: "Zacznij za darmo", back: "← Wróć do bloga" },
  tr: { text: "PraxisOnline'ı test etmek ister misiniz?", btn: "Ücretsiz başla", back: "← Blog'a dön" },
  ja: { text: "PraxisOnlineを試してみませんか？", btn: "無料で始める", back: "← ブログに戻る" },
  zh: { text: "想试用PraxisOnline吗？", btn: "免费开始", back: "← 返回博客" },
  cs: { text: "Chcete vyzkoušet PraxisOnline?", btn: "Začít zdarma", back: "← Zpět na blog" },
  sk: { text: "Chcete vyskúšať PraxisOnline?", btn: "Začať zadarmo", back: "← Späť na blog" },
  sl: { text: "Želite preizkusiti PraxisOnline?", btn: "Začni brezplačno", back: "← Nazaj na blog" },
  sv: { text: "Vill du prova PraxisOnline?", btn: "Börja gratis", back: "← Tillbaka till bloggen" },
  no: { text: "Vil du prøve PraxisOnline?", btn: "Start gratis", back: "← Tilbake til blogg" },
  da: { text: "Vil du prøve PraxisOnline?", btn: "Start gratis", back: "← Tilbage til blog" },
}

export default function BlogArticle() {
  const params = useParams()
  const searchParams = useSearchParams()
  const slug = params.slug as string
  const article = articles[slug]
  const [lang, setLang] = useState("en")

  useEffect(() => {
    const urlLang = searchParams.get("setLang")
    const stored = urlLang || localStorage.getItem("lang")
    if (stored && articles[slug]?.[stored]) setLang(stored)
    else if (stored && ctas[stored]) setLang(stored)
    else setLang("en")
  }, [searchParams, slug])

  if (!article) return (
    <main className="min-h-screen p-8 flex items-center justify-center">
      <div className="text-center"><h1 className="text-3xl font-bold text-gray-900 mb-4">Artikel nicht gefunden</h1><Link href="/blog" className="text-[#3B82F6] underline text-lg">← Zurück zum Blog</Link></div>
    </main>
  )

  const t = article[lang] || article.en
  const cta = ctas[lang] || ctas.en

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4 sm:p-8 max-w-3xl mx-auto">
      <div className="bg-white border border-blue-200 shadow-sm rounded-xl p-6 sm:p-10">
        <h1 className="text-2xl sm:text-4xl font-bold mb-4 sm:mb-6 text-gray-900">{t.t}</h1>
        <p className="text-sm sm:text-lg text-gray-700 leading-relaxed mb-6 sm:mb-8">{t.c}</p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6 text-center">
          <p className="text-base sm:text-lg text-gray-700 mb-3 sm:mb-4">{cta.text}</p>
          <Link href="/registrieren" className="bg-[#1E40AF] text-white text-base sm:text-lg font-semibold px-6 sm:px-8 py-2 sm:py-3 rounded-lg hover:bg-green-600 transition">{cta.btn}</Link>
        </div>
      </div>
      <div className="mt-6 text-center"><Link href="/blog" className="text-[#3B82F6] hover:text-blue-600 underline text-base sm:text-lg">{cta.back}</Link></div>
    </main>
  )
}
