"use client"
import { useState } from "react"
import Link from "next/link"

export default function ArztSuche() {
  const [searchTerm, setSearchTerm] = useState("")
  const [location, setLocation] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSearch = () => {
    if (!searchTerm && !location) return
    
    // Google Maps Suche in neuem Tab öffnen
    let query = ""
    if (searchTerm && location) {
      query = `${searchTerm} ${location}`
    } else if (searchTerm) {
      query = searchTerm
    } else if (location) {
      query = `Arzt ${location}`
    }
    
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
    window.open(mapsUrl, "_blank")
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 py-4 px-6">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-[#1E40AF]">Praxis<span className="text-[#3B82F6]">Online24</span></Link>
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">← Zurück</Link>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-16">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">Arzt- und Praxissuche</h1>
        
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <p className="text-sm text-gray-500 text-center mb-6">
            Suchen Sie nach Ärzten, Zahnärzten oder Therapeuten in Ihrer Nähe
          </p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fachgebiet, Name oder Einrichtung
              </label>
              <input
                type="text"
                placeholder="z.B. Zahnarzt, Hausarzt, Dr. Schmidt..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E40AF] focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ort oder Postleitzahl
              </label>
              <input
                type="text"
                placeholder="z.B. Frankfurt, Berlin oder 10115"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E40AF] focus:border-transparent"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <button
              onClick={handleSearch}
              className="w-full bg-[#1E40AF] text-white py-3 rounded-lg font-semibold hover:bg-blue-800 transition mt-4"
            >
              🔍 Bei Google Maps suchen
            </button>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              💡 Sie werden zu Google Maps weitergeleitet, wo Sie alle verfügbaren Ärzte in Ihrer Nähe sehen.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
