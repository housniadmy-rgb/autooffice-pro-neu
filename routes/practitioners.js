const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { getDb } = require('../database');
const { t, getLang } = require('../utils/language');
const db = new Proxy({}, { get: (_, p) => (...args) => getDb()[p](...args) });

const router = express.Router();

router.get('/', requireAuth, (req, res) => {
  const practitioners = db.prepare('SELECT * FROM practitioners WHERE practice_id = ? ORDER BY last_name ASC').all(req.session.practiceId);
  res.json(practitioners);
});

router.get('/:id', requireAuth, (req, res) => {
  const practitioner = db.prepare('SELECT * FROM practitioners WHERE id = ? AND practice_id = ?').get(req.params.id, req.session.practiceId);
  if (!practitioner) return res.status(404).json({ error: t('err_practitioner_not_found', getLang(req)) });
  res.json(practitioner);
});

router.post('/', requireAuth, (req, res) => {
  const { first_name, last_name, title, specialty, email, phone, bio } = req.body;

  if (!first_name || !last_name) {
    return res.status(400).json({ error: t('err_first_last_name_required', getLang(req)) });
  }

  const practice = db.prepare('SELECT package FROM practices WHERE id = ?').get(req.session.practiceId);
  if (practice && practice.package !== 'UNLIMITED') {
    const activeCount = db.prepare(
      'SELECT COUNT(*) as count FROM practitioners WHERE practice_id = ? AND active = 1'
    ).get(req.session.practiceId);
    if (activeCount.count >= 3) {
      return res.status(403).json({ error: t('err_practitioner_limit_basic', getLang(req)) });
    }
  }

  const id = uuidv4();
  db.prepare(`
    INSERT INTO practitioners (id, practice_id, first_name, last_name, title, specialty, email, phone, bio, active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
  `).run(id, req.session.practiceId, first_name, last_name, title || null, specialty || null, email || null, phone || null, bio || null);

  res.status(201).json(db.prepare('SELECT * FROM practitioners WHERE id = ? AND practice_id = ?').get(id, req.session.practiceId));
});

router.put('/:id', requireAuth, (req, res) => {
  const practitioner = db.prepare('SELECT * FROM practitioners WHERE id = ? AND practice_id = ?').get(req.params.id, req.session.practiceId);
  if (!practitioner) return res.status(404).json({ error: t('err_practitioner_not_found', getLang(req)) });

  const { first_name, last_name, title, specialty, email, phone, bio, active } = req.body;

  db.prepare(`
    UPDATE practitioners SET
      first_name = COALESCE(?, first_name),
      last_name = COALESCE(?, last_name),
      title = COALESCE(?, title),
      specialty = COALESCE(?, specialty),
      email = COALESCE(?, email),
      phone = COALESCE(?, phone),
      bio = COALESCE(?, bio),
      active = COALESCE(?, active)
    WHERE id = ? AND practice_id = ?
  `).run(first_name || null, last_name || null, title || null, specialty || null, email || null, phone || null, bio || null, active !== undefined ? active : null, req.params.id, req.session.practiceId);

  res.json(db.prepare('SELECT * FROM practitioners WHERE id = ? AND practice_id = ?').get(req.params.id, req.session.practiceId));
});

router.delete('/:id', requireAdmin, (req, res) => {
  const practitioner = db.prepare('SELECT * FROM practitioners WHERE id = ? AND practice_id = ?').get(req.params.id, req.session.practiceId);
  if (!practitioner) return res.status(404).json({ error: t('err_practitioner_not_found', getLang(req)) });

  db.prepare('UPDATE practitioners SET active = 0 WHERE id = ? AND practice_id = ?').run(req.params.id, req.session.practiceId);
  res.json({ success: true });
});

// ── Verfügbarkeiten ───────────────────────────────────────

router.get('/:id/availability', requireAuth, (req, res) => {
  const practitioner = db.prepare('SELECT id FROM practitioners WHERE id = ? AND practice_id = ?').get(req.params.id, req.session.practiceId);
  if (!practitioner) return res.status(404).json({ error: t('err_practitioner_not_found', getLang(req)) });

  const slots = db.prepare('SELECT * FROM practitioner_availability WHERE practitioner_id = ? ORDER BY day_of_week ASC, start_time ASC').all(req.params.id);
  res.json(slots);
});

router.put('/:id/availability', requireAuth, (req, res) => {
  const practitioner = db.prepare('SELECT id FROM practitioners WHERE id = ? AND practice_id = ?').get(req.params.id, req.session.practiceId);
  if (!practitioner) return res.status(404).json({ error: t('err_practitioner_not_found', getLang(req)) });

  const { slots } = req.body;
  if (!Array.isArray(slots)) return res.status(400).json({ error: t('err_slots_must_be_array', getLang(req)) });

  for (const s of slots) {
    if (typeof s.day_of_week !== 'number' || s.day_of_week < 0 || s.day_of_week > 6) {
      return res.status(400).json({ error: t('err_day_of_week_range', getLang(req)) });
    }
    if (!s.start_time || !s.end_time || s.start_time >= s.end_time) {
      return res.status(400).json({ error: t('err_invalid_start_end_time', getLang(req)) });
    }
  }

  const deleteAll = db.prepare('DELETE FROM practitioner_availability WHERE practitioner_id = ?');
  const insert = db.prepare('INSERT INTO practitioner_availability (id, practitioner_id, day_of_week, start_time, end_time) VALUES (?, ?, ?, ?, ?)');

  const transaction = db.transaction(() => {
    deleteAll.run(req.params.id);
    for (const s of slots) {
      insert.run(uuidv4(), req.params.id, s.day_of_week, s.start_time, s.end_time);
    }
  });
  transaction();

  const updated = db.prepare('SELECT * FROM practitioner_availability WHERE practitioner_id = ? ORDER BY day_of_week ASC, start_time ASC').all(req.params.id);
  res.json(updated);
});

module.exports = router;
