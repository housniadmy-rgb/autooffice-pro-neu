import Link from "next/link"

export default function ImpressumPage() {
  return (
    <main className="min-h-screen bg-white py-8">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-2xl font-bold mb-6">Impressum</h1>
        
        <div className="space-y-4">
          <p><strong>Anbieter dieser Seite:</strong><br />PraxisOnline24</p>
          <p><strong>Inhaber:</strong><br />Housni Admy</p>
          <p><strong>Anschrift:</strong><br />
            Berlinstraße 37<br />
            55411 Bingen am Rhein<br />
            Deutschland
          </p>
          <p><strong>Kontakt:</strong><br />
            E-Mail: info@praxisonline24.com<br />
            Telefon: +49 (0) 6721 9875872
          </p>
          <p><strong>Umsatzsteuer-ID:</strong> (wird beantragt)</p>
          <p><strong>Urheberrechtshinweis:</strong><br />
            Alle Inhalte dieser Website (Texte, Bilder, Layout) unterliegen dem Schutz des Urheberrechts.
          </p>
          <p><strong>EU-Streitbeilegung:</strong><br />
            Plattform der EU-Kommission: <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer" className="text-[#1E40AF] underline">https://ec.europa.eu/consumers/odr/</a>
          </p>
          <p>Wir nehmen nicht an Streitbeilegungsverfahren vor Verbraucherschlichtungsstellen teil.</p>
          <p><strong>Haftung für Inhalte:</strong><br />
            Die Inhalte wurden mit größter Sorgfalt erstellt. Wir übernehmen keine Gewähr für Richtigkeit und Aktualität.
          </p>
          <p><strong>Haftung für Links:</strong><br />
            Für Inhalte verlinkter Seiten sind ausschließlich deren Betreiber verantwortlich.
          </p>
        </div>
        
        <Link href="/" className="inline-block mt-8 text-[#1E40AF] underline">← Zurück</Link>
      </div>
    </main>
  )
}
