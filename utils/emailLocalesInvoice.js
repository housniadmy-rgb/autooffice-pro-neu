// utils/emailLocalesInvoice.js
// Rechnungs- und Zahlungs-Mail-Vorlagen für alle 14 unterstützten Sprachen.
// Wird in utils/emailLocales.js in das zentrale emailLocales-Objekt gemerged,
// damit renderEmail() automatisch alle Sprachen liefert.
//
// Neue Mail-Typen:
//   invoiceCreated         – Rechnung erstellt          (vars: invoiceNumber, invoiceDate, dueDate, totalAmount, currency)
//   invoiceSent            – Rechnung gesendet           (+ recipient)
//   paymentReceived        – Zahlung erhalten            (vars: invoiceNumber, paidDate, amount, currency, method)
//   paymentFailed          – Zahlung fehlgeschlagen      (vars: invoiceNumber, amount, currency, reason)
//   paymentReminder        – Mahnung / Zahlungserinnerung (vars: invoiceNumber, invoiceDate, dueDate, totalAmount, currency, daysOverdue)
//   subscriptionCancelled  – Abo gekündigt               (vars: plan, effectiveDate)
//   trialConvertedToPaid   – Trial → bezahltes Abo       (vars: plan, periodEnd, amount, currency)
//
// "Abo bestätigt" wird durch den bereits vorhandenen Typ `subscriptionConfirmation`
// (siehe emailLocales.js) abgedeckt.
//
// Jeder Eintrag pro Sprache enthält die Felder, die der renderEmail-Helper
// braucht: subject (+ optional heading), body, cta. Greeting/Signoff/Footer
// kommen aus L.common — keine Sprach-Mischung möglich.

