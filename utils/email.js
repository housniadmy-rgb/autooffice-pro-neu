const https = require('https');
const { emailLocales, SUPPORTED_EMAIL_LANGS, EMAIL_TYPES } = require('./emailLocales');

// ── Brevo Transactional Email API ────────────────────────────
// SMTP-Versand wurde abgelöst, weil Render-Outbound auf den Brevo-SMTP-Ports
// 587 und 465 in Connection-Timeout läuft. Stattdessen HTTPS auf api.brevo.com.

const BREVO_HOST = 'api.brevo.com';
const BREVO_REQUEST_TIMEOUT_MS = 12000;
const DEFAULT_FROM = 'PraxisOnline24 <info@praxisonline24.com>';

// "Name <addr@host>" → { name, email }; "addr@host" → { email }
function parseAddress(input) {
  if (!input) return null;
  if (typeof input === 'object') return input;
  const s = String(input).trim();
  const m = /^(.+?)\s*<\s*([^>]+?)\s*>\s*$/.exec(s);
  if (m) {
    const name = m[1].trim().replace(/^"(.*)"$/, '$1');
    return { name, email: m[2] };
  }
  return { email: s };
}

// Logging-sicher: enthält NIE den API-Key.
function brevoSanitizedSummary() {
  return {
    mode: process.env.EMAIL_DEV_MODE === 'true' ? 'dev-mode-no-send'
        : process.env.BREVO_API_KEY ? 'brevo-api'
        : 'no-key-dev-log-only',
    apiKey: process.env.BREVO_API_KEY ? '(gesetzt)' : '(fehlt)',
    from: process.env.SMTP_FROM || '(default: ' + DEFAULT_FROM + ')',
  };
}

function brevoRequest(method, path, body) {
  if (!process.env.BREVO_API_KEY) {
    return Promise.reject(new Error('BREVO_API_KEY nicht gesetzt'));
  }
  const payload = body == null ? null : JSON.stringify(body);
  return new Promise((resolve, reject) => {
    const req = https.request({
      method,
      host: BREVO_HOST,
      path,
      headers: {
        'api-key': process.env.BREVO_API_KEY,
        accept: 'application/json',
        ...(payload ? {
          'content-type': 'application/json',
          'content-length': Buffer.byteLength(payload),
        } : {}),
      },
      timeout: BREVO_REQUEST_TIMEOUT_MS,
    }, (res) => {
      let data = '';
      res.on('data', (c) => { data += c; });
      res.on('end', () => {
        let parsed = null;
        try { parsed = data ? JSON.parse(data) : null; } catch { /* non-JSON */ }
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ statusCode: res.statusCode, body: parsed });
        } else {
          const snippet = (data || '').slice(0, 300);
          reject(new Error(`Brevo HTTP ${res.statusCode}: ${snippet}`));
        }
      });
    });
    req.on('timeout', () => {
      req.destroy(new Error(`Brevo Request Timeout (${BREVO_REQUEST_TIMEOUT_MS}ms)`));
    });
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function sendViaBrevo({ from, to, replyTo, subject, html, text }) {
  const payload = {
    sender: parseAddress(from || DEFAULT_FROM),
    to: [parseAddress(to)],
    subject,
    ...(html ? { htmlContent: html } : {}),
    ...(text ? { textContent: text } : {}),
    ...(replyTo ? { replyTo: parseAddress(replyTo) } : {}),
  };
  const res = await brevoRequest('POST', '/v3/smtp/email', payload);
  return {
    statusCode: res.statusCode,
    messageId: res.body && res.body.messageId,
    body: res.body,
  };
}

// Zentrales Dispatch: DEV-Log → API-Send → Erfolg/Fehler-Log.
// Bei jedem Versand wird die KOMPLETTE Brevo-Antwort (Status + messageId)
// geloggt, damit bei "Mail kam nicht an"-Issues sofort sichtbar ist, ob die
// Brevo-API die Mail überhaupt akzeptiert hat oder nicht.
//
// Wird im Fehlerfall an den Caller geworfen (fireAndForget in routes/demo.js
// fängt das ab; andere Caller bubbeln den Fehler weiter wie bisher).
async function dispatch(label, mail) {
  const logBody = mail.text || (mail.html ? '(HTML-only)' : '');
  devLog(label, mail.to, mail.subject, logBody);

  if (process.env.EMAIL_DEV_MODE === 'true') {
    console.log(`[mail] ${label}: EMAIL_DEV_MODE=true – kein Versand`);
    return;
  }
  if (!process.env.BREVO_API_KEY) {
    console.log(`[mail] ${label}: BREVO_API_KEY fehlt – nur DEV-Log, kein Versand`);
    return;
  }

  try {
    const { statusCode, messageId, body } = await sendViaBrevo(mail);
    console.log(`[mail] ${label} via Brevo OK – status=${statusCode} messageId=${messageId || '(none)'} to=${mail.to} subject="${mail.subject}"`);
    if (!messageId) {
      // Brevo gab 2xx aber keine messageId zurück – ungewöhnlich, full body loggen
      console.warn(`[mail] ${label} – Brevo lieferte KEINE messageId. Response body:`, JSON.stringify(body));
    }
    return { statusCode, messageId };
  } catch (err) {
    // Volle Fehler-Diagnose: Stack + Brevo-Body (in err.message verpackt durch brevoRequest)
    console.error(`[mail] ${label} via Brevo FEHLER – to=${mail.to} subject="${mail.subject}":`,
      err && err.stack ? err.stack : (err && err.message ? err.message : String(err)));
    throw err;
  }
}

// Einmaliger Check beim Start (non-blocking): Konfig loggen + API-Key prüfen.
async function verifyMailConfig() {
  const cfg = brevoSanitizedSummary();
  console.log('[mail] Konfiguration:', cfg);

  if (cfg.mode === 'dev-mode-no-send') {
    console.log('[mail] EMAIL_DEV_MODE=true – kein Versand, nur DEV-Log');
    return;
  }
  if (cfg.mode === 'no-key-dev-log-only') {
    console.log('[mail] BREVO_API_KEY fehlt – nur DEV-Log, kein Versand');
    return;
  }
  try {
    const res = await brevoRequest('GET', '/v3/account');
    const acc = res.body || {};
    const plan = Array.isArray(acc.plan) && acc.plan[0] ? acc.plan[0].type : '?';
    console.log(`[mail] Brevo-Account OK – companyName=${acc.companyName || '?'}, email=${acc.email || '?'}, plan=${plan}`);
  } catch (err) {
    const msg = err && err.message ? err.message : String(err);
    console.error('[mail] Brevo-Verbindungs-Check FEHLER:', msg);
  }
}

// ── Multilingual email texts ───────────────────────────────

