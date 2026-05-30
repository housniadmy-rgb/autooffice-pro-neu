"use client"
import { useEffect, useState } from "react"
import Link from "next/link"

const ADMIN_PASSWORD = "Zeinab13042018!"

const adminTexts: Record<string, any> = {
  de: { login: "Admin-Login", password: "Passwort", loginBtn: "Anmelden", wrong: "Falsches Passwort", dashboard: "Vollautomatische Steuerung", logout: "Abmelden", finance: "Finanzen", financeOk: "Stripe bucht automatisch ab", users: "Nutzer", tech: "Technik", techOk: "Keine Fehler", report: "CEO-Report senden", back: "← Zurück" },
  en: { login: "Admin Login", password: "Password", loginBtn: "Login", wrong: "Wrong password", dashboard: "Fully Automated Control", logout: "Logout", finance: "Finance", financeOk: "Stripe auto-charges", users: "Users", tech: "Technology", techOk: "No errors", report: "Send CEO Report", back: "← Back" },
  fr: { login: "Connexion Admin", password: "Mot de passe", loginBtn: "Connexion", wrong: "Mot de passe incorrect", dashboard: "Contrôle automatisé", logout: "Déconnexion", finance: "Finances", financeOk: "Stripe débite automatiquement", users: "Utilisateurs", tech: "Technique", techOk: "Aucune erreur", report: "Envoyer rapport CEO", back: "← Retour" },
  es: { login: "Acceso Admin", password: "Contraseña", loginBtn: "Acceder", wrong: "Contraseña incorrecta", dashboard: "Control automatizado", logout: "Salir", finance: "Finanzas", financeOk: "Stripe cobra automáticamente", users: "Usuarios", tech: "Tecnología", techOk: "Sin errores", report: "Enviar informe CEO", back: "← Volver" },
  it: { login: "Accesso Admin", password: "Password", loginBtn: "Accedi", wrong: "Password sbagliata", dashboard: "Controllo automatico", logout: "Esci", finance: "Finanze", financeOk: "Stripe addebita", users: "Utenti", tech: "Tecnologia", techOk: "Nessun errore", report: "Invia report CEO", back: "← Indietro" },
  pt: { login: "Acesso Admin", password: "Senha", loginBtn: "Entrar", wrong: "Senha incorreta", dashboard: "Controle automático", logout: "Sair", finance: "Finanças", financeOk: "Stripe cobra", users: "Usuários", tech: "Tecnologia", techOk: "Sem erros", report: "Enviar relatório", back: "← Voltar" },
  nl: { login: "Admin Login", password: "Wachtwoord", loginBtn: "Inloggen", wrong: "Verkeerd wachtwoord", dashboard: "Volledig geautomatiseerd", logout: "Uitloggen", finance: "Financiën", financeOk: "Stripe schrijft af", users: "Gebruikers", tech: "Techniek", techOk: "Geen fouten", report: "CEO-rapport versturen", back: "← Terug" },
  pl: { login: "Login Admin", password: "Hasło", loginBtn: "Zaloguj", wrong: "Złe hasło", dashboard: "W pełni automatyczne", logout: "Wyloguj", finance: "Finanse", financeOk: "Stripe pobiera", users: "Użytkownicy", tech: "Technologia", techOk: "Brak błędów", report: "Wyślij raport", back: "← Wróć" },
  tr: { login: "Admin Girişi", password: "Şifre", loginBtn: "Giriş", wrong: "Yanlış şifre", dashboard: "Tam Otomatik", logout: "Çıkış", finance: "Finans", financeOk: "Stripe tahsil eder", users: "Kullanıcılar", tech: "Teknoloji", techOk: "Hata yok", report: "Rapor Gönder", back: "← Geri" },
  ja: { login: "管理者ログイン", password: "パスワード", loginBtn: "ログイン", wrong: "パスワードが違います", dashboard: "完全自動制御", logout: "ログアウト", finance: "財務", financeOk: "Stripeが自動請求", users: "ユーザー", tech: "技術", techOk: "エラーなし", report: "レポート送信", back: "← 戻る" },
  zh: { login: "管理员登录", password: "密码", loginBtn: "登录", wrong: "密码错误", dashboard: "全自动控制", logout: "退出", finance: "财务", financeOk: "Stripe自动扣款", users: "用户", tech: "技术", techOk: "无错误", report: "发送报告", back: "← 返回" },
  cs: { login: "Admin přihlášení", password: "Heslo", loginBtn: "Přihlásit", wrong: "Špatné heslo", dashboard: "Plně automatické", logout: "Odhlásit", finance: "Finance", financeOk: "Stripe účtuje", users: "Uživatelé", tech: "Technika", techOk: "Žádné chyby", report: "Odeslat zprávu", back: "← Zpět" },
  sk: { login: "Admin prihlásenie", password: "Heslo", loginBtn: "Prihlásiť", wrong: "Nesprávne heslo", dashboard: "Plne automatické", logout: "Odhlásiť", finance: "Financie", financeOk: "Stripe účtuje", users: "Používatelia", tech: "Technika", techOk: "Žiadne chyby", report: "Odoslať správu", back: "← Späť" },
  sl: { login: "Admin prijava", password: "Geslo", loginBtn: "Prijava", wrong: "Napačno geslo", dashboard: "Popolnoma avtomatsko", logout: "Odjava", finance: "Finance", financeOk: "Stripe obračuna", users: "Uporabniki", tech: "Tehnika", techOk: "Brez napak", report: "Pošlji poročilo", back: "← Nazaj" },
  sv: { login: "Admin Login", password: "Lösenord", loginBtn: "Logga in", wrong: "Fel lösenord", dashboard: "Fullt automatiserat", logout: "Logga ut", finance: "Ekonomi", financeOk: "Stripe debiterar", users: "Användare", tech: "Teknik", techOk: "Inga fel", report: "Skicka rapport", back: "← Tillbaka" },
  no: { login: "Admin Login", password: "Passord", loginBtn: "Logg inn", wrong: "Feil passord", dashboard: "Fullautomatisert", logout: "Logg ut", finance: "Økonomi", financeOk: "Stripe belaster", users: "Brukere", tech: "Teknologi", techOk: "Ingen feil", report: "Send rapport", back: "← Tilbake" },
  da: { login: "Admin Login", password: "Adgangskode", loginBtn: "Log ind", wrong: "Forkert kode", dashboard: "Fuldt automatiseret", logout: "Log ud", finance: "Økonomi", financeOk: "Stripe opkræver", users: "Brugere", tech: "Teknologi", techOk: "Ingen fejl", report: "Send rapport", back: "← Tilbage" },
}

