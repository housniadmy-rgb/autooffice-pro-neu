const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { requireAuth } = require('../middleware/auth');
const { getDb } = require('../database');
const db = new Proxy({}, { get: (_, p) => (...args) => getDb()[p](...args) });

const router = express.Router();

router.get('/', requireAuth, (req, res) => {
  const reviews = db.prepare('SELECT * FROM reviews WHERE practice_id = ? ORDER BY created_at DESC').all(req.session.practiceId);
  res.json(reviews);
});

router.post('/', (req, res) => {
  const { practice_id, practitioner_id, appointment_id, rating, comment, author_name } = req.body;

  if (!practice_id || !rating) return res.status(400).json({ error: 'practice_id und rating erforderlich' });
  if (rating < 1 || rating > 5) return res.status(400).json({ error: 'Bewertung muss zwischen 1 und 5 liegen' });

  const practiceExists = db.prepare('SELECT id FROM practices WHERE id = ?').get(practice_id);
  if (!practiceExists) return res.status(404).json({ error: 'Praxis nicht gefunden' });

  const id = uuidv4();
  db.prepare(`
    INSERT INTO reviews (id, practice_id, practitioner_id, appointment_id, rating, comment, author_name, visible)
    VALUES (?, ?, ?, ?, ?, ?, ?, 0)
  `).run(id, practice_id, practitioner_id || null, appointment_id || null, parseInt(rating), comment || null, author_name || null);

  res.status(201).json({ success: true, id });
});

router.put('/:id/approve', requireAuth, (req, res) => {
  const review = db.prepare('SELECT * FROM reviews WHERE id = ? AND practice_id = ?').get(req.params.id, req.session.practiceId);
  if (!review) return res.status(404).json({ error: 'Bewertung nicht gefunden' });

  db.prepare('UPDATE reviews SET visible = 1 WHERE id = ? AND practice_id = ?').run(req.params.id, req.session.practiceId);
  res.json({ success: true });
});

router.put('/:id/hide', requireAuth, (req, res) => {
  const review = db.prepare('SELECT * FROM reviews WHERE id = ? AND practice_id = ?').get(req.params.id, req.session.practiceId);
  if (!review) return res.status(404).json({ error: 'Bewertung nicht gefunden' });

  db.prepare('UPDATE reviews SET visible = 0 WHERE id = ? AND practice_id = ?').run(req.params.id, req.session.practiceId);
  res.json({ success: true });
});

router.delete('/:id', requireAuth, (req, res) => {
  const review = db.prepare('SELECT * FROM reviews WHERE id = ? AND practice_id = ?').get(req.params.id, req.session.practiceId);
  if (!review) return res.status(404).json({ error: 'Bewertung nicht gefunden' });

  db.prepare('DELETE FROM reviews WHERE id = ? AND practice_id = ?').run(req.params.id, req.session.practiceId);
  res.json({ success: true });
});

module.exports = router;