const invoiceLocales = {
  // ── Deutsch ────────────────────────────────────────────────
  de: {
    invoiceCreated: {
      subject: (v) => `Rechnung ${v.invoiceNumber} erstellt – PraxisOnline24`,
      body: (v) => `Eine neue Rechnung wurde für Ihre Praxis erstellt.\n\nRechnungsnummer: ${v.invoiceNumber}\nRechnungsdatum: ${v.invoiceDate}\nFälligkeitsdatum: ${v.dueDate}\nGesamtbetrag: ${v.totalAmount} ${v.currency}\nStatus: Offen`,
      cta: 'Rechnung ansehen →',
    },
    invoiceSent: {
      subject: (v) => `Rechnung ${v.invoiceNumber} versendet – PraxisOnline24`,
      body: (v) => `Ihre Rechnung wurde versendet.\n\nRechnungsnummer: ${v.invoiceNumber}\nEmpfänger: ${v.recipient}\nRechnungsdatum: ${v.invoiceDate}\nFälligkeitsdatum: ${v.dueDate}\nGesamtbetrag: ${v.totalAmount} ${v.currency}\nStatus: Versendet`,
      cta: 'Rechnung ansehen →',
    },
    paymentReceived: {
      subject: (v) => `Zahlungsbestätigung – Rechnung ${v.invoiceNumber}`,
      body: (v) => `Wir haben Ihre Zahlung erhalten – vielen Dank!\n\nRechnungsnummer: ${v.invoiceNumber}\nZahlungsdatum: ${v.paidDate}\nBetrag: ${v.amount} ${v.currency}\nZahlungsart: ${v.method}\nStatus: Bezahlt`,
      cta: 'Beleg herunterladen →',
    },
    paymentFailed: {
      subject: (v) => `Zahlung fehlgeschlagen – Rechnung ${v.invoiceNumber}`,
      body: (v) => `Leider konnten wir Ihre Zahlung nicht verarbeiten.\n\nRechnungsnummer: ${v.invoiceNumber}\nBetrag: ${v.amount} ${v.currency}\nGrund: ${v.reason}\nStatus: Zahlung fehlgeschlagen\n\nBitte aktualisieren Sie Ihre Zahlungsmethode oder versuchen Sie es erneut.`,
      cta: 'Zahlung wiederholen →',
    },
    paymentReminder: {
      subject: (v) => `Zahlungserinnerung – Rechnung ${v.invoiceNumber}`,
      body: (v) => `Erinnerung: eine Rechnung ist noch offen.\n\nRechnungsnummer: ${v.invoiceNumber}\nRechnungsdatum: ${v.invoiceDate}\nFälligkeitsdatum: ${v.dueDate}\nGesamtbetrag: ${v.totalAmount} ${v.currency}\nTage überfällig: ${v.daysOverdue}\nStatus: Überfällig\n\nBitte begleichen Sie den offenen Betrag zeitnah.`,
      cta: 'Jetzt zahlen →',
    },
    subscriptionCancelled: {
      subject: 'Abonnement gekündigt – PraxisOnline24',
      body: (v) => `Ihr Abonnement wurde gekündigt.\n\nPaket: ${v.plan}\nWirksam ab: ${v.effectiveDate}\nStatus: Gekündigt\n\nBis zum Ende des laufenden Abrechnungszeitraums können Sie PraxisOnline24 weiterhin nutzen. Wir hoffen, Sie bald wieder begrüßen zu dürfen.`,
      cta: 'Abo verwalten →',
    },
    trialConvertedToPaid: {
      subject: (v) => `Testphase → ${v.plan} aktiv – PraxisOnline24`,
      body: (v) => `Ihre Testphase wurde erfolgreich in ein bezahltes Abonnement umgewandelt.\n\nPaket: ${v.plan}\nErster Abrechnungszeitraum bis: ${v.periodEnd}\nBetrag: ${v.amount} ${v.currency}\nStatus: Aktiv\n\nVielen Dank für Ihr Vertrauen.`,
      cta: 'Zu meinem Konto →',
    },
  },

  // ── Englisch ───────────────────────────────────────────────
  en: {
    invoiceCreated: {
      subject: (v) => `Invoice ${v.invoiceNumber} created – PraxisOnline24`,
      body: (v) => `A new invoice has been created for your practice.\n\nInvoice number: ${v.invoiceNumber}\nInvoice date: ${v.invoiceDate}\nDue date: ${v.dueDate}\nTotal: ${v.totalAmount} ${v.currency}\nStatus: Open`,
      cta: 'View invoice →',
    },
    invoiceSent: {
      subject: (v) => `Invoice ${v.invoiceNumber} sent – PraxisOnline24`,
      body: (v) => `Your invoice has been sent.\n\nInvoice number: ${v.invoiceNumber}\nRecipient: ${v.recipient}\nInvoice date: ${v.invoiceDate}\nDue date: ${v.dueDate}\nTotal: ${v.totalAmount} ${v.currency}\nStatus: Sent`,
      cta: 'View invoice →',
    },
    paymentReceived: {
      subject: (v) => `Payment confirmation – invoice ${v.invoiceNumber}`,
      body: (v) => `We have received your payment – thank you!\n\nInvoice number: ${v.invoiceNumber}\nPayment date: ${v.paidDate}\nAmount: ${v.amount} ${v.currency}\nPayment method: ${v.method}\nStatus: Paid`,
      cta: 'Download receipt →',
    },
    paymentFailed: {
      subject: (v) => `Payment failed – invoice ${v.invoiceNumber}`,
      body: (v) => `Unfortunately we could not process your payment.\n\nInvoice number: ${v.invoiceNumber}\nAmount: ${v.amount} ${v.currency}\nReason: ${v.reason}\nStatus: Payment failed\n\nPlease update your payment method or try again.`,
      cta: 'Retry payment →',
    },
    paymentReminder: {
      subject: (v) => `Payment reminder – invoice ${v.invoiceNumber}`,
      body: (v) => `Reminder: an invoice is still open.\n\nInvoice number: ${v.invoiceNumber}\nInvoice date: ${v.invoiceDate}\nDue date: ${v.dueDate}\nTotal: ${v.totalAmount} ${v.currency}\nDays overdue: ${v.daysOverdue}\nStatus: Overdue\n\nPlease settle the outstanding amount as soon as possible.`,
      cta: 'Pay now →',
    },
    subscriptionCancelled: {
      subject: 'Subscription cancelled – PraxisOnline24',
      body: (v) => `Your subscription has been cancelled.\n\nPlan: ${v.plan}\nEffective from: ${v.effectiveDate}\nStatus: Cancelled\n\nYou can continue using PraxisOnline24 until the end of the current billing period. We hope to welcome you back soon.`,
      cta: 'Manage subscription →',
    },
    trialConvertedToPaid: {
      subject: (v) => `Trial converted to ${v.plan} – PraxisOnline24`,
      body: (v) => `Your trial has been successfully converted to a paid subscription.\n\nPlan: ${v.plan}\nFirst billing period until: ${v.periodEnd}\nAmount: ${v.amount} ${v.currency}\nStatus: Active\n\nThank you for your trust.`,
      cta: 'Go to my account →',
    },
  },

  // ── Französisch ────────────────────────────────────────────
  fr: {
    invoiceCreated: {
      subject: (v) => `Facture ${v.invoiceNumber} créée – PraxisOnline24`,
      body: (v) => `Une nouvelle facture a été créée pour votre cabinet.\n\nNuméro de facture : ${v.invoiceNumber}\nDate de facturation : ${v.invoiceDate}\nDate d'échéance : ${v.dueDate}\nMontant total : ${v.totalAmount} ${v.currency}\nStatut : Ouverte`,
      cta: 'Voir la facture →',
    },
    invoiceSent: {
      subject: (v) => `Facture ${v.invoiceNumber} envoyée – PraxisOnline24`,
      body: (v) => `Votre facture a été envoyée.\n\nNuméro de facture : ${v.invoiceNumber}\nDestinataire : ${v.recipient}\nDate de facturation : ${v.invoiceDate}\nDate d'échéance : ${v.dueDate}\nMontant total : ${v.totalAmount} ${v.currency}\nStatut : Envoyée`,
      cta: 'Voir la facture →',
    },
    paymentReceived: {
      subject: (v) => `Confirmation de paiement – facture ${v.invoiceNumber}`,
      body: (v) => `Nous avons bien reçu votre paiement – merci !\n\nNuméro de facture : ${v.invoiceNumber}\nDate de paiement : ${v.paidDate}\nMontant : ${v.amount} ${v.currency}\nMoyen de paiement : ${v.method}\nStatut : Payée`,
      cta: 'Télécharger le reçu →',
    },
    paymentFailed: {
      subject: (v) => `Échec du paiement – facture ${v.invoiceNumber}`,
      body: (v) => `Nous n'avons malheureusement pas pu traiter votre paiement.\n\nNuméro de facture : ${v.invoiceNumber}\nMontant : ${v.amount} ${v.currency}\nRaison : ${v.reason}\nStatut : Échec du paiement\n\nVeuillez mettre à jour votre moyen de paiement ou réessayer.`,
      cta: 'Réessayer le paiement →',
    },
    paymentReminder: {
      subject: (v) => `Rappel de paiement – facture ${v.invoiceNumber}`,
      body: (v) => `Rappel : une facture est encore impayée.\n\nNuméro de facture : ${v.invoiceNumber}\nDate de facturation : ${v.invoiceDate}\nDate d'échéance : ${v.dueDate}\nMontant total : ${v.totalAmount} ${v.currency}\nJours de retard : ${v.daysOverdue}\nStatut : En retard\n\nMerci de régler le montant dû dès que possible.`,
      cta: 'Payer maintenant →',
    },
    subscriptionCancelled: {
      subject: 'Abonnement résilié – PraxisOnline24',
      body: (v) => `Votre abonnement a été résilié.\n\nFormule : ${v.plan}\nEffectif au : ${v.effectiveDate}\nStatut : Résilié\n\nVous pouvez continuer à utiliser PraxisOnline24 jusqu'à la fin de la période de facturation en cours. Nous espérons vous revoir bientôt.`,
      cta: "Gérer l'abonnement →",
    },
    trialConvertedToPaid: {
      subject: (v) => `Essai converti en ${v.plan} – PraxisOnline24`,
      body: (v) => `Votre essai a été converti en abonnement payant avec succès.\n\nFormule : ${v.plan}\nPremière période de facturation jusqu'au : ${v.periodEnd}\nMontant : ${v.amount} ${v.currency}\nStatut : Actif\n\nMerci de votre confiance.`,
      cta: 'Accéder à mon compte →',
    },
  },

  // ── Spanisch ───────────────────────────────────────────────
  es: {
    invoiceCreated: {
      subject: (v) => `Factura ${v.invoiceNumber} creada – PraxisOnline24`,
      body: (v) => `Se ha creado una nueva factura para su consultorio.\n\nNúmero de factura: ${v.invoiceNumber}\nFecha de factura: ${v.invoiceDate}\nFecha de vencimiento: ${v.dueDate}\nImporte total: ${v.totalAmount} ${v.currency}\nEstado: Abierta`,
      cta: 'Ver factura →',
    },
    invoiceSent: {
      subject: (v) => `Factura ${v.invoiceNumber} enviada – PraxisOnline24`,
      body: (v) => `Su factura ha sido enviada.\n\nNúmero de factura: ${v.invoiceNumber}\nDestinatario: ${v.recipient}\nFecha de factura: ${v.invoiceDate}\nFecha de vencimiento: ${v.dueDate}\nImporte total: ${v.totalAmount} ${v.currency}\nEstado: Enviada`,
      cta: 'Ver factura →',
    },
    paymentReceived: {
      subject: (v) => `Confirmación de pago – factura ${v.invoiceNumber}`,
      body: (v) => `Hemos recibido su pago. ¡Gracias!\n\nNúmero de factura: ${v.invoiceNumber}\nFecha de pago: ${v.paidDate}\nImporte: ${v.amount} ${v.currency}\nMétodo de pago: ${v.method}\nEstado: Pagada`,
      cta: 'Descargar recibo →',
    },
    paymentFailed: {
      subject: (v) => `Pago fallido – factura ${v.invoiceNumber}`,
      body: (v) => `Lamentablemente no pudimos procesar su pago.\n\nNúmero de factura: ${v.invoiceNumber}\nImporte: ${v.amount} ${v.currency}\nMotivo: ${v.reason}\nEstado: Pago fallido\n\nPor favor, actualice su método de pago o inténtelo de nuevo.`,
      cta: 'Reintentar pago →',
    },
    paymentReminder: {
      subject: (v) => `Recordatorio de pago – factura ${v.invoiceNumber}`,
      body: (v) => `Recordatorio: una factura sigue pendiente.\n\nNúmero de factura: ${v.invoiceNumber}\nFecha de factura: ${v.invoiceDate}\nFecha de vencimiento: ${v.dueDate}\nImporte total: ${v.totalAmount} ${v.currency}\nDías de atraso: ${v.daysOverdue}\nEstado: Vencida\n\nPor favor, salde el importe pendiente lo antes posible.`,
      cta: 'Pagar ahora →',
    },
    subscriptionCancelled: {
      subject: 'Suscripción cancelada – PraxisOnline24',
      body: (v) => `Su suscripción ha sido cancelada.\n\nPlan: ${v.plan}\nVigente desde: ${v.effectiveDate}\nEstado: Cancelada\n\nPuede seguir usando PraxisOnline24 hasta el final del período de facturación actual. Esperamos volver a verle pronto.`,
      cta: 'Gestionar suscripción →',
    },
    trialConvertedToPaid: {
      subject: (v) => `Prueba convertida a ${v.plan} – PraxisOnline24`,
      body: (v) => `Su período de prueba ha sido convertido a una suscripción de pago con éxito.\n\nPlan: ${v.plan}\nPrimer período de facturación hasta: ${v.periodEnd}\nImporte: ${v.amount} ${v.currency}\nEstado: Activa\n\nGracias por su confianza.`,
      cta: 'Ir a mi cuenta →',
    },
  },

  // ── Italienisch ────────────────────────────────────────────
  it: {
    invoiceCreated: {
      subject: (v) => `Fattura ${v.invoiceNumber} creata – PraxisOnline24`,
      body: (v) => `È stata creata una nuova fattura per il tuo studio.\n\nNumero fattura: ${v.invoiceNumber}\nData fattura: ${v.invoiceDate}\nData di scadenza: ${v.dueDate}\nTotale: ${v.totalAmount} ${v.currency}\nStato: Aperta`,
      cta: 'Visualizza fattura →',
    },
    invoiceSent: {
      subject: (v) => `Fattura ${v.invoiceNumber} inviata – PraxisOnline24`,
      body: (v) => `La tua fattura è stata inviata.\n\nNumero fattura: ${v.invoiceNumber}\nDestinatario: ${v.recipient}\nData fattura: ${v.invoiceDate}\nData di scadenza: ${v.dueDate}\nTotale: ${v.totalAmount} ${v.currency}\nStato: Inviata`,
      cta: 'Visualizza fattura →',
    },
    paymentReceived: {
      subject: (v) => `Conferma di pagamento – fattura ${v.invoiceNumber}`,
      body: (v) => `Abbiamo ricevuto il tuo pagamento – grazie!\n\nNumero fattura: ${v.invoiceNumber}\nData pagamento: ${v.paidDate}\nImporto: ${v.amount} ${v.currency}\nMetodo di pagamento: ${v.method}\nStato: Pagata`,
      cta: 'Scarica ricevuta →',
    },
    paymentFailed: {
      subject: (v) => `Pagamento fallito – fattura ${v.invoiceNumber}`,
      body: (v) => `Purtroppo non siamo riusciti a elaborare il tuo pagamento.\n\nNumero fattura: ${v.invoiceNumber}\nImporto: ${v.amount} ${v.currency}\nMotivo: ${v.reason}\nStato: Pagamento fallito\n\nAggiorna il metodo di pagamento o riprova.`,
      cta: 'Riprova il pagamento →',
    },
    paymentReminder: {
      subject: (v) => `Promemoria di pagamento – fattura ${v.invoiceNumber}`,
      body: (v) => `Promemoria: una fattura è ancora aperta.\n\nNumero fattura: ${v.invoiceNumber}\nData fattura: ${v.invoiceDate}\nData di scadenza: ${v.dueDate}\nTotale: ${v.totalAmount} ${v.currency}\nGiorni di ritardo: ${v.daysOverdue}\nStato: Scaduta\n\nSalda l'importo dovuto al più presto.`,
      cta: 'Paga ora →',
    },
    subscriptionCancelled: {
      subject: 'Abbonamento annullato – PraxisOnline24',
      body: (v) => `Il tuo abbonamento è stato annullato.\n\nPiano: ${v.plan}\nIn vigore dal: ${v.effectiveDate}\nStato: Annullato\n\nPuoi continuare a usare PraxisOnline24 fino alla fine del ciclo di fatturazione corrente. Speriamo di rivederti presto.`,
      cta: 'Gestisci abbonamento →',
    },
    trialConvertedToPaid: {
      subject: (v) => `Prova convertita in ${v.plan} – PraxisOnline24`,
      body: (v) => `La tua prova è stata convertita con successo in un abbonamento a pagamento.\n\nPiano: ${v.plan}\nPrimo periodo di fatturazione fino al: ${v.periodEnd}\nImporto: ${v.amount} ${v.currency}\nStato: Attivo\n\nGrazie per la fiducia.`,
      cta: 'Vai al mio account →',
    },
  },

  // ── Portugiesisch ──────────────────────────────────────────
  pt: {
    invoiceCreated: {
      subject: (v) => `Fatura ${v.invoiceNumber} criada – PraxisOnline24`,
      body: (v) => `Uma nova fatura foi criada para sua clínica.\n\nNúmero da fatura: ${v.invoiceNumber}\nData da fatura: ${v.invoiceDate}\nData de vencimento: ${v.dueDate}\nValor total: ${v.totalAmount} ${v.currency}\nStatus: Em aberto`,
      cta: 'Ver fatura →',
    },
    invoiceSent: {
      subject: (v) => `Fatura ${v.invoiceNumber} enviada – PraxisOnline24`,
      body: (v) => `Sua fatura foi enviada.\n\nNúmero da fatura: ${v.invoiceNumber}\nDestinatário: ${v.recipient}\nData da fatura: ${v.invoiceDate}\nData de vencimento: ${v.dueDate}\nValor total: ${v.totalAmount} ${v.currency}\nStatus: Enviada`,
      cta: 'Ver fatura →',
    },
    paymentReceived: {
      subject: (v) => `Confirmação de pagamento – fatura ${v.invoiceNumber}`,
      body: (v) => `Recebemos seu pagamento – obrigado!\n\nNúmero da fatura: ${v.invoiceNumber}\nData do pagamento: ${v.paidDate}\nValor: ${v.amount} ${v.currency}\nForma de pagamento: ${v.method}\nStatus: Paga`,
      cta: 'Baixar recibo →',
    },
    paymentFailed: {
      subject: (v) => `Pagamento falhou – fatura ${v.invoiceNumber}`,
      body: (v) => `Infelizmente não conseguimos processar seu pagamento.\n\nNúmero da fatura: ${v.invoiceNumber}\nValor: ${v.amount} ${v.currency}\nMotivo: ${v.reason}\nStatus: Pagamento falhou\n\nAtualize sua forma de pagamento ou tente novamente.`,
      cta: 'Tentar pagamento novamente →',
    },
    paymentReminder: {
      subject: (v) => `Lembrete de pagamento – fatura ${v.invoiceNumber}`,
      body: (v) => `Lembrete: uma fatura ainda está em aberto.\n\nNúmero da fatura: ${v.invoiceNumber}\nData da fatura: ${v.invoiceDate}\nData de vencimento: ${v.dueDate}\nValor total: ${v.totalAmount} ${v.currency}\nDias de atraso: ${v.daysOverdue}\nStatus: Vencida\n\nPor favor, quite o valor pendente o quanto antes.`,
      cta: 'Pagar agora →',
    },
    subscriptionCancelled: {
      subject: 'Assinatura cancelada – PraxisOnline24',
      body: (v) => `Sua assinatura foi cancelada.\n\nPlano: ${v.plan}\nVigente a partir de: ${v.effectiveDate}\nStatus: Cancelada\n\nVocê pode continuar usando o PraxisOnline24 até o fim do período de cobrança atual. Esperamos vê-lo novamente em breve.`,
      cta: 'Gerenciar assinatura →',
    },
    trialConvertedToPaid: {
      subject: (v) => `Teste convertido em ${v.plan} – PraxisOnline24`,
      body: (v) => `Seu período de teste foi convertido em uma assinatura paga com sucesso.\n\nPlano: ${v.plan}\nPrimeiro período de cobrança até: ${v.periodEnd}\nValor: ${v.amount} ${v.currency}\nStatus: Ativa\n\nObrigado pela sua confiança.`,
      cta: 'Ir para minha conta →',
    },
  },

  // ── Niederländisch ─────────────────────────────────────────
  nl: {
    invoiceCreated: {
      subject: (v) => `Factuur ${v.invoiceNumber} aangemaakt – PraxisOnline24`,
      body: (v) => `Er is een nieuwe factuur voor uw praktijk aangemaakt.\n\nFactuurnummer: ${v.invoiceNumber}\nFactuurdatum: ${v.invoiceDate}\nVervaldatum: ${v.dueDate}\nTotaalbedrag: ${v.totalAmount} ${v.currency}\nStatus: Open`,
      cta: 'Factuur bekijken →',
    },
    invoiceSent: {
      subject: (v) => `Factuur ${v.invoiceNumber} verzonden – PraxisOnline24`,
      body: (v) => `Uw factuur is verzonden.\n\nFactuurnummer: ${v.invoiceNumber}\nOntvanger: ${v.recipient}\nFactuurdatum: ${v.invoiceDate}\nVervaldatum: ${v.dueDate}\nTotaalbedrag: ${v.totalAmount} ${v.currency}\nStatus: Verzonden`,
      cta: 'Factuur bekijken →',
    },
    paymentReceived: {
      subject: (v) => `Betalingsbevestiging – factuur ${v.invoiceNumber}`,
      body: (v) => `We hebben uw betaling ontvangen – bedankt!\n\nFactuurnummer: ${v.invoiceNumber}\nBetaaldatum: ${v.paidDate}\nBedrag: ${v.amount} ${v.currency}\nBetaalwijze: ${v.method}\nStatus: Betaald`,
      cta: 'Bewijs downloaden →',
    },
    paymentFailed: {
      subject: (v) => `Betaling mislukt – factuur ${v.invoiceNumber}`,
      body: (v) => `Helaas konden we uw betaling niet verwerken.\n\nFactuurnummer: ${v.invoiceNumber}\nBedrag: ${v.amount} ${v.currency}\nReden: ${v.reason}\nStatus: Betaling mislukt\n\nWerk uw betaalmethode bij of probeer het opnieuw.`,
      cta: 'Betaling opnieuw proberen →',
    },
    paymentReminder: {
      subject: (v) => `Betalingsherinnering – factuur ${v.invoiceNumber}`,
      body: (v) => `Herinnering: een factuur staat nog open.\n\nFactuurnummer: ${v.invoiceNumber}\nFactuurdatum: ${v.invoiceDate}\nVervaldatum: ${v.dueDate}\nTotaalbedrag: ${v.totalAmount} ${v.currency}\nDagen te laat: ${v.daysOverdue}\nStatus: Te laat\n\nGelieve het openstaande bedrag spoedig te voldoen.`,
      cta: 'Nu betalen →',
    },
    subscriptionCancelled: {
      subject: 'Abonnement opgezegd – PraxisOnline24',
      body: (v) => `Uw abonnement is opgezegd.\n\nPakket: ${v.plan}\nIngangsdatum: ${v.effectiveDate}\nStatus: Opgezegd\n\nU kunt PraxisOnline24 blijven gebruiken tot het einde van de huidige factureringsperiode. We hopen u snel weer te zien.`,
      cta: 'Abonnement beheren →',
    },
    trialConvertedToPaid: {
      subject: (v) => `Proefperiode omgezet naar ${v.plan} – PraxisOnline24`,
      body: (v) => `Uw proefperiode is succesvol omgezet naar een betaald abonnement.\n\nPakket: ${v.plan}\nEerste factureringsperiode tot: ${v.periodEnd}\nBedrag: ${v.amount} ${v.currency}\nStatus: Actief\n\nBedankt voor uw vertrouwen.`,
      cta: 'Naar mijn account →',
    },
  },

  // ── Türkisch ───────────────────────────────────────────────
  tr: {
    invoiceCreated: {
      subject: (v) => `Fatura ${v.invoiceNumber} oluşturuldu – PraxisOnline24`,
      body: (v) => `Kliniğiniz için yeni bir fatura oluşturuldu.\n\nFatura numarası: ${v.invoiceNumber}\nFatura tarihi: ${v.invoiceDate}\nSon ödeme tarihi: ${v.dueDate}\nToplam tutar: ${v.totalAmount} ${v.currency}\nDurum: Açık`,
      cta: 'Faturayı görüntüle →',
    },
    invoiceSent: {
      subject: (v) => `Fatura ${v.invoiceNumber} gönderildi – PraxisOnline24`,
      body: (v) => `Faturanız gönderildi.\n\nFatura numarası: ${v.invoiceNumber}\nAlıcı: ${v.recipient}\nFatura tarihi: ${v.invoiceDate}\nSon ödeme tarihi: ${v.dueDate}\nToplam tutar: ${v.totalAmount} ${v.currency}\nDurum: Gönderildi`,
      cta: 'Faturayı görüntüle →',
    },
    paymentReceived: {
      subject: (v) => `Ödeme onayı – fatura ${v.invoiceNumber}`,
      body: (v) => `Ödemenizi aldık – teşekkür ederiz!\n\nFatura numarası: ${v.invoiceNumber}\nÖdeme tarihi: ${v.paidDate}\nTutar: ${v.amount} ${v.currency}\nÖdeme yöntemi: ${v.method}\nDurum: Ödendi`,
      cta: 'Makbuzu indir →',
    },
    paymentFailed: {
      subject: (v) => `Ödeme başarısız – fatura ${v.invoiceNumber}`,
      body: (v) => `Maalesef ödemenizi işleyemedik.\n\nFatura numarası: ${v.invoiceNumber}\nTutar: ${v.amount} ${v.currency}\nNeden: ${v.reason}\nDurum: Ödeme başarısız\n\nLütfen ödeme yönteminizi güncelleyin veya tekrar deneyin.`,
      cta: 'Ödemeyi yeniden dene →',
    },
    paymentReminder: {
      subject: (v) => `Ödeme hatırlatması – fatura ${v.invoiceNumber}`,
      body: (v) => `Hatırlatma: bir fatura hâlâ açık.\n\nFatura numarası: ${v.invoiceNumber}\nFatura tarihi: ${v.invoiceDate}\nSon ödeme tarihi: ${v.dueDate}\nToplam tutar: ${v.totalAmount} ${v.currency}\nGecikme günü: ${v.daysOverdue}\nDurum: Gecikmiş\n\nLütfen ödenmemiş tutarı en kısa sürede ödeyin.`,
      cta: 'Şimdi öde →',
    },
    subscriptionCancelled: {
      subject: 'Abonelik iptal edildi – PraxisOnline24',
      body: (v) => `Aboneliğiniz iptal edildi.\n\nPaket: ${v.plan}\nGeçerlilik tarihi: ${v.effectiveDate}\nDurum: İptal edildi\n\nMevcut faturalandırma döneminin sonuna kadar PraxisOnline24'ü kullanmaya devam edebilirsiniz. Sizi tekrar görmeyi umuyoruz.`,
      cta: 'Aboneliği yönet →',
    },
    trialConvertedToPaid: {
      subject: (v) => `Deneme ${v.plan} aboneliğine dönüştürüldü – PraxisOnline24`,
      body: (v) => `Deneme süreniz ücretli aboneliğe başarıyla dönüştürüldü.\n\nPaket: ${v.plan}\nİlk faturalandırma dönemi şu tarihe kadar: ${v.periodEnd}\nTutar: ${v.amount} ${v.currency}\nDurum: Aktif\n\nGüveniniz için teşekkür ederiz.`,
      cta: 'Hesabıma git →',
    },
  },

  // ── Arabisch ───────────────────────────────────────────────
  ar: {
    invoiceCreated: {
      subject: (v) => `الفاتورة ${v.invoiceNumber} تم إنشاؤها – PraxisOnline24`,
      body: (v) => `تم إنشاء فاتورة جديدة لعيادتك.\n\nرقم الفاتورة: ${v.invoiceNumber}\nتاريخ الفاتورة: ${v.invoiceDate}\nتاريخ الاستحقاق: ${v.dueDate}\nالمبلغ الإجمالي: ${v.totalAmount} ${v.currency}\nالحالة: مفتوحة`,
      cta: 'عرض الفاتورة ←',
    },
    invoiceSent: {
      subject: (v) => `الفاتورة ${v.invoiceNumber} تم إرسالها – PraxisOnline24`,
      body: (v) => `تم إرسال فاتورتك.\n\nرقم الفاتورة: ${v.invoiceNumber}\nالمستلم: ${v.recipient}\nتاريخ الفاتورة: ${v.invoiceDate}\nتاريخ الاستحقاق: ${v.dueDate}\nالمبلغ الإجمالي: ${v.totalAmount} ${v.currency}\nالحالة: مُرسلة`,
      cta: 'عرض الفاتورة ←',
    },
    paymentReceived: {
      subject: (v) => `تأكيد الدفع – الفاتورة ${v.invoiceNumber}`,
      body: (v) => `لقد استلمنا دفعتك – شكراً لك!\n\nرقم الفاتورة: ${v.invoiceNumber}\nتاريخ الدفع: ${v.paidDate}\nالمبلغ: ${v.amount} ${v.currency}\nطريقة الدفع: ${v.method}\nالحالة: مدفوعة`,
      cta: 'تنزيل الإيصال ←',
    },
    paymentFailed: {
      subject: (v) => `فشل الدفع – الفاتورة ${v.invoiceNumber}`,
      body: (v) => `للأسف لم نتمكن من معالجة دفعتك.\n\nرقم الفاتورة: ${v.invoiceNumber}\nالمبلغ: ${v.amount} ${v.currency}\nالسبب: ${v.reason}\nالحالة: فشل الدفع\n\nيرجى تحديث طريقة الدفع أو المحاولة مرة أخرى.`,
      cta: 'إعادة محاولة الدفع ←',
    },
    paymentReminder: {
      subject: (v) => `تذكير بالدفع – الفاتورة ${v.invoiceNumber}`,
      body: (v) => `تذكير: لا تزال هناك فاتورة مفتوحة.\n\nرقم الفاتورة: ${v.invoiceNumber}\nتاريخ الفاتورة: ${v.invoiceDate}\nتاريخ الاستحقاق: ${v.dueDate}\nالمبلغ الإجمالي: ${v.totalAmount} ${v.currency}\nأيام التأخر: ${v.daysOverdue}\nالحالة: متأخرة\n\nيرجى تسوية المبلغ المستحق في أقرب وقت ممكن.`,
      cta: 'الدفع الآن ←',
    },
    subscriptionCancelled: {
      subject: 'تم إلغاء الاشتراك – PraxisOnline24',
      body: (v) => `تم إلغاء اشتراكك.\n\nالباقة: ${v.plan}\nسارٍ من: ${v.effectiveDate}\nالحالة: ملغى\n\nيمكنك متابعة استخدام PraxisOnline24 حتى نهاية فترة الفوترة الحالية. نتمنى أن نراك مرة أخرى قريباً.`,
      cta: 'إدارة الاشتراك ←',
    },
    trialConvertedToPaid: {
      subject: (v) => `تم تحويل التجربة إلى ${v.plan} – PraxisOnline24`,
      body: (v) => `تم تحويل فترة تجربتك بنجاح إلى اشتراك مدفوع.\n\nالباقة: ${v.plan}\nأول فترة فوترة حتى: ${v.periodEnd}\nالمبلغ: ${v.amount} ${v.currency}\nالحالة: نشط\n\nشكراً لثقتك بنا.`,
      cta: 'الذهاب إلى حسابي ←',
    },
  },

  // ── Russisch ───────────────────────────────────────────────
  ru: {
    invoiceCreated: {
      subject: (v) => `Счёт ${v.invoiceNumber} создан – PraxisOnline24`,
      body: (v) => `Для вашей клиники создан новый счёт.\n\nНомер счёта: ${v.invoiceNumber}\nДата счёта: ${v.invoiceDate}\nДата оплаты до: ${v.dueDate}\nИтоговая сумма: ${v.totalAmount} ${v.currency}\nСтатус: Открыт`,
      cta: 'Просмотреть счёт →',
    },
    invoiceSent: {
      subject: (v) => `Счёт ${v.invoiceNumber} отправлен – PraxisOnline24`,
      body: (v) => `Ваш счёт отправлен.\n\nНомер счёта: ${v.invoiceNumber}\nПолучатель: ${v.recipient}\nДата счёта: ${v.invoiceDate}\nДата оплаты до: ${v.dueDate}\nИтоговая сумма: ${v.totalAmount} ${v.currency}\nСтатус: Отправлен`,
      cta: 'Просмотреть счёт →',
    },
    paymentReceived: {
      subject: (v) => `Подтверждение оплаты – счёт ${v.invoiceNumber}`,
      body: (v) => `Мы получили вашу оплату – спасибо!\n\nНомер счёта: ${v.invoiceNumber}\nДата оплаты: ${v.paidDate}\nСумма: ${v.amount} ${v.currency}\nСпособ оплаты: ${v.method}\nСтатус: Оплачен`,
      cta: 'Скачать чек →',
    },
    paymentFailed: {
      subject: (v) => `Оплата не прошла – счёт ${v.invoiceNumber}`,
      body: (v) => `К сожалению, мы не смогли обработать вашу оплату.\n\nНомер счёта: ${v.invoiceNumber}\nСумма: ${v.amount} ${v.currency}\nПричина: ${v.reason}\nСтатус: Оплата не прошла\n\nПожалуйста, обновите способ оплаты или попробуйте снова.`,
      cta: 'Повторить оплату →',
    },
    paymentReminder: {
      subject: (v) => `Напоминание об оплате – счёт ${v.invoiceNumber}`,
      body: (v) => `Напоминание: счёт всё ещё не оплачен.\n\nНомер счёта: ${v.invoiceNumber}\nДата счёта: ${v.invoiceDate}\nДата оплаты до: ${v.dueDate}\nИтоговая сумма: ${v.totalAmount} ${v.currency}\nДней просрочки: ${v.daysOverdue}\nСтатус: Просрочен\n\nПожалуйста, погасите задолженность в ближайшее время.`,
      cta: 'Оплатить сейчас →',
    },
    subscriptionCancelled: {
      subject: 'Подписка отменена – PraxisOnline24',
      body: (v) => `Ваша подписка отменена.\n\nТариф: ${v.plan}\nДействует с: ${v.effectiveDate}\nСтатус: Отменена\n\nВы можете продолжать пользоваться PraxisOnline24 до конца текущего платёжного периода. Надеемся снова увидеть вас.`,
      cta: 'Управление подпиской →',
    },
    trialConvertedToPaid: {
      subject: (v) => `Пробный период преобразован в ${v.plan} – PraxisOnline24`,
      body: (v) => `Ваш пробный период успешно преобразован в платную подписку.\n\nТариф: ${v.plan}\nПервый платёжный период до: ${v.periodEnd}\nСумма: ${v.amount} ${v.currency}\nСтатус: Активна\n\nСпасибо за ваше доверие.`,
      cta: 'Перейти в мой аккаунт →',
    },
  },

  // ── Indonesisch ────────────────────────────────────────────
  id: {
    invoiceCreated: {
      subject: (v) => `Faktur ${v.invoiceNumber} dibuat – PraxisOnline24`,
      body: (v) => `Faktur baru telah dibuat untuk klinik Anda.\n\nNomor faktur: ${v.invoiceNumber}\nTanggal faktur: ${v.invoiceDate}\nJatuh tempo: ${v.dueDate}\nTotal: ${v.totalAmount} ${v.currency}\nStatus: Terbuka`,
      cta: 'Lihat faktur →',
    },
    invoiceSent: {
      subject: (v) => `Faktur ${v.invoiceNumber} dikirim – PraxisOnline24`,
      body: (v) => `Faktur Anda telah dikirim.\n\nNomor faktur: ${v.invoiceNumber}\nPenerima: ${v.recipient}\nTanggal faktur: ${v.invoiceDate}\nJatuh tempo: ${v.dueDate}\nTotal: ${v.totalAmount} ${v.currency}\nStatus: Terkirim`,
      cta: 'Lihat faktur →',
    },
    paymentReceived: {
      subject: (v) => `Konfirmasi pembayaran – faktur ${v.invoiceNumber}`,
      body: (v) => `Kami telah menerima pembayaran Anda – terima kasih!\n\nNomor faktur: ${v.invoiceNumber}\nTanggal pembayaran: ${v.paidDate}\nJumlah: ${v.amount} ${v.currency}\nMetode pembayaran: ${v.method}\nStatus: Lunas`,
      cta: 'Unduh kuitansi →',
    },
    paymentFailed: {
      subject: (v) => `Pembayaran gagal – faktur ${v.invoiceNumber}`,
      body: (v) => `Maaf, kami tidak dapat memproses pembayaran Anda.\n\nNomor faktur: ${v.invoiceNumber}\nJumlah: ${v.amount} ${v.currency}\nAlasan: ${v.reason}\nStatus: Pembayaran gagal\n\nMohon perbarui metode pembayaran atau coba lagi.`,
      cta: 'Coba pembayaran lagi →',
    },
    paymentReminder: {
      subject: (v) => `Pengingat pembayaran – faktur ${v.invoiceNumber}`,
      body: (v) => `Pengingat: faktur masih terbuka.\n\nNomor faktur: ${v.invoiceNumber}\nTanggal faktur: ${v.invoiceDate}\nJatuh tempo: ${v.dueDate}\nTotal: ${v.totalAmount} ${v.currency}\nHari terlambat: ${v.daysOverdue}\nStatus: Jatuh tempo\n\nMohon lunasi jumlah yang tertunda secepatnya.`,
      cta: 'Bayar sekarang →',
    },
    subscriptionCancelled: {
      subject: 'Langganan dibatalkan – PraxisOnline24',
      body: (v) => `Langganan Anda telah dibatalkan.\n\nPaket: ${v.plan}\nBerlaku mulai: ${v.effectiveDate}\nStatus: Dibatalkan\n\nAnda dapat terus menggunakan PraxisOnline24 sampai akhir periode penagihan saat ini. Kami berharap bertemu Anda lagi segera.`,
      cta: 'Kelola langganan →',
    },
    trialConvertedToPaid: {
      subject: (v) => `Masa percobaan dikonversi ke ${v.plan} – PraxisOnline24`,
      body: (v) => `Masa percobaan Anda berhasil dikonversi ke langganan berbayar.\n\nPaket: ${v.plan}\nPeriode penagihan pertama sampai: ${v.periodEnd}\nJumlah: ${v.amount} ${v.currency}\nStatus: Aktif\n\nTerima kasih atas kepercayaan Anda.`,
      cta: 'Ke akun saya →',
    },
  },

  // ── Hindi ──────────────────────────────────────────────────
  hi: {
    invoiceCreated: {
      subject: (v) => `इनवॉइस ${v.invoiceNumber} बनाया गया – PraxisOnline24`,
      body: (v) => `आपके क्लिनिक के लिए एक नया इनवॉइस बनाया गया है।\n\nइनवॉइस नंबर: ${v.invoiceNumber}\nइनवॉइस तिथि: ${v.invoiceDate}\nनियत तिथि: ${v.dueDate}\nकुल राशि: ${v.totalAmount} ${v.currency}\nस्थिति: खुला`,
      cta: 'इनवॉइस देखें →',
    },
    invoiceSent: {
      subject: (v) => `इनवॉइस ${v.invoiceNumber} भेजा गया – PraxisOnline24`,
      body: (v) => `आपका इनवॉइस भेज दिया गया है।\n\nइनवॉइस नंबर: ${v.invoiceNumber}\nप्राप्तकर्ता: ${v.recipient}\nइनवॉइस तिथि: ${v.invoiceDate}\nनियत तिथि: ${v.dueDate}\nकुल राशि: ${v.totalAmount} ${v.currency}\nस्थिति: भेजा गया`,
      cta: 'इनवॉइस देखें →',
    },
    paymentReceived: {
      subject: (v) => `भुगतान की पुष्टि – इनवॉइस ${v.invoiceNumber}`,
      body: (v) => `हमें आपका भुगतान मिल गया है – धन्यवाद!\n\nइनवॉइस नंबर: ${v.invoiceNumber}\nभुगतान तिथि: ${v.paidDate}\nराशि: ${v.amount} ${v.currency}\nभुगतान विधि: ${v.method}\nस्थिति: भुगतान हो गया`,
      cta: 'रसीद डाउनलोड करें →',
    },
    paymentFailed: {
      subject: (v) => `भुगतान विफल – इनवॉइस ${v.invoiceNumber}`,
      body: (v) => `दुर्भाग्यवश हम आपके भुगतान को संसाधित नहीं कर सके।\n\nइनवॉइस नंबर: ${v.invoiceNumber}\nराशि: ${v.amount} ${v.currency}\nकारण: ${v.reason}\nस्थिति: भुगतान विफल\n\nकृपया अपनी भुगतान विधि अपडेट करें या पुनः प्रयास करें।`,
      cta: 'भुगतान पुनः प्रयास करें →',
    },
    paymentReminder: {
      subject: (v) => `भुगतान अनुस्मारक – इनवॉइस ${v.invoiceNumber}`,
      body: (v) => `अनुस्मारक: एक इनवॉइस अभी भी खुला है।\n\nइनवॉइस नंबर: ${v.invoiceNumber}\nइनवॉइस तिथि: ${v.invoiceDate}\nनियत तिथि: ${v.dueDate}\nकुल राशि: ${v.totalAmount} ${v.currency}\nविलंब के दिन: ${v.daysOverdue}\nस्थिति: देय\n\nकृपया बकाया राशि शीघ्र चुकाएं।`,
      cta: 'अभी भुगतान करें →',
    },
    subscriptionCancelled: {
      subject: 'सदस्यता रद्द – PraxisOnline24',
      body: (v) => `आपकी सदस्यता रद्द कर दी गई है।\n\nप्लान: ${v.plan}\nप्रभावी तिथि: ${v.effectiveDate}\nस्थिति: रद्द\n\nआप वर्तमान बिलिंग अवधि के अंत तक PraxisOnline24 का उपयोग जारी रख सकते हैं। हम आपको जल्द ही फिर से देखने की उम्मीद करते हैं।`,
      cta: 'सदस्यता प्रबंधित करें →',
    },
    trialConvertedToPaid: {
      subject: (v) => `परीक्षण ${v.plan} में परिवर्तित – PraxisOnline24`,
      body: (v) => `आपकी परीक्षण अवधि सफलतापूर्वक भुगतान सदस्यता में परिवर्तित कर दी गई है।\n\nप्लान: ${v.plan}\nपहली बिलिंग अवधि तक: ${v.periodEnd}\nराशि: ${v.amount} ${v.currency}\nस्थिति: सक्रिय\n\nआपके विश्वास के लिए धन्यवाद।`,
      cta: 'मेरे खाते पर जाएँ →',
    },
  },

  // ── Chinesisch (vereinfacht) ───────────────────────────────
  zh: {
    invoiceCreated: {
      subject: (v) => `发票 ${v.invoiceNumber} 已创建 – PraxisOnline24`,
      body: (v) => `已为您的诊所创建一张新发票。\n\n发票号：${v.invoiceNumber}\n发票日期：${v.invoiceDate}\n到期日期：${v.dueDate}\n总金额：${v.totalAmount} ${v.currency}\n状态：未结`,
      cta: '查看发票 →',
    },
    invoiceSent: {
      subject: (v) => `发票 ${v.invoiceNumber} 已发送 – PraxisOnline24`,
      body: (v) => `您的发票已发送。\n\n发票号：${v.invoiceNumber}\n收件人：${v.recipient}\n发票日期：${v.invoiceDate}\n到期日期：${v.dueDate}\n总金额：${v.totalAmount} ${v.currency}\n状态：已发送`,
      cta: '查看发票 →',
    },
    paymentReceived: {
      subject: (v) => `付款确认 – 发票 ${v.invoiceNumber}`,
      body: (v) => `我们已收到您的付款 – 感谢您！\n\n发票号：${v.invoiceNumber}\n付款日期：${v.paidDate}\n金额：${v.amount} ${v.currency}\n付款方式：${v.method}\n状态：已付`,
      cta: '下载收据 →',
    },
    paymentFailed: {
      subject: (v) => `付款失败 – 发票 ${v.invoiceNumber}`,
      body: (v) => `很遗憾，我们无法处理您的付款。\n\n发票号：${v.invoiceNumber}\n金额：${v.amount} ${v.currency}\n原因：${v.reason}\n状态：付款失败\n\n请更新您的付款方式或重试。`,
      cta: '重试付款 →',
    },
    paymentReminder: {
      subject: (v) => `付款提醒 – 发票 ${v.invoiceNumber}`,
      body: (v) => `提醒：一张发票仍未结清。\n\n发票号：${v.invoiceNumber}\n发票日期：${v.invoiceDate}\n到期日期：${v.dueDate}\n总金额：${v.totalAmount} ${v.currency}\n逾期天数：${v.daysOverdue}\n状态：逾期\n\n请尽快支付未结金额。`,
      cta: '立即支付 →',
    },
    subscriptionCancelled: {
      subject: '订阅已取消 – PraxisOnline24',
      body: (v) => `您的订阅已被取消。\n\n套餐：${v.plan}\n生效日期：${v.effectiveDate}\n状态：已取消\n\n您可以在当前计费周期结束前继续使用 PraxisOnline24。期待您再次回来。`,
      cta: '管理订阅 →',
    },
    trialConvertedToPaid: {
      subject: (v) => `试用已转为 ${v.plan} – PraxisOnline24`,
      body: (v) => `您的试用期已成功转为付费订阅。\n\n套餐：${v.plan}\n首个计费周期至：${v.periodEnd}\n金额：${v.amount} ${v.currency}\n状态：已激活\n\n感谢您的信任。`,
      cta: '进入我的账户 →',
    },
  },

  // ── Thai ───────────────────────────────────────────────────
  th: {
    invoiceCreated: {
      subject: (v) => `ใบแจ้งหนี้ ${v.invoiceNumber} ถูกสร้างแล้ว – PraxisOnline24`,
      body: (v) => `มีการสร้างใบแจ้งหนี้ใหม่สำหรับคลินิกของคุณ\n\nหมายเลขใบแจ้งหนี้: ${v.invoiceNumber}\nวันที่ใบแจ้งหนี้: ${v.invoiceDate}\nวันที่ครบกำหนด: ${v.dueDate}\nยอดรวม: ${v.totalAmount} ${v.currency}\nสถานะ: เปิด`,
      cta: 'ดูใบแจ้งหนี้ →',
    },
    invoiceSent: {
      subject: (v) => `ใบแจ้งหนี้ ${v.invoiceNumber} ถูกส่งแล้ว – PraxisOnline24`,
      body: (v) => `ใบแจ้งหนี้ของคุณถูกส่งแล้ว\n\nหมายเลขใบแจ้งหนี้: ${v.invoiceNumber}\nผู้รับ: ${v.recipient}\nวันที่ใบแจ้งหนี้: ${v.invoiceDate}\nวันที่ครบกำหนด: ${v.dueDate}\nยอดรวม: ${v.totalAmount} ${v.currency}\nสถานะ: ส่งแล้ว`,
      cta: 'ดูใบแจ้งหนี้ →',
    },
    paymentReceived: {
      subject: (v) => `ยืนยันการชำระเงิน – ใบแจ้งหนี้ ${v.invoiceNumber}`,
      body: (v) => `เราได้รับการชำระเงินของคุณแล้ว – ขอบคุณ!\n\nหมายเลขใบแจ้งหนี้: ${v.invoiceNumber}\nวันที่ชำระเงิน: ${v.paidDate}\nจำนวนเงิน: ${v.amount} ${v.currency}\nวิธีการชำระเงิน: ${v.method}\nสถานะ: ชำระแล้ว`,
      cta: 'ดาวน์โหลดใบเสร็จ →',
    },
    paymentFailed: {
      subject: (v) => `การชำระเงินล้มเหลว – ใบแจ้งหนี้ ${v.invoiceNumber}`,
      body: (v) => `ขออภัย เราไม่สามารถดำเนินการชำระเงินของคุณได้\n\nหมายเลขใบแจ้งหนี้: ${v.invoiceNumber}\nจำนวนเงิน: ${v.amount} ${v.currency}\nเหตุผล: ${v.reason}\nสถานะ: การชำระเงินล้มเหลว\n\nโปรดอัปเดตวิธีการชำระเงินของคุณหรือลองใหม่อีกครั้ง`,
      cta: 'ลองชำระเงินอีกครั้ง →',
    },
    paymentReminder: {
      subject: (v) => `เตือนการชำระเงิน – ใบแจ้งหนี้ ${v.invoiceNumber}`,
      body: (v) => `เตือน: ใบแจ้งหนี้ยังคงค้างชำระ\n\nหมายเลขใบแจ้งหนี้: ${v.invoiceNumber}\nวันที่ใบแจ้งหนี้: ${v.invoiceDate}\nวันที่ครบกำหนด: ${v.dueDate}\nยอดรวม: ${v.totalAmount} ${v.currency}\nวันค้างชำระ: ${v.daysOverdue}\nสถานะ: เกินกำหนด\n\nโปรดชำระยอดค้างโดยเร็วที่สุด`,
      cta: 'ชำระเงินตอนนี้ →',
    },
    subscriptionCancelled: {
      subject: 'ยกเลิกการสมัครสมาชิกแล้ว – PraxisOnline24',
      body: (v) => `การสมัครสมาชิกของคุณถูกยกเลิกแล้ว\n\nแพ็กเกจ: ${v.plan}\nมีผลตั้งแต่: ${v.effectiveDate}\nสถานะ: ยกเลิก\n\nคุณสามารถใช้ PraxisOnline24 ต่อไปได้จนถึงสิ้นสุดรอบการเรียกเก็บเงินปัจจุบัน เราหวังว่าจะได้พบคุณอีกครั้งเร็ว ๆ นี้`,
      cta: 'จัดการการสมัครสมาชิก →',
    },
    trialConvertedToPaid: {
      subject: (v) => `การทดลองใช้แปลงเป็น ${v.plan} – PraxisOnline24`,
      body: (v) => `ช่วงทดลองของคุณถูกแปลงเป็นการสมัครสมาชิกแบบชำระเงินเรียบร้อยแล้ว\n\nแพ็กเกจ: ${v.plan}\nรอบการเรียกเก็บเงินแรกถึง: ${v.periodEnd}\nจำนวนเงิน: ${v.amount} ${v.currency}\nสถานะ: ใช้งานอยู่\n\nขอบคุณสำหรับความไว้วางใจ`,
      cta: 'ไปที่บัญชีของฉัน →',
    },
  },
};

module.exports = invoiceLocales;
