// ── State ─────────────────────────────────────────────────

const BK_LANGS = ['de', 'en', 'fr', 'es', 'pt', 'ar', 'tr', 'id', 'ru', 'zh', 'hi', 'th'];

const bk = {
  practiceId: null,
  lang: 'de',
  practitioners: [],
  practitionerId: null,
  calYear: new Date().getFullYear(),
  calMonth: new Date().getMonth() + 1,
  availableDays: [],
  selectedDate: null,
  selectedTime: null,
  cancelToken: null,
};

// ── Translations ──────────────────────────────────────────

const T = {
  de: {
    step1: 'Termin', step2: 'Daten', step3: 'Bestätigung',
    chooseDoctor: 'Behandler wählen',
    chooseDate: 'Datum wählen',
    chooseTime: 'Uhrzeit wählen',
    noSlotsDay: 'Keine freien Termine an diesem Tag.',
    loadingDays: 'Lade verfügbare Tage…',
    loadingSlots: 'Lade Zeitfenster…',
    next: 'Weiter →',
    back: '← Zurück',
    yourDetails: 'Ihre Daten',
    firstName: 'Vorname', lastName: 'Nachname',
    email: 'E-Mail (für Bestätigung)', phone: 'Telefon',
    appointmentType: 'Terminart',
    bookBtn: 'Termin verbindlich buchen',
    booked: 'Termin erfolgreich gebucht!',
    confirmEmail: 'Eine Bestätigungs-E-Mail wird in Kürze gesendet.',
    addToCalendar: 'Im Kalender speichern (.ics)',
    cancelLink: 'Termin absagen',
    bookAnother: 'Weiteren Termin buchen',
    myAppointments: 'Meine Termine',
    joinWaitlist: 'Auf Warteliste eintragen',
    langLabel: 'Sprache',
    types: ['Ersttermin', 'Folgetermin', 'Vorsorge', 'Beratung', 'Impfung', 'Überweisung', 'Sonstiges'],
    months: ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'],
    weekdays: ['Mo','Di','Mi','Do','Fr','Sa','So'],
    summary: 'Zusammenfassung',
    practitioner: 'Behandler',
    date: 'Datum', time: 'Uhrzeit', type: 'Terminart',
    none: '–',
    errorRequired: 'Bitte alle Pflichtfelder ausfüllen.',
    errorSlot: 'Bitte Uhrzeit wählen.',
    limitReached: 'Das monatliche Terminlimit der Praxis ist erreicht. Bitte wenden Sie sich direkt an die Praxis.',
  },
  en: {
    step1: 'Appointment', step2: 'Details', step3: 'Confirmation',
    chooseDoctor: 'Choose practitioner',
    chooseDate: 'Choose date',
    chooseTime: 'Choose time',
    noSlotsDay: 'No appointments available on this day.',
    loadingDays: 'Loading available days…',
    loadingSlots: 'Loading slots…',
    next: 'Next →',
    back: '← Back',
    yourDetails: 'Your details',
    firstName: 'First name', lastName: 'Last name',
    email: 'Email (for confirmation)', phone: 'Phone',
    appointmentType: 'Appointment type',
    bookBtn: 'Book appointment',
    booked: 'Appointment booked successfully!',
    confirmEmail: 'A confirmation email will be sent shortly.',
    addToCalendar: 'Save to calendar (.ics)',
    cancelLink: 'Cancel appointment',
    bookAnother: 'Book another appointment',
    myAppointments: 'My appointments',
    joinWaitlist: 'Join waitlist',
    langLabel: 'Language',
    types: ['First visit','Follow-up','Check-up','Consultation','Vaccination','Referral','Other'],
    months: ['January','February','March','April','May','June','July','August','September','October','November','December'],
    weekdays: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
    summary: 'Summary',
    practitioner: 'Practitioner',
    date: 'Date', time: 'Time', type: 'Type',
    none: '–',
    errorRequired: 'Please fill in all required fields.',
    errorSlot: 'Please select a time.',
    limitReached: 'This practice has reached the monthly appointment limit. Please contact them directly.',
  },
  fr: {
    step1: 'Rendez-vous', step2: 'Coordonnées', step3: 'Confirmation',
    chooseDoctor: 'Choisir un praticien',
    chooseDate: 'Choisir une date',
    chooseTime: 'Choisir un horaire',
    noSlotsDay: 'Aucun rendez-vous disponible ce jour.',
    loadingDays: 'Chargement des jours disponibles…',
    loadingSlots: 'Chargement des créneaux…',
    next: 'Suivant →',
    back: '← Retour',
    yourDetails: 'Vos coordonnées',
    firstName: 'Prénom', lastName: 'Nom',
    email: 'E-mail (pour confirmation)', phone: 'Téléphone',
    appointmentType: 'Type de rendez-vous',
    bookBtn: 'Confirmer le rendez-vous',
    booked: 'Rendez-vous pris avec succès !',
    confirmEmail: 'Un e-mail de confirmation vous sera envoyé.',
    addToCalendar: 'Ajouter au calendrier (.ics)',
    cancelLink: 'Annuler le rendez-vous',
    bookAnother: 'Prendre un autre rendez-vous',
    myAppointments: 'Mes rendez-vous',
    joinWaitlist: "Rejoindre la liste d'attente",
    langLabel: 'Langue',
    types: ['Première visite','Suivi','Bilan','Consultation','Vaccination','Référence','Autre'],
    months: ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'],
    weekdays: ['Lu','Ma','Me','Je','Ve','Sa','Di'],
    summary: 'Récapitulatif',
    practitioner: 'Praticien',
    date: 'Date', time: 'Heure', type: 'Type',
    none: '–',
    errorRequired: 'Veuillez remplir tous les champs obligatoires.',
    errorSlot: 'Veuillez sélectionner un horaire.',
    limitReached: 'Le cabinet a atteint sa limite mensuelle de rendez-vous. Veuillez les contacter directement.',
  },
  es: {
    step1: 'Cita', step2: 'Datos', step3: 'Confirmación',
    chooseDoctor: 'Elegir profesional',
    chooseDate: 'Elegir fecha',
    chooseTime: 'Elegir hora',
    noSlotsDay: 'No hay citas disponibles este día.',
    loadingDays: 'Cargando días disponibles…',
    loadingSlots: 'Cargando horarios…',
    next: 'Siguiente →',
    back: '← Volver',
    yourDetails: 'Sus datos',
    firstName: 'Nombre', lastName: 'Apellido',
    email: 'E-mail (para confirmación)', phone: 'Teléfono',
    appointmentType: 'Tipo de cita',
    bookBtn: 'Confirmar cita',
    booked: '¡Cita reservada con éxito!',
    confirmEmail: 'Se enviará un correo de confirmación en breve.',
    addToCalendar: 'Guardar en calendario (.ics)',
    cancelLink: 'Cancelar cita',
    bookAnother: 'Reservar otra cita',
    myAppointments: 'Mis citas',
    joinWaitlist: 'Unirse a lista de espera',
    langLabel: 'Idioma',
    types: ['Primera visita','Seguimiento','Revisión','Consulta','Vacunación','Derivación','Otro'],
    months: ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'],
    weekdays: ['Lu','Ma','Mi','Ju','Vi','Sá','Do'],
    summary: 'Resumen',
    practitioner: 'Profesional',
    date: 'Fecha', time: 'Hora', type: 'Tipo',
    none: '–',
    errorRequired: 'Por favor complete todos los campos obligatorios.',
    errorSlot: 'Por favor seleccione una hora.',
    limitReached: 'El consultorio ha alcanzado el límite mensual de citas. Contáctelos directamente.',
  },
  pt: {
    step1: 'Consulta', step2: 'Dados', step3: 'Confirmação',
    chooseDoctor: 'Escolher profissional',
    chooseDate: 'Escolher data',
    chooseTime: 'Escolher horário',
    noSlotsDay: 'Nenhuma consulta disponível neste dia.',
    loadingDays: 'Carregando dias disponíveis…',
    loadingSlots: 'Carregando horários…',
    next: 'Próximo →',
    back: '← Voltar',
    yourDetails: 'Seus dados',
    firstName: 'Nome', lastName: 'Sobrenome',
    email: 'E-mail (para confirmação)', phone: 'Telefone',
    appointmentType: 'Tipo de consulta',
    bookBtn: 'Confirmar consulta',
    booked: 'Consulta agendada com sucesso!',
    confirmEmail: 'Um e-mail de confirmação será enviado em breve.',
    addToCalendar: 'Salvar no calendário (.ics)',
    cancelLink: 'Cancelar consulta',
    bookAnother: 'Agendar outra consulta',
    myAppointments: 'Minhas consultas',
    joinWaitlist: 'Entrar na lista de espera',
    langLabel: 'Idioma',
    types: ['Primeira consulta','Retorno','Preventivo','Consultoria','Vacinação','Encaminhamento','Outro'],
    months: ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'],
    weekdays: ['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'],
    summary: 'Resumo',
    practitioner: 'Profissional',
    date: 'Data', time: 'Hora', type: 'Tipo',
    none: '–',
    errorRequired: 'Por favor preencha todos os campos obrigatórios.',
    errorSlot: 'Por favor selecione um horário.',
    limitReached: 'O consultório atingiu o limite mensal de consultas. Entre em contato diretamente.',
  },
  ar: {
    step1: 'موعد', step2: 'بيانات', step3: 'تأكيد',
    chooseDoctor: 'اختر الطبيب',
    chooseDate: 'اختر التاريخ',
    chooseTime: 'اختر الوقت',
    noSlotsDay: 'لا توجد مواعيد متاحة في هذا اليوم.',
    loadingDays: 'جارٍ تحميل الأيام المتاحة…',
    loadingSlots: 'جارٍ تحميل المواعيد…',
    next: 'التالي ←',
    back: '→ رجوع',
    yourDetails: 'بياناتك',
    firstName: 'الاسم الأول', lastName: 'اسم العائلة',
    email: 'البريد الإلكتروني (للتأكيد)', phone: 'الهاتف',
    appointmentType: 'نوع الموعد',
    bookBtn: 'تأكيد الحجز',
    booked: 'تم حجز الموعد بنجاح!',
    confirmEmail: 'سيتم إرسال بريد إلكتروني للتأكيد قريبًا.',
    addToCalendar: 'حفظ في التقويم (.ics)',
    cancelLink: 'إلغاء الموعد',
    bookAnother: 'حجز موعد آخر',
    myAppointments: 'مواعيدي',
    joinWaitlist: 'الانضمام إلى قائمة الانتظار',
    langLabel: 'اللغة',
    types: ['زيارة أولى','متابعة','وقاية','استشارة','تطعيم','إحالة','أخرى'],
    months: ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'],
    weekdays: ['إث','ثل','أر','خم','جم','سب','أح'],
    summary: 'ملخص',
    practitioner: 'الطبيب',
    date: 'التاريخ', time: 'الوقت', type: 'النوع',
    none: '–',
    errorRequired: 'يرجى ملء جميع الحقول المطلوبة.',
    errorSlot: 'يرجى اختيار وقت.',
    limitReached: 'وصلت العيادة إلى الحد الشهري للمواعيد. يرجى التواصل معهم مباشرة.',
  },
  tr: {
    step1: 'Randevu', step2: 'Bilgiler', step3: 'Onay',
    chooseDoctor: 'Uzman seçin',
    chooseDate: 'Tarih seçin',
    chooseTime: 'Saat seçin',
    noSlotsDay: 'Bu gün için uygun randevu yok.',
    loadingDays: 'Uygun günler yükleniyor…',
    loadingSlots: 'Saatler yükleniyor…',
    next: 'İleri →',
    back: '← Geri',
    yourDetails: 'Bilgileriniz',
    firstName: 'Ad', lastName: 'Soyad',
    email: 'E-posta (onay için)', phone: 'Telefon',
    appointmentType: 'Randevu türü',
    bookBtn: 'Randevuyu onayla',
    booked: 'Randevu başarıyla alındı!',
    confirmEmail: 'Onay e-postası kısa süre içinde gönderilecek.',
    addToCalendar: 'Takvime ekle (.ics)',
    cancelLink: 'Randevuyu iptal et',
    bookAnother: 'Başka randevu al',
    myAppointments: 'Randevularım',
    joinWaitlist: 'Bekleme listesine katıl',
    langLabel: 'Dil',
    types: ['İlk muayene','Takip','Kontrol','Danışma','Aşı','Sevk','Diğer'],
    months: ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'],
    weekdays: ['Pt','Sa','Ça','Pe','Cu','Ct','Pz'],
    summary: 'Özet',
    practitioner: 'Uzman',
    date: 'Tarih', time: 'Saat', type: 'Tür',
    none: '–',
    errorRequired: 'Lütfen tüm zorunlu alanları doldurun.',
    errorSlot: 'Lütfen bir saat seçin.',
    limitReached: 'Klinik aylık randevu limitine ulaştı. Lütfen doğrudan iletişime geçin.',
  },
  id: {
    step1: 'Janji', step2: 'Data', step3: 'Konfirmasi',
    chooseDoctor: 'Pilih dokter',
    chooseDate: 'Pilih tanggal',
    chooseTime: 'Pilih jam',
    noSlotsDay: 'Tidak ada jadwal tersedia pada hari ini.',
    loadingDays: 'Memuat hari tersedia…',
    loadingSlots: 'Memuat jadwal…',
    next: 'Lanjut →',
    back: '← Kembali',
    yourDetails: 'Data Anda',
    firstName: 'Nama depan', lastName: 'Nama belakang',
    email: 'Email (untuk konfirmasi)', phone: 'Telepon',
    appointmentType: 'Jenis janji',
    bookBtn: 'Konfirmasi janji',
    booked: 'Janji berhasil dibuat!',
    confirmEmail: 'Email konfirmasi akan segera dikirim.',
    addToCalendar: 'Simpan ke kalender (.ics)',
    cancelLink: 'Batalkan janji',
    bookAnother: 'Buat janji lain',
    myAppointments: 'Janji saya',
    joinWaitlist: 'Daftar antrean',
    langLabel: 'Bahasa',
    types: ['Kunjungan pertama','Lanjutan','Pemeriksaan rutin','Konsultasi','Vaksinasi','Rujukan','Lainnya'],
    months: ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'],
    weekdays: ['Sen','Sel','Rab','Kam','Jum','Sab','Min'],
    summary: 'Ringkasan',
    practitioner: 'Dokter',
    date: 'Tanggal', time: 'Jam', type: 'Jenis',
    none: '–',
    errorRequired: 'Harap isi semua kolom yang wajib diisi.',
    errorSlot: 'Harap pilih jam.',
    limitReached: 'Klinik telah mencapai batas janji bulanan. Hubungi mereka langsung.',
  },
  ru: {
    step1: 'Запись', step2: 'Данные', step3: 'Подтверждение',
    chooseDoctor: 'Выбрать врача',
    chooseDate: 'Выбрать дату',
    chooseTime: 'Выбрать время',
    noSlotsDay: 'В этот день нет свободных записей.',
    loadingDays: 'Загрузка доступных дней…',
    loadingSlots: 'Загрузка времени…',
    next: 'Далее →',
    back: '← Назад',
    yourDetails: 'Ваши данные',
    firstName: 'Имя', lastName: 'Фамилия',
    email: 'Эл. почта (для подтверждения)', phone: 'Телефон',
    appointmentType: 'Тип записи',
    bookBtn: 'Подтвердить запись',
    booked: 'Запись успешно создана!',
    confirmEmail: 'Подтверждение будет отправлено на вашу почту.',
    addToCalendar: 'Добавить в календарь (.ics)',
    cancelLink: 'Отменить запись',
    bookAnother: 'Создать ещё одну запись',
    myAppointments: 'Мои записи',
    joinWaitlist: 'В список ожидания',
    langLabel: 'Язык',
    types: ['Первичный приём','Повторный приём','Профилактика','Консультация','Вакцинация','Направление','Другое'],
    months: ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'],
    weekdays: ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'],
    summary: 'Сводка',
    practitioner: 'Врач',
    date: 'Дата', time: 'Время', type: 'Тип',
    none: '–',
    errorRequired: 'Пожалуйста, заполните все обязательные поля.',
    errorSlot: 'Пожалуйста, выберите время.',
    limitReached: 'Клиника достигла месячного лимита записей. Обратитесь к ним напрямую.',
  },
  zh: {
    step1: '预约', step2: '信息', step3: '确认',
    chooseDoctor: '选择医生',
    chooseDate: '选择日期',
    chooseTime: '选择时间',
    noSlotsDay: '本日无可用预约。',
    loadingDays: '加载可用日期…',
    loadingSlots: '加载时间段…',
    next: '下一步 →',
    back: '← 返回',
    yourDetails: '您的信息',
    firstName: '名', lastName: '姓',
    email: '电子邮件（用于确认）', phone: '电话',
    appointmentType: '预约类型',
    bookBtn: '确认预约',
    booked: '预约成功！',
    confirmEmail: '确认邮件将很快发送。',
    addToCalendar: '添加到日历(.ics)',
    cancelLink: '取消预约',
    bookAnother: '再次预约',
    myAppointments: '我的预约',
    joinWaitlist: '加入候诊名单',
    langLabel: '语言',
    types: ['初诊','复诊','体检','咨询','疫苗接种','转诊','其他'],
    months: ['一月','二月','三月','四月','五月','六月','七月','八月','九月','十月','十一月','十二月'],
    weekdays: ['周一','周二','周三','周四','周五','周六','周日'],
    summary: '摘要',
    practitioner: '医生',
    date: '日期', time: '时间', type: '类型',
    none: '–',
    errorRequired: '请填写所有必填项。',
    errorSlot: '请选择时间。',
    limitReached: '该诊所已达到本月预约上限，请直接联系他们。',
  },
  hi: {
    step1: 'अपॉइंटमेंट', step2: 'विवरण', step3: 'पुष्टि',
    chooseDoctor: 'चिकित्सक चुनें',
    chooseDate: 'तारीख चुनें',
    chooseTime: 'समय चुनें',
    noSlotsDay: 'इस दिन कोई उपलब्ध अपॉइंटमेंट नहीं है।',
    loadingDays: 'उपलब्ध दिन लोड हो रहे हैं…',
    loadingSlots: 'समय स्लॉट लोड हो रहे हैं…',
    next: 'आगे →',
    back: '← वापस',
    yourDetails: 'आपका विवरण',
    firstName: 'पहला नाम', lastName: 'उपनाम',
    email: 'ईमेल (पुष्टि के लिए)', phone: 'फ़ोन',
    appointmentType: 'अपॉइंटमेंट का प्रकार',
    bookBtn: 'अपॉइंटमेंट बुक करें',
    booked: 'अपॉइंटमेंट सफलतापूर्वक बुक हो गई!',
    confirmEmail: 'एक पुष्टिकरण ईमेल जल्द भेजा जाएगा।',
    addToCalendar: 'कैलेंडर में जोड़ें (.ics)',
    cancelLink: 'अपॉइंटमेंट रद्द करें',
    bookAnother: 'एक और अपॉइंटमेंट बुक करें',
    myAppointments: 'मेरी अपॉइंटमेंट',
    joinWaitlist: 'प्रतीक्षा सूची में जोड़ें',
    langLabel: 'भाषा',
    types: ['पहली बार','अनुवर्ती','जाँच','परामर्श','टीकाकरण','रेफरल','अन्य'],
    months: ['जनवरी','फरवरी','मार्च','अप्रैल','मई','जून','जुलाई','अगस्त','सितंबर','अक्टूबर','नवंबर','दिसंबर'],
    weekdays: ['सोम','मंगल','बुध','गुरु','शुक्र','शनि','रवि'],
    summary: 'सारांश',
    practitioner: 'चिकित्सक',
    date: 'तारीख', time: 'समय', type: 'प्रकार',
    none: '–',
    errorRequired: 'कृपया सभी आवश्यक फ़ील्ड भरें।',
    errorSlot: 'कृपया एक समय चुनें।',
    limitReached: 'क्लिनिक मासिक अपॉइंटमेंट सीमा तक पहुँच गया है। कृपया सीधे उनसे संपर्क करें।',
  },
  th: {
    step1: 'นัดหมาย', step2: 'ข้อมูล', step3: 'ยืนยัน',
    chooseDoctor: 'เลือกแพทย์',
    chooseDate: 'เลือกวันที่',
    chooseTime: 'เลือกเวลา',
    noSlotsDay: 'ไม่มีนัดหมายว่างในวันนี้',
    loadingDays: 'กำลังโหลดวันที่ว่าง…',
    loadingSlots: 'กำลังโหลดช่วงเวลา…',
    next: 'ถัดไป →',
    back: '← กลับ',
    yourDetails: 'ข้อมูลของคุณ',
    firstName: 'ชื่อ', lastName: 'นามสกุล',
    email: 'อีเมล (สำหรับยืนยัน)', phone: 'โทรศัพท์',
    appointmentType: 'ประเภทนัดหมาย',
    bookBtn: 'ยืนยันนัดหมาย',
    booked: 'นัดหมายสำเร็จแล้ว!',
    confirmEmail: 'อีเมลยืนยันจะถูกส่งในไม่ช้า',
    addToCalendar: 'บันทึกในปฏิทิน (.ics)',
    cancelLink: 'ยกเลิกนัดหมาย',
    bookAnother: 'จองนัดหมายอื่น',
    myAppointments: 'นัดหมายของฉัน',
    joinWaitlist: 'เข้าร่วมรายการรอ',
    langLabel: 'ภาษา',
    types: ['ครั้งแรก','ติดตามผล','ตรวจสุขภาพ','ปรึกษา','ฉีดวัคซีน','ส่งต่อ','อื่นๆ'],
    months: ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'],
    weekdays: ['จ','อ','พ','พฤ','ศ','ส','อา'],
    summary: 'สรุป',
    practitioner: 'แพทย์',
    date: 'วันที่', time: 'เวลา', type: 'ประเภท',
    none: '–',
    errorRequired: 'กรุณากรอกข้อมูลในช่องที่จำเป็นทั้งหมด',
    errorSlot: 'กรุณาเลือกเวลา',
    limitReached: 'คลินิกถึงขีดจำกัดนัดหมายรายเดือนแล้ว กรุณาติดต่อพวกเขาโดยตรง',
  },
};