const emailT = {
  de: {
    greeting: (name) => `Hallo ${name},`,
    confirmationSubject: (practice) => `Terminbestätigung – ${practice}`,
    confirmationIntro: 'Ihr Termin wurde erfolgreich gebucht.',
    fieldDate: 'Datum', fieldTime: 'Uhrzeit', fieldPractice: 'Praxis', fieldAddress: 'Adresse',
    cancelLink: 'Termin absagen',
    reminderSubject: (time) => `Erinnerung: Ihr Termin morgen um ${time} Uhr`,
    reminderIntro: 'Wir erinnern Sie an Ihren morgigen Termin:',
    cancellationSubject: (date) => `Terminabsage – ${date}`,
    cancellationIntro: (date, time) => `Ihr Termin am ${date} um ${time} Uhr wurde abgesagt.`,
    cancellationCta: 'Bitte buchen Sie bei Bedarf einen neuen Termin.',
    waitlistSubject: (date, time) => `Termin verfügbar – ${date} um ${time} Uhr`,
    waitlistIntro: (name, date, time, practice) => `Hallo ${name},\n\nEin Termin am ${date} um ${time} Uhr ist frei bei ${practice}.`,
    waitlistCta: 'Hier klicken zum Annehmen (4 Stunden gültig):',
    waitlistIgnore: 'Falls Sie keinen Termin mehr benötigen, können Sie diese Nachricht ignorieren.',
    reviewSubject: (practice) => `Wie war Ihr Termin bei ${practice}?`,
    reviewIntro: (name, date) => `Hallo ${name},\n\nVielen Dank für Ihren Besuch am ${date}. Wir würden uns freuen, wenn Sie kurz eine Bewertung hinterlassen.`,
    reviewDisclaimer: 'Bitte keine Diagnosen oder Gesundheitsdaten eingeben.',
    trialSubjectDays: (days) => `Ihre Testphase endet in ${days} Tag(en) – PraxisOnline24`,
    trialSubjectExpired: 'Ihre Testphase ist abgelaufen – PraxisOnline24',
    trialIntroDays: (days, date) => `Ihre Testphase bei PraxisOnline24 endet in ${days} Tag(en) (${date}).`,
    trialIntroExpired: 'Ihre Testphase bei PraxisOnline24 ist abgelaufen.',
    trialCta: 'Um PraxisOnline24 weiterhin nutzen zu können, upgraden Sie bitte Ihr Paket.',
    footer: 'PraxisOnline24 ist ein Terminverwaltungs-Werkzeug. Die Praxis ist allein verantwortlich für Patientendaten, medizinische Entscheidungen, Rechnungsinhalte und Rezeptangaben.',
  },
  en: {
    greeting: (name) => `Hello ${name},`,
    confirmationSubject: (practice) => `Appointment confirmation – ${practice}`,
    confirmationIntro: 'Your appointment has been successfully booked.',
    fieldDate: 'Date', fieldTime: 'Time', fieldPractice: 'Practice', fieldAddress: 'Address',
    cancelLink: 'Cancel appointment',
    reminderSubject: (time) => `Reminder: Your appointment tomorrow at ${time}`,
    reminderIntro: 'This is a reminder for your appointment tomorrow:',
    cancellationSubject: (date) => `Appointment cancelled – ${date}`,
    cancellationIntro: (date, time) => `Your appointment on ${date} at ${time} has been cancelled.`,
    cancellationCta: 'Please book a new appointment if needed.',
    waitlistSubject: (date, time) => `Appointment available – ${date} at ${time}`,
    waitlistIntro: (name, date, time, practice) => `Hello ${name},\n\nAn appointment on ${date} at ${time} is available at ${practice}.`,
    waitlistCta: 'Click here to accept (valid for 4 hours):',
    waitlistIgnore: 'If you no longer need an appointment, you can ignore this message.',
    reviewSubject: (practice) => `How was your appointment at ${practice}?`,
    reviewIntro: (name, date) => `Hello ${name},\n\nThank you for your visit on ${date}. We would be happy if you could leave a brief review.`,
    reviewDisclaimer: 'Please do not enter any diagnoses or health data.',
    trialSubjectDays: (days) => `Your trial ends in ${days} day(s) – PraxisOnline24`,
    trialSubjectExpired: 'Your trial has expired – PraxisOnline24',
    trialIntroDays: (days, date) => `Your trial period at PraxisOnline24 ends in ${days} day(s) (${date}).`,
    trialIntroExpired: 'Your trial period at PraxisOnline24 has expired.',
    trialCta: 'To continue using PraxisOnline24, please upgrade your plan.',
    footer: 'PraxisOnline24 is an appointment management tool. The practice is solely responsible for patient data, medical decisions, invoice content, and prescription details.',
  },
  fr: {
    greeting: (name) => `Cher/Chère ${name},`,
    confirmationSubject: (practice) => `Confirmation de rendez-vous – ${practice}`,
    confirmationIntro: 'Votre rendez-vous a été confirmé.',
    fieldDate: 'Date', fieldTime: 'Heure', fieldPractice: 'Cabinet', fieldAddress: 'Adresse',
    cancelLink: 'Annuler le rendez-vous',
    reminderSubject: (time) => `Rappel : votre rendez-vous demain à ${time}`,
    reminderIntro: 'Nous vous rappelons votre rendez-vous de demain :',
    cancellationSubject: (date) => `Rendez-vous annulé – ${date}`,
    cancellationIntro: (date, time) => `Votre rendez-vous du ${date} à ${time} a été annulé.`,
    cancellationCta: 'Veuillez prendre un nouveau rendez-vous si nécessaire.',
    waitlistSubject: (date, time) => `Rendez-vous disponible – ${date} à ${time}`,
    waitlistIntro: (name, date, time, practice) => `Cher/Chère ${name},\n\nUn rendez-vous le ${date} à ${time} est disponible au ${practice}.`,
    waitlistCta: 'Cliquez ici pour accepter (valable 4 heures) :',
    waitlistIgnore: "Si vous n'avez plus besoin d'un rendez-vous, vous pouvez ignorer ce message.",
    reviewSubject: (practice) => `Comment s'est passé votre rendez-vous au ${practice} ?`,
    reviewIntro: (name, date) => `Cher/Chère ${name},\n\nMerci pour votre visite le ${date}. Nous serions ravis que vous laissiez un bref avis.`,
    reviewDisclaimer: 'Veuillez ne pas saisir de diagnostics ou de données de santé.',
    trialSubjectDays: (days) => `Votre essai expire dans ${days} jour(s) – PraxisOnline24`,
    trialSubjectExpired: 'Votre essai a expiré – PraxisOnline24',
    trialIntroDays: (days, date) => `Votre période d'essai chez PraxisOnline24 expire dans ${days} jour(s) (${date}).`,
    trialIntroExpired: "Votre période d'essai chez PraxisOnline24 a expiré.",
    trialCta: 'Pour continuer à utiliser PraxisOnline24, veuillez mettre à niveau votre abonnement.',
    footer: "PraxisOnline24 est un outil de gestion de rendez-vous. Le cabinet est seul responsable des données des patients, des décisions médicales, du contenu des factures et des prescriptions.",
  },
  es: {
    greeting: (name) => `Estimado/a ${name},`,
    confirmationSubject: (practice) => `Confirmación de cita – ${practice}`,
    confirmationIntro: 'Su cita ha sido confirmada.',
    fieldDate: 'Fecha', fieldTime: 'Hora', fieldPractice: 'Consultorio', fieldAddress: 'Dirección',
    cancelLink: 'Cancelar cita',
    reminderSubject: (time) => `Recordatorio: su cita mañana a las ${time}`,
    reminderIntro: 'Le recordamos su cita de mañana:',
    cancellationSubject: (date) => `Cita cancelada – ${date}`,
    cancellationIntro: (date, time) => `Su cita del ${date} a las ${time} ha sido cancelada.`,
    cancellationCta: 'Por favor reserve una nueva cita si lo necesita.',
    waitlistSubject: (date, time) => `Cita disponible – ${date} a las ${time}`,
    waitlistIntro: (name, date, time, practice) => `Estimado/a ${name},\n\nUna cita el ${date} a las ${time} está disponible en ${practice}.`,
    waitlistCta: 'Haga clic aquí para aceptar (válido 4 horas):',
    waitlistIgnore: 'Si ya no necesita una cita, puede ignorar este mensaje.',
    reviewSubject: (practice) => `¿Cómo fue su cita en ${practice}?`,
    reviewIntro: (name, date) => `Estimado/a ${name},\n\nGracias por su visita el ${date}. Nos encantaría que dejara una breve opinión.`,
    reviewDisclaimer: 'Por favor, no ingrese diagnósticos ni datos de salud.',
    trialSubjectDays: (days) => `Su prueba expira en ${days} día(s) – PraxisOnline24`,
    trialSubjectExpired: 'Su prueba ha expirado – PraxisOnline24',
    trialIntroDays: (days, date) => `Su período de prueba en PraxisOnline24 expira en ${days} día(s) (${date}).`,
    trialIntroExpired: 'Su período de prueba en PraxisOnline24 ha expirado.',
    trialCta: 'Para continuar usando PraxisOnline24, por favor actualice su plan.',
    footer: 'PraxisOnline24 es una herramienta de gestión de citas. El consultorio es el único responsable de los datos de pacientes, decisiones médicas, facturas y recetas.',
  },
  pt: {
    greeting: (name) => `Prezado/a ${name},`,
    confirmationSubject: (practice) => `Confirmação de consulta – ${practice}`,
    confirmationIntro: 'Sua consulta foi confirmada.',
    fieldDate: 'Data', fieldTime: 'Hora', fieldPractice: 'Clínica', fieldAddress: 'Endereço',
    cancelLink: 'Cancelar consulta',
    reminderSubject: (time) => `Lembrete: sua consulta amanhã às ${time}`,
    reminderIntro: 'Lembramos sua consulta de amanhã:',
    cancellationSubject: (date) => `Consulta cancelada – ${date}`,
    cancellationIntro: (date, time) => `Sua consulta em ${date} às ${time} foi cancelada.`,
    cancellationCta: 'Por favor, agende uma nova consulta se necessário.',
    waitlistSubject: (date, time) => `Consulta disponível – ${date} às ${time}`,
    waitlistIntro: (name, date, time, practice) => `Prezado/a ${name},\n\nUma consulta em ${date} às ${time} está disponível em ${practice}.`,
    waitlistCta: 'Clique aqui para aceitar (válido por 4 horas):',
    waitlistIgnore: 'Se você não precisar mais de uma consulta, pode ignorar esta mensagem.',
    reviewSubject: (practice) => `Como foi sua consulta em ${practice}?`,
    reviewIntro: (name, date) => `Prezado/a ${name},\n\nObrigado pela sua visita em ${date}. Ficaríamos felizes com uma breve avaliação.`,
    reviewDisclaimer: 'Por favor, não insira diagnósticos ou dados de saúde.',
    trialSubjectDays: (days) => `Seu período de teste expira em ${days} dia(s) – PraxisOnline24`,
    trialSubjectExpired: 'Seu período de teste expirou – PraxisOnline24',
    trialIntroDays: (days, date) => `Seu período de teste no PraxisOnline24 expira em ${days} dia(s) (${date}).`,
    trialIntroExpired: 'Seu período de teste no PraxisOnline24 expirou.',
    trialCta: 'Para continuar usando o PraxisOnline24, atualize seu plano.',
    footer: 'PraxisOnline24 é uma ferramenta de gestão de consultas. A clínica é a única responsável pelos dados dos pacientes, decisões médicas, faturas e prescrições.',
  },
  ar: {
    greeting: (name) => `عزيزي/عزيزتي ${name}،`,
    confirmationSubject: (practice) => `تأكيد الموعد – ${practice}`,
    confirmationIntro: 'تم تأكيد موعدك.',
    fieldDate: 'التاريخ', fieldTime: 'الوقت', fieldPractice: 'العيادة', fieldAddress: 'العنوان',
    cancelLink: 'إلغاء الموعد',
    reminderSubject: (time) => `تذكير: موعدك غداً الساعة ${time}`,
    reminderIntro: 'نذكّرك بموعدك غداً:',
    cancellationSubject: (date) => `تم إلغاء الموعد – ${date}`,
    cancellationIntro: (date, time) => `تم إلغاء موعدك في ${date} الساعة ${time}.`,
    cancellationCta: 'يرجى حجز موعد جديد إذا لزم الأمر.',
    waitlistSubject: (date, time) => `موعد متاح – ${date} الساعة ${time}`,
    waitlistIntro: (name, date, time, practice) => `عزيزي/عزيزتي ${name}،\n\nيتوفر موعد في ${date} الساعة ${time} في ${practice}.`,
    waitlistCta: 'انقر هنا للقبول (صالح لمدة 4 ساعات):',
    waitlistIgnore: 'إذا لم تعد بحاجة إلى موعد، يمكنك تجاهل هذه الرسالة.',
    reviewSubject: (practice) => `كيف كان موعدك في ${practice}؟`,
    reviewIntro: (name, date) => `عزيزي/عزيزتي ${name}،\n\nشكراً لزيارتك في ${date}. يسعدنا أن تترك تقييماً مختصراً.`,
    reviewDisclaimer: 'يرجى عدم إدخال التشخيصات أو البيانات الصحية.',
    trialSubjectDays: (days) => `تنتهي فترة تجربتك خلال ${days} يوم/أيام – PraxisOnline24`,
    trialSubjectExpired: 'انتهت فترة تجربتك – PraxisOnline24',
    trialIntroDays: (days, date) => `تنتهي فترة تجربتك في PraxisOnline24 خلال ${days} يوم/أيام (${date}).`,
    trialIntroExpired: 'انتهت فترة تجربتك في PraxisOnline24.',
    trialCta: 'لمواصلة استخدام PraxisOnline24، يرجى ترقية اشتراكك.',
    footer: 'PraxisOnline24 هو أداة لإدارة المواعيد. العيادة وحدها مسؤولة عن بيانات المرضى والقرارات الطبية والفواتير والوصفات.',
  },
  tr: {
    greeting: (name) => `Sayın ${name},`,
    confirmationSubject: (practice) => `Randevu onayı – ${practice}`,
    confirmationIntro: 'Randevunuz başarıyla onaylandı.',
    fieldDate: 'Tarih', fieldTime: 'Saat', fieldPractice: 'Klinik', fieldAddress: 'Adres',
    cancelLink: 'Randevuyu iptal et',
    reminderSubject: (time) => `Hatırlatma: Yarınki randevunuz saat ${time}`,
    reminderIntro: 'Yarınki randevunuzu hatırlatmak istedik:',
    cancellationSubject: (date) => `Randevu iptal edildi – ${date}`,
    cancellationIntro: (date, time) => `${date} tarihinde saat ${time}deki randevunuz iptal edildi.`,
    cancellationCta: 'Gerekirse lütfen yeni bir randevu alın.',
    waitlistSubject: (date, time) => `Randevu mevcut – ${date} saat ${time}`,
    waitlistIntro: (name, date, time, practice) => `Sayın ${name},\n\n${practice} kliniğinde ${date} tarihinde saat ${time}de randevu müsait.`,
    waitlistCta: 'Kabul etmek için tıklayın (4 saat geçerli):',
    waitlistIgnore: 'Artık randevuya ihtiyacınız yoksa bu mesajı görmezden gelebilirsiniz.',
    reviewSubject: (practice) => `${practice} kliniğindeki randevunuz nasıldı?`,
    reviewIntro: (name, date) => `Sayın ${name},\n\n${date} tarihindeki ziyaretiniz için teşekkürler. Kısa bir değerlendirme bırakmanızdan memnuniyet duyarız.`,
    reviewDisclaimer: 'Lütfen teşhis veya sağlık verisi girmeyin.',
    trialSubjectDays: (days) => `Deneme süreniz ${days} gün içinde sona erecek – PraxisOnline24`,
    trialSubjectExpired: 'Deneme süreniz sona erdi – PraxisOnline24',
    trialIntroDays: (days, date) => `PraxisOnline24 deneme süreniz ${days} gün içinde (${date}) sona erecek.`,
    trialIntroExpired: 'PraxisOnline24 deneme süreniz sona erdi.',
    trialCta: 'PraxisOnline24 kullanmaya devam etmek için planınızı yükseltin.',
    footer: 'PraxisOnline24 bir randevu yönetim aracıdır. Klinik; hasta verileri, tıbbi kararlar, faturalar ve reçetelerden tek başına sorumludur.',
  },
  id: {
    greeting: (name) => `Yth. ${name},`,
    confirmationSubject: (practice) => `Konfirmasi janji – ${practice}`,
    confirmationIntro: 'Janji Anda telah dikonfirmasi.',
    fieldDate: 'Tanggal', fieldTime: 'Waktu', fieldPractice: 'Klinik', fieldAddress: 'Alamat',
    cancelLink: 'Batalkan janji',
    reminderSubject: (time) => `Pengingat: Janji Anda besok pukul ${time}`,
    reminderIntro: 'Kami mengingatkan janji Anda besok:',
    cancellationSubject: (date) => `Janji dibatalkan – ${date}`,
    cancellationIntro: (date, time) => `Janji Anda pada ${date} pukul ${time} telah dibatalkan.`,
    cancellationCta: 'Silakan buat janji baru jika diperlukan.',
    waitlistSubject: (date, time) => `Janji tersedia – ${date} pukul ${time}`,
    waitlistIntro: (name, date, time, practice) => `Yth. ${name},\n\nJanji pada ${date} pukul ${time} tersedia di ${practice}.`,
    waitlistCta: 'Klik di sini untuk menerima (berlaku 4 jam):',
    waitlistIgnore: 'Jika Anda tidak lagi membutuhkan janji, Anda dapat mengabaikan pesan ini.',
    reviewSubject: (practice) => `Bagaimana janji Anda di ${practice}?`,
    reviewIntro: (name, date) => `Yth. ${name},\n\nTerima kasih atas kunjungan Anda pada ${date}. Kami akan senang jika Anda meninggalkan ulasan singkat.`,
    reviewDisclaimer: 'Harap jangan memasukkan diagnosis atau data kesehatan.',
    trialSubjectDays: (days) => `Masa percobaan Anda berakhir dalam ${days} hari – PraxisOnline24`,
    trialSubjectExpired: 'Masa percobaan Anda telah berakhir – PraxisOnline24',
    trialIntroDays: (days, date) => `Masa percobaan Anda di PraxisOnline24 berakhir dalam ${days} hari (${date}).`,
    trialIntroExpired: 'Masa percobaan Anda di PraxisOnline24 telah berakhir.',
    trialCta: 'Untuk terus menggunakan PraxisOnline24, silakan tingkatkan paket Anda.',
    footer: 'PraxisOnline24 adalah alat manajemen janji. Klinik bertanggung jawab sepenuhnya atas data pasien, keputusan medis, faktur, dan resep.',
  },
  ru: {
    greeting: (name) => `Здравствуйте, ${name}!`,
    confirmationSubject: (practice) => `Подтверждение записи – ${practice}`,
    confirmationIntro: 'Ваша запись успешно подтверждена.',
    fieldDate: 'Дата', fieldTime: 'Время', fieldPractice: 'Клиника', fieldAddress: 'Адрес',
    cancelLink: 'Отменить запись',
    reminderSubject: (time) => `Напоминание: ваша запись завтра в ${time}`,
    reminderIntro: 'Напоминаем о вашей записи на завтра:',
    cancellationSubject: (date) => `Запись отменена – ${date}`,
    cancellationIntro: (date, time) => `Ваша запись на ${date} в ${time} была отменена.`,
    cancellationCta: 'Пожалуйста, запишитесь снова, если необходимо.',
    waitlistSubject: (date, time) => `Запись доступна – ${date} в ${time}`,
    waitlistIntro: (name, date, time, practice) => `Здравствуйте, ${name}!\n\nЗапись на ${date} в ${time} доступна в ${practice}.`,
    waitlistCta: 'Нажмите здесь, чтобы принять (действует 4 часа):',
    waitlistIgnore: 'Если вам больше не нужна запись, вы можете проигнорировать это сообщение.',
    reviewSubject: (practice) => `Как прошёл ваш визит в ${practice}?`,
    reviewIntro: (name, date) => `Здравствуйте, ${name}!\n\nСпасибо за визит ${date}. Мы будем рады, если вы оставите краткий отзыв.`,
    reviewDisclaimer: 'Пожалуйста, не вводите диагнозы или медицинские данные.',
    trialSubjectDays: (days) => `Ваш пробный период заканчивается через ${days} дн. – PraxisOnline24`,
    trialSubjectExpired: 'Ваш пробный период истёк – PraxisOnline24',
    trialIntroDays: (days, date) => `Ваш пробный период в PraxisOnline24 заканчивается через ${days} дн. (${date}).`,
    trialIntroExpired: 'Ваш пробный период в PraxisOnline24 истёк.',
    trialCta: 'Чтобы продолжить использование PraxisOnline24, пожалуйста, обновите тариф.',
    footer: 'PraxisOnline24 — инструмент управления записями. Клиника несёт исключительную ответственность за данные пациентов, медицинские решения, счета и рецепты.',
  },
  zh: {
    greeting: (name) => `您好，${name}，`,
    confirmationSubject: (practice) => `预约确认 – ${practice}`,
    confirmationIntro: '您的预约已成功确认。',
    fieldDate: '日期', fieldTime: '时间', fieldPractice: '诊所', fieldAddress: '地址',
    cancelLink: '取消预约',
    reminderSubject: (time) => `提醒：您明天 ${time} 的预约`,
    reminderIntro: '提醒您明天的预约：',
    cancellationSubject: (date) => `预约已取消 – ${date}`,
    cancellationIntro: (date, time) => `您在 ${date} ${time} 的预约已被取消。`,
    cancellationCta: '如有需要，请重新预约。',
    waitlistSubject: (date, time) => `预约可用 – ${date} ${time}`,
    waitlistIntro: (name, date, time, practice) => `您好，${name}，\n\n${practice} 在 ${date} ${time} 有预约可用。`,
    waitlistCta: '点击此处接受（有效期4小时）：',
    waitlistIgnore: '如果您不再需要预约，可以忽略此消息。',
    reviewSubject: (practice) => `您在 ${practice} 的就诊体验如何？`,
    reviewIntro: (name, date) => `您好，${name}，\n\n感谢您在 ${date} 的就诊。期待您留下简短的评价。`,
    reviewDisclaimer: '请勿输入诊断或健康数据。',
    trialSubjectDays: (days) => `您的试用期将在 ${days} 天后结束 – PraxisOnline24`,
    trialSubjectExpired: '您的试用期已结束 – PraxisOnline24',
    trialIntroDays: (days, date) => `您在 PraxisOnline24 的试用期将在 ${days} 天后（${date}）结束。`,
    trialIntroExpired: '您在 PraxisOnline24 的试用期已结束。',
    trialCta: '要继续使用 PraxisOnline24，请升级您的套餐。',
    footer: 'PraxisOnline24是一款预约管理工具。诊所对患者数据、医疗决策、账单内容和处方信息负完全责任。',
  },
  hi: {
    greeting: (name) => `नमस्ते ${name},`,
    confirmationSubject: (practice) => `अपॉइंटमेंट की पुष्टि – ${practice}`,
    confirmationIntro: 'आपकी अपॉइंटमेंट सफलतापूर्वक बुक हो गई है।',
    fieldDate: 'तारीख', fieldTime: 'समय', fieldPractice: 'क्लिनिक', fieldAddress: 'पता',
    cancelLink: 'अपॉइंटमेंट रद्द करें',
    reminderSubject: (time) => `अनुस्मारक: कल ${time} पर आपकी अपॉइंटमेंट`,
    reminderIntro: 'हम आपको कल की अपॉइंटमेंट की याद दिला रहे हैं:',
    cancellationSubject: (date) => `अपॉइंटमेंट रद्द – ${date}`,
    cancellationIntro: (date, time) => `${date} को ${time} बजे आपकी अपॉइंटमेंट रद्द कर दी गई है।`,
    cancellationCta: 'यदि आवश्यक हो तो कृपया नई अपॉइंटमेंट बुक करें।',
    waitlistSubject: (date, time) => `अपॉइंटमेंट उपलब्ध – ${date} को ${time} बजे`,
    waitlistIntro: (name, date, time, practice) => `नमस्ते ${name},\n\n${practice} में ${date} को ${time} बजे अपॉइंटमेंट उपलब्ध है।`,
    waitlistCta: 'स्वीकार करने के लिए यहाँ क्लिक करें (4 घंटे के लिए मान्य):',
    waitlistIgnore: 'यदि आपको अब अपॉइंटमेंट की आवश्यकता नहीं है, तो आप इस संदेश को अनदेखा कर सकते हैं।',
    reviewSubject: (practice) => `${practice} में आपकी अपॉइंटमेंट कैसी रही?`,
    reviewIntro: (name, date) => `नमस्ते ${name},\n\n${date} को आपकी यात्रा के लिए धन्यवाद। हमें खुशी होगी यदि आप एक संक्षिप्त समीक्षा छोड़ें।`,
    reviewDisclaimer: 'कृपया कोई निदान या स्वास्थ्य डेटा न दर्ज करें।',
    trialSubjectDays: (days) => `आपका परीक्षण काल ${days} दिनों में समाप्त होगा – PraxisOnline24`,
    trialSubjectExpired: 'आपका परीक्षण काल समाप्त हो गया – PraxisOnline24',
    trialIntroDays: (days, date) => `PraxisOnline24 में आपका परीक्षण काल ${days} दिनों में (${date}) समाप्त होगा।`,
    trialIntroExpired: 'PraxisOnline24 में आपका परीक्षण काल समाप्त हो गया।',
    trialCta: 'PraxisOnline24 का उपयोग जारी रखने के लिए, कृपया अपना प्लान अपग्रेड करें।',
    footer: 'PraxisOnline24 एक अपॉइंटमेंट प्रबंधन उपकरण है। क्लिनिक मरीज़ के डेटा, चिकित्सा निर्णयों, बिल और नुस्खों के लिए पूरी तरह जिम्मेदार है।',
  },
  th: {
    greeting: (name) => `สวัสดี ${name},`,
    confirmationSubject: (practice) => `ยืนยันการนัดหมาย – ${practice}`,
    confirmationIntro: 'การนัดหมายของคุณได้รับการยืนยันเรียบร้อยแล้ว',
    fieldDate: 'วันที่', fieldTime: 'เวลา', fieldPractice: 'คลินิก', fieldAddress: 'ที่อยู่',
    cancelLink: 'ยกเลิกนัดหมาย',
    reminderSubject: (time) => `แจ้งเตือน: นัดหมายของคุณพรุ่งนี้เวลา ${time}`,
    reminderIntro: 'ขอแจ้งเตือนนัดหมายของคุณในวันพรุ่งนี้:',
    cancellationSubject: (date) => `ยกเลิกนัดหมายแล้ว – ${date}`,
    cancellationIntro: (date, time) => `นัดหมายของคุณในวันที่ ${date} เวลา ${time} ถูกยกเลิกแล้ว`,
    cancellationCta: 'กรุณาจองนัดหมายใหม่หากต้องการ',
    waitlistSubject: (date, time) => `มีนัดหมายว่าง – ${date} เวลา ${time}`,
    waitlistIntro: (name, date, time, practice) => `สวัสดี ${name},\n\nมีนัดหมายว่างในวันที่ ${date} เวลา ${time} ที่ ${practice}`,
    waitlistCta: 'คลิกที่นี่เพื่อยืนยัน (ใช้ได้ 4 ชั่วโมง):',
    waitlistIgnore: 'หากคุณไม่ต้องการนัดหมายแล้ว คุณสามารถละเว้นข้อความนี้ได้',
    reviewSubject: (practice) => `การนัดหมายของคุณที่ ${practice} เป็นอย่างไรบ้าง?`,
    reviewIntro: (name, date) => `สวัสดี ${name},\n\nขอบคุณสำหรับการมาเยือนเมื่อวันที่ ${date} ยินดีมากหากคุณจะฝากรีวิวสั้นๆ ไว้`,
    reviewDisclaimer: 'กรุณาอย่าป้อนข้อมูลการวินิจฉัยหรือข้อมูลสุขภาพ',
    trialSubjectDays: (days) => `ช่วงทดลองของคุณจะสิ้นสุดใน ${days} วัน – PraxisOnline24`,
    trialSubjectExpired: 'ช่วงทดลองของคุณสิ้นสุดแล้ว – PraxisOnline24',
    trialIntroDays: (days, date) => `ช่วงทดลองของคุณใน PraxisOnline24 จะสิ้นสุดใน ${days} วัน (${date})`,
    trialIntroExpired: 'ช่วงทดลองของคุณใน PraxisOnline24 สิ้นสุดแล้ว',
    trialCta: 'หากต้องการใช้ PraxisOnline24 ต่อไป กรุณาอัปเกรดแพ็กเกจของคุณ',
    footer: 'PraxisOnline24 เป็นเครื่องมือจัดการนัดหมาย คลินิกรับผิดชอบข้อมูลผู้ป่วย การตัดสินใจทางการแพทย์ ใบแจ้งหนี้ และใบสั่งยาแต่เพียงผู้เดียว',
  },
  it: {
    greeting: (name) => `Gentile ${name},`,
    confirmationSubject: (practice) => `Conferma appuntamento – ${practice}`,
    confirmationIntro: 'Il tuo appuntamento è stato confermato.',
    fieldDate: 'Data', fieldTime: 'Ora', fieldPractice: 'Studio', fieldAddress: 'Indirizzo',
    cancelLink: 'Annulla appuntamento',
    reminderSubject: (time) => `Promemoria: il tuo appuntamento domani alle ${time}`,
    reminderIntro: 'Ti ricordiamo il tuo appuntamento di domani:',
    cancellationSubject: (date) => `Appuntamento annullato – ${date}`,
    cancellationIntro: (date, time) => `Il tuo appuntamento del ${date} alle ${time} è stato annullato.`,
    cancellationCta: 'Prenota un nuovo appuntamento se necessario.',
    waitlistSubject: (date, time) => `Appuntamento disponibile – ${date} alle ${time}`,
    waitlistIntro: (name, date, time, practice) => `Gentile ${name},\n\nUn appuntamento il ${date} alle ${time} è disponibile presso ${practice}.`,
    waitlistCta: 'Clicca qui per accettare (valido 4 ore):',
    waitlistIgnore: 'Se non hai più bisogno di un appuntamento, puoi ignorare questo messaggio.',
    reviewSubject: (practice) => `Com'è stato il tuo appuntamento presso ${practice}?`,
    reviewIntro: (name, date) => `Gentile ${name},\n\nGrazie per la tua visita del ${date}. Saremmo lieti se lasciassi una breve recensione.`,
    reviewDisclaimer: 'Non inserire diagnosi o dati sanitari.',
    trialSubjectDays: (days) => `La tua prova termina tra ${days} giorno/i – PraxisOnline24`,
    trialSubjectExpired: 'La tua prova è scaduta – PraxisOnline24',
    trialIntroDays: (days, date) => `La tua prova su PraxisOnline24 termina tra ${days} giorno/i (${date}).`,
    trialIntroExpired: 'La tua prova su PraxisOnline24 è scaduta.',
    trialCta: 'Per continuare a usare PraxisOnline24, aggiorna il tuo piano.',
    footer: "PraxisOnline24 è uno strumento di gestione degli appuntamenti. Lo studio è l'unico responsabile dei dati dei pazienti, delle decisioni mediche, dei contenuti delle fatture e delle prescrizioni.",
  },
  nl: {
    greeting: (name) => `Beste ${name},`,
    confirmationSubject: (practice) => `Afspraakbevestiging – ${practice}`,
    confirmationIntro: 'Uw afspraak is bevestigd.',
    fieldDate: 'Datum', fieldTime: 'Tijd', fieldPractice: 'Praktijk', fieldAddress: 'Adres',
    cancelLink: 'Afspraak annuleren',
    reminderSubject: (time) => `Herinnering: uw afspraak morgen om ${time}`,
    reminderIntro: 'We herinneren u aan uw afspraak van morgen:',
    cancellationSubject: (date) => `Afspraak geannuleerd – ${date}`,
    cancellationIntro: (date, time) => `Uw afspraak op ${date} om ${time} is geannuleerd.`,
    cancellationCta: 'Boek indien nodig een nieuwe afspraak.',
    waitlistSubject: (date, time) => `Afspraak beschikbaar – ${date} om ${time}`,
    waitlistIntro: (name, date, time, practice) => `Beste ${name},\n\nEen afspraak op ${date} om ${time} is beschikbaar bij ${practice}.`,
    waitlistCta: 'Klik hier om te accepteren (4 uur geldig):',
    waitlistIgnore: 'Indien u geen afspraak meer nodig heeft, kunt u dit bericht negeren.',
    reviewSubject: (practice) => `Hoe was uw afspraak bij ${practice}?`,
    reviewIntro: (name, date) => `Beste ${name},\n\nBedankt voor uw bezoek op ${date}. We zouden het waarderen als u een korte beoordeling achterlaat.`,
    reviewDisclaimer: 'Voer geen diagnoses of gezondheidsgegevens in.',
    trialSubjectDays: (days) => `Uw proefperiode eindigt over ${days} dag(en) – PraxisOnline24`,
    trialSubjectExpired: 'Uw proefperiode is verlopen – PraxisOnline24',
    trialIntroDays: (days, date) => `Uw proefperiode bij PraxisOnline24 eindigt over ${days} dag(en) (${date}).`,
    trialIntroExpired: 'Uw proefperiode bij PraxisOnline24 is verlopen.',
    trialCta: 'Upgrade uw pakket om PraxisOnline24 te blijven gebruiken.',
    footer: 'PraxisOnline24 is een afspraakbeheertool. De praktijk is als enige verantwoordelijk voor patiëntgegevens, medische beslissingen, factuurinhoud en receptgegevens.',
  },
};

