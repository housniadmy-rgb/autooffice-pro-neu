// utils/emailLocalesAdmin.js
// Praxis-Admin-/Betriebs-Mails in allen 14 unterstützten Sprachen. Wird in
// utils/emailLocales.js in das zentrale emailLocales-Objekt gemerged.
//
// Mail-Typen:
//   demoRequestAdmin      – Neuer Demo-Antrag eingegangen
//                            (vars: practice, contact, email, country, language)
//   accountStatusChange   – Konto pausiert / reaktiviert
//                            (vars: action: 'paused'|'reactivated', reason?)
//                            – subject/body/cta verzweigen auf v.action
//   securityNewLogin      – Sicherheitswarnung: neuer Login
//                            (vars: datetime, device, location)
//                            – KEINE sensiblen Daten (IP, GeoLat/Lng), nur
//                              grobe Beschreibungen
//   dailySummary          – Tägliche Zusammenfassung
//                            (vars: date, newBookings, cancellations,
//                                   newReviews, newWaitlistEntries)
//
// Pro Sprache: { subject, body(vars), cta }. cta darf eine Funktion sein,
// damit accountStatusChange das Label am action-Wert ausrichten kann.

const adminLocales = {
  // ── Deutsch ────────────────────────────────────────────────
  de: {
    demoRequestAdmin: {
      subject: (v) => `Neue Demo-Anfrage: ${v.practice}`,
      body: (v) => `Eine neue Demo-Anfrage ist eingegangen:\n\nPraxis: ${v.practice}\nAnsprechpartner: ${v.contact}\nE-Mail: ${v.email}\nLand: ${v.country}\nSprache: ${v.language || '—'}`,
      cta: 'Demo-Anfragen verwalten →',
    },
    accountStatusChange: {
      subject: (v) => v.action === 'paused'
        ? 'Ihr PraxisOnline24-Konto wurde pausiert'
        : 'Ihr PraxisOnline24-Konto ist wieder aktiv',
      body: (v) => v.action === 'paused'
        ? `Ihr PraxisOnline24-Konto wurde pausiert.\n\nGrund: ${v.reason || 'Testphase abgelaufen'}\n\nUpgraden Sie Ihr Paket, um PraxisOnline24 wieder zu nutzen.`
        : 'Ihr PraxisOnline24-Konto wurde reaktiviert. Sie können PraxisOnline24 ab sofort wieder ohne Einschränkungen nutzen.',
      cta: (v) => v.action === 'paused' ? 'Jetzt upgraden →' : 'Zum Dashboard →',
    },
    securityNewLogin: {
      subject: 'Sicherheitswarnung: neue Anmeldung',
      body: (v) => `Eine neue Anmeldung an Ihrem PraxisOnline24-Konto wurde registriert.\n\nZeit: ${v.datetime}\nGerät: ${v.device}\nStandort: ${v.location}\n\nFalls Sie es nicht waren, ändern Sie sofort Ihr Passwort.`,
      cta: 'Passwort ändern →',
    },
    dailySummary: {
      subject: (v) => `Tagesübersicht ${v.date} – PraxisOnline24`,
      body: (v) => `Tagesübersicht für ${v.date}:\n\n• Neue Buchungen: ${v.newBookings}\n• Absagen: ${v.cancellations}\n• Neue Bewertungen: ${v.newReviews}\n• Neue Wartelisten-Einträge: ${v.newWaitlistEntries}`,
      cta: 'Dashboard öffnen →',
    },
  },

  // ── Englisch ───────────────────────────────────────────────
  en: {
    demoRequestAdmin: {
      subject: (v) => `New demo request: ${v.practice}`,
      body: (v) => `A new demo request has been received:\n\nPractice: ${v.practice}\nContact: ${v.contact}\nEmail: ${v.email}\nCountry: ${v.country}\nLanguage: ${v.language || '—'}`,
      cta: 'Manage demo requests →',
    },
    accountStatusChange: {
      subject: (v) => v.action === 'paused'
        ? 'Your PraxisOnline24 account has been paused'
        : 'Your PraxisOnline24 account is active again',
      body: (v) => v.action === 'paused'
        ? `Your PraxisOnline24 account has been paused.\n\nReason: ${v.reason || 'Trial expired'}\n\nUpgrade your plan to keep using PraxisOnline24.`
        : 'Your PraxisOnline24 account has been reactivated. You can now use PraxisOnline24 without restrictions.',
      cta: (v) => v.action === 'paused' ? 'Upgrade now →' : 'Go to dashboard →',
    },
    securityNewLogin: {
      subject: 'Security alert: new login',
      body: (v) => `A new login to your PraxisOnline24 account has been recorded.\n\nTime: ${v.datetime}\nDevice: ${v.device}\nLocation: ${v.location}\n\nIf this wasn't you, change your password immediately.`,
      cta: 'Change password →',
    },
    dailySummary: {
      subject: (v) => `Daily summary ${v.date} – PraxisOnline24`,
      body: (v) => `Daily summary for ${v.date}:\n\n• New bookings: ${v.newBookings}\n• Cancellations: ${v.cancellations}\n• New reviews: ${v.newReviews}\n• New waitlist entries: ${v.newWaitlistEntries}`,
      cta: 'Open dashboard →',
    },
  },

  // ── Französisch ────────────────────────────────────────────
  fr: {
    demoRequestAdmin: {
      subject: (v) => `Nouvelle demande de démo : ${v.practice}`,
      body: (v) => `Une nouvelle demande de démo a été reçue :\n\nCabinet : ${v.practice}\nContact : ${v.contact}\nE-mail : ${v.email}\nPays : ${v.country}\nLangue : ${v.language || '—'}`,
      cta: 'Gérer les demandes de démo →',
    },
    accountStatusChange: {
      subject: (v) => v.action === 'paused'
        ? 'Votre compte PraxisOnline24 a été suspendu'
        : 'Votre compte PraxisOnline24 est de nouveau actif',
      body: (v) => v.action === 'paused'
        ? `Votre compte PraxisOnline24 a été suspendu.\n\nRaison : ${v.reason || "Période d'essai expirée"}\n\nMettez à niveau votre formule pour continuer à utiliser PraxisOnline24.`
        : 'Votre compte PraxisOnline24 a été réactivé. Vous pouvez désormais utiliser PraxisOnline24 sans restrictions.',
      cta: (v) => v.action === 'paused' ? 'Mettre à niveau maintenant →' : 'Accéder au tableau de bord →',
    },
    securityNewLogin: {
      subject: 'Alerte de sécurité : nouvelle connexion',
      body: (v) => `Une nouvelle connexion à votre compte PraxisOnline24 a été enregistrée.\n\nHeure : ${v.datetime}\nAppareil : ${v.device}\nLieu : ${v.location}\n\nSi ce n'était pas vous, changez immédiatement votre mot de passe.`,
      cta: 'Changer le mot de passe →',
    },
    dailySummary: {
      subject: (v) => `Résumé quotidien ${v.date} – PraxisOnline24`,
      body: (v) => `Résumé quotidien pour ${v.date} :\n\n• Nouvelles réservations : ${v.newBookings}\n• Annulations : ${v.cancellations}\n• Nouvelles évaluations : ${v.newReviews}\n• Nouvelles entrées en liste d'attente : ${v.newWaitlistEntries}`,
      cta: 'Ouvrir le tableau de bord →',
    },
  },

  // ── Spanisch ───────────────────────────────────────────────
  es: {
    demoRequestAdmin: {
      subject: (v) => `Nueva solicitud de demo: ${v.practice}`,
      body: (v) => `Se ha recibido una nueva solicitud de demo:\n\nConsultorio: ${v.practice}\nContacto: ${v.contact}\nCorreo: ${v.email}\nPaís: ${v.country}\nIdioma: ${v.language || '—'}`,
      cta: 'Gestionar solicitudes de demo →',
    },
    accountStatusChange: {
      subject: (v) => v.action === 'paused'
        ? 'Su cuenta de PraxisOnline24 ha sido pausada'
        : 'Su cuenta de PraxisOnline24 está activa de nuevo',
      body: (v) => v.action === 'paused'
        ? `Su cuenta de PraxisOnline24 ha sido pausada.\n\nMotivo: ${v.reason || 'Período de prueba expirado'}\n\nActualice su plan para seguir usando PraxisOnline24.`
        : 'Su cuenta de PraxisOnline24 ha sido reactivada. Ahora puede usar PraxisOnline24 sin restricciones.',
      cta: (v) => v.action === 'paused' ? 'Actualizar ahora →' : 'Ir al panel →',
    },
    securityNewLogin: {
      subject: 'Alerta de seguridad: nuevo inicio de sesión',
      body: (v) => `Se ha registrado un nuevo inicio de sesión en su cuenta de PraxisOnline24.\n\nHora: ${v.datetime}\nDispositivo: ${v.device}\nUbicación: ${v.location}\n\nSi no fue usted, cambie su contraseña inmediatamente.`,
      cta: 'Cambiar contraseña →',
    },
    dailySummary: {
      subject: (v) => `Resumen diario ${v.date} – PraxisOnline24`,
      body: (v) => `Resumen diario para ${v.date}:\n\n• Nuevas reservas: ${v.newBookings}\n• Cancelaciones: ${v.cancellations}\n• Nuevas reseñas: ${v.newReviews}\n• Nuevas entradas en lista de espera: ${v.newWaitlistEntries}`,
      cta: 'Abrir panel →',
    },
  },

  // ── Italienisch ────────────────────────────────────────────
  it: {
    demoRequestAdmin: {
      subject: (v) => `Nuova richiesta demo: ${v.practice}`,
      body: (v) => `È stata ricevuta una nuova richiesta demo:\n\nStudio: ${v.practice}\nContatto: ${v.contact}\nE-mail: ${v.email}\nPaese: ${v.country}\nLingua: ${v.language || '—'}`,
      cta: 'Gestisci richieste demo →',
    },
    accountStatusChange: {
      subject: (v) => v.action === 'paused'
        ? 'Il tuo account PraxisOnline24 è stato sospeso'
        : 'Il tuo account PraxisOnline24 è di nuovo attivo',
      body: (v) => v.action === 'paused'
        ? `Il tuo account PraxisOnline24 è stato sospeso.\n\nMotivo: ${v.reason || 'Periodo di prova scaduto'}\n\nAggiorna il piano per continuare a usare PraxisOnline24.`
        : 'Il tuo account PraxisOnline24 è stato riattivato. Ora puoi usare PraxisOnline24 senza restrizioni.',
      cta: (v) => v.action === 'paused' ? 'Aggiorna ora →' : 'Vai alla dashboard →',
    },
    securityNewLogin: {
      subject: 'Avviso di sicurezza: nuovo accesso',
      body: (v) => `È stato registrato un nuovo accesso al tuo account PraxisOnline24.\n\nOra: ${v.datetime}\nDispositivo: ${v.device}\nPosizione: ${v.location}\n\nSe non sei stato tu, cambia immediatamente la password.`,
      cta: 'Cambia password →',
    },
    dailySummary: {
      subject: (v) => `Riepilogo giornaliero ${v.date} – PraxisOnline24`,
      body: (v) => `Riepilogo giornaliero per ${v.date}:\n\n• Nuove prenotazioni: ${v.newBookings}\n• Cancellazioni: ${v.cancellations}\n• Nuove recensioni: ${v.newReviews}\n• Nuove iscrizioni in lista d'attesa: ${v.newWaitlistEntries}`,
      cta: 'Apri dashboard →',
    },
  },

  // ── Portugiesisch ──────────────────────────────────────────
  pt: {
    demoRequestAdmin: {
      subject: (v) => `Nova solicitação de demo: ${v.practice}`,
      body: (v) => `Foi recebida uma nova solicitação de demo:\n\nClínica: ${v.practice}\nContato: ${v.contact}\nE-mail: ${v.email}\nPaís: ${v.country}\nIdioma: ${v.language || '—'}`,
      cta: 'Gerenciar solicitações de demo →',
    },
    accountStatusChange: {
      subject: (v) => v.action === 'paused'
        ? 'Sua conta PraxisOnline24 foi pausada'
        : 'Sua conta PraxisOnline24 está ativa novamente',
      body: (v) => v.action === 'paused'
        ? `Sua conta PraxisOnline24 foi pausada.\n\nMotivo: ${v.reason || 'Período de teste expirado'}\n\nAtualize seu plano para continuar usando o PraxisOnline24.`
        : 'Sua conta PraxisOnline24 foi reativada. Agora você pode usar o PraxisOnline24 sem restrições.',
      cta: (v) => v.action === 'paused' ? 'Atualizar agora →' : 'Ir para o painel →',
    },
    securityNewLogin: {
      subject: 'Alerta de segurança: novo login',
      body: (v) => `Um novo login na sua conta PraxisOnline24 foi registrado.\n\nHorário: ${v.datetime}\nDispositivo: ${v.device}\nLocalização: ${v.location}\n\nSe não foi você, altere sua senha imediatamente.`,
      cta: 'Alterar senha →',
    },
    dailySummary: {
      subject: (v) => `Resumo diário ${v.date} – PraxisOnline24`,
      body: (v) => `Resumo diário de ${v.date}:\n\n• Novas reservas: ${v.newBookings}\n• Cancelamentos: ${v.cancellations}\n• Novas avaliações: ${v.newReviews}\n• Novas entradas na lista de espera: ${v.newWaitlistEntries}`,
      cta: 'Abrir painel →',
    },
  },

  // ── Niederländisch ─────────────────────────────────────────
  nl: {
    demoRequestAdmin: {
      subject: (v) => `Nieuwe demo-aanvraag: ${v.practice}`,
      body: (v) => `Er is een nieuwe demo-aanvraag ontvangen:\n\nPraktijk: ${v.practice}\nContact: ${v.contact}\nE-mail: ${v.email}\nLand: ${v.country}\nTaal: ${v.language || '—'}`,
      cta: 'Demo-aanvragen beheren →',
    },
    accountStatusChange: {
      subject: (v) => v.action === 'paused'
        ? 'Uw PraxisOnline24-account is gepauzeerd'
        : 'Uw PraxisOnline24-account is weer actief',
      body: (v) => v.action === 'paused'
        ? `Uw PraxisOnline24-account is gepauzeerd.\n\nReden: ${v.reason || 'Proefperiode verlopen'}\n\nUpgrade uw pakket om PraxisOnline24 te blijven gebruiken.`
        : 'Uw PraxisOnline24-account is gereactiveerd. U kunt PraxisOnline24 nu zonder beperkingen gebruiken.',
      cta: (v) => v.action === 'paused' ? 'Nu upgraden →' : 'Naar dashboard →',
    },
    securityNewLogin: {
      subject: 'Veiligheidswaarschuwing: nieuwe aanmelding',
      body: (v) => `Er is een nieuwe aanmelding op uw PraxisOnline24-account geregistreerd.\n\nTijd: ${v.datetime}\nApparaat: ${v.device}\nLocatie: ${v.location}\n\nAls u dit niet was, wijzig dan onmiddellijk uw wachtwoord.`,
      cta: 'Wachtwoord wijzigen →',
    },
    dailySummary: {
      subject: (v) => `Dagoverzicht ${v.date} – PraxisOnline24`,
      body: (v) => `Dagoverzicht voor ${v.date}:\n\n• Nieuwe boekingen: ${v.newBookings}\n• Annuleringen: ${v.cancellations}\n• Nieuwe beoordelingen: ${v.newReviews}\n• Nieuwe wachtlijst-inschrijvingen: ${v.newWaitlistEntries}`,
      cta: 'Dashboard openen →',
    },
  },

  // ── Türkisch ───────────────────────────────────────────────
  tr: {
    demoRequestAdmin: {
      subject: (v) => `Yeni demo talebi: ${v.practice}`,
      body: (v) => `Yeni bir demo talebi alındı:\n\nKlinik: ${v.practice}\nİletişim: ${v.contact}\nE-posta: ${v.email}\nÜlke: ${v.country}\nDil: ${v.language || '—'}`,
      cta: 'Demo taleplerini yönet →',
    },
    accountStatusChange: {
      subject: (v) => v.action === 'paused'
        ? 'PraxisOnline24 hesabınız duraklatıldı'
        : 'PraxisOnline24 hesabınız tekrar aktif',
      body: (v) => v.action === 'paused'
        ? `PraxisOnline24 hesabınız duraklatıldı.\n\nNeden: ${v.reason || 'Deneme süresi doldu'}\n\nPraxisOnline24'ü kullanmaya devam etmek için planınızı yükseltin.`
        : "PraxisOnline24 hesabınız yeniden etkinleştirildi. PraxisOnline24'ü artık kısıtlama olmadan kullanabilirsiniz.",
      cta: (v) => v.action === 'paused' ? 'Şimdi yükselt →' : 'Panele git →',
    },
    securityNewLogin: {
      subject: 'Güvenlik uyarısı: yeni giriş',
      body: (v) => `PraxisOnline24 hesabınıza yeni bir giriş kaydedildi.\n\nZaman: ${v.datetime}\nCihaz: ${v.device}\nKonum: ${v.location}\n\nBu siz değildiyseniz, şifrenizi hemen değiştirin.`,
      cta: 'Şifreyi değiştir →',
    },
    dailySummary: {
      subject: (v) => `Günlük özet ${v.date} – PraxisOnline24`,
      body: (v) => `${v.date} için günlük özet:\n\n• Yeni randevular: ${v.newBookings}\n• İptaller: ${v.cancellations}\n• Yeni değerlendirmeler: ${v.newReviews}\n• Yeni bekleme listesi girişleri: ${v.newWaitlistEntries}`,
      cta: 'Paneli aç →',
    },
  },

  // ── Arabisch ───────────────────────────────────────────────
  ar: {
    demoRequestAdmin: {
      subject: (v) => `طلب تجربة جديد: ${v.practice}`,
      body: (v) => `تم استلام طلب تجربة جديد:\n\nالعيادة: ${v.practice}\nجهة الاتصال: ${v.contact}\nالبريد الإلكتروني: ${v.email}\nالبلد: ${v.country}\nاللغة: ${v.language || '—'}`,
      cta: 'إدارة طلبات التجربة ←',
    },
    accountStatusChange: {
      subject: (v) => v.action === 'paused'
        ? 'تم إيقاف حساب PraxisOnline24 الخاص بك مؤقتاً'
        : 'حساب PraxisOnline24 الخاص بك نشط مرة أخرى',
      body: (v) => v.action === 'paused'
        ? `تم إيقاف حساب PraxisOnline24 الخاص بك مؤقتاً.\n\nالسبب: ${v.reason || 'انتهت فترة التجربة'}\n\nرقّ اشتراكك للاستمرار في استخدام PraxisOnline24.`
        : 'تم تنشيط حساب PraxisOnline24 الخاص بك من جديد. يمكنك الآن استخدام PraxisOnline24 دون قيود.',
      cta: (v) => v.action === 'paused' ? 'الترقية الآن ←' : 'الذهاب إلى لوحة التحكم ←',
    },
    securityNewLogin: {
      subject: 'تنبيه أمني: تسجيل دخول جديد',
      body: (v) => `تم تسجيل دخول جديد إلى حساب PraxisOnline24 الخاص بك.\n\nالوقت: ${v.datetime}\nالجهاز: ${v.device}\nالموقع: ${v.location}\n\nإذا لم يكن هذا أنت، قم بتغيير كلمة المرور فوراً.`,
      cta: 'تغيير كلمة المرور ←',
    },
    dailySummary: {
      subject: (v) => `الملخص اليومي ${v.date} – PraxisOnline24`,
      body: (v) => `الملخص اليومي لـ ${v.date}:\n\n• الحجوزات الجديدة: ${v.newBookings}\n• الإلغاءات: ${v.cancellations}\n• التقييمات الجديدة: ${v.newReviews}\n• المداخل الجديدة في قائمة الانتظار: ${v.newWaitlistEntries}`,
      cta: 'فتح لوحة التحكم ←',
    },
  },

  // ── Russisch ───────────────────────────────────────────────
  ru: {
    demoRequestAdmin: {
      subject: (v) => `Новый запрос демо: ${v.practice}`,
      body: (v) => `Получен новый запрос на демо:\n\nКлиника: ${v.practice}\nКонтакт: ${v.contact}\nE-mail: ${v.email}\nСтрана: ${v.country}\nЯзык: ${v.language || '—'}`,
      cta: 'Управление запросами →',
    },
    accountStatusChange: {
      subject: (v) => v.action === 'paused'
        ? 'Ваш аккаунт PraxisOnline24 приостановлен'
        : 'Ваш аккаунт PraxisOnline24 снова активен',
      body: (v) => v.action === 'paused'
        ? `Ваш аккаунт PraxisOnline24 приостановлен.\n\nПричина: ${v.reason || 'Пробный период истёк'}\n\nОбновите тариф, чтобы продолжать пользоваться PraxisOnline24.`
        : 'Ваш аккаунт PraxisOnline24 снова активен. Теперь вы можете пользоваться PraxisOnline24 без ограничений.',
      cta: (v) => v.action === 'paused' ? 'Обновить сейчас →' : 'Перейти на дашборд →',
    },
    securityNewLogin: {
      subject: 'Уведомление о безопасности: новый вход',
      body: (v) => `Зарегистрирован новый вход в ваш аккаунт PraxisOnline24.\n\nВремя: ${v.datetime}\nУстройство: ${v.device}\nМестоположение: ${v.location}\n\nЕсли это были не вы, немедленно смените пароль.`,
      cta: 'Сменить пароль →',
    },
    dailySummary: {
      subject: (v) => `Ежедневная сводка ${v.date} – PraxisOnline24`,
      body: (v) => `Ежедневная сводка за ${v.date}:\n\n• Новые записи: ${v.newBookings}\n• Отмены: ${v.cancellations}\n• Новые отзывы: ${v.newReviews}\n• Новые записи в листе ожидания: ${v.newWaitlistEntries}`,
      cta: 'Открыть дашборд →',
    },
  },

  // ── Indonesisch ────────────────────────────────────────────
  id: {
    demoRequestAdmin: {
      subject: (v) => `Permintaan demo baru: ${v.practice}`,
      body: (v) => `Permintaan demo baru telah diterima:\n\nKlinik: ${v.practice}\nKontak: ${v.contact}\nEmail: ${v.email}\nNegara: ${v.country}\nBahasa: ${v.language || '—'}`,
      cta: 'Kelola permintaan demo →',
    },
    accountStatusChange: {
      subject: (v) => v.action === 'paused'
        ? 'Akun PraxisOnline24 Anda telah dijeda'
        : 'Akun PraxisOnline24 Anda aktif kembali',
      body: (v) => v.action === 'paused'
        ? `Akun PraxisOnline24 Anda telah dijeda.\n\nAlasan: ${v.reason || 'Masa percobaan berakhir'}\n\nTingkatkan paket Anda untuk terus menggunakan PraxisOnline24.`
        : 'Akun PraxisOnline24 Anda telah diaktifkan kembali. Anda sekarang dapat menggunakan PraxisOnline24 tanpa pembatasan.',
      cta: (v) => v.action === 'paused' ? 'Tingkatkan sekarang →' : 'Ke dashboard →',
    },
    securityNewLogin: {
      subject: 'Peringatan keamanan: login baru',
      body: (v) => `Login baru ke akun PraxisOnline24 Anda telah dicatat.\n\nWaktu: ${v.datetime}\nPerangkat: ${v.device}\nLokasi: ${v.location}\n\nJika ini bukan Anda, segera ubah kata sandi Anda.`,
      cta: 'Ubah kata sandi →',
    },
    dailySummary: {
      subject: (v) => `Ringkasan harian ${v.date} – PraxisOnline24`,
      body: (v) => `Ringkasan harian untuk ${v.date}:\n\n• Reservasi baru: ${v.newBookings}\n• Pembatalan: ${v.cancellations}\n• Ulasan baru: ${v.newReviews}\n• Entri daftar tunggu baru: ${v.newWaitlistEntries}`,
      cta: 'Buka dashboard →',
    },
  },

  // ── Hindi ──────────────────────────────────────────────────
  hi: {
    demoRequestAdmin: {
      subject: (v) => `नया डेमो अनुरोध: ${v.practice}`,
      body: (v) => `एक नया डेमो अनुरोध प्राप्त हुआ है:\n\nक्लिनिक: ${v.practice}\nसंपर्क: ${v.contact}\nईमेल: ${v.email}\nदेश: ${v.country}\nभाषा: ${v.language || '—'}`,
      cta: 'डेमो अनुरोध प्रबंधित करें →',
    },
    accountStatusChange: {
      subject: (v) => v.action === 'paused'
        ? 'आपका PraxisOnline24 खाता रोक दिया गया है'
        : 'आपका PraxisOnline24 खाता फिर से सक्रिय है',
      body: (v) => v.action === 'paused'
        ? `आपका PraxisOnline24 खाता रोक दिया गया है।\n\nकारण: ${v.reason || 'परीक्षण अवधि समाप्त'}\n\nPraxisOnline24 का उपयोग जारी रखने के लिए अपना प्लान अपग्रेड करें।`
        : 'आपका PraxisOnline24 खाता पुनः सक्रिय कर दिया गया है। आप अब PraxisOnline24 का बिना किसी प्रतिबंध के उपयोग कर सकते हैं।',
      cta: (v) => v.action === 'paused' ? 'अभी अपग्रेड करें →' : 'डैशबोर्ड पर जाएँ →',
    },
    securityNewLogin: {
      subject: 'सुरक्षा चेतावनी: नया लॉगिन',
      body: (v) => `आपके PraxisOnline24 खाते में एक नया लॉगिन दर्ज किया गया है।\n\nसमय: ${v.datetime}\nडिवाइस: ${v.device}\nस्थान: ${v.location}\n\nयदि यह आप नहीं थे, तो तुरंत अपना पासवर्ड बदलें।`,
      cta: 'पासवर्ड बदलें →',
    },
    dailySummary: {
      subject: (v) => `दैनिक सारांश ${v.date} – PraxisOnline24`,
      body: (v) => `${v.date} के लिए दैनिक सारांश:\n\n• नई बुकिंग: ${v.newBookings}\n• रद्दीकरण: ${v.cancellations}\n• नई समीक्षाएँ: ${v.newReviews}\n• नई प्रतीक्षा सूची प्रविष्टियाँ: ${v.newWaitlistEntries}`,
      cta: 'डैशबोर्ड खोलें →',
    },
  },

  // ── Chinesisch (vereinfacht) ───────────────────────────────
  zh: {
    demoRequestAdmin: {
      subject: (v) => `新演示申请：${v.practice}`,
      body: (v) => `收到一个新的演示申请：\n\n诊所：${v.practice}\n联系人：${v.contact}\n邮箱：${v.email}\n国家：${v.country}\n语言：${v.language || '—'}`,
      cta: '管理演示申请 →',
    },
    accountStatusChange: {
      subject: (v) => v.action === 'paused'
        ? '您的 PraxisOnline24 账户已暂停'
        : '您的 PraxisOnline24 账户已重新激活',
      body: (v) => v.action === 'paused'
        ? `您的 PraxisOnline24 账户已暂停。\n\n原因：${v.reason || '试用期已结束'}\n\n请升级您的套餐以继续使用 PraxisOnline24。`
        : '您的 PraxisOnline24 账户已重新激活。您现在可以无限制地使用 PraxisOnline24。',
      cta: (v) => v.action === 'paused' ? '立即升级 →' : '进入控制面板 →',
    },
    securityNewLogin: {
      subject: '安全提醒：新的登录',
      body: (v) => `您的 PraxisOnline24 账户出现了一次新的登录。\n\n时间：${v.datetime}\n设备：${v.device}\n位置：${v.location}\n\n如果不是您本人，请立即修改密码。`,
      cta: '修改密码 →',
    },
    dailySummary: {
      subject: (v) => `每日摘要 ${v.date} – PraxisOnline24`,
      body: (v) => `${v.date} 的每日摘要：\n\n• 新预约：${v.newBookings}\n• 取消：${v.cancellations}\n• 新评价：${v.newReviews}\n• 新候补名单条目：${v.newWaitlistEntries}`,
      cta: '打开控制面板 →',
    },
  },

  // ── Thai ───────────────────────────────────────────────────
  th: {
    demoRequestAdmin: {
      subject: (v) => `คำขอสาธิตใหม่: ${v.practice}`,
      body: (v) => `ได้รับคำขอสาธิตใหม่:\n\nคลินิก: ${v.practice}\nผู้ติดต่อ: ${v.contact}\nอีเมล: ${v.email}\nประเทศ: ${v.country}\nภาษา: ${v.language || '—'}`,
      cta: 'จัดการคำขอสาธิต →',
    },
    accountStatusChange: {
      subject: (v) => v.action === 'paused'
        ? 'บัญชี PraxisOnline24 ของคุณถูกระงับแล้ว'
        : 'บัญชี PraxisOnline24 ของคุณเปิดใช้งานอีกครั้ง',
      body: (v) => v.action === 'paused'
        ? `บัญชี PraxisOnline24 ของคุณถูกระงับแล้ว\n\nเหตุผล: ${v.reason || 'ช่วงทดลองใช้สิ้นสุด'}\n\nอัปเกรดแพ็กเกจของคุณเพื่อใช้ PraxisOnline24 ต่อไป`
        : 'บัญชี PraxisOnline24 ของคุณถูกเปิดใช้งานอีกครั้งแล้ว ตอนนี้คุณสามารถใช้ PraxisOnline24 ได้โดยไม่มีข้อจำกัด',
      cta: (v) => v.action === 'paused' ? 'อัปเกรดทันที →' : 'ไปที่แดชบอร์ด →',
    },
    securityNewLogin: {
      subject: 'การแจ้งเตือนความปลอดภัย: การเข้าสู่ระบบใหม่',
      body: (v) => `มีการเข้าสู่ระบบใหม่บนบัญชี PraxisOnline24 ของคุณ\n\nเวลา: ${v.datetime}\nอุปกรณ์: ${v.device}\nสถานที่: ${v.location}\n\nหากไม่ใช่คุณ โปรดเปลี่ยนรหัสผ่านทันที`,
      cta: 'เปลี่ยนรหัสผ่าน →',
    },
    dailySummary: {
      subject: (v) => `สรุปรายวัน ${v.date} – PraxisOnline24`,
      body: (v) => `สรุปรายวันสำหรับ ${v.date}:\n\n• การจองใหม่: ${v.newBookings}\n• การยกเลิก: ${v.cancellations}\n• รีวิวใหม่: ${v.newReviews}\n• รายการรอใหม่: ${v.newWaitlistEntries}`,
      cta: 'เปิดแดชบอร์ด →',
    },
  },
};

module.exports = adminLocales;
