"use client"

interface GoogleMapProps {
  address: string
  name: string
}

export default function GoogleMap({ address, name }: GoogleMapProps) {
  const encodedAddress = encodeURIComponent(`${address}, Deutschland`)
  const osmUrl = `https://staticmap.openstreetmap.de/staticmap.php?center=${encodedAddress}&zoom=14&size=600x300&markers=${encodedAddress}`

  return (
    <div className="w-full h-64 md:h-80 rounded-xl shadow-md border border-gray-200 overflow-hidden bg-gray-100 mt-4">
      <img
        src={osmUrl}
        alt={`Karte: ${name}`}
        className="w-full h-full object-cover"
        onError={(e) => {
          e.currentTarget.src = "https://placehold.co/600x300/e2e8f0/64748b?text=Karte+nicht+verfügbar"
        }}
      />
      <div className="text-center mt-2">
        <a
          href={`https://www.openstreetmap.org/search?query=${encodedAddress}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-[#1E40AF] hover:underline"
        >
          📍 In OpenStreetMap öffnen
        </a>
      </div>
      <p className="text-xs text-center text-gray-400 mt-1 p-1">
        📍 {address}
      </p>
    </div>
  )
}