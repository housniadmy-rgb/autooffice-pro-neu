import "./globals.css"

export const metadata = {
  title: "AutoOffice Pro - DSGVO-sichere Automatisierung",
  description: "Automatisieren Sie Ihre Praxis mit Termin-Erinnerungen, E-Mails und Kundenportal.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className="dark">
      <body className="bg-black text-white text-lg min-h-screen antialiased flex flex-col">
        <main className="flex-1">{children}</main>
        <footer className="text-center text-gray-500 text-lg py-6 border-t border-gray-800">
          <a href="/datenschutz" className="underline mr-4">Datenschutz</a>
          <a href="/impressum" className="underline mr-4">Impressum</a>
          <a href="/admin" className="underline">Admin</a>
        </footer>
      </body>
    </html>
  )
}
