const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { requireAuth } = require('../middleware/auth');
const { getDb } = require('../database');
const db = new Proxy({}, { get: (_, p) => (...args) => getDb()[p](...args) });

const router = express.Router();

router.post('/log', requireAuth, (req, res) => {
  const { practitioner_id, patient_first_name, patient_last_name } = req.body;

  if (!practitioner_id || !patient_first_name || !patient_last_name) {
    return res.status(400).json({ error: 'Pflichtfelder fehlen' });
  }

  const practitioner = db.prepare('SELECT id FROM practitioners WHERE id = ? AND practice_id = ?').get(practitioner_id, req.session.practiceId);
  if (!practitioner) return res.status(404).json({ error: 'Behandler nicht gefunden' });

  const id = uuidv4();
  db.prepare(`
    INSERT INTO recipe_print_logs (id, practice_id, practitioner_id, patient_first_name, patient_last_name, printed_by)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, req.session.practiceId, practitioner_id, patient_first_name, patient_last_name, req.session.userEmail);

  res.status(201).json({ success: true, id });
});

function getLogs(practiceId) {
  return db.prepare(`
    SELECT r.*, pr.first_name as practitioner_first_name, pr.last_name as practitioner_last_name
    FROM recipe_print_logs r
    JOIN practitioners pr ON r.practitioner_id = pr.id
    WHERE r.practice_id = ?
    ORDER BY r.printed_at DESC
  `).all(practiceId);
}

router.get('/', requireAuth, (req, res) => {
  res.json(getLogs(req.session.practiceId));
});

router.get('/logs', requireAuth, (req, res) => {
  res.json(getLogs(req.session.practiceId));
});

module.exports = router;
