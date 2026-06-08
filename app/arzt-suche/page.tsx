"use client"
import { useState } from "react"
import Link from "next/link"
import GoogleMap from "../components/GoogleMap"

const doctors = [
  { id: 1, name: "Hausarztpraxis Dr. Schmidt", specialty: "Hausarzt", address: "Hauptstraße 15, 10115 Berlin", city: "Berlin", zip: "10115" },
  { id: 2, name: "Zahnarztpraxis Dr. Weber", specialty: "Zahnarzt", address: "Marienplatz 8, 80331 München", city: "München", zip: "80331" },
  { id: 3, name: "Gemeinschaftspraxis Müller", specialty: "Allgemeinmedizin", address: "Alsterufer 22, 20354 Hamburg", city: "Hamburg", zip: "20354" },
  { id: 4, name: "Kinderarztpraxis Dr. Becker", specialty: "Kinderarzt", address: "Domstraße 10, 50667 Köln", city: "Köln", zip: "50667" },
  { id: 5, name: "Orthopädie Zentrum Berlin", specialty: "Orthopäde", address: "Potsdamer Platz 1, 10785 Berlin", city: "Berlin", zip: "10785" },
]

export default function ArztSuche() {
  const [searchTerm, setSearchTerm] = useState("")
  const [location, setLocation] = useState("")
  const [results, setResults] = useState<any[]>([])
  const [hasSearched, setHasSearched] = useState(false)
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null)

  const handleSearch = () => {
    const filtered = doctors.filter(doctor => {
      const matchesSearch = searchTerm === "" ||
        doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesLocation = location === "" ||
        doctor.city.toLowerCase().includes(location.toLowerCase()) ||
        doctor.zip.includes(location)
      
      return matchesSearch && matchesLocation
    })
    setResults(filtered)
    setHasSearched(true)
    setSelectedDoctor(null)
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 py-4 px-6">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-[#1E40AF]">Praxis<span className="text-[#3B82F6]">Online24</span></Link>
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">← Zurück</Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">Arzt- und Praxissuche</h1>
        
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name, Fachgebiet, Einrichtung
              </label>
              <input
                type="text"
                placeholder="z.B. Hausarzt, Zahnarzt, Dr. Schmidt..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E40AF] focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stadt oder Postleitzahl
              </label>
              <input
                type="text"
                placeholder="z.B. Berlin oder 10115"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E40AF] focus:border-transparent"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          </div>

          <button
            onClick={handleSearch}
            className="w-full bg-[#1E40AF] text-white py-3 rounded-lg font-semibold hover:bg-blue-800 transition"
          >
            🔍 Arzt oder Praxis suchen
          </button>

          {hasSearched && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {results.length} Ärzte gefunden
              </h3>
              
              {results.length > 0 ? (
                <div className="space-y-4">
                  {results.map((doctor) => (
                    <div key={doctor.id} className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition">
                      <div 
                        className="p-4 cursor-pointer hover:bg-gray-50"
                        onClick={() => setSelectedDoctor(selectedDoctor?.id === doctor.id ? null : doctor)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold text-gray-900">{doctor.name}</h4>
                            <p className="text-sm text-gray-600">{doctor.specialty}</p>
                            <p className="text-sm text-gray-500 mt-1">{doctor.address}</p>
                          </div>
                          <Link
                            href={`/termin-buchen?doctor=${doctor.id}`}
                            className="bg-[#1E40AF] text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-800 transition"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Termin buchen
                          </Link>
                        </div>
                      </div>
                      
                      {selectedDoctor?.id === doctor.id && (
                        <div className="border-t border-gray-100 p-4 bg-gray-50">
                          <GoogleMap address={doctor.address} name={doctor.name} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-xl">
                  <p className="text-gray-500">Keine Ärzte gefunden. Versuchen Sie andere Suchbegriffe.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
