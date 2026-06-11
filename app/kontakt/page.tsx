"use client"
import { useState, useEffect } from "react"
import Link from "next/link"

const texts: Record<string, any> = {
  de: { title: "Kontakt", name: "Name", email: "E-Mail", message: "Nachricht", send: "Nachricht senden", sent: "Nachricht gesendet! Wir melden uns innerhalb von 24 Stunden.", back: "← Zurück", info: "Oder direkt:", phone: "Telefon: +49 (0) 6721 9875872", mail: "E-Mail info@praxisonline24.com" },
  en: { title: "Contact", name: "Name", email: "Email", message: "Message", send: "Send Message", sent: "Message sent! We will get back to you within 24 hours.", back: "← Back", info: "Or directly:", phone: "Phone +49 (0) 6721 9875872", mail: "Email info@praxisonline24.com" },
  fr: { title: "Contact", name: "Nom", email: "E-mail", message: "Message", send: "Envoyer", sent: "Message envoyé !", back: "← Retour", info: "Ou directement :", phone: "Téléphone +49 (0) 6721 9875872", mail: "E-mail info@praxisonline24.com" },
  es: { title: "Contacto", name: "Nombre", email: "Correo", message: "Mensaje", send: "Enviar", sent: "¡Mensaje enviado!", back: "← Volver", info: "O directamente:", phone: "Teléfono +49 (0) 6721 9875872", mail: "Correo info@praxisonline24.com" },
  it: { title: "Contatto", name: "Nome", email: "Email", message: "Messaggio", send: "Invia", sent: "Messaggio inviato!", back: "← Indietro", info: "O direttamente:", phone: "Telefono +49 (0) 6721 9875872", mail: "Email info@praxisonline24.com" },
  pt: { title: "Contato", name: "Nome", email: "E-mail", message: "Mensagem", send: "Enviar", sent: "Mensagem enviada!", back: "← Voltar", info: "Ou diretamente:", phone: "Telefone +49 (0) 6721 9875872", mail: "E-mail info@praxisonline24.com" },
  nl: { title: "Contact", name: "Naam", email: "E-mail", message: "Bericht", send: "Verstuur", sent: "Bericht verstuurd!", back: "← Terug", info: "Of direct:", phone: "Telefoon +49 (0) 6721 9875872", mail: "E-mail info@praxisonline24.com" },
  pl: { title: "Kontakt", name: "Imię", email: "E-mail", message: "Wiadomość", send: "Wyślij", sent: "Wiadomość wysłana!", back: "← Wróć", info: "Lub bezpośrednio:", phone: "Telefon +49 (0) 6721 9875872", mail: "E-mail info@praxisonline24.com" },
  tr: { title: "İletişim", name: "İsim", email: "E-posta", message: "Mesaj", send: "Gönder", sent: "Mesaj gönderildi!", back: "← Geri", info: "Veya doğrudan:", phone: "Telefon +49 (0) 6721 9875872", mail: "E-posta info@praxisonline24.com" },
  ja: { title: "お問い合わせ", name: "名前", email: "メール", message: "メッセージ", send: "送信", sent: "送信されました！", back: "← 戻る", info: "または直接：", phone: "電話 +49 (0) 6721 9875872", mail: "メール info@praxisonline24.com" },
  zh: { title: "联系我们", name: "姓名", email: "邮箱", message: "留言", send: "发送", sent: "已发送！", back: "← 返回", info: "或直接：", phone: "电话 +49 (0) 6721 9875872", mail: "邮箱 info@praxisonline24.com" },
  cs: { title: "Kontakt", name: "Jméno", email: "E-mail", message: "Zpráva", send: "Odeslat", sent: "Zpráva odeslána!", back: "← Zpět", info: "Nebo přímo:", phone: "Telefon +49 (0) 6721 9875872, mail: "E-mail info@praxisonline24.com" },
  sk: { title: "Kontakt", name: "Meno", email: "E-mail", message: "Správa", send: "Odoslať", sent: "Správa odoslaná!", back: "← Späť", info: "Alebo priamo:", phone: "Telefón +49 (0) 6721 9875872", mail: "E-mail info@praxisonline24.com" },
  sl: { title: "Kontakt", name: "Ime", email: "E-pošta", message: "Sporočilo", send: "Pošlji", sent: "Sporočilo poslano!", back: "← Nazaj", info: "Ali neposredno:", phone: "Telefon +49 (0) 6721 9875872", mail: "E-pošta info@praxisonline24.com" },
  sv: { title: "Kontakt", name: "Namn", email: "E-post", message: "Meddelande", send: "Skicka", sent: "Meddelande skickat!", back: "← Tillbaka", info: "Eller direkt:", phone: "Telefon +49 (0) 6721 9875872", mail: "E-post info@praxisonline24.com" },
  no: { title: "Kontakt", name: "Navn", email: "E-post", message: "Melding", send: "Send", sent: "Melding sendt!", back: "← Tilbake", info: "Eller direkte:", phone: "Telefon +49 (0) 6721 9875872", mail: "E-post info@praxisonline24.com" },
  da: { title: "Kontakt", name: "Navn", email: "E-mail", message: "Besked", send: "Send", sent: "Besked sendt!", back: "← Tilbage", info: "Eller direkte:", phone: "Telefon +49 (0) 6721 9875872", mail: "E-mail info@praxisonline24.com" },
}

export default function Kontakt() {
  const [lang, setLang] = useState("de")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [sent, setSent] = useState(false)
  useEffect(() => {
    const p = new URLSearchParams(window.location.search)
    const ul = p.get("setLang")
    const stored = ul || localStorage.getItem("lang")
    if (stored && texts[stored]) setLang(stored)
    else setLang("en")
  }, [])
  const t = texts[lang] || texts.en

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSent(true)
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4 sm:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white border border-blue-200 shadow-sm rounded-xl p-6 sm:p-10">
          <h1 className="text-2xl sm:text-4xl font-bold mb-6 sm:mb-8 text-center text-gray-900">{t.title}</h1>
          {!sent ? (
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              <div><label className="block text-base sm:text-lg mb-2 text-gray-700">{t.name}</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-3 sm:p-4 rounded-lg bg-white border border-blue-200 text-gray-900 text-sm sm:text-lg" required /></div>
              <div><label className="block text-base sm:text-lg mb-2 text-gray-700">{t.email}</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3 sm:p-4 rounded-lg bg-white border border-blue-200 text-gray-900 text-sm sm:text-lg" required /></div>
              <div><label className="block text-base sm:text-lg mb-2 text-gray-700">{t.message}</label><textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} className="w-full p-3 sm:p-4 rounded-lg bg-white border border-blue-200 text-gray-900 text-sm sm:text-lg" required /></div>
              <button type="submit" className="w-full bg-[#1E40AF] text-white text-base sm:text-xl font-semibold py-3 sm:py-4 rounded-lg hover:bg-green-600 transition">{t.send}</button>
            </form>
          ) : (
            <div className="text-center"><p className="text-lg sm:text-xl text-[#1E40AF] font-semibold">{t.sent}</p></div>
          )}
          <div className="mt-8 sm:mt-10 pt-6 sm:pt-8 border-t border-blue-100 text-center text-gray-500 text-sm sm:text-base">
            <p className="mb-2">{t.info}</p>
            <p>📞 +49 (0) 6721 9875872</p>
            <p>✉️ info@praxisonline.com</p>
          </div>
        </div>
        <div className="mt-6 text-center"><Link href="/" className="text-[#3B82F6] hover:text-blue-600 underline text-base sm:text-lg">{t.back}</Link></div>
      </div>
    </main>
  )
}
