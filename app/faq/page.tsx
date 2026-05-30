"use client"
import { useState, useEffect } from "react"
import Link from "next/link"

const texts: Record<string, any> = {
  de: { title: "❓ Häufige Fragen (FAQ)", back: "← Zurück", q1: "Ist PraxisOnline sicher?", a1: "Ja! DSGVO-konform, alle Daten verschlüsselt auf EU-Servern.", q2: "Wie einrichten?", a2: "5 Min: Registrieren, Paket wählen, Link teilen. Fertig!", q3: "Kündigungsfrist?", a3: "Jederzeit kündbar, keine Mindestlaufzeit.", q4: "Paket wechseln?", a4: "Jederzeit möglich. Änderung ab nächster Abrechnung.", q5: "Patientendaten sicher?", a5: "Ja, nur Name/E-Mail, EU-Server, kein Datenverkauf." },
  en: { title: "❓ FAQ", back: "← Back", q1: "Is PraxisOnline safe?", a1: "Yes! GDPR-compliant, encrypted, EU servers.", q2: "How to set up?", a2: "5 min: Register, choose plan, share link. Done!", q3: "Cancellation?", a3: "Cancel anytime, no minimum term.", q4: "Change plan?", a4: "Anytime. Change takes effect next billing cycle.", q5: "Patient data safe?", a5: "Yes, name/email only, EU servers, no data sales." },
  fr: { title: "❓ FAQ", back: "← Retour", q1: "Sûr ?", a1: "Oui ! Conforme RGPD, crypté, serveurs UE.", q2: "Configuration ?", a2: "5 min : S'inscrire, choisir, partager. Fini !", q3: "Résiliation ?", a3: "À tout moment, sans durée minimale.", q4: "Changer de forfait ?", a4: "À tout moment, effet à la prochaine facturation.", q5: "Données sécurisées ?", a5: "Oui, nom/email, serveurs UE, pas de vente." },
  es: { title: "❓ FAQ", back: "← Volver", q1: "¿Seguro?", a1: "¡Sí! Cumple RGPD, cifrado, servidores UE.", q2: "¿Configuración?", a2: "5 min: Registrarse, elegir plan, compartir. ¡Listo!", q3: "¿Cancelación?", a3: "En cualquier momento, sin mínimo.", q4: "¿Cambiar plan?", a4: "Sí, en cualquier momento. Efecto en próxima factura.", q5: "¿Datos seguros?", a5: "Sí, nombre/email, servidores UE, sin venta." },
  it: { title: "❓ FAQ", back: "← Indietro", q1: "Sicuro?", a1: "Sì! Conforme GDPR, crittografato, server UE.", q2: "Configurazione?", a2: "5 min: Registrati, scegli piano, condividi. Fatto!", q3: "Recesso?", a3: "In qualsiasi momento, senza minimo.", q4: "Cambiare piano?", a4: "Sì, in qualsiasi momento. Effetto alla prossima fatturazione.", q5: "Dati sicuri?", a5: "Sì, nome/email, server UE, nessuna vendita." },
  pt: { title: "❓ FAQ", back: "← Voltar", q1: "Seguro?", a1: "Sim! Conforme RGPD, criptografado, servidores UE.", q2: "Configuração?", a2: "5 min: Cadastrar, escolher plano, compartilhar. Pronto!", q3: "Cancelamento?", a3: "A qualquer momento, sem mínimo.", q4: "Mudar plano?", a4: "Sim, a qualquer momento. Efeito na próxima cobrança.", q5: "Dados seguros?", a5: "Sim, nome/email, servidores UE, sem venda." },
  nl: { title: "❓ FAQ", back: "← Terug", q1: "Veilig?", a1: "Ja! AVG-conform, versleuteld, EU-servers.", q2: "Instellen?", a2: "5 min: Registreren, plan kiezen, link delen. Klaar!", q3: "Opzeggen?", a3: "Altijd, geen minimumtermijn.", q4: "Plan wijzigen?", a4: "Altijd, effect bij volgende facturering.", q5: "Patiëntgegevens veilig?", a5: "Ja, naam/email, EU-servers, geen verkoop." },
  pl: { title: "❓ FAQ", back: "← Wróć", q1: "Bezpieczne?", a1: "Tak! Zgodne z RODO, szyfrowane, serwery UE.", q2: "Konfiguracja?", a2: "5 min: Rejestracja, wybór planu, udostępnienie. Gotowe!", q3: "Rezygnacja?", a3: "W każdej chwili, bez minimum.", q4: "Zmiana planu?", a4: "Tak, w każdej chwili. Efekt przy następnym rozliczeniu.", q5: "Dane bezpieczne?", a5: "Tak, imię/email, serwery UE, bez sprzedaży." },
  tr: { title: "❓ SSS", back: "← Geri", q1: "Güvenli mi?", a1: "Evet! GDPR uyumlu, şifreli, AB sunucuları.", q2: "Kurulum?", a2: "5 dk: Kayıt ol, plan seç, link paylaş. Bitti!", q3: "İptal?", a3: "Her zaman, minimum süre yok.", q4: "Plan değiştirme?", a4: "Her zaman, sonraki fatura döneminde geçerli.", q5: "Hasta verileri güvende mi?", a5: "Evet, sadece isim/e-posta, AB sunucuları, satış yok." },
  ja: { title: "❓ FAQ", back: "← 戻る", q1: "安全ですか？", a1: "はい！GDPR準拠、暗号化、EUサーバー。", q2: "設定方法は？", a2: "5分：登録、プラン選択、リンク共有。完了！", q3: "解約は？", a3: "いつでも可能、最低契約期間なし。", q4: "プラン変更は？", a4: "いつでも可能。次回請求から適用。", q5: "患者データは安全？", a5: "はい、名前/メールのみ、EUサーバー、販売なし。" },
  zh: { title: "❓ 常见问题", back: "← 返回", q1: "安全吗？", a1: "是的！符合GDPR，加密，欧盟服务器。", q2: "如何设置？", a2: "5分钟：注册，选择套餐，分享链接。完成！", q3: "取消？", a3: "随时取消，无最低期限。", q4: "更换套餐？", a4: "随时可以，下个计费周期生效。", q5: "患者数据安全？", a5: "是的，仅姓名/邮箱，欧盟服务器，不出售数据。" },
  cs: { title: "❓ FAQ", back: "← Zpět", q1: "Bezpečné?", a1: "Ano! GDPR, šifrované, EU servery.", q2: "Nastavení?", a2: "5 min: Registrace, výběr plánu, sdílení. Hotovo!", q3: "Zrušení?", a3: "Kdykoli, bez minimální doby.", q4: "Změna plánu?", a4: "Kdykoli, účinnost při dalším vyúčtování.", q5: "Data pacientů?", a5: "Ano, jméno/email, EU servery, žádný prodej." },
  sk: { title: "❓ FAQ", back: "← Späť", q1: "Bezpečné?", a1: "Áno! GDPR, šifrované, EU servery.", q2: "Nastavenie?", a2: "5 min: Registrácia, výber plánu, zdieľanie. Hotovo!", q3: "Zrušenie?", a3: "Kedykoľvek, bez minimálnej doby.", q4: "Zmena plánu?", a4: "Kedykoľvek, účinnosť pri ďalšom vyúčtovaní.", q5: "Dáta pacientov?", a5: "Áno, meno/email, EU servery, žiadny predaj." },
  sl: { title: "❓ FAQ", back: "← Nazaj", q1: "Varno?", a1: "Da! Skladno z GDPR, šifrirano, EU strežniki.", q2: "Nastavitev?", a2: "5 min: Registracija, izbira paketa, deljenje. Končano!", q3: "Odpoved?", a3: "Kadarkoli, brez minimalnega obdobja.", q4: "Sprememba paketa?", a4: "Kadarkoli, učinek ob naslednjem obračunu.", q5: "Podatki varni?", a5: "Da, ime/email, EU strežniki, brez prodaje." },
  sv: { title: "❓ FAQ", back: "← Tillbaka", q1: "Säkert?", a1: "Ja! GDPR, krypterat, EU-servrar.", q2: "Installation?", a2: "5 min: Registrera, välj plan, dela. Klart!", q3: "Uppsägning?", a3: "När som helst, ingen minimitid.", q4: "Byta plan?", a4: "När som helst, effekt vid nästa fakturering.", q5: "Patientdata säkra?", a5: "Ja, namn/email, EU-servrar, ingen försäljning." },
  no: { title: "❓ FAQ", back: "← Tilbake", q1: "Trygt?", a1: "Ja! GDPR, kryptert, EU-servere.", q2: "Oppsett?", a2: "5 min: Registrer, velg plan, del. Ferdig!", q3: "Oppsigelse?", a3: "Når som helst, ingen minimumstid.", q4: "Bytte plan?", a4: "Når som helst, effekt ved neste fakturering.", q5: "Pasientdata trygge?", a5: "Ja, navn/email, EU-servere, ingen salg." },
  da: { title: "❓ FAQ", back: "← Tilbage", q1: "Sikkert?", a1: "Ja! GDPR, krypteret, EU-servere.", q2: "Opsætning?", a2: "5 min: Registrer, vælg plan, del. Færdig!", q3: "Opsigelse?", a3: "Til enhver tid, ingen minimumsperiode.", q4: "Skift plan?", a4: "Til enhver tid, effekt ved næste fakturering.", q5: "Patientdata sikre?", a5: "Ja, navn/email, EU-servere, intet salg." },
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const [lang, setLang] = useState("de")
  useEffect(() => {
    const p = new URLSearchParams(window.location.search)
    const ul = p.get("setLang")
    const stored = ul || localStorage.getItem("lang")
    if (stored && texts[stored]) setLang(stored)
    else setLang("en")
  }, [])
  const t = texts[lang] || texts.en
  const faqs = [{ q: t.q1, a: t.a1 },{ q: t.q2, a: t.a2 },{ q: t.q3, a: t.a3 },{ q: t.q4, a: t.a4 },{ q: t.q5, a: t.a5 }]

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4 sm:p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl sm:text-4xl font-bold mb-6 sm:mb-8 text-gray-900 text-center">{t.title}</h1>
      <div className="space-y-3 sm:space-y-4">
        {faqs.map((faq, i) => (
          <div key={i} className="bg-white border border-blue-200 rounded-lg overflow-hidden">
            <button onClick={() => setOpenIndex(openIndex === i ? null : i)} className="w-full text-left p-4 sm:p-5 flex justify-between items-center hover:bg-blue-50 transition">
              <span className="text-base sm:text-lg font-semibold text-gray-900 pr-4">{faq.q}</span>
              <span className="text-xl flex-shrink-0">{openIndex === i ? "▲" : "▼"}</span>
            </button>
            {openIndex === i && <div className="px-4 sm:px-5 pb-4 sm:pb-5 text-sm sm:text-base text-gray-700 border-t border-blue-100 pt-3 sm:pt-4">{faq.a}</div>}
          </div>
        ))}
      </div>
      <div className="mt-8 sm:mt-10 text-center"><Link href="/" className="text-[#3B82F6] hover:text-blue-600 underline text-base sm:text-lg">{t.back}</Link></div>
    </main>
  )
}