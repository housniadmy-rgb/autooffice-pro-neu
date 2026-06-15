"use client"
import { useState, useEffect } from "react"
import Link from "next/link"

const texts: Record<string, Record<string, string>> = {
  de: {
    title: "Preise",
    subtitle: "1 Monat kostenlos testen – danach flexibel monatlich kündbar",
    basic: "Basic",
    pro: "Pro",
    business: "Business",
    perMonth: "/Monat",
    basic1: "Online-Terminbuchung",
    basic2: "E-Mail-Erinnerungen",
    basic3: "Für kleine Praxen",
    pro1: "Alles aus Basic",
    pro2: "Bewertungssteuerung",
    pro3: "Für wachsende Praxen",
    bus1: "Alles aus Pro",
    bus2: "Storno + Warteliste",
    bus3: "Für größere Praxen",
    start: "Kostenlos starten",
    freeMonth: "1 Monat kostenlos",
    allInclude: "Alle Tarife enthalten:",
    include1: "Unbegrenzte Terminbuchungen",
    include2: "E-Mail-Erinnerungen",
    include3: "DSGVO-konform",
    include4: "SSL-Verschlüsselung",
    include5: "Kostenlose Updates",
    faqTitle: "Häufige Fragen",
    faq1q: "Ist der erste Monat wirklich kostenlos?",
    faq1a: "Ja! Sie können alle Funktionen 1 Monat lang unverbindlich testen. Keine versteckten Kosten.",
    faq2q: "Kann ich jederzeit kündigen?",
    faq2a: "Ja, die Kündigung ist monatlich möglich. Es gibt keine langen Vertragslaufzeiten.",
    faq3q: "Welche Praxis-Software wird unterstützt?",
    faq3a: "PraxisOnline24 funktioniert mit allen gängigen Praxisverwaltungssystemen in Deutschland.",
    trustTitle: "Ihre Daten sind sicher",
    back: "← Zurück zur Startseite",
  },
  en: {
    title: "Pricing",
    subtitle: "Try free for 1 month – then flexible monthly cancellation",
    basic: "Basic",
    pro: "Pro",
    business: "Business",
    perMonth: "/month",
    basic1: "Online Booking",
    basic2: "Email Reminders",
    basic3: "For small practices",
    pro1: "Everything from Basic",
    pro2: "Review Management",
    pro3: "For growing practices",
    bus1: "Everything from Pro",
    bus2: "Cancellation + waitlist",
    bus3: "For larger practices",
    start: "Start free",
    freeMonth: "1 month free",
    allInclude: "All plans include:",
    include1: "Unlimited bookings",
    include2: "Email reminders",
    include3: "GDPR compliant",
    include4: "SSL encryption",
    include5: "Free updates",
    faqTitle: "Frequently Asked Questions",
    faq1q: "Is the first month really free?",
    faq1a: "Yes! You can test all features for 1 month with no obligation. No hidden costs.",
    faq2q: "Can I cancel at any time?",
    faq2a: "Yes, cancellation is possible monthly. There are no long contract terms.",
    faq3q: "Which practice software is supported?",
    faq3a: "PraxisOnline24 works with all common practice management systems.",
    trustTitle: "Your data is safe",
    back: "← Back to home",
  },
  fr: {
    title: "Tarifs",
    subtitle: "1 mois d'essai gratuit – puis résiliation flexible mensuelle",
    basic: "Basique",
    pro: "Professionnel",
    business: "Entreprise",
    perMonth: "/mois",
    basic1: "Rendez-vous en ligne",
    basic2: "Rappels email",
    basic3: "Pour petits cabinets",
    pro1: "Tout de Basique",
    pro2: "Gestion des avis",
    pro3: "Pour cabinets en croissance",
    bus1: "Tout de Pro",
    bus2: "Annulation + liste d'attente",
    bus3: "Pour grands cabinets",
    start: "Démarrer gratuitement",
    freeMonth: "1 mois gratuit",
    allInclude: "Tous les tarifs incluent :",
    include1: "Réservations illimitées",
    include2: "Rappels par e-mail",
    include3: "Conforme RGPD",
    include4: "Cryptage SSL",
    include5: "Mises à jour gratuites",
    faqTitle: "Questions fréquentes",
    faq1q: "Le premier mois est-il vraiment gratuit ?",
    faq1a: "Oui ! Vous pouvez tester toutes les fonctions pendant 1 mois sans engagement. Pas de frais cachés.",
    faq2q: "Puis-je annuler à tout moment ?",
    faq2a: "Oui, l'annulation est possible mensuellement. Il n'y a pas de longs termes contractuels.",
    faq3q: "Quel logiciel médical est supporté ?",
    faq3a: "PraxisOnline24 fonctionne avec tous les systèmes de gestion de cabinet courants.",
    trustTitle: "Vos données sont en sécurité",
    back: "← Retour à l'accueil",
  },
  es: {
    title: "Precios",
    subtitle: "1 mes de prueba gratis – cancelación flexible mensual",
    basic: "Básico",
    pro: "Profesional",
    business: "Empresa",
    perMonth: "/mes",
    basic1: "Reservas online",
    basic2: "Recordatorios email",
    basic3: "Para pequeños consultorios",
    pro1: "Todo de Básico",
    pro2: "Gestión de opiniones",
    pro3: "Para consultorios en crecimiento",
    bus1: "Todo de Pro",
    bus2: "Cancelación + lista de espera",
    bus3: "Para grandes consultorios",
    start: "Comenzar gratis",
    freeMonth: "1 mes gratis",
    allInclude: "Todos los planes incluyen:",
    include1: "Reservas ilimitadas",
    include2: "Recordatorios por email",
    include3: "Conforme RGPD",
    include4: "Cifrado SSL",
    include5: "Actualizaciones gratuitas",
    faqTitle: "Preguntas frecuentes",
    faq1q: "¿El primer mes es realmente gratis?",
    faq1a: "¡Sí! Puede probar todas las funciones durante 1 mes sin compromiso. Sin costes ocultos.",
    faq2q: "¿Puedo cancelar en cualquier momento?",
    faq2a: "Sí, la cancelación es posible mensualmente. No hay plazos contractuales largos.",
    faq3q: "¿Qué software médico es compatible?",
    faq3a: "PraxisOnline24 funciona con todos los sistemas de gestión de consultorios habituales.",
    trustTitle: "Sus datos están seguros",
    back: "← Volver al inicio",
  },
  it: {
    title: "Prezzi",
    subtitle: "1 mese di prova gratuita – poi disdetta mensile flessibile",
    basic: "Base",
    pro: "Professionale",
    business: "Azienda",
    perMonth: "/mese",
    basic1: "Prenotazioni online",
    basic2: "Promemoria email",
    basic3: "Per piccoli studi",
    pro1: "Tutto di Base",
    pro2: "Gestione recensioni",
    pro3: "Per studi in crescita",
    bus1: "Tutto di Pro",
    bus2: "Cancellazione + lista d'attesa",
    bus3: "Per grandi studi",
    start: "Inizia gratis",
    freeMonth: "1 mese gratis",
    allInclude: "Tutti i piani includono:",
    include1: "Prenotazioni illimitate",
    include2: "Promemoria email",
    include3: "Conforme GDPR",
    include4: "Crittografia SSL",
    include5: "Aggiornamenti gratuiti",
    faqTitle: "Domande frequenti",
    faq1q: "Il primo mese è davvero gratis?",
    faq1a: "Sì! Puoi testare tutte le funzioni per 1 mese senza impegno. Nessun costo nascosto.",
    faq2q: "Posso cancellare in qualsiasi momento?",
    faq2a: "Sì, la cancellazione è possibile mensilmente. Non ci sono lunghi termini contrattuali.",
    faq3q: "Quale software medico è supportato?",
    faq3a: "PraxisOnline24 funziona con tutti i comuni sistemi di gestione degli studi medici.",
    trustTitle: "I vostri dati sono al sicuro",
    back: "← Torna alla home",
  },
  pt: {
    title: "Preços",
    subtitle: "1 mês grátis para testar – cancelamento mensal flexível",
    basic: "Básico",
    pro: "Profissional",
    business: "Empresa",
    perMonth: "/mês",
    basic1: "Agendamento online",
    basic2: "Lembretes email",
    basic3: "Para pequenas clínicas",
    pro1: "Tudo do Básico",
    pro2: "Gestão de avaliações",
    pro3: "Para clínicas em crescimento",
    bus1: "Tudo do Pro",
    bus2: "Cancelamento + lista de espera",
    bus3: "Para grandes clínicas",
    start: "Começar grátis",
    freeMonth: "1 mês grátis",
    allInclude: "Todos os planos incluem:",
    include1: "Reservas ilimitadas",
    include2: "Lembretes por email",
    include3: "Conforme RGPD",
    include4: "Criptografia SSL",
    include5: "Atualizações gratuitas",
    faqTitle: "Perguntas frequentes",
    faq1q: "O primeiro mês é mesmo grátis?",
    faq1a: "Sim! Pode testar todas as funções durante 1 mês sem compromisso. Sem custos ocultos.",
    faq2q: "Posso cancelar a qualquer momento?",
    faq2a: "Sim, o cancelamento é possível mensalmente. Não há prazos contratuais longos.",
    faq3q: "Que software médico é compatível?",
    faq3a: "O PraxisOnline24 funciona com todos os sistemas de gestão de consultórios comuns.",
    trustTitle: "Os seus dados estão seguros",
    back: "← Voltar ao início",
  },
  nl: {
    title: "Prijzen",
    subtitle: "1 maand gratis proberen – daarna flexibel maandelijks opzegbaar",
    basic: "Basis",
    pro: "Professioneel",
    business: "Zakelijk",
    perMonth: "/maand",
    basic1: "Online afspraken",
    basic2: "Email herinneringen",
    basic3: "Voor kleine praktijken",
    pro1: "Alles van Basis",
    pro2: "Beoordelingsbeheer",
    pro3: "Voor groeiende praktijken",
    bus1: "Alles van Pro",
    bus2: "Annulering + wachtlijst",
    bus3: "Voor grote praktijken",
    start: "Gratis starten",
    freeMonth: "1 maand gratis",
    allInclude: "Alle tarieven zijn inclusief:",
    include1: "Onbeperkt boekingen",
    include2: "E-mail herinneringen",
    include3: "AVG-conform",
    include4: "SSL-versleuteling",
    include5: "Gratis updates",
    faqTitle: "Veelgestelde vragen",
    faq1q: "Is de eerste maand echt gratis?",
    faq1a: "Ja! U kunt alle functies 1 maand zonder verplichtingen testen. Geen verborgen kosten.",
    faq2q: "Kan ik op elk moment annuleren?",
    faq2a: "Ja, opzegging is maandelijks mogelijk. Er zijn geen lange contractvoorwaarden.",
    faq3q: "Welke praktijksoftware wordt ondersteund?",
    faq3a: "PraxisOnline24 werkt met alle gangbare praktijkbeheersystemen.",
    trustTitle: "Uw gegevens zijn veilig",
    back: "← Terug naar home",
  },
  pl: {
    title: "Ceny",
    subtitle: "1 miesiąc za darmo – potem elastyczne miesięczne wypowiedzenie",
    basic: "Podstawowy",
    pro: "Profesjonalny",
    business: "Biznes",
    perMonth: "/miesiąc",
    basic1: "Rezerwacje online",
    basic2: "Przypomnienia email",
    basic3: "Dla małych praktyk",
    pro1: "Wszystko z Podstawowego",
    pro2: "Zarządzanie opiniami",
    pro3: "Dla rozwijających się praktyk",
    bus1: "Wszystko z Pro",
    bus2: "Anulowanie + lista oczekujących",
    bus3: "Dla dużych praktyk",
    start: "Zacznij za darmo",
    freeMonth: "1 miesiąc za darmo",
    allInclude: "Wszystkie plany obejmują:",
    include1: "Nieograniczone rezerwacje",
    include2: "Przypomnienia e-mail",
    include3: "Zgodność z RODO",
    include4: "Szyfrowanie SSL",
    include5: "Bezpłatne aktualizacje",
    faqTitle: "Często zadawane pytania",
    faq1q: "Czy pierwszy miesiąc jest naprawdę darmowy?",
    faq1a: "Tak! Możesz testować wszystkie funkcje przez 1 miesiąc bez zobowiązań. Żadnych ukrytych kosztów.",
    faq2q: "Czy mogę zrezygnować w dowolnym momencie?",
    faq2a: "Tak, rezygnacja jest możliwa co miesiąc. Nie ma długich terminów umownych.",
    faq3q: "Jakie oprogramowanie medyczne jest obsługiwane?",
    faq3a: "PraxisOnline24 działa ze wszystkimi popularnymi systemami zarządzania praktyką.",
    trustTitle: "Twoje dane są bezpieczne",
    back: "← Powrót do strony głównej",
  },
  tr: {
    title: "Fiyatlar",
    subtitle: "1 ay ücretsiz dene – sonra esnek aylık iptal",
    basic: "Temel",
    pro: "Profesyonel",
    business: "Kurumsal",
    perMonth: "/ay",
    basic1: "Online Randevu",
    basic2: "Email Hatırlatmalar",
    basic3: "Küçük pratikler için",
    pro1: "Temel'deki her şey",
    pro2: "Değerlendirme Yönetimi",
    pro3: "Büyüyen pratikler için",
    bus1: "Pro'daki her şey",
    bus2: "İptal + bekleme listesi",
    bus3: "Büyük pratikler için",
    start: "Ücretsiz başla",
    freeMonth: "1 ay ücretsiz",
    allInclude: "Tüm planlar şunları içerir:",
    include1: "Sınırsız randevu",
    include2: "E-posta hatırlatmaları",
    include3: "KVKK uyumlu",
    include4: "SSL şifreleme",
    include5: "Ücretsiz güncellemeler",
    faqTitle: "Sık Sorulan Sorular",
    faq1q: "İlk ay gerçekten ücretsiz mi?",
    faq1a: "Evet! Tüm özellikleri 1 ay boyunca yükümlülük olmadan test edebilirsiniz. Gizli maliyet yok.",
    faq2q: "İstediğim zaman iptal edebilir miyim?",
    faq2a: "Evet, iptal aylık olarak mümkündür. Uzun sözleşme koşulları yoktur.",
    faq3q: "Hangi muayenehane yazılımı destekleniyor?",
    faq3a: "PraxisOnline24 tüm yaygın muayenehane yönetim sistemleriyle çalışır.",
    trustTitle: "Verileriniz güvende",
        back: "← Ana sayfaya dön",
  },
  sl: {
    title: "Cene",
    subtitle: "1 mesec brezplačno – nato fleksibilno mesečno odpovedljivo",
    basic: "Osnovni",
    pro: "Profesionalni",
    business: "Poslovni",
    perMonth: "/mesec",
    basic1: "Spletno rezerviranje",
    basic2: "E-poštni opomniki",
    basic3: "Za majhne prakse",
    pro1: "Vse iz Osnovnega",
    pro2: "Upravljanje ocen",
    pro3: "Za rastoče prakse",
    bus1: "Vse iz Pro",
    bus2: "Odpoved + čakalni seznam",
    bus3: "Za večje prakse",
    start: "Začnite brezplačno",
    freeMonth: "1 mesec brezplačno",
    allInclude: "Vsi paketi vključujejo:",
    include1: "Neomejeno rezervacij",
    include2: "E-poštni opomniki",
    include3: "Skladno z GDPR",
    include4: "SSL šifriranje",
    include5: "Brezplačne posodobitve",
    faqTitle: "Pogosta vprašanja",
    faq1q: "Je prvi mesec res brezplačen?",
    faq1a: "Da! Vse funkcije lahko preizkušate 1 mesec brez obveznosti. Brez skritih stroškov.",
    faq2q: "Lahko kadar koli odpovem?",
    faq2a: "Da, odpoved je možna mesečno. Brez dolgih pogodbenih rokov.",
    faq3q: "Katera programska oprema je podprta?",
    faq3a: "PraxisOnline24 deluje z vsemi običajnimi sistemi za upravljanje praks.",
    trustTitle: "Vaši podatki so varni",
    back: "← Nazaj na začetno stran",
  },
  cs: {
    title: "Ceny",
    subtitle: "1 měsíc zdarma – poté flexibilní měsíční výpověď",
    basic: "Základní",
    pro: "Profesionální",
    business: "Firemní",
    perMonth: "/měsíc",
    basic1: "Online rezervace",
    basic2: "E-mailové připomínky",
    basic3: "Pro malé praxe",
    pro1: "Vše ze Základního",
    pro2: "Správa hodnocení",
    pro3: "Pro rostoucí praxe",
    bus1: "Vše z Pro",
    bus2: "Zrušení + čekací listina",
    bus3: "Pro větší praxe",
    start: "Začněte zdarma",
    freeMonth: "1 měsíc zdarma",
    allInclude: "Všechny tarify zahrnují:",
    include1: "Neomezené rezervace",
    include2: "E-mailové připomínky",
    include3: "V souladu s GDPR",
    include4: "SSL šifrování",
    include5: "Bezplatné aktualizace",
    faqTitle: "Časté dotazy",
    faq1q: "Je první měsíc opravdu zdarma?",
    faq1a: "Ano! Všechny funkce můžete 1 měsíc testovat bez závazků. Žádné skryté náklady.",
    faq2q: "Mohu kdykoli zrušit?",
    faq2a: "Ano, výpověď je možná měsíčně. Bez dlouhých smluvních podmínek.",
    faq3q: "Jaký software je podporován?",
    faq3a: "PraxisOnline24 funguje se všemi běžnými systémy pro správu praxí.",
    trustTitle: "Vaše data jsou v bezpečí",
    back: "← Zpět na domovskou stránku",
  },
  sk: {
    title: "Ceny",
    subtitle: "1 mesiac zadarmo – potom flexibilná mesačná výpoveď",
    basic: "Základný",
    pro: "Profesionálny",
    business: "Firemný",
    perMonth: "/mesiac",
    basic1: "Online rezervácie",
    basic2: "E-mailové pripomienky",
    basic3: "Pre malé praxe",
    pro1: "Všetko zo Základného",
    pro2: "Správa hodnotení",
    pro3: "Pre rastúce praxe",
    bus1: "Všetko z Pro",
    bus2: "Zrušenie + čakacia listina",
    bus3: "Pre väčšie praxe",
    start: "Začnite zadarmo",
    freeMonth: "1 mesiac zadarmo",
    allInclude: "Všetky tarify zahŕňajú:",
    include1: "Neobmedzené rezervácie",
    include2: "E-mailové pripomienky",
    include3: "V súlade s GDPR",
    include4: "SSL šifrovanie",
    include5: "Bezplatné aktualizácie",
    faqTitle: "Časté otázky",
    faq1q: "Je prvý mesiac naozaj zadarmo?",
    faq1a: "Áno! Všetky funkcie môžete 1 mesiac testovať bez záväzkov. Žiadne skryté náklady.",
    faq2q: "Môžem kedykoľvek zrušiť?",
    faq2a: "Áno, výpoveď je možná mesačne. Bez dlhých zmluvných podmienok.",
    faq3q: "Aký softvér je podporovaný?",
    faq3a: "PraxisOnline24 funguje so všetkými bežnými systémami na správu praxí.",
    trustTitle: "Vaše údaje sú v bezpečí",
    back: "← Späť na domovskú stránku",
  },
  ar: {
    title: "الأسعار",
    subtitle: "شهر واحد مجاناً – ثم إلغاء شهري مرن",
    basic: "أساسي",
    pro: "احترافي",
    business: "الأعمال",
    perMonth: "/شهر",
    basic1: "حجز المواعيد عبر الإنترنت",
    basic2: "تذكير بالبريد الإلكتروني",
    basic3: "للعيادات الصغيرة",
    pro1: "كل شيء من الأساسي",
    pro2: "إدارة التقييمات",
    pro3: "للعيادات المتنامية",
    bus1: "كل شيء من الاحترافي",
    bus2: "إلغاء + قائمة الانتظار",
    bus3: "للعيادات الكبيرة",
    start: "ابدأ مجاناً",
    freeMonth: "شهر واحد مجاناً",
    allInclude: "جميع الخطط تشمل:",
    include1: "حجوزات غير محدودة",
    include2: "تذكير بالبريد الإلكتروني",
    include3: "متوافق مع GDPR",
    include4: "تشفير SSL",
    include5: "تحديثات مجانية",
    faqTitle: "الأسئلة الشائعة",
    faq1q: "هل الشهر الأول مجاني حقاً؟",
    faq1a: "نعم! يمكنك اختبار جميع الميزات لمدة شهر واحد دون التزام. لا توجد تكاليف خفية.",
    faq2q: "هل يمكنني الإلغاء في أي وقت؟",
    faq2a: "نعم، الإلغاء ممكن شهرياً. لا توجد شروط عقد طويلة.",
    faq3q: "ما هي برامج العيادات المدعومة؟",
    faq3a: "يعمل PraxisOnline24 مع جميع أنظمة إدارة العيادات الشائعة.",
    trustTitle: "بياناتك آمنة",
    back: "← العودة إلى الصفحة الرئيسية",
  },
  zh: {
    title: "价格",
    subtitle: "1个月免费试用 – 之后可灵活按月取消",
    basic: "基础版",
    pro: "专业版",
    business: "企业版",
    perMonth: "/月",
    basic1: "在线预约",
    basic2: "邮件提醒",
    basic3: "适合小型诊所",
    pro1: "基础版全部功能",
    pro2: "评价管理",
    pro3: "适合成长型诊所",
    bus1: "专业版全部功能",
    bus2: "取消 + 候补名单",
    bus3: "适合大型诊所",
    start: "免费开始",
    freeMonth: "1个月免费",
    allInclude: "所有计划包含：",
    include1: "无限预约",
    include2: "邮件提醒",
    include3: "符合GDPR",
    include4: "SSL加密",
    include5: "免费更新",
    faqTitle: "常见问题",
    faq1q: "第一个月真的免费吗？",
    faq1a: "是的！您可以无义务测试所有功能1个月。无隐藏费用。",
    faq2q: "可以随时取消吗？",
    faq2a: "是的，可以按月取消。没有长期合同。",
    faq3q: "支持哪些诊所软件？",
    faq3a: "PraxisOnline24兼容所有主流诊所管理系统。",
    trustTitle: "您的数据是安全的",
    back: "← 返回首页",
  },
  ja: {
    title: "料金",
    subtitle: "1ヶ月無料 – その後は柔軟に月単位で解約可能",
    basic: "ベーシック",
    pro: "プロ",
    business: "ビジネス",
    perMonth: "/月",
    basic1: "オンライン予約",
    basic2: "メールリマインダー",
    basic3: "小規模医院向け",
    pro1: "ベーシックの全機能",
    pro2: "口コミ管理",
    pro3: "成長中の医院向け",
    bus1: "プロの全機能",
    bus2: "キャンセル + 待機リスト",
    bus3: "大規模医院向け",
    start: "無料で始める",
    freeMonth: "1ヶ月無料",
    allInclude: "すべてのプランに含まれるもの：",
    include1: "無制限の予約",
    include2: "メールリマインダー",
    include3: "GDPR準拠",
    include4: "SSL暗号化",
    include5: "無料アップデート",
    faqTitle: "よくある質問",
    faq1q: "最初の1ヶ月は本当に無料ですか？",
    faq1a: "はい！すべての機能を1ヶ月間無料でお試しいただけます。隠れた費用はありません。",
    faq2q: "いつでも解約できますか？",
    faq2a: "はい、月単位で解約可能です。長期契約はありません。",
    faq3q: "対応しているクリニックソフトウェアは？",
    faq3a: "PraxisOnline24はすべての一般的な医院管理システムと連携します。",
    trustTitle: "データは安全です",
    back: "← ホームに戻る",
  },
}

