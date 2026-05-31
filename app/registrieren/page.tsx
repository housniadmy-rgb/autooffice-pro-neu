"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

const SUPABASE_URL = "https://pocgddnekqurlzlkywyn.supabase.co"
const SUPABASE_KEY = "sb_publishable_hlfO39j5ABT-17h_sV1jDQ_6keQz0ij"

const texts: Record<string, any> = {
  de: { title: "Registrieren", name: "Name", email: "E-Mail", password: "Passwort", dsgvo: "Ich akzeptiere die", dsgvoLink: "Datenschutzerklärung", registerBtn: "Konto erstellen", loading: "Wird registriert...", hasAccount: "Bereits registriert?", login: "Jetzt anmelden", success: "Registrierung erfolgreich!", back: "← Zurück" },
  en: { title: "Register", name: "Name", email: "Email", password: "Password", dsgvo: "I accept the", dsgvoLink: "Privacy Policy", registerBtn: "Create Account", loading: "Registering...", hasAccount: "Already registered?", login: "Login now", success: "Registration successful!", back: "← Back" },
  fr: { title: "S'inscrire", name: "Nom", email: "E-mail", password: "Mot de passe", dsgvo: "J'accepte la", dsgvoLink: "Politique de confidentialité", registerBtn: "Créer un compte", loading: "Inscription...", hasAccount: "Déjà inscrit ?", login: "Se connecter", success: "Inscription réussie !", back: "← Retour" },
  es: { title: "Registrarse", name: "Nombre", email: "Correo", password: "Contraseña", dsgvo: "Acepto la", dsgvoLink: "Política de privacidad", registerBtn: "Crear cuenta", loading: "Registrando...", hasAccount: "¿Ya registrado?", login: "Iniciar sesión", success: "¡Registro exitoso!", back: "← Volver" },
  it: { title: "Registrati", name: "Nome", email: "Email", password: "Password", dsgvo: "Accetto la", dsgvoLink: "Informativa sulla privacy", registerBtn: "Crea account", loading: "Registrazione...", hasAccount: "Già registrato?", login: "Accedi", success: "Registrazione riuscita!", back: "← Indietro" },
  pt: { title: "Cadastrar", name: "Nome", email: "E-mail", password: "Senha", dsgvo: "Aceito a", dsgvoLink: "Política de Privacidade", registerBtn: "Criar conta", loading: "Cadastrando...", hasAccount: "Já cadastrado?", login: "Entrar", success: "Cadastro realizado!", back: "← Voltar" },
  nl: { title: "Registreren", name: "Naam", email: "E-mail", password: "Wachtwoord", dsgvo: "Ik accepteer de", dsgvoLink: "Privacyverklaring", registerBtn: "Account aanmaken", loading: "Registreren...", hasAccount: "Al geregistreerd?", login: "Inloggen", success: "Registratie succesvol!", back: "← Terug" },
  pl: { title: "Rejestracja", name: "Imię", email: "E-mail", password: "Hasło", dsgvo: "Akceptuję", dsgvoLink: "Politykę prywatności", registerBtn: "Utwórz konto", loading: "Rejestracja...", hasAccount: "Masz już konto?", login: "Zaloguj się", success: "Rejestracja udana!", back: "← Wróć" },
  tr: { title: "Kayıt Ol", name: "İsim", email: "E-posta", password: "Şifre", dsgvo: "Kabul ediyorum", dsgvoLink: "Gizlilik Politikası", registerBtn: "Hesap Oluştur", loading: "Kaydediliyor...", hasAccount: "Zaten kayıtlı mısınız?", login: "Giriş yap", success: "Kayıt başarılı!", back: "← Geri" },
  ja: { title: "登録", name: "名前", email: "メール", password: "パスワード", dsgvo: "同意する", dsgvoLink: "プライバシーポリシー", registerBtn: "アカウント作成", loading: "登録中...", hasAccount: "すでに登録済みですか？", login: "ログイン", success: "登録成功！", back: "← 戻る" },
  zh: { title: "注册", name: "姓名", email: "邮箱", password: "密码", dsgvo: "我接受", dsgvoLink: "隐私政策", registerBtn: "创建账户", loading: "注册中...", hasAccount: "已注册？", login: "立即登录", success: "注册成功！", back: "← 返回" },
  ru: { title: "Регистрация", name: "Имя", email: "Эл. почта", password: "Пароль", dsgvo: "Я принимаю", dsgvoLink: "Политику конфиденциальности", registerBtn: "Создать аккаунт", loading: "Регистрация...", hasAccount: "Уже есть аккаунт?", login: "Войти", success: "Регистрация успешна!", back: "← Назад" },
  sv: { title: "Registrera", name: "Namn", email: "E-post", password: "Lösenord", dsgvo: "Jag accepterar", dsgvoLink: "Integritetspolicy", registerBtn: "Skapa konto", loading: "Registrerar...", hasAccount: "Redan registrerad?", login: "Logga in", success: "Registrering klar!", back: "← Tillbaka" },
  no: { title: "Registrer", name: "Navn", email: "E-post", password: "Passord", dsgvo: "Jeg aksepterer", dsgvoLink: "Personvernerklæring", registerBtn: "Opprett konto", loading: "Registrerer...", hasAccount: "Allerede registrert?", login: "Logg inn", success: "Registrering vellykket!", back: "← Tilbake" },
  da: { title: "Registrer", name: "Navn", email: "E-mail", password: "Adgangskode", dsgvo: "Jeg accepterer", dsgvoLink: "Privatlivspolitik", registerBtn: "Opret konto", loading: "Registrerer...", hasAccount: "Allerede registreret?", login: "Log ind", success: "Registrering gennemført!", back: "← Tilbage" },
  cs: { title: "Registrace", name: "Jméno", email: "E-mail", password: "Heslo", dsgvo: "Souhlasím s", dsgvoLink: "ochranou osobních údajů", registerBtn: "Vytvořit účet", loading: "Registrace...", hasAccount: "Již máte účet?", login: "Přihlásit se", success: "Registrace úspěšná!", back: "← Zpět" },
  sk: { title: "Registrácia", name: "Meno", email: "E-mail", password: "Heslo", dsgvo: "Súhlasím s", dsgvoLink: "ochranou osobných údajov", registerBtn: "Vytvoriť účet", loading: "Registrácia...", hasAccount: "Už máte účet?", login: "Prihlásiť sa", success: "Registrácia úspešná!", back: "← Späť" },
  sl: { title: "Registracija", name: "Ime", email: "E-pošta", password: "Geslo", dsgvo: "Strinjam se z", dsgvoLink: "varstvom osebnih podatkov", registerBtn: "Ustvari račun", loading: "Registracija...", hasAccount: "Že imate račun?", login: "Prijava", success: "Registracija uspešna!", back: "← Nazaj" },
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
    const urlParams = new URLSearchParams(window.location.search); const urlLang = urlParams.get("lang"); const stored = urlLang || localStorage.getItem("lang")
    if (stored && texts[stored]) { setLang(stored); return }
    const browser = (navigator.language || "").split("-")[0]
    if (texts[browser]) { setLang(browser); return }
    setLang("en")
  }, [])

  const t = texts[lang] || texts.en

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
        if (!dsgvo) { setMessage("Bitte akzeptieren Sie die Datenschutzerklärung."); return }
    setLoading(true); setMessage("")
    const res = await fetch(`${SUPABASE_URL}/auth/v1/signup`, { method: "POST", headers: { "Content-Type": "application/json", "apikey": SUPABASE_KEY }, body: JSON.stringify({ email, password, data: { name } }) })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) { setMessage(data.msg || "Fehler") }
    else { if (data.access_token) localStorage.setItem("supabase_token", data.access_token); setMessage(t.success); setTimeout(() => router.push("/dashboard"), 1000) }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4 sm:p-8">
      <div className="bg-white border border-blue-200 shadow-lg p-6 sm:p-10 rounded-lg sm:rounded-xl max-w-full sm:max-w-md w-full">
        <h1 className="text-xl sm:text-2xl sm:text-3xl font-bold mb-6 text-center text-gray-900">{t.title}</h1>
        <form onSubmit={handleRegister} className="space-y-5">
          <div><label className="block text-lg mb-2 text-gray-700">{t.name}</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-4 rounded-lg bg-white border border-blue-200 text-gray-900 text-lg" placeholder={t.name} required /></div>
          <div><label className="block text-lg mb-2 text-gray-700">{t.email}</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-4 rounded-lg bg-white border border-blue-200 text-gray-900 text-lg" placeholder={t.email} required /></div>
          <div><label className="block text-lg mb-2 text-gray-700">{t.password}</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-4 rounded-lg bg-white border border-blue-200 text-gray-900 text-lg" placeholder="••••••••" required /></div>
          <div className="flex items-start gap-3"><input type="checkbox" checked={dsgvo} onChange={(e) => setDsgvo(e.target.checked)} className="mt-1 w-5 h-5" /><label className="text-gray-500 text-lg">{t.dsgvo} <Link href="/datenschutz" className="text-[#3B82F6] underline" target="_blank">{t.dsgvoLink}</Link></label></div>
          <button type="submit" disabled={loading} className="w-full bg-[#3B82F6] text-white text-xl font-semibold py-3 sm:py-4 rounded-lg hover:bg-blue-600 transition disabled:opacity-50">{loading ? t.loading : t.registerBtn}</button>
        </form>
        <div className="mt-6 text-center"><Link href="/" className="text-gray-500 hover:text-[#3B82F6] underline text-lg">{t.back}</Link></div>
        {message && <p className="mt-4 text-center text-gray-700">{message}</p>}
        <p className="mt-6 text-center text-gray-500 text-lg">{t.hasAccount} <Link href="/login" className="text-[#1E40AF] hover:text-green-600 underline">{t.login}</Link></p>
      </div>
    </main>
  )
}
