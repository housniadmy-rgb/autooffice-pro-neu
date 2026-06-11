"use client"
import { useState, useEffect } from "react"
import Link from "next/link"

const texts: Record<string, any> = {
  de: {
    title: "Impressum",
    provider: "Anbieter dieser Seite:",
    company: "PraxisOnline24",
    owner: "Housni Admy",
    street: "Berlinstraße 37",
    city: "55411 Bingen am Rhein",
    country: "Deutschland",
    email: "E-Mail: info@praxisonline24.com",
    phone: "Telefon: +49 (0) 6721 9875872",
    vat: "Umsatzsteuer-ID: (wird beantragt)",
    copyright: "Urheberrechtshinweis:",
    copyrightText: "Alle Inhalte dieser Website (Texte, Bilder, Layout) unterliegen dem Schutz des Urheberrechts.",
    odr: "EU-Streitbeilegung:",
    odrText: "Plattform der EU-Kommission: https://ec.europa.eu/consumers/odr/",
    noParticipation: "Wir nehmen nicht an Streitbeilegungsverfahren vor Verbraucherschlichtungsstellen teil.",
    liability: "Haftung für Inhalte:",
    liabilityText: "Die Inhalte wurden mit größter Sorgfalt erstellt. Wir übernehmen keine Gewähr für Richtigkeit und Aktualität.",
    linkLiability: "Haftung für Links:",
    linkLiabilityText: "Für Inhalte verlinkter Seiten sind ausschließlich deren Betreiber verantwortlich.",
    back: "← Zurück",
  },
  en: {
    title: "Imprint",
    provider: "Provider of this website:",
    company: "PraxisOnline24",
    owner: "Housni Admy",
    street: "Berlinstraße 37",
    city: "55411 Bingen am Rhein",
    country: "Germany",
    email: "Email: info@praxisonline24.com",
    phone: "Phone: +49 (0) 6721 9875872",
    vat: "VAT ID: (pending)",
    copyright: "Copyright Notice:",
    copyrightText: "All content on this website (texts, images, layout) is protected by copyright.",
    odr: "EU Dispute Resolution:",
    odrText: "Platform of the EU Commission: https://ec.europa.eu/consumers/odr/",
    noParticipation: "We do not participate in dispute resolution proceedings before consumer arbitration boards.",
    liability: "Liability for Content:",
    liabilityText: "The content was created with the greatest care. We assume no liability for correctness and timeliness.",
    linkLiability: "Liability for Links:",
    linkLiabilityText: "The operators of linked pages are solely responsible for their content.",
    back: "← Back",
  },
  fr: {
    title: "Mentions légales",
    provider: "Fournisseur de ce site:",
    company: "PraxisOnline24",
    owner: "Housni Admy",
    street: "Berlinstraße 37",
    city: "55411 Bingen am Rhein",
    country: "Allemagne",
    email: "E-mail: info@praxisonline24.com",
    phone: "Tél: +49 (0) 6721 9875872",
    vat: "TVA: (en cours)",
    copyright: "Droits d'auteur:",
    copyrightText: "Tout le contenu de ce site est protégé par le droit d'auteur.",
    odr: "Règlement des litiges en ligne:",
    odrText: "Plateforme de la Commission européenne: https://ec.europa.eu/consumers/odr/",
    noParticipation: "Nous ne participons pas aux procédures de règlement des litiges devant les commissions d'arbitrage des consommateurs.",
    liability: "Responsabilité pour le contenu:",
    liabilityText: "Le contenu a été créé avec le plus grand soin. Nous n'assumons aucune responsabilité quant à l'exactitude et à l'actualité.",
    linkLiability: "Responsabilité pour les liens:",
    linkLiabilityText: "Les opérateurs des sites liés sont seuls responsables de leur contenu.",
    back: "← Retour",
  },
  es: {
    title: "Aviso legal",
    provider: "Proveedor de este sitio web:",
    company: "PraxisOnline24",
    owner: "Housni Admy",
    street: "Berlinstraße 37",
    city: "55411 Bingen am Rhein",
    country: "Alemania",
    email: "Correo electrónico: info@praxisonline24.com",
    phone: "Teléfono: +49 (0) 6721 9875872",
    vat: "IVA: (pendiente)",
    copyright: "Derechos de autor:",
    copyrightText: "Todo el contenido está protegido por derechos de autor.",
    odr: "Resolución de litigios en línea:",
    odrText: "Plataforma de la Comisión Europea: https://ec.europa.eu/consumers/odr/",
    noParticipation: "No participamos en procedimientos de resolución de disputas ante juntas de arbitraje de consumidores.",
    liability: "Responsabilidad por el contenido:",
    liabilityText: "El contenido fue creado con el mayor cuidado. No asumimos responsabilidad por la exactitud y actualidad.",
    linkLiability: "Responsabilidad por enlaces:",
    linkLiabilityText: "Los operadores de las páginas enlazadas son los únicos responsables de su contenido.",
    back: "← Volver",
  },
  it: {
    title: "Note legali",
    provider: "Fornitore di questo sito web:",
    company: "PraxisOnline24",
    owner: "Housni Admy",
    street: "Berlinstraße 37",
    city: "55411 Bingen am Rhein",
    country: "Germania",
    email: "Email: info@praxisonline24.com",
    phone: "Telefono: +49 (0) 6721 9875872",
    vat: "Partita IVA: (in sospeso)",
    copyright: "Diritti d'autore:",
    copyrightText: "Tutti i contenuti sono protetti da copyright.",
    odr: "Risoluzione delle controversie online:",
    odrText: "Piattaforma della Commissione europea: https://ec.europa.eu/consumers/odr/",
    noParticipation: "Non partecipiamo a procedure di risoluzione delle controversie davanti a commissioni arbitrali dei consumatori.",
    liability: "Responsabilità per i contenuti:",
    liabilityText: "I contenuti sono stati creati con la massima cura. Non assumiamo alcuna responsabilità per la correttezza e l'attualità.",
    linkLiability: "Responsabilità per i link:",
    linkLiabilityText: "I gestori delle pagine collegate sono gli unici responsabili del loro contenuto.",
    back: "← Indietro",
  },
  pt: {
    title: "Impresso",
    provider: "Fornecedor deste site:",
    company: "PraxisOnline24",
    owner: "Housni Admy",
    street: "Berlinstraße 37",
    city: "55411 Bingen am Rhein",
    country: "Alemanha",
    email: "E-mail: info@praxisonline24.com",
    phone: "Telefone: +49 (0) 6721 9875872",
    vat: "IVA: (pendente)",
    copyright: "Direitos autorais:",
    copyrightText: "Todo o conteúdo está protegido por direitos autorais.",
    odr: "Resolução de litígios online:",
    odrText: "Plataforma da Comissão Europeia: https://ec.europa.eu/consumers/odr/",
    noParticipation: "Não participamos de procedimentos de resolução de disputas perante conselhos de arbitragem do consumidor.",
    liability: "Responsabilidade pelo conteúdo:",
    liabilityText: "O conteúdo foi criado com o maior cuidado. Não assumimos qualquer responsabilidade pela exatidão e atualidade.",
    linkLiability: "Responsabilidade por links:",
    linkLiabilityText: "Os operadores das páginas vinculadas são os únicos responsáveis pelo seu conteúdo.",
    back: "← Voltar",
  },
  nl: {
    title: "Colofon",
    provider: "Aanbieder van deze website:",
    company: "PraxisOnline24",
    owner: "Housni Admy",
    street: "Berlinstraße 37",
    city: "55411 Bingen am Rhein",
    country: "Duitsland",
    email: "E-mail: info@praxisonline24.com",
    phone: "Telefoon: +49 (0) 6721 9875872",
    vat: "BTW-nummer: (in afwachting)",
    copyright: "Auteursrecht:",
    copyrightText: "Alle inhoud is auteursrechtelijk beschermd.",
    odr: "Online geschillenbeslechting:",
    odrText: "Platform van de Europese Commissie: https://ec.europa.eu/consumers/odr/",
    noParticipation: "We nemen niet deel aan geschillenbeslechtingsprocedures voor arbitragecommissies voor consumenten.",
    liability: "Aansprakelijkheid voor inhoud:",
    liabilityText: "De inhoud is met de grootste zorg samengesteld. Wij aanvaarden geen aansprakelijkheid voor de juistheid en actualiteit.",
    linkLiability: "Aansprakelijkheid voor links:",
    linkLiabilityText: "De exploitanten van gelinkte pagina's zijn als enige verantwoordelijk voor hun inhoud.",
    back: "← Terug",
  },
  pl: {
    title: "Impressum",
    provider: "Dostawca tej strony:",
    company: "PraxisOnline24",
    owner: "Housni Admy",
    street: "Berlinstraße 37",
    city: "55411 Bingen am Rhein",
    country: "Niemcy",
    email: "E-mail: info@praxisonline24.com",
    phone: "Telefon: +49 (0) 6721 9875872",
    vat: "NIP: (w trakcie)",
    copyright: "Prawa autorskie:",
    copyrightText: "Wszystkie treści są chronione prawami autorskimi.",
    odr: "Rozstrzyganie sporów online:",
    odrText: "Platforma Komisji Europejskiej: https://ec.europa.eu/consumers/odr/",
    noParticipation: "Nie uczestniczymy w procedurach rozstrzygania sporów przed komisjami arbitrażowymi ds. konsumentów.",
    liability: "Odpowiedzialność za treść:",
    liabilityText: "Treść została stworzona z największą starannością. Nie ponosimy odpowiedzialności za poprawność i aktualność.",
    linkLiability: "Odpowiedzialność za linki:",
    linkLiabilityText: "Operatorzy stron linkowanych są wyłącznie odpowiedzialni za ich treść.",
    back: "← Wróć",
  },
  tr: {
    title: "Künye",
    provider: "Bu web sitesinin sağlayıcısı:",
    company: "PraxisOnline24",
    owner: "Housni Admy",
    street: "Berlinstraße 37",
    city: "55411 Bingen am Rhein",
    country: "Almanya",
    email: "E-posta: info@praxisonline24.com",
    phone: "Telefon: +49 (0) 6721 9875872",
    vat: "KDV Numarası: (beklemede)",
    copyright: "Telif hakkı:",
    copyrightText: "Tüm içerik telif hakkı ile korunmaktadır.",
    odr: "Çevrimiçi anlaşmazlık çözümü:",
    odrText: "AB Komisyonu platformu: https://ec.europa.eu/consumers/odr/",
    noParticipation: "Tüketici hakem heyetleri önünde anlaşmazlık çözüm prosedürlerine katılmıyoruz.",
    liability: "İçerik sorumluluğu:",
    liabilityText: "İçerik azami özenle oluşturulmuştur. Doğruluk ve güncellik için sorumluluk kabul etmiyoruz.",
    linkLiability: "Bağlantı sorumluluğu:",
    linkLiabilityText: "Bağlantılı sayfaların operatörleri, içeriklerinden yalnızca kendileri sorumludur.",
    back: "← Geri",
  },
}

export default function ImpressumPage() {
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

  return (
    <main className="min-h-screen bg-white py-8">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-2xl font-bold mb-6">{t.title}</h1>
        
        <div className="space-y-4">
          <p><strong>{t.provider}</strong><br />{t.company}</p>
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
        
        <Link href="/" className="inline-block mt-8 text-[#1E40AF] underline">← {t.back}</Link>
      </div>
    </main>
  )
}