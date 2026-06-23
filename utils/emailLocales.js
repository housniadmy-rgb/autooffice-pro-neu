// utils/emailLocales.js
// Zentrale Übersetzungsstruktur für alle PraxisOnline24-Systemmails.
// Jede Sprache enthält:
//   - common: { greeting(name), signoff, footer }
//   - einen Eintrag pro Mail-Typ mit { subject, heading?, body(vars), cta? }
//
// Mail-Typen (jeder in allen 14 Sprachen identisch verfügbar):
//   invite                    – Einladungs-/Demo-Mail
//   passwordReset             – Passwort zurücksetzen
//   passwordChanged           – Passwort erfolgreich geändert
//   emailConfirmation         – E-Mail-Adresse bestätigen
//   accountActivated          – Konto aktiviert
//   trialStarted              – Testphase begonnen
//   trialEndingSoon           – Testphase endet bald (vars.days, vars.trialEndDate)
//   trialExpired              – Testphase abgelaufen
//   contactConfirmation       – Bestätigung Kontaktformular
//   subscriptionConfirmation  – Zahlungs-/Abo-Bestätigung (vars.plan, vars.periodEnd)
//
// Neue Mail-Typen müssen ausschließlich in dieser Datei ergänzt werden – der
// renderEmail-Helper in utils/email.js zieht sie dann automatisch in allen
// Sprachen.

