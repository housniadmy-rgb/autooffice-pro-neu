import Link from "next/link"

export default function Footer() {
  return (
    <footer className="text-center text-gray-500 text-lg py-6 border-t border-gray-800 mt-auto">
      <Link href="/datenschutz" className="underline mr-4">Datenschutz</Link>
      <Link href="/impressum" className="underline mr-4">Impressum</Link>
      <Link href="/admin" className="underline">Admin</Link>
    </footer>
  )
}
