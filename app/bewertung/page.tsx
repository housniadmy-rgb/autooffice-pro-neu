"use client"

import { useState } from "react"
import Link from "next/link"

export default function Bewertung() {
  const [rating, setRating] = useState(0)
  const [submitted, setSubmitted] = useState(false)

  const handleRating = (stars: number) => {
    setRating(stars)
    setSubmitted(true)
  }

  return (
    <main className="min-h-screen p-4 sm:p-8 flex items-center justify-center">
      <div className="bg-white border border-blue-200 p-6 sm:p-10 rounded-lg sm:rounded-xl max-w-full sm:max-w-lg w-full text-center">
        {!submitted ? (
          <>
            <h1 className="text-xl sm:text-2xl sm:text-3xl font-bold mb-4">Wie war Ihr Termin?</h1>
            <p className="text-lg text-gray-500 mb-8">Bitte bewerten Sie Ihre Erfahrung</p>
            <div className="flex justify-center gap-3 mb-8">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => handleRating(star)}
                  className="text-5xl hover:scale-125 transition transform"
                >
                  ⭐
                </button>
              ))}
            </div>
          </>
        ) : rating >= 4 ? (
          <div>
            <h2 className="text-xl sm:text-2xl sm:text-3xl font-bold mb-4 text-green-400">Vielen Dank!</h2>
            <p className="text-lg text-gray-600 mb-6">Bitte bewerten Sie uns auch auf Google:</p>
            <Link
              href="https://g.page/review/YOUR-GOOGLE-PLACE-ID"
              target="_blank"
              className="inline-block bg-[#1E40AF] text-white text-xl font-semibold px-8 py-3 sm:py-4 rounded-lg hover:bg-green-600 transition"
            >
              Auf Google bewerten
            </Link>
          </div>
        ) : rating === 3 ? (
          <div>
            <h2 className="text-xl sm:text-2xl sm:text-3xl font-bold mb-4 text-yellow-400">Danke für Ihr Feedback!</h2>
            <p className="text-lg text-gray-600 mb-6">Was können wir verbessern?</p>
            <textarea
              className="w-full p-4 rounded-lg bg-white border border-blue-200 text-gray-900 text-lg mb-4"
              rows={3}
              placeholder="Ihre Anregungen..."
            />
            <button className="bg-[#1E40AF] text-white text-xl font-semibold px-8 py-3 sm:py-4 rounded-lg hover:bg-green-600 transition">Senden</button>
          </div>
        ) : (
          <div>
            <h2 className="text-xl sm:text-2xl sm:text-3xl font-bold mb-4 text-red-400">Es tut uns leid!</h2>
            <p className="text-lg text-gray-600 mb-6">Bitte kontaktieren Sie uns direkt, damit wir das Problem lösen können.</p>
            <Link
              href="mailto:info@autooffice-pro.de"
              className="inline-block bg-[#1E40AF] text-white text-xl font-semibold px-8 py-3 sm:py-4 rounded-lg hover:bg-green-600 transition"
            >
              E-Mail senden
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}
