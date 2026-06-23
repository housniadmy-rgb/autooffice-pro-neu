// ── State ─────────────────────────────────────────────────

const inv = {
  list: [],
  filterStatus: '',
  detailId: null,     // invoice open in detail modal
  payingId: null,     // invoice being paid
  items: [],          // form item rows
};

// ── Init ──────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', async () => {
  const ok = await checkAuth();
  if (!ok) return;

  loadUserInfo();
  prefillDates();
  initItems();
  await loadInvoices();
  renderTable();
  setupListeners();
});

async function loadUserInfo() {
  try {
    const user = await API.get('/api/auth/me');
    const el = document.getElementById('user-name');
    if (el) el.textContent = `${user.first_name} ${user.last_name}`;
  } catch {}
}

async function loadInvoices() {
  const t = window.dT || ((k) => k);
  try {
    inv.list = await API.get('/api/invoices');
  } catch (err) {
    showAlert(t('err_load_invoices') + ': ' + err.message, 'danger');
    inv.list = [];
  }
}

// ── Table ─────────────────────────────────────────────────

function renderTable() {
  const t = window.dT || ((k) => k);
  const tbody = document.getElementById('invoices-tbody');
  if (!tbody) return;

  const filtered = inv.filterStatus
    ? inv.list.filter(i => i.status === inv.filterStatus)
    : inv.list;

  if (filtered.length === 0) {
    const msg = inv.list.length === 0 ? t('no_invoices') : t('no_invoices_status');
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:var(--text-secondary);padding:2rem;">${msg}</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(i => {
    const due = i.due_date
      ? (new Date(i.due_date) < new Date() && i.status !== 'paid'
          ? `<span style="color:var(--danger);">${formatDate(i.due_date)}</span>`
          : formatDate(i.due_date))
      : '–';

    const payBtn = i.status !== 'paid'
      ? `<button class="btn btn-sm btn-success" data-pay="${esc(i.id)}" title="${t('modal_payment')}">${t('btn_paid')}</button>`
      : '';

    return `<tr>
      <td style="font-family:monospace;font-size:.875rem;">${esc(i.invoice_number || i.id.slice(0, 8))}</td>
      <td style="font-weight:500;">${esc(i.patient_first_name)} ${esc(i.patient_last_name)}</td>
      <td>${formatDate(i.invoice_date)}</td>
      <td>${due}</td>
      <td style="text-align:right;font-weight:600;">${formatCurrency(parseFloat(i.total_amount || 0))}</td>
      <td>${statusBadge(i.status)}</td>
      <td style="text-align:right;white-space:nowrap;">
        <button class="btn btn-sm btn-secondary" data-detail="${esc(i.id)}" style="margin-right:.25rem;">${t('btn_details')}</button>
        <a class="btn btn-sm btn-secondary" href="/api/invoices/${esc(i.id)}/pdf" target="_blank" title="${t('btn_download_pdf')}">PDF</a>
        ${payBtn}
      </td>
    </tr>`;
  }).join('');

  tbody.querySelectorAll('[data-detail]').forEach(btn =>
    btn.addEventListener('click', () => openDetail(btn.dataset.detail))
  );
  tbody.querySelectorAll('[data-pay]').forEach(btn =>
    btn.addEventListener('click', () => openPayModal(btn.dataset.pay))
  );
}

// ── New invoice form ──────────────────────────────────────

function prefillDates() {
  const today = new Date().toISOString().slice(0, 10);
  const due = new Date();
  due.setDate(due.getDate() + 30);

  const dateEl = document.getElementById('inv-date');
  const dueEl  = document.getElementById('inv-due');
  if (dateEl) dateEl.value = today;
  if (dueEl)  dueEl.value  = due.toISOString().slice(0, 10);
}

function initItems() {
  inv.items = [{ description: '', amount: '' }];
  renderItems();
}

