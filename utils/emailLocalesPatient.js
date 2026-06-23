// utils/emailLocalesPatient.js
// Patienten-Erinnerungs-Mails in allen 14 unterstützten Sprachen. Wird in
// utils/emailLocales.js in das zentrale emailLocales-Objekt gemerged.
//
// Mail-Typen (datenschutz-neutral – keine Diagnosen, Medikamente,
// Gesundheitsdaten):
//   appointmentPreparation – Termin-Vorbereitung    (vars: appointmentDate, appointmentTime, practice)
//   appointmentMissed      – Verpasster Termin       (vars: appointmentDate, appointmentTime, practice)
//   followUpDue            – Folgetermin fällig      (vars: practice)
//   yearlyCheckupDue       – Jährliche Vorsorge      (vars: practice)
//
// Pro Sprache: { subject, body(vars), cta }. heading defaultet auf subject,
// greeting/signoff/footer kommen aus L.common in emailLocales.js.

const patientLocales = {
  // ── Deutsch ────────────────────────────────────────────────
  de: {
    appointmentPreparation: {
      subject: (v) => `Vorbereitung für Ihren Termin am ${v.appointmentDate}`,
      body: (v) => `Ihr Termin am ${v.appointmentDate} um ${v.appointmentTime} bei ${v.practice} steht bevor.\n\nBitte bringen Sie folgende Unterlagen mit:\n• Versichertenkarte\n• Personalausweis\n\nBitte erscheinen Sie 10 Minuten vor Ihrem Termin.`,
      cta: 'Termin ansehen →',
    },
    appointmentMissed: {
      subject: 'Sie haben Ihren Termin verpasst',
      body: (v) => `Leider haben wir Sie zu Ihrem Termin am ${v.appointmentDate} um ${v.appointmentTime} bei ${v.practice} nicht antreffen können.\n\nFalls Sie weiterhin einen Termin wünschen, können Sie über den Button unten einen neuen buchen.`,
      cta: 'Neuen Termin buchen →',
    },
    followUpDue: {
      subject: (v) => `Ihr nächster Termin steht an – ${v.practice}`,
      body: (v) => `Es ist Zeit für Ihren nächsten Termin bei ${v.practice}.\n\nBitte buchen Sie über den Button unten einen passenden Termin.`,
      cta: 'Termin buchen →',
    },
    yearlyCheckupDue: {
      subject: (v) => `Jährliche Erinnerung – ${v.practice}`,
      body: (v) => `Es ist wieder Zeit für Ihren jährlichen Termin bei ${v.practice}.\n\nBitte buchen Sie über den Button unten einen passenden Termin.`,
      cta: 'Termin buchen →',
    },
  },

  // ── Englisch ───────────────────────────────────────────────
  en: {
    appointmentPreparation: {
      subject: (v) => `Preparing for your appointment on ${v.appointmentDate}`,
      body: (v) => `Your appointment on ${v.appointmentDate} at ${v.appointmentTime} at ${v.practice} is coming up.\n\nPlease bring the following documents:\n• Health insurance card\n• ID card\n\nPlease arrive 10 minutes before your appointment.`,
      cta: 'View appointment →',
    },
    appointmentMissed: {
      subject: 'You missed your appointment',
      body: (v) => `Unfortunately we did not see you at your appointment on ${v.appointmentDate} at ${v.appointmentTime} at ${v.practice}.\n\nIf you would still like an appointment, you can book a new one via the button below.`,
      cta: 'Book a new appointment →',
    },
    followUpDue: {
      subject: (v) => `Your next appointment is due – ${v.practice}`,
      body: (v) => `It is time for your next appointment at ${v.practice}.\n\nPlease book a suitable time via the button below.`,
      cta: 'Book appointment →',
    },
    yearlyCheckupDue: {
      subject: (v) => `Annual reminder – ${v.practice}`,
      body: (v) => `It is time for your annual appointment at ${v.practice}.\n\nPlease book a suitable time via the button below.`,
      cta: 'Book appointment →',
    },
  },

  // ── Französisch ────────────────────────────────────────────
  fr: {
    appointmentPreparation: {
      subject: (v) => `Préparation de votre rendez-vous du ${v.appointmentDate}`,
      body: (v) => `Votre rendez-vous du ${v.appointmentDate} à ${v.appointmentTime} au cabinet ${v.practice} approche.\n\nMerci d'apporter les documents suivants :\n• Carte d'assurance maladie\n• Carte d'identité\n\nMerci d'arriver 10 minutes avant votre rendez-vous.`,
      cta: 'Voir le rendez-vous →',
    },
    appointmentMissed: {
      subject: 'Vous avez manqué votre rendez-vous',
      body: (v) => `Nous regrettons que vous ne soyez pas venu(e) à votre rendez-vous du ${v.appointmentDate} à ${v.appointmentTime} au cabinet ${v.practice}.\n\nSi vous souhaitez toujours un rendez-vous, vous pouvez en réserver un nouveau via le bouton ci-dessous.`,
      cta: 'Prendre un nouveau rendez-vous →',
    },
    followUpDue: {
      subject: (v) => `Votre prochain rendez-vous arrive – ${v.practice}`,
      body: (v) => `Il est temps de prendre votre prochain rendez-vous au cabinet ${v.practice}.\n\nVeuillez réserver un créneau qui vous convient via le bouton ci-dessous.`,
      cta: 'Prendre rendez-vous →',
    },
    yearlyCheckupDue: {
      subject: (v) => `Rappel annuel – ${v.practice}`,
      body: (v) => `Il est temps pour votre rendez-vous annuel au cabinet ${v.practice}.\n\nVeuillez réserver un créneau qui vous convient via le bouton ci-dessous.`,
      cta: 'Prendre rendez-vous →',
    },
  },

  // ── Spanisch ───────────────────────────────────────────────
  es: {
    appointmentPreparation: {
      subject: (v) => `Preparación para su cita del ${v.appointmentDate}`,
      body: (v) => `Su cita del ${v.appointmentDate} a las ${v.appointmentTime} en ${v.practice} se aproxima.\n\nPor favor, traiga los siguientes documentos:\n• Tarjeta sanitaria\n• Documento de identidad\n\nPor favor, llegue 10 minutos antes de su cita.`,
      cta: 'Ver cita →',
    },
    appointmentMissed: {
      subject: 'No acudió a su cita',
      body: (v) => `Lamentablemente no le vimos en su cita del ${v.appointmentDate} a las ${v.appointmentTime} en ${v.practice}.\n\nSi sigue queriendo una cita, puede reservar una nueva con el botón a continuación.`,
      cta: 'Reservar nueva cita →',
    },
    followUpDue: {
      subject: (v) => `Su próxima cita está pendiente – ${v.practice}`,
      body: (v) => `Es momento de su próxima cita en ${v.practice}.\n\nPor favor, reserve un horario adecuado con el botón a continuación.`,
      cta: 'Reservar cita →',
    },
    yearlyCheckupDue: {
      subject: (v) => `Recordatorio anual – ${v.practice}`,
      body: (v) => `Ha llegado el momento de su cita anual en ${v.practice}.\n\nPor favor, reserve un horario adecuado con el botón a continuación.`,
      cta: 'Reservar cita →',
    },
  },

  // ── Italienisch ────────────────────────────────────────────
  it: {
    appointmentPreparation: {
      subject: (v) => `Preparazione per il tuo appuntamento del ${v.appointmentDate}`,
      body: (v) => `Il tuo appuntamento del ${v.appointmentDate} alle ${v.appointmentTime} presso ${v.practice} si avvicina.\n\nPorta con te i seguenti documenti:\n• Tessera sanitaria\n• Documento d'identità\n\nArriva 10 minuti prima dell'appuntamento.`,
      cta: "Vedi l'appuntamento →",
    },
    appointmentMissed: {
      subject: 'Hai mancato il tuo appuntamento',
      body: (v) => `Purtroppo non ti abbiamo visto al tuo appuntamento del ${v.appointmentDate} alle ${v.appointmentTime} presso ${v.practice}.\n\nSe desideri ancora un appuntamento, puoi prenotarne uno nuovo con il pulsante qui sotto.`,
      cta: 'Prenota un nuovo appuntamento →',
    },
    followUpDue: {
      subject: (v) => `Il tuo prossimo appuntamento è in programma – ${v.practice}`,
      body: (v) => `È ora del tuo prossimo appuntamento presso ${v.practice}.\n\nPrenota un orario adatto con il pulsante qui sotto.`,
      cta: 'Prenota appuntamento →',
    },
    yearlyCheckupDue: {
      subject: (v) => `Promemoria annuale – ${v.practice}`,
      body: (v) => `È di nuovo ora del tuo appuntamento annuale presso ${v.practice}.\n\nPrenota un orario adatto con il pulsante qui sotto.`,
      cta: 'Prenota appuntamento →',
    },
  },

  // ── Portugiesisch ──────────────────────────────────────────
  pt: {
    appointmentPreparation: {
      subject: (v) => `Preparação para sua consulta em ${v.appointmentDate}`,
      body: (v) => `Sua consulta em ${v.appointmentDate} às ${v.appointmentTime} em ${v.practice} está próxima.\n\nPor favor, traga os seguintes documentos:\n• Cartão do convênio\n• Documento de identidade\n\nPor favor, chegue 10 minutos antes da sua consulta.`,
      cta: 'Ver consulta →',
    },
    appointmentMissed: {
      subject: 'Você perdeu sua consulta',
      body: (v) => `Infelizmente não te recebemos na sua consulta em ${v.appointmentDate} às ${v.appointmentTime} em ${v.practice}.\n\nSe ainda quiser uma consulta, pode agendar uma nova pelo botão abaixo.`,
      cta: 'Agendar nova consulta →',
    },
    followUpDue: {
      subject: (v) => `Sua próxima consulta está pendente – ${v.practice}`,
      body: (v) => `É hora da sua próxima consulta em ${v.practice}.\n\nPor favor, agende um horário adequado pelo botão abaixo.`,
      cta: 'Agendar consulta →',
    },
    yearlyCheckupDue: {
      subject: (v) => `Lembrete anual – ${v.practice}`,
      body: (v) => `É hora da sua consulta anual em ${v.practice}.\n\nPor favor, agende um horário adequado pelo botão abaixo.`,
      cta: 'Agendar consulta →',
    },
  },

  // ── Niederländisch ─────────────────────────────────────────
  nl: {
    appointmentPreparation: {
      subject: (v) => `Voorbereiding voor uw afspraak op ${v.appointmentDate}`,
      body: (v) => `Uw afspraak op ${v.appointmentDate} om ${v.appointmentTime} bij ${v.practice} nadert.\n\nNeem de volgende documenten mee:\n• Zorgverzekeringspas\n• Identiteitsbewijs\n\nKom 10 minuten vóór uw afspraak.`,
      cta: 'Afspraak bekijken →',
    },
    appointmentMissed: {
      subject: 'U heeft uw afspraak gemist',
      body: (v) => `Helaas hebben we u niet gezien op uw afspraak op ${v.appointmentDate} om ${v.appointmentTime} bij ${v.practice}.\n\nAls u nog steeds een afspraak wilt, kunt u via onderstaande knop een nieuwe boeken.`,
      cta: 'Nieuwe afspraak boeken →',
    },
    followUpDue: {
      subject: (v) => `Uw volgende afspraak staat aan – ${v.practice}`,
      body: (v) => `Het is tijd voor uw volgende afspraak bij ${v.practice}.\n\nBoek via onderstaande knop een passend tijdstip.`,
      cta: 'Afspraak boeken →',
    },
    yearlyCheckupDue: {
      subject: (v) => `Jaarlijkse herinnering – ${v.practice}`,
      body: (v) => `Het is weer tijd voor uw jaarlijkse afspraak bij ${v.practice}.\n\nBoek via onderstaande knop een passend tijdstip.`,
      cta: 'Afspraak boeken →',
    },
  },

  // ── Türkisch ───────────────────────────────────────────────
  tr: {
    appointmentPreparation: {
      subject: (v) => `${v.appointmentDate} tarihli randevunuza hazırlık`,
      body: (v) => `${v.appointmentDate} ${v.appointmentTime} tarihli ${v.practice} kliniğindeki randevunuz yaklaşıyor.\n\nLütfen aşağıdaki belgeleri yanınızda getirin:\n• Sağlık sigortası kartı\n• Kimlik kartı\n\nLütfen randevunuzdan 10 dakika önce gelin.`,
      cta: 'Randevuyu görüntüle →',
    },
    appointmentMissed: {
      subject: 'Randevunuza gelmediniz',
      body: (v) => `Maalesef ${v.appointmentDate} ${v.appointmentTime} tarihli ${v.practice} kliniğindeki randevunuzda sizi göremedik.\n\nHâlâ bir randevu istiyorsanız, aşağıdaki düğme ile yeni bir randevu alabilirsiniz.`,
      cta: 'Yeni randevu al →',
    },
    followUpDue: {
      subject: (v) => `Sıradaki randevunuz vakti geldi – ${v.practice}`,
      body: (v) => `${v.practice} kliniğindeki bir sonraki randevunuzun zamanı geldi.\n\nLütfen aşağıdaki düğme ile uygun bir zaman ayırın.`,
      cta: 'Randevu al →',
    },
    yearlyCheckupDue: {
      subject: (v) => `Yıllık hatırlatma – ${v.practice}`,
      body: (v) => `${v.practice} kliniğindeki yıllık randevunuzun zamanı yine geldi.\n\nLütfen aşağıdaki düğme ile uygun bir zaman ayırın.`,
      cta: 'Randevu al →',
    },
  },

  // ── Arabisch ───────────────────────────────────────────────
  ar: {
    appointmentPreparation: {
      subject: (v) => `التحضير لموعدك في ${v.appointmentDate}`,
      body: (v) => `يقترب موعدك في ${v.appointmentDate} الساعة ${v.appointmentTime} في ${v.practice}.\n\nيرجى إحضار المستندات التالية:\n• بطاقة التأمين الصحي\n• بطاقة الهوية\n\nيرجى الحضور قبل موعدك بـ 10 دقائق.`,
      cta: 'عرض الموعد ←',
    },
    appointmentMissed: {
      subject: 'لقد فاتك موعدك',
      body: (v) => `للأسف لم نرَك في موعدك في ${v.appointmentDate} الساعة ${v.appointmentTime} في ${v.practice}.\n\nإذا كنت لا تزال ترغب في موعد، يمكنك حجز موعد جديد عبر الزر أدناه.`,
      cta: 'حجز موعد جديد ←',
    },
    followUpDue: {
      subject: (v) => `موعدك التالي حان – ${v.practice}`,
      body: (v) => `حان وقت موعدك التالي في ${v.practice}.\n\nيرجى حجز وقت مناسب عبر الزر أدناه.`,
      cta: 'حجز موعد ←',
    },
    yearlyCheckupDue: {
      subject: (v) => `تذكير سنوي – ${v.practice}`,
      body: (v) => `حان وقت موعدك السنوي في ${v.practice}.\n\nيرجى حجز وقت مناسب عبر الزر أدناه.`,
      cta: 'حجز موعد ←',
    },
  },

  // ── Russisch ───────────────────────────────────────────────
  ru: {
    appointmentPreparation: {
      subject: (v) => `Подготовка к вашей записи ${v.appointmentDate}`,
      body: (v) => `Ваша запись ${v.appointmentDate} в ${v.appointmentTime} в клинике ${v.practice} приближается.\n\nПожалуйста, возьмите с собой следующие документы:\n• Полис медицинского страхования\n• Удостоверение личности\n\nПожалуйста, приходите за 10 минут до приёма.`,
      cta: 'Посмотреть запись →',
    },
    appointmentMissed: {
      subject: 'Вы пропустили приём',
      body: (v) => `К сожалению, мы не увидели вас на приёме ${v.appointmentDate} в ${v.appointmentTime} в клинике ${v.practice}.\n\nЕсли вы всё ещё хотите записаться, вы можете оформить новую запись по кнопке ниже.`,
      cta: 'Новая запись →',
    },
    followUpDue: {
      subject: (v) => `Ваша следующая запись пора – ${v.practice}`,
      body: (v) => `Пришло время следующей записи в клинике ${v.practice}.\n\nПожалуйста, выберите удобное время по кнопке ниже.`,
      cta: 'Записаться →',
    },
    yearlyCheckupDue: {
      subject: (v) => `Ежегодное напоминание – ${v.practice}`,
      body: (v) => `Пришло время вашего ежегодного приёма в клинике ${v.practice}.\n\nПожалуйста, выберите удобное время по кнопке ниже.`,
      cta: 'Записаться →',
    },
  },

  // ── Indonesisch ────────────────────────────────────────────
  id: {
    appointmentPreparation: {
      subject: (v) => `Persiapan untuk janji Anda pada ${v.appointmentDate}`,
      body: (v) => `Janji Anda pada ${v.appointmentDate} pukul ${v.appointmentTime} di ${v.practice} akan segera tiba.\n\nMohon bawa dokumen berikut:\n• Kartu asuransi kesehatan\n• Kartu identitas\n\nMohon datang 10 menit sebelum janji Anda.`,
      cta: 'Lihat janji →',
    },
    appointmentMissed: {
      subject: 'Anda melewatkan janji Anda',
      body: (v) => `Sayangnya kami tidak melihat Anda di janji pada ${v.appointmentDate} pukul ${v.appointmentTime} di ${v.practice}.\n\nJika Anda masih menginginkan janji, Anda dapat memesan janji baru melalui tombol di bawah.`,
      cta: 'Pesan janji baru →',
    },
    followUpDue: {
      subject: (v) => `Janji berikutnya sudah waktunya – ${v.practice}`,
      body: (v) => `Saatnya janji berikutnya di ${v.practice}.\n\nMohon pesan waktu yang sesuai melalui tombol di bawah.`,
      cta: 'Pesan janji →',
    },
    yearlyCheckupDue: {
      subject: (v) => `Pengingat tahunan – ${v.practice}`,
      body: (v) => `Saatnya janji tahunan Anda di ${v.practice}.\n\nMohon pesan waktu yang sesuai melalui tombol di bawah.`,
      cta: 'Pesan janji →',
    },
  },

  // ── Hindi ──────────────────────────────────────────────────
  hi: {
    appointmentPreparation: {
      subject: (v) => `${v.appointmentDate} को आपकी अपॉइंटमेंट की तैयारी`,
      body: (v) => `${v.practice} में ${v.appointmentDate} को ${v.appointmentTime} पर आपकी अपॉइंटमेंट निकट है।\n\nकृपया निम्नलिखित दस्तावेज़ साथ लाएँ:\n• स्वास्थ्य बीमा कार्ड\n• पहचान पत्र\n\nकृपया अपनी अपॉइंटमेंट से 10 मिनट पहले पहुँचें।`,
      cta: 'अपॉइंटमेंट देखें →',
    },
    appointmentMissed: {
      subject: 'आपने अपनी अपॉइंटमेंट मिस की',
      body: (v) => `दुर्भाग्यवश ${v.practice} में ${v.appointmentDate} को ${v.appointmentTime} पर आपकी अपॉइंटमेंट पर हम आपसे नहीं मिल सके।\n\nयदि आप अब भी अपॉइंटमेंट चाहते हैं, तो नीचे दिए गए बटन से नई अपॉइंटमेंट बुक कर सकते हैं।`,
      cta: 'नई अपॉइंटमेंट बुक करें →',
    },
    followUpDue: {
      subject: (v) => `आपकी अगली अपॉइंटमेंट का समय आ गया है – ${v.practice}`,
      body: (v) => `${v.practice} में आपकी अगली अपॉइंटमेंट का समय आ गया है।\n\nकृपया नीचे दिए गए बटन से उपयुक्त समय बुक करें।`,
      cta: 'अपॉइंटमेंट बुक करें →',
    },
    yearlyCheckupDue: {
      subject: (v) => `वार्षिक अनुस्मारक – ${v.practice}`,
      body: (v) => `${v.practice} में आपकी वार्षिक अपॉइंटमेंट का समय फिर से आ गया है।\n\nकृपया नीचे दिए गए बटन से उपयुक्त समय बुक करें।`,
      cta: 'अपॉइंटमेंट बुक करें →',
    },
  },

  // ── Chinesisch (vereinfacht) ───────────────────────────────
  zh: {
    appointmentPreparation: {
      subject: (v) => `${v.appointmentDate} 预约准备`,
      body: (v) => `您在 ${v.practice} 于 ${v.appointmentDate} ${v.appointmentTime} 的预约即将到来。\n\n请携带以下证件：\n• 医保卡\n• 身份证\n\n请在预约时间前 10 分钟到达。`,
      cta: '查看预约 →',
    },
    appointmentMissed: {
      subject: '您错过了预约',
      body: (v) => `很遗憾，我们没有在 ${v.appointmentDate} ${v.appointmentTime} ${v.practice} 的预约中见到您。\n\n如果您仍然需要预约，可以通过下方按钮重新预约。`,
      cta: '重新预约 →',
    },
    followUpDue: {
      subject: (v) => `您的下次预约该到了 – ${v.practice}`,
      body: (v) => `该是您在 ${v.practice} 的下次预约时间了。\n\n请通过下方按钮选择合适的时间。`,
      cta: '预约 →',
    },
    yearlyCheckupDue: {
      subject: (v) => `年度提醒 – ${v.practice}`,
      body: (v) => `又到了您在 ${v.practice} 的年度预约时间。\n\n请通过下方按钮选择合适的时间。`,
      cta: '预约 →',
    },
  },

  // ── Thai ───────────────────────────────────────────────────
  th: {
    appointmentPreparation: {
      subject: (v) => `เตรียมตัวสำหรับการนัดหมายของคุณวันที่ ${v.appointmentDate}`,
      body: (v) => `การนัดหมายของคุณวันที่ ${v.appointmentDate} เวลา ${v.appointmentTime} ที่ ${v.practice} ใกล้เข้ามาแล้ว\n\nกรุณานำเอกสารต่อไปนี้มาด้วย:\n• บัตรประกันสุขภาพ\n• บัตรประจำตัวประชาชน\n\nกรุณามาก่อนเวลานัดหมาย 10 นาที`,
      cta: 'ดูการนัดหมาย →',
    },
    appointmentMissed: {
      subject: 'คุณพลาดการนัดหมาย',
      body: (v) => `น่าเสียดายที่เราไม่ได้พบคุณในการนัดหมายวันที่ ${v.appointmentDate} เวลา ${v.appointmentTime} ที่ ${v.practice}\n\nหากคุณยังต้องการการนัดหมาย คุณสามารถจองการนัดหมายใหม่ได้ผ่านปุ่มด้านล่าง`,
      cta: 'จองการนัดหมายใหม่ →',
    },
    followUpDue: {
      subject: (v) => `การนัดหมายครั้งต่อไปของคุณถึงเวลาแล้ว – ${v.practice}`,
      body: (v) => `ถึงเวลาการนัดหมายครั้งต่อไปของคุณที่ ${v.practice} แล้ว\n\nกรุณาจองเวลาที่เหมาะสมผ่านปุ่มด้านล่าง`,
      cta: 'จองการนัดหมาย →',
    },
    yearlyCheckupDue: {
      subject: (v) => `การเตือนประจำปี – ${v.practice}`,
      body: (v) => `ถึงเวลาการนัดหมายประจำปีของคุณที่ ${v.practice} อีกครั้งแล้ว\n\nกรุณาจองเวลาที่เหมาะสมผ่านปุ่มด้านล่าง`,
      cta: 'จองการนัดหมาย →',
    },
  },
};

module.exports = patientLocales;
