"use client"

interface GoogleMapProps {
  address: string
  name: string
}

export default function GoogleMap({ address, name }: GoogleMapProps) {
  const encodedAddress = encodeURIComponent(`${address}, Deutschland`)
  const mapUrl = `https://www.google.com/maps/embed/v1/place?key=AIzaSyB41DRUbKWJHPxaFjMAwdrzWzbVKartQ2I&q=${encodedAddress}&zoom=14`

  // Hinweis: Du brauchst einen eigenen Google Maps API Key
  // Ohne Key wird eine Meldung angezeigt.
  
  return (
    <div className="w-full h-64 md:h-80 rounded-xl shadow-md border border-gray-200 overflow-hidden bg-gray-100 mt-4">
      <iframe
        width="100%"
        height="100%"
        style={{ border: 0 }}
        loading="lazy"
        allowFullScreen
        src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyB41DRUbKWJHPxaFjMAwdrzWzbVKartQ2I&q=${encodedAddress}&zoom=14`}
        title={`Karte: ${name}`}
      />
      <p className="text-xs text-center text-gray-400 mt-1 p-1">
        📍 {address}
      </p>
    </div>
  )
}