const stripeLinks: Record<string, string> = {
  basic: "https://buy.stripe.com/fZu6oJgOA9SW4uDbGIfAc0c",
  pro: "https://buy.stripe.com/5kQeVfdCo5CG3qz8uwfAc0d",
  business: "https://buy.stripe.com/8x28wRdCo0im0eneSUfAc0e",
}

export default function PreisePage() {
  const [lang, setLang] = useState("de")

  useEffect(() => {
    const s = localStorage.getItem("lang")
    if (s && texts[s]) setLang(s)
    else {
      const browserLang = navigator.language.split("-")[0]
      setLang(texts[browserLang] ? browserLang : "de")
    }
  }, [])

  const t = texts[lang] || texts.de

  const handleCheckout = (plan: string) => {
    const base = stripeLinks[plan]
    const stripeLocale = lang === "ar" ? "en" : lang
    const returnUrl = window.location.origin + "/preise"
    const url = base + "?locale=" + stripeLocale + "&return_url=" + encodeURIComponent(returnUrl)
    window.location.href = url
  }

  return (
    <main className="min-h-screen bg-white py-8">
      <div className="max-w-5xl mx-auto px-4">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-center text-gray-900">{t.title}</h1>
        <p className="text-center text-sm sm:text-base text-gray-500 mb-8">{t.subtitle}</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8">
          {/* Basic */}
          <div className="bg-white border border-gray-200 p-4 sm:p-6 rounded-xl shadow-sm">
            <h3 className="text-base sm:text-lg font-semibold mb-1">{t.basic}</h3>
            <p className="text-xl sm:text-2xl font-bold mb-2 text-[#1E40AF]">19€<span className="text-xs text-gray-400">{t.perMonth}</span></p>
            <p className="text-xs text-green-600 font-semibold mb-2">✅ {t.freeMonth}</p>
            <ul className="text-left text-xs sm:text-sm text-gray-500 space-y-1 mb-4">
              <li>✓ {t.basic1}</li>
              <li>✓ {t.basic2}</li>
              <li>✓ {t.basic3}</li>
            </ul>
            <button onClick={() => handleCheckout("basic")} className="block w-full bg-[#1E40AF] text-white font-semibold py-2 rounded-full hover:bg-blue-800 transition text-sm cursor-pointer">
              {t.start}
            </button>
          </div>

          {/* Pro */}
          <div className="bg-[#1E40AF] text-white p-4 sm:p-6 rounded-xl shadow-lg sm:scale-105">
            <h3 className="text-base sm:text-lg font-semibold mt-2 mb-1">{t.pro}</h3>
            <p className="text-xl sm:text-2xl font-bold mb-2">49€<span className="text-xs text-blue-200">{t.perMonth}</span></p>
            <p className="text-xs text-green-300 font-semibold mb-2">✅ {t.freeMonth}</p>
            <ul className="text-left text-xs sm:text-sm text-blue-100 space-y-1 mb-4">
              <li>✓ {t.pro1}</li>
              <li>✓ {t.pro2}</li>
              <li>✓ {t.pro3}</li>
            </ul>
            <button onClick={() => handleCheckout("pro")} className="block w-full bg-white text-[#1E40AF] font-semibold py-2 rounded-full hover:bg-gray-100 transition text-sm cursor-pointer">
              {t.start}
            </button>
          </div>

          {/* Business */}
          <div className="bg-white border border-gray-200 p-4 sm:p-6 rounded-xl shadow-sm">
            <h3 className="text-base sm:text-lg font-semibold mb-1">{t.business}</h3>
            <p className="text-xl sm:text-2xl font-bold mb-2 text-[#1E40AF]">89€<span className="text-xs text-gray-400">{t.perMonth}</span></p>
            <p className="text-xs text-green-600 font-semibold mb-2">✅ {t.freeMonth}</p>
            <ul className="text-left text-xs sm:text-sm text-gray-500 space-y-1 mb-4">
              <li>✓ {t.bus1}</li>
              <li>✓ {t.bus2}</li>
              <li>✓ {t.bus3}</li>
            </ul>
            <button onClick={() => handleCheckout("business")} className="block w-full bg-[#3B82F6] text-white font-semibold py-2 rounded-full hover:bg-blue-600 transition text-sm cursor-pointer">
              {t.start}
            </button>
          </div>
        </div>

                {/* Alle Tarife enthalten */}
        <div className="mt-12 bg-[#F5F9FF] rounded-xl p-6 sm:p-8">
          <h3 className="text-lg font-bold text-center mb-4">{t.allInclude}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-gray-600">
            <div className="flex items-center gap-2">✅ {t.include1}</div>
            <div className="flex items-center gap-2">✅ {t.include2}</div>
            <div className="flex items-center gap-2">✅ {t.include3}</div>
            <div className="flex items-center gap-2">✅ {t.include4}</div>
            <div className="flex items-center gap-2">✅ {t.include5}</div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-12">
          <h3 className="text-lg font-bold text-center mb-6">{t.faqTitle}</h3>
          <div className="space-y-3 max-w-2xl mx-auto">
            <details className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <summary className="font-semibold cursor-pointer">{t.faq1q}</summary>
              <p className="text-sm text-gray-500 mt-2">{t.faq1a}</p>
            </details>
            <details className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <summary className="font-semibold cursor-pointer">{t.faq2q}</summary>
              <p className="text-sm text-gray-500 mt-2">{t.faq2a}</p>
            </details>
            <details className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <summary className="font-semibold cursor-pointer">{t.faq3q}</summary>
              <p className="text-sm text-gray-500 mt-2">{t.faq3a}</p>
            </details>
          </div>
        </div>

                {/* Trust Badges */}
        <div className="mt-12 text-center">
          <h3 className="text-lg font-bold mb-4">{t.trustTitle}</h3>
          <div className="flex flex-wrap justify-center gap-4 text-xs sm:text-sm text-gray-500">
            <span className="bg-blue-50 px-4 py-2 rounded-full">🔒 {t.include3}</span>
            <span className="bg-blue-50 px-4 py-2 rounded-full">🔐 {t.include4}</span>
            <span className="bg-blue-50 px-4 py-2 rounded-full">🇩🇪 Hosted in Germany</span>
          </div>
        </div>

        <Link href="/" className="inline-block mt-8 text-[#1E40AF] underline text-sm">← {t.back}</Link>
      </div>
    </main>
  )
}