function t(key) { return (T[bk.lang] || T.de)[key] || key; }

function bkGetLang() {
  const urlLang = getQueryParam('lang');
  if (BK_LANGS.includes(urlLang)) return urlLang;
  const cookieLang = (document.cookie.split(';').map(c => c.trim()).find(c => c.startsWith('lang=')) || '').replace('lang=', '');
  if (BK_LANGS.includes(cookieLang)) return cookieLang;
  const navLang = (navigator.language || '').split('-')[0];
  if (BK_LANGS.includes(navLang)) return navLang;
  return 'de';
}

function bkApplyDir() {
  document.documentElement.lang = bk.lang;
  document.documentElement.dir = bk.lang === 'ar' ? 'rtl' : 'ltr';
}

function bkRenderLangSwitcher() {
  const container = document.getElementById('bk-lang-switcher');
  if (!container) return;
  const flags = { de: '🇩🇪', en: '🇬🇧', fr: '🇫🇷', es: '🇪🇸', pt: '🇧🇷', ar: '🇸🇦', tr: '🇹🇷', id: '🇮🇩', ru: '🇷🇺', zh: '🇨🇳', hi: '🇮🇳', th: '🇹🇭' };
  container.innerHTML = `<select id="bk-lang-select" class="bk-lang-select" title="${t('langLabel')}">` +
    BK_LANGS.map(l => `<option value="${l}"${l === bk.lang ? ' selected' : ''}>${flags[l]}</option>`).join('') +
    '</select>';
  document.getElementById('bk-lang-select').addEventListener('change', (e) => {
    const lang = e.target.value;
    document.cookie = `lang=${lang};path=/;max-age=${365 * 24 * 3600};samesite=lax`;
    bk.lang = lang;
    bkApplyDir();
    applyTranslations();
    renderCalendar();
    // Update my-appointments link lang param
    const myLink = document.getElementById('my-appointments-link');
    if (myLink) myLink.href = `/my-appointments.html?p=${bk.practiceId}&lang=${lang}`;
  });
}