function getLang(lang) {
  return emailT[lang] || emailT.de;
}

// ── HTML escaping ──────────────────────────────────────────

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ── Zentraler Renderer für lokalisierte Systemmails ─────────
// Liest aus utils/emailLocales.js. Neue Mail-Typen müssen nur dort ergänzt
// werden – renderEmail liefert dann automatisch alle 14 Sprachen.
//
//   renderEmail('passwordReset', 'fr', { name: 'Alice', ctaUrl: 'https://…' })
//   → { subject, heading, html, text, localeUsed, typeUsed }
function renderEmail(type, lang, vars = {}) {
  if (!EMAIL_TYPES.includes(type)) {
    throw new Error(`renderEmail: unbekannter Mail-Typ "${type}"`);
  }
  const localeUsed = SUPPORTED_EMAIL_LANGS.includes(lang) ? lang : 'de';
  const L = emailLocales[localeUsed];
  const c = L.common;
  const t = L[type];

  const v = vars || {};
  const subject = typeof t.subject === 'function' ? t.subject(v) : t.subject;
  const heading = t.heading == null
    ? subject
    : (typeof t.heading === 'function' ? t.heading(v) : t.heading);
  const name = String(v.name || '').trim();
  // Begrüßung weglassen, wenn kein Name → vermeidet "Hallo ," in System-Mails
  const greeting = name ? c.greeting(name) : null;
  const body = typeof t.body === 'function' ? t.body(v) : (t.body || '');

  const cta = typeof t.cta === 'function' ? t.cta(v) : (t.cta || null);
  const ctaUrl = v.ctaUrl || null;

  const bodyHtml = escapeHtml(body).replace(/\n/g, '<br>');
  const ctaHtmlPart = (cta && ctaUrl) ? `
    <p style="margin:28px 0;">
      <a href="${escapeHtml(ctaUrl)}" style="background:#1a73e8;color:#fff;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:600;display:inline-block;">${escapeHtml(cta)}</a>
    </p>` : '';
  const ctaTextPart = (cta && ctaUrl) ? `\n\n${cta}\n${ctaUrl}` : '';

  const greetingHtml = greeting ? `\n    <p>${escapeHtml(greeting)}</p>` : '';
  const html = `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;">
    <h2 style="color:#1a73e8;margin-bottom:16px;">${escapeHtml(heading)}</h2>${greetingHtml}
    <p>${bodyHtml}</p>${ctaHtmlPart}
    <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;">
    <p style="color:#9ca3af;font-size:12px;">${escapeHtml(c.signoff)}<br>${escapeHtml(c.footer)}</p>
  </div>`;

  const text = `${greeting ? greeting + '\n\n' : ''}${body}${ctaTextPart}\n\n${c.signoff}\n${c.footer}`;

  return { subject, heading, html, text, localeUsed, typeUsed: type };
}

