"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

const SUPABASE_URL = "https://pocgddnekqurlzlkywyn.supabase.co"
const SUPABASE_KEY = "sb_publishable_hlfO39j5ABT-17h_sV1jDQ_6keQz0ij"

const texts: Record<string, any> = {
  de: { title: "Registrieren", name: "Name", email: "E-Mail", password: "Passwort", dsgvo: "Ich akzeptiere die", dsgvoLink: "Datenschutzerklärung", registerBtn: "Konto erstellen", loading: "Wird registriert...", hasAccount: "Bereits registriert?", login: "Jetzt anmelden", success: "Registrierung erfolgreich!", back: "← Zurück", dsgvoError: "Bitte akzeptieren Sie die Datenschutzerklärung." },
  en: { title: "Register", name: "Name", email: "Email", password: "Password", dsgvo: "I accept the", dsgvoLink: "Privacy Policy", registerBtn: "Create Account", loading: "Registering...", hasAccount: "Already registered?", login: "Login now", success: "Registration successful!", back: "← Back", dsgvoError: "Please accept the privacy policy." },
  fr: { title: "S'inscrire", name: "Nom", email: "E-mail", password: "Mot de passe", dsgvo: "J'accepte la", dsgvoLink: "Politique de confidentialité", registerBtn: "Créer un compte", loading: "Inscription...", hasAccount: "Déjà inscrit ?", login: "Se connecter", success: "Inscription réussie !", back: "← Retour", dsgvoError: "Veuillez accepter la politique de confidentialité." },
  es: { title: "Registrarse", name: "Nombre", email: "Correo", password: "Contraseña", dsgvo: "Acepto la", dsgvoLink: "Política de privacidad", registerBtn: "Crear cuenta", loading: "Registrando...", hasAccount: "¿Ya registrado?", login: "Iniciar sesión", success: "¡Registro exitoso!", back: "← Volver", dsgvoError: "Por favor acepte la política de privacidad." },
}

export default function Registrieren() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [dsgvo, setDsgvo] = useState(false)
  const [lang, setLang] = useState("de")

  useEffect(() => {
    const p = new URLSearchParams(window.location.search)
    const ul = p.get("setLang")
    const stored = ul || localStorage.getItem("lang")
    if (stored && texts[stored]) setLang(stored)
    else { const b = (navigator.language || "").split("-")[0]; if (texts[b]) setLang(b); else setLang("en") }
  }, [])

  const t = texts[lang] || texts.en

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!dsgvo) { setMessage(t.dsgvoError); return }
    setLoading(true); setMessage("")
    const res = await fetch(`${SUPABASE_URL}/auth/v1/signup`, { method: "POST", headers: { "Content-Type": "application/json", "apikey": SUPABASE_KEY }, body: JSON.stringify({ email, password, data: { name } }) })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) { setMessage(data.msg || "Fehler") }
    else { if (data.access_token) localStorage.setItem("supabase_token", data.access_token); setMessage(t.success); setTimeout(() => router.push("/dashboard"), 1000) }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4 sm:p-8">
      <div className="bg-white border border-blue-200 shadow-lg p-6 sm:p-10 rounded-xl max-w-md w-full">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-center text-gray-900">{t.title}</h1>
        <form onSubmit={handleRegister} className="space-y-4 sm:space-y-5">
          <div><label className="block text-base sm:text-lg mb-2 text-gray-700">{t.name}</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-3 sm:p-4 rounded-lg bg-white border border-blue-200 text-gray-900 text-base sm:text-lg" placeholder={t.name} required /></div>
          <div><label className="block text-base sm:text-lg mb-2 text-gray-700">{t.email}</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3 sm:p-4 rounded-lg bg-white border border-blue-200 text-gray-900 text-base sm:text-lg" placeholder={t.email} required /></div>
          <div><label className="block text-base sm:text-lg mb-2 text-gray-700">{t.password}</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3 sm:p-4 rounded-lg bg-white border border-blue-200 text-gray-900 text-base sm:text-lg" placeholder="••••••••" required /></div>
          <div className="flex items-start gap-3"><input type="checkbox" checked={dsgvo} onChange={(e) => setDsgvo(e.target.checked)} className="mt-1 w-5 h-5" /><label className="text-gray-500 text-base sm:text-lg">{t.dsgvo} <Link href="/datenschutz" className="text-[#1E40AF] underline" target="_blank">{t.dsgvoLink}</Link></label></div>
          <button type="submit" disabled={loading} className="w-full bg-[#1E40AF] text-white text-lg sm:text-xl font-semibold py-3 sm:py-4 rounded-lg hover:bg-blue-800 transition disabled:opacity-50">{loading ? t.loading : t.registerBtn}</button>
        </form>
        {message && <p className="mt-4 text-center text-red-600 font-medium">{message}</p>}
        <p className="mt-4 sm:mt-6 text-center text-gray-500 text-base sm:text-lg">{t.hasAccount} <Link href="/login" className="text-[#1E40AF] hover:text-blue-800 underline">{t.login}</Link></p>
      </div>
    </main>
  )
}
