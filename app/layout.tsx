import "./globals.css"

export const metadata = {
  title: "PraxisOnline24 - DSGVO-sichere Praxis-Automatisierung",
  description: "Automatisieren Sie Ihre Praxis mit Online-Terminbuchung, Erinnerungen und Bewertungsmanagement.",
  verification: {
    google: "zeKM1yk5V9ZXAtJUYvTqn9jWXpki7Ruaj1PLoMDqyxc",
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body className="bg-white text-gray-900 text-sm md:text-base lg:text-lg min-h-screen antialiased flex flex-col">
        <script dangerouslySetInnerHTML={{ __html: `(function(){var p=new URLSearchParams(window.location.search);var lang=p.get("setLang");if(lang){localStorage.setItem("lang",lang);var u=new URL(window.location);u.searchParams.delete("setLang");window.history.replaceState({},"",u.toString())}})()` }} />
        <main className="flex-1">{children}</main>
        <footer className="bg-gray-100 border-t border-gray-200 mt-12 sm:mt-20" id="page-footer">
          <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8 text-center text-gray-600 text-xs sm:text-sm">
            <p className="font-semibold text-gray-800 mb-3">PraxisOnline24</p>
            <div id="footer-links" className="flex flex-wrap justify-center gap-x-4 gap-y-2 mb-4"></div>
            <p id="footer-copyright" className="text-gray-500"></p>
            <div className="flex flex-wrap justify-center gap-4 mt-4 text-xs">
              <span id="footer-gdpr" className="text-gray-500">🔒 DSGVO-konform</span>
              <span id="footer-ssl" className="text-gray-500">🔐 SSL-verschlüsselt</span>
              <span id="footer-hosted" className="text-gray-500">🇩🇪 Hosted in Germany</span>
            </div>
          </div>
        </footer>
        <script dangerouslySetInnerHTML={{ __html: `
          (function(){
            var texts={
  de: ["Über uns","Kontakt","Blog","FAQ","AGB","Datenschutz","Impressum","Admin"],
  en: ["About","Contact","Blog","FAQ","Terms","Privacy","Imprint","Admin"],
  fr: ["À propos","Contact","Blog","FAQ","CGV","Confidentialité","Mentions légales","Admin"],
  es: ["Sobre nosotros","Contacto","Blog","FAQ","Términos","Privacidad","Aviso legal","Admin"],
  it: ["Chi siamo","Contatto","Blog","FAQ","Termini","Privacy","Note legali","Admin"],
  pt: ["Sobre nós","Contato","Blog","FAQ","Termos","Privacidade","Aviso legal","Admin"],
  nl: ["Over ons","Contact","Blog","FAQ","Voorwaarden","Privacy","Colofon","Admin"],
  pl: ["O nas","Kontakt","Blog","FAQ","Warunki","Prywatność","Nota prawna","Admin"],
  tr: ["Hakkımızda","İletişim","Blog","SSS","Şartlar","Gizlilik","Künye","Admin"],
  sv: ["Om oss","Kontakt","Blogg","FAQ","Villkor","Integritet","Impressum","Admin"],
  no: ["Om oss","Kontakt","Blogg","FAQ","Vilkår","Personvern","Impressum","Admin"],
  da: ["Om os","Kontakt","Blog","FAQ","Vilkår","Privatliv","Impressum","Admin"],
  sl: ["O nas","Kontakt","Blog","FAQ","Pogoji","Zasebnost","Impressum","Admin"],
  cs: ["O nás","Kontakt","Blog","FAQ","Podmínky","Ochrana údajů","Impressum","Admin"],
  sk: ["O nás","Kontakt","Blog","FAQ","Podmienky","Ochrana údajov","Impressum","Admin"],
  ja: ["会社概要","お問い合わせ","ブログ","FAQ","利用規約","プライバシー","インプリント","Admin"],
  zh: ["关于我们","联系我们","博客","常见问题","服务条款","隐私政策","版权信息","Admin"]
};
            var copyrights={
  de:"© 2026 PraxisOnline24. Alle Rechte vorbehalten.",
  en:"© 2026 PraxisOnline24. All rights reserved.",
  fr:"© 2026 PraxisOnline24. Tous droits réservés.",
  es:"© 2026 PraxisOnline24. Todos los derechos reservados.",
  it:"© 2026 PraxisOnline24. Tutti i diritti riservati.",
  pt:"© 2026 PraxisOnline24. Todos os direitos reservados.",
  nl:"© 2026 PraxisOnline24. Alle rechten voorbehouden.",
  pl:"© 2026 PraxisOnline24. Wszelkie prawa zastrzeżone.",
  tr:"© 2026 PraxisOnline24. Tüm hakları saklıdır.",
  sv:"© 2026 PraxisOnline24. Alla rättigheter förbehållna.",
  no:"© 2026 PraxisOnline24. Alle rettigheter forbeholdt.",
  da:"© 2026 PraxisOnline24. Alle rettigheder forbeholdes.",
  sl:"© 2026 PraxisOnline24. Vse pravice pridržane.",
  cs:"© 2026 PraxisOnline24. Všechna práva vyhrazena.",
  sk:"© 2026 PraxisOnline24. Všetky práva vyhradené.",
  ja:"© 2026 PraxisOnline24. 無断複写・転載を禁じます。",
  zh:"© 2026 PraxisOnline24. 版权所有。"
};
            var hrefs=["/ueber-uns","/kontakt","/blog","/faq","/agb","/datenschutz","/impressum","/admin"];
            var gdprTexts={
  de:"🔒 DSGVO-konform", en:"🔒 GDPR compliant", fr:"🔒 Conforme au RGPD", es:"🔒 Conforme al RGPD", it:"🔒 Conforme al GDPR", pt:"🔒 Conforme com o RGPD", nl:"🔒 AVG-conform", pl:"🔒 Zgodny z RODO", tr:"🔒 KVKK uyumlu", sv:"🔒 GDPR-kompatibel", no:"🔒 GDPR-kompatibel", da:"🔒 GDPR-kompatibel", sl:"🔒 Skladno z GDPR", cs:"🔒 Soulad s GDPR", sk:"🔒 Súlad s GDPR", ja:"🔒 GDPR準拠", zh:"🔒 GDPR合规"
};
            var sslTexts={
  de:"🔐 SSL-verschlüsselt", en:"🔐 SSL encrypted", fr:"🔐 Chiffré SSL", es:"🔐 Cifrado SSL", it:"🔐 Crittografato SSL", pt:"🔐 Criptografado SSL", nl:"🔐 SSL-versleuteld", pl:"🔐 Szyfrowanie SSL", tr:"🔐 SSL şifreli", sv:"🔐 SSL-krypterad", no:"🔐 SSL-kryptert", da:"🔐 SSL-krypteret", sl:"🔐 Šifrirano SSL", cs:"🔐 Šifrováno SSL", sk:"🔐 Šifrované SSL", ja:"🔐 SSL暗号化", zh:"🔐 SSL加密"
};
            var hostedTexts={
  de:"🇩🇪 Hosted in Germany", en:"🇩🇪 Hosted in Germany", fr:"🇩🇪 Hébergé en Allemagne", es:"🇩🇪 Alojado en Alemania", it:"🇩🇪 Ospitato in Germania", pt:"🇩🇪 Hospedado na Alemanha", nl:"🇩🇪 Gehost in Duitsland", pl:"🇩🇪 Hostowane w Niemczech", tr:"🇩🇪 Almanya'da barındırılır", sv:"🇩🇪 Hostas i Tyskland", no:"🇩🇪 Hostet i Tyskland", da:"🇩🇪 Hostet i Tyskland", sl:"🇩🇪 Gostuje v Nemčiji", cs:"🇩🇪 Hostováno v Německu", sk:"🇩🇪 Hostované v Nemecku", ja:"🇩🇪 ドイツでホスト", zh:"🇩🇪 在德国托管"
};
            function renderFooter(){
              var lang=localStorage.getItem("lang")||"de";
              if(!texts[lang])lang="en";
              var t=texts[lang];
              var html='';
              for(var i=0;i<t.length;i++){
                html+='<a href="'+hrefs[i]+'?setLang='+lang+'" class="underline hover:text-gray-900 whitespace-nowrap">'+t[i]+'</a>';
              }
              document.getElementById("footer-links").innerHTML=html;
              document.getElementById("footer-copyright").textContent=copyrights[lang]||copyrights.en;
              document.getElementById("footer-gdpr").textContent=gdprTexts[lang]||gdprTexts.en;
              document.getElementById("footer-ssl").textContent=sslTexts[lang]||sslTexts.en;
              document.getElementById("footer-hosted").textContent=hostedTexts[lang]||hostedTexts.en;
            }
            renderFooter();
            setInterval(renderFooter,2000);
          })();
        ` }} />
      </body>
    </html>
  )
}