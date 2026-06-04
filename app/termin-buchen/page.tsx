"use client"
import { useState } from "react"
import Link from "next/link"

type Step = "search" | "doctor" | "time" | "guest" | "confirm"

const practices = [
  { id: 1, name: "Hausarztpraxis Dr. Schmidt", city: "Berlin", type: "Hausarzt" },
  { id: 2, name: "Zahnarztpraxis Dr. Weber", city: "München", type: "Zahnarzt" },
  { id: 3, name: "Gemeinschaftspraxis Müller & Müller", city: "Hamburg", type: "Allgemeinmedizin" },
]

const doctors = [
  { id: 1, name: "Dr. Anna Schmidt", practice: "Hausarztpraxis Dr. Schmidt", reasons: ["Vorsorge", "Erkältung", "Impfung", "Folgetermin"] },
  { id: 2, name: "Dr. Thomas Weber", practice: "Zahnarztpraxis Dr. Weber", reasons: ["Zahnreinigung", "Schmerzen", "Kontrolle"] },
  { id: 3, name: "Dr. Lisa Müller", practice: "Gemeinschaftspraxis Müller & Müller", reasons: ["Ersttermin", "Chronische Erkrankung", "Beratung"] },
]

const timeSlots = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30"]

export default function TerminBuchen() {
  const [step, setStep] = useState<Step>("search")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedPractice, setSelectedPractice] = useState<any>(null)
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null)
  const [selectedReason, setSelectedReason] = useState("")
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedTime, setSelectedTime] = useState("")
  const [bookingType, setBookingType] = useState<"guest" | "account" | null>(null)
  const [patientName, setPatientName] = useState("")
  const [patientEmail, setPatientEmail] = useState("")
  const [patientPhone, setPatientPhone] = useState("")
  const [bookingConfirmed, setBookingConfirmed] = useState(false)

  const filteredPractices = practices.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.type.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const resetBooking = () => {
    setStep("search")
    setSelectedPractice(null)
    setSelectedDoctor(null)
    setSelectedReason("")
    setSelectedDate("")
    setSelectedTime("")
    setBookingType(null)
    setPatientName("")
    setPatientEmail("")
    setPatientPhone("")
    setBookingConfirmed(false)
  }

  if (bookingConfirmed) {
    return (
      <main className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">✅</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Buchung bestätigt!</h1>
          <p className="text-gray-500 mb-4">
            Ihr Termin bei {selectedDoctor?.name} am {selectedDate} um {selectedTime} Uhr wurde reserviert.
          </p>
          <p className="text-sm text-gray-400 mb-6">
            {bookingType === "guest" 
              ? "Sie erhalten in Kürze eine Bestätigungs- und eine Erinnerungs-E-Mail."
              : "Sie erhalten eine Bestätigungs-E-Mail. Melden Sie sich in Ihrem Konto an, um den Termin zu verwalten."}
          </p>
          {bookingType === "account" && (
            <Link href="/login" className="inline-block bg-[#1E40AF] text-white px-6 py-2 rounded-lg hover:bg-blue-800 transition mb-4">
              Zum Login
            </Link>
          )}
          <div>
            <button onClick={resetBooking} className="text-sm text-[#1E40AF] underline">Neue Buchung</button>
          </div>
          <div className="mt-4">
            <Link href="/" className="text-sm text-gray-500 underline">← Zurück zur Startseite</Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">← Zurück</Link>
          <div className="text-sm text-gray-400">Demo-Buchung • keine echten Daten</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-[#1E40AF] to-[#3B82F6] px-6 py-4">
            <h1 className="text-xl font-bold text-white">Termin buchen</h1>
            <p className="text-blue-100 text-sm mt-1">In wenigen Schritten zum Wunschtermin</p>
          </div>

          <div className="p-6">
            <div className="flex justify-between mb-8 border-b pb-4">
              {[
                { step: "search", label: "Praxis suchen" },
                { step: "doctor", label: "Arzt & Terminart" },
                { step: "time", label: "Zeitfenster" },
                { step: "guest", label: "Ihre Daten" },
                { step: "confirm", label: "Bestätigung" },
              ].map((s, i) => (
                <div key={s.step} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                    step === s.step ? "bg-[#1E40AF] text-white" : 
                    (step !== "search" && i < ["search","doctor","time","guest","confirm"].indexOf(step) ? "bg-green-500 text-white" : "bg-gray-200 text-gray-500")
                  }`}>{i + 1}</div>
                  <span className={`ml-2 text-sm hidden sm:block ${step === s.step ? "font-semibold text-gray-900" : "text-gray-500"}`}>{s.label}</span>
                  {i < 4 && <div className="w-8 h-px bg-gray-300 mx-2 hidden sm:block"></div>}
                </div>
              ))}
            </div>

            {step === "search" && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">1. Arzt oder Praxis suchen</h2>
                <input
                  type="text"
                  placeholder="Praxisname, Fachrichtung oder Ort..."
                  className="w-full p-3 border border-gray-300 rounded-lg mb-4"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <div className="space-y-2">
                    {filteredPractices.map(practice => (
                      <button
                        key={practice.id}
                        onClick={() => { setSelectedPractice(practice); setStep("doctor") }}
                        className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                      >
                        <p className="font-medium text-gray-900">{practice.name}</p>
                        <p className="text-sm text-gray-500">{practice.city} · {practice.type}</p>
                      </button>
                    ))}
                  </div>
                )}
                {!searchTerm && (
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm text-blue-700">🔍 Beispiele: "Berlin", "Hausarzt", "Zahnarzt", "München"</p>
                  </div>
                )}
              </div>
            )}

            {step === "doctor" && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">2. Arzt und Besuchsgrund wählen</h2>
                <div className="space-y-3 mb-4">
                  {doctors.map(doctor => (
                    <button
                      key={doctor.id}
                      onClick={() => setSelectedDoctor(doctor)}
                      className={`w-full text-left p-3 border rounded-lg transition ${
                        selectedDoctor?.id === doctor.id ? "border-[#1E40AF] bg-blue-50" : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <p className="font-medium text-gray-900">{doctor.name}</p>
                      <p className="text-sm text-gray-500">{doctor.practice}</p>
                    </button>
                  ))}
                </div>
                {selectedDoctor && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Besuchsgrund</label>
                    <select
                      className="w-full p-3 border border-gray-300 rounded-lg"
                      value={selectedReason}
                      onChange={(e) => setSelectedReason(e.target.value)}
                    >
                      <option value="">Bitte wählen</option>
                      {selectedDoctor.reasons.map((reason: string) => (
                        <option key={reason} value={reason}>{reason}</option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="flex justify-between mt-6">
                  <button onClick={() => setStep("search")} className="text-gray-500">← Zurück</button>
                  <button
                    onClick={() => selectedDoctor && selectedReason && setStep("time")}
                    disabled={!selectedDoctor || !selectedReason}
                    className={`px-6 py-2 rounded-lg transition ${
                      selectedDoctor && selectedReason ? "bg-[#1E40AF] text-white hover:bg-blue-800" : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    Weiter →
                  </button>
                </div>
              </div>
            )}

            {step === "time" && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">3. Zeitfenster auswählen</h2>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Datum</label>
                  <input
                    type="date"
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                {selectedDate && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Verfügbare Uhrzeiten</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {timeSlots.map(time => (
                        <button
                          key={time}
                          onClick={() => setSelectedTime(time)}
                          className={`p-2 rounded-lg border transition ${
                            selectedTime === time ? "bg-[#1E40AF] text-white border-[#1E40AF]" : "border-gray-200 hover:bg-gray-50"
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex justify-between mt-6">
                  <button onClick={() => setStep("doctor")} className="text-gray-500">← Zurück</button>
                  <button
                    onClick={() => selectedDate && selectedTime && setStep("guest")}
                    disabled={!selectedDate || !selectedTime}
                    className={`px-6 py-2 rounded-lg transition ${
                      selectedDate && selectedTime ? "bg-[#1E40AF] text-white hover:bg-blue-800" : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    Weiter →
                  </button>
                </div>
              </div>
            )}

            {step === "guest" && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">4. Ihre Daten</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Vollständiger Name *</label>
                    <input
                      type="text"
                      className="w-full p-3 border border-gray-300 rounded-lg"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      placeholder="z.B. Anna Schmidt"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">E-Mail *</label>
                    <input
                      type="email"
                      className="w-full p-3 border border-gray-300 rounded-lg"
                      value={patientEmail}
                      onChange={(e) => setPatientEmail(e.target.value)}
                      placeholder="ihre@email.de"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Telefon (optional)</label>
                    <input
                      type="tel"
                      className="w-full p-3 border border-gray-300 rounded-lg"
                      value={patientPhone}
                      onChange={(e) => setPatientPhone(e.target.value)}
                      placeholder="Für Erinnerungen"
                    />
                  </div>

                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <p className="text-sm text-gray-600 mb-3">Möchten Sie ein Konto für zukünftige Buchungen?</p>
                    <div className="flex gap-4">
                      <button
                        onClick={() => setBookingType("guest")}
                        className={`flex-1 p-3 border rounded-lg text-center transition ${
                          bookingType === "guest" ? "border-[#1E40AF] bg-blue-50" : "border-gray-200"
                        }`}
                      >
                        🔓 Als Gast buchen
                        <p className="text-xs text-gray-400 mt-1">Kein Konto nötig</p>
                      </button>
                      <button
                        onClick={() => setBookingType("account")}
                        className={`flex-1 p-3 border rounded-lg text-center transition ${
                          bookingType === "account" ? "border-[#1E40AF] bg-blue-50" : "border-gray-200"
                        }`}
                      >
                        🔐 Konto erstellen / Anmelden
                        <p className="text-xs text-gray-400 mt-1">Für wiederkehrende Termine</p>
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between mt-6">
                  <button onClick={() => setStep("time")} className="text-gray-500">← Zurück</button>
                  <button
                    onClick={() => patientName && patientEmail && bookingType && setStep("confirm")}
                    disabled={!patientName || !patientEmail || !bookingType}
                    className={`px-6 py-2 rounded-lg transition ${
                      patientName && patientEmail && bookingType ? "bg-[#1E40AF] text-white hover:bg-blue-800" : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    Weiter →
                  </button>
                </div>
              </div>
            )}

            {step === "confirm" && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">5. Buchung bestätigen</h2>
                <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-2">
                  <p><strong>Praxis:</strong> {selectedPractice?.name}</p>
                  <p><strong>Arzt:</strong> {selectedDoctor?.name}</p>
                  <p><strong>Besuchsgrund:</strong> {selectedReason}</p>
                  <p><strong>Termin:</strong> {selectedDate} um {selectedTime} Uhr</p>
                  <p><strong>Patient:</strong> {patientName} ({patientEmail})</p>
                  <p><strong>Buchungsart:</strong> {bookingType === "guest" ? "Als Gast" : "Mit Konto"}</p>
                </div>
                <div className="flex justify-between mt-6">
                  <button onClick={() => setStep("guest")} className="text-gray-500">← Zurück</button>
                  <button
                    onClick={() => setBookingConfirmed(true)}
                    className="px-6 py-2 rounded-lg bg-[#1E40AF] text-white hover:bg-blue-800 transition"
                  >
                    Buchung bestätigen →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <p className="text-sm text-blue-700">💡 Das ist eine interaktive Demo. Es werden keine echten Daten gespeichert.</p>
        </div>
      </div>
    </main>
  )
}
