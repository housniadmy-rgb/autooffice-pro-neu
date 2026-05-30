"use client"
import { useState, useEffect } from "react"
import Link from "next/link"

const texts: Record<string, any> = {
  de: { title: "Termin online buchen", step1date: "Datum", step1time: "Uhrzeit", next: "Weiter", step2name: "Name", step2email: "E-Mail", step2phone: "Telefon", step2reason: "Grund (optional)", back: "Zurück", book: "Termin verbindlich buchen", booking: "Wird gebucht...", confirmed: "Termin bestätigt!", confirmedMsg: "Eine Bestätigung wurde gesendet.", home: "Zurück zur Startseite", return: "← Zurück" },
  en: { title: "Book Appointment Online", step1date: "Date", step1time: "Time", next: "Next", step2name: "Name", step2email: "Email", step2phone: "Phone", step2reason: "Reason (optional)", back: "Back", book: "Book Appointment", booking: "Booking...", confirmed: "Appointment Confirmed!", confirmedMsg: "A confirmation has been sent.", home: "Back to Home", return: "← Back" },
  fr: { title: "Prendre rendez-vous en ligne", step1date: "Date", step1time: "Heure", next: "Suivant", step2name: "Nom", step2email: "E-mail", step2phone: "Téléphone", step2reason: "Motif (optionnel)", back: "Retour", book: "Confirmer le rendez-vous", booking: "Réservation...", confirmed: "Rendez-vous confirmé !", confirmedMsg: "Une confirmation a été envoyée.", home: "Retour à l'accueil", return: "← Retour" },
  es: { title: "Reservar cita online", step1date: "Fecha", step1time: "Hora", next: "Siguiente", step2name: "Nombre", step2email: "Correo", step2phone: "Teléfono", step2reason: "Motivo (opcional)", back: "Volver", book: "Confirmar cita", booking: "Reservando...", confirmed: "¡Cita confirmada!", confirmedMsg: "Se ha enviado una confirmación.", home: "Volver al inicio", return: "← Volver" },
  it: { title: "Prenota visita online", step1date: "Data", step1time: "Ora", next: "Avanti", step2name: "Nome", step2email: "Email", step2phone: "Telefono", step2reason: "Motivo (opzionale)", back: "Indietro", book: "Conferma appuntamento", booking: "Prenotazione...", confirmed: "Visita confermata!", confirmedMsg: "Una conferma è stata inviata.", home: "Torna alla home", return: "← Indietro" },
  pt: { title: "Agendar consulta online", step1date: "Data", step1time: "Hora", next: "Próximo", step2name: "Nome", step2email: "E-mail", step2phone: "Telefone", step2reason: "Motivo (opcional)", back: "Voltar", book: "Confirmar consulta", booking: "Agendando...", confirmed: "Consulta confirmada!", confirmedMsg: "Uma confirmação foi enviada.", home: "Voltar ao início", return: "← Voltar" },
  nl: { title: "Afspraak online boeken", step1date: "Datum", step1time: "Tijd", next: "Volgende", step2name: "Naam", step2email: "E-mail", step2phone: "Telefoon", step2reason: "Reden (optioneel)", back: "Terug", book: "Afspraak bevestigen", booking: "Boeken...", confirmed: "Afspraak bevestigd!", confirmedMsg: "Er is een bevestiging gestuurd.", home: "Terug naar home", return: "← Terug" },
  pl: { title: "Umów wizytę online", step1date: "Data", step1time: "Godzina", next: "Dalej", step2name: "Imię", step2email: "E-mail", step2phone: "Telefon", step2reason: "Powód (opcjonalnie)", back: "Wstecz", book: "Potwierdź wizytę", booking: "Rezerwacja...", confirmed: "Wizyta potwierdzona!", confirmedMsg: "Potwierdzenie zostało wysłane.", home: "Powrót na stronę główną", return: "← Wróć" },
  tr: { title: "Online Randevu Al", step1date: "Tarih", step1time: "Saat", next: "İleri", step2name: "İsim", step2email: "E-posta", step2phone: "Telefon", step2reason: "Sebep (isteğe bağlı)", back: "Geri", book: "Randevuyu Onayla", booking: "Rezerve ediliyor...", confirmed: "Randevu Onaylandı!", confirmedMsg: "Onay e-postası gönderildi.", home: "Ana Sayfaya Dön", return: "← Geri" },
  ja: { title: "オンライン予約", step1date: "日付", step1time: "時間", next: "次へ", step2name: "名前", step2email: "メール", step2phone: "電話", step2reason: "理由（任意）", back: "戻る", book: "予約を確定", booking: "予約中...", confirmed: "予約完了！", confirmedMsg: "確認メールを送信しました。", home: "ホームに戻る", return: "← 戻る" },
  zh: { title: "在线预约", step1date: "日期", step1time: "时间", next: "下一步", step2name: "姓名", step2email: "邮箱", step2phone: "电话", step2reason: "原因（可选）", back: "返回", book: "确认预约", booking: "预约中...", confirmed: "预约成功！", confirmedMsg: "确认邮件已发送。", home: "返回首页", return: "← 返回" },
    cs: { title: "Rezervovat termín online", step1date: "Datum", step1time: "Čas", next: "Další", step2name: "Jméno", step2email: "E-mail", step2phone: "Telefon", step2reason: "Důvod (volitelné)", back: "Zpět", book: "Potvrdit rezervaci", booking: "Rezervace...", confirmed: "Termín potvrzen!", confirmedMsg: "Potvrzení bylo odesláno.", home: "Zpět na hlavní stránku", return: "← Zpět" },
  sk: { title: "Rezervovať termín online", step1date: "Dátum", step1time: "Čas", next: "Ďalej", step2name: "Meno", step2email: "E-mail", step2phone: "Telefón", step2reason: "Dôvod (voliteľné)", back: "Späť", book: "Potvrdiť rezerváciu", booking: "Rezervácia...", confirmed: "Termín potvrdený!", confirmedMsg: "Potvrdenie bolo odoslané.", home: "Späť na hlavnú stránku", return: "← Späť" },
  sl: { title: "Rezerviraj termin online", step1date: "Datum", step1time: "Čas", next: "Naprej", step2name: "Ime", step2email: "E-pošta", step2phone: "Telefon", step2reason: "Razlog (neobvezno)", back: "Nazaj", book: "Potrdi rezervacijo", booking: "Rezervacija...", confirmed: "Termin potrjen!", confirmedMsg: "Potrditev je bila poslana.", home: "Nazaj na začetno stran", return: "← Nazaj" },
  sv: { title: "Boka tid online", step1date: "Datum", step1time: "Tid", next: "Nästa", step2name: "Namn", step2email: "E-post", step2phone: "Telefon", step2reason: "Anledning (valfritt)", back: "Tillbaka", book: "Bekräfta tid", booking: "Bokar...", confirmed: "Tid bekräftad!", confirmedMsg: "En bekräftelse har skickats.", home: "Tillbaka till startsidan", return: "← Tillbaka" },
  no: { title: "Bestill time online", step1date: "Dato", step1time: "Tid", next: "Neste", step2name: "Navn", step2email: "E-post", step2phone: "Telefon", step2reason: "Grunn (valgfritt)", back: "Tilbake", book: "Bekreft time", booking: "Bestiller...", confirmed: "Time bekreftet!", confirmedMsg: "En bekreftelse er sendt.", home: "Tilbake til startsiden", return: "← Tilbake" },
  da: { title: "Bestil tid online", step1date: "Dato", step1time: "Tid", next: "Næste", step2name: "Navn", step2email: "E-mail", step2phone: "Telefon", step2reason: "Årsag (valgfrit)", back: "Tilbage", book: "Bekræft tid", booking: "Bestiller...", confirmed: "Tid bekræftet!", confirmedMsg: "En bekræftelse er sendt.", home: "Tilbage til startsiden", return: "← Tilbage" },
}

