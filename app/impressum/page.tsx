import Link from "next/link"
export default function Impressum() {
  return (<main className="min-h-screen p-8 max-w-3xl mx-auto"><h1 className="text-4xl font-bold mb-8">Impressum</h1><p className="text-lg text-gray-300 mb-2"><strong className="text-white">AutoOffice Pro</strong></p><p className="text-lg text-gray-300 mb-2">Max Mustermann</p><p className="text-lg text-gray-300 mb-2">Musterstraße 1, 12345 Musterstadt</p><p className="text-lg text-gray-300 mb-2">E-Mail: info@autooffice-pro.de</p><div className="mt-10"><Link href="/" className="text-white underline text-lg">← Zurück</Link></div></main>)
}
