// ── State ─────────────────────────────────────────────────

const cal = {
  view: 'month',          // 'month' | 'day'
  year: new Date().getFullYear(),
  month: new Date().getMonth(), // 0-indexed
  selectedDate: null,     // 'YYYY-MM-DD'
  filterPractitionerId: '',
  filterArchive: 'active',
  appointments: [],
  practitioners: [],
  editingId: null,
  limits: { monthly_appointments: 200, practitioners: 3 },
  isUnlimited: false,
};

// ── Init ──────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', async () => {
  const ok = await checkAuth();
  if (!ok) return;

  loadUserInfo();
  await Promise.all([loadPractitioners(), loadPackageInfo()]);
  renderFormAppointmentTypes();

  const dateParam = getQueryParam('date');
  if (dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
    const d = new Date(dateParam);
    if (!isNaN(d)) {
      cal.year = d.getFullYear();
      cal.month = d.getMonth();
      cal.selectedDate = dateParam;
      cal.view = 'day';
    }
  }

  await loadAppointments();
  renderAll();

  if (getQueryParam('new') === '1') {
    openModal(null);
  }

  setupListeners();
});

async function loadUserInfo() {
  try {
    const user = await API.get('/api/auth/me');
    const el = document.getElementById('user-name');
    if (el) el.textContent = `${user.first_name} ${user.last_name}`;
  } catch {}
}

async function loadPackageInfo() {
  try {
    const data = await API.get('/api/dashboard');
    cal.isUnlimited = data.practice.package === 'UNLIMITED';
    cal.limits = data.limits || { monthly_appointments: 200, practitioners: 3 };
  } catch {}
}

async function loadPractitioners() {
  try {
    cal.practitioners = await API.get('/api/practitioners');
  } catch (err) {
    console.error('Practitioners load:', err.message);
  }
}

async function loadAppointments() {
  const first = firstVisibleDate();
  const last = lastVisibleDate();
  try {
    let url = `/api/appointments?from=${iso(first)}&to=${iso(last)}`;
    if (cal.filterPractitionerId) url += `&practitioner_id=${encodeURIComponent(cal.filterPractitionerId)}`;
    if (cal.filterArchive !== 'active') url += `&archive_filter=${encodeURIComponent(cal.filterArchive)}`;
    cal.appointments = await API.get(url);
  } catch (err) {
    const t = window.dT || ((k) => k);
    showAlert(t('err_load_appointments') + ': ' + err.message, 'danger');
    cal.appointments = [];
  }
}

// ── Date helpers ──────────────────────────────────────────

function iso(date) {
  return `${date.getFullYear()}-${p2(date.getMonth() + 1)}-${p2(date.getDate())}`;
}

function p2(n) { return String(n).padStart(2, '0'); }

function firstVisibleDate() {
  const d = new Date(cal.year, cal.month, 1);
  const dow = (d.getDay() + 6) % 7; // Mon=0
  d.setDate(1 - dow);
  return d;
}

function lastVisibleDate() {
  const d = new Date(cal.year, cal.month + 1, 0); // last day of month
  const dow = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() + (6 - dow));
  return d;
}

function longDate(isoStr) {
  const [y, m, d] = isoStr.split('-').map(Number);
  const locale = typeof getLocale === 'function' ? getLocale() : 'de-DE';
  return new Date(y, m - 1, d).toLocaleDateString(locale, {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
}

function calTitle() {
  const locale = typeof getLocale === 'function' ? getLocale() : 'de-DE';
  return new Date(cal.year, cal.month, 1).toLocaleDateString(locale, {
    month: 'long', year: 'numeric',
  });
}

function monthlyCount(forMonthPrefix) {
  const prefix = forMonthPrefix || `${cal.year}-${p2(cal.month + 1)}`;
  return cal.appointments.filter(a =>
    a.appointment_date.startsWith(prefix) && a.status !== 'cancelled'
  ).length;
}

function getWeekdayAbbrs() {
  const locale = typeof getLocale === 'function' ? getLocale() : 'de-DE';
  // 2024-01-01 was a Monday; iterate Mon–Sun
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(2024, 0, 1 + i);
    return new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(d);
  });
}

