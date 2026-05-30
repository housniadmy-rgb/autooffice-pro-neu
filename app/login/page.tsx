"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

const SUPABASE_URL = "https://pocgddnekqurlzlkywyn.supabase.co"
const SUPABASE_KEY = "sb_publishable_hlfO39j5ABT-17h_sV1jDQ_6keQz0ij"

const texts: Record<string, any> = {
  de: { title: "Anmelden", email: "E-Mail", password: "Passwort", loginBtn: "Anmelden", loading: "Wird angemeldet...", forgot: "Passwort vergessen?", noAccount: "Noch kein Konto?", register: "Jetzt anmelden", success: "Login erfolgreich!", error: "Login fehlgeschlagen", back: "← Zurück" },
  en: { title: "Login", email: "Email", password: "Password", loginBtn: "Login", loading: "Logging in...", forgot: "Forgot password?", noAccount: "No account yet?", register: "Register now", success: "Login successful!", error: "Login failed", back: "← Back" },
  fr: { title: "Connexion", email: "E-mail", password: "Mot de passe", loginBtn: "Connexion", loading: "Connexion...", forgot: "Mot de passe oublié ?", noAccount: "Pas encore de compte ?", register: "S'inscrire", success: "Connexion réussie !", error: "Échec", back: "← Retour" },
  es: { title: "Iniciar sesión", email: "Correo", password: "Contraseña", loginBtn: "Acceder", loading: "Iniciando...", forgot: "¿Olvidó su contraseña?", noAccount: "¿No tiene cuenta?", register: "Registrarse", success: "¡Inicio exitoso!", error: "Error", back: "← Volver" },
  it: { title: "Accedi", email: "Email", password: "Password", loginBtn: "Accedi", loading: "Accesso...", forgot: "Password dimenticata?", noAccount: "Nessun account?", register: "Registrati", success: "Accesso riuscito!", error: "Errore", back: "← Indietro" },
  pt: { title: "Entrar", email: "E-mail", password: "Senha", loginBtn: "Entrar", loading: "Entrando...", forgot: "Esqueceu a senha?", noAccount: "Não tem conta?", register: "Cadastrar", success: "Login bem-sucedido!", error: "Erro", back: "← Voltar" },
  nl: { title: "Inloggen", email: "E-mail", password: "Wachtwoord", loginBtn: "Inloggen", loading: "Inloggen...", forgot: "Wachtwoord vergeten?", noAccount: "Nog geen account?", register: "Registreren", success: "Inloggen gelukt!", error: "Fout", back: "← Terug" },
  pl: { title: "Zaloguj się", email: "E-mail", password: "Hasło", loginBtn: "Zaloguj", loading: "Logowanie...", forgot: "Nie pamiętasz hasła?", noAccount: "Nie masz konta?", register: "Zarejestruj się", success: "Zalogowano!", error: "Błąd", back: "← Wróć" },
  tr: { title: "Giriş Yap", email: "E-posta", password: "Şifre", loginBtn: "Giriş", loading: "Giriş...", forgot: "Şifremi unuttum?", noAccount: "Hesabınız yok mu?", register: "Kayıt ol", success: "Giriş başarılı!", error: "Hata", back: "← Geri" },
  ja: { title: "ログイン", email: "メール", password: "パスワード", loginBtn: "ログイン", loading: "ログイン中...", forgot: "パスワードを忘れた？", noAccount: "アカウント未登録？", register: "登録する", success: "ログイン成功！", error: "エラー", back: "← 戻る" },
  zh: { title: "登录", email: "邮箱", password: "密码", loginBtn: "登录", loading: "登录中...", forgot: "忘记密码？", noAccount: "还没有账户？", register: "立即注册", success: "登录成功！", error: "错误", back: "← 返回" },
  cs: { title: "Přihlášení", email: "E-mail", password: "Heslo", loginBtn: "Přihlásit", loading: "Přihlašování...", forgot: "Zapomenuté heslo?", noAccount: "Nemáte účet?", register: "Registrovat", success: "Přihlášení úspěšné!", error: "Chyba", back: "← Zpět" },
  sk: { title: "Prihlásenie", email: "E-mail", password: "Heslo", loginBtn: "Prihlásiť", loading: "Prihlasovanie...", forgot: "Zabudnuté heslo?", noAccount: "Nemáte účet?", register: "Registrovať", success: "Prihlásenie úspešné!", error: "Chyba", back: "← Späť" },
  sl: { title: "Prijava", email: "E-pošta", password: "Geslo", loginBtn: "Prijava", loading: "Prijava...", forgot: "Pozabljeno geslo?", noAccount: "Nimate računa?", register: "Registracija", success: "Prijava uspešna!", error: "Napaka", back: "← Nazaj" },
  sv: { title: "Logga in", email: "E-post", password: "Lösenord", loginBtn: "Logga in", loading: "Loggar in...", forgot: "Glömt lösenord?", noAccount: "Inget konto?", register: "Registrera", success: "Inloggning klar!", error: "Fel", back: "← Tillbaka" },
  no: { title: "Logg inn", email: "E-post", password: "Passord", loginBtn: "Logg inn", loading: "Logger inn...", forgot: "Glemt passord?", noAccount: "Ingen konto?", register: "Registrer", success: "Innlogging vellykket!", error: "Feil", back: "← Tilbake" },
  da: { title: "Log ind", email: "E-mail", password: "Adgangskode", loginBtn: "Log ind", loading: "Logger ind...", forgot: "Glemt adgangskode?", noAccount: "Ingen konto?", register: "Registrer", success: "Login gennemført!", error: "Fejl", back: "← Tilbage" },
}

