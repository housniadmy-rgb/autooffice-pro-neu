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
  it: { title: "Registrati", name: "Nome", email: "Email", password: "Password", dsgvo: "Accetto la", dsgvoLink: "Informativa sulla privacy", registerBtn: "Crea account", loading: "Registrazione...", hasAccount: "Già registrato?", login: "Accedi", success: "Registrazione riuscita!", back: "← Indietro", dsgvoError: "Si prega di accettare la privacy." },
  pt: { title: "Cadastrar", name: "Nome", email: "E-mail", password: "Senha", dsgvo: "Aceito a", dsgvoLink: "Política de Privacidade", registerBtn: "Criar conta", loading: "Cadastrando...", hasAccount: "Já cadastrado?", login: "Entrar", success: "Cadastro realizado!", back: "← Voltar", dsgvoError: "Aceite a política de privacidade." },
  nl: { title: "Registreren", name: "Naam", email: "E-mail", password: "Wachtwoord", dsgvo: "Ik accepteer de", dsgvoLink: "Privacyverklaring", registerBtn: "Account aanmaken", loading: "Registreren...", hasAccount: "Al geregistreerd?", login: "Inloggen", success: "Registratie succesvol!", back: "← Terug", dsgvoError: "Accepteer de privacyverklaring." },
  pl: { title: "Rejestracja", name: "Imię", email: "E-mail", password: "Hasło", dsgvo: "Akceptuję", dsgvoLink: "Politykę prywatności", registerBtn: "Utwórz konto", loading: "Rejestracja...", hasAccount: "Masz już konto?", login: "Zaloguj się", success: "Rejestracja udana!", back: "← Wróć", dsgvoError: "Proszę zaakceptować politykę prywatności." },
  tr: { title: "Kayıt Ol", name: "İsim", email: "E-posta", password: "Şifre", dsgvo: "Kabul ediyorum", dsgvoLink: "Gizlilik Politikası", registerBtn: "Hesap Oluştur", loading: "Kaydediliyor...", hasAccount: "Zaten kayıtlı mısınız?", login: "Giriş yap", success: "Kayıt başarılı!", back: "← Geri", dsgvoError: "Lütfen gizlilik politikasını kabul edin." },
  ja: { title: "登録", name: "名前", email: "メール", password: "パスワード", dsgvo: "同意する", dsgvoLink: "プライバシーポリシー", registerBtn: "アカウント作成", loading: "登録中...", hasAccount: "すでに登録済みですか？", login: "ログイン", success: "登録成功！", back: "← 戻る", dsgvoError: "プライバシーポリシーに同意してください。" },
  zh: { title: "注册", name: "姓名", email: "邮箱", password: "密码", dsgvo: "我接受", dsgvoLink: "隐私政策", registerBtn: "创建账户", loading: "注册中...", hasAccount: "已注册？", login: "立即登录", success: "注册成功！", back: "← 返回", dsgvoError: "请接受隐私政策。" },
  cs: { title: "Registrace", name: "Jméno", email: "E-mail", password: "Heslo", dsgvo: "Souhlasím s", dsgvoLink: "ochranou osobních údajů", registerBtn: "Vytvořit účet", loading: "Registrace...", hasAccount: "Již máte účet?", login: "Přihlásit se", success: "Registrace úspěšná!", back: "← Zpět", dsgvoError: "Přijměte prosím zásady ochrany osobních údajů." },
  sk: { title: "Registrácia", name: "Meno", email: "E-mail", password: "Heslo", dsgvo: "Súhlasím s", dsgvoLink: "ochranou osobných údajov", registerBtn: "Vytvoriť účet", loading: "Registrácia...", hasAccount: "Už máte účet?", login: "Prihlásiť sa", success: "Registrácia úspešná!", back: "← Späť", dsgvoError: "Prijmite prosím zásady ochrany osobných údajov." },
  sl: { title: "Registracija", name: "Ime", email: "E-pošta", password: "Geslo", dsgvo: "Strinjam se z", dsgvoLink: "varstvom osebnih podatkov", registerBtn: "Ustvari račun", loading: "Registracija...", hasAccount: "Že imate račun?", login: "Prijava", success: "Registracija uspešna!", back: "← Nazaj", dsgvoError: "Sprejmite pravilnik o zasebnosti." },
  sv: { title: "Registrera", name: "Namn", email: "E-post", password: "Lösenord", dsgvo: "Jag accepterar", dsgvoLink: "Integritetspolicy", registerBtn: "Skapa konto", loading: "Registrerar...", hasAccount: "Redan registrerad?", login: "Logga in", success: "Registrering klar!", back: "← Tillbaka", dsgvoError: "Vänligen acceptera integritetspolicyn." },
  no: { title: "Registrer", name: "Navn", email: "E-post", password: "Passord", dsgvo: "Jeg aksepterer", dsgvoLink: "Personvernerklæring", registerBtn: "Opprett konto", loading: "Registrerer...", hasAccount: "Allerede registrert?", login: "Logg inn", success: "Registrering vellykket!", back: "← Tilbake", dsgvoError: "Vennligst godta personvernerklæringen." },
  da: { title: "Registrer", name: "Navn", email: "E-mail", password: "Adgangskode", dsgvo: "Jeg accepterer", dsgvoLink: "Privatlivspolitik", registerBtn: "Opret konto", loading: "Registrerer...", hasAccount: "Allerede registreret?", login: "Log ind", success: "Registrering gennemført!", back: "← Tilbage", dsgvoError: "Accepter venligst privatlivspolitikken." },
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
