"use client"
import { useState, useEffect } from "react"
import Link from "next/link"

const texts: Record<string, any> = {
  de: { title: "AGB", back: "← Zurück", p1:"1. Geltungsbereich",t1:"Diese AGB gelten zwischen PraxisOnline und Nutzern.", p2:"2. Vertrag",t2:"SaaS für Online-Terminbuchung für Arztpraxen.", p3:"3. Preise",t3:"39€/79€/149€ pro Monat. Zahlung per Stripe.", p4:"4. Kündigung",t4:"Jederzeit kündbar. Wirksam zum Periodenende.", p5:"5. Haftung",t5:"Nur für Vorsatz und grobe Fahrlässigkeit.", p6:"6. Datenschutz",t6:"DSGVO-konform. Siehe Datenschutzerklärung.", p7:"7. Sonstiges",t7:"Deutsches Recht. Gerichtsstand Musterstadt." },
  en: { title: "Terms", back: "← Back", p1:"1. Scope",t1:"These terms apply between PraxisOnline and users.", p2:"2. Contract",t2:"SaaS for online booking for medical practices.", p3:"3. Prices",t3:"39€/79€/149€ per month. Payment via Stripe.", p4:"4. Cancellation",t4:"Cancellable anytime. End of period.", p5:"5. Liability",t5:"Intent and gross negligence only.", p6:"6. Privacy",t6:"GDPR-compliant. See privacy policy.", p7:"7. Misc.",t7:"German law. Jurisdiction: Musterstadt." },
  fr: { title: "CGV", back: "← Retour", p1:"1. Champ",t1:"Ces CGV s'appliquent entre PraxisOnline et utilisateurs.", p2:"2. Contrat",t2:"SaaS de réservation pour cabinets médicaux.", p3:"3. Prix",t3:"39€/79€/149€ par mois. Paiement Stripe.", p4:"4. Résiliation",t4:"À tout moment. Fin de période.", p5:"5. Responsabilité",t5:"Faute intentionnelle et grave uniquement.", p6:"6. Confidentialité",t6:"Conforme RGPD.", p7:"7. Divers",t7:"Droit allemand. Tribunal: Musterstadt." },
  es: { title: "Términos", back: "← Volver", p1:"1. Ámbito",t1:"Estos términos aplican entre PraxisOnline y usuarios.", p2:"2. Contrato",t2:"SaaS de reservas para consultas médicas.", p3:"3. Precios",t3:"39€/79€/149€ al mes. Pago por Stripe.", p4:"4. Cancelación",t4:"En cualquier momento. Fin del período.", p5:"5. Responsabilidad",t5:"Solo dolo y negligencia grave.", p6:"6. Privacidad",t6:"Conforme RGPD.", p7:"7. Varios",t7:"Derecho alemán. Jurisdicción: Musterstadt." },
  it: { title: "Termini", back: "← Indietro", p1:"1. Ambito",t1:"Termini tra PraxisOnline e utenti.", p2:"2. Contratto",t2:"SaaS per prenotazione per studi medici.", p3:"3. Prezzi",t3:"39€/79€/149€ al mese. Pagamento Stripe.", p4:"4. Recesso",t4:"In qualsiasi momento. Fine periodo.", p5:"5. Responsabilità",t5:"Solo dolo e colpa grave.", p6:"6. Privacy",t6:"Conforme GDPR.", p7:"7. Varie",t7:"Legge tedesca. Foro: Musterstadt." },
  pt: { title: "Termos", back: "← Voltar", p1:"1. Âmbito",t1:"Termos entre PraxisOnline e utilizadores.", p2:"2. Contrato",t2:"SaaS de reservas para consultórios.", p3:"3. Preços",t3:"39€/79€/149€ por mês. Pagamento Stripe.", p4:"4. Cancelamento",t4:"A qualquer momento. Fim do período.", p5:"5. Responsabilidade",t5:"Apenas dolo e negligência grave.", p6:"6. Privacidade",t6:"Conforme RGPD.", p7:"7. Diversos",t7:"Lei alemã. Foro: Musterstadt." },
  nl: { title: "Voorwaarden", back: "← Terug", p1:"1. Toepassing",t1:"Deze voorwaarden gelden tussen PraxisOnline en gebruikers.", p2:"2. Contract",t2:"SaaS voor online boeken voor praktijken.", p3:"3. Prijzen",t3:"39€/79€/149€ per maand. Betaling via Stripe.", p4:"4. Opzegging",t4:"Altijd opzegbaar. Einde periode.", p5:"5. Aansprakelijkheid",t5:"Alleen opzet en grove nalatigheid.", p6:"6. Privacy",t6:"AVG-conform.", p7:"7. Overig",t7:"Duits recht. Bevoegde rechter: Musterstadt." },
  pl: { title: "Warunki", back: "← Wróć", p1:"1. Zakres",t1:"Warunki między PraxisOnline a użytkownikami.", p2:"2. Umowa",t2:"SaaS do rezerwacji online dla gabinetów.", p3:"3. Ceny",t3:"39€/79€/149€ miesięcznie. Płatność Stripe.", p4:"4. Rezygnacja",t4:"W każdej chwili. Koniec okresu.", p5:"5. Odpowiedzialność",t5:"Tylko wina umyślna i rażące niedbalstwo.", p6:"6. Prywatność",t6:"Zgodne z RODO.", p7:"7. Inne",t7:"Prawo niemieckie. Sąd: Musterstadt." },
  tr: { title: "Şartlar", back: "← Geri", p1:"1. Kapsam",t1:"Bu şartlar PraxisOnline ve kullanıcılar arasında geçerlidir.", p2:"2. Sözleşme",t2:"Muayenehaneler için online rezervasyon SaaS.", p3:"3. Fiyatlar",t3:"39€/79€/149€ aylık. Stripe ile ödeme.", p4:"4. İptal",t4:"Her zaman iptal edilebilir. Dönem sonu.", p5:"5. Sorumluluk",t5:"Sadece kasıt ve ağır ihmal.", p6:"6. Gizlilik",t6:"GDPR uyumlu.", p7:"7. Diğer",t7:"Alman hukuku. Yetkili mahkeme: Musterstadt." },
  ja: { title: "利用規約", back: "← 戻る", p1:"1. 適用範囲",t1:"本規約はPraxisOnlineと利用者間で適用されます。", p2:"2. 契約",t2:"医療機関向けオンライン予約SaaS。", p3:"3. 料金",t3:"月額39€/79€/149€。Stripe決済。", p4:"4. 解約",t4:"いつでも解約可能。期間終了時に有効。", p5:"5. 責任",t5:"故意および重大な過失のみ。", p6:"6. プライバシー",t6:"GDPR準拠。", p7:"7. その他",t7:"ドイツ法。管轄: Musterstadt。" },
  zh: { title: "条款", back: "← 返回", p1:"1. 范围",t1:"本条款适用于PraxisOnline与用户之间。", p2:"2. 合同",t2:"面向诊所的在线预约SaaS。", p3:"3. 价格",t3:"每月39€/79€/149€。Stripe支付。", p4:"4. 取消",t4:"随时可取消。周期结束时生效。", p5:"5. 责任",t5:"仅限故意和重大过失。", p6:"6. 隐私",t6:"符合GDPR。", p7:"7. 其他",t7:"德国法律。管辖地: Musterstadt。" },
  cs: { title: "Podmínky", back: "← Zpět", p1:"1. Rozsah",t1:"Tyto podmínky platí mezi PraxisOnline a uživateli.", p2:"2. Smlouva",t2:"SaaS pro online rezervace pro ordinace.", p3:"3. Ceny",t3:"39€/79€/149€ měsíčně. Platba Stripe.", p4:"4. Zrušení",t4:"Kdykoli. Účinnost na konci období.", p5:"5. Odpovědnost",t5:"Pouze úmysl a hrubá nedbalost.", p6:"6. Soukromí",t6:"GDPR.", p7:"7. Ostatní",t7:"Německé právo. Soud: Musterstadt." },
  sk: { title: "Podmienky", back: "← Späť", p1:"1. Rozsah",t1:"Tieto podmienky platia medzi PraxisOnline a používateľmi.", p2:"2. Zmluva",t2:"SaaS pre online rezervácie pre ordinácie.", p3:"3. Ceny",t3:"39€/79€/149€ mesačne. Platba Stripe.", p4:"4. Zrušenie",t4:"Kedykoľvek. Účinnosť na konci obdobia.", p5:"5. Zodpovednosť",t5:"Len úmysel a hrubá nedbalosť.", p6:"6. Súkromie",t6:"GDPR.", p7:"7. Ostatné",t7:"Nemecké právo. Súd: Musterstadt." },
  sl: { title: "Pogoji", back: "← Nazaj", p1:"1. Področje",t1:"Ti pogoji veljajo med PraxisOnline in uporabniki.", p2:"2. Pogodba",t2:"SaaS za spletne rezervacije za ordinacije.", p3:"3. Cene",t3:"39€/79€/149€ mesečno. Plačilo Stripe.", p4:"4. Odpoved",t4:"Kadarkoli. Učinek ob koncu obdobja.", p5:"5. Odgovornost",t5:"Samo naklep in huda malomarnost.", p6:"6. Zasebnost",t6:"Skladno z GDPR.", p7:"7. Drugo",t7:"Nemško pravo. Sodišče: Musterstadt." },
  sv: { title: "Villkor", back: "← Tillbaka", p1:"1. Omfattning",t1:"Dessa villkor gäller mellan PraxisOnline och användare.", p2:"2. Avtal",t2:"SaaS för onlinebokning för mottagningar.", p3:"3. Priser",t3:"39€/79€/149€ per månad. Betalning via Stripe.", p4:"4. Uppsägning",t4:"När som helst. Slutet av perioden.", p5:"5. Ansvar",t5:"Endast uppsåt och grov vårdslöshet.", p6:"6. Integritet",t6:"GDPR.", p7:"7. Övrigt",t7:"Tysk lag. Domstol: Musterstadt." },
  no: { title: "Vilkår", back: "← Tilbake", p1:"1. Omfang",t1:"Disse vilkårene gjelder mellom PraxisOnline og brukere.", p2:"2. Avtale",t2:"SaaS for online booking for praksiser.", p3:"3. Priser",t3:"39€/79€/149€ per måned. Betaling via Stripe.", p4:"4. Oppsigelse",t4:"Når som helst. Slutten av perioden.", p5:"5. Ansvar",t5:"Kun forsett og grov uaktsomhet.", p6:"6. Personvern",t6:"GDPR.", p7:"7. Annet",t7:"Tysk rett. Verneting: Musterstadt." },
  da: { title: "Vilkår", back: "← Tilbage", p1:"1. Omfang",t1:"Disse vilkår gælder mellem PraxisOnline og brugere.", p2:"2. Aftale",t2:"SaaS til online booking for praksisser.", p3:"3. Priser",t3:"39€/79€/149€ per måned. Betaling via Stripe.", p4:"4. Opsigelse",t4:"Til enhver tid. Udgangen af perioden.", p5:"5. Ansvar",t5:"Kun forsæt og grov uagtsomhed.", p6:"6. Privatliv",t6:"GDPR.", p7:"7. Diverse",t7:"Tysk ret. Værneting: Musterstadt." },
}

export default function AGB() {
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
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4 sm:p-8 max-w-3xl mx-auto">
      <div className="bg-white border border-blue-200 shadow-sm rounded-xl p-6 sm:p-10">
        <h1 className="text-2xl sm:text-4xl font-bold mb-6 sm:mb-8 text-gray-900">{t.title}</h1>
        <div className="space-y-4 text-sm sm:text-lg text-gray-700">
          {[1,2,3,4,5,6,7].map(i => (
            <div key={i}><h2 className="text-base sm:text-xl font-semibold text-gray-900 mb-1">{t["p"+i]}</h2><p>{t["t"+i]}</p></div>
          ))}
        </div>
        <div className="mt-6 pt-4 border-t border-blue-100 text-xs text-gray-400">
          <p>EU-Online-Streitbeilegung: <a href="https://ec.europa.eu/consumers/odr" target="_blank" className="underline">https://ec.europa.eu/consumers/odr</a></p>
        </div>
      </div>
      <div className="mt-6 text-center"><Link href="/" className="text-[#3B82F6] hover:text-blue-600 underline text-base sm:text-lg">{t.back}</Link></div>
    </main>
  )
}
