import Link from "next/link"
export default function Datenschutz() {
  return (<main className="min-h-screen p-8 max-w-3xl mx-auto"><h1 className="text-4xl font-bold mb-8">Datenschutzerklärung</h1><section className="space-y-6 text-lg text-gray-300"><div><h2 className="text-2xl font-semibold text-white mb-3">1. Verantwortlicher</h2><p>AutoOffice Pro, Max Mustermann, info@autooffice-pro.de</p></div><div><h2 className="text-2xl font-semibold text-white mb-3">2. Datenerfassung</h2><p>Name, E-Mail, Abo-Status. Zahlungen über Stripe.</p></div><div><h2 className="text-2xl font-semibold text-white mb-3">3. Ihre Rechte</h2><p>Auskunft, Berichtigung, Löschung.</p></div></section><div className="mt-10"><Link href="/" className="text-white underline text-lg">← Zurück</Link></div></main>)
}
