"use client"

interface GoogleMapProps {
  address: string
  name: string
}

export default function GoogleMap({ address, name }: GoogleMapProps) {
  const encodedAddress = encodeURIComponent(`${address}, Deutschland`)
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`

  return (
    <div className="w-full rounded-xl shadow-md border border-gray-200 overflow-hidden bg-gray-50 mt-4">
      <div className="p-4 text-center">
        <p className="text-gray-600 mb-2">📍 {address}</p>
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-[#1E40AF] text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-800 transition"
        >
          📍 In Google Maps öffnen
        </a>
        <p className="text-xs text-gray-400 mt-2">
          Klicken Sie auf den Button, um die Karte in einem neuen Fenster zu öffnen
        </p>
      </div>
    </div>
  )
}