function pickLang(lang) {
  return SUPPORTED_EMAIL_LANGS.includes(lang) ? lang : 'de';
}

// ── Dev log helper ─────────────────────────────────────────

function devLog(label, to, subject, body) {
  console.log(`\n${'─'.repeat(60)}`);
  console.log(`[DEV-MAIL] ${label}`);
  console.log(`An:      ${to}`);
  console.log(`Betreff: ${subject}`);
  console.log(`\n${body}`);
  console.log('─'.repeat(60));
}

// ── Email functions ────────────────────────────────────────

async function sendAppointmentConfirmation(appointment, practiceInfo) {
  const lang = appointment.patient_language || 'de';
  const T = getLang(lang);
  const cancelUrl = `${process.env.APP_URL || 'http://localhost:3000'}/cancel.html?token=${appointment.cancel_token}`;
  const patientName = `${appointment.patient_first_name} ${appointment.patient_last_name}`;
  const addr = [practiceInfo.address, practiceInfo.zip, practiceInfo.city].filter(Boolean).join(', ');

  const subject = T.confirmationSubject(practiceInfo.name);
  const body = `${T.greeting(patientName)}\n\n${T.confirmationIntro}\n\n${T.fieldDate}: ${appointment.appointment_date}\n${T.fieldTime}: ${appointment.appointment_time}\n${T.fieldPractice}: ${practiceInfo.name}\n${addr ? T.fieldAddress + ': ' + addr : ''}\n\n${T.cancelLink}: ${cancelUrl}\n\n─\n${T.footer}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>${subject}</h2>
      <p>${T.greeting(patientName)}</p>
      <p>${T.confirmationIntro}</p>
      <table style="border-collapse:collapse;width:100%;">
        <tr><td style="padding:8px;font-weight:bold;">${T.fieldDate}:</td><td style="padding:8px;">${appointment.appointment_date}</td></tr>
        <tr><td style="padding:8px;font-weight:bold;">${T.fieldTime}:</td><td style="padding:8px;">${appointment.appointment_time}</td></tr>
        <tr><td style="padding:8px;font-weight:bold;">${T.fieldPractice}:</td><td style="padding:8px;">${practiceInfo.name}</td></tr>
        ${addr ? `<tr><td style="padding:8px;font-weight:bold;">${T.fieldAddress}:</td><td style="padding:8px;">${addr}</td></tr>` : ''}
      </table>
      <p><a href="${cancelUrl}" style="color:#dc3545;">${T.cancelLink}</a></p>
      <hr><p style="font-size:12px;color:#666;">${T.footer}</p>
    </div>
  `;

  return dispatch('TERMINBESTÄTIGUNG', {
    from: process.env.SMTP_FROM || DEFAULT_FROM,
    to: appointment.patient_email,
    subject,
    html,
    text: body,
  });
}