// ── Render all ────────────────────────────────────────────

function renderAll() {
  document.getElementById('cal-month-title').textContent = calTitle();
  renderPractitionerFilter();
  renderFormPractitioners();
  renderLimitBar();

  if (cal.view === 'month') {
    document.getElementById('view-month').style.display = '';
    document.getElementById('view-day').style.display = 'none';
    renderMonthGrid();
  } else {
    document.getElementById('view-month').style.display = 'none';
    document.getElementById('view-day').style.display = '';
    renderDayView();
  }
}

// ── Limit bar ─────────────────────────────────────────────

function renderLimitBar() {
  const bar = document.getElementById('limit-bar');
  if (!bar) return;

  if (cal.isUnlimited || !cal.limits || !cal.limits.monthly_appointments) {
    bar.style.display = 'none';
    return;
  }

  const t = window.dT || ((k) => k);
  const limit = cal.limits.monthly_appointments;
  const count = monthlyCount();
  const pct = Math.min(100, Math.round((count / limit) * 100));

  if (count < Math.floor(limit * 0.9)) {
    bar.style.display = 'none';
    return;
  }

  const color = count >= limit ? 'var(--danger)' : 'var(--warning)';
  bar.className = `limit-bar ${count >= limit ? 'danger' : 'warning'}`;
  bar.style.display = 'flex';
  const suffix = count >= limit ? ` – ${t('lbl_limit_reached')}` : ` – ${t('lbl_limit_almost')}`;
  bar.innerHTML = `
    <span><strong>${count}&thinsp;/&thinsp;${limit}</strong> ${t('lbl_apts_this_month')}${suffix}</span>
    <div class="limit-progress">
      <div class="limit-progress-inner" style="width:${pct}%;background:${color};"></div>
    </div>
  `;
}

// ── Practitioner selects ──────────────────────────────────

function renderPractitionerFilter() {
  const sel = document.getElementById('filter-practitioner');
  if (!sel) return;
  const t = window.dT || ((k) => k);
  const saved = cal.filterPractitionerId;
  sel.innerHTML = `<option value="">${t('lbl_all_practitioners')}</option>`;
  cal.practitioners.filter(p => p.active).forEach(p => {
    const opt = document.createElement('option');
    opt.value = p.id;
    opt.textContent = practName(p);
    if (p.id === saved) opt.selected = true;
    sel.appendChild(opt);
  });
}

function renderFormAppointmentTypes() {
  const sel = document.getElementById('form-apt-type');
  if (!sel) return;
  const tr = window.dT || ((k) => k);
  sel.innerHTML = `<option value="">${tr('ph_select')}</option>` +
    APPOINTMENT_TYPES.map(t => `<option value="${t}">${t}</option>`).join('');
}

function renderFormPractitioners() {
  const sel = document.getElementById('form-practitioner');
  if (!sel) return;
  const saved = sel.value;
  const t = window.dT || ((k) => k);
  sel.innerHTML = `<option value="">${t('ph_practitioner')}</option>`;
  cal.practitioners.filter(p => p.active).forEach(p => {
    const opt = document.createElement('option');
    opt.value = p.id;
    opt.textContent = practName(p);
    if (p.id === saved) opt.selected = true;
    sel.appendChild(opt);
  });
}

function practName(p) {
  return `${p.title ? p.title + ' ' : ''}${p.first_name} ${p.last_name}`;
}

// ── Month grid ────────────────────────────────────────────

