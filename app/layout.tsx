import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "AutoOffice Pro - DSGVO-sichere Automatisierung",
  description: "Automatisieren Sie Ihre Praxis mit Termin-Erinnerungen, E-Mails und Kundenportal.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className="dark">
      <body className="bg-black text-white text-lg min-h-screen antialiased">{children}</body>
    </html>
  )
}