// ── Init ──────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', async () => {
  bk.practiceId = getQueryParam('p');
  bk.lang = bkGetLang();
  bkApplyDir();

  if (!bk.practiceId) {
    showError('Keine Praxis-ID angegeben.');
    return;
  }

  applyTranslations();
  bkRenderLangSwitcher();
  await loadPractice();
  setupCalendarNav();
  setupStepButtons();
});

function applyTranslations() {
  document.getElementById('step-label-1').textContent = t('step1');
  document.getElementById('step-label-2').textContent = t('step2');
  document.getElementById('step-label-3').textContent = t('step3');
  document.getElementById('lbl-doctor').textContent = t('chooseDoctor');
  document.getElementById('lbl-date').textContent = t('chooseDate');
  document.getElementById('lbl-time').textContent = t('chooseTime');
  document.getElementById('btn-next').textContent = t('next');
  document.getElementById('s2-title').textContent = t('yourDetails');
  document.getElementById('lbl-firstname').textContent = t('firstName') + ' *';
  document.getElementById('lbl-lastname').textContent = t('lastName') + ' *';
  document.getElementById('lbl-email').textContent = t('email') + ' *';
  document.getElementById('lbl-phone').textContent = t('phone');
  document.getElementById('lbl-type').textContent = t('appointmentType');
  document.getElementById('btn-back').textContent = t('back');
  document.getElementById('btn-book').textContent = t('bookBtn');

  const sel = document.getElementById('inp-type');
  sel.innerHTML = `<option value="">${t('none')}</option>` +
    t('types').map((tp, i) => `<option value="${esc(APPOINTMENT_TYPES[i])}">${esc(tp)}</option>`).join('');

  const wd = document.getElementById('cal-weekdays');
  if (wd) wd.innerHTML = t('weekdays').map(d => `<div class="cal-wd">${d}</div>`).join('');

  const myLink = document.getElementById('my-appointments-link');
  if (myLink) myLink.textContent = t('myAppointments');
  const wlLink = document.getElementById('waitlist-link');
  if (wlLink) wlLink.textContent = t('joinWaitlist');
}