const zeiten = ["08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"]

export default function TerminBuchen() {
  const [schritt, setSchritt] = useState(1)
  const [datum, setDatum] = useState("")
  const [uhrzeit, setUhrzeit] = useState("")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [telefon, setTelefon] = useState("")
  const [bestaetigt, setBestaetigt] = useState(false)
  const [lang, setLang] = useState("de")

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search); const urlLang = urlParams.get("lang"); const stored = urlLang || localStorage.getItem("lang")
    if (stored && texts[stored]) { setLang(stored); return }
    const browser = (navigator.language || "").split("-")[0]
    if (texts[browser]) { setLang(browser); return }
    setLang("en")
  }, [])

  const t = texts[lang] || texts.en

  const handleBuchen = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await fetch("/api/send-email", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ to: email, subject: t.confirmed, html: `<h2>${t.confirmed}</h2><p>${datum} um ${uhrzeit} Uhr</p><p><a href='https://autooffice-pro-neu.vercel.app/storno'>Stornieren</a></p>` }) })
      setBestaetigt(true)
    } catch { alert("Fehler") }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4 sm:p-8 flex items-center justify-center">
      <div className="bg-white border border-blue-200 shadow-lg p-6 sm:p-10 rounded-lg sm:rounded-xl max-w-full sm:max-w-2xl w-full">
        {bestaetigt ? (
          <div className="text-center"><h1 className="text-xl sm:text-2xl sm:text-3xl font-bold mb-4 text-[#1E40AF]">{t.confirmed}</h1><p className="text-xl text-gray-700 mb-2">{datum} um {uhrzeit} Uhr</p><p className="text-lg text-gray-500 mb-6">{t.confirmedMsg} {email}</p><Link href="/" className="bg-[#1E40AF] text-white text-lg font-semibold px-4 sm:px-6 py-3 rounded-lg hover:bg-green-600 transition">{t.home}</Link></div>
        ) : (
          <>
            <h1 className="text-xl sm:text-2xl sm:text-3xl font-bold mb-6 text-center text-gray-900">{t.title}</h1>
            {schritt === 1 && (
              <div className="space-y-5">
                <div><label className="block text-lg mb-2 text-gray-700">{t.step1date}</label><input type="date" value={datum} onChange={(e) => setDatum(e.target.value)} className="w-full p-4 rounded-lg bg-white border border-blue-200 text-gray-900 text-lg" required /></div>
                {datum && <div><label className="block text-lg mb-2 text-gray-700">{t.step1time}</label><div className="grid grid-cols-3 gap-2">{zeiten.map((z) => (<button key={z} onClick={() => setUhrzeit(z)} className={`p-3 rounded-lg text-lg border transition ${uhrzeit === z ? "bg-[#1E40AF] text-white border-[#1E40AF]" : "bg-white border-blue-200 text-gray-700 hover:border-[#3B82F6]"}`}>{z}</button>))}</div></div>}
                {datum && uhrzeit && <button onClick={() => setSchritt(2)} className="w-full bg-[#1E40AF] text-white text-xl font-semibold py-3 sm:py-4 rounded-lg hover:bg-green-600 transition">{t.next}</button>}
              </div>
            )}
            {schritt === 2 && (
              <form onSubmit={handleBuchen} className="space-y-5">
                <div><label className="block text-lg mb-2 text-gray-700">{t.step2name}</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-4 rounded-lg bg-white border border-blue-200 text-gray-900 text-lg" required /></div>
                <div><label className="block text-lg mb-2 text-gray-700">{t.step2email}</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-4 rounded-lg bg-white border border-blue-200 text-gray-900 text-lg" required /></div>
                <div><label className="block text-lg mb-2 text-gray-700">{t.step2phone}</label><input type="tel" value={telefon} onChange={(e) => setTelefon(e.target.value)} className="w-full p-4 rounded-lg bg-white border border-blue-200 text-gray-900 text-lg" /></div>
                <div className="flex gap-3"><button type="button" onClick={() => setSchritt(1)} className="bg-gray-200 text-gray-700 px-4 sm:px-6 py-3 sm:py-4 rounded-lg hover:bg-gray-300 transition">{t.back}</button><button type="submit" className="flex-1 bg-[#3B82F6] text-white text-xl font-semibold py-3 sm:py-4 rounded-lg hover:bg-blue-600 transition">{t.book}</button></div>
              </form>
            )}
          </>
        )}
        <div className="mt-6 text-center"><Link href="/" className="text-[#3B82F6] hover:text-blue-600 underline text-lg">{t.return}</Link></div>
      </div>
    </main>
  )
}
