// CP - Kommunikationsmodul: Verbindet alle externen Systeme
// Wie der CP 343-1 im S7-300: Vernetzung mit der Außenwelt
import { CONFIG } from "../ps/config"

// Stripe Checkout Session erstellen
export async function stripeCheckout(priceId: string, origin: string) {
  const Stripe = (await import("stripe")).default
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "")
  return stripe.checkout.sessions.create({
    line_items: [{ price: priceId, quantity: 1 }],
    mode: "subscription",
    success_url: `${origin}/dashboard?success=true`,
    cancel_url: `${origin}/?canceled=true`,
  })
}

// Brevo E-Mail senden
export async function sendEmail(to: string, subject: string, html: string) {
  return fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: { "Content-Type": "application/json", "api-key": process.env.BREVO_API_KEY || "" },
    body: JSON.stringify({
      sender: { email: CONFIG.CEO_EMAIL, name: CONFIG.COMPANY },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    }),
  })
}

// Supabase: Registrieren
export async function supabaseRegister(email: string, password: string, name: string) {
  const res = await fetch(`${CONFIG.SUPABASE_URL}/auth/v1/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "apikey": CONFIG.SUPABASE_KEY },
    body: JSON.stringify({ email, password, data: { name } }),
  })
  return res.json()
}

// Supabase: Login
export async function supabaseLogin(email: string, password: string) {
  const res = await fetch(`${CONFIG.SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "apikey": CONFIG.SUPABASE_KEY },
    body: JSON.stringify({ email, password }),
  })
  return res.json()
}

// Supabase: Nutzerliste
export async function getUsers() {
  const res = await fetch(`${CONFIG.SUPABASE_URL}/auth/v1/users`, {
    headers: { "apikey": CONFIG.SUPABASE_KEY, "Authorization": `Bearer ${CONFIG.SUPABASE_KEY}` },
  })
  return res.json()
}

// Supabase: Passwort zurücksetzen
export async function resetPassword(email: string) {
  const res = await fetch(`${CONFIG.SUPABASE_URL}/auth/v1/recover`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "apikey": CONFIG.SUPABASE_KEY },
    body: JSON.stringify({ email }),
  })
  return res.ok
}