async function sendAppointmentCancellation(appointment, practiceInfo) {
  const lang = appointment.patient_language || 'de';
  const T = getLang(lang);
  const subject = T.cancellationSubject(appointment.appointment_date);
  const body = `${T.cancellationIntro(appointment.appointment_date, appointment.appointment_time)}\n\n${T.cancellationCta}\n\n─\n${T.footer}`;

  return dispatch('TERMINABSAGE', {
    from: process.env.SMTP_FROM || DEFAULT_FROM,
    to: appointment.patient_email,
    subject,
    text: body,
  });
}

async function sendAppointmentReminder(appointment, practiceInfo) {
  const lang = appointment.patient_language || 'de';
  const T = getLang(lang);
  const subject = T.reminderSubject(appointment.appointment_time);
  const patientName = `${appointment.patient_first_name} ${appointment.patient_last_name}`;
  const body = `${T.greeting(patientName)}\n\n${T.reminderIntro}\n\n${T.fieldDate}: ${appointment.appointment_date}\n${T.fieldTime}: ${appointment.appointment_time}\n${T.fieldPractice}: ${practiceInfo.name}\n\n─\n${T.footer}`;

  return dispatch('TERMINERINNERUNG', {
    from: process.env.SMTP_FROM || DEFAULT_FROM,
    to: appointment.patient_email,
    subject,
    text: body,
  });
}

async function sendWaitlistOffer(waitlistEntry, appointment, practice, offerToken) {
  const appUrl = process.env.APP_URL || 'http://localhost:3000';
  const acceptUrl = `${appUrl}/waitlist-accept.html?token=${offerToken}`;
  const lang = waitlistEntry.language || 'de';
  const T = getLang(lang);
  const name = `${waitlistEntry.patient_first_name} ${waitlistEntry.patient_last_name}`;

  const subject = T.waitlistSubject(appointment.appointment_date, appointment.appointment_time);
  const body = `${T.waitlistIntro(name, appointment.appointment_date, appointment.appointment_time, practice.name)}\n${T.waitlistCta}\n${acceptUrl}\n\n${T.waitlistIgnore}`;

  return dispatch('WARTELISTEN-ANGEBOT', {
    from: process.env.SMTP_FROM || DEFAULT_FROM,
    to: waitlistEntry.patient_email,
    subject,
    text: body,
  });
}

async function sendReviewRequest(appointment, practice) {
  const appUrl = process.env.APP_URL || 'http://localhost:3000';
  const reviewUrl = `${appUrl}/review.html?p=${practice.id}`;
  const lang = appointment.patient_language || practice.language || 'de';
  const T = getLang(lang);
  const name = `${appointment.patient_first_name} ${appointment.patient_last_name}`;

  const subject = T.reviewSubject(practice.name);
  const body = `${T.reviewIntro(name, appointment.appointment_date)}\n\n${reviewUrl}\n\n${T.reviewDisclaimer}`;

  return dispatch('BEWERTUNGSANFRAGE', {
    from: process.env.SMTP_FROM || DEFAULT_FROM,
    to: appointment.patient_email,
    subject,
    text: body,
  });
}

async function sendTrialReminder(practice, daysLeft) {
  const appUrl = process.env.APP_URL || 'http://localhost:3000';
  const lang = pickLang(practice.language);
  const type = daysLeft > 0 ? 'trialEndingSoon' : 'trialExpired';

  const { subject, html, text } = renderEmail(type, lang, {
    name: practice.name || '',
    days: daysLeft,
    trialEndDate: practice.trial_end_date,
    ctaUrl: `${appUrl}/subscription.html`,
  });

  if (!practice.email) {
    devLog('TESTPHASEN-ERINNERUNG', '(keine E-Mail hinterlegt)', subject, text);
    return;
  }

  return dispatch('TESTPHASEN-ERINNERUNG', {
    from: process.env.SMTP_FROM || DEFAULT_FROM,
    to: practice.email,
    subject,
    html,
    text,
  });
}

async function sendPasswordReset(user, resetUrl, lang) {
  const name = `${user.first_name || ''} ${user.last_name || ''}`.trim();
  const { subject, html, text } = renderEmail('passwordReset', pickLang(lang), {
    name,
    ctaUrl: resetUrl,
  });

  return dispatch('PASSWORT-RESET', {
    from: process.env.SMTP_FROM || DEFAULT_FROM,
    to: user.email,
    subject,
    html,
    text,
  });
}

// ── Neue lokalisierte Systemmails (zentral via renderEmail) ─

async function sendTrialStarted({ user, practice, lang }) {
  const appUrl = process.env.APP_URL || 'http://localhost:3000';
  const name = user
    ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
    : (practice && practice.name) || '';
  const { subject, html, text } = renderEmail('trialStarted', pickLang(lang || (practice && practice.language)), {
    name,
    trialEndDate: practice && practice.trial_end_date,
    ctaUrl: `${appUrl}/dashboard.html`,
  });

  if (!user || !user.email) {
    devLog('TRIAL-GESTARTET', '(keine E-Mail hinterlegt)', subject, text);
    return;
  }

  return dispatch('TRIAL-GESTARTET', {
    from: process.env.SMTP_FROM || DEFAULT_FROM,
    to: user.email,
    subject,
    html,
    text,
  });
}

async function sendAccountActivated({ user, lang }) {
  const appUrl = process.env.APP_URL || 'http://localhost:3000';
  const name = `${user.first_name || ''} ${user.last_name || ''}`.trim();
  const { subject, html, text } = renderEmail('accountActivated', pickLang(lang), {
    name,
    ctaUrl: `${appUrl}/login.html`,
  });

  return dispatch('KONTO-AKTIVIERT', {
    from: process.env.SMTP_FROM || DEFAULT_FROM,
    to: user.email,
    subject,
    html,
    text,
  });
}

async function sendPasswordChanged({ user, lang }) {
  const appUrl = process.env.APP_URL || 'http://localhost:3000';
  const name = `${user.first_name || ''} ${user.last_name || ''}`.trim();
  const { subject, html, text } = renderEmail('passwordChanged', pickLang(lang), {
    name,
    ctaUrl: `${appUrl}/login.html`,
  });

  return dispatch('PASSWORT-GEAENDERT', {
    from: process.env.SMTP_FROM || DEFAULT_FROM,
    to: user.email,
    subject,
    html,
    text,
  });
}

async function sendEmailConfirmation({ user, confirmUrl, lang }) {
  const name = `${user.first_name || ''} ${user.last_name || ''}`.trim();
  const { subject, html, text } = renderEmail('emailConfirmation', pickLang(lang), {
    name,
    ctaUrl: confirmUrl,
  });

  return dispatch('E-MAIL-BESTAETIGUNG', {
    from: process.env.SMTP_FROM || DEFAULT_FROM,
    to: user.email,
    subject,
    html,
    text,
  });
}

async function sendContactConfirmation({ to, contactName, lang }) {
  const { subject, html, text } = renderEmail('contactConfirmation', pickLang(lang), {
    name: contactName || '',
  });

  return dispatch('KONTAKT-BESTAETIGUNG', {
    from: process.env.SMTP_FROM || DEFAULT_FROM,
    to,
    subject,
    html,
    text,
  });
}

async function sendSubscriptionConfirmation({ user, plan, periodEnd, lang }) {
  const appUrl = process.env.APP_URL || 'http://localhost:3000';
  const name = `${user.first_name || ''} ${user.last_name || ''}`.trim();
  const { subject, html, text } = renderEmail('subscriptionConfirmation', pickLang(lang), {
    name,
    plan,
    periodEnd,
    ctaUrl: `${appUrl}/subscription.html`,
  });

  return dispatch('ABO-BESTAETIGUNG', {
    from: process.env.SMTP_FROM || DEFAULT_FROM,
    to: user.email,
    subject,
    html,
    text,
  });
}

// ── Rechnungs- und Zahlungs-Mails (zentral via renderEmail) ─

async function sendInvoiceCreated({ to, recipientName, invoice, lang }) {
  const appUrl = process.env.APP_URL || 'http://localhost:3000';
  const { subject, html, text } = renderEmail('invoiceCreated', pickLang(lang), {
    name: recipientName || '',
    invoiceNumber: invoice.invoice_number,
    invoiceDate: invoice.invoice_date,
    dueDate: invoice.due_date || invoice.invoice_date,
    totalAmount: invoice.total_amount,
    currency: invoice.currency || 'EUR',
    ctaUrl: `${appUrl}/invoices.html?id=${invoice.id}`,
  });
  return dispatch('RECHNUNG-ERSTELLT', {
    from: process.env.SMTP_FROM || DEFAULT_FROM,
    to,
    subject,
    html,
    text,
  });
}