function renderMonthGrid() {
  const grid = document.getElementById('cal-grid');
  if (!grid) return;

  const t = window.dT || ((k) => k);
  const today = iso(new Date());
  const first = firstVisibleDate();

  const byDate = {};
  cal.appointments.forEach(a => {
    (byDate[a.appointment_date] = byDate[a.appointment_date] || []).push(a);
  });

  const weekdays = getWeekdayAbbrs();
  const headers = weekdays.map(h => `<div class="cal-header-cell">${esc(h)}</div>`).join('');

  const cells = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(first.getFullYear(), first.getMonth(), first.getDate() + i);
    const dateStr = iso(d);
    const isCurMonth = d.getMonth() === cal.month;
    const isToday = dateStr === today;
    const isSel = dateStr === cal.selectedDate;

    const apts = byDate[dateStr] || [];
    const shown = apts.slice(0, 3);
    const extra = apts.length - shown.length;

    const aptHtml = shown.map(a =>
      `<div class="cal-apt status-${esc(a.status)}" data-id="${esc(a.id)}">${esc(a.appointment_time)} ${esc(a.patient_first_name)} ${esc(a.patient_last_name)}</div>`
    ).join('');

    const moreHtml = extra > 0 ? `<div class="cal-apt-more">+${extra} ${t('cal_apt_more')}</div>` : '';

    const cls = ['cal-cell',
      !isCurMonth ? 'other-month' : '',
      isToday ? 'today' : '',
      isSel ? 'selected' : '',
    ].filter(Boolean).join(' ');

    cells.push(`<div class="${cls}" data-date="${dateStr}">
      <div class="cal-day-num">${d.getDate()}</div>
      ${aptHtml}${moreHtml}
    </div>`);
  }

  grid.innerHTML = headers + cells.join('');

  grid.querySelectorAll('.cal-cell').forEach(cell => {
    cell.addEventListener('click', e => {
      const aptEl = e.target.closest('.cal-apt');
      if (aptEl) { e.stopPropagation(); openModal(aptEl.dataset.id); return; }
      goDayView(cell.dataset.date);
    });
  });
}

// ── Day view ──────────────────────────────────────────────

function renderDayView() {
  const dateTitle = document.getElementById('day-view-date');
  if (dateTitle && cal.selectedDate) dateTitle.textContent = longDate(cal.selectedDate);

  const list = document.getElementById('day-apt-list');
  if (!list) return;

  const t = window.dT || ((k) => k);
  const apts = cal.appointments
    .filter(a => a.appointment_date === cal.selectedDate)
    .sort((a, b) => a.appointment_time.localeCompare(b.appointment_time));

  if (apts.length === 0) {
    list.innerHTML = `<p style="color:var(--text-secondary);padding:2rem 0;text-align:center;">${t('no_data')}</p>`;
    return;
  }

  list.innerHTML = apts.map(a => {
    const pr = [a.practitioner_title, a.practitioner_first_name, a.practitioner_last_name]
      .filter(Boolean).join(' ');
    const meta = [a.appointment_type, pr, `${a.duration_minutes} ${t('lbl_min')}`].filter(Boolean).join(' · ');
    return `<div class="day-apt-card status-${esc(a.status)}" data-id="${esc(a.id)}">
      <div class="day-apt-time">${esc(a.appointment_time)}</div>
      <div class="day-apt-info">
        <div class="day-apt-patient">${esc(a.patient_first_name)} ${esc(a.patient_last_name)}</div>
        <div class="day-apt-meta">${esc(meta)}</div>
      </div>
      ${statusBadge(a.status)}
    </div>`;
  }).join('');

  list.querySelectorAll('.day-apt-card').forEach(card => {
    card.addEventListener('click', () => openModal(card.dataset.id));
  });
}

function goDayView(dateStr) {
  cal.selectedDate = dateStr;
  cal.view = 'day';

  const [y, m] = dateStr.split('-').map(Number);
  const needsReload = y !== cal.year || (m - 1) !== cal.month;

  if (needsReload) {
    cal.year = y;
    cal.month = m - 1;
    loadAppointments().then(() => renderAll());
  } else {
    document.getElementById('view-month').style.display = 'none';
    document.getElementById('view-day').style.display = '';
    document.getElementById('cal-month-title').textContent = calTitle();
    renderDayView();
  }
}

// ── Modal ─────────────────────────────────────────────────

