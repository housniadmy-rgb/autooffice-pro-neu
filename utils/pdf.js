const PDFDocument = require('pdfkit');
const moment = require('moment');

function generateInvoicePDF(invoice, practice, res) {
  const doc = new PDFDocument({ margin: 50, size: 'A4' });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="Rechnung_${invoice.invoice_number || invoice.id}.pdf"`);
  doc.pipe(res);

  doc.fontSize(20).font('Helvetica-Bold').text('RECHNUNG', { align: 'right' });
  doc.moveDown(0.5);

  doc.fontSize(10).font('Helvetica');
  doc.text(`Rechnungsnummer: ${invoice.invoice_number || invoice.id}`, { align: 'right' });
  doc.text(`Datum: ${moment(invoice.invoice_date).format('DD.MM.YYYY')}`, { align: 'right' });
  if (invoice.due_date) {
    doc.text(`Fällig am: ${moment(invoice.due_date).format('DD.MM.YYYY')}`, { align: 'right' });
  }

  doc.moveDown(1);
  doc.fontSize(14).font('Helvetica-Bold').text(practice.name || '');
  doc.fontSize(10).font('Helvetica');
  if (practice.address) doc.text(practice.address);
  if (practice.zip || practice.city) doc.text(`${practice.zip || ''} ${practice.city || ''}`.trim());
  if (practice.phone) doc.text(`Tel.: ${practice.phone}`);
  if (practice.email) doc.text(practice.email);

  doc.moveDown(1.5);
  doc.fontSize(12).font('Helvetica-Bold').text('Empfänger:');
  doc.fontSize(10).font('Helvetica');
  doc.text(`${invoice.patient_first_name} ${invoice.patient_last_name}`);
  if (invoice.patient_address) doc.text(invoice.patient_address);

  doc.moveDown(1.5);

  const tableTop = doc.y;
  const colPos = [50, 300, 400, 480];

  doc.fontSize(10).font('Helvetica-Bold');
  doc.text('Leistung', colPos[0], tableTop);
  doc.text('Betrag', colPos[2], tableTop, { width: 80, align: 'right' });

  doc.moveTo(50, tableTop + 15).lineTo(545, tableTop + 15).stroke();

  let currentY = tableTop + 25;
  doc.font('Helvetica');

  let items = [];
  try {
    items = invoice.items ? JSON.parse(invoice.items) : [];
  } catch {
    items = [];
  }

  if (items.length > 0) {
    items.forEach((item) => {
      doc.text(item.description || '', colPos[0], currentY, { width: 240 });
      doc.text(`${parseFloat(item.amount || 0).toFixed(2)} €`, colPos[2], currentY, { width: 80, align: 'right' });
      currentY += 20;
    });
  } else {
    doc.text('Arztleistungen', colPos[0], currentY, { width: 240 });
    doc.text(`${parseFloat(invoice.amount).toFixed(2)} €`, colPos[2], currentY, { width: 80, align: 'right' });
    currentY += 20;
  }

  doc.moveTo(50, currentY + 5).lineTo(545, currentY + 5).stroke();
  currentY += 15;

  doc.font('Helvetica-Bold');
  if (invoice.tax_rate > 0) {
    doc.text('Netto:', 380, currentY);
    doc.text(`${parseFloat(invoice.amount).toFixed(2)} €`, colPos[2], currentY, { width: 80, align: 'right' });
    currentY += 18;
    doc.font('Helvetica');
    doc.text(`MwSt. ${invoice.tax_rate}%:`, 380, currentY);
    doc.text(`${parseFloat(invoice.tax_amount).toFixed(2)} €`, colPos[2], currentY, { width: 80, align: 'right' });
    currentY += 18;
    doc.font('Helvetica-Bold');
  }

  doc.text('Gesamt:', 380, currentY);
  doc.text(`${parseFloat(invoice.total_amount).toFixed(2)} €`, colPos[2], currentY, { width: 80, align: 'right' });

  if (invoice.notes) {
    doc.moveDown(2);
    doc.font('Helvetica').fontSize(10).text(`Hinweis: ${invoice.notes}`);
  }

  doc.moveDown(3);
  doc.fontSize(8).font('Helvetica').fillColor('#888888');
  doc.text(
    'PraxisOnline24 ist ein Terminverwaltungs-Werkzeug. Die Praxis ist allein verantwortlich für Patientendaten, medizinische Entscheidungen, Rechnungsinhalte und Rezeptangaben.',
    50,
    doc.page.height - 80,
    { width: 495, align: 'center' }
  );

  doc.end();
}

module.exports = { generateInvoicePDF };