async function sendInvoiceSent({ to, recipientName, invoice, recipient, lang }) {
  const appUrl = process.env.APP_URL || 'http://localhost:3000';
  const { subject, html, text } = renderEmail('invoiceSent', pickLang(lang), {
    name: recipientName || '',
    invoiceNumber: invoice.invoice_number,
    invoiceDate: invoice.invoice_date,
    dueDate: invoice.due_date || invoice.invoice_date,
    totalAmount: invoice.total_amount,
    currency: invoice.currency || 'EUR',
    recipient: recipient || `${invoice.patient_first_name || ''} ${invoice.patient_last_name || ''}`.trim(),
    ctaUrl: `${appUrl}/invoices.html?id=${invoice.id}`,
  });
  return dispatch('RECHNUNG-GESENDET', {
    from: process.env.SMTP_FROM || DEFAULT_FROM,
    to,
    subject,
    html,
    text,
  });
}

async function sendPaymentReceived({ to, recipientName, invoice, payment, lang }) {
  const appUrl = process.env.APP_URL || 'http://localhost:3000';
  const { subject, html, text } = renderEmail('paymentReceived', pickLang(lang), {
    name: recipientName || '',
    invoiceNumber: invoice.invoice_number,
    paidDate: (payment && payment.paid_date) || new Date().toISOString().slice(0, 10),
    amount: (payment && payment.amount) || invoice.total_amount,
    currency: invoice.currency || 'EUR',
    method: (payment && payment.method) || '—',
    ctaUrl: `${appUrl}/invoices.html?id=${invoice.id}`,
  });
  return dispatch('ZAHLUNG-ERHALTEN', {
    from: process.env.SMTP_FROM || DEFAULT_FROM,
    to,
    subject,
    html,
    text,
  });
}

async function sendPaymentFailed({ to, recipientName, invoice, payment, lang }) {
  const appUrl = process.env.APP_URL || 'http://localhost:3000';
  const { subject, html, text } = renderEmail('paymentFailed', pickLang(lang), {
    name: recipientName || '',
    invoiceNumber: invoice.invoice_number,
    amount: (payment && payment.amount) || invoice.total_amount,
    currency: invoice.currency || 'EUR',
    reason: (payment && payment.reason) || '—',
    ctaUrl: `${appUrl}/subscription.html`,
  });
  return dispatch('ZAHLUNG-FEHLGESCHLAGEN', {
    from: process.env.SMTP_FROM || DEFAULT_FROM,
    to,
    subject,
    html,
    text,
  });
}

async function sendPaymentReminder({ to, recipientName, invoice, daysOverdue, lang }) {
  const appUrl = process.env.APP_URL || 'http://localhost:3000';
  const { subject, html, text } = renderEmail('paymentReminder', pickLang(lang), {
    name: recipientName || '',
    invoiceNumber: invoice.invoice_number,
    invoiceDate: invoice.invoice_date,
    dueDate: invoice.due_date || invoice.invoice_date,
    totalAmount: invoice.total_amount,
    currency: invoice.currency || 'EUR',
    daysOverdue: daysOverdue || 0,
    ctaUrl: `${appUrl}/invoices.html?id=${invoice.id}`,
  });
  return dispatch('ZAHLUNGSERINNERUNG', {
    from: process.env.SMTP_FROM || DEFAULT_FROM,
    to,
    subject,
    html,
    text,
  });
}

async function sendSubscriptionCancelled({ user, plan, effectiveDate, lang }) {
  const appUrl = process.env.APP_URL || 'http://localhost:3000';
  const name = `${user.first_name || ''} ${user.last_name || ''}`.trim();
  const { subject, html, text } = renderEmail('subscriptionCancelled', pickLang(lang), {
    name,
    plan,
    effectiveDate,
    ctaUrl: `${appUrl}/subscription.html`,
  });
  return dispatch('ABO-GEKUENDIGT', {
    from: process.env.SMTP_FROM || DEFAULT_FROM,
    to: user.email,
    subject,
    html,
    text,
  });
}

// ── Praxis-Admin-/Betriebs-Mails (zentral via renderEmail) ──

async function sendDemoRequestAdmin({ to, practice, contact, email, country, language, lang }) {
  const appUrl = process.env.APP_URL || 'http://localhost:3000';
  const { subject, html, text } = renderEmail('demoRequestAdmin', pickLang(lang), {
    practice, contact, email, country, language,
    ctaUrl: `${appUrl}/owner/demo-requests`,
  });
  return dispatch('DEMO-ANFRAGE-ADMIN', {
    from: process.env.SMTP_FROM || DEFAULT_FROM,
    to: to || 'info@praxisonline24.com',
    replyTo: email,
    subject,
    html,
    text,
  });
}

// Einheitlich: action='paused' oder 'reactivated'
async function sendAccountStatusChange({ to, practiceName, action, reason, lang }) {
  const appUrl = process.env.APP_URL || 'http://localhost:3000';
  const ctaPath = action === 'paused' ? '/subscription.html' : '/dashboard.html';
  const { subject, html, text } = renderEmail('accountStatusChange', pickLang(lang), {
    name: practiceName || '',
    action,
    reason,
    ctaUrl: `${appUrl}${ctaPath}`,
  });
  const label = action === 'paused' ? 'KONTO-PAUSIERT' : 'KONTO-REAKTIVIERT';
  return dispatch(label, {
    from: process.env.SMTP_FROM || DEFAULT_FROM,
    to,
    subject,
    html,
    text,
  });
}

async function sendSecurityNewLogin({ user, datetime, device, location, lang }) {
  const appUrl = process.env.APP_URL || 'http://localhost:3000';
  const name = `${user.first_name || ''} ${user.last_name || ''}`.trim();
  const { subject, html, text } = renderEmail('securityNewLogin', pickLang(lang), {
    name,
    datetime: datetime || new Date().toISOString().replace('T', ' ').slice(0, 19),
    device: device || '—',
    location: location || '—',
    ctaUrl: `${appUrl}/settings.html`,
  });
  return dispatch('SICHERHEIT-NEUER-LOGIN', {
    from: process.env.SMTP_FROM || DEFAULT_FROM,
    to: user.email,
    subject,
    html,
    text,
  });
}

async function sendDailySummary({ to, recipientName, date, stats, lang }) {
  const appUrl = process.env.APP_URL || 'http://localhost:3000';
  const s = stats || {};
  const { subject, html, text } = renderEmail('dailySummary', pickLang(lang), {
    name: recipientName || '',
    date: date || new Date().toISOString().slice(0, 10),
    newBookings: s.newBookings || 0,
    cancellations: s.cancellations || 0,
    newReviews: s.newReviews || 0,
    newWaitlistEntries: s.newWaitlistEntries || 0,
    ctaUrl: `${appUrl}/dashboard.html`,
  });
  return dispatch('TAGESUEBERSICHT', {
    from: process.env.SMTP_FROM || DEFAULT_FROM,
    to,
    subject,
    html,
    text,
  });
}

// ── Patienten-Erinnerungs-Mails (zentral via renderEmail) ───

async function sendAppointmentPreparation({ patient, appointment, practice, lang }) {
  const appUrl = process.env.APP_URL || 'http://localhost:3000';
  const name = `${patient.first_name || patient.patient_first_name || ''} ${patient.last_name || patient.patient_last_name || ''}`.trim();
  const to = patient.email || patient.patient_email;
  const { subject, html, text } = renderEmail('appointmentPreparation', pickLang(lang || patient.language || patient.patient_language), {
    name,
    appointmentDate: appointment.appointment_date,
    appointmentTime: appointment.appointment_time,
    practice: practice.name,
    ctaUrl: appointment.cancel_token
      ? `${appUrl}/my-appointments.html?token=${appointment.cancel_token}`
      : `${appUrl}/my-appointments.html`,
  });
  return dispatch('TERMIN-VORBEREITUNG', {
    from: process.env.SMTP_FROM || DEFAULT_FROM,
    to,
    subject,
    html,
    text,
  });
}

async function sendAppointmentMissed({ patient, appointment, practice, lang }) {
  const appUrl = process.env.APP_URL || 'http://localhost:3000';
  const name = `${patient.first_name || patient.patient_first_name || ''} ${patient.last_name || patient.patient_last_name || ''}`.trim();
  const to = patient.email || patient.patient_email;
  const { subject, html, text } = renderEmail('appointmentMissed', pickLang(lang || patient.language || patient.patient_language), {
    name,
    appointmentDate: appointment.appointment_date,
    appointmentTime: appointment.appointment_time,
    practice: practice.name,
    ctaUrl: `${appUrl}/booking.html?practice=${practice.id}`,
  });
  return dispatch('TERMIN-VERPASST', {
    from: process.env.SMTP_FROM || DEFAULT_FROM,
    to,
    subject,
    html,
    text,
  });
}

async function sendFollowUpDue({ patient, practice, lang }) {
  const appUrl = process.env.APP_URL || 'http://localhost:3000';
  const name = `${patient.first_name || patient.patient_first_name || ''} ${patient.last_name || patient.patient_last_name || ''}`.trim();
  const to = patient.email || patient.patient_email;
  const { subject, html, text } = renderEmail('followUpDue', pickLang(lang || patient.language || patient.patient_language), {
    name,
    practice: practice.name,
    ctaUrl: `${appUrl}/booking.html?practice=${practice.id}`,
  });
  return dispatch('FOLGETERMIN-FAELLIG', {
    from: process.env.SMTP_FROM || DEFAULT_FROM,
    to,
    subject,
    html,
    text,
  });
}

async function sendYearlyCheckupDue({ patient, practice, lang }) {
  const appUrl = process.env.APP_URL || 'http://localhost:3000';
  const name = `${patient.first_name || patient.patient_first_name || ''} ${patient.last_name || patient.patient_last_name || ''}`.trim();
  const to = patient.email || patient.patient_email;
  const { subject, html, text } = renderEmail('yearlyCheckupDue', pickLang(lang || patient.language || patient.patient_language), {
    name,
    practice: practice.name,
    ctaUrl: `${appUrl}/booking.html?practice=${practice.id}`,
  });
  return dispatch('JAEHRLICHE-VORSORGE', {
    from: process.env.SMTP_FROM || DEFAULT_FROM,
    to,
    subject,
    html,
    text,
  });
}

async function sendTrialConvertedToPaid({ user, plan, periodEnd, amount, currency, lang }) {
  const appUrl = process.env.APP_URL || 'http://localhost:3000';
  const name = `${user.first_name || ''} ${user.last_name || ''}`.trim();
  const { subject, html, text } = renderEmail('trialConvertedToPaid', pickLang(lang), {
    name,
    plan,
    periodEnd,
    amount,
    currency: currency || 'EUR',
    ctaUrl: `${appUrl}/subscription.html`,
  });
  return dispatch('TRIAL-ZU-ABO', {
    from: process.env.SMTP_FROM || DEFAULT_FROM,
    to: user.email,
    subject,
    html,
    text,
  });
}