// ── Load Practice ─────────────────────────────────────────

async function loadPractice() {
  try {
    const data = await fetch(`/api/public/practices/${bk.practiceId}`).then(r => r.json());
    if (data.error) { showError(data.error); return; }

    const { practice, practitioners } = data;

    document.getElementById('practice-name').textContent = practice.name;
    document.title = `${t('step1')} – ${practice.name}`;
    const addr = [practice.address, practice.zip, practice.city].filter(Boolean).join(', ');
    if (addr) document.getElementById('practice-address').textContent = addr;
    if (practice.phone) document.getElementById('practice-phone').textContent = practice.phone;

    // Rating
    if (data.rating && data.rating.count > 0) {
      const avg = Math.round(data.rating.avg);
      document.getElementById('practice-rating').textContent =
        '★'.repeat(avg) + '☆'.repeat(5 - avg) + ` (${data.rating.count})`;
    }

    // Opening hours
    if (practice.opening_hours) {
      document.getElementById('practice-hours').textContent = practice.opening_hours;
      document.getElementById('hours-row').style.display = '';
    }

    bk.practitioners = practitioners || [];

    if (bk.practitioners.length === 0) {
      showError('Keine Behandler verfügbar.');
      return;
    }

    renderPractitionerCards();

    // Wartelisten-Link
    const wlLink = document.getElementById('waitlist-link');
    if (wlLink) wlLink.href = `/waitlist.html?p=${bk.practiceId}`;

    // Meine Termine Link
    const myLink = document.getElementById('my-appointments-link');
    if (myLink) myLink.href = `/my-appointments.html?p=${bk.practiceId}&lang=${bk.lang}`;

    document.getElementById('booking-main').style.display = '';
    document.getElementById('loading-screen').style.display = 'none';
  } catch (err) {
    showError('Die Praxis konnte nicht geladen werden.');
  }
}