const emailLocales = {
  // ── Deutsch ────────────────────────────────────────────────
  de: {
    common: {
      greeting: (n) => `Hallo ${n},`,
      signoff: 'Ihr PraxisOnline24-Team',
      footer: 'PraxisOnline24 – Ihre Praxis. Online. Rund um die Uhr.',
    },
    invite: {
      subject: 'Ihre PraxisOnline24-Demo ist bereit',
      body: (v) => `Vielen Dank für Ihre Demo-Anfrage bei PraxisOnline24!\nIhr Praxis-Konto für „${v.practice}" wurde vorbereitet. Bitte legen Sie jetzt Ihr Passwort fest. Der Link ist 24 Stunden gültig.`,
      cta: 'Passwort festlegen →',
    },
    passwordReset: {
      subject: 'Passwort zurücksetzen – PraxisOnline24',
      body: () => `Sie haben das Zurücksetzen Ihres Passworts angefordert.\nKlicken Sie auf den Button unten, um ein neues Passwort festzulegen. Der Link ist 1 Stunde gültig.\nFalls Sie diese Anfrage nicht gestellt haben, können Sie diese Nachricht ignorieren.`,
      cta: 'Passwort zurücksetzen →',
    },
    passwordChanged: {
      subject: 'Passwort erfolgreich geändert – PraxisOnline24',
      body: () => `Ihr PraxisOnline24-Passwort wurde soeben erfolgreich geändert.\nFalls Sie diese Änderung nicht selbst vorgenommen haben, setzen Sie Ihr Passwort bitte sofort zurück und kontaktieren Sie uns.`,
      cta: 'Zur Anmeldung →',
    },
    emailConfirmation: {
      subject: 'Bitte bestätigen Sie Ihre E-Mail-Adresse – PraxisOnline24',
      body: () => `Bitte bestätigen Sie Ihre E-Mail-Adresse, um Ihren PraxisOnline24-Zugang freizuschalten. Der Bestätigungslink ist 24 Stunden gültig.`,
      cta: 'E-Mail bestätigen →',
    },
    accountActivated: {
      subject: 'Ihr PraxisOnline24-Konto ist aktiviert',
      body: () => `Ihr PraxisOnline24-Konto wurde erfolgreich aktiviert. Sie können sich ab sofort anmelden und Ihre Praxis verwalten. Ihre 30-tägige Testphase läuft.`,
      cta: 'Zur Anmeldung →',
    },
    trialStarted: {
      subject: 'Ihre Testphase bei PraxisOnline24 hat begonnen',
      body: (v) => `Willkommen bei PraxisOnline24! Ihre 30-tägige Testphase hat begonnen und endet am ${v.trialEndDate}. In dieser Zeit können Sie alle Funktionen kostenlos testen.`,
      cta: 'Zum Dashboard →',
    },
    trialEndingSoon: {
      subject: (v) => `Ihre Testphase endet in ${v.days} Tag(en) – PraxisOnline24`,
      body: (v) => `Ihre Testphase bei PraxisOnline24 endet in ${v.days} Tag(en) am ${v.trialEndDate}. Um PraxisOnline24 weiterhin nutzen zu können, upgraden Sie bitte Ihr Paket.`,
      cta: 'Paket upgraden →',
    },
    trialExpired: {
      subject: 'Ihre Testphase ist abgelaufen – PraxisOnline24',
      body: () => `Ihre Testphase bei PraxisOnline24 ist abgelaufen. Bitte upgraden Sie Ihr Paket, um PraxisOnline24 weiterhin zu nutzen. Andernfalls wird Ihr Konto in 7 Tagen pausiert.`,
      cta: 'Jetzt upgraden →',
    },
    contactConfirmation: {
      subject: 'Wir haben Ihre Nachricht erhalten – PraxisOnline24',
      body: () => `Vielen Dank für Ihre Nachricht über unser Kontaktformular. Wir haben Ihre Anfrage erhalten und melden uns innerhalb von 1–2 Werktagen bei Ihnen.`,
    },
    subscriptionConfirmation: {
      subject: (v) => `Abo-Bestätigung: ${v.plan} – PraxisOnline24`,
      body: (v) => `Vielen Dank! Ihr ${v.plan}-Abo bei PraxisOnline24 ist aktiv. Aktueller Abrechnungszeitraum bis ${v.periodEnd}. Sie können Ihr Abo jederzeit in den Einstellungen verwalten.`,
      cta: 'Zu meinem Konto →',
    },
  },

  // ── Englisch ───────────────────────────────────────────────
  en: {
    common: {
      greeting: (n) => `Hello ${n},`,
      signoff: 'Your PraxisOnline24 Team',
      footer: 'PraxisOnline24 – Your practice. Online. Around the clock.',
    },
    invite: {
      subject: 'Your PraxisOnline24 demo is ready',
      body: (v) => `Thank you for requesting a PraxisOnline24 demo!\nYour practice account for "${v.practice}" has been prepared. Please set your password now. The link is valid for 24 hours.`,
      cta: 'Set password →',
    },
    passwordReset: {
      subject: 'Reset your password – PraxisOnline24',
      body: () => `You requested a password reset.\nClick the button below to set a new password. The link is valid for 1 hour.\nIf you did not request this, you can ignore this message.`,
      cta: 'Reset password →',
    },
    passwordChanged: {
      subject: 'Password successfully changed – PraxisOnline24',
      body: () => `Your PraxisOnline24 password has just been changed successfully.\nIf you did not make this change yourself, please reset your password immediately and contact us.`,
      cta: 'Log in →',
    },
    emailConfirmation: {
      subject: 'Please confirm your email address – PraxisOnline24',
      body: () => `Please confirm your email address to activate your PraxisOnline24 account. The confirmation link is valid for 24 hours.`,
      cta: 'Confirm email →',
    },
    accountActivated: {
      subject: 'Your PraxisOnline24 account is activated',
      body: () => `Your PraxisOnline24 account has been successfully activated. You can now log in and manage your practice. Your 30-day trial is running.`,
      cta: 'Log in →',
    },
    trialStarted: {
      subject: 'Your PraxisOnline24 trial has started',
      body: (v) => `Welcome to PraxisOnline24! Your 30-day trial has started and ends on ${v.trialEndDate}. During this time you can use all features free of charge.`,
      cta: 'Go to dashboard →',
    },
    trialEndingSoon: {
      subject: (v) => `Your trial ends in ${v.days} day(s) – PraxisOnline24`,
      body: (v) => `Your PraxisOnline24 trial ends in ${v.days} day(s) on ${v.trialEndDate}. To keep using PraxisOnline24, please upgrade your plan.`,
      cta: 'Upgrade plan →',
    },
    trialExpired: {
      subject: 'Your trial has expired – PraxisOnline24',
      body: () => `Your PraxisOnline24 trial has expired. Please upgrade your plan to continue using PraxisOnline24. Otherwise your account will be paused in 7 days.`,
      cta: 'Upgrade now →',
    },
    contactConfirmation: {
      subject: 'We received your message – PraxisOnline24',
      body: () => `Thank you for your message via our contact form. We have received your request and will get back to you within 1–2 business days.`,
    },
    subscriptionConfirmation: {
      subject: (v) => `Subscription confirmation: ${v.plan} – PraxisOnline24`,
      body: (v) => `Thank you! Your ${v.plan} subscription on PraxisOnline24 is active. Current billing period until ${v.periodEnd}. You can manage your subscription anytime in the settings.`,
      cta: 'Go to my account →',
    },
  },

  // ── Französisch ────────────────────────────────────────────
  fr: {
    common: {
      greeting: (n) => `Bonjour ${n},`,
      signoff: "L'équipe PraxisOnline24",
      footer: 'PraxisOnline24 – Votre cabinet. En ligne. 24h/24.',
    },
    invite: {
      subject: 'Votre démo PraxisOnline24 est prête',
      body: (v) => `Merci d'avoir demandé une démo PraxisOnline24 !\nVotre compte cabinet pour « ${v.practice} » a été préparé. Veuillez maintenant définir votre mot de passe. Le lien est valable 24 heures.`,
      cta: 'Définir le mot de passe →',
    },
    passwordReset: {
      subject: 'Réinitialiser votre mot de passe – PraxisOnline24',
      body: () => `Vous avez demandé la réinitialisation de votre mot de passe.\nCliquez sur le bouton ci-dessous pour définir un nouveau mot de passe. Le lien est valable 1 heure.\nSi vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer ce message.`,
      cta: 'Réinitialiser le mot de passe →',
    },
    passwordChanged: {
      subject: 'Mot de passe modifié avec succès – PraxisOnline24',
      body: () => `Votre mot de passe PraxisOnline24 vient d'être modifié avec succès.\nSi vous n'êtes pas à l'origine de cette modification, réinitialisez immédiatement votre mot de passe et contactez-nous.`,
      cta: 'Se connecter →',
    },
    emailConfirmation: {
      subject: 'Veuillez confirmer votre adresse e-mail – PraxisOnline24',
      body: () => `Veuillez confirmer votre adresse e-mail pour activer votre compte PraxisOnline24. Le lien de confirmation est valable 24 heures.`,
      cta: "Confirmer l'e-mail →",
    },
    accountActivated: {
      subject: 'Votre compte PraxisOnline24 est activé',
      body: () => `Votre compte PraxisOnline24 a été activé avec succès. Vous pouvez désormais vous connecter et gérer votre cabinet. Votre période d'essai de 30 jours est en cours.`,
      cta: 'Se connecter →',
    },
    trialStarted: {
      subject: 'Votre essai PraxisOnline24 a commencé',
      body: (v) => `Bienvenue chez PraxisOnline24 ! Votre essai de 30 jours a commencé et se termine le ${v.trialEndDate}. Pendant cette période, vous pouvez utiliser toutes les fonctionnalités gratuitement.`,
      cta: 'Accéder au tableau de bord →',
    },
    trialEndingSoon: {
      subject: (v) => `Votre essai se termine dans ${v.days} jour(s) – PraxisOnline24`,
      body: (v) => `Votre essai PraxisOnline24 se termine dans ${v.days} jour(s), le ${v.trialEndDate}. Pour continuer à utiliser PraxisOnline24, veuillez passer à un abonnement payant.`,
      cta: "Mettre à niveau l'abonnement →",
    },
    trialExpired: {
      subject: 'Votre essai a expiré – PraxisOnline24',
      body: () => `Votre essai PraxisOnline24 a expiré. Veuillez mettre à niveau votre abonnement pour continuer à utiliser PraxisOnline24. Sinon votre compte sera suspendu dans 7 jours.`,
      cta: 'Mettre à niveau maintenant →',
    },
    contactConfirmation: {
      subject: 'Nous avons bien reçu votre message – PraxisOnline24',
      body: () => `Merci pour votre message via notre formulaire de contact. Nous avons reçu votre demande et nous reviendrons vers vous sous 1 à 2 jours ouvrés.`,
    },
    subscriptionConfirmation: {
      subject: (v) => `Confirmation d'abonnement : ${v.plan} – PraxisOnline24`,
      body: (v) => `Merci ! Votre abonnement ${v.plan} sur PraxisOnline24 est actif. Période de facturation en cours jusqu'au ${v.periodEnd}. Vous pouvez gérer votre abonnement à tout moment dans les paramètres.`,
      cta: 'Accéder à mon compte →',
    },
  },

  // ── Spanisch ───────────────────────────────────────────────
  es: {
    common: {
      greeting: (n) => `Estimado/a ${n},`,
      signoff: 'El equipo de PraxisOnline24',
      footer: 'PraxisOnline24 – Su consultorio. En línea. 24/7.',
    },
    invite: {
      subject: 'Su demo de PraxisOnline24 está lista',
      body: (v) => `¡Gracias por solicitar una demo de PraxisOnline24!\nSu cuenta para "${v.practice}" ha sido preparada. Por favor, establezca su contraseña ahora. El enlace es válido por 24 horas.`,
      cta: 'Establecer contraseña →',
    },
    passwordReset: {
      subject: 'Restablecer contraseña – PraxisOnline24',
      body: () => `Ha solicitado restablecer su contraseña.\nHaga clic en el botón a continuación para establecer una nueva contraseña. El enlace es válido por 1 hora.\nSi no realizó esta solicitud, puede ignorar este mensaje.`,
      cta: 'Restablecer contraseña →',
    },
    passwordChanged: {
      subject: 'Contraseña cambiada con éxito – PraxisOnline24',
      body: () => `Su contraseña de PraxisOnline24 acaba de ser cambiada con éxito.\nSi no realizó este cambio, restablezca su contraseña inmediatamente y contáctenos.`,
      cta: 'Iniciar sesión →',
    },
    emailConfirmation: {
      subject: 'Por favor confirme su dirección de correo – PraxisOnline24',
      body: () => `Por favor confirme su dirección de correo electrónico para activar su acceso a PraxisOnline24. El enlace de confirmación es válido por 24 horas.`,
      cta: 'Confirmar correo →',
    },
    accountActivated: {
      subject: 'Su cuenta de PraxisOnline24 está activada',
      body: () => `Su cuenta de PraxisOnline24 ha sido activada con éxito. Ya puede iniciar sesión y gestionar su consultorio. Su período de prueba de 30 días está en curso.`,
      cta: 'Iniciar sesión →',
    },
    trialStarted: {
      subject: 'Su período de prueba de PraxisOnline24 ha comenzado',
      body: (v) => `¡Bienvenido a PraxisOnline24! Su período de prueba de 30 días ha comenzado y finaliza el ${v.trialEndDate}. Durante este tiempo puede usar todas las funciones de forma gratuita.`,
      cta: 'Ir al panel →',
    },
    trialEndingSoon: {
      subject: (v) => `Su prueba termina en ${v.days} día(s) – PraxisOnline24`,
      body: (v) => `Su período de prueba de PraxisOnline24 termina en ${v.days} día(s), el ${v.trialEndDate}. Para seguir usando PraxisOnline24, por favor actualice su plan.`,
      cta: 'Actualizar plan →',
    },
    trialExpired: {
      subject: 'Su período de prueba ha expirado – PraxisOnline24',
      body: () => `Su período de prueba de PraxisOnline24 ha expirado. Por favor actualice su plan para seguir usando PraxisOnline24. De lo contrario, su cuenta se pausará en 7 días.`,
      cta: 'Actualizar ahora →',
    },
    contactConfirmation: {
      subject: 'Hemos recibido su mensaje – PraxisOnline24',
      body: () => `Gracias por su mensaje a través de nuestro formulario de contacto. Hemos recibido su consulta y le responderemos en un plazo de 1 a 2 días laborables.`,
    },
    subscriptionConfirmation: {
      subject: (v) => `Confirmación de suscripción: ${v.plan} – PraxisOnline24`,
      body: (v) => `¡Gracias! Su suscripción ${v.plan} en PraxisOnline24 está activa. Período de facturación actual hasta el ${v.periodEnd}. Puede gestionar su suscripción en cualquier momento en los ajustes.`,
      cta: 'Ir a mi cuenta →',
    },
  },

  // ── Italienisch ────────────────────────────────────────────
  it: {
    common: {
      greeting: (n) => `Gentile ${n},`,
      signoff: 'Il team di PraxisOnline24',
      footer: 'PraxisOnline24 – Il tuo studio. Online. 24 ore su 24.',
    },
    invite: {
      subject: 'La tua demo PraxisOnline24 è pronta',
      body: (v) => `Grazie per aver richiesto una demo di PraxisOnline24!\nIl tuo account studio per "${v.practice}" è stato preparato. Imposta ora la tua password. Il link è valido per 24 ore.`,
      cta: 'Imposta password →',
    },
    passwordReset: {
      subject: 'Reimposta la password – PraxisOnline24',
      body: () => `Hai richiesto la reimpostazione della tua password.\nClicca sul pulsante sottostante per impostare una nuova password. Il link è valido per 1 ora.\nSe non hai fatto questa richiesta, puoi ignorare questo messaggio.`,
      cta: 'Reimposta password →',
    },
    passwordChanged: {
      subject: 'Password modificata con successo – PraxisOnline24',
      body: () => `La tua password PraxisOnline24 è stata appena modificata con successo.\nSe non hai effettuato tu questa modifica, reimposta immediatamente la password e contattaci.`,
      cta: 'Accedi →',
    },
    emailConfirmation: {
      subject: 'Conferma il tuo indirizzo e-mail – PraxisOnline24',
      body: () => `Conferma il tuo indirizzo e-mail per attivare il tuo account PraxisOnline24. Il link di conferma è valido per 24 ore.`,
      cta: 'Conferma e-mail →',
    },
    accountActivated: {
      subject: 'Il tuo account PraxisOnline24 è attivo',
      body: () => `Il tuo account PraxisOnline24 è stato attivato con successo. Puoi ora accedere e gestire il tuo studio. La tua prova di 30 giorni è in corso.`,
      cta: 'Accedi →',
    },
    trialStarted: {
      subject: 'La tua prova PraxisOnline24 è iniziata',
      body: (v) => `Benvenuto su PraxisOnline24! La tua prova di 30 giorni è iniziata e termina il ${v.trialEndDate}. Durante questo periodo puoi utilizzare tutte le funzionalità gratuitamente.`,
      cta: 'Vai alla dashboard →',
    },
    trialEndingSoon: {
      subject: (v) => `La tua prova termina tra ${v.days} giorno/i – PraxisOnline24`,
      body: (v) => `La tua prova PraxisOnline24 termina tra ${v.days} giorno/i, il ${v.trialEndDate}. Per continuare a usare PraxisOnline24, aggiorna il tuo piano.`,
      cta: 'Aggiorna piano →',
    },
    trialExpired: {
      subject: 'La tua prova è scaduta – PraxisOnline24',
      body: () => `La tua prova PraxisOnline24 è scaduta. Aggiorna il tuo piano per continuare a usare PraxisOnline24. Altrimenti il tuo account sarà sospeso tra 7 giorni.`,
      cta: 'Aggiorna ora →',
    },
    contactConfirmation: {
      subject: 'Abbiamo ricevuto il tuo messaggio – PraxisOnline24',
      body: () => `Grazie per il tuo messaggio tramite il nostro modulo di contatto. Abbiamo ricevuto la tua richiesta e ti risponderemo entro 1–2 giorni lavorativi.`,
    },
    subscriptionConfirmation: {
      subject: (v) => `Conferma abbonamento: ${v.plan} – PraxisOnline24`,
      body: (v) => `Grazie! Il tuo abbonamento ${v.plan} su PraxisOnline24 è attivo. Periodo di fatturazione corrente fino al ${v.periodEnd}. Puoi gestire l'abbonamento in qualsiasi momento dalle impostazioni.`,
      cta: 'Vai al mio account →',
    },
  },

  // ── Portugiesisch ──────────────────────────────────────────
  pt: {
    common: {
      greeting: (n) => `Prezado/a ${n},`,
      signoff: 'Equipe PraxisOnline24',
      footer: 'PraxisOnline24 – Sua clínica. Online. 24/7.',
    },
    invite: {
      subject: 'Sua demo do PraxisOnline24 está pronta',
      body: (v) => `Obrigado por solicitar uma demonstração do PraxisOnline24!\nSua conta para "${v.practice}" foi preparada. Defina sua senha agora. O link é válido por 24 horas.`,
      cta: 'Definir senha →',
    },
    passwordReset: {
      subject: 'Redefinir senha – PraxisOnline24',
      body: () => `Você solicitou a redefinição de sua senha.\nClique no botão abaixo para definir uma nova senha. O link é válido por 1 hora.\nSe você não fez essa solicitação, pode ignorar esta mensagem.`,
      cta: 'Redefinir senha →',
    },
    passwordChanged: {
      subject: 'Senha alterada com sucesso – PraxisOnline24',
      body: () => `Sua senha do PraxisOnline24 foi alterada com sucesso.\nSe não foi você que fez essa alteração, redefina a senha imediatamente e entre em contato conosco.`,
      cta: 'Fazer login →',
    },
    emailConfirmation: {
      subject: 'Confirme seu endereço de e-mail – PraxisOnline24',
      body: () => `Confirme seu endereço de e-mail para ativar sua conta PraxisOnline24. O link de confirmação é válido por 24 horas.`,
      cta: 'Confirmar e-mail →',
    },
    accountActivated: {
      subject: 'Sua conta PraxisOnline24 está ativada',
      body: () => `Sua conta PraxisOnline24 foi ativada com sucesso. Você pode fazer login e gerenciar sua clínica. Seu período de teste de 30 dias está em andamento.`,
      cta: 'Fazer login →',
    },
    trialStarted: {
      subject: 'Seu período de teste no PraxisOnline24 começou',
      body: (v) => `Bem-vindo ao PraxisOnline24! Seu período de teste de 30 dias começou e termina em ${v.trialEndDate}. Durante esse período, você pode usar todas as funcionalidades gratuitamente.`,
      cta: 'Ir para o painel →',
    },
    trialEndingSoon: {
      subject: (v) => `Seu período de teste termina em ${v.days} dia(s) – PraxisOnline24`,
      body: (v) => `Seu período de teste no PraxisOnline24 termina em ${v.days} dia(s), em ${v.trialEndDate}. Para continuar usando o PraxisOnline24, atualize seu plano.`,
      cta: 'Atualizar plano →',
    },
    trialExpired: {
      subject: 'Seu período de teste expirou – PraxisOnline24',
      body: () => `Seu período de teste no PraxisOnline24 expirou. Atualize seu plano para continuar usando o PraxisOnline24. Caso contrário, sua conta será pausada em 7 dias.`,
      cta: 'Atualizar agora →',
    },
    contactConfirmation: {
      subject: 'Recebemos sua mensagem – PraxisOnline24',
      body: () => `Obrigado pela sua mensagem via nosso formulário de contato. Recebemos sua solicitação e retornaremos em 1–2 dias úteis.`,
    },
    subscriptionConfirmation: {
      subject: (v) => `Confirmação de assinatura: ${v.plan} – PraxisOnline24`,
      body: (v) => `Obrigado! Sua assinatura ${v.plan} no PraxisOnline24 está ativa. Período de cobrança atual até ${v.periodEnd}. Você pode gerenciar sua assinatura a qualquer momento nas configurações.`,
      cta: 'Ir para minha conta →',
    },
  },

  // ── Niederländisch ─────────────────────────────────────────
  nl: {
    common: {
      greeting: (n) => `Beste ${n},`,
      signoff: 'Uw PraxisOnline24-team',
      footer: 'PraxisOnline24 – Uw praktijk. Online. 24/7.',
    },
    invite: {
      subject: 'Uw PraxisOnline24-demo is klaar',
      body: (v) => `Bedankt voor uw demo-aanvraag bij PraxisOnline24!\nUw praktijkaccount voor "${v.practice}" is voorbereid. Stel nu uw wachtwoord in. De link is 24 uur geldig.`,
      cta: 'Wachtwoord instellen →',
    },
    passwordReset: {
      subject: 'Wachtwoord opnieuw instellen – PraxisOnline24',
      body: () => `U heeft een verzoek tot wachtwoordherstel gedaan.\nKlik op de knop hieronder om een nieuw wachtwoord in te stellen. De link is 1 uur geldig.\nIndien u dit niet heeft aangevraagd, kunt u dit bericht negeren.`,
      cta: 'Wachtwoord opnieuw instellen →',
    },
    passwordChanged: {
      subject: 'Wachtwoord succesvol gewijzigd – PraxisOnline24',
      body: () => `Uw PraxisOnline24-wachtwoord is zojuist succesvol gewijzigd.\nIndien u deze wijziging niet zelf heeft uitgevoerd, herstel dan onmiddellijk uw wachtwoord en neem contact met ons op.`,
      cta: 'Inloggen →',
    },
    emailConfirmation: {
      subject: 'Bevestig uw e-mailadres – PraxisOnline24',
      body: () => `Bevestig uw e-mailadres om uw PraxisOnline24-account te activeren. De bevestigingslink is 24 uur geldig.`,
      cta: 'E-mail bevestigen →',
    },
    accountActivated: {
      subject: 'Uw PraxisOnline24-account is geactiveerd',
      body: () => `Uw PraxisOnline24-account is succesvol geactiveerd. U kunt nu inloggen en uw praktijk beheren. Uw proefperiode van 30 dagen is gestart.`,
      cta: 'Inloggen →',
    },
    trialStarted: {
      subject: 'Uw PraxisOnline24-proefperiode is begonnen',
      body: (v) => `Welkom bij PraxisOnline24! Uw proefperiode van 30 dagen is begonnen en eindigt op ${v.trialEndDate}. Tijdens deze periode kunt u alle functies kosteloos gebruiken.`,
      cta: 'Naar dashboard →',
    },
    trialEndingSoon: {
      subject: (v) => `Uw proefperiode eindigt over ${v.days} dag(en) – PraxisOnline24`,
      body: (v) => `Uw PraxisOnline24-proefperiode eindigt over ${v.days} dag(en), op ${v.trialEndDate}. Upgrade uw pakket om PraxisOnline24 te blijven gebruiken.`,
      cta: 'Pakket upgraden →',
    },
    trialExpired: {
      subject: 'Uw proefperiode is verlopen – PraxisOnline24',
      body: () => `Uw PraxisOnline24-proefperiode is verlopen. Upgrade uw pakket om PraxisOnline24 te blijven gebruiken. Anders wordt uw account over 7 dagen gepauzeerd.`,
      cta: 'Nu upgraden →',
    },
    contactConfirmation: {
      subject: 'We hebben uw bericht ontvangen – PraxisOnline24',
      body: () => `Bedankt voor uw bericht via ons contactformulier. We hebben uw aanvraag ontvangen en nemen binnen 1–2 werkdagen contact met u op.`,
    },
    subscriptionConfirmation: {
      subject: (v) => `Abonnementsbevestiging: ${v.plan} – PraxisOnline24`,
      body: (v) => `Bedankt! Uw ${v.plan}-abonnement bij PraxisOnline24 is actief. Huidige factureringsperiode tot ${v.periodEnd}. U kunt uw abonnement op elk moment beheren in de instellingen.`,
      cta: 'Naar mijn account →',
    },
  },

  // ── Türkisch ───────────────────────────────────────────────
  tr: {
    common: {
      greeting: (n) => `Sayın ${n},`,
      signoff: 'PraxisOnline24 Ekibiniz',
      footer: 'PraxisOnline24 – Kliniğiniz. Çevrimiçi. 7/24.',
    },
    invite: {
      subject: 'PraxisOnline24 demonuz hazır',
      body: (v) => `PraxisOnline24 demo talebiniz için teşekkür ederiz!\n"${v.practice}" için klinik hesabınız hazırlandı. Lütfen şimdi şifrenizi belirleyin. Bağlantı 24 saat geçerlidir.`,
      cta: 'Şifre belirle →',
    },
    passwordReset: {
      subject: 'Şifre sıfırlama – PraxisOnline24',
      body: () => `Şifre sıfırlama talebinde bulundunuz.\nYeni bir şifre belirlemek için aşağıdaki düğmeye tıklayın. Bağlantı 1 saat geçerlidir.\nBu talebi siz yapmadıysanız bu mesajı görmezden gelebilirsiniz.`,
      cta: 'Şifreyi sıfırla →',
    },
    passwordChanged: {
      subject: 'Şifreniz başarıyla değiştirildi – PraxisOnline24',
      body: () => `PraxisOnline24 şifreniz az önce başarıyla değiştirildi.\nBu değişikliği siz yapmadıysanız lütfen şifrenizi hemen sıfırlayın ve bizimle iletişime geçin.`,
      cta: 'Giriş yap →',
    },
    emailConfirmation: {
      subject: 'Lütfen e-posta adresinizi doğrulayın – PraxisOnline24',
      body: () => `PraxisOnline24 hesabınızı aktifleştirmek için lütfen e-posta adresinizi doğrulayın. Onay bağlantısı 24 saat geçerlidir.`,
      cta: 'E-postayı doğrula →',
    },
    accountActivated: {
      subject: 'PraxisOnline24 hesabınız aktifleştirildi',
      body: () => `PraxisOnline24 hesabınız başarıyla aktifleştirildi. Artık giriş yapabilir ve kliniğinizi yönetebilirsiniz. 30 günlük deneme süreniz çalışıyor.`,
      cta: 'Giriş yap →',
    },
    trialStarted: {
      subject: 'PraxisOnline24 deneme süreniz başladı',
      body: (v) => `PraxisOnline24'e hoş geldiniz! 30 günlük deneme süreniz başladı ve ${v.trialEndDate} tarihinde sona erecek. Bu süre boyunca tüm özellikleri ücretsiz kullanabilirsiniz.`,
      cta: 'Panele git →',
    },
    trialEndingSoon: {
      subject: (v) => `Deneme süreniz ${v.days} gün içinde sona erecek – PraxisOnline24`,
      body: (v) => `PraxisOnline24 deneme süreniz ${v.days} gün içinde, ${v.trialEndDate} tarihinde sona erecek. PraxisOnline24'ü kullanmaya devam etmek için lütfen planınızı yükseltin.`,
      cta: 'Planı yükselt →',
    },
    trialExpired: {
      subject: 'Deneme süreniz sona erdi – PraxisOnline24',
      body: () => `PraxisOnline24 deneme süreniz sona erdi. PraxisOnline24'ü kullanmaya devam etmek için lütfen planınızı yükseltin. Aksi takdirde hesabınız 7 gün içinde duraklatılacaktır.`,
      cta: 'Şimdi yükselt →',
    },
    contactConfirmation: {
      subject: 'Mesajınızı aldık – PraxisOnline24',
      body: () => `İletişim formumuz aracılığıyla gönderdiğiniz mesaj için teşekkür ederiz. Talebinizi aldık ve 1–2 iş günü içinde size geri döneceğiz.`,
    },
    subscriptionConfirmation: {
      subject: (v) => `Abonelik onayı: ${v.plan} – PraxisOnline24`,
      body: (v) => `Teşekkür ederiz! PraxisOnline24 üzerindeki ${v.plan} aboneliğiniz aktif. Mevcut faturalandırma dönemi ${v.periodEnd} tarihine kadar geçerlidir. Aboneliğinizi istediğiniz zaman ayarlardan yönetebilirsiniz.`,
      cta: 'Hesabıma git →',
    },
  },

  // ── Arabisch ───────────────────────────────────────────────
  ar: {
    common: {
      greeting: (n) => `مرحباً ${n}،`,
      signoff: 'فريق PraxisOnline24',
      footer: 'PraxisOnline24 – عيادتك. عبر الإنترنت. على مدار الساعة.',
    },
    invite: {
      subject: 'عرض PraxisOnline24 التجريبي الخاص بك جاهز',
      body: (v) => `شكراً لطلبك عرضاً تجريبياً من PraxisOnline24!\nتم إعداد حساب العيادة الخاص بك لـ "${v.practice}". الرجاء تعيين كلمة المرور الخاصة بك الآن. الرابط صالح لمدة 24 ساعة.`,
      cta: 'تعيين كلمة المرور ←',
    },
    passwordReset: {
      subject: 'إعادة تعيين كلمة المرور – PraxisOnline24',
      body: () => `لقد طلبت إعادة تعيين كلمة المرور الخاصة بك.\nانقر على الزر أدناه لتعيين كلمة مرور جديدة. الرابط صالح لمدة ساعة واحدة.\nإذا لم تطلب ذلك، يمكنك تجاهل هذه الرسالة.`,
      cta: 'إعادة تعيين كلمة المرور ←',
    },
    passwordChanged: {
      subject: 'تم تغيير كلمة المرور بنجاح – PraxisOnline24',
      body: () => `تم تغيير كلمة مرور PraxisOnline24 الخاصة بك بنجاح للتو.\nإذا لم تقم بهذا التغيير بنفسك، فيرجى إعادة تعيين كلمة المرور فوراً والتواصل معنا.`,
      cta: 'تسجيل الدخول ←',
    },
    emailConfirmation: {
      subject: 'يرجى تأكيد عنوان بريدك الإلكتروني – PraxisOnline24',
      body: () => `يرجى تأكيد عنوان بريدك الإلكتروني لتفعيل حساب PraxisOnline24 الخاص بك. رابط التأكيد صالح لمدة 24 ساعة.`,
      cta: 'تأكيد البريد الإلكتروني ←',
    },
    accountActivated: {
      subject: 'تم تفعيل حساب PraxisOnline24 الخاص بك',
      body: () => `تم تفعيل حساب PraxisOnline24 الخاص بك بنجاح. يمكنك الآن تسجيل الدخول وإدارة عيادتك. فترة التجربة المجانية لمدة 30 يوماً قيد التشغيل.`,
      cta: 'تسجيل الدخول ←',
    },
    trialStarted: {
      subject: 'بدأت فترة تجربتك في PraxisOnline24',
      body: (v) => `مرحباً بك في PraxisOnline24! بدأت فترة تجربتك لمدة 30 يوماً وستنتهي في ${v.trialEndDate}. خلال هذه الفترة يمكنك استخدام جميع الميزات مجاناً.`,
      cta: 'الذهاب إلى لوحة التحكم ←',
    },
    trialEndingSoon: {
      subject: (v) => `فترة تجربتك تنتهي خلال ${v.days} يوم/أيام – PraxisOnline24`,
      body: (v) => `فترة تجربتك في PraxisOnline24 تنتهي خلال ${v.days} يوم/أيام، في ${v.trialEndDate}. لمواصلة استخدام PraxisOnline24، يرجى ترقية اشتراكك.`,
      cta: 'ترقية الاشتراك ←',
    },
    trialExpired: {
      subject: 'انتهت فترة تجربتك – PraxisOnline24',
      body: () => `انتهت فترة تجربتك في PraxisOnline24. يرجى ترقية اشتراكك لمواصلة استخدام PraxisOnline24. وإلا فسيتم إيقاف حسابك مؤقتاً بعد 7 أيام.`,
      cta: 'الترقية الآن ←',
    },
    contactConfirmation: {
      subject: 'لقد استلمنا رسالتك – PraxisOnline24',
      body: () => `شكراً لرسالتك عبر نموذج الاتصال. لقد استلمنا طلبك وسنرد عليك خلال 1–2 يوم عمل.`,
    },
    subscriptionConfirmation: {
      subject: (v) => `تأكيد الاشتراك: ${v.plan} – PraxisOnline24`,
      body: (v) => `شكراً لك! اشتراك ${v.plan} الخاص بك في PraxisOnline24 نشط. فترة الفوترة الحالية حتى ${v.periodEnd}. يمكنك إدارة اشتراكك في أي وقت من الإعدادات.`,
      cta: 'الذهاب إلى حسابي ←',
    },
  },

  // ── Russisch ───────────────────────────────────────────────
  ru: {
    common: {
      greeting: (n) => `Здравствуйте, ${n}!`,
      signoff: 'Команда PraxisOnline24',
      footer: 'PraxisOnline24 – Ваша клиника. Онлайн. Круглосуточно.',
    },
    invite: {
      subject: 'Ваша демоверсия PraxisOnline24 готова',
      body: (v) => `Спасибо за запрос демо-доступа к PraxisOnline24!\nУчётная запись клиники для «${v.practice}» подготовлена. Пожалуйста, установите пароль. Ссылка действительна 24 часа.`,
      cta: 'Установить пароль →',
    },
    passwordReset: {
      subject: 'Сброс пароля – PraxisOnline24',
      body: () => `Вы запросили сброс пароля.\nНажмите на кнопку ниже, чтобы задать новый пароль. Ссылка действительна 1 час.\nЕсли вы не запрашивали этого, просто проигнорируйте сообщение.`,
      cta: 'Сбросить пароль →',
    },
    passwordChanged: {
      subject: 'Пароль успешно изменён – PraxisOnline24',
      body: () => `Ваш пароль PraxisOnline24 только что был успешно изменён.\nЕсли это сделали не вы, немедленно сбросьте пароль и свяжитесь с нами.`,
      cta: 'Войти →',
    },
    emailConfirmation: {
      subject: 'Подтвердите ваш адрес электронной почты – PraxisOnline24',
      body: () => `Пожалуйста, подтвердите ваш адрес электронной почты, чтобы активировать доступ к PraxisOnline24. Ссылка подтверждения действительна 24 часа.`,
      cta: 'Подтвердить e-mail →',
    },
    accountActivated: {
      subject: 'Ваш аккаунт PraxisOnline24 активирован',
      body: () => `Ваш аккаунт PraxisOnline24 успешно активирован. Теперь вы можете войти и управлять своей клиникой. Ваш 30-дневный пробный период запущен.`,
      cta: 'Войти →',
    },
    trialStarted: {
      subject: 'Ваш пробный период PraxisOnline24 начался',
      body: (v) => `Добро пожаловать в PraxisOnline24! Ваш 30-дневный пробный период начался и завершится ${v.trialEndDate}. В этот период вы можете бесплатно пользоваться всеми функциями.`,
      cta: 'Перейти на дашборд →',
    },
    trialEndingSoon: {
      subject: (v) => `Пробный период заканчивается через ${v.days} дн. – PraxisOnline24`,
      body: (v) => `Ваш пробный период PraxisOnline24 заканчивается через ${v.days} дн., ${v.trialEndDate}. Чтобы продолжать использовать PraxisOnline24, пожалуйста, обновите ваш тариф.`,
      cta: 'Обновить тариф →',
    },
    trialExpired: {
      subject: 'Ваш пробный период истёк – PraxisOnline24',
      body: () => `Ваш пробный период PraxisOnline24 истёк. Пожалуйста, обновите тариф, чтобы продолжать пользоваться сервисом. Иначе ваш аккаунт будет приостановлен через 7 дней.`,
      cta: 'Обновить сейчас →',
    },
    contactConfirmation: {
      subject: 'Мы получили ваше сообщение – PraxisOnline24',
      body: () => `Спасибо за ваше сообщение через нашу контактную форму. Мы получили запрос и ответим вам в течение 1–2 рабочих дней.`,
    },
    subscriptionConfirmation: {
      subject: (v) => `Подтверждение подписки: ${v.plan} – PraxisOnline24`,
      body: (v) => `Спасибо! Ваша подписка ${v.plan} в PraxisOnline24 активна. Текущий платёжный период до ${v.periodEnd}. Вы можете управлять подпиской в любое время в настройках.`,
      cta: 'Перейти в мой аккаунт →',
    },
  },

  // ── Indonesisch ────────────────────────────────────────────
  id: {
    common: {
      greeting: (n) => `Yth. ${n},`,
      signoff: 'Tim PraxisOnline24',
      footer: 'PraxisOnline24 – Klinik Anda. Online. 24/7.',
    },
    invite: {
      subject: 'Demo PraxisOnline24 Anda sudah siap',
      body: (v) => `Terima kasih atas permintaan demo PraxisOnline24!\nAkun klinik untuk "${v.practice}" telah disiapkan. Silakan atur kata sandi Anda sekarang. Tautan berlaku selama 24 jam.`,
      cta: 'Atur kata sandi →',
    },
    passwordReset: {
      subject: 'Setel ulang kata sandi – PraxisOnline24',
      body: () => `Anda meminta pengaturan ulang kata sandi.\nKlik tombol di bawah ini untuk menetapkan kata sandi baru. Tautan berlaku selama 1 jam.\nJika Anda tidak meminta ini, abaikan pesan ini.`,
      cta: 'Setel ulang kata sandi →',
    },
    passwordChanged: {
      subject: 'Kata sandi berhasil diubah – PraxisOnline24',
      body: () => `Kata sandi PraxisOnline24 Anda baru saja berhasil diubah.\nJika Anda tidak melakukan perubahan ini sendiri, segera setel ulang kata sandi Anda dan hubungi kami.`,
      cta: 'Masuk →',
    },
    emailConfirmation: {
      subject: 'Mohon konfirmasi alamat email Anda – PraxisOnline24',
      body: () => `Mohon konfirmasi alamat email Anda untuk mengaktifkan akun PraxisOnline24. Tautan konfirmasi berlaku selama 24 jam.`,
      cta: 'Konfirmasi email →',
    },
    accountActivated: {
      subject: 'Akun PraxisOnline24 Anda telah diaktifkan',
      body: () => `Akun PraxisOnline24 Anda telah berhasil diaktifkan. Anda sekarang dapat masuk dan mengelola klinik Anda. Masa percobaan 30 hari sedang berjalan.`,
      cta: 'Masuk →',
    },
    trialStarted: {
      subject: 'Masa percobaan PraxisOnline24 Anda telah dimulai',
      body: (v) => `Selamat datang di PraxisOnline24! Masa percobaan 30 hari Anda telah dimulai dan berakhir pada ${v.trialEndDate}. Selama waktu ini Anda dapat menggunakan semua fitur secara gratis.`,
      cta: 'Ke dashboard →',
    },
    trialEndingSoon: {
      subject: (v) => `Masa percobaan Anda berakhir dalam ${v.days} hari – PraxisOnline24`,
      body: (v) => `Masa percobaan PraxisOnline24 Anda berakhir dalam ${v.days} hari, pada ${v.trialEndDate}. Untuk terus menggunakan PraxisOnline24, silakan tingkatkan paket Anda.`,
      cta: 'Tingkatkan paket →',
    },
    trialExpired: {
      subject: 'Masa percobaan Anda telah berakhir – PraxisOnline24',
      body: () => `Masa percobaan PraxisOnline24 Anda telah berakhir. Silakan tingkatkan paket Anda untuk terus menggunakan PraxisOnline24. Jika tidak, akun Anda akan dijeda dalam 7 hari.`,
      cta: 'Tingkatkan sekarang →',
    },
    contactConfirmation: {
      subject: 'Kami telah menerima pesan Anda – PraxisOnline24',
      body: () => `Terima kasih atas pesan Anda melalui formulir kontak kami. Kami telah menerima permintaan Anda dan akan menghubungi Anda kembali dalam 1–2 hari kerja.`,
    },
    subscriptionConfirmation: {
      subject: (v) => `Konfirmasi langganan: ${v.plan} – PraxisOnline24`,
      body: (v) => `Terima kasih! Langganan ${v.plan} Anda di PraxisOnline24 aktif. Periode penagihan saat ini hingga ${v.periodEnd}. Anda dapat mengelola langganan kapan saja di pengaturan.`,
      cta: 'Ke akun saya →',
    },
  },

  // ── Hindi ──────────────────────────────────────────────────
  hi: {
    common: {
      greeting: (n) => `नमस्ते ${n},`,
      signoff: 'आपकी PraxisOnline24 टीम',
      footer: 'PraxisOnline24 – आपका क्लिनिक. ऑनलाइन. 24/7.',
    },
    invite: {
      subject: 'आपका PraxisOnline24 डेमो तैयार है',
      body: (v) => `PraxisOnline24 के डेमो का अनुरोध करने के लिए धन्यवाद!\n"${v.practice}" के लिए आपका क्लिनिक खाता तैयार किया गया है। कृपया अब अपना पासवर्ड सेट करें। यह लिंक 24 घंटे के लिए मान्य है।`,
      cta: 'पासवर्ड सेट करें →',
    },
    passwordReset: {
      subject: 'पासवर्ड रीसेट करें – PraxisOnline24',
      body: () => `आपने पासवर्ड रीसेट का अनुरोध किया है।\nनया पासवर्ड सेट करने के लिए नीचे दिए गए बटन पर क्लिक करें। यह लिंक 1 घंटे के लिए मान्य है।\nयदि आपने यह अनुरोध नहीं किया, तो आप इस संदेश को अनदेखा कर सकते हैं।`,
      cta: 'पासवर्ड रीसेट करें →',
    },
    passwordChanged: {
      subject: 'पासवर्ड सफलतापूर्वक बदल दिया गया – PraxisOnline24',
      body: () => `आपका PraxisOnline24 पासवर्ड अभी-अभी सफलतापूर्वक बदल दिया गया है।\nयदि आपने यह बदलाव स्वयं नहीं किया है, तो कृपया तुरंत अपना पासवर्ड रीसेट करें और हमसे संपर्क करें।`,
      cta: 'लॉगिन करें →',
    },
    emailConfirmation: {
      subject: 'कृपया अपना ईमेल पता सत्यापित करें – PraxisOnline24',
      body: () => `अपना PraxisOnline24 खाता सक्रिय करने के लिए कृपया अपना ईमेल पता सत्यापित करें। सत्यापन लिंक 24 घंटे के लिए मान्य है।`,
      cta: 'ईमेल सत्यापित करें →',
    },
    accountActivated: {
      subject: 'आपका PraxisOnline24 खाता सक्रिय हो गया है',
      body: () => `आपका PraxisOnline24 खाता सफलतापूर्वक सक्रिय हो गया है। आप अब लॉगिन करके अपने क्लिनिक का प्रबंधन कर सकते हैं। आपकी 30-दिवसीय परीक्षण अवधि चल रही है।`,
      cta: 'लॉगिन करें →',
    },
    trialStarted: {
      subject: 'आपकी PraxisOnline24 परीक्षण अवधि शुरू हो गई है',
      body: (v) => `PraxisOnline24 में आपका स्वागत है! आपकी 30-दिवसीय परीक्षण अवधि शुरू हो गई है और ${v.trialEndDate} को समाप्त होगी। इस दौरान आप सभी सुविधाओं का निःशुल्क उपयोग कर सकते हैं।`,
      cta: 'डैशबोर्ड पर जाएँ →',
    },
    trialEndingSoon: {
      subject: (v) => `आपकी परीक्षण अवधि ${v.days} दिन में समाप्त होगी – PraxisOnline24`,
      body: (v) => `आपकी PraxisOnline24 परीक्षण अवधि ${v.days} दिन में, ${v.trialEndDate} को समाप्त होगी। PraxisOnline24 का उपयोग जारी रखने के लिए कृपया अपना प्लान अपग्रेड करें।`,
      cta: 'प्लान अपग्रेड करें →',
    },
    trialExpired: {
      subject: 'आपकी परीक्षण अवधि समाप्त हो गई है – PraxisOnline24',
      body: () => `आपकी PraxisOnline24 परीक्षण अवधि समाप्त हो गई है। PraxisOnline24 का उपयोग जारी रखने के लिए कृपया अपना प्लान अपग्रेड करें। अन्यथा आपका खाता 7 दिनों में रोक दिया जाएगा।`,
      cta: 'अभी अपग्रेड करें →',
    },
    contactConfirmation: {
      subject: 'हमें आपका संदेश मिल गया है – PraxisOnline24',
      body: () => `हमारे संपर्क फ़ॉर्म के माध्यम से आपके संदेश के लिए धन्यवाद। हमें आपका अनुरोध मिल गया है और हम 1–2 कार्यदिवसों के भीतर आपसे संपर्क करेंगे।`,
    },
    subscriptionConfirmation: {
      subject: (v) => `सदस्यता पुष्टि: ${v.plan} – PraxisOnline24`,
      body: (v) => `धन्यवाद! PraxisOnline24 पर आपकी ${v.plan} सदस्यता सक्रिय है। वर्तमान बिलिंग अवधि ${v.periodEnd} तक। आप अपनी सदस्यता को कभी भी सेटिंग्स में प्रबंधित कर सकते हैं।`,
      cta: 'मेरे खाते पर जाएँ →',
    },
  },

  // ── Chinesisch (vereinfacht) ───────────────────────────────
  zh: {
    common: {
      greeting: (n) => `您好，${n}，`,
      signoff: 'PraxisOnline24 团队',
      footer: 'PraxisOnline24 – 您的诊所。在线。全天候。',
    },
    invite: {
      subject: '您的 PraxisOnline24 演示已就绪',
      body: (v) => `感谢您申请 PraxisOnline24 演示！\n您为 "${v.practice}" 准备的诊所账户已就绪。请立即设置您的密码。该链接 24 小时内有效。`,
      cta: '设置密码 →',
    },
    passwordReset: {
      subject: '重置密码 – PraxisOnline24',
      body: () => `您请求了密码重置。\n请点击下方按钮设置新密码。该链接 1 小时内有效。\n如果您没有提出此请求，可以忽略此消息。`,
      cta: '重置密码 →',
    },
    passwordChanged: {
      subject: '密码修改成功 – PraxisOnline24',
      body: () => `您的 PraxisOnline24 密码刚刚修改成功。\n如果不是您本人操作，请立即重置密码并联系我们。`,
      cta: '登录 →',
    },
    emailConfirmation: {
      subject: '请确认您的邮箱地址 – PraxisOnline24',
      body: () => `请确认您的邮箱地址以激活您的 PraxisOnline24 账户。确认链接 24 小时内有效。`,
      cta: '确认邮箱 →',
    },
    accountActivated: {
      subject: '您的 PraxisOnline24 账户已激活',
      body: () => `您的 PraxisOnline24 账户已成功激活。您现在可以登录并管理您的诊所。您的 30 天试用期已开始。`,
      cta: '登录 →',
    },
    trialStarted: {
      subject: '您的 PraxisOnline24 试用期已开始',
      body: (v) => `欢迎使用 PraxisOnline24！您的 30 天试用期已开始，将于 ${v.trialEndDate} 结束。在此期间您可以免费使用所有功能。`,
      cta: '进入控制面板 →',
    },
    trialEndingSoon: {
      subject: (v) => `您的试用期将在 ${v.days} 天后结束 – PraxisOnline24`,
      body: (v) => `您的 PraxisOnline24 试用期将在 ${v.days} 天后，即 ${v.trialEndDate} 结束。要继续使用 PraxisOnline24，请升级您的套餐。`,
      cta: '升级套餐 →',
    },
    trialExpired: {
      subject: '您的试用期已结束 – PraxisOnline24',
      body: () => `您的 PraxisOnline24 试用期已结束。请升级您的套餐以继续使用 PraxisOnline24。否则您的账户将在 7 天后被暂停。`,
      cta: '立即升级 →',
    },
    contactConfirmation: {
      subject: '我们已收到您的留言 – PraxisOnline24',
      body: () => `感谢您通过我们的联系表单发送的消息。我们已收到您的请求，将在 1–2 个工作日内回复您。`,
    },
    subscriptionConfirmation: {
      subject: (v) => `订阅确认：${v.plan} – PraxisOnline24`,
      body: (v) => `感谢您！您在 PraxisOnline24 的 ${v.plan} 订阅已激活。当前计费周期至 ${v.periodEnd}。您可以随时在设置中管理您的订阅。`,
      cta: '进入我的账户 →',
    },
  },

  // ── Thai ───────────────────────────────────────────────────
  th: {
    common: {
      greeting: (n) => `สวัสดี ${n},`,
      signoff: 'ทีม PraxisOnline24',
      footer: 'PraxisOnline24 – คลินิกของคุณ ออนไลน์ ตลอด 24 ชั่วโมง',
    },
    invite: {
      subject: 'การสาธิต PraxisOnline24 ของคุณพร้อมแล้ว',
      body: (v) => `ขอบคุณที่ขอใช้บริการสาธิต PraxisOnline24!\nบัญชีคลินิกสำหรับ "${v.practice}" ได้รับการเตรียมไว้แล้ว กรุณาตั้งรหัสผ่านของคุณตอนนี้ ลิงก์นี้ใช้ได้ 24 ชั่วโมง`,
      cta: 'ตั้งรหัสผ่าน →',
    },
    passwordReset: {
      subject: 'รีเซ็ตรหัสผ่าน – PraxisOnline24',
      body: () => `คุณได้ขอรีเซ็ตรหัสผ่าน\nคลิกปุ่มด้านล่างเพื่อกำหนดรหัสผ่านใหม่ ลิงก์นี้ใช้ได้ 1 ชั่วโมง\nหากคุณไม่ได้ทำการร้องขอนี้ คุณสามารถละเว้นข้อความนี้ได้`,
      cta: 'รีเซ็ตรหัสผ่าน →',
    },
    passwordChanged: {
      subject: 'เปลี่ยนรหัสผ่านเรียบร้อยแล้ว – PraxisOnline24',
      body: () => `รหัสผ่าน PraxisOnline24 ของคุณเพิ่งถูกเปลี่ยนเรียบร้อยแล้ว\nหากคุณไม่ได้ทำการเปลี่ยนแปลงนี้ด้วยตัวเอง โปรดรีเซ็ตรหัสผ่านทันทีและติดต่อเรา`,
      cta: 'เข้าสู่ระบบ →',
    },
    emailConfirmation: {
      subject: 'โปรดยืนยันที่อยู่อีเมลของคุณ – PraxisOnline24',
      body: () => `โปรดยืนยันที่อยู่อีเมลของคุณเพื่อเปิดใช้งานบัญชี PraxisOnline24 ลิงก์ยืนยันใช้ได้ 24 ชั่วโมง`,
      cta: 'ยืนยันอีเมล →',
    },
    accountActivated: {
      subject: 'บัญชี PraxisOnline24 ของคุณถูกเปิดใช้งานแล้ว',
      body: () => `บัญชี PraxisOnline24 ของคุณถูกเปิดใช้งานเรียบร้อยแล้ว คุณสามารถเข้าสู่ระบบและจัดการคลินิกของคุณได้ ช่วงทดลองใช้ 30 วันของคุณกำลังดำเนินอยู่`,
      cta: 'เข้าสู่ระบบ →',
    },
    trialStarted: {
      subject: 'ช่วงทดลองใช้ PraxisOnline24 ของคุณเริ่มต้นแล้ว',
      body: (v) => `ยินดีต้อนรับสู่ PraxisOnline24! ช่วงทดลองใช้ 30 วันของคุณเริ่มต้นแล้วและจะสิ้นสุดในวันที่ ${v.trialEndDate} ในช่วงเวลานี้คุณสามารถใช้ฟีเจอร์ทั้งหมดได้ฟรี`,
      cta: 'ไปที่แดชบอร์ด →',
    },
    trialEndingSoon: {
      subject: (v) => `ช่วงทดลองใช้ของคุณจะสิ้นสุดใน ${v.days} วัน – PraxisOnline24`,
      body: (v) => `ช่วงทดลองใช้ PraxisOnline24 ของคุณจะสิ้นสุดใน ${v.days} วัน คือวันที่ ${v.trialEndDate} เพื่อใช้ PraxisOnline24 ต่อไป โปรดอัปเกรดแพ็กเกจของคุณ`,
      cta: 'อัปเกรดแพ็กเกจ →',
    },
    trialExpired: {
      subject: 'ช่วงทดลองใช้ของคุณสิ้นสุดแล้ว – PraxisOnline24',
      body: () => `ช่วงทดลองใช้ PraxisOnline24 ของคุณสิ้นสุดแล้ว โปรดอัปเกรดแพ็กเกจของคุณเพื่อใช้ PraxisOnline24 ต่อไป มิฉะนั้นบัญชีของคุณจะถูกพักภายใน 7 วัน`,
      cta: 'อัปเกรดทันที →',
    },
    contactConfirmation: {
      subject: 'เราได้รับข้อความของคุณแล้ว – PraxisOnline24',
      body: () => `ขอบคุณสำหรับข้อความของคุณผ่านแบบฟอร์มติดต่อของเรา เราได้รับคำขอของคุณแล้วและจะติดต่อกลับภายใน 1–2 วันทำการ`,
    },
    subscriptionConfirmation: {
      subject: (v) => `ยืนยันการสมัครสมาชิก: ${v.plan} – PraxisOnline24`,
      body: (v) => `ขอบคุณ! การสมัครสมาชิก ${v.plan} ของคุณบน PraxisOnline24 เปิดใช้งานแล้ว รอบการเรียกเก็บเงินปัจจุบันถึง ${v.periodEnd} คุณสามารถจัดการการสมัครสมาชิกได้ตลอดเวลาในการตั้งค่า`,
      cta: 'ไปที่บัญชีของฉัน →',
    },
  },
};

