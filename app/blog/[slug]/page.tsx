"use client"
import { useParams, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"

const articles: Record<string, any> = {
  a1: {
    de: { t:"Terminausfälle reduzieren", c:"Automatische Erinnerungen per E-Mail und SMS können bis zu 30% der Terminausfälle vermeiden. PraxisOnline24 sendet vollautomatisch Erinnerungen – DSGVO-konform und weltweit." },
    en: { t:"Reduce No-Shows", c:"Automatic email and SMS reminders can avoid up to 30% of missed appointments. PraxisOnline24 sends reminders fully automatically – GDPR-compliant and worldwide." },
    fr: { t:"Réduire les absences", c:"Les rappels automatiques par e-mail et SMS évitent jusqu'à 30% des rendez-vous manqués. PraxisOnline24 envoie des rappels entièrement automatiques." },
    es: { t:"Reducir ausencias", c:"Los recordatorios automáticos por email y SMS evitan hasta el 30% de citas perdidas. PraxisOnline24 envía recordatorios totalmente automáticos." },
    it: { t:"Ridurre le assenze", c:"I promemoria automatici via email e SMS evitano fino al 30% degli appuntamenti persi. PraxisOnline24 invia promemoria completamente automatici." },
    pt: { t:"Reduzir faltas", c:"Lembretes automáticos por e-mail e SMS evitam até 30% das consultas perdidas. PraxisOnline24 envia lembretes totalmente automáticos." },
    nl: { t:"No-shows verminderen", c:"Automatische e-mail- en sms-herinneringen voorkomen tot 30% van de no-shows. PraxisOnline24 verstuurt volledig automatische herinneringen." },
    pl: { t:"Zmniejsz nieobecności", c:"Automatyczne przypomnienia e-mail i SMS zapobiegają nawet 30% nieobecności. PraxisOnline24 wysyła w pełni automatyczne przypomnienia." },
    tr: { t:"Gelmeyenleri azaltın", c:"Otomatik e-posta ve SMS hatırlatmaları, kaçırılan randevuların %30'unu önler. PraxisOnline24 tam otomatik hatırlatmalar gönderir." },
    ja: { t:"無断キャンセルを減らす", c:"自動メールとSMSリマインダーで、無断キャンセルを最大30%削減できます。PraxisOnline24は完全自動でリマインダーを送信します。" },
    zh: { t:"减少爽约", c:"自动邮件和短信提醒可避免高达30%的爽约。PraxisOnline24全自动发送提醒——符合GDPR，全球通用。" },
    cs: { t:"Snížit zmeškané termíny", c:"Automatické e-mailové a SMS připomínky mohou zabránit až 30% zmeškaných termínů. PraxisOnline24 odesílá plně automatické připomínky." },
    sk: { t:"Znížiť zmeškané termíny", c:"Automatické e-mailové a SMS pripomienky môžu zabrániť až 30% zmeškaných termínov. PraxisOnline24 odosiela plne automatické pripomienky." },
    sl: { t:"Zmanjšati zamujene termine", c:"Samodejni e-poštni in SMS opomniki lahko preprečijo do 30% zamujenih terminov. PraxisOnline24 pošilja popolnoma samodejne opomnike." },
    sv: { t:"Minska uteblivna besök", c:"Automatiska e-post- och SMS-påminnelser kan förhindra upp till 30% av uteblivna besök. PraxisOnline24 skickar helautomatiska påminnelser." },
    no: { t:"Redusere uteblivelser", c:"Automatiske e-post- og SMS-påminnelser kan forhindre opptil 30% av uteblivelser. PraxisOnline24 sender helautomatiske påminnelser." },
    da: { t:"Reducer udeblivelser", c:"Automatiske e-mail- og SMS-påmindelser kan forhindre op til 30% af udeblivelser. PraxisOnline24 sender fuldautomatiske påmindelser." },
  },
  a2: {
    de: { t:"DSGVO-Patientenerinnerung", c:"Die DSGVO stellt strenge Anforderungen. PraxisOnline24 verschlüsselt alle Daten und speichert sie ausschließlich auf EU-Servern – DSGVO-konform." },
    en: { t:"GDPR-Compliant Reminders", c:"GDPR places strict requirements. PraxisOnline24 encrypts all data and stores it exclusively on EU servers – fully compliant." },
    fr: { t:"Rappels conformes RGPD", c:"Le RGPD impose des exigences strictes. PraxisOnline24 crypte toutes les données et les stocke exclusivement sur des serveurs européens." },
    es: { t:"Recordatorios conformes RGPD", c:"El RGPD impone requisitos estrictos. PraxisOnline24 encripta todos los datos en servidores de la UE." },
    it: { t:"Promemoria conformi GDPR", c:"Il GDPR impone requisiti rigorosi. PraxisOnline24 crittografa tutti i dati su server UE." },
    pt: { t:"Lembretes conformes RGPD", c:"O RGPD impõe requisitos rigorosos. PraxisOnline24 criptografa todos os dados em servidores da UE." },
    nl: { t:"AVG-conforme herinneringen", c:"De AVG stelt strenge eisen. PraxisOnline24 versleutelt alle gegevens op EU-servers." },
    pl: { t:"Przypomnienia zgodne z RODO", c:"RODO stawia surowe wymagania. PraxisOnline24 szyfruje wszystkie dane na serwerach UE." },
    tr: { t:"GDPR uyumlu hatırlatmalar", c:"GDPR katı gereklilikler getirir. PraxisOnline24 tüm verileri AB sunucularında şifreler." },
    ja: { t:"GDPR準拠リマインダー", c:"GDPRは厳格な要件を課します。PraxisOnline24は全データを暗号化しEUサーバーに保存します。" },
    zh: { t:"符合GDPR的提醒", c:"GDPR要求严格。PraxisOnline24加密所有数据并存储在欧盟服务器上。" },
    cs: { t:"GDPR připomínky", c:"GDPR klade přísné požadavky. PraxisOnline24 šifruje všechna data na serverech EU." },
    sk: { t:"GDPR pripomienky", c:"GDPR kladie prísne požiadavky. PraxisOnline24 šifruje všetky dáta na serveroch EÚ." },
    sl: { t:"GDPR opomniki", c:"GDPR postavlja stroge zahteve. PraxisOnline24 šifrira vse podatke na strežnikih EU." },
    sv: { t:"GDPR-påminnelser", c:"GDPR ställer strikta krav. PraxisOnline24 krypterar all data på EU-servrar." },
    no: { t:"GDPR-påminnelser", c:"GDPR stiller strenge krav. PraxisOnline24 krypterer alle data på EU-servere." },
    da: { t:"GDPR-påmindelser", c:"GDPR stiller strenge krav. PraxisOnline24 krypterer alle data på EU-servere." },
  },
  a3: {
    de: { t:"Mehr Google-Bewertungen", c:"Positive Google-Bewertungen bringen mehr Patienten. PraxisOnline24 sendet nach jedem Termin automatisch eine Bewertungsanfrage." },
    en: { t:"More Google Reviews", c:"Positive Google reviews bring more patients. PraxisOnline24 automatically sends a review request after each appointment." },
    fr: { t:"Plus d'avis Google", c:"Les avis Google positifs attirent plus de patients. PraxisOnline24 envoie automatiquement une demande d'avis après chaque rendez-vous." },
    es: { t:"Más reseñas Google", c:"Las reseñas positivas de Google atraen más pacientes. PraxisOnline24 envía automáticamente una solicitud de reseña." },
    it: { t:"Più recensioni Google", c:"Le recensioni positive su Google portano più pazienti. PraxisOnline24 invia automaticamente una richiesta di recensione." },
    pt: { t:"Mais avaliações Google", c:"Avaliações positivas no Google trazem mais pacientes. PraxisOnline24 envia automaticamente um pedido de avaliação." },
    nl: { t:"Meer Google-reviews", c:"Positieve Google-reviews brengen meer patiënten. PraxisOnline24 stuurt automatisch een reviewverzoek." },
    pl: { t:"Więcej opinii Google", c:"Pozytywne opinie Google przyciągają więcej pacjentów. PraxisOnline24 automatycznie wysyła prośbę o opinię." },
    tr: { t:"Daha fazla Google yorumu", c:"Olumlu Google yorumları daha fazla hasta getirir. PraxisOnline24 her randevudan sonra otomatik olarak yorum talebi gönderir." },
    ja: { t:"Googleレビューを増やす", c:"肯定的なGoogleレビューはより多くの患者を呼び込みます。PraxisOnline24は毎回の予約後に自動でレビュー依頼を送信します。" },
    zh: { t:"更多谷歌评论", c:"积极的谷歌评论能带来更多患者。PraxisOnline24在每次预约后自动发送评论请求。" },
    cs: { t:"Více Google recenzí", c:"Pozitivní Google recenze přinášejí více pacientů. PraxisOnline24 automaticky odesílá žádost o recenzi po každé schůzce." },
    sk: { t:"Viac Google recenzií", c:"Pozitívne Google recenzie prinášajú viac pacientov. PraxisOnline24 automaticky odosiela žiadosť o recenziu." },
    sl: { t:"Več Google ocen", c:"Pozitivne Google ocene prinašajo več pacientov. PraxisOnline24 po vsakem terminu samodejno pošlje prošnjo za oceno." },
    sv: { t:"Fler Google-recensioner", c:"Positiva Google-recensioner ger fler patienter. PraxisOnline24 skickar automatiskt en recensionsförfrågan." },
    no: { t:"Flere Google-anmeldelser", c:"Positive Google-anmeldelser gir flere pasienter. PraxisOnline24 sender automatisk en anmeldelsesforespørsel." },
    da: { t:"Flere Google-anmeldelser", c:"Positive Google-anmeldelser giver flere patienter. PraxisOnline24 sender automatisk en anmeldelsesanmodning." },
  },
}

const ctas: Record<string, any> = {
  de: { text: "Möchten Sie PraxisOnline24 testen?", btn: "Kostenlos starten", back: "← Zurück zum Blog" },
  en: { text: "Want to try PraxisOnline24?", btn: "Start Free", back: "← Back to Blog" },
  fr: { text: "Vous voulez tester PraxisOnline24 ?", btn: "Essai gratuit", back: "← Retour au blog" },
  es: { text: "¿Quiere probar PraxisOnline24?", btn: "Empezar gratis", back: "← Volver al blog" },
  it: { text: "Vuoi provare PraxisOnline24?", btn: "Inizia gratis", back: "← Torna al blog" },
  pt: { text: "Quer testar o PraxisOnline24?", btn: "Começar grátis", back: "← Voltar ao blog" },
  nl: { text: "Wilt u PraxisOnline24 testen?", btn: "Gratis starten", back: "← Terug naar blog" },
  pl: { text: "Chcesz przetestować PraxisOnline24?", btn: "Zacznij za darmo", back: "← Wróć do bloga" },
  tr: { text: "PraxisOnline24'ı test etmek ister misiniz?", btn: "Ücretsiz başla", back: "← Blog'a dön" },
  ja: { text: "PraxisOnline24を試してみませんか？", btn: "無料で始める", back: "← ブログに戻る" },
  zh: { text: "想试用PraxisOnline24吗？", btn: "免费开始", back: "← 返回博客" },
  cs: { text: "Chcete vyzkoušet PraxisOnline24?", btn: "Začít zdarma", back: "← Zpět na blog" },
  sk: { text: "Chcete vyskúšať PraxisOnline24?", btn: "Začať zadarmo", back: "← Späť na blog" },
  sl: { text: "Želite preizkusiti PraxisOnline24?", btn: "Začni brezplačno", back: "← Nazaj na blog" },
  sv: { text: "Vill du prova PraxisOnline24?", btn: "Börja gratis", back: "← Tillbaka till bloggen" },
  no: { text: "Vil du prøve PraxisOnline24?", btn: "Start gratis", back: "← Tilbake til blogg" },
  da: { text: "Vil du prøve PraxisOnline24?", btn: "Start gratis", back: "← Tilbage til blog" },
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
