"use client"
import { useState, useEffect } from "react"
import Link from "next/link"

const texts: Record<string, any> = {
  de: { title: "🏥 Praxis finden", subtitle: "Weltweit – in 15 Sprachen", search: "Name, Fachgebiet oder Stadt...", noResult: "Keine Praxis gefunden.", back: "← Zurück" },
  en: { title: "🏥 Find Practice", subtitle: "Worldwide – in 15 languages", search: "Name, specialty or city...", noResult: "No practice found.", back: "← Back" },
  fr: { title: "🏥 Trouver un cabinet", subtitle: "Dans le monde entier – en 15 langues", search: "Nom, spécialité ou ville...", noResult: "Aucun cabinet trouvé.", back: "← Retour" },
  es: { title: "🏥 Buscar consulta", subtitle: "En todo el mundo – en 15 idiomas", search: "Nombre, especialidad o ciudad...", noResult: "No se encontró consulta.", back: "← Volver" },
  it: { title: "🏥 Trova studio", subtitle: "In tutto il mondo – in 15 lingue", search: "Nome, specialità o città...", noResult: "Nessuno studio trovato.", back: "← Indietro" },
  pt: { title: "🏥 Encontrar consultório", subtitle: "No mundo todo – em 15 idiomas", search: "Nome, especialidade ou cidade...", noResult: "Nenhum consultório encontrado.", back: "← Voltar" },
  nl: { title: "🏥 Praktijk vinden", subtitle: "Wereldwijd – in 15 talen", search: "Naam, specialisme of stad...", noResult: "Geen praktijk gevonden.", back: "← Terug" },
  pl: { title: "🏥 Znajdź gabinet", subtitle: "Na całym świecie – w 15 językach", search: "Nazwa, specjalizacja lub miasto...", noResult: "Nie znaleziono gabinetu.", back: "← Wróć" },
  tr: { title: "🏥 Muayenehane Bul", subtitle: "Dünya çapında – 15 dilde", search: "İsim, uzmanlık veya şehir...", noResult: "Muayenehane bulunamadı.", back: "← Geri" },
  ja: { title: "🏥 医院を探す", subtitle: "世界中 – 15言語対応", search: "名前、専門、または都市...", noResult: "医院が見つかりません。", back: "← 戻る" },
  zh: { title: "🏥 找诊所", subtitle: "全球 – 15种语言", search: "名称、专科或城市...", noResult: "未找到诊所。", back: "← 返回" },
    cs: { title: "🏥 Najít ordinaci", subtitle: "Po celém světě – v 17 jazycích", search: "Jméno, specializace nebo město...", noResult: "Žádná ordinace nenalezena.", back: "← Zpět" },
  sk: { title: "🏥 Nájsť ordináciu", subtitle: "Po celom svete – v 17 jazykoch", search: "Meno, špecializácia alebo mesto...", noResult: "Žiadna ordinácia nenájdená.", back: "← Späť" },
  sl: { title: "🏥 Najdi ordinacijo", subtitle: "Po vsem svetu – v 17 jezikih", search: "Ime, specializacija ali mesto...", noResult: "Ni najdene ordinacije.", back: "← Nazaj" },
  sv: { title: "🏥 Hitta mottagning", subtitle: "Över hela världen – på 15 språk", search: "Namn, specialitet eller stad...", noResult: "Ingen mottagning hittades.", back: "← Tillbaka" },
  no: { title: "🏥 Finn klinikk", subtitle: "Over hele verden – på 15 språk", search: "Navn, spesialitet eller by...", noResult: "Ingen klinikk funnet.", back: "← Tilbake" },
  da: { title: "🏥 Find klinik", subtitle: "Over hele verden – på 15 sprog", search: "Navn, speciale eller by...", noResult: "Ingen klinik fundet.", back: "← Tilbage" },
}