// ── Practitioner Cards ────────────────────────────────────

function renderPractitionerCards() {
  const container = document.getElementById('practitioner-cards');
  container.innerHTML = bk.practitioners.map(p => {
    const name = [p.title, p.first_name, p.last_name].filter(Boolean).join(' ');
    const spec = p.specialty ? `<div class="prac-specialty">${esc(p.specialty)}</div>` : '';
    return `<div class="prac-card" data-id="${esc(p.id)}" onclick="selectPractitioner('${esc(p.id)}')">
      <div class="prac-name">${esc(name)}</div>
      ${spec}
    </div>`;
  }).join('');

  if (bk.practitioners.length === 1) {
    selectPractitioner(bk.practitioners[0].id);
  }
}

function selectPractitioner(id) {
  bk.practitionerId = id;
  document.querySelectorAll('.prac-card').forEach(c => {
    c.classList.toggle('selected', c.dataset.id === id);
  });
  bk.selectedDate = null;
  bk.selectedTime = null;
  document.getElementById('slots-section').style.display = 'none';
  document.getElementById('btn-next').disabled = true;
  loadAvailableDays();
}

// ── Calendar ──────────────────────────────────────────────

async function loadAvailableDays() {
  const grid = document.getElementById('cal-grid');
  grid.innerHTML = `<div class="cal-loading">${t('loadingDays')}</div>`;

  try {
    bk.availableDays = await fetch(
      `/api/public/available-days?practitioner_id=${bk.practitionerId}&year=${bk.calYear}&month=${bk.calMonth}`
    ).then(r => r.json());
  } catch {
    bk.availableDays = [];
  }

  renderCalendar();
}

