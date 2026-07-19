const { getDb } = require('../database');
const { t, getLang } = require('../utils/language');

// Role hierarchy: admin > doctor > staff > patient
const ROLE_LEVEL = { admin: 40, doctor: 30, staff: 20, patient: 10 };

function requireAuth(req, res, next) {
  if (req.session && req.session.userId) {
    return next();
  }
  // API routes always get 401 — never redirect
  if (req.originalUrl.startsWith('/api') || req.xhr || req.headers.accept?.includes('application/json')) {
    return res.status(401).json({ error: t('err_not_logged_in', getLang(req)) });
  }
  return res.redirect('/login.html');
}

// requireRole('admin') → only admins
// requireRole('staff') → staff, doctor, admin
function requireRole(role) {
  return (req, res, next) => {
    if (!req.session || !req.session.userId) {
      // API routes always get 401 — never redirect
      if (req.originalUrl.startsWith('/api') || req.xhr || req.headers.accept?.includes('application/json')) {
        return res.status(401).json({ error: t('err_not_logged_in', getLang(req)) });
      }
      return res.redirect('/login.html');
    }
    const userLevel = ROLE_LEVEL[req.session.userRole] || 0;
    const requiredLevel = ROLE_LEVEL[role] || 0;
    if (userLevel < requiredLevel) {
      return res.status(403).json({ error: t('err_not_authorized_role', getLang(req)) });
    }
    next();
  };
}

// Shorthand: only admin role
const requireAdmin = requireRole('admin');

function requireActiveAccount(req, res, next) {
  const practiceId = req.session && req.session.practiceId;
  if (!practiceId) return next();

  const db = getDb();
  const practice = db.prepare('SELECT account_status FROM practices WHERE id = ?').get(practiceId);

  if (practice && practice.account_status === 'paused') {
    return res.status(402).json({
      error: t('err_account_paused', getLang(req)),
      account_status: 'paused',
    });
  }
  next();
}

module.exports = { requireAuth, requireRole, requireAdmin, requireActiveAccount };
