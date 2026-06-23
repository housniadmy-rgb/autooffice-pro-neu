const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { requireAuth } = require('../middleware/auth');
const { getDb } = require('../database');
const db = new Proxy({}, { get: (_, p) => (...args) => getDb()[p](...args) });

const router = express.Router();

router.get('/', requireAuth, (req, res) => {
  const payments = db.prepare(`
    SELECT p.*, i.invoice_number, i.patient_first_name, i.patient_last_name
    FROM payments p
    JOIN invoices i ON p.invoice_id = i.id
    WHERE i.practice_id = ?
    ORDER BY p.created_at DESC
  `).all(req.session.practiceId);

  res.json(payments);
});

router.get('/:id', requireAuth, (req, res) => {
  const payment = db.prepare(`
    SELECT p.*, i.invoice_number, i.patient_first_name, i.patient_last_name
    FROM payments p
    JOIN invoices i ON p.invoice_id = i.id
    WHERE p.id = ? AND i.practice_id = ?
  `).get(req.params.id, req.session.practiceId);

  if (!payment) return res.status(404).json({ error: 'Zahlung nicht gefunden' });
  res.json(payment);
});

router.post('/', requireAuth, (req, res) => {
  const { invoice_id, amount, payment_date, payment_method, transaction_id, notes } = req.body;

  if (!invoice_id || !amount || !payment_date) {
    return res.status(400).json({ error: 'Pflichtfelder fehlen' });
  }

  const invoice = db.prepare('SELECT * FROM invoices WHERE id = ? AND practice_id = ?').get(invoice_id, req.session.practiceId);
  if (!invoice) return res.status(404).json({ error: 'Rechnung nicht gefunden' });

  const id = uuidv4();
  db.prepare(`
    INSERT INTO payments (id, invoice_id, amount, payment_date, payment_method, status, transaction_id, notes)
    VALUES (?, ?, ?, ?, ?, 'completed', ?, ?)
  `).run(id, invoice_id, parseFloat(amount), payment_date, payment_method || null, transaction_id || null, notes || null);

  db.prepare("UPDATE invoices SET status = 'paid' WHERE id = ?").run(invoice_id);

  res.status(201).json(db.prepare('SELECT * FROM payments WHERE id = ?').get(id));
});

module.exports = router;
