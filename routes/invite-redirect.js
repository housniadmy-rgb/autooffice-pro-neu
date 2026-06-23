// routes/invite-redirect.js
// Kurzer Invite-Link für die Einladungs-E-Mail. Statt der langen URL
//   https://praxisonline24.onrender.com/set-password.html?token=<64-hex>&lang=es
// trägt die Mail jetzt nur noch
//   https://praxisonline24.onrender.com/i/<64-hex>
// → kein ?, kein & → keine Line-Break-Stellen, die Mobile-Mail-Clients
// dazu bringen, den Link mehrzeilig zu rendern und damit klick-untauglich
// zu machen.
//
// Diese Route schaut die zur Einladung gespeicherte Sprache nach und macht
// einen 302-Redirect auf die lokalisierte set-password.html. Bei
// unbekanntem/abgelaufenem Token wird trotzdem redirected – set-password.html
// zeigt dann den lokalisierten "Link ungültig"-Fehler.

const express = require('express');
const crypto = require('crypto');
const { getDb } = require('../database');

const router = express.Router();
const db = new Proxy({}, { get: (_, p) => (...args) => getDb()[p](...args) });

router.get('/:token', (req, res) => {
  const raw = String(req.params.token || '');
  let lang = 'de';

  // Nur "echte" Token-Form akzeptieren → schützt vor Müll-Lookups in der DB
  if (/^[a-f0-9]{32,128}$/i.test(raw)) {
    try {
      const tokenHash = crypto.createHash('sha256').update(raw).digest('hex');
      const row = db.prepare('SELECT language FROM invite_tokens WHERE token_hash = ?').get(tokenHash);
      if (row && row.language) lang = row.language;
    } catch (err) {
      console.error('[invite-redirect] DB-Lookup-Fehler:', err && err.message ? err.message : err);
      // Fallback auf 'de' – set-password.html fällt selbst noch auf 'en'
      // zurück, wenn lang dort unbekannt ist.
    }
  }

  // encodeURIComponent ist defensiv: raw und lang sind kontrolliert, aber
  // wir vermeiden hier ALLE Sonderzeichen-Effekte im Redirect-Target.
  const target = `/set-password.html?token=${encodeURIComponent(raw)}&lang=${encodeURIComponent(lang)}`;
  res.redirect(302, target);
});

module.exports = router;
