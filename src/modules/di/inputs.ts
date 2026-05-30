import { supabaseRegister, supabaseLogin, resetPassword } from "../cp/communication"

export async function handleRegister(email: string, password: string, name: string) {
  const data = await supabaseRegister(email, password, name)
  return { success: !data.msg, data }
}

export async function handleLogin(email: string, password: string) {
  const data = await supabaseLogin(email, password)
  return { success: !!data.access_token, data }
}

export async function handlePasswordReset(email: string) {
  const ok = await resetPassword(email)
  return { success: ok }
}

export async function handleTerminBuchen(email: string, datum: string, uhrzeit: string) {
  return { success: true, email, datum, uhrzeit }
}

export async function handleBewertung(rating: number, text: string) {
  return {
    success: true,
    action: rating >= 4 ? "google" : rating >= 3 ? "feedback" : "support",
    message: rating >= 4 ? "Vielen Dank!" : rating >= 3 ? "Was können wir verbessern?" : "Bitte kontaktieren Sie uns."
  }
}
