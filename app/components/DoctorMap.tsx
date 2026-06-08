"use client"

interface DoctorMapProps {
  address: string
  name: string
}

export default function DoctorMap({ address, name }: DoctorMapProps) {
  const encodedAddress = encodeURIComponent(`${address}, Deutschland`)
  const osmUrl = `https://staticmap.openstreetmap.de/staticmap.php?center=${encodedAddress}&zoom=14&size=600x300&markers=${encodedAddress}`

  return (
    <div className="w-full h-48 md:h-64 rounded-xl shadow-md border border-gray-200 overflow-hidden bg-gray-100 mt-4">
      <img
        src={osmUrl}
        alt={`Karte: ${name}`}
        className="w-full h-full object-cover"
        onError={(e) => {
          e.currentTarget.src = "https://placehold.co/600x300/e2e8f0/64748b?text=Karte+verfügbar"
        }}
      />
      <p className="text-xs text-center text-gray-400 mt-1 p-1">
        📍 {address}
      </p>
    </div>
  )
}
