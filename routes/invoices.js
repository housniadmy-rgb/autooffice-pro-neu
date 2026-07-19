const express = require('express');
const { v4: uuidv4 } = require('uuid');
const moment = require('moment');
const { requireAuth } = require('../middleware/auth');
const { generateInvoicePDF } = require('../utils/pdf');
const { getDb } = require('../database');
const { t, getLang } = require('../utils/language');
const db = new Proxy({}, { get: (_, p) => (...args) => getDb()[p](...args) });

const router = express.Router();

router.get('/', requireAuth, (req, res) => {
  const { status } = req.query;
  let query = 'SELECT * FROM invoices WHERE practice_id = ?';
  const params = [req.session.practiceId];

  if (status) { query += ' AND status = ?'; params.push(status); }
  query += ' ORDER BY created_at DESC';

  res.json(db.prepare(query).all(...params));
});

router.get('/:id', requireAuth, (req, res) => {
  const invoice = db.prepare('SELECT * FROM invoices WHERE id = ? AND practice_id = ?').get(req.params.id, req.session.practiceId);
  if (!invoice) return res.status(404).json({ error: t('err_invoice_not_found', getLang(req)) });
  res.json(invoice);
});

router.get('/:id/pdf', requireAuth, (req, res) => {
  const invoice = db.prepare('SELECT * FROM invoices WHERE id = ? AND practice_id = ?').get(req.params.id, req.session.practiceId);
  if (!invoice) return res.status(404).json({ error: t('err_invoice_not_found', getLang(req)) });

  const practice = db.prepare('SELECT * FROM practices WHERE id = ?').get(req.session.practiceId);
  const cookieLang = req.cookies && req.cookies.lang;
  generateInvoicePDF(invoice, practice, res, { lang: cookieLang });
});

router.post('/', requireAuth, (req, res) => {
  const { appointment_id, patient_first_name, patient_last_name, patient_address, items, amount, tax_rate, invoice_date, due_date, notes } = req.body;

  if (!patient_first_name || !patient_last_name || !amount || !invoice_date) {
    return res.status(400).json({ error: t('err_required_fields_missing', getLang(req)) });
  }

  const id = uuidv4();
  const taxRate = parseFloat(tax_rate || 0);
  const baseAmount = parseFloat(amount);
  const taxAmount = baseAmount * (taxRate / 100);
  const totalAmount = baseAmount + taxAmount;
  const year = moment(invoice_date).format('YYYY');
  const count = db.prepare('SELECT COUNT(*) as c FROM invoices WHERE practice_id = ?').get(req.session.practiceId).c + 1;
  const invoiceNumber = `${year}-${String(count).padStart(4, '0')}`;

  db.prepare(`
    INSERT INTO invoices (id, invoice_number, practice_id, appointment_id, patient_first_name, patient_last_name, patient_address, items, amount, tax_rate, tax_amount, total_amount, invoice_date, due_date, notes, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft')
  `).run(id, invoiceNumber, req.session.practiceId, appointment_id || null, patient_first_name, patient_last_name, patient_address || null, items ? JSON.stringify(items) : null, baseAmount, taxRate, taxAmount, totalAmount, invoice_date, due_date || null, notes || null);

  res.status(201).json(db.prepare('SELECT * FROM invoices WHERE id = ? AND practice_id = ?').get(id, req.session.practiceId));
});

router.put('/:id', requireAuth, (req, res) => {
  const invoice = db.prepare('SELECT * FROM invoices WHERE id = ? AND practice_id = ?').get(req.params.id, req.session.practiceId);
  if (!invoice) return res.status(404).json({ error: t('err_invoice_not_found', getLang(req)) });

  const { status, notes, due_date } = req.body;

  db.prepare(`
    UPDATE invoices SET
      status = COALESCE(?, status),
      notes = COALESCE(?, notes),
      due_date = COALESCE(?, due_date)
    WHERE id = ? AND practice_id = ?
  `).run(status || null, notes || null, due_date || null, req.params.id, req.session.practiceId);

  res.json(db.prepare('SELECT * FROM invoices WHERE id = ? AND practice_id = ?').get(req.params.id, req.session.practiceId));
});

module.exports = router;