function openModal(id) {
  const modal = document.getElementById('modal-appointment');
  const form  = document.getElementById('apt-form');
  const alertBox = document.getElementById('modal-alert');
  const t = window.dT || ((k) => k);

  form.reset();
  alertBox.innerHTML = '';
  cal.editingId = id || null;

  const statusSection = document.getElementById('status-section');

  if (id) {
    const a = cal.appointments.find(x => x.id === id);
    if (!a) return;

    document.getElementById('modal-title').textContent = t('modal_edit_apt');
    statusSection.style.display = '';

    setField(form, 'practitioner_id', a.practitioner_id);
    setField(form, 'appointment_date', a.appointment_date);
    setField(form, 'appointment_time', a.appointment_time);
    setField(form, 'duration_minutes', a.duration_minutes);
    setField(form, 'appointment_type', normalizeAppointmentType(a.appointment_type));
    setField(form, 'patient_first_name', a.patient_first_name);
    setField(form, 'patient_last_name', a.patient_last_name);
    setField(form, 'patient_email', a.patient_email);
    setField(form, 'patient_phone', a.patient_phone || '');
    setField(form, 'notes', a.notes || '');

    renderStatusButtons(a.status);
  } else {
    document.getElementById('modal-title').textContent = t('modal_new_apt');
    statusSection.style.display = 'none';

    if (cal.selectedDate) setField(form, 'appointment_date', cal.selectedDate);

    if (cal.practitioners.filter(p => p.active).length === 0) {
      const link = `/practitioners.html`;
      alertBox.innerHTML = `<div class="alert alert-warning">${t('err_no_practitioners')} <a href="${link}">${t('nav_practitioners')}</a>.</div>`;
    }
  }

  modal.classList.remove('hidden');
}

function closeModal() {
  document.getElementById('modal-appointment').classList.add('hidden');
  cal.editingId = null;
}

function setField(form, name, value) {
  const el = form.elements[name];
  if (el) el.value = value ?? '';
}

function renderStatusButtons(current) {
  const container = document.getElementById('status-buttons');
  if (!container) return;

  const t = window.dT || ((k) => k);
  const statuses = [
    { value: 'scheduled', label: t('status_scheduled') },
    { value: 'completed', label: t('status_completed') },
    { value: 'noshow',    label: t('status_noshow') },
    { value: 'cancelled', label: t('status_cancel') },
    { value: 'archived',  label: t('status_archived') },
  ];

  container.innerHTML = statuses.map(s =>
    `<button type="button" class="btn btn-sm ${s.value === current ? 'btn-primary' : 'btn-secondary'}"
      data-status="${s.value}" ${s.value === current ? 'disabled' : ''}>${esc(s.label)}</button>`
  ).join('');

  container.querySelectorAll('[data-status]').forEach(btn => {
    btn.addEventListener('click', () => applyStatus(btn.dataset.status));
  });
}

async function applyStatus(newStatus) {
  if (!cal.editingId) return;
  const alertBox = document.getElementById('modal-alert');
  alertBox.innerHTML = '';

  try {
    if (newStatus === 'cancelled') {
      await API.delete(`/api/appointments/${cal.editingId}`);
    } else {
      await API.put(`/api/appointments/${cal.editingId}`, { status: newStatus });
    }
    closeModal();
    await loadAppointments();
    renderAll();
  } catch (err) {
    alertBox.innerHTML = `<div class="alert alert-danger">${esc(err.message)}</div>`;
  }
}

// ── Form submit ───────────────────────────────────────────

