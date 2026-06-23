require('dotenv').config();
const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');

const { init } = require('./database');

async function main() {
  const db = await init();

  const app = express();
  const PORT = process.env.PORT || 3000;
  const isProd = process.env.NODE_ENV === 'production';

  if (isProd && (!process.env.SESSION_SECRET || process.env.SESSION_SECRET === 'change-me')) {
    console.error('⚠️  WARNUNG: SESSION_SECRET ist nicht gesetzt oder unsicher. Bitte in den Umgebungsvariablen setzen.');
  }

  // Render und andere Reverse-Proxies leiten HTTPS → HTTP weiter
  if (isProd) app.set('trust proxy', 1);

  app.disable('x-powered-by');

  const { securityHeaders } = require('./middleware/security');
  app.use(securityHeaders);

  // Static files served early – before session/CORS – so CSS/JS never hit heavy middleware
  app.use(express.static(path.join(__dirname, 'public'), {
    etag: true,
    lastModified: true,
    index: 'index.html',
  }));

  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  app.use(session({
    secret: process.env.SESSION_SECRET || 'praxisonline24-dev-secret-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: isProd,   // in Produktion nur über HTTPS
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    },
  }));

  const { requireActiveAccount } = require('./middleware/auth');

  app.use('/api/auth', require('./routes/auth'));
  app.use('/api/dashboard', require('./routes/dashboard'));
  // /api/practices and /api/auth are always accessible (settings + login)
  app.use('/api/practices', require('./routes/practices'));
  // All other admin routes require an active (non-paused) account
  app.use('/api/appointments', requireActiveAccount, require('./routes/appointments'));
  app.use('/api/reviews', requireActiveAccount, require('./routes/reviews'));
  app.use('/api/invoices', requireActiveAccount, require('./routes/invoices'));
  app.use('/api/recipes', requireActiveAccount, require('./routes/recipes'));
  app.use('/api/practitioners', requireActiveAccount, require('./routes/practitioners'));
  app.use('/api/patients', requireActiveAccount, require('./routes/patients'));
  app.use('/api/payments', requireActiveAccount, require('./routes/payments'));
  app.use('/api/waitlist', requireActiveAccount, require('./routes/waitlist'));
  app.use('/api/public', require('./routes/public'));
  app.use('/api/demo', require('./routes/demo'));
  app.use('/api/owner', require('./routes/owner'));
  // Kurz-Link für Einladungs-Mails: /i/<token> → 302 → /set-password.html?token=…&lang=…
  app.use('/i', require('./routes/invite-redirect'));
  app.use('/api/activity-log', requireActiveAccount, require('./routes/activity'));
  app.use('/api/ai-praxismanager', requireActiveAccount, require('./routes/ai-praxismanager'));

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', app: 'PraxisOnline24' });
  });

  const { startCronJobs } = require('./utils/cron');
  const { getDb } = require('./database');
  startCronJobs(getDb());

  app.listen(PORT, () => {
    console.log(`PraxisOnline24 läuft auf http://localhost:${PORT}`);
    // Mail-Konfiguration einmalig prüfen – non-blocking, Ergebnis nur ins Log.
    require('./utils/email').verifyMailConfig().catch(() => {});
  });
}

main().catch((err) => {
  console.error('Startfehler:', err);
  process.exit(1);
});