// ── Invite-E-Mail Lokalisierung ──────────────────────────────────────────────
// Pro Sprache eine geschlossene Lokale-Definition: subject + Bausteine, aus
// denen sowohl text- als auch HTML-Variante gebaut werden. Damit ist es
// unmöglich, dass Subject und Body aus unterschiedlichen Sprachen kommen.
const INVITE_LOGIN_URL = 'https://praxisonline24.onrender.com/login.html';

const inviteLocales = {
  de: {
    subject: 'Ihre PraxisOnline24 Demo ist bereit',
    heading: 'Ihre PraxisOnline24 Demo ist bereit',
    greeting: (n) => `Hallo ${n},`,
    introText: (p) => `Vielen Dank für Ihre Demo-Anfrage bei PraxisOnline24!\nIhr Praxis-Konto für „${p}" wurde vorbereitet. Bitte setzen Sie jetzt Ihr Passwort:`,
    introHtml: (p) => `vielen Dank für Ihre Demo-Anfrage! Ihr Praxis-Konto für ${p} wurde vorbereitet.`,
    cta: 'Passwort festlegen →',
    validityText: 'Dieser Link ist 24 Stunden gültig.',
    validityHtml: 'Dieser Link ist <strong>24 Stunden</strong> gültig.',
    loginHintText: 'Nach dem Festlegen Ihres Passworts können Sie sich hier anmelden:',
    loginHintHtml: 'Danach können Sie sich anmelden unter:',
    signoff: 'Ihr PraxisOnline24-Team',
    tagline: 'PraxisOnline24 – Ihre Praxis. Online. Rund um die Uhr.',
  },
  en: {
    subject: 'Your PraxisOnline24 Demo is Ready',
    heading: 'Your PraxisOnline24 Demo is Ready',
    greeting: (n) => `Hello ${n},`,
    introText: (p) => `Thank you for requesting a demo of PraxisOnline24!\nYour practice account for "${p}" has been prepared. Please set your password:`,
    introHtml: (p) => `thank you for requesting a demo! Your practice account for ${p} has been prepared.`,
    cta: 'Set password →',
    validityText: 'This link is valid for 24 hours.',
    validityHtml: 'This link is valid for <strong>24 hours</strong>.',
    loginHintText: 'After setting your password, log in here:',
    loginHintHtml: 'After that, log in at:',
    signoff: 'Your PraxisOnline24 Team',
    tagline: 'PraxisOnline24 – Your practice. Online. Around the clock.',
  },
  fr: {
    subject: 'Votre démo PraxisOnline24 est prête',
    heading: 'Votre démo PraxisOnline24 est prête',
    greeting: (n) => `Bonjour ${n},`,
    introText: (p) => `Merci d'avoir demandé une démo de PraxisOnline24 !\nVotre compte cabinet pour « ${p} » a été préparé. Veuillez définir votre mot de passe :`,
    introHtml: (p) => `merci d'avoir demandé une démo ! Votre compte cabinet pour ${p} a été préparé.`,
    cta: 'Définir le mot de passe →',
    validityText: 'Ce lien est valable 24 heures.',
    validityHtml: 'Ce lien est valable <strong>24 heures</strong>.',
    loginHintText: 'Une fois votre mot de passe défini, connectez-vous ici :',
    loginHintHtml: 'Ensuite, connectez-vous sur :',
    signoff: "L'équipe PraxisOnline24",
    tagline: 'PraxisOnline24 – Votre cabinet. En ligne. 24h/24.',
  },
  es: {
    subject: 'Su demo de PraxisOnline24 está lista',
    heading: 'Su demo de PraxisOnline24 está lista',
    greeting: (n) => `Estimado/a ${n},`,
    introText: (p) => `¡Gracias por solicitar una demo de PraxisOnline24!\nSu cuenta para "${p}" ha sido preparada. Por favor, establezca su contraseña:`,
    introHtml: (p) => `¡gracias por solicitar una demo! Su cuenta para ${p} ha sido preparada.`,
    cta: 'Establecer contraseña →',
    validityText: 'Este enlace es válido por 24 horas.',
    validityHtml: 'Este enlace es válido por <strong>24 horas</strong>.',
    loginHintText: 'Después de establecer su contraseña, inicie sesión aquí:',
    loginHintHtml: 'Después, inicie sesión en:',
    signoff: 'El equipo de PraxisOnline24',
    tagline: 'PraxisOnline24 – Su consultorio. En línea. 24/7.',
  },
  it: {
    subject: 'La tua demo di PraxisOnline24 è pronta',
    heading: 'La tua demo di PraxisOnline24 è pronta',
    greeting: (n) => `Gentile ${n},`,
    introText: (p) => `Grazie per aver richiesto una demo di PraxisOnline24!\nIl tuo account studio per "${p}" è stato preparato. Imposta ora la tua password:`,
    introHtml: (p) => `grazie per aver richiesto una demo! Il tuo account studio per ${p} è stato preparato.`,
    cta: 'Imposta password →',
    validityText: 'Questo link è valido per 24 ore.',
    validityHtml: 'Questo link è valido per <strong>24 ore</strong>.',
    loginHintText: 'Dopo aver impostato la password, accedi qui:',
    loginHintHtml: 'In seguito, accedi su:',
    signoff: 'Il team di PraxisOnline24',
    tagline: 'PraxisOnline24 – Il tuo studio. Online. 24 ore su 24.',
  },
  pt: {
    subject: 'Sua demo do PraxisOnline24 está pronta',
    heading: 'Sua demo do PraxisOnline24 está pronta',
    greeting: (n) => `Prezado/a ${n},`,
    introText: (p) => `Obrigado por solicitar uma demonstração do PraxisOnline24!\nSua conta para "${p}" foi preparada. Por favor, defina sua senha:`,
    introHtml: (p) => `obrigado por solicitar uma demonstração! Sua conta para ${p} foi preparada.`,
    cta: 'Definir senha →',
    validityText: 'Este link é válido por 24 horas.',
    validityHtml: 'Este link é válido por <strong>24 horas</strong>.',
    loginHintText: 'Após definir sua senha, faça login aqui:',
    loginHintHtml: 'Em seguida, faça login em:',
    signoff: 'Equipe PraxisOnline24',
    tagline: 'PraxisOnline24 – Sua clínica. Online. 24/7.',
  },
  nl: {
    subject: 'Uw PraxisOnline24-demo is klaar',
    heading: 'Uw PraxisOnline24-demo is klaar',
    greeting: (n) => `Beste ${n},`,
    introText: (p) => `Bedankt voor uw demo-aanvraag bij PraxisOnline24!\nUw praktijkaccount voor "${p}" is voorbereid. Stel nu uw wachtwoord in:`,
    introHtml: (p) => `bedankt voor uw demo-aanvraag! Uw praktijkaccount voor ${p} is voorbereid.`,
    cta: 'Wachtwoord instellen →',
    validityText: 'Deze link is 24 uur geldig.',
    validityHtml: 'Deze link is <strong>24 uur</strong> geldig.',
    loginHintText: 'Na het instellen van uw wachtwoord kunt u hier inloggen:',
    loginHintHtml: 'Daarna kunt u inloggen op:',
    signoff: 'Uw PraxisOnline24-team',
    tagline: 'PraxisOnline24 – Uw praktijk. Online. 24/7.',
  },
  tr: {
    subject: 'PraxisOnline24 demonuz hazır',
    heading: 'PraxisOnline24 demonuz hazır',
    greeting: (n) => `Sayın ${n},`,
    introText: (p) => `PraxisOnline24 demo talebiniz için teşekkür ederiz!\n"${p}" için klinik hesabınız hazırlandı. Lütfen şimdi şifrenizi belirleyin:`,
    introHtml: (p) => `demo talebiniz için teşekkür ederiz! ${p} için klinik hesabınız hazırlandı.`,
    cta: 'Şifre belirle →',
    validityText: 'Bu bağlantı 24 saat geçerlidir.',
    validityHtml: 'Bu bağlantı <strong>24 saat</strong> geçerlidir.',
    loginHintText: 'Şifrenizi belirledikten sonra buradan giriş yapabilirsiniz:',
    loginHintHtml: 'Ardından şu adresten giriş yapın:',
    signoff: 'PraxisOnline24 Ekibiniz',
    tagline: 'PraxisOnline24 – Kliniğiniz. Çevrimiçi. 7/24.',
  },
  ar: {
    subject: 'عرض PraxisOnline24 التجريبي الخاص بك جاهز',
    heading: 'عرض PraxisOnline24 التجريبي الخاص بك جاهز',
    greeting: (n) => `مرحباً ${n}،`,
    introText: (p) => `شكراً لطلبك عرضاً تجريبياً من PraxisOnline24!\nتم إعداد حساب العيادة الخاص بك لـ "${p}". الرجاء تعيين كلمة المرور الخاصة بك الآن:`,
    introHtml: (p) => `شكراً لطلبك عرضاً تجريبياً! تم إعداد حساب العيادة الخاص بك لـ ${p}.`,
    cta: 'تعيين كلمة المرور ←',
    validityText: 'هذا الرابط صالح لمدة 24 ساعة.',
    validityHtml: 'هذا الرابط صالح لمدة <strong>24 ساعة</strong>.',
    loginHintText: 'بعد تعيين كلمة المرور، يمكنك تسجيل الدخول هنا:',
    loginHintHtml: 'بعد ذلك، سجّل الدخول عبر:',
    signoff: 'فريق PraxisOnline24',
    tagline: 'PraxisOnline24 – عيادتك. عبر الإنترنت. على مدار الساعة.',
  },
  ru: {
    subject: 'Ваша демоверсия PraxisOnline24 готова',
    heading: 'Ваша демоверсия PraxisOnline24 готова',
    greeting: (n) => `Здравствуйте, ${n}!`,
    introText: (p) => `Спасибо за запрос демо-доступа к PraxisOnline24!\nУчётная запись клиники для «${p}» подготовлена. Пожалуйста, установите пароль:`,
    introHtml: (p) => `спасибо за запрос демо-доступа! Учётная запись клиники для ${p} подготовлена.`,
    cta: 'Установить пароль →',
    validityText: 'Эта ссылка действительна 24 часа.',
    validityHtml: 'Эта ссылка действительна <strong>24 часа</strong>.',
    loginHintText: 'После установки пароля войдите здесь:',
    loginHintHtml: 'Затем войдите по адресу:',
    signoff: 'Команда PraxisOnline24',
    tagline: 'PraxisOnline24 – Ваша клиника. Онлайн. Круглосуточно.',
  },
  id: {
    subject: 'Demo PraxisOnline24 Anda sudah siap',
    heading: 'Demo PraxisOnline24 Anda sudah siap',
    greeting: (n) => `Yth. ${n},`,
    introText: (p) => `Terima kasih atas permintaan demo PraxisOnline24!\nAkun klinik untuk "${p}" telah disiapkan. Silakan atur kata sandi Anda sekarang:`,
    introHtml: (p) => `terima kasih atas permintaan demo! Akun klinik untuk ${p} telah disiapkan.`,
    cta: 'Atur kata sandi →',
    validityText: 'Tautan ini berlaku selama 24 jam.',
    validityHtml: 'Tautan ini berlaku selama <strong>24 jam</strong>.',
    loginHintText: 'Setelah mengatur kata sandi, masuk di sini:',
    loginHintHtml: 'Setelah itu, masuk di:',
    signoff: 'Tim PraxisOnline24',
    tagline: 'PraxisOnline24 – Klinik Anda. Online. 24/7.',
  },
  hi: {
    subject: 'आपका PraxisOnline24 डेमो तैयार है',
    heading: 'आपका PraxisOnline24 डेमो तैयार है',
    greeting: (n) => `नमस्ते ${n},`,
    introText: (p) => `PraxisOnline24 के डेमो का अनुरोध करने के लिए धन्यवाद!\n"${p}" के लिए आपका क्लिनिक खाता तैयार किया गया है। कृपया अब अपना पासवर्ड सेट करें:`,
    introHtml: (p) => `डेमो के अनुरोध के लिए धन्यवाद! ${p} के लिए आपका क्लिनिक खाता तैयार है।`,
    cta: 'पासवर्ड सेट करें →',
    validityText: 'यह लिंक 24 घंटे के लिए मान्य है।',
    validityHtml: 'यह लिंक <strong>24 घंटे</strong> के लिए मान्य है।',
    loginHintText: 'पासवर्ड सेट करने के बाद यहाँ लॉगिन करें:',
    loginHintHtml: 'इसके बाद यहाँ लॉगिन करें:',
    signoff: 'आपकी PraxisOnline24 टीम',
    tagline: 'PraxisOnline24 – आपका क्लिनिक. ऑनलाइन. 24/7.',
  },
  zh: {
    subject: '您的 PraxisOnline24 演示已就绪',
    heading: '您的 PraxisOnline24 演示已就绪',
    greeting: (n) => `您好，${n}，`,
    introText: (p) => `感谢您申请 PraxisOnline24 演示！\n您为 "${p}" 准备的诊所账户已就绪。请立即设置您的密码：`,
    introHtml: (p) => `感谢您申请演示！${p} 的诊所账户已就绪。`,
    cta: '设置密码 →',
    validityText: '此链接有效期为 24 小时。',
    validityHtml: '此链接有效期为 <strong>24 小时</strong>。',
    loginHintText: '设置密码后，请在此处登录：',
    loginHintHtml: '之后请在此登录：',
    signoff: 'PraxisOnline24 团队',
    tagline: 'PraxisOnline24 – 您的诊所。在线。全天候。',
  },
  th: {
    subject: 'การสาธิต PraxisOnline24 ของคุณพร้อมแล้ว',
    heading: 'การสาธิต PraxisOnline24 ของคุณพร้อมแล้ว',
    greeting: (n) => `สวัสดี ${n},`,
    introText: (p) => `ขอบคุณที่ขอใช้บริการสาธิต PraxisOnline24!\nบัญชีคลินิกสำหรับ "${p}" ได้รับการเตรียมไว้แล้ว กรุณาตั้งรหัสผ่านของคุณตอนนี้:`,
    introHtml: (p) => `ขอบคุณที่ขอใช้บริการสาธิต! บัญชีคลินิกสำหรับ ${p} ได้รับการเตรียมไว้แล้ว`,
    cta: 'ตั้งรหัสผ่าน →',
    validityText: 'ลิงก์นี้ใช้ได้ 24 ชั่วโมง',
    validityHtml: 'ลิงก์นี้ใช้ได้ <strong>24 ชั่วโมง</strong>',
    loginHintText: 'หลังจากตั้งรหัสผ่านแล้ว เข้าสู่ระบบที่นี่:',
    loginHintHtml: 'จากนั้นเข้าสู่ระบบที่:',
    signoff: 'ทีม PraxisOnline24',
    tagline: 'PraxisOnline24 – คลินิกของคุณ ออนไลน์ ตลอด 24 ชั่วโมง',
  },
};