document.getElementById('apt-form')?.addEventListener('submit', async e => {
  e.preventDefault();
  const alertBox = document.getElementById('modal-alert');
  alertBox.innerHTML = '';
  const t = window.dT || ((k) => k);

  const form = e.target;
  const data = {
    practitioner_id:   form.elements['practitioner_id'].value,
    appointment_date:  form.elements['appointment_date'].value,
    appointment_time:  form.elements['appointment_time'].value,
    duration_minutes:  Number(form.elements['duration_minutes'].value),
    appointment_type:  form.elements['appointment_type'].value || null,
    patient_first_name: form.elements['patient_first_name'].value.trim(),
    patient_last_name:  form.elements['patient_last_name'].value.trim(),
    patient_email:      form.elements['patient_email'].value.trim(),
    patient_phone:      form.elements['patient_phone'].value.trim() || null,
    notes:              form.elements['notes'].value.trim() || null,
  };

  if (!data.practitioner_id || !data.appointment_date || !data.appointment_time ||
      !data.patient_first_name || !data.patient_last_name || !data.patient_email) {
    alertBox.innerHTML = `<div class="alert alert-danger">${t('err_required_fields')}</div>`;
    return;
  }

  if (!cal.editingId && !cal.isUnlimited) {
    const limit = cal.limits ? cal.limits.monthly_appointments : null;
    if (limit !== null) {
      const prefix = data.appointment_date.slice(0, 7);
      const count = cal.appointments.filter(a =>
        a.appointment_date.startsWith(prefix) && a.status !== 'cancelled'
      ).length;
      if (count >= limit) {
        const msg = t('err_monthly_limit').replace('{limit}', limit);
        alertBox.innerHTML = `<div class="alert alert-danger">${msg}</div>`;
        return;
      }
    }
  }

  const btn = document.getElementById('btn-save-apt');
  btn.disabled = true;

  try {
    if (cal.editingId) {
      await API.put(`/api/appointments/${cal.editingId}`, data);
    } else {
      await API.post('/api/appointments', data);
    }
    closeModal();
    await loadAppointments();
    renderAll();
  } catch (err) {
    alertBox.innerHTML = `<div class="alert alert-danger">${esc(err.message)}</div>`;
  } finally {
    btn.disabled = false;
  }
});

// ── Event listeners ───────────────────────────────────────

function setupListeners() {
  document.getElementById('btn-prev-month')?.addEventListener('click', async () => {
    cal.month--;
    if (cal.month < 0) { cal.month = 11; cal.year--; }
    cal.view = 'month'; cal.selectedDate = null;
    await loadAppointments(); renderAll();
  });

  document.getElementById('btn-next-month')?.addEventListener('click', async () => {
    cal.month++;
    if (cal.month > 11) { cal.month = 0; cal.year++; }
    cal.view = 'month'; cal.selectedDate = null;
    await loadAppointments(); renderAll();
  });

  document.getElementById('btn-today')?.addEventListener('click', async () => {
    const now = new Date();
    cal.year = now.getFullYear(); cal.month = now.getMonth();
    cal.view = 'month'; cal.selectedDate = null;
    await loadAppointments(); renderAll();
  });

  document.getElementById('filter-practitioner')?.addEventListener('change', async e => {
    cal.filterPractitionerId = e.target.value;
    await loadAppointments(); renderAll();
  });

  document.getElementById('filter-archive')?.addEventListener('change', async e => {
    cal.filterArchive = e.target.value;
    await loadAppointments(); renderAll();
  });

  document.getElementById('btn-new-apt')?.addEventListener('click', () => openModal(null));

  document.getElementById('btn-back-month')?.addEventListener('click', () => {
    cal.view = 'month'; cal.selectedDate = null;
    document.getElementById('view-day').style.display = 'none';
    document.getElementById('view-month').style.display = '';
    renderMonthGrid();
  });

  document.getElementById('btn-prev-day')?.addEventListener('click', async () => {
    if (!cal.selectedDate) return;
    const [y, m, d] = cal.selectedDate.split('-').map(Number);
    const prev = new Date(y, m - 1, d - 1);
    await goDayView(iso(prev));
  });

  document.getElementById('btn-next-day')?.addEventListener('click', async () => {
    if (!cal.selectedDate) return;
    const [y, m, d] = cal.selectedDate.split('-').map(Number);
    const next = new Date(y, m - 1, d + 1);
    await goDayView(iso(next));
  });

  document.getElementById('btn-close-modal')?.addEventListener('click', closeModal);
  document.getElementById('btn-cancel-modal')?.addEventListener('click', closeModal);

  document.getElementById('modal-appointment')?.addEventListener('click', e => {
    if (e.target === document.getElementById('modal-appointment')) closeModal();
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
