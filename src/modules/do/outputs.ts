import { sendEmail } from "../cp/communication"
import { CONFIG } from "../ps/config"

export async function sendTerminBestaetigung(email: string, datum: string, uhrzeit: string) {
  const html = `<h1>✅ Termin bestätigt!</h1><p><strong>${datum}</strong> um <strong>${uhrzeit} Uhr</strong></p><a href="${CONFIG.APP_URL}/storno">Termin stornieren</a>`
  await sendEmail(email, "Termin bestätigt - " + CONFIG.COMPANY, html)
}

export async function sendBewertungsLink(email: string) {
  const html = `<h1>⭐ Wie war Ihr Termin?</h1><a href="${CONFIG.APP_URL}/bewertung">Jetzt bewerten</a>`
  await sendEmail(email, "Ihre Bewertung - " + CONFIG.COMPANY, html)
}

export async function sendWartelistenBenachrichtigung(email: string, datum: string, uhrzeit: string) {
  const html = `<h1>📋 Ein Termin ist frei!</h1><p>${datum} um ${uhrzeit} Uhr</p><a href="${CONFIG.APP_URL}/termin-buchen">Termin übernehmen</a>`
  await sendEmail(email, "Freier Termin - " + CONFIG.COMPANY, html)
}
