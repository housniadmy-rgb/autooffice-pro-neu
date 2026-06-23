const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { getDb } = require('../database');
const db = new Proxy({}, { get: (_, p) => (...args) => getDb()[p](...args) });

const router = express.Router();

router.get('/', requireAuth, (req, res) => {
  const practiceId = req.session.practiceId;

  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const tomorrow = new Date(now.getTime() + 86400000).toISOString().slice(0, 10);
  const monthStart = today.slice(0, 8) + '01';
  const monthEnd = (() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().slice(0, 10);
  })();
  const weekEnd = new Date(now.getTime() + 7 * 86400000).toISOString().slice(0, 10);
  const trialWarnDate = weekEnd;
  const dayOfMonth = now.getDate();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

  // ── practice info ────────────────────────────────────────────────────────────
  const practice = db.prepare(
    'SELECT * FROM practices WHERE id = ?'
  ).get(practiceId);

  // ── practitioner completeness ────────────────────────────────────────────────
  const practitionerCount = db.prepare(
    'SELECT COUNT(*) as n FROM practitioners WHERE practice_id = ? AND active = 1'
  ).get(practiceId).n;

  const hasAvailability = db.prepare(`
    SELECT COUNT(*) as n FROM practitioner_availability pa
    JOIN practitioners pr ON pa.practitioner_id = pr.id
    WHERE pr.practice_id = ?
  `).get(practiceId).n;

  const practitionersNoSpecialty = db.prepare(`
    SELECT COUNT(*) as n FROM practitioners
    WHERE practice_id = ? AND active = 1 AND (specialty IS NULL OR specialty = '')
  `).get(practiceId).n;

  const practitionersNoBio = db.prepare(`
    SELECT COUNT(*) as n FROM practitioners
    WHERE practice_id = ? AND active = 1 AND (bio IS NULL OR bio = '')
  `).get(practiceId).n;

  // ── new-practice detection ────────────────────────────────────────────────────
  const appointmentDaysCount = db.prepare(
    'SELECT COUNT(DISTINCT appointment_date) as n FROM appointments WHERE practice_id = ?'
  ).get(practiceId).n;

  const totalInvoicesEver = db.prepare(
    'SELECT COUNT(*) as n FROM invoices WHERE practice_id = ?'
  ).get(practiceId).n;

  const auslastungHasData = appointmentDaysCount >= 7;

  const HINT_TEXTS = {
    de: {
      no_apts:         'Heute sind noch keine Termine eingetragen.',
      apts_today:      n => `Heute sind ${n} Termin(e) geplant.`,
      cancelled_slots: n => `Diese Woche gibt es ${n} stornierte Slots – mögliche freie Zeiten für die Warteliste.`,
      open_invoices:   (n, amt) => `Es gibt ${n} offene Rechnung(en) mit einem Gesamtbetrag von ${amt} €.`,
      overdue:         n => `${n} Rechnung(en) ist/sind überfällig (Fälligkeitsdatum überschritten).`,
      neg_reviews:     n => `${n} negative Bewertung(en) (≤ 2 Sterne) wurde(n) noch nicht freigegeben oder gelöst.`,
      waitlist:        n => `Die Warteliste enthält ${n} wartende Patient(en).`,
      open_offers:     n => `${n} Wartelisten-Angebot(e) wurden noch nicht beantwortet.`,
      new_reviews:     n => `${n} neue Bewertung(en) warten auf Freigabe.`,
      trial_warn:      d => `Die Testphase läuft am ${d} ab. Bitte upgraden Sie Ihr Konto rechtzeitig.`,
      all_ok:          'Alles in Ordnung – keine offenen Aufgaben.',
    },
    en: {
      no_apts:         'No appointments scheduled for today.',
      apts_today:      n => `${n} appointment(s) scheduled for today.`,
      cancelled_slots: n => `This week has ${n} cancelled slot(s) – possible openings for the waitlist.`,
      open_invoices:   (n, amt) => `There are ${n} open invoice(s) totalling €${amt}.`,
      overdue:         n => `${n} invoice(s) are overdue (past due date).`,
      neg_reviews:     n => `${n} negative review(s) (≤ 2 stars) have not been resolved.`,
      waitlist:        n => `The waitlist has ${n} waiting patient(s).`,
      open_offers:     n => `${n} waitlist offer(s) have not been answered yet.`,
      new_reviews:     n => `${n} new review(s) are awaiting approval.`,
      trial_warn:      d => `Trial ends on ${d}. Please upgrade your account in time.`,
      all_ok:          'Everything is fine – no open tasks.',
    },
    fr: {
      no_apts:         "Aucun rendez-vous prévu pour aujourd'hui.",
      apts_today:      n => `${n} rendez-vous prévu(s) aujourd'hui.`,
      cancelled_slots: n => `Cette semaine, il y a ${n} créneau(x) annulé(s) – horaires libres possibles pour la liste d'attente.`,
      open_invoices:   (n, amt) => `Il y a ${n} facture(s) ouverte(s) pour un montant total de ${amt} €.`,
      overdue:         n => `${n} facture(s) sont en retard (date d'échéance dépassée).`,
      neg_reviews:     n => `${n} avis négatif(s) (≤ 2 étoiles) n'ont pas encore été traités.`,
      waitlist:        n => `La liste d'attente contient ${n} patient(s) en attente.`,
      open_offers:     n => `${n} offre(s) de liste d'attente n'ont pas encore reçu de réponse.`,
      new_reviews:     n => `${n} nouvel(le)(s) avis attendent une approbation.`,
      trial_warn:      d => `La période d'essai se termine le ${d}. Veuillez mettre à niveau votre compte à temps.`,
      all_ok:          'Tout va bien – aucune tâche en cours.',
    },
    es: {
      no_apts:         'No hay citas programadas para hoy.',
      apts_today:      n => `Hoy hay ${n} cita(s) programada(s).`,
      cancelled_slots: n => `Esta semana hay ${n} franja(s) cancelada(s) – posibles huecos para la lista de espera.`,
      open_invoices:   (n, amt) => `Hay ${n} factura(s) pendiente(s) por un total de ${amt} €.`,
      overdue:         n => `${n} factura(s) están vencidas (fecha de vencimiento superada).`,
      neg_reviews:     n => `${n} reseña(s) negativa(s) (≤ 2 estrellas) aún no han sido resueltas.`,
      waitlist:        n => `La lista de espera tiene ${n} paciente(s) en espera.`,
      open_offers:     n => `${n} oferta(s) de lista de espera aún no han recibido respuesta.`,
      new_reviews:     n => `${n} reseña(s) nueva(s) esperan aprobación.`,
      trial_warn:      d => `El período de prueba termina el ${d}. Por favor actualice su cuenta a tiempo.`,
      all_ok:          'Todo está bien – no hay tareas pendientes.',
    },
    pt: {
      no_apts:         'Nenhuma consulta agendada para hoje.',
      apts_today:      n => `Hoje há ${n} consulta(s) agendada(s).`,
      cancelled_slots: n => `Esta semana há ${n} horário(s) cancelado(s) – possíveis vagas para a lista de espera.`,
      open_invoices:   (n, amt) => `Há ${n} fatura(s) em aberto no total de €${amt}.`,
      overdue:         n => `${n} fatura(s) estão vencidas (data de vencimento ultrapassada).`,
      neg_reviews:     n => `${n} avaliação(ões) negativa(s) (≤ 2 estrelas) ainda não foram resolvidas.`,
      waitlist:        n => `A lista de espera tem ${n} paciente(s) aguardando.`,
      open_offers:     n => `${n} oferta(s) da lista de espera ainda não receberam resposta.`,
      new_reviews:     n => `${n} nova(s) avaliação(ões) aguardam aprovação.`,
      trial_warn:      d => `O período de teste termina em ${d}. Por favor, atualize sua conta a tempo.`,
      all_ok:          'Tudo em ordem – nenhuma tarefa pendente.',
    },
    ar: {
      no_apts:         'لا توجد مواعيد مجدولة اليوم.',
      apts_today:      n => `هناك ${n} موعد(مواعيد) مجدولة اليوم.`,
      cancelled_slots: n => `هذا الأسبوع يوجد ${n} موعد(مواعيد) ملغاة – أوقات محتملة لقائمة الانتظار.`,
      open_invoices:   (n, amt) => `يوجد ${n} فاتورة(فواتير) مفتوحة بمجموع ${amt} €.`,
      overdue:         n => `${n} فاتورة(فواتير) متأخرة (تجاوزت تاريخ الاستحقاق).`,
      neg_reviews:     n => `${n} تقييم(تقييمات) سلبي (≤ 2 نجوم) لم يتم حله بعد.`,
      waitlist:        n => `قائمة الانتظار تحتوي على ${n} مريض(مرضى) منتظر.`,
      open_offers:     n => `${n} عرض(عروض) من قائمة الانتظار لم يتم الرد عليها بعد.`,
      new_reviews:     n => `${n} تقييم(تقييمات) جديدة تنتظر الموافقة.`,
      trial_warn:      d => `تنتهي فترة التجربة في ${d}. يرجى ترقية حسابك في الوقت المناسب.`,
      all_ok:          'كل شيء على ما يرام – لا توجد مهام مفتوحة.',
    },
    ru: {
      no_apts:         'На сегодня нет запланированных приёмов.',
      apts_today:      n => `Сегодня запланировано ${n} приём(ов).`,
      cancelled_slots: n => `На этой неделе ${n} отменённых слотов – возможные свободные места для листа ожидания.`,
      open_invoices:   (n, amt) => `Есть ${n} открытых счёт(ов) на общую сумму ${amt} €.`,
      overdue:         n => `${n} счёт(ов) просрочен(ы) (срок оплаты истёк).`,
      neg_reviews:     n => `${n} отрицательный отзыв(ов) (≤ 2 звезды) ещё не обработан(ы).`,
      waitlist:        n => `В листе ожидания ${n} пациент(ов).`,
      open_offers:     n => `${n} предложение(й) из листа ожидания ещё не получило ответа.`,
      new_reviews:     n => `${n} новый отзыв(ов) ожидают одобрения.`,
      trial_warn:      d => `Пробный период заканчивается ${d}. Пожалуйста, обновите аккаунт вовремя.`,
      all_ok:          'Всё в порядке – нет открытых задач.',
    },
    zh: {
      no_apts:         '今天还没有预约。',
      apts_today:      n => `今天有 ${n} 个预约。`,
      cancelled_slots: n => `本周有 ${n} 个已取消的时段 – 可能为等待名单提供空位。`,
      open_invoices:   (n, amt) => `有 ${n} 张未付发票，总金额 ${amt} €。`,
      overdue:         n => `${n} 张发票已逾期（超过截止日期）。`,
      neg_reviews:     n => `${n} 条负面评价（≤ 2 星）尚未处理。`,
      waitlist:        n => `等待名单中有 ${n} 名患者。`,
      open_offers:     n => `${n} 条等待名单邀约尚未得到回应。`,
      new_reviews:     n => `${n} 条新评价等待审核。`,
      trial_warn:      d => `试用期将于 ${d} 到期，请及时升级您的账户。`,
      all_ok:          '一切正常 – 没有待处理任务。',
    },
    hi: {
      no_apts:         'आज के लिए कोई अपॉइंटमेंट निर्धारित नहीं है।',
      apts_today:      n => `आज ${n} अपॉइंटमेंट निर्धारित हैं।`,
      cancelled_slots: n => `इस सप्ताह ${n} रद्द स्लॉट हैं – प्रतीक्षा सूची के लिए संभावित समय।`,
      open_invoices:   (n, amt) => `${n} खुले चालान हैं जिनकी कुल राशि ${amt} € है।`,
      overdue:         n => `${n} चालान अतिदेय हैं (नियत तिथि पार हो गई)।`,
      neg_reviews:     n => `${n} नकारात्मक समीक्षाएं (≤ 2 सितारे) अभी तक हल नहीं हुई हैं।`,
      waitlist:        n => `प्रतीक्षा सूची में ${n} मरीज़ हैं।`,
      open_offers:     n => `${n} प्रतीक्षा सूची प्रस्ताव का अभी तक जवाब नहीं दिया गया है।`,
      new_reviews:     n => `${n} नई समीक्षाएं अनुमोदन की प्रतीक्षा कर रही हैं।`,
      trial_warn:      d => `परीक्षण अवधि ${d} को समाप्त होती है। कृपया समय पर अपना खाता अपग्रेड करें।`,
      all_ok:          'सब ठीक है – कोई खुला कार्य नहीं।',
    },
    th: {
      no_apts:         'ยังไม่มีการนัดหมายสำหรับวันนี้',
      apts_today:      n => `วันนี้มีการนัดหมาย ${n} รายการ`,
      cancelled_slots: n => `สัปดาห์นี้มี ${n} ช่องว่างที่ถูกยกเลิก – อาจเป็นเวลาว่างสำหรับรายการรอ`,
      open_invoices:   (n, amt) => `มีใบแจ้งหนี้เปิดอยู่ ${n} รายการ รวมมูลค่า ${amt} €`,
      overdue:         n => `${n} ใบแจ้งหนี้เกินกำหนดชำระ`,
      neg_reviews:     n => `${n} รีวิวเชิงลบ (≤ 2 ดาว) ยังไม่ได้รับการแก้ไข`,
      waitlist:        n => `รายการรอมีผู้ป่วย ${n} ราย`,
      open_offers:     n => `${n} ข้อเสนอรายการรอยังไม่ได้รับการตอบกลับ`,
      new_reviews:     n => `${n} รีวิวใหม่รอการอนุมัติ`,
      trial_warn:      d => `ช่วงทดลองใช้สิ้นสุดวันที่ ${d} กรุณาอัปเกรดบัญชีของคุณให้ทันเวลา`,
      all_ok:          'ทุกอย่างเรียบร้อย – ไม่มีงานที่ค้างอยู่',
    },
    tr: {
      no_apts:         'Bugün için planlanmış randevu yok.',
      apts_today:      n => `Bugün ${n} randevu planlandı.`,
      cancelled_slots: n => `Bu hafta ${n} iptal edilen slot var – bekleme listesi için olası boş zamanlar.`,
      open_invoices:   (n, amt) => `Toplam ${amt} € tutarında ${n} açık fatura var.`,
      overdue:         n => `${n} fatura gecikmiş durumda (son ödeme tarihi geçti).`,
      neg_reviews:     n => `${n} olumsuz yorum (≤ 2 yıldız) henüz çözülmedi.`,
      waitlist:        n => `Bekleme listesinde ${n} hasta var.`,
      open_offers:     n => `${n} bekleme listesi teklifi henüz yanıtlanmadı.`,
      new_reviews:     n => `${n} yeni yorum onay bekliyor.`,
      trial_warn:      d => `Deneme süresi ${d} tarihinde sona eriyor. Lütfen hesabınızı zamanında yükseltin.`,
      all_ok:          'Her şey yolunda – açık görev yok.',
    },
    id: {
      no_apts:         'Belum ada janji temu untuk hari ini.',
      apts_today:      n => `Ada ${n} janji temu hari ini.`,
      cancelled_slots: n => `Minggu ini ada ${n} slot yang dibatalkan – kemungkinan waktu tersedia untuk daftar tunggu.`,
      open_invoices:   (n, amt) => `Ada ${n} faktur terbuka dengan total ${amt} €.`,
      overdue:         n => `${n} faktur telah jatuh tempo (melewati tanggal jatuh tempo).`,
      neg_reviews:     n => `${n} ulasan negatif (≤ 2 bintang) belum diselesaikan.`,
      waitlist:        n => `Daftar tunggu memiliki ${n} pasien yang menunggu.`,
      open_offers:     n => `${n} penawaran daftar tunggu belum mendapat respons.`,
      new_reviews:     n => `${n} ulasan baru menunggu persetujuan.`,
      trial_warn:      d => `Masa percobaan berakhir pada ${d}. Harap tingkatkan akun Anda tepat waktu.`,
      all_ok:          'Semua baik-baik saja – tidak ada tugas yang tertunda.',
    },
  };

  // ── 1. Tagesbericht ──────────────────────────────────────────────────────────
  const termineHeute = db.prepare(`
    SELECT COUNT(*) as count FROM appointments
    WHERE practice_id = ? AND appointment_date = ? AND status NOT IN ('cancelled', 'archived')
  `).get(practiceId, today);

  const termineMorgen = db.prepare(`
    SELECT COUNT(*) as count FROM appointments
    WHERE practice_id = ? AND appointment_date = ? AND status NOT IN ('cancelled', 'archived')
  `).get(practiceId, tomorrow);

  const neuePatientenHeute = db.prepare(`
    SELECT COUNT(DISTINCT patient_email) as count FROM appointments
    WHERE practice_id = ? AND appointment_date = ? AND status NOT IN ('cancelled', 'archived')
  `).get(practiceId, today);

  const offeneRechnungen = db.prepare(`
    SELECT COUNT(*) as count, COALESCE(SUM(total_amount),0) as total
    FROM invoices WHERE practice_id = ? AND status != 'paid'
  `).get(practiceId);

  const tagesUmsatz = db.prepare(`
    SELECT COALESCE(SUM(p.amount),0) as total
    FROM payments p JOIN invoices i ON p.invoice_id = i.id
    WHERE i.practice_id = ? AND p.payment_date = ? AND p.status = 'completed'
  `).get(practiceId, today);

  const wartelisteCount = db.prepare(`
    SELECT COUNT(*) as count FROM waitlist
    WHERE practice_id = ? AND status = 'waiting'
  `).get(practiceId);

  const neueBewertungen = db.prepare(`
    SELECT COUNT(*) as count FROM reviews
    WHERE practice_id = ? AND visible = 0
  `).get(practiceId);

  const negativeBewertungenOffen = db.prepare(`
    SELECT COUNT(*) as count FROM reviews
    WHERE practice_id = ? AND rating <= 2 AND visible = 0
  `).get(practiceId);

  // ── 2. Finanzübersicht ───────────────────────────────────────────────────────
  const umsatzMonat = db.prepare(`
    SELECT COALESCE(SUM(p.amount),0) as total, COUNT(*) as count
    FROM payments p JOIN invoices i ON p.invoice_id = i.id
    WHERE i.practice_id = ? AND p.payment_date BETWEEN ? AND ? AND p.status = 'completed'
  `).get(practiceId, monthStart, monthEnd);

  const bezahlteRechnungen = db.prepare(`
    SELECT COUNT(*) as count, COALESCE(SUM(total_amount),0) as total
    FROM invoices WHERE practice_id = ? AND status = 'paid'
  `).get(practiceId);

  const rechnungenUeberfaellig = db.prepare(`
    SELECT COUNT(*) as count FROM invoices
    WHERE practice_id = ? AND status != 'paid' AND due_date < ?
  `).get(practiceId, today);

  // ── 3. Termin-Analyse ────────────────────────────────────────────────────────
  const terminArtTop = db.prepare(`
    SELECT appointment_type, COUNT(*) as count
    FROM appointments
    WHERE practice_id = ? AND appointment_date BETWEEN ? AND ? AND status NOT IN ('cancelled', 'archived')
      AND appointment_type IS NOT NULL AND appointment_type != ''
    GROUP BY appointment_type ORDER BY count DESC LIMIT 1
  `).get(practiceId, monthStart, monthEnd);

  const beliebterBehandler = db.prepare(`
    SELECT pr.first_name, pr.last_name, pr.title, COUNT(*) as count
    FROM appointments a
    JOIN practitioners pr ON a.practitioner_id = pr.id
    WHERE a.practice_id = ? AND a.appointment_date BETWEEN ? AND ? AND a.status NOT IN ('cancelled', 'archived')
    GROUP BY a.practitioner_id ORDER BY count DESC LIMIT 1
  `).get(practiceId, monthStart, monthEnd);

  const stornierungen = db.prepare(`
    SELECT COUNT(*) as count FROM appointments
    WHERE practice_id = ? AND appointment_date BETWEEN ? AND ? AND status = 'cancelled'
  `).get(practiceId, monthStart, monthEnd);

  const abgeschlossen = db.prepare(`
    SELECT COUNT(*) as count FROM appointments
    WHERE practice_id = ? AND appointment_date BETWEEN ? AND ? AND status = 'completed'
  `).get(practiceId, monthStart, monthEnd);

  const gesamtTermine = db.prepare(`
    SELECT COUNT(*) as count FROM appointments
    WHERE practice_id = ? AND appointment_date BETWEEN ? AND ? AND status != 'archived'
  `).get(practiceId, monthStart, monthEnd);

  const auslastung = gesamtTermine.count > 0
    ? Math.round((abgeschlossen.count / gesamtTermine.count) * 100)
    : 0;

  // ── 4. Bewertungs-Analyse ────────────────────────────────────────────────────
  const bewertungAvg = db.prepare(`
    SELECT ROUND(AVG(rating),1) as avg, COUNT(*) as total
    FROM reviews WHERE practice_id = ?
  `).get(practiceId);

  const positiveBewertungen = db.prepare(`
    SELECT COUNT(*) as count FROM reviews
    WHERE practice_id = ? AND rating >= 4
  `).get(practiceId);

  const negativeBewertungen = db.prepare(`
    SELECT COUNT(*) as count FROM reviews
    WHERE practice_id = ? AND rating <= 2
  `).get(practiceId);

  const negativeNichtGeloest = db.prepare(`
    SELECT COUNT(*) as count FROM reviews
    WHERE practice_id = ? AND rating <= 2 AND visible = 0
  `).get(practiceId);

  // ── 5. Wartelisten-Analyse ───────────────────────────────────────────────────
  const aeltesteAnfrage = db.prepare(`
    SELECT created_at FROM waitlist
    WHERE practice_id = ? AND status = 'waiting'
    ORDER BY created_at ASC LIMIT 1
  `).get(practiceId);

  const moeglicheSlots = db.prepare(`
    SELECT COUNT(*) as count FROM appointments
    WHERE practice_id = ? AND status = 'cancelled'
      AND appointment_date BETWEEN ? AND ?
  `).get(practiceId, today, weekEnd);

  const offeneAngebote = db.prepare(`
    SELECT COUNT(*) as count FROM waitlist_offers wo
    JOIN waitlist wl ON wo.waitlist_id = wl.id
    WHERE wl.practice_id = ? AND wo.status = 'pending'
  `).get(practiceId);

  // ── 6. Intelligente Hinweise (legacy) ───────────────────────────────────────
  const lang = (practice && practice.language) || 'de';
  const H = HINT_TEXTS[lang] || HINT_TEXTS.de;
  const hinweise = [];

  if (termineHeute.count === 0) {
    hinweise.push({ type: 'info', text: H.no_apts });
  } else {
    hinweise.push({ type: 'success', text: H.apts_today(termineHeute.count) });
  }
  if (moeglicheSlots.count > 0)
    hinweise.push({ type: 'info', text: H.cancelled_slots(moeglicheSlots.count) });
  if (offeneRechnungen.count > 0)
    hinweise.push({ type: 'warning', text: H.open_invoices(offeneRechnungen.count, Number(offeneRechnungen.total).toFixed(2)) });
  if (rechnungenUeberfaellig.count > 0)
    hinweise.push({ type: 'danger', text: H.overdue(rechnungenUeberfaellig.count) });
  if (negativeNichtGeloest.count > 0)
    hinweise.push({ type: 'danger', text: H.neg_reviews(negativeNichtGeloest.count) });
  if (wartelisteCount.count > 0)
    hinweise.push({ type: 'warning', text: H.waitlist(wartelisteCount.count) });
  if (offeneAngebote.count > 0)
    hinweise.push({ type: 'info', text: H.open_offers(offeneAngebote.count) });
  if (neueBewertungen.count > 0)
    hinweise.push({ type: 'info', text: H.new_reviews(neueBewertungen.count) });
  if (practice && practice.trial_end_date && practice.trial_end_date <= trialWarnDate)
    hinweise.push({ type: 'warning', text: H.trial_warn(practice.trial_end_date) });
  if (hinweise.length === 0)
    hinweise.push({ type: 'success', text: H.all_ok });

  // ── 7. Umsatzprognose ────────────────────────────────────────────────────────
  const umsatz90d = db.prepare(`
    SELECT COALESCE(SUM(p.amount), 0) as total
    FROM payments p JOIN invoices i ON p.invoice_id = i.id
    WHERE i.practice_id = ? AND p.payment_date >= date('now', '-90 days')
    AND p.status = 'completed'
  `).get(practiceId).total;

  const avgMonthlyRevenue = umsatz90d / 3;
  const monthProgressPct = dayOfMonth / daysInMonth;
  const revenueThisMonth = Number(umsatzMonat.total || 0);

  let revenueForecast = avgMonthlyRevenue;
  if (monthProgressPct > 0.05) {
    revenueForecast = revenueThisMonth / monthProgressPct;
  }

  // Vormonatsumsatz zum Vergleich
  const prevMonthStart = (() => {
    const d = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return d.toISOString().slice(0, 10);
  })();
  const prevMonthEnd = (() => {
    const d = new Date(now.getFullYear(), now.getMonth(), 0);
    return d.toISOString().slice(0, 10);
  })();
  const umsatzVormonat = db.prepare(`
    SELECT COALESCE(SUM(p.amount), 0) as total
    FROM payments p JOIN invoices i ON p.invoice_id = i.id
    WHERE i.practice_id = ? AND p.payment_date BETWEEN ? AND ? AND p.status = 'completed'
  `).get(practiceId, prevMonthStart, prevMonthEnd).total;

  const forecastTrend = umsatzVormonat > 0
    ? Math.round(((revenueForecast - umsatzVormonat) / umsatzVormonat) * 100)
    : 0;

  // Monatsumsatz letzte 6 Monate für Chart
  const umsatzVerlauf = db.prepare(`
    SELECT strftime('%Y-%m', p.payment_date) as month,
           COALESCE(SUM(p.amount), 0) as revenue
    FROM payments p JOIN invoices i ON p.invoice_id = i.id
    WHERE i.practice_id = ? AND p.payment_date >= date('now', '-6 months')
    AND p.status = 'completed'
    GROUP BY month ORDER BY month
  `).all(practiceId);

  // ── 8. Auslastungsprognose 7 Tage ───────────────────────────────────────────
  const avgTagesTermine = db.prepare(`
    SELECT COALESCE(AVG(cnt), 0) as avg FROM (
      SELECT appointment_date, COUNT(*) as cnt
      FROM appointments
      WHERE practice_id = ? AND appointment_date BETWEEN date('now','-30 days') AND date('now','-1 day')
        AND status NOT IN ('cancelled', 'archived')
      GROUP BY appointment_date
    )
  `).get(practiceId).avg || 1;

  const auslastungPrognose7d = [];
  const dayNames = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
  for (let i = 0; i < 7; i++) {
    const d = new Date(now.getTime() + i * 86400000);
    const dateStr = d.toISOString().slice(0, 10);
    const label = dayNames[d.getDay()] + ' ' + d.getDate() + '.' + (d.getMonth() + 1).toString().padStart(2, '0');
    const count = db.prepare(`
      SELECT COUNT(*) as count FROM appointments
      WHERE practice_id = ? AND appointment_date = ? AND status NOT IN ('cancelled', 'archived')
    `).get(practiceId, dateStr).count;
    const pct = Math.min(Math.round((count / Math.max(avgTagesTermine, 1)) * 100), 120);
    auslastungPrognose7d.push({ date: dateStr, label, count, pct, isToday: i === 0 });
  }

  // ── 9. Automatische Warnungen ────────────────────────────────────────────────
  const warnungen = [];

  if (rechnungenUeberfaellig.count > 0)
    warnungen.push({ level: 'rot', text: `${rechnungenUeberfaellig.count} Rechnung(en) überfällig – Zahlungserinnerung senden`, link: '/invoices.html', action: 'Rechnungen öffnen' });
  if (negativeNichtGeloest.count > 0)
    warnungen.push({ level: 'rot', text: `${negativeNichtGeloest.count} negative Bewertung(en) noch nicht beantwortet`, link: '/reviews.html', action: 'Bewertungen öffnen' });
  if (bewertungAvg.avg && bewertungAvg.avg < 3 && bewertungAvg.total >= 3)
    warnungen.push({ level: 'rot', text: `Kritische Durchschnittsbewertung: Ø ${bewertungAvg.avg}/5 – sofort reagieren`, link: '/reviews.html', action: 'Bewertungen öffnen' });
  if (practice && practice.trial_end_date && practice.trial_end_date <= trialWarnDate)
    warnungen.push({ level: 'gelb', text: `Testphase läuft am ${practice.trial_end_date} ab – rechtzeitig upgraden`, link: '/subscription.html', action: 'Konto upgraden' });
  if (wartelisteCount.count > 10)
    warnungen.push({ level: 'gelb', text: `${wartelisteCount.count} Patienten auf der Warteliste – Kapazität prüfen`, link: '/waitlist-admin.html', action: 'Warteliste öffnen' });
  if (auslastung < 35 && gesamtTermine.count > 5)
    warnungen.push({ level: 'gelb', text: `Niedrige Auslastung (${auslastung}%) diesen Monat – Zeitslots prüfen`, link: '/appointments.html', action: 'Kalender öffnen' });
  if (offeneAngebote.count > 0)
    warnungen.push({ level: 'gelb', text: `${offeneAngebote.count} Wartelisten-Angebot(e) noch nicht beantwortet`, link: '/waitlist-admin.html', action: 'Warteliste öffnen' });
  if (offeneRechnungen.count > 5)
    warnungen.push({ level: 'gelb', text: `${offeneRechnungen.count} offene Rechnungen ausstehend – Routine-Check empfohlen`, link: '/invoices.html', action: 'Rechnungen öffnen' });
  if (warnungen.length === 0)
    warnungen.push({ level: 'gruen', text: 'Keine aktiven Warnungen – Praxis läuft stabil', link: null, action: null });

  // ── 10. Prioritäten heute ────────────────────────────────────────────────────
  const prioritaetenHeute = [];

  if (rechnungenUeberfaellig.count > 0)
    prioritaetenHeute.push({ level: 'kritisch', text: `${rechnungenUeberfaellig.count} überfällige Rechnung(en) – sofort handeln`, link: '/invoices.html' });
  if (negativeNichtGeloest.count > 0)
    prioritaetenHeute.push({ level: 'dringend', text: `${negativeNichtGeloest.count} negative Bewertung(en) beantworten`, link: '/reviews.html' });
  if (offeneAngebote.count > 0)
    prioritaetenHeute.push({ level: 'dringend', text: `${offeneAngebote.count} Wartelisten-Angebot(e) ausstehend`, link: '/waitlist-admin.html' });
  if (termineHeute.count > 0)
    prioritaetenHeute.push({ level: 'heute', text: `${termineHeute.count} Termin(e) heute – Unterlagen vorbereiten`, link: '/appointments.html' });
  if (neueBewertungen.count > 0)
    prioritaetenHeute.push({ level: 'info', text: `${neueBewertungen.count} neue Bewertung(en) zur Freigabe`, link: '/reviews.html' });
  if (wartelisteCount.count > 0 && moeglicheSlots.count > 0)
    prioritaetenHeute.push({ level: 'info', text: `${moeglicheSlots.count} freie Slots – Warteliste jetzt benachrichtigen`, link: '/waitlist-admin.html' });
  if (prioritaetenHeute.length === 0)
    prioritaetenHeute.push({ level: 'ok', text: 'Keine dringenden Aufgaben heute – Praxis läuft optimal', link: null });

  // ── 11. KI-Empfehlungen ──────────────────────────────────────────────────────
  const kiEmpfehlungen = [];
  const stornierungsrate = gesamtTermine.count > 0
    ? Math.round((stornierungen.count / gesamtTermine.count) * 100)
    : 0;

  if (stornierungsrate > 20)
    kiEmpfehlungen.push({ impact: 'hoch', text: `Stornierungsrate ${stornierungsrate}%: Automatische Terminerinnerungs-E-Mail 24h vorher einrichten, um No-Shows zu reduzieren.` });
  if (wartelisteCount.count > 0 && moeglicheSlots.count > 0)
    kiEmpfehlungen.push({ impact: 'hoch', text: `${moeglicheSlots.count} stornierte Slot(s) können sofort aus der Warteliste (${wartelisteCount.count} wartend) gefüllt werden.` });
  if (auslastung < 60 && gesamtTermine.count > 3)
    kiEmpfehlungen.push({ impact: 'mittel', text: `Auslastung ${auslastung}%: Zusätzliche Zeitslots anbieten oder Öffnungszeiten auf der Buchungsseite kommunizieren.` });
  if (bewertungAvg.avg && bewertungAvg.avg >= 4 && bewertungAvg.total < 10)
    kiEmpfehlungen.push({ impact: 'mittel', text: `Sehr gute Bewertung (Ø ${bewertungAvg.avg}/5): Patienten nach dem Termin aktiv um eine Bewertung bitten – steigert Sichtbarkeit.` });
  if (offeneRechnungen.count > 3)
    kiEmpfehlungen.push({ impact: 'mittel', text: `${offeneRechnungen.count} offene Rechnungen: Wöchentliche Rechnungsroutine (z.B. Dienstag 10 Uhr) einführen.` });
  if (termineMorgen.count > 3)
    kiEmpfehlungen.push({ impact: 'niedrig', text: `Morgen ${termineMorgen.count} Termine – Unterlagen und Räume noch heute vorbereiten.` });
  if (negativeNichtGeloest.count === 0 && bewertungAvg.avg && bewertungAvg.avg >= 4)
    kiEmpfehlungen.push({ impact: 'niedrig', text: 'Bewertungsmanagement vorbildlich: Alle negativen Bewertungen beantwortet. Weiter so!' });
  if (kiEmpfehlungen.length === 0) {
    const isNewPractice = gesamtTermine.count < 3 && totalInvoicesEver === 0;
    kiEmpfehlungen.push(isNewPractice
      ? { impact: 'setup', text: 'Vervollständigen Sie Ihr Praxisprofil, um personalisierte KI-Empfehlungen zu erhalten.', link: '/settings.html' }
      : { impact: 'gut',   text: 'Ihre Praxis läuft sehr gut. Keine spezifischen Handlungsempfehlungen erforderlich.' }
    );
  }

  // ── 12. To-do-Liste ──────────────────────────────────────────────────────────
  const todos = [];

  if (rechnungenUeberfaellig.count > 0)
    todos.push({ priority: 'kritisch', text: `${rechnungenUeberfaellig.count} überfällige Rechnung(en) nachfassen`, link: '/invoices.html' });
  if (negativeNichtGeloest.count > 0)
    todos.push({ priority: 'hoch', text: `${negativeNichtGeloest.count} negative Bewertung(en) beantworten`, link: '/reviews.html' });
  if (offeneRechnungen.count > 0)
    todos.push({ priority: 'hoch', text: `${offeneRechnungen.count} offene Rechnung(en) prüfen und versenden`, link: '/invoices.html' });
  if (neueBewertungen.count > 0)
    todos.push({ priority: 'mittel', text: `${neueBewertungen.count} neue Bewertung(en) prüfen und freigeben`, link: '/reviews.html' });
  if (wartelisteCount.count > 0 && moeglicheSlots.count > 0)
    todos.push({ priority: 'mittel', text: `${Math.min(wartelisteCount.count, moeglicheSlots.count)} Wartelisten-Patient(en) freie Slots anbieten`, link: '/waitlist-admin.html' });
  if (termineHeute.count > 0)
    todos.push({ priority: 'heute', text: `${termineHeute.count} heutige Termin(e) vorbereiten`, link: '/appointments.html' });
  if (termineMorgen.count > 0)
    todos.push({ priority: 'niedrig', text: `${termineMorgen.count} morgige Termin(e) vorbereiten`, link: '/appointments.html' });
  todos.push({ priority: 'niedrig', text: 'Praxis-Profil auf Vollständigkeit prüfen', link: '/practice.html' });

  // ── 13. Ampel-Handlungsempfehlungen ─────────────────────────────────────────
  const avgRating = bewertungAvg.avg || 0;
  const ampelEmpfehlungen = [
    {
      bereich: 'Finanzen',
      status: rechnungenUeberfaellig.count === 0 ? 'gruen'
        : rechnungenUeberfaellig.count <= 2 ? 'gelb' : 'rot',
      text: rechnungenUeberfaellig.count === 0
        ? 'Alle Rechnungen im grünen Bereich – keine Maßnahmen nötig.'
        : rechnungenUeberfaellig.count <= 2
        ? `${rechnungenUeberfaellig.count} überfällige Rechnung(en) – Zahlungserinnerung senden.`
        : `${rechnungenUeberfaellig.count} Rechnungen überfällig – dringend Mahnlauf starten.`,
      detail: `Offen: ${offeneRechnungen.count} | Bezahlt: ${bezahlteRechnungen.count}`,
      link: '/invoices.html',
      action: rechnungenUeberfaellig.count > 0 ? 'Rechnungen öffnen' : null,
    },
    {
      bereich: 'Auslastung',
      status: gesamtTermine.count < 3 ? 'gruen'
        : auslastung >= 70 ? 'gruen' : auslastung >= 40 ? 'gelb' : 'rot',
      text: gesamtTermine.count < 3
        ? 'Noch keine Termindaten vorhanden. Die Auslastungsanalyse wird automatisch aktiviert, sobald Termine gebucht werden.'
        : auslastung >= 70
        ? `Gute Auslastung: ${auslastung}% diesen Monat – weiter so!`
        : auslastung >= 40
        ? `Auslastung ${auslastung}%: Optimierungspotenzial vorhanden.`
        : `Niedrige Auslastung (${auslastung}%): Warteliste aktivieren oder Termine bewerben.`,
      detail: gesamtTermine.count < 3
        ? 'Noch keine auswertbaren Termine'
        : `Gesamt: ${gesamtTermine.count} | Abgeschlossen: ${abgeschlossen.count} | Storniert: ${stornierungen.count}`,
      link: '/appointments.html',
      action: gesamtTermine.count >= 3 && auslastung < 70 ? 'Kalender öffnen' : null,
    },
    {
      bereich: 'Bewertungen',
      status: !avgRating || bewertungAvg.total < 2 ? 'gruen'
        : avgRating >= 4 ? 'gruen'
        : avgRating >= 3 ? 'gelb' : 'rot',
      text: bewertungAvg.total < 2
        ? 'Noch keine aussagekräftigen Bewertungen – Patienten um Feedback bitten.'
        : avgRating >= 4
        ? `Sehr gut: Ø ${avgRating}/5 Sterne aus ${bewertungAvg.total} Bewertungen.`
        : avgRating >= 3
        ? `Verbesserungspotenzial: Ø ${avgRating}/5 – auf Kritik eingehen.`
        : `Kritisch: Ø ${avgRating}/5 – sofortige Maßnahmen erforderlich.`,
      detail: `Positiv: ${positiveBewertungen.count} | Negativ: ${negativeBewertungen.count} | Ungelöst: ${negativeNichtGeloest.count}`,
      link: '/reviews.html',
      action: avgRating && avgRating < 4 && bewertungAvg.total >= 2 ? 'Bewertungen öffnen' : null,
    },
    {
      bereich: 'Warteliste',
      status: wartelisteCount.count === 0 ? 'gruen'
        : wartelisteCount.count < 5 ? 'gruen'
        : wartelisteCount.count < 15 ? 'gelb' : 'rot',
      text: wartelisteCount.count === 0
        ? 'Keine wartenden Patienten – alles verwaltet.'
        : wartelisteCount.count < 5
        ? `${wartelisteCount.count} Patient(en) warten – überschaubar.`
        : wartelisteCount.count < 15
        ? `${wartelisteCount.count} Patient(en) auf der Warteliste – prüfen.`
        : `${wartelisteCount.count} Patient(en) warten – sofortige Aufmerksamkeit erforderlich!`,
      detail: `Wartend: ${wartelisteCount.count} | Freie Slots: ${moeglicheSlots.count} | Offene Angebote: ${offeneAngebote.count}`,
      link: '/waitlist-admin.html',
      action: wartelisteCount.count > 0 ? 'Warteliste öffnen' : null,
    },
  ];

  // ── 14. Auto-generierte Setup & Optimierungs-Todos ───────────────────────────
  const setupTodos = [];

  // 1. Kritisch: Kein Behandler vorhanden
  if (practitionerCount === 0)
    setupTodos.push({ category: 'behandler', priority: 'kritisch', icon: '👨‍⚕️', text: 'Ersten Behandler anlegen – Terminbuchungen sind ohne Behandler nicht möglich', link: '/practitioners.html' });

  // 2. Kritisch: Keine Verfügbarkeit → keine Online-Buchungen möglich
  if (practitionerCount > 0 && hasAvailability === 0)
    setupTodos.push({ category: 'oeffnungszeiten', priority: 'kritisch', icon: '🕒', text: 'Verfügbarkeit für Behandler eintragen – ohne Zeitfenster sind keine Online-Buchungen möglich', link: '/practitioners.html' });

  // 3. Wichtig: Fehlende Kontaktdaten (orange)
  if (practice && (!practice.phone || !practice.phone.trim()))
    setupTodos.push({ category: 'profil', priority: 'hoch', icon: '📞', text: 'Telefonnummer in den Praxisdaten ergänzen', link: '/settings.html' });
  if (practice && (!practice.address || !practice.address.trim()))
    setupTodos.push({ category: 'profil', priority: 'hoch', icon: '📍', text: 'Praxisadresse vervollständigen', link: '/settings.html' });

  // 4. Empfohlen: Profil-Vervollständigung (gelb)
  if (practice && (!practice.website || !practice.website.trim()))
    setupTodos.push({ category: 'profil', priority: 'mittel', icon: '🌐', text: 'Website-URL hinterlegen – steigert Vertrauen bei Patienten', link: '/settings.html' });
  if (practice && (!practice.description || !practice.description.trim()))
    setupTodos.push({ category: 'profil', priority: 'mittel', icon: '📝', text: 'Praxisbeschreibung hinzufügen – sichtbar für Patienten auf der Buchungsseite', link: '/settings.html' });
  if (practitionerCount > 0 && hasAvailability > 0 && hasAvailability < 5)
    setupTodos.push({ category: 'oeffnungszeiten', priority: 'mittel', icon: '🕒', text: `Öffnungszeiten vervollständigen – nur ${hasAvailability} Zeitfenster hinterlegt`, link: '/practitioners.html' });

  // 5. Empfohlen: Bewertungen sammeln
  const totalReviews = (bewertungAvg && bewertungAvg.total) || 0;
  if (totalReviews === 0)
    setupTodos.push({ category: 'bewertungen', priority: 'mittel', icon: '⭐', text: 'Erste Bewertungen sammeln – Patienten nach dem Termin aktiv um Feedback bitten', link: '/reviews.html' });
  else if (totalReviews < 5)
    setupTodos.push({ category: 'bewertungen', priority: 'mittel', icon: '⭐', text: `Mehr Bewertungen sammeln (aktuell: ${totalReviews}) – Ziel: 10+ für bessere Online-Sichtbarkeit`, link: '/reviews.html' });

  // 6. Niedrig: Zweiter Behandler, Fachgebiet, Bio
  if (practitionerCount === 1)
    setupTodos.push({ category: 'behandler', priority: 'niedrig', icon: '👨‍⚕️', text: 'Zweiten Behandler anlegen – mehr Kapazität und Flexibilität', link: '/practitioners.html' });
  if (practitionerCount > 0 && practitionersNoSpecialty > 0)
    setupTodos.push({ category: 'behandler', priority: 'niedrig', icon: '🏷️', text: `Fachgebiet für ${practitionersNoSpecialty} Behandler ergänzen`, link: '/practitioners.html' });
  if (practitionerCount > 0 && practitionersNoBio > 0 && practitionersNoBio <= 2)
    setupTodos.push({ category: 'behandler', priority: 'niedrig', icon: '📄', text: `Bio/Beschreibung für ${practitionersNoBio} Behandler hinzufügen`, link: '/practitioners.html' });

  // 7. Warteliste / Auslastung
  if (wartelisteCount.count === 0 && stornierungen.count > 2)
    setupTodos.push({ category: 'warteliste', priority: 'mittel', icon: '📋', text: 'Warteliste aktivieren – stornierte Termine automatisch nachbesetzen', link: '/waitlist-admin.html' });
  if (practitionerCount > 0 && avgTagesTermine < 2 && gesamtTermine.count >= 3)
    setupTodos.push({ category: 'auslastung', priority: 'hoch', icon: '📊', text: `Terminauslastung niedrig (ø ${(Math.round(avgTagesTermine * 10) / 10).toFixed(1)} Termine/Tag) – Buchungsseite aktiver bewerben`, link: '/appointments.html' });

  res.json({
    generated_at: new Date().toISOString(),
    practice: {
      name: practice ? practice.name : '',
      package: practice ? practice.package : 'BASIC',
      trial_end_date: practice ? practice.trial_end_date : null,
    },
    // Legacy fields (für bestehende Clients)
    tagesbericht: {
      termine_heute: termineHeute.count,
      termine_morgen: termineMorgen.count,
      neue_patienten_heute: neuePatientenHeute.count,
      offene_rechnungen: offeneRechnungen.count,
      tages_umsatz: Number(tagesUmsatz.total || 0).toFixed(2),
      warteliste: wartelisteCount.count,
      neue_bewertungen: neueBewertungen.count,
      negative_bewertungen_offen: negativeBewertungenOffen.count,
    },
    finanzen: {
      umsatz_heute: Number(tagesUmsatz.total || 0).toFixed(2),
      umsatz_monat: Number(umsatzMonat.total || 0).toFixed(2),
      zahlungen_monat: umsatzMonat.count,
      offene_rechnungen_count: offeneRechnungen.count,
      offene_rechnungen_betrag: Number(offeneRechnungen.total || 0).toFixed(2),
      bezahlte_rechnungen_count: bezahlteRechnungen.count,
      bezahlte_rechnungen_betrag: Number(bezahlteRechnungen.total || 0).toFixed(2),
      ueberfaellig: rechnungenUeberfaellig.count,
    },
    termine: {
      top_terminart: terminArtTop ? terminArtTop.appointment_type : null,
      top_terminart_count: terminArtTop ? terminArtTop.count : 0,
      beliebter_behandler: beliebterBehandler
        ? `${beliebterBehandler.title || ''} ${beliebterBehandler.first_name} ${beliebterBehandler.last_name}`.trim()
        : null,
      beliebter_behandler_count: beliebterBehandler ? beliebterBehandler.count : 0,
      stornierungen_monat: stornierungen.count,
      abgeschlossen_monat: abgeschlossen.count,
      gesamt_monat: gesamtTermine.count,
      auslastung_prozent: auslastung,
    },
    bewertungen: {
      durchschnitt: bewertungAvg.avg || 0,
      gesamt: bewertungAvg.total,
      positiv: positiveBewertungen.count,
      negativ: negativeBewertungen.count,
      negativ_nicht_geloest: negativeNichtGeloest.count,
    },
    warteliste: {
      wartend: wartelisteCount.count,
      aelteste_anfrage: aeltesteAnfrage ? aeltesteAnfrage.created_at : null,
      moegliche_slots_woche: moeglicheSlots.count,
      offene_angebote: offeneAngebote.count,
    },
    hinweise,
    // Neue KI-Felder
    prioritaeten_heute: prioritaetenHeute,
    ki_empfehlungen: kiEmpfehlungen,
    umsatzprognose: {
      no_data: totalInvoicesEver === 0,
      diesen_monat_bisher: Number(umsatzMonat.total || 0),
      vormonat: Number(umsatzVormonat || 0),
      avg_monat_3m: Math.round(avgMonthlyRevenue),
      prognose_monatsende: Math.round(revenueForecast),
      trend_prozent: forecastTrend,
      verlauf: umsatzVerlauf,
      monat_progress_pct: Math.round(monthProgressPct * 100),
    },
    auslastungsprognose_7d: auslastungPrognose7d,
    auslastung_has_data: auslastungHasData,
    warnungen,
    todos,
    setup_todos: setupTodos,
    ampel_empfehlungen: ampelEmpfehlungen,
  });
});

module.exports = router;
