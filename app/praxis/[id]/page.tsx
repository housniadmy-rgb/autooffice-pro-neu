"use client"

import { useParams } from "next/navigation"
import Link from "next/link"

const PRAXEN: Record<string, any> = {
  "dr-mueller-berlin": { name: "Dr. Müller", fach: "Zahnarzt", stadt: "Berlin", land: "Deutschland", adresse: "Friedrichstraße 100, 10117 Berlin", telefon: "+49 30 123456", email: "mueller@praxis.de", img: "🦷", beschreibung: "Moderne Zahnarztpraxis mit digitaler Terminbuchung.", maps: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2427.4!2d13.388!3d52.517!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNTLCsDMxJzAxLjIiTiAxM8KwMjMnMTcuOSJF!5e0!3m2!1sde!2sde!4v1" },
  "dr-dupont-paris": { name: "Dr. Dupont", fach: "Dentiste", stadt: "Paris", land: "France", adresse: "15 Rue de Rivoli, 75001 Paris", telefon: "+33 1 234567", email: "dupont@cabinet.fr", img: "🦷", beschreibung: "Cabinet dentaire moderne au cœur de Paris.", maps: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2624.9!2d2.333!3d48.861!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDjCsDUxJzM5LjYiTiAywrAxOSc1OC44IkU!5e0!3m2!1sfr!2sfr!4v1" },
  "dr-garcia-madrid": { name: "Dr. García", fach: "Dentista", stadt: "Madrid", land: "España", adresse: "Gran Vía 50, 28013 Madrid", telefon: "+34 91 234567", email: "garcia@clinica.es", img: "🦷", beschreibung: "Clínica dental moderna en el centro de Madrid.", maps: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3037.5!2d-3.703!3d40.420!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDDCsDI1JzEyLjAiTiAzwrA0MicxMC44Ilc!5e0!3m2!1ses!2ses!4v1" },
  "dr-smith-london": { name: "Dr. Smith", fach: "Dentist", stadt: "London", land: "United Kingdom", adresse: "10 Downing Street, London SW1A 2AA", telefon: "+44 20 123456", email: "smith@dental.uk", img: "🦷", beschreibung: "Modern dental practice in central London.", maps: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2483.5!2d-0.127!3d51.503!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNTHCsDMwJzEwLjgiTiAwwrAwNyczNy4yIlc!5e0!3m2!1sen!2suk!4v1" },
}

export default function PraxisDetail() {
  const params = useParams()
  const id = params.id as string
  const praxis = PRAXEN[id]

  if (!praxis) return (
    <main className="min-h-screen p-8 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Praxis nicht gefunden</h1>
        <Link href="/praxen" className="text-[#3B82F6] underline text-lg">← Zurück zur Suche</Link>
      </div>
    </main>
  )

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white border border-blue-100 rounded-xl shadow-lg p-10 mb-8">
          <div className="text-center mb-8">
            <span className="text-7xl">{praxis.img}</span>
            <h1 className="text-4xl font-bold mt-4 text-gray-900">{praxis.name}</h1>
            <p className="text-xl text-gray-500">{praxis.fach}</p>
            <p className="text-lg text-gray-400">{praxis.stadt}, {praxis.land}</p>
          </div>

          <div className="space-y-4 text-lg text-gray-700 mb-8">
            <p>📍 {praxis.adresse}</p>
            <p>📞 {praxis.telefon}</p>
            <p>✉️ {praxis.email}</p>
            <p className="text-gray-500 mt-4">{praxis.beschreibung}</p>
          </div>

          <div className="flex gap-3 mb-8">
            <Link href="/termin-buchen" className="flex-1 bg-[#1E40AF] text-white text-xl font-semibold py-4 rounded-lg hover:bg-green-600 transition text-center">📅 Termin buchen</Link>
            <Link href="/bewertung" className="flex-1 bg-[#3B82F6] text-white text-xl font-semibold py-4 rounded-lg hover:bg-blue-600 transition text-center">⭐ Bewerten</Link>
          </div>

          {/* Google Maps */}
          <div className="rounded-xl overflow-hidden border border-blue-100">
            <iframe 
              src={praxis.maps}
              width="100%" 
              height="350" 
              style={{ border: 0 }} 
              allowFullScreen 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              title={`Karte: ${praxis.name}`}
            />
          </div>
        </div>

        <div className="text-center">
          <Link href="/praxen" className="text-[#3B82F6] hover:text-blue-600 underline text-lg">← Zurück zur Suche</Link>
        </div>
      </div>
    </main>
  )
}
