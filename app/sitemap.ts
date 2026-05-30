import { MetadataRoute } from "next"

const PRAXEN = [
  "dr-mueller-berlin", "dr-dupont-paris", "dr-garcia-madrid", "dr-rossi-roma",
  "dr-smith-london", "dr-silva-lisboa", "dr-vandam-amsterdam", "dr-kowalski-warschau",
  "dr-yilmaz-istanbul", "dr-tanaka-tokio", "dr-wang-peking",
]

const LANGUAGES = ["de", "en", "fr", "es", "it", "pt", "nl", "pl", "tr", "ja", "zh", "cs", "sk", "sl", "sv", "no", "da"]

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://autooffice-pro-neu.vercel.app"
  const entries: MetadataRoute.Sitemap = []

  // Hauptseiten in allen Sprachen
  const pages = ["", "registrieren", "login", "termin-buchen", "praxen", "bewertung", "termin", "storno", "warteliste", "blog", "empfehlen", "newsletter", "datenschutz", "impressum"]
  
  for (const page of pages) {
    for (const lang of LANGUAGES) {
      entries.push({
        url: `${baseUrl}/${page}?setLang=${lang}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: page === "" ? 1 : 0.8,
      })
    }
  }

  // Praxis-Seiten in allen Sprachen
  for (const praxis of PRAXEN) {
    for (const lang of LANGUAGES) {
      entries.push({
        url: `${baseUrl}/praxis/${praxis}?setLang=${lang}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.9,
      })
    }
  }

  return entries
}