export default function Login() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [lang, setLang] = useState("de")

  useEffect(() => {
    const stored = localStorage.getItem("lang")
    if (stored && texts[stored]) { setLang(stored); return }
    const browser = (navigator.language || "").split("-")[0]
    if (texts[browser]) { setLang(browser); return }
    setLang("en")
  }, [])

  const t = texts[lang] || texts.en

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setMessage("")
    const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, { method: "POST", headers: { "Content-Type": "application/json", "apikey": SUPABASE_KEY }, body: JSON.stringify({ email, password }) })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) { setMessage(data.error_description || t.error) }
    else { if (data.access_token) localStorage.setItem("supabase_token", data.access_token); setMessage(t.success); setTimeout(() => router.push("/dashboard"), 1000) }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4 sm:p-8">
      <div className="bg-white border border-blue-200 shadow-lg p-6 sm:p-10 rounded-lg sm:rounded-xl max-w-full sm:max-w-md w-full">
        <h1 className="text-xl sm:text-2xl sm:text-3xl font-bold mb-6 text-center text-gray-900">{t.title}</h1>
        <form onSubmit={handleLogin} className="space-y-5">
          <div><label className="block text-lg mb-2 text-gray-700">{t.email}</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-4 rounded-lg bg-white border border-blue-200 text-gray-900 text-lg" placeholder={t.email} required /></div>
          <div><label className="block text-lg mb-2 text-gray-700">{t.password}</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-4 rounded-lg bg-white border border-blue-200 text-gray-900 text-lg" placeholder="••••••••" required /></div>
          <button type="submit" disabled={loading} className="w-full bg-[#1E40AF] text-white text-xl font-semibold py-3 sm:py-4 rounded-lg hover:bg-green-600 transition disabled:opacity-50">{loading ? t.loading : t.loginBtn}</button>
        </form>
        <div className="mt-6 text-center"><Link href="/" className="text-gray-500 hover:text-[#3B82F6] underline text-lg">{t.back}</Link></div>
        {message && <p className="mt-4 text-center text-gray-700">{message}</p>}
        <p className="mt-4 text-center text-gray-500"><Link href="/passwort-vergessen" className="text-[#3B82F6] hover:text-blue-600 underline">{t.forgot}</Link></p>
        <p className="mt-4 text-center text-gray-500 text-lg">{t.noAccount} <Link href="/registrieren" className="text-[#1E40AF] hover:text-green-600 underline">{t.register}</Link></p>
      </div>
    </main>
  )
}
