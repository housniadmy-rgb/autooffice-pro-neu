// ── State ─────────────────────────────────────────────────

const pat = {
  all: [],       // raw list from API
  filtered: [],  // after search
};

// ── Init ──────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', async () => {
  const ok = await checkAuth();
  if (!ok) return;

  loadUserInfo();
  await loadPatients();
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

async function loadPatients() {
  const t = window.dT || ((k) => k);
  try {
    pat.all = await API.get('/api/patients');
    pat.filtered = pat.all;
  } catch (err) {
    showAlert(t('err_load_patients') + ': ' + err.message, 'danger');
    pat.all = [];
    pat.filtered = [];
  }
}

// ── Render ────────────────────────────────────────────────

function renderTable() {
  const t = window.dT || ((k) => k);
  const tbody = document.getElementById('patients-tbody');
  const countEl = document.getElementById('patient-count');
  if (!tbody) return;

  if (countEl) countEl.textContent = `${pat.filtered.length} ${t('lbl_patients_count')}`;

  if (pat.filtered.length === 0) {
    const msg = pat.all.length === 0 ? t('no_patients') : t('no_search_results');
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:var(--text-secondary);padding:2rem;">${msg}</td></tr>`;
    return;
  }

  tbody.innerHTML = pat.filtered.map(p => `
    <tr>
      <td style="font-weight:500;">${esc(p.patient_first_name)} ${esc(p.patient_last_name)}</td>
      <td>${esc(p.patient_email)}</td>
      <td style="color:var(--text-secondary);">${esc(p.patient_phone || '–')}</td>
      <td style="text-align:center;">${p.appointment_count}</td>
      <td>${formatDate(p.last_appointment_date)}</td>
      <td style="text-align:right;">
        <button class="btn btn-sm btn-secondary" data-email="${esc(p.patient_email)}" data-name="${esc(p.patient_first_name + ' ' + p.patient_last_name)}">${t('btn_history')}</button>
      </td>
    </tr>
  `).join('');

  tbody.querySelectorAll('[data-email]').forEach(btn =>
    btn.addEventListener('click', () => openHistory(btn.dataset.email, btn.dataset.name))
  );
}

// ── Search ────────────────────────────────────────────────

function applySearch(term) {
  const q = term.trim().toLowerCase();
  if (!q) {
    pat.filtered = pat.all;
  } else {
    pat.filtered = pat.all.filter(p => {
      const name = (p.patient_first_name + ' ' + p.patient_last_name).toLowerCase();
      const email = (p.patient_email || '').toLowerCase();
      return name.includes(q) || email.includes(q);
    });
  }
  renderTable();
}

// ── History Modal ─────────────────────────────────────────

async function openHistory(email, name) {
  const modal   = document.getElementById('modal-history');
  const title   = document.getElementById('modal-history-title');
  const content = document.getElementById('history-content');
  const alert   = document.getElementById('modal-history-alert');

  const t = window.dT || ((k) => k);
  title.textContent = `${t('modal_history')} – ${name}`;
  content.innerHTML = `<p style="color:var(--text-secondary);padding:1rem 0;">${t('loading')}</p>`;
  alert.innerHTML = '';
  modal.classList.remove('hidden');

  try {
    const apts = await API.get(`/api/patients/history?email=${encodeURIComponent(email)}`);
    renderHistory(apts, content);
  } catch (err) {
    alert.innerHTML = `<div class="alert alert-danger">${esc(err.message)}</div>`;
    content.innerHTML = '';
  }
}

function renderHistory(apts, container) {
  const t = window.dT || ((k) => k);
  if (apts.length === 0) {
    container.innerHTML = `<p style="color:var(--text-secondary);padding:1rem 0;">${t('no_data')}</p>`;
    return;
  }
  const uhrSuffix = t('lbl_uhr');
  const rows = apts.map(a => {
    const pr = [a.practitioner_title, a.practitioner_first_name, a.practitioner_last_name]
      .filter(Boolean).join(' ');
    const timeDisplay = uhrSuffix ? `${esc(a.appointment_time)} ${uhrSuffix}` : esc(a.appointment_time);
    return `<tr>
      <td>${formatDate(a.appointment_date)}</td>
      <td>${timeDisplay}</td>
      <td>${esc(a.appointment_type || '–')}</td>
      <td style="font-size:.875rem;color:var(--text-secondary);">${esc(pr || '–')}</td>
      <td>${statusBadge(a.status)}</td>
    </tr>`;
  }).join('');

  container.innerHTML = `
    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>${t('th_date')}</th>
            <th>${t('th_time')}</th>
            <th>${t('th_type')}</th>
            <th>${t('th_practitioner')}</th>
            <th>${t('th_status')}</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}

function closeHistory() {
  document.getElementById('modal-history').classList.add('hidden');
}

// ── Event listeners ───────────────────────────────────────

function setupListeners() {
  document.getElementById('patient-search')?.addEventListener('input', e => {
    applySearch(e.target.value);
  });

  document.getElementById('btn-close-history')?.addEventListener('click', closeHistory);
  document.getElementById('btn-cancel-history')?.addEventListener('click', closeHistory);

  document.getElementById('modal-history')?.addEventListener('click', e => {
    if (e.target === document.getElementById('modal-history')) closeHistory();
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
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
