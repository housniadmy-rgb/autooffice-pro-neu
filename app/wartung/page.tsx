export default function Wartung() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-4">🚧</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Wartungsarbeiten</h1>
        <p className="text-gray-500 mb-6">Wir aktualisieren unser System, um Ihnen bald einen noch besseren Service bieten zu können. Bitte versuchen Sie es in Kürze erneut.</p>
        <div className="flex justify-center gap-4 text-sm text-gray-400">
          <span>🔒 DSGVO-konform</span>
          <span>🇩🇪 Hosted in Germany</span>
        </div>
      </div>
    </main>
  )
}