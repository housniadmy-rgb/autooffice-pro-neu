"use client"
import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"

const texts: Record<string, any> = {
  de: { ueberUns: "Über uns", kontakt: "Kontakt", blog: "Blog", dsgvo: "Datenschutz", impressum: "Impressum", admin: "Admin" },
  en: { ueberUns: "About", kontakt: "Contact", blog: "Blog", dsgvo: "Privacy", impressum: "Imprint", admin: "Admin" },
  fr: { ueberUns: "À propos", kontakt: "Contact", blog: "Blog", dsgvo: "Confidentialité", impressum: "Mentions légales", admin: "Admin" },
  es: { ueberUns: "Sobre nosotros", kontakt: "Contacto", blog: "Blog", dsgvo: "Privacidad", impressum: "Aviso legal", admin: "Admin" },
  it: { ueberUns: "Chi siamo", kontakt: "Contatto", blog: "Blog", dsgvo: "Privacy", impressum: "Note legali", admin: "Admin" },
  pt: { ueberUns: "Sobre nós", kontakt: "Contato", blog: "Blog", dsgvo: "Privacidade", impressum: "Aviso legal", admin: "Admin" },
  nl: { ueberUns: "Over ons", kontakt: "Contact", blog: "Blog", dsgvo: "Privacy", impressum: "Colofon", admin: "Admin" },
  pl: { ueberUns: "O nas", kontakt: "Kontakt", blog: "Blog", dsgvo: "Prywatność", impressum: "Impressum", admin: "Admin" },
  tr: { ueberUns: "Hakkımızda", kontakt: "İletişim", blog: "Blog", dsgvo: "Gizlilik", impressum: "Künye", admin: "Admin" },
  cs: { ueberUns: "O nás", kontakt: "Kontakt", blog: "Blog", dsgvo: "Ochrana údajů", impressum: "Impresum", admin: "Admin" },
  sk: { ueberUns: "O nás", kontakt: "Kontakt", blog: "Blog", dsgvo: "Ochrana údajov", impressum: "Impresum", admin: "Admin" },
  sl: { ueberUns: "O nas", kontakt: "Kontakt", blog: "Blog", dsgvo: "Zasebnost", impressum: "Impresum", admin: "Admin" },
  sv: { ueberUns: "Om oss", kontakt: "Kontakt", blog: "Blogg", dsgvo: "Integritet", impressum: "Impressum", admin: "Admin" },
  no: { ueberUns: "Om oss", kontakt: "Kontakt", blog: "Blogg", dsgvo: "Personvern", impressum: "Impressum", admin: "Admin" },
  da: { ueberUns: "Om os", kontakt: "Kontakt", blog: "Blog", dsgvo: "Privatliv", impressum: "Impressum", admin: "Admin" },
  ar: { ueberUns: "من نحن", kontakt: "اتصل بنا", blog: "المدونة", dsgvo: "الخصوصية", impressum: "بصمة", admin: "المشرف" },
  zh: { ueberUns: "关于我们", kontakt: "联系我们", blog: "博客", dsgvo: "隐私", impressum: "法律声明", admin: "管理" },
  ja: { ueberUns: "会社概要", kontakt: "お問い合わせ", blog: "ブログ", dsgvo: "プライバシー", impressum: "法的情報", admin: "管理" },
}

export default function Footer() {
  const [lang, setLang] = useState("de")
  const pathname = usePathname()

  useEffect(() => {
    const checkLang = () => {
      const stored = localStorage.getItem("lang")
      if (stored && texts[stored]) { setLang(stored); return }
      const browser = (navigator.language || "").split("-")[0]
      setLang(texts[browser] ? browser : "de")
    }
    checkLang()
    const interval = setInterval(checkLang, 500)
    return () => clearInterval(interval)
  }, [pathname])

  const t = texts[lang] || texts.de

  return (
    <footer className="text-center text-gray-500 text-sm sm:text-lg py-4 sm:py-6 border-t border-blue-200">
      <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 sm:gap-x-4 px-2">
        <a href="/ueber-uns" className="underline hover:text-[#3B82F6]">{t.ueberUns}</a>
        <a href="/kontakt" className="underline hover:text-[#3B82F6]">{t.kontakt}</a>
        <a href="/blog" className="underline hover:text-[#3B82F6]">{t.blog}</a>
        <a href="/datenschutz" className="underline hover:text-[#3B82F6]">{t.dsgvo}</a>
        <a href="/impressum" className="underline hover:text-[#3B82F6]">{t.impressum}</a>
        <a href="/admin" className="underline hover:text-[#3B82F6]">{t.admin}</a>
      </div>
    </footer>
  )
}