function renderItems() {
  const tbody = document.getElementById('items-body');
  if (!tbody) return;

  tbody.innerHTML = inv.items.map((item, idx) => `
    <tr data-idx="${idx}">
      <td>
        <input type="text" class="form-control item-desc" value="${esc(item.description)}"
          placeholder="z.B. Allgemeinärztliche Leistung" autocomplete="off">
      </td>
      <td>
        <input type="number" class="form-control item-amount" value="${esc(item.amount)}"
          min="0" step="0.01" placeholder="0.00" style="text-align:right;">
      </td>
      <td style="text-align:right;">
        ${inv.items.length > 1
          ? `<button type="button" class="btn btn-sm btn-secondary item-remove" data-idx="${idx}">×</button>`
          : ''}
      </td>
    </tr>
  `).join('');

  tbody.querySelectorAll('.item-desc').forEach((inp, idx) => {
    inp.addEventListener('input', () => { inv.items[idx].description = inp.value; });
  });
  tbody.querySelectorAll('.item-amount').forEach((inp, idx) => {
    inp.addEventListener('input', () => { inv.items[idx].amount = inp.value; calcTotals(); });
  });
  tbody.querySelectorAll('.item-remove').forEach(btn => {
    btn.addEventListener('click', () => {
      inv.items.splice(Number(btn.dataset.idx), 1);
      renderItems();
      calcTotals();
    });
  });
}

function calcTotals() {
  const net = inv.items.reduce((sum, it) => sum + (parseFloat(it.amount) || 0), 0);
  const taxRate = parseInt(document.getElementById('tax-rate')?.value || '0', 10);
  const tax = net * taxRate / 100;
  const total = net + tax;

  const fmt = v => formatCurrency(v);
  const el = id => document.getElementById(id);

  if (el('t-net'))      el('t-net').textContent      = fmt(net);
  if (el('t-tax'))      el('t-tax').textContent      = fmt(tax);
  if (el('t-total'))    el('t-total').textContent    = fmt(total);
  const t = window.dT || ((k) => k);
  if (el('t-tax-label')) el('t-tax-label').textContent = `${t('lbl_mwst')} ${taxRate} %`;
}

document.getElementById('new-invoice-form')?.addEventListener('submit', async e => {
  e.preventDefault();
  const t = window.dT || ((k) => k);
  const alert = document.getElementById('new-alert');
  alert.innerHTML = '';

  const form = e.target;
  const firstName = form.elements['patient_first_name'].value.trim();
  const lastName  = form.elements['patient_last_name'].value.trim();
  const invoiceDate = form.elements['invoice_date'].value;

  if (!firstName || !lastName || !invoiceDate) {
    alert.innerHTML = `<div class="alert alert-danger">${t('err_required_fields')}</div>`;
    return;
  }

  const validItems = inv.items.filter(it => it.description.trim() && parseFloat(it.amount) > 0);
  const net = validItems.reduce((s, it) => s + parseFloat(it.amount), 0);

  if (net <= 0) {
    alert.innerHTML = `<div class="alert alert-danger">${t('err_invoice_min_item')}</div>`;
    return;
  }

  const taxRate = parseInt(document.getElementById('tax-rate').value, 10);

  const data = {
    patient_first_name: firstName,
    patient_last_name:  lastName,
    patient_address:    form.elements['patient_address'].value.trim() || null,
    invoice_date:       invoiceDate,
    due_date:           form.elements['due_date'].value || null,
    items:              validItems.map(it => ({ description: it.description.trim(), amount: parseFloat(it.amount) })),
    amount:             net,
    tax_rate:           taxRate,
    notes:              form.elements['notes'].value.trim() || null,
  };

  const btn = document.getElementById('btn-save-new');
  btn.disabled = true;

  try {
    await API.post('/api/invoices', data);
    closeNew();
    await loadInvoices();
    renderTable();
  } catch (err) {
    alert.innerHTML = `<div class="alert alert-danger">${esc(err.message)}</div>`;
  } finally {
    btn.disabled = false;
  }
});

function openNew() {
  const form = document.getElementById('new-invoice-form');
  form.reset();
  document.getElementById('new-alert').innerHTML = '';
  prefillDates();
  initItems();
  calcTotals();
  document.getElementById('modal-new').classList.remove('hidden');
}

function closeNew() {
  document.getElementById('modal-new').classList.add('hidden');
}