function renderCalendar() {
  const label = document.getElementById('cal-month-label');
  label.textContent = `${t('months')[bk.calMonth - 1]} ${bk.calYear}`;

  const grid = document.getElementById('cal-grid');
  const today = new Date().toISOString().split('T')[0];

  // First weekday of month (0=Sun…6=Sat) → convert to Mon-first (0=Mon…6=Sun)
  const firstWd = new Date(bk.calYear, bk.calMonth - 1, 1).getDay();
  const offset = (firstWd + 6) % 7;
  const lastDay = new Date(bk.calYear, bk.calMonth, 0).getDate();

  let html = '';
  for (let i = 0; i < offset; i++) html += '<div class="cal-cell cal-empty"></div>';

  for (let d = 1; d <= lastDay; d++) {
    const paddedM = String(bk.calMonth).padStart(2, '0');
    const paddedD = String(d).padStart(2, '0');
    const dateStr = `${bk.calYear}-${paddedM}-${paddedD}`;
    const isPast = dateStr <= today;
    const isAvail = bk.availableDays.includes(dateStr);
    const isSel = dateStr === bk.selectedDate;

    let cls = 'cal-cell';
    if (isPast || !isAvail) cls += ' cal-past';
    else cls += ' cal-avail';
    if (isSel) cls += ' cal-selected';

    const click = (!isPast && isAvail) ? `onclick="selectDate('${dateStr}')"` : '';
    html += `<div class="${cls}" ${click}>${d}</div>`;
  }

  grid.innerHTML = html;
}