// Rechnungs-/Zahlungs-Mail-Typen aus separater Datei mergen, damit diese
// Datei nicht weiter wächst. Selbe Sprach-Liste, ergänzt um 7 neue Typen.
const invoiceLocales = require('./emailLocalesInvoice');
for (const lang of Object.keys(invoiceLocales)) {
  if (emailLocales[lang]) {
    Object.assign(emailLocales[lang], invoiceLocales[lang]);
  }
}

// Patienten-Erinnerungs-Mails ebenfalls aus separater Datei mergen.
const patientLocales = require('./emailLocalesPatient');
for (const lang of Object.keys(patientLocales)) {
  if (emailLocales[lang]) {
    Object.assign(emailLocales[lang], patientLocales[lang]);
  }
}

// Praxis-Admin-/Betriebs-Mails ebenfalls mergen.
const adminLocales = require('./emailLocalesAdmin');
for (const lang of Object.keys(adminLocales)) {
  if (emailLocales[lang]) {
    Object.assign(emailLocales[lang], adminLocales[lang]);
  }
}

const SUPPORTED_EMAIL_LANGS = Object.keys(emailLocales);

// Liste aller Mail-Typen aus dem de-Lokale ableiten (ohne common).
const EMAIL_TYPES = Object.keys(emailLocales.de).filter((k) => k !== 'common');

module.exports = {
  emailLocales,
  SUPPORTED_EMAIL_LANGS,
  EMAIL_TYPES,
};
