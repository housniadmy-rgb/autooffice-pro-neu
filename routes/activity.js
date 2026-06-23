const express = require('express');
const { requireAdmin } = require('../middleware/auth');
const { getDb } = require('../database');
const db = new Proxy({}, { get: (_, p) => (...args) => getDb()[p](...args) });

const router = express.Router();

router.get('/', requireAdmin, (req, res) => {
  const limit = Math.min(parseInt(req.query.limit || '100'), 500);
  const entries = db.prepare(`
    SELECT * FROM activity_log
    WHERE practice_id = ?
    ORDER BY created_at DESC
    LIMIT ?
  `).all(req.session.practiceId, limit);
  res.json(entries);
});

module.exports = router;