const PRAXEN = [
  { id: "dr-mueller-berlin", name: "Dr. Müller", fach: "Zahnarzt", stadt: "Berlin", land: "Deutschland", img: "🦷" },
  { id: "dr-dupont-paris", name: "Dr. Dupont", fach: "Dentiste", stadt: "Paris", land: "France", img: "🦷" },
  { id: "dr-garcia-madrid", name: "Dr. García", fach: "Dentista", stadt: "Madrid", land: "España", img: "🦷" },
  { id: "dr-rossi-roma", name: "Dr. Rossi", fach: "Dentista", stadt: "Roma", land: "Italia", img: "🦷" },
  { id: "dr-smith-london", name: "Dr. Smith", fach: "Dentist", stadt: "London", land: "United Kingdom", img: "🦷" },
  { id: "dr-silva-lisboa", name: "Dr. Silva", fach: "Dentista", stadt: "Lisboa", land: "Portugal", img: "🦷" },
  { id: "dr-vandam-amsterdam", name: "Dr. van Dam", fach: "Tandarts", stadt: "Amsterdam", land: "Nederland", img: "🦷" },
  { id: "dr-kowalski-warschau", name: "Dr. Kowalski", fach: "Dentysta", stadt: "Warszawa", land: "Polska", img: "🦷" },
  { id: "dr-yilmaz-istanbul", name: "Dr. Yılmaz", fach: "Diş Hekimi", stadt: "İstanbul", land: "Türkiye", img: "🦷" },
  { id: "dr-tanaka-tokio", name: "田中先生", fach: "歯科医", stadt: "東京", land: "日本", img: "🦷" },
  { id: "dr-wang-peking", name: "王医生", fach: "牙科医生", stadt: "北京", land: "中国", img: "🦷" },
]

export default function Praxen() {
  const [suche, setSuche] = useState("")
  const [lang, setLang] = useState("de")

  useEffect(() => {
   const urlParams = new URLSearchParams(window.location.search); const urlLang = urlParams.get("lang"); const stored = urlLang || localStorage.getItem("lang")
    if (stored && texts[stored]) { setLang(stored); return }
    const browser = (navigator.language || "").split("-")[0]
    if (texts[browser]) { setLang(browser); return }
    setLang("en")
  }, [])

  const t = texts[lang] || texts.en

  const filtered = PRAXEN.filter(p => 
    p.name.toLowerCase().includes(suche.toLowerCase()) ||
    p.fach.toLowerCase().includes(suche.toLowerCase()) ||
    p.stadt.toLowerCase().includes(suche.toLowerCase()) ||
    p.land.toLowerCase().includes(suche.toLowerCase())
  )

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4 sm:p-8">
      <div className="max-w-full sm:max-w-4xl mx-auto">
        <h1 className="text-xl sm:text-2xl sm:text-3xl sm:text-4xl font-bold mb-2 text-center text-gray-900">{t.title}</h1>
        <p className="text-lg text-gray-500 text-center mb-8">{t.subtitle}</p>
        
        <div className="mb-8">
          <input type="text" value={suche} onChange={(e) => setSuche(e.target.value)} placeholder={t.search} className="w-full p-5 rounded-lg sm:rounded-xl border-2 border-blue-200 text-lg focus:border-[#3B82F6] outline-none" />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {filtered.map((p) => (
            <Link key={p.id} href={`/praxis/${p.id}`} className="bg-white border border-blue-100 p-6 rounded-lg sm:rounded-xl shadow-sm hover:shadow-md hover:border-[#3B82F6] transition flex items-center gap-4">
              <span className="text-xl sm:text-2xl sm:text-3xl sm:text-4xl">{p.img}</span>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{p.name}</h2>
                <p className="text-gray-500">{p.fach} • {p.stadt}</p>
                <p className="text-sm text-gray-400">{p.land}</p>
              </div>
            </Link>
          ))}
        </div>

        {filtered.length === 0 && <p className="text-center text-gray-500 text-xl mt-10">{t.noResult}</p>}

        <div className="mt-10 text-center"><Link href="/" className="text-[#3B82F6] hover:text-blue-600 underline text-lg">{t.back}</Link></div>
      </div>
    </main>
  )
}