function selectDate(dateStr) {
  bk.selectedDate = dateStr;
  bk.selectedTime = null;
  document.getElementById('btn-next').disabled = true;
  renderCalendar();
  loadSlots(dateStr);
}

async function loadSlots(dateStr) {
  const section = document.getElementById('slots-section');
  const grid = document.getElementById('slots-grid');
  section.style.display = '';
  grid.innerHTML = `<p style="color:var(--text-secondary);">${t('loadingSlots')}</p>`;

  try {
    const slots = await fetch(
      `/api/public/slots?practitioner_id=${bk.practitionerId}&date=${dateStr}`
    ).then(r => r.json());

    if (!slots.length) {
      grid.innerHTML = `<p style="color:var(--text-secondary);">${t('noSlotsDay')}</p>`;
      return;
    }

    grid.innerHTML = '<div class="slots-grid">' +
      slots.map(s => `<button type="button" class="slot-btn" onclick="selectSlot('${s}',this)">${esc(s)}</button>`).join('') +
      '</div>';
  } catch {
    grid.innerHTML = `<p style="color:var(--danger);">Slots konnten nicht geladen werden.</p>`;
  }
}

function selectSlot(time, btn) {
  bk.selectedTime = time;
  document.querySelectorAll('.slot-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  document.getElementById('btn-next').disabled = false;
}

function setupCalendarNav() {
  document.getElementById('cal-prev').addEventListener('click', () => {
    bk.calMonth--;
    if (bk.calMonth < 1) { bk.calMonth = 12; bk.calYear--; }
    if (bk.practitionerId) loadAvailableDays();
    else renderCalendar();
  });
  document.getElementById('cal-next').addEventListener('click', () => {
    bk.calMonth++;
    if (bk.calMonth > 12) { bk.calMonth = 1; bk.calYear++; }
    if (bk.practitionerId) loadAvailableDays();
    else renderCalendar();
  });

  // Initial calendar render (no practitioner yet)
  renderCalendar();
}

// ── Steps ─────────────────────────────────────────────────

function setupStepButtons() {
  document.getElementById('btn-next').addEventListener('click', () => {
    if (!bk.selectedTime) {
      showStepAlert(t('errorSlot'));
      return;
    }
    goStep(2);
  });

  document.getElementById('btn-back').addEventListener('click', () => goStep(1));

  document.getElementById('booking-form').addEventListener('submit', async e => {
    e.preventDefault();
    await submitBooking();
  });
}

function goStep(n) {
  [1, 2, 3].forEach(i => {
    document.getElementById(`step-${i}`).style.display = i === n ? '' : 'none';
    const si = document.getElementById(`si-${i}`);
    si.classList.remove('active', 'done');
    if (i < n) si.classList.add('done');
    else if (i === n) si.classList.add('active');
  });
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showStepAlert(msg) {
  const el = document.getElementById('step1-alert');
  el.innerHTML = `<div class="alert alert-warning">${esc(msg)}</div>`;
  setTimeout(() => { el.innerHTML = ''; }, 3000);
}

// ── Submit ────────────────────────────────────────────────

async function submitBooking() {
  const btn = document.getElementById('btn-book');
  btn.disabled = true;

  const prac = bk.practitioners.find(p => p.id === bk.practitionerId);
  const practName = prac ? [prac.title, prac.first_name, prac.last_name].filter(Boolean).join(' ') : '';

  const data = {
    practice_id: bk.practiceId,
    practitioner_id: bk.practitionerId,
    patient_first_name: document.getElementById('inp-firstname').value.trim(),
    patient_last_name: document.getElementById('inp-lastname').value.trim(),
    patient_email: document.getElementById('inp-email').value.trim(),
    patient_phone: document.getElementById('inp-phone').value.trim() || undefined,
    appointment_date: bk.selectedDate,
    appointment_time: bk.selectedTime,
    appointment_type: document.getElementById('inp-type').value || undefined,
    patient_language: bk.lang,
  };

  try {
    const res = await fetch('/api/public/book', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) {
      document.getElementById('step2-alert').innerHTML =
        `<div class="alert alert-danger">${esc(json.error || 'Fehler beim Buchen.')}</div>`;
      btn.disabled = false;
      return;
    }

    bk.cancelToken = json.cancel_token;

    // Confirmation card
    const [y, m, d] = bk.selectedDate.split('-');
    const dateFormatted = `${d}.${m}.${y}`;
    document.getElementById('conf-name').textContent =
      `${data.patient_first_name} ${data.patient_last_name}`;
    document.getElementById('conf-practitioner').textContent = practName;
    document.getElementById('conf-date').textContent = dateFormatted;
    document.getElementById('conf-time').textContent = bk.lang === 'de' ? bk.selectedTime + ' Uhr' : bk.selectedTime;
    document.getElementById('conf-type').textContent = data.appointment_type || t('none');

    const icsLink = document.getElementById('ics-link');
    if (icsLink) icsLink.href = `/api/public/ics/${bk.cancelToken}`;

    const cancelUrl = `/cancel.html?token=${bk.cancelToken}&lang=${bk.lang}`;
    const cancelEl = document.getElementById('cancel-link');
    if (cancelEl) cancelEl.href = cancelUrl;

    goStep(3);
  } catch {
    document.getElementById('step2-alert').innerHTML =
      '<div class="alert alert-danger">Verbindungsfehler. Bitte versuchen Sie es erneut.</div>';
    btn.disabled = false;
  }
}

// ── Helpers ───────────────────────────────────────────────

function showError(msg) {
  document.getElementById('loading-screen').style.display = 'none';
  document.getElementById('error-screen').style.display = '';
  document.getElementById('error-msg').textContent = msg;
}

function esc(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
