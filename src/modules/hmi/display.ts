// HMI - Human Machine Interface: Daten für die Anzeige
// Wie ein OP 77B Bedienpanel: Zeigt Informationen für den Benutzer

export const PRICE_IDS = {
  basic: "price_1TbIJtJXpW5OGkcsxEVvjPrN",
  pro: "price_1TbKJnJXpW5OGkcsatEt7BvH",
  business: "price_1TbKWFJXpW5OGkcsc7REeZaS",
}

export const PRICES = { basic: 39, pro: 79, business: 199 }

export const FEATURES_DE = {
  basic: ["Online-Terminbuchung", "E-Mail-Erinnerungen", "Bis 100 Patienten"],
  pro: ["Alles aus Basic", "Bewertungssteuerung", "Bis 500 Patienten"],
  business: ["Alles aus Pro", "Storno + Warteliste", "Unbegrenzt Patienten"],
}

export const FEATURES_EN = {
  basic: ["Online Booking", "Email Reminders", "Up to 100 Patients"],
  pro: ["Everything in Basic", "Review Management", "Up to 500 Patients"],
  business: ["Everything in Pro", "Cancellation + Waitlist", "Unlimited Patients"],
}
