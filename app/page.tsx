"use client"

import Link from "next/link"

export default function Home() {
  const handleCheckout = async (priceId: string) => {
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } catch (error) {
      alert("Fehler. Bitte versuchen Sie es später erneut.")
    }
  }

  const prices = {
    basic: "price_1TateXJXpW5OGkcsndsuyoWK",
    pro: "price_1TatfYJXpW5OGkcsIehIvN4X",
    business: "price_1TatgkJXpW5OGkcsPH3uNeWV",
  }

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="text-center py-20 px-6">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">Automatisieren Sie Ihre Praxis</h1>
        <p className="text-xl md:text-2xl text-gray-300 mb-4">DSGVO-sicher & weltweit nutzbar</p>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-10">Termin-Erinnerungen, Bewertungsmanagement und E-Mail-Automatisierung – alles in einer Software.</p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/registrieren" className="bg-white text-black text-xl font-semibold px-10 py-5 rounded-lg hover:bg-gray-200 transition">Kostenlos starten</Link>
          <Link href="/bewertung" className="bg-gray-700 text-white text-xl font-semibold px-10 py-5 rounded-lg hover:bg-gray-600 transition">Bewertung testen</Link>
          <Link href="/termin" className="bg-gray-700 text-white text-xl font-semibold px-10 py-5 rounded-lg hover:bg-gray-600 transition">Termin testen</Link>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
        <div className="bg-gray-900 border border-gray-700 p-8 rounded-xl">
          <h2 className="text-2xl font-semibold mb-4">⏰ Terminausfälle reduzieren</h2>
          <p className="text-gray-400 text-lg">Automatische Erinnerungen per E-Mail. Ihre Kunden verpassen keine Termine mehr.</p>
        </div>
        <div className="bg-gray-900 border border-gray-700 p-8 rounded-xl">
          <h2 className="text-2xl font-semibold mb-4">⭐ Mehr Bewertungen</h2>
          <p className="text-gray-400 text-lg">Positive Bewertungen automatisch zu Google – Kritik landet direkt bei Ihnen.</p>
        </div>
        <div className="bg-gray-900 border border-gray-700 p-8 rounded-xl">
          <h2 className="text-2xl font-semibold mb-4">📧 E-Mail-Automatisierung</h2>
          <p className="text-gray-400 text-lg">Vorgefertigte Vorlagen, automatischer Versand. Sparen Sie Stunden pro Woche.</p>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-6 text-center">
        <h2 className="text-3xl font-bold mb-12">Preise</h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-gray-900 border border-gray-700 p-8 rounded-xl">
            <h3 className="text-2xl font-semibold mb-2">Basic</h3>
            <p className="text-4xl font-bold mb-6">29€<span className="text-lg text-gray-400">/Monat</span></p>
            <ul className="text-left text-gray-400 space-y-2 mb-8 text-lg"><li>✓ Termin-Erinnerungen</li><li>✓ E-Mail-Vorlagen</li><li>✓ Bis 100 Kunden</li></ul>
            <button onClick={() => handleCheckout(prices.basic)} className="block w-full bg-white text-black font-semibold py-3 rounded-lg hover:bg-gray-200 transition text-center">Starten</button>
          </div>
          <div className="bg-white text-black p-8 rounded-xl border-2 border-white">
            <h3 className="text-2xl font-semibold mb-2">Pro</h3>
            <p className="text-4xl font-bold mb-6">79€<span className="text-lg text-gray-600">/Monat</span></p>
            <ul className="text-left text-gray-700 space-y-2 mb-8 text-lg"><li>✓ Alles aus Basic</li><li>✓ Bewertungssteuerung</li><li>✓ Bis 500 Kunden</li></ul>
            <button onClick={() => handleCheckout(prices.pro)} className="block w-full bg-black text-white font-semibold py-3 rounded-lg hover:bg-gray-800 transition text-center">Starten</button>
          </div>
          <div className="bg-gray-900 border border-gray-700 p-8 rounded-xl">
            <h3 className="text-2xl font-semibold mb-2">Business</h3>
            <p className="text-4xl font-bold mb-6">199€<span className="text-lg text-gray-400">/Monat</span></p>
            <ul className="text-left text-gray-400 space-y-2 mb-8 text-lg"><li>✓ Alles aus Pro</li><li>✓ Kundenportal</li><li>✓ Unbegrenzt Kunden</li><li>✓ Persönlicher Support</li></ul>
            <button onClick={() => handleCheckout(prices.business)} className="block w-full bg-white text-black font-semibold py-3 rounded-lg hover:bg-gray-200 transition text-center">Starten</button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center text-gray-500 text-lg py-8 border-t border-gray-800">
        <Link href="/datenschutz" className="underline mr-4">Datenschutz</Link>
        <Link href="/impressum" className="underline mr-4">Impressum</Link>
        <Link href="/admin" className="underline">Admin</Link>
      </footer>
    </main>
  )
}