// ── Detail modal ──────────────────────────────────────────

function openDetail(id) {
  const invoice = inv.list.find(i => i.id === id);
  if (!invoice) return;
  inv.detailId = id;

  const t = window.dT || ((k) => k);
  document.getElementById('detail-title').textContent = `${t('lbl_invoice')} ${invoice.invoice_number || ''}`;
  document.getElementById('detail-alert').innerHTML = '';

  let items = [];
  try { items = invoice.items ? JSON.parse(invoice.items) : []; } catch {}

  const itemsHtml = items.length
    ? items.map(it => `
        <tr>
          <td>${esc(it.description)}</td>
          <td style="text-align:right;">${formatCurrency(parseFloat(it.amount || 0))}</td>
        </tr>`).join('')
    : `<tr><td colspan="2">${esc(invoice.notes || t('lbl_medical_services'))}</td></tr>`;

  const taxRow = parseFloat(invoice.tax_rate || 0) > 0 ? `
    <div class="invoice-totals-row"><span>${t('total_net')}</span><span>${formatCurrency(parseFloat(invoice.amount))}</span></div>
    <div class="invoice-totals-row"><span>${t('lbl_mwst')} ${invoice.tax_rate} %</span><span>${formatCurrency(parseFloat(invoice.tax_amount))}</span></div>` : '';

  document.getElementById('detail-body').innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1.25rem;font-size:.9375rem;">
      <div><span style="color:var(--text-secondary);">${t('th_patient')}</span><br><strong>${esc(invoice.patient_first_name)} ${esc(invoice.patient_last_name)}</strong></div>
      <div><span style="color:var(--text-secondary);">${t('th_status')}</span><br>${statusBadge(invoice.status)}</div>
      <div><span style="color:var(--text-secondary);">${t('form_invoice_date')}</span><br>${formatDate(invoice.invoice_date)}</div>
      <div><span style="color:var(--text-secondary);">${t('th_due')}</span><br>${invoice.due_date ? formatDate(invoice.due_date) : '–'}</div>
      ${invoice.patient_address ? `<div style="grid-column:span 2;"><span style="color:var(--text-secondary);">${t('form_address_p')}</span><br>${esc(invoice.patient_address)}</div>` : ''}
    </div>
    <div class="table-wrapper" style="margin-bottom:.75rem;">
      <table style="font-size:.9375rem;">
        <thead><tr><th>${t('th_service')}</th><th style="text-align:right;">${t('th_amount')}</th></tr></thead>
        <tbody>${itemsHtml}</tbody>
      </table>
    </div>
    <div class="invoice-totals">
      ${taxRow}
      <div class="invoice-totals-row total"><span>${t('total_total')}</span><span>${formatCurrency(parseFloat(invoice.total_amount))}</span></div>
    </div>
    ${invoice.notes ? `<p style="margin-top:.875rem;font-size:.875rem;color:var(--text-secondary);">${t('lbl_note')}: ${esc(invoice.notes)}</p>` : ''}
  `;

  const footer = document.getElementById('detail-footer');
  const pdfLink = `<a class="btn btn-secondary" href="/api/invoices/${esc(id)}/pdf" target="_blank">${t('btn_download_pdf')}</a>`;

  if (invoice.status === 'paid') {
    footer.innerHTML = `${pdfLink}<button type="button" class="btn btn-secondary" id="btn-detail-close2">${t('btn_close')}</button>`;
  } else if (invoice.status === 'draft') {
    footer.innerHTML = `
      ${pdfLink}
      <button type="button" class="btn btn-secondary" id="btn-mark-pending">${t('btn_mark_pending')}</button>
      <button type="button" class="btn btn-success" id="btn-mark-paid">${t('btn_mark_paid')}</button>
      <button type="button" class="btn btn-secondary" id="btn-detail-close2">${t('btn_close')}</button>`;
  } else {
    footer.innerHTML = `
      ${pdfLink}
      <button type="button" class="btn btn-success" id="btn-mark-paid">${t('btn_mark_paid')}</button>
      <button type="button" class="btn btn-secondary" id="btn-detail-close2">${t('btn_close')}</button>`;
  }

  footer.querySelector('#btn-detail-close2')?.addEventListener('click', closeDetail);
  footer.querySelector('#btn-mark-pending')?.addEventListener('click', () => changeStatus(id, 'pending'));
  footer.querySelector('#btn-mark-paid')?.addEventListener('click', () => { closeDetail(); openPayModal(id); });

  document.getElementById('modal-detail').classList.remove('hidden');
}

function closeDetail() {
  document.getElementById('modal-detail').classList.add('hidden');
  inv.detailId = null;
}

async function changeStatus(id, status) {
  const alert = document.getElementById('detail-alert');
  try {
    await API.put(`/api/invoices/${id}`, { status });
    closeDetail();
    await loadInvoices();
    renderTable();
  } catch (err) {
    alert.innerHTML = `<div class="alert alert-danger">${esc(err.message)}</div>`;
  }
}

// ── Payment modal ─────────────────────────────────────────

function openPayModal(id) {
  inv.payingId = id;
  document.getElementById('pay-alert').innerHTML = '';
  document.getElementById('pay-form').reset();
  document.getElementById('pay-date').value = new Date().toISOString().slice(0, 10);
  document.getElementById('modal-pay').classList.remove('hidden');
}

function closePay() {
  document.getElementById('modal-pay').classList.add('hidden');
  inv.payingId = null;
}

document.getElementById('pay-form')?.addEventListener('submit', async e => {
  e.preventDefault();
  const t = window.dT || ((k) => k);
  const alert = document.getElementById('pay-alert');
  alert.innerHTML = '';

  const invoice = inv.list.find(i => i.id === inv.payingId);
  if (!invoice) return;

  const form = e.target;
  const data = {
    invoice_id:     inv.payingId,
    amount:         parseFloat(invoice.total_amount),
    payment_date:   form.elements['payment_date'].value,
    payment_method: form.elements['payment_method'].value,
  };

  if (!data.payment_date) {
    alert.innerHTML = `<div class="alert alert-danger">${t('err_payment_date_required')}</div>`;
    return;
  }

  const btn = document.getElementById('btn-confirm-pay');
  btn.disabled = true;

  try {
    await API.post('/api/payments', data);
    closePay();
    await loadInvoices();
    renderTable();
  } catch (err) {
    alert.innerHTML = `<div class="alert alert-danger">${esc(err.message)}</div>`;
  } finally {
    btn.disabled = false;
  }
});

// ── Listeners ─────────────────────────────────────────────

function setupListeners() {
  document.getElementById('btn-new-invoice')?.addEventListener('click', openNew);
  document.getElementById('btn-close-new')?.addEventListener('click', closeNew);
  document.getElementById('btn-cancel-new')?.addEventListener('click', closeNew);
  document.getElementById('btn-close-detail')?.addEventListener('click', closeDetail);
  document.getElementById('btn-close-pay')?.addEventListener('click', closePay);
  document.getElementById('btn-cancel-pay')?.addEventListener('click', closePay);

  document.getElementById('modal-new')?.addEventListener('click', e => {
    if (e.target === document.getElementById('modal-new')) closeNew();
  });
  document.getElementById('modal-detail')?.addEventListener('click', e => {
    if (e.target === document.getElementById('modal-detail')) closeDetail();
  });
  document.getElementById('modal-pay')?.addEventListener('click', e => {
    if (e.target === document.getElementById('modal-pay')) closePay();
  });

  document.getElementById('btn-add-item')?.addEventListener('click', () => {
    inv.items.push({ description: '', amount: '' });
    renderItems();
  });

  document.getElementById('tax-rate')?.addEventListener('change', calcTotals);

  document.querySelectorAll('.filter-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      inv.filterStatus = tab.dataset.status;
      renderTable();
    });
  });

  document.getElementById('btn-logout')?.addEventListener('click', async () => {
    try { await API.post('/api/auth/logout'); } finally {
      window.location.href = '/login.html';
    }
  });
}

// ── XSS helper ────────────────────────────────────────────

function esc(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