export default function Admin() {
  const [authenticated, setAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [users, setUsers] = useState<any[]>([])
  const [lang, setLang] = useState("de")

  useEffect(() => {
    const auth = localStorage.getItem("admin_auth")
    if (auth === "true") { setAuthenticated(true); fetchUsers() }
    const stored = localStorage.getItem("lang")
    if (stored && adminTexts[stored]) setLang(stored)
    else { const b = (navigator.language || "").split("-")[0]; if (adminTexts[b]) setLang(b); else setLang("en") }
  }, [])

  const t = adminTexts[lang] || adminTexts.en

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) { setAuthenticated(true); localStorage.setItem("admin_auth", "true"); fetchUsers() }
    else setError(t.wrong)
  }

  const fetchUsers = async () => {
    try {
      const res = await fetch("https://pocgddnekqurlzlkywyn.supabase.co/auth/v1/users", {
        headers: { "apikey": "sb_publishable_hlfO39j5ABT-17h_sV1jDQ_6keQz0ij", "Authorization": "Bearer sb_publishable_hlfO39j5ABT-17h_sV1jDQ_6keQz0ij" },
      })
      const data = await res.json()
      if (data.users) setUsers(data.users)
    } catch (err) { console.error(err) }
  }

  const sendReport = async () => { await fetch("/api/ceo-report/send"); alert("CEO-Report gesendet!") }

  if (!authenticated) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4 sm:p-8 bg-gradient-to-b from-blue-50 to-white">
        <form onSubmit={handleLogin} className="bg-white border border-blue-200 p-6 sm:p-10 rounded-xl w-full max-w-md text-center shadow-lg">
          <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-gray-900">🔐 {t.login}</h1>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3 sm:p-4 rounded-lg bg-white border border-blue-200 text-gray-900 text-base sm:text-lg mb-3 sm:mb-4" placeholder={t.password} required />
          {error && <p className="text-red-500 mb-3 sm:mb-4">{error}</p>}
          <button type="submit" className="w-full bg-[#1E40AF] text-white text-lg sm:text-xl font-semibold py-3 sm:py-4 rounded-lg hover:bg-green-600 transition">{t.loginBtn}</button>
          <div className="mt-4 sm:mt-6"><Link href="/" className="text-gray-500 hover:text-[#3B82F6] underline text-sm sm:text-base">{t.back}</Link></div>
        </form>
      </main>
    )
  }

  return (
    <main className="min-h-screen p-4 sm:p-8 bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6 sm:mb-8">
          <div><h1 className="text-2xl sm:text-4xl font-bold text-gray-900">🏢 PraxisOnline</h1><p className="text-gray-500 text-sm sm:text-lg">{t.dashboard}</p></div>
          <button onClick={() => { localStorage.removeItem("admin_auth"); setAuthenticated(false) }} className="bg-red-500 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-sm sm:text-lg hover:bg-red-600 transition">{t.logout}</button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-white border border-blue-200 p-4 sm:p-6 rounded-xl shadow-sm"><h2 className="text-lg sm:text-2xl font-semibold mb-2 sm:mb-4 text-gray-900">💰 {t.finance}</h2><p className="text-green-600 text-sm sm:text-lg">{t.financeOk}</p></div>
          <div className="bg-white border border-blue-200 p-4 sm:p-6 rounded-xl shadow-sm"><h2 className="text-lg sm:text-2xl font-semibold mb-2 sm:mb-4 text-gray-900">👥 {t.users}</h2><p className="text-2xl sm:text-3xl font-bold text-gray-900">{users.length}</p></div>
          <div className="bg-white border border-blue-200 p-4 sm:p-6 rounded-xl shadow-sm"><h2 className="text-lg sm:text-2xl font-semibold mb-2 sm:mb-4 text-gray-900">🔧 {t.tech}</h2><p className="text-green-600 text-sm sm:text-lg">{t.techOk}</p></div>
          <div className="bg-white border border-blue-200 p-4 sm:p-6 rounded-xl shadow-sm"><h2 className="text-lg sm:text-2xl font-semibold mb-2 sm:mb-4 text-gray-900">📊 CEO-Report</h2><button onClick={sendReport} className="bg-[#3B82F6] text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-sm sm:text-lg hover:bg-blue-600 transition">{t.report}</button></div>
        </div>
        <div className="mt-8 text-center"><Link href="/" className="text-[#3B82F6] hover:text-blue-600 underline text-sm sm:text-lg">{t.back}</Link></div>
      </div>
    </main>
  )
}
