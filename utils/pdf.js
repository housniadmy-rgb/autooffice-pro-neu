const PDFDocument = require('pdfkit');
const moment = require('moment');
const { t } = require('./language');

function generateInvoicePDF(invoice, practice, res, options = {}) {
  const lang = options.lang || (practice && practice.language) || 'de';
  const L = (key) => t(key, lang);

  const doc = new PDFDocument({ margin: 50, size: 'A4' });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${L('pdf_filename_invoice')}_${invoice.invoice_number || invoice.id}.pdf"`);
  doc.pipe(res);

  doc.fontSize(20).font('Helvetica-Bold').text(L('pdf_invoice_title'), { align: 'right' });
  doc.moveDown(0.5);

  doc.fontSize(10).font('Helvetica');
  doc.text(`${L('pdf_invoice_number')}: ${invoice.invoice_number || invoice.id}`, { align: 'right' });
  doc.text(`${L('pdf_date')}: ${moment(invoice.invoice_date).format('DD.MM.YYYY')}`, { align: 'right' });
  if (invoice.due_date) {
    doc.text(`${L('pdf_due_date')}: ${moment(invoice.due_date).format('DD.MM.YYYY')}`, { align: 'right' });
  }

  doc.moveDown(1);
  doc.fontSize(14).font('Helvetica-Bold').text(practice.name || '');
  doc.fontSize(10).font('Helvetica');
  if (practice.address) doc.text(practice.address);
  if (practice.zip || practice.city) doc.text(`${practice.zip || ''} ${practice.city || ''}`.trim());
  if (practice.phone) doc.text(`${L('pdf_tel')}: ${practice.phone}`);
  if (practice.email) doc.text(practice.email);

  doc.moveDown(1.5);
  doc.fontSize(12).font('Helvetica-Bold').text(`${L('pdf_recipient')}:`);
  doc.fontSize(10).font('Helvetica');
  doc.text(`${invoice.patient_first_name} ${invoice.patient_last_name}`);
  if (invoice.patient_address) doc.text(invoice.patient_address);

  doc.moveDown(1.5);

  const tableTop = doc.y;
  const colPos = [50, 300, 400, 480];

  doc.fontSize(10).font('Helvetica-Bold');
  doc.text(L('pdf_service'), colPos[0], tableTop);
  doc.text(L('pdf_amount'), colPos[2], tableTop, { width: 80, align: 'right' });

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
    doc.text(L('pdf_medical_service'), colPos[0], currentY, { width: 240 });
    doc.text(`${parseFloat(invoice.amount).toFixed(2)} €`, colPos[2], currentY, { width: 80, align: 'right' });
    currentY += 20;
  }

  doc.moveTo(50, currentY + 5).lineTo(545, currentY + 5).stroke();
  currentY += 15;

  doc.font('Helvetica-Bold');
  if (invoice.tax_rate > 0) {
    doc.text(`${L('pdf_net')}:`, 380, currentY);
    doc.text(`${parseFloat(invoice.amount).toFixed(2)} €`, colPos[2], currentY, { width: 80, align: 'right' });
    currentY += 18;
    doc.font('Helvetica');
    doc.text(`${L('pdf_vat')} ${invoice.tax_rate}%:`, 380, currentY);
    doc.text(`${parseFloat(invoice.tax_amount).toFixed(2)} €`, colPos[2], currentY, { width: 80, align: 'right' });
    currentY += 18;
    doc.font('Helvetica-Bold');
  }

  doc.text(`${L('pdf_total')}:`, 380, currentY);
  doc.text(`${parseFloat(invoice.total_amount).toFixed(2)} €`, colPos[2], currentY, { width: 80, align: 'right' });

  if (invoice.notes) {
    doc.moveDown(2);
    doc.font('Helvetica').fontSize(10).text(`${L('pdf_note')}: ${invoice.notes}`);
  }

  doc.moveDown(3);
  doc.fontSize(8).font('Helvetica').fillColor('#888888');
  doc.text(
    L('pdf_disclaimer'),
    50,
    doc.page.height - 80,
    { width: 495, align: 'center' }
  );

  doc.end();
}

module.exports = { generateInvoicePDF };
