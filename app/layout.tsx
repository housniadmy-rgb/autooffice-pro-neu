import "./globals.css"

export const metadata = {
  title: "PraxisOnline - DSGVO-sichere Praxis-Automatisierung",
  description: "Automatisieren Sie Ihre Praxis mit Online-Terminbuchung, Erinnerungen und Bewertungsmanagement.",
}



export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body className="bg-white text-gray-900 text-sm md:text-base lg:text-lg min-h-screen antialiased flex flex-col">
        <script dangerouslySetInnerHTML={{ __html: `(function(){var p=new URLSearchParams(window.location.search);var lang=p.get("setLang");if(lang){localStorage.setItem("lang",lang);var u=new URL(window.location);u.searchParams.delete("setLang");window.history.replaceState({},"",u.toString())}})()` }} />
        <main className="flex-1">{children}</main>
       