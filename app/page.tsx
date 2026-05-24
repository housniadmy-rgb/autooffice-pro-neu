import Link from "next/link"

export default function Home() {
  return (
    <main className="min-h-screen">
      <section className="text-center py-20 px-6">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">Automatisieren Sie Ihre Praxis</h1>
        <p className="text-xl md:text-2xl text-gray-300 mb-4">DSGVO-sicher & weltweit nutzbar</p>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-10">Termin-Erinnerungen, automatische E-Mails, Bewertungsmanagement und Kundenportal.</p>
        <Link href="/registrieren" className="inline-block bg-white text-black text-xl font-semibold px-10 py-5 rounded-lg hover:bg-gray-200 transition">Kostenlos starten</Link>
      </section>
      <section className="py-20 px-6 max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
        <div className="bg-gray-900 border border-gray-700 p-8 rounded-xl"><h2 className="text-2xl font-semibold mb-4">⏰ Terminausfälle reduzieren</h2><p className="text-gray-400 text-lg">Automatische Erinnerungen per E-Mail und SMS.</p></div>
        <div className="bg-gray-900 border border-gray-700 p-8 rounded-xl"><h2 className="text-2xl font-semibold mb-4">📧 E-Mail-Chaos beenden</h2><p className="text-gray-400 text-lg">Vorgefertigte Vorlagen, automatischer Versand.</p></div>
        <div className="bg-gray-900 border border-gray-700 p-8 rounded-xl"><h2 className="text-2xl font-semibold mb-4">⭐ Mehr Bewertungen</h2><p className="text-gray-400 text-lg">Nach jedem Termin automatisch einen Bewertungslink senden.</p></div>
      </section>
      <section className="py-20 px-6 text-center"><h2 className="text-3xl font-bold mb-12">Preise</h2><div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        <div className="bg-gray-900 border border-gray-700 p-8 rounded-xl"><h3 className="text-2xl font-semibold mb-2">Basic</h3><p className="text-4xl font-bold mb-6">29€<span className="text-lg text-gray-400">/Monat</span></p><ul className="text-left text-gray-400 space-y-2 mb-8 text-lg"><li>✓ Termin-Erinnerungen</li><li>✓ E-Mail-Vorlagen</li><li>✓ Bis 100 Kunden</li></ul><Link href="/registrieren" className="block bg-white text-black font-semibold py-3 rounded-lg hover:bg-gray-200 transition text-center">Starten</Link></div>
        <div className="bg-white text-black p-8 rounded-xl border-2 border-white"><h3 className="text-2xl font-semibold mb-2">Pro</h3><p className="text-4xl font-bold mb-6">79€<span className="text-lg text-gray-600">/Monat</span></p><ul className="text-left text-gray-700 space-y-2 mb-8 text-lg"><li>✓ Alles aus Basic</li><li>✓ SMS-Erinnerungen</li><li>✓ Bewertungslinks</li><li>✓ Bis 500 Kunden</li></ul><Link href="/registrieren" className="block bg-black text-white font-semibold py-3 rounded-lg hover:bg-gray-800 transition text-center">Starten</Link></div>
        <div className="bg-gray-900 border border-gray-700 p-8 rounded-xl"><h3 className="text-2xl font-semibold mb-2">Business</h3><p className="text-4xl font-bold mb-6">199€<span className="text-lg text-gray-400">/Monat</span></p><ul className="text-left text-gray-400 space-y-2 mb-8 text-lg"><li>✓ Alles aus Pro</li><li>✓ Kundenportal</li><li>✓ Unbegrenzt Kunden</li><li>✓ Persönlicher Support</li></ul><Link href="/registrieren" className="block bg-white text-black font-semibold py-3 rounded-lg hover:bg-gray-200 transition text-center">Starten</Link></div>
      </div></section>
    </main>
  )
}