function buildInviteEmail(lang, contact, practice, setPasswordUrl) {
  const localeUsed = inviteLocales[lang] ? lang : 'de';
  const T = inviteLocales[localeUsed];

  const text = [
    T.greeting(contact),
    T.introText(practice),
    setPasswordUrl,
    T.validityText,
    T.loginHintText,
    INVITE_LOGIN_URL,
    T.signoff,
  ].join('\n\n');

  const eName = escapeHtml(contact);
  const ePrac = escapeHtml(practice);
  const eUrl  = escapeHtml(setPasswordUrl);

  // WICHTIG: Kein Whitespace zwischen <a> und CTA-Text – sonst zerlegen manche
  // Mail-Clients (Outlook, Apple Mail) den Anchor in mehrere TextNodes und der
  // sichtbare Button-Bereich ist größer als der klickbare. Zusätzlich klare
  // Fallback-Anzeige des Klartext-Links unter dem Button, damit ein Empfänger
  // den Set-Password-Link auch dann erreichen kann, wenn der Mail-Client den
  // Button-Render aus irgendeinem Grund verschluckt.
  const html = `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;">
    <h2 style="color:#1a73e8;margin-bottom:16px;">${escapeHtml(T.heading || T.subject)}</h2>
    <p>${T.greeting(`<strong>${eName}</strong>`)}</p>
    <p>${T.introHtml(`<strong>${ePrac}</strong>`)}</p>
    <p style="margin:28px 0;"><a href="${eUrl}" style="background:#1a73e8;color:#fff;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:600;display:inline-block;">${escapeHtml(T.cta)}</a></p>
    <p style="color:#6b7280;font-size:13px;word-break:break-all;">
      <a href="${eUrl}" style="color:#1a73e8;">${eUrl}</a>
    </p>
    <p style="color:#6b7280;font-size:13px;">${T.validityHtml}<br>
    ${T.loginHintHtml} <a href="${escapeHtml(INVITE_LOGIN_URL)}" style="color:#1a73e8;">praxisonline24.onrender.com/login.html</a></p>
    <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;">
    <p style="color:#9ca3af;font-size:12px;">${escapeHtml(T.tagline)}</p>
  </div>`;

  return { subject: T.subject, text, html, localeUsed };
}

async function sendInviteEmail({ contact, practice, email, setPasswordUrl, lang }) {
  lang = lang || 'de';
  const { subject, text, html, localeUsed } = buildInviteEmail(lang, contact, practice, setPasswordUrl);

  if (lang !== localeUsed) {
    console.warn(`[invite] kein Template für lang="${lang}" – fallback auf "${localeUsed}"`);
  }

  // Entry-Log: sichtbare Bestätigung dass sendInviteEmail aufgerufen wurde –
  // Token nur als 8-Char-Präfix loggen (kein Token-Leak ins Logbuch).
  const tokenPrefix = ((setPasswordUrl || '').split('token=')[1] || '').slice(0, 8) || '?';
  console.log(`[invite] aufgerufen: to=${email} lang=${lang} (locale-used=${localeUsed}) practice="${practice}" token=${tokenPrefix}…`);

  if (!process.env.BREVO_API_KEY) {
    console.log(`[invite] BREVO_API_KEY fehlt – Link im Log: ${setPasswordUrl}`);
  }

  return dispatch('EINLADUNGS-E-MAIL', {
    from: process.env.SMTP_FROM || DEFAULT_FROM,
    to: email,
    subject,
    html,
    text,
  });
}

async function sendDemoRequest({ practice, contact, email, phone, country, language, message }) {
  const subject = `Demo-Anfrage: ${practice}`;
  const body = `Neue Demo-Anfrage über PraxisOnline24\n\nPraxis: ${practice}\nAnsprechpartner: ${contact}\nE-Mail: ${email}${phone ? '\nTelefon: ' + phone : ''}\nLand: ${country}${language ? '\nSprache: ' + language : ''}${message ? '\nNachricht:\n' + message : ''}`;

  const ePractice  = escapeHtml(practice);
  const eContact   = escapeHtml(contact);
  const eEmail     = escapeHtml(email);
  const ePhone     = phone ? escapeHtml(phone) : '';
  const eCountry   = escapeHtml(country);
  const eLanguage  = language ? escapeHtml(language) : '';
  const eMessage   = message ? escapeHtml(message).replace(/\n/g, '<br>') : '';

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
      <h2 style="color:#1a73e8;">Neue Demo-Anfrage</h2>
      <table style="border-collapse:collapse;width:100%;">
        <tr><td style="padding:8px;font-weight:bold;width:160px;">Praxis:</td><td style="padding:8px;">${ePractice}</td></tr>
        <tr><td style="padding:8px;font-weight:bold;">Ansprechpartner:</td><td style="padding:8px;">${eContact}</td></tr>
        <tr><td style="padding:8px;font-weight:bold;">E-Mail:</td><td style="padding:8px;"><a href="mailto:${eEmail}">${eEmail}</a></td></tr>
        ${ePhone ? `<tr><td style="padding:8px;font-weight:bold;">Telefon:</td><td style="padding:8px;"><a href="tel:${ePhone}">${ePhone}</a></td></tr>` : ''}
        <tr><td style="padding:8px;font-weight:bold;">Land:</td><td style="padding:8px;">${eCountry}</td></tr>
        ${eLanguage ? `<tr><td style="padding:8px;font-weight:bold;">Sprache:</td><td style="padding:8px;">${eLanguage}</td></tr>` : ''}
        ${eMessage ? `<tr><td style="padding:8px;font-weight:bold;vertical-align:top;">Nachricht:</td><td style="padding:8px;">${eMessage}</td></tr>` : ''}
      </table>
    </div>
  `;

  return dispatch('DEMO-ANFRAGE', {
    from: process.env.SMTP_FROM || DEFAULT_FROM,
    to: 'info@praxisonline24.com',
    replyTo: email,
    subject,
    html,
    text: body,
  });
}

module.exports = {
  sendAppointmentConfirmation,
  sendAppointmentCancellation,
  sendAppointmentReminder,
  sendWaitlistOffer,
  sendReviewRequest,
  sendTrialReminder,
  sendPasswordReset,
  sendDemoRequest,
  sendInviteEmail,
  // Neu (lokalisiert via zentraler emailLocales-Struktur):
  sendTrialStarted,
  sendAccountActivated,
  sendPasswordChanged,
  sendEmailConfirmation,
  sendContactConfirmation,
  sendSubscriptionConfirmation,
  // Rechnungs- und Zahlungs-Mails:
  sendInvoiceCreated,
  sendInvoiceSent,
  sendPaymentReceived,
  sendPaymentFailed,
  sendPaymentReminder,
  sendSubscriptionCancelled,
  sendTrialConvertedToPaid,
  // Patienten-Erinnerungs-Mails:
  sendAppointmentPreparation,
  sendAppointmentMissed,
  sendFollowUpDue,
  sendYearlyCheckupDue,
  // Praxis-Admin-/Betriebs-Mails:
  sendDemoRequestAdmin,
  sendAccountStatusChange,
  sendSecurityNewLogin,
  sendDailySummary,
  renderEmail,
  verifyMailConfig,
  brevoSanitizedSummary,
  buildInviteEmail,
  inviteLocales,
  emailLocales,
  SUPPORTED_EMAIL_LANGS,
  EMAIL_TYPES,
};
