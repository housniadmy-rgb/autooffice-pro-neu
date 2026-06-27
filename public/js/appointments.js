// ── State ─────────────────────────────────────────────────

const cal = {
  view: 'month',          // 'month' | 'week' | 'day'
  year: new Date().getFullYear(),
  month: new Date().getMonth(),         // 0-indexed
  selectedDate: iso(new Date()),        // 'YYYY-MM-DD' (anchor for day/week view)
  weekStart: null,                       // 'YYYY-MM-DD' (Monday of current week)
  filterPractitionerId: '',
  filterArchive: 'active',
  filterType: '',
  filterStatuses: {                     // visible status chips in left panel
    scheduled: true,
    completed: true,
    noshow: true,
    cancelled: true,
    archived: true,
  },
  appointments: [],
  practitioners: [],
  editingId: null,
  selectedAptId: null,                   // currently shown in detail drawer
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
  renderFilterTypeOptions();
  renderStatusFilterChips();

  // anchor weekStart to current week (Mon)
  cal.weekStart = isoMondayOf(new Date());

  const dateParam = getQueryParam('date');
  if (dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
    const d = new Date(dateParam);
    if (!isNaN(d)) {
      cal.year = d.getFullYear();
      cal.month = d.getMonth();
      cal.selectedDate = dateParam;
      cal.weekStart = isoMondayOf(d);
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

function isoMondayOf(d) {
  const day = (d.getDay() + 6) % 7;
  const m = new Date(d.getFullYear(), d.getMonth(), d.getDate() - day);
  return iso(m);
}

function fromIso(str) {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function firstVisibleDate() {
  if (cal.view === 'day') return fromIso(cal.selectedDate);
  if (cal.view === 'week') return fromIso(cal.weekStart);
  const d = new Date(cal.year, cal.month, 1);
  const dow = (d.getDay() + 6) % 7;
  d.setDate(1 - dow);
  return d;
}

function lastVisibleDate() {
  if (cal.view === 'day') return fromIso(cal.selectedDate);
  if (cal.view === 'week') {
    const s = fromIso(cal.weekStart);
    s.setDate(s.getDate() + 6);
    return s;
  }
  const d = new Date(cal.year, cal.month + 1, 0);
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

function viewTitle() {
  const locale = typeof getLocale === 'function' ? getLocale() : 'de-DE';
  if (cal.view === 'day') {
    return fromIso(cal.selectedDate).toLocaleDateString(locale, {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    });
  }
  if (cal.view === 'week') {
    const start = fromIso(cal.weekStart);
    const end = new Date(start); end.setDate(start.getDate() + 6);
    const sameMonth = start.getMonth() === end.getMonth();
    const sameYear  = start.getFullYear() === end.getFullYear();
    const startStr = start.toLocaleDateString(locale, {
      day: 'numeric',
      month: sameMonth && sameYear ? undefined : 'short',
      year: sameYear ? undefined : 'numeric',
    });
    const endStr = end.toLocaleDateString(locale, {
      day: 'numeric', month: 'short', year: 'numeric',
    });
    return `${startStr} – ${endStr}`;
  }
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
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(2024, 0, 1 + i);
    return new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(d);
  });
}

// Filter list of appointments by the left panel filters (status + type)
function visibleAppointments() {
  return cal.appointments.filter(a => {
    if (cal.filterStatuses[a.status] === false) return false;
    if (cal.filterType) {
      const t = normalizeAppointmentType(a.appointment_type);
      if (t !== cal.filterType) return false;
    }
    return true;
  });
}

// ── Render all ────────────────────────────────────────────

function renderAll() {
  document.getElementById('pcal-title').textContent = viewTitle();
  renderPractitionerFilter();
  renderFormPractitioners();
  renderLimitBar();
  syncViewTabs();

  document.getElementById('view-month').style.display = cal.view === 'month' ? '' : 'none';
  document.getElementById('view-week').style.display  = cal.view === 'week'  ? '' : 'none';
  document.getElementById('view-day').style.display   = cal.view === 'day'   ? '' : 'none';

  if (cal.view === 'month') renderMonthGrid();
  else if (cal.view === 'week') renderWeekGrid();
  else renderDayGrid();
}

function syncViewTabs() {
  document.querySelectorAll('.pcal-view-tab').forEach(btn => {
    btn.classList.toggle('is-active', btn.dataset.view === cal.view);
  });
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

  if (count < Math.floor(limit * 0.9)) {
    bar.style.display = 'none';
    return;
  }

  const pct = Math.min(100, Math.round((count / limit) * 100));
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

// ── Filter panel renderers ────────────────────────────────

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

function renderFilterTypeOptions() {
  const sel = document.getElementById('filter-type');
  if (!sel) return;
  const t = window.dT || ((k) => k);
  const saved = cal.filterType;
  sel.innerHTML = `<option value="">${t('filter_all')}</option>` +
    APPOINTMENT_TYPES.map(typ =>
      `<option value="${esc(typ)}" ${typ === saved ? 'selected' : ''}>${esc(typ)}</option>`
    ).join('');
}

function renderStatusFilterChips() {
  const container = document.getElementById('filter-status-chips');
  if (!container) return;
  const t = window.dT || ((k) => k);
  const items = [
    { k: 'scheduled', label: t('status_scheduled') },
    { k: 'completed', label: t('status_completed') },
    { k: 'noshow',    label: t('status_noshow') },
    { k: 'cancelled', label: t('status_cancel') },
    { k: 'archived',  label: t('status_archived') },
  ];
  container.innerHTML = items.map(it => {
    const on = cal.filterStatuses[it.k] !== false;
    return `<button type="button" class="pcal-filter-chip status-${it.k} ${on ? 'is-active' : ''}"
      data-status="${it.k}">${esc(it.label)}</button>`;
  }).join('');
  container.querySelectorAll('.pcal-filter-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      const k = btn.dataset.status;
      cal.filterStatuses[k] = !cal.filterStatuses[k];
      btn.classList.toggle('is-active', cal.filterStatuses[k]);
      renderAll();
    });
  });
}

function renderFormAppointmentTypes() {
  const sel = document.getElementById('form-apt-type');
  if (!sel) return;
  sel.innerHTML = `<option value="">${window.dT ? dT('ph_select') : '– wählen –'}</option>` +
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

// ── Month view ────────────────────────────────────────────

function renderMonthGrid() {
  const grid = document.getElementById('pcal-month-grid');
  if (!grid) return;

  const t = window.dT || ((k) => k);
  const today = iso(new Date());
  const first = firstVisibleDate();
  const apts = visibleAppointments();

  const byDate = {};
  apts.forEach(a => {
    (byDate[a.appointment_date] = byDate[a.appointment_date] || []).push(a);
  });
  Object.keys(byDate).forEach(k => byDate[k].sort((a, b) => a.appointment_time.localeCompare(b.appointment_time)));

  const weekdays = getWeekdayAbbrs();
  const headers = weekdays.map(h => `<div class="pcal-month-header">${esc(h)}</div>`).join('');

  const cells = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(first.getFullYear(), first.getMonth(), first.getDate() + i);
    const dateStr = iso(d);
    const isCurMonth = d.getMonth() === cal.month;
    const isToday = dateStr === today;
    const isSel = dateStr === cal.selectedDate;

    const dayApts = byDate[dateStr] || [];
    const shown = dayApts.slice(0, 3);
    const extra = dayApts.length - shown.length;

    const aptHtml = shown.map(a =>
      `<div class="pcal-chip status-${esc(a.status)} ${a.id === cal.selectedAptId ? 'is-selected' : ''}" data-id="${esc(a.id)}">
        <span class="pcal-chip-time">${esc(a.appointment_time)}</span>
        <span class="pcal-chip-name">${esc(a.patient_first_name)} ${esc(a.patient_last_name)}</span>
      </div>`
    ).join('');

    const moreHtml = extra > 0 ? `<div class="pcal-more" data-more="${dateStr}">+${extra} ${t('cal_apt_more')}</div>` : '';

    const cls = ['pcal-day',
      !isCurMonth ? 'is-other-month' : '',
      isToday ? 'is-today' : '',
      isSel ? 'is-selected' : '',
    ].filter(Boolean).join(' ');

    cells.push(`<div class="${cls}" data-date="${dateStr}">
      <span class="pcal-day-num">${d.getDate()}</span>
      ${aptHtml}${moreHtml}
    </div>`);
  }

  grid.innerHTML = headers + cells.join('');

  grid.querySelectorAll('.pcal-day').forEach(cell => {
    cell.addEventListener('click', e => {
      const chip = e.target.closest('.pcal-chip');
      if (chip) { e.stopPropagation(); openDetail(chip.dataset.id); return; }
      const more = e.target.closest('.pcal-more');
      if (more) { e.stopPropagation(); goDayView(more.dataset.more); return; }
      const date = cell.dataset.date;
      cal.selectedDate = date;
      goDayView(date);
    });
  });
}

// ── Week view ─────────────────────────────────────────────

function renderWeekGrid() {
  const wrap = document.getElementById('pcal-week-wrap');
  if (!wrap) return;
  const locale = typeof getLocale === 'function' ? getLocale() : 'de-DE';
  const todayStr = iso(new Date());
  const start = fromIso(cal.weekStart);

  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
    days.push({
      dateStr: iso(d),
      dow: new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(d),
      num: d.getDate(),
    });
  }

  const HOUR_START = 7;
  const HOUR_END   = 21;
  const ROW_PX     = 48;
  const HOURS      = HOUR_END - HOUR_START;
  const BODY_H     = HOURS * ROW_PX;

  const apts = visibleAppointments();

  // Header
  const header = `
    <div class="pcal-week-header">
      <div class="pcal-time-spacer"></div>
      ${days.map(day =>
        `<div class="pcal-week-dow ${day.dateStr === todayStr ? 'is-today' : ''}" data-date="${day.dateStr}">
          <div class="pcal-week-dow-name">${esc(day.dow)}</div>
          <div class="pcal-week-dow-num">${day.num}</div>
        </div>`
      ).join('')}
    </div>
  `;

  // Body: time labels column + 7 day columns
  const labelsHtml = Array.from({ length: HOURS }, (_, i) =>
    `<div class="pcal-time-row-label" style="height:${ROW_PX}px;">${p2(HOUR_START + i)}:00</div>`
  ).join('');

  const dayColsHtml = days.map(day => {
    const dayApts = apts.filter(a => a.appointment_date === day.dateStr);

    // Hour cells (clickable for new termin)
    const hourCells = Array.from({ length: HOURS }, (_, i) =>
      `<div class="pcal-hour-cell" style="height:${ROW_PX}px;" data-date="${day.dateStr}" data-hour="${HOUR_START + i}"></div>`
    ).join('');

    // Termin blocks
    const blocksHtml = dayApts.map(a => {
      const [hh, mm] = a.appointment_time.split(':').map(Number);
      const mins = (hh - HOUR_START) * 60 + mm;
      if (mins < 0 || mins >= HOURS * 60) return '';
      const top = (mins / 60) * ROW_PX;
      const height = Math.max(22, ((a.duration_minutes || 30) / 60) * ROW_PX - 2);
      const meta = [a.appointment_type].filter(Boolean).join(' · ');
      const showMeta = height >= 38 ? `<div class="pcal-time-block-meta">${esc(meta)}</div>` : '';
      return `<div class="pcal-time-block status-${esc(a.status)} ${a.id === cal.selectedAptId ? 'is-selected' : ''}"
        style="top:${top}px;height:${height}px;"
        data-id="${esc(a.id)}">
        <div class="pcal-time-block-time">${esc(a.appointment_time)}</div>
        <div class="pcal-time-block-name">${esc(a.patient_first_name)} ${esc(a.patient_last_name)}</div>
        ${showMeta}
      </div>`;
    }).join('');

    return `<div class="pcal-week-col ${day.dateStr === todayStr ? 'is-today' : ''}" data-date="${day.dateStr}">
      ${hourCells}
      ${blocksHtml}
    </div>`;
  }).join('');

  // Now-line
  let nowLine = '';
  const todayInWeek = days.find(x => x.dateStr === todayStr);
  if (todayInWeek) {
    const now = new Date();
    const mins = (now.getHours() - HOUR_START) * 60 + now.getMinutes();
    if (mins >= 0 && mins <= HOURS * 60) {
      const top = (mins / 60) * ROW_PX;
      nowLine = `<div class="pcal-now-line" style="top:${top}px; left:60px; right:0;"></div>`;
    }
  }

  wrap.innerHTML = `
    ${header}
    <div class="pcal-week-body" style="height:${BODY_H}px;">
      <div class="pcal-week-times">${labelsHtml}</div>
      ${dayColsHtml}
      ${nowLine}
    </div>
  `;

  wrap.querySelectorAll('.pcal-time-block').forEach(b => {
    b.addEventListener('click', e => { e.stopPropagation(); openDetail(b.dataset.id); });
  });
  wrap.querySelectorAll('.pcal-hour-cell').forEach(c => {
    c.addEventListener('click', () => {
      openModal(null, { date: c.dataset.date, time: `${p2(Number(c.dataset.hour))}:00` });
    });
  });
  wrap.querySelectorAll('.pcal-week-dow[data-date]').forEach(h => {
    h.addEventListener('click', () => goDayView(h.dataset.date));
  });
}

// ── Day view ──────────────────────────────────────────────

function renderDayGrid() {
  const wrap = document.getElementById('pcal-day-wrap');
  if (!wrap) return;
  const t = window.dT || ((k) => k);
  const HOUR_START = 7;
  const HOUR_END   = 21;
  const HOURS      = HOUR_END - HOUR_START;
  const ROW_PX     = 56;
  const BODY_H     = HOURS * ROW_PX;

  const apts = visibleAppointments()
    .filter(a => a.appointment_date === cal.selectedDate)
    .sort((a, b) => a.appointment_time.localeCompare(b.appointment_time));

  const labelsHtml = Array.from({ length: HOURS }, (_, i) =>
    `<div class="pcal-time-row-label" style="height:${ROW_PX}px;">${p2(HOUR_START + i)}:00</div>`
  ).join('');

  const hourCells = Array.from({ length: HOURS }, (_, i) =>
    `<div class="pcal-hour-cell" style="height:${ROW_PX}px;" data-date="${cal.selectedDate}" data-hour="${HOUR_START + i}"></div>`
  ).join('');

  const blocksHtml = apts.map(a => {
    const [hh, mm] = a.appointment_time.split(':').map(Number);
    const mins = (hh - HOUR_START) * 60 + mm;
    if (mins < 0 || mins >= HOURS * 60) return '';
    const top = (mins / 60) * ROW_PX;
    const height = Math.max(28, ((a.duration_minutes || 30) / 60) * ROW_PX - 2);
    const pr = [a.practitioner_title, a.practitioner_first_name, a.practitioner_last_name].filter(Boolean).join(' ');
    const meta = [a.appointment_type, pr, `${a.duration_minutes || 30} ${t('lbl_min')}`].filter(Boolean).join(' · ');
    return `<div class="pcal-time-block status-${esc(a.status)} ${a.id === cal.selectedAptId ? 'is-selected' : ''}"
      style="top:${top}px;height:${height}px;"
      data-id="${esc(a.id)}">
      <div class="pcal-time-block-time">${esc(a.appointment_time)} · ${esc(a.patient_first_name)} ${esc(a.patient_last_name)}</div>
      <div class="pcal-time-block-meta">${esc(meta)}</div>
    </div>`;
  }).join('');

  const todayStr = iso(new Date());
  let nowLine = '';
  if (cal.selectedDate === todayStr) {
    const now = new Date();
    const mins = (now.getHours() - HOUR_START) * 60 + now.getMinutes();
    if (mins >= 0 && mins <= HOURS * 60) {
      const top = (mins / 60) * ROW_PX;
      nowLine = `<div class="pcal-now-line" style="top:${top}px; left:60px; right:0;"></div>`;
    }
  }

  wrap.innerHTML = `
    <div class="pcal-day-body" style="height:${BODY_H}px;">
      <div class="pcal-week-times">${labelsHtml}</div>
      <div class="pcal-week-col ${cal.selectedDate === todayStr ? 'is-today' : ''}" data-date="${cal.selectedDate}">
        ${hourCells}
        ${blocksHtml}
      </div>
      ${nowLine}
    </div>
  `;

  wrap.querySelectorAll('.pcal-time-block').forEach(b => {
    b.addEventListener('click', e => { e.stopPropagation(); openDetail(b.dataset.id); });
  });
  wrap.querySelectorAll('.pcal-hour-cell').forEach(c => {
    c.addEventListener('click', () => {
      openModal(null, { date: cal.selectedDate, time: `${p2(Number(c.dataset.hour))}:00` });
    });
  });
}

// ── Switch views ──────────────────────────────────────────

async function goDayView(dateStr) {
  cal.selectedDate = dateStr;
  cal.view = 'day';
  const d = fromIso(dateStr);
  const needsReload =
    d.getFullYear() !== cal.year || d.getMonth() !== cal.month;
  if (needsReload) {
    cal.year = d.getFullYear();
    cal.month = d.getMonth();
    cal.weekStart = isoMondayOf(d);
    await loadAppointments();
  } else {
    cal.weekStart = isoMondayOf(d);
  }
  renderAll();
}

async function goWeekView(dateStr) {
  cal.weekStart = isoMondayOf(fromIso(dateStr));
  cal.view = 'week';
  const d = fromIso(cal.weekStart);
  cal.year = d.getFullYear();
  cal.month = d.getMonth();
  await loadAppointments();
  renderAll();
}

async function switchView(view) {
  if (view === cal.view) return;
  cal.view = view;
  if (view === 'day' && !cal.selectedDate) cal.selectedDate = iso(new Date());
  if (view === 'week' && !cal.weekStart)    cal.weekStart = isoMondayOf(new Date());
  await loadAppointments();
  renderAll();
}

// ── Right detail drawer ───────────────────────────────────

function openDetail(id) {
  const a = cal.appointments.find(x => x.id === id);
  if (!a) return;
  cal.selectedAptId = id;
  const t = window.dT || ((k) => k);
  const body = document.getElementById('detail-body');
  const drawer = document.getElementById('pcal-detail');
  const backdrop = document.getElementById('pcal-detail-backdrop');

  const pr = cal.practitioners.find(p => p.id === a.practitioner_id);
  const practDisplay = pr ? practName(pr)
    : [a.practitioner_title, a.practitioner_first_name, a.practitioner_last_name].filter(Boolean).join(' ');

  const statusLabels = {
    scheduled: t('status_scheduled'),
    completed: t('status_completed'),
    noshow:    t('status_noshow'),
    cancelled: t('status_cancel'),
    archived:  t('status_archived'),
  };

  const dateStr = longDate(a.appointment_date);
  const endTime = computeEndTime(a.appointment_time, a.duration_minutes);

  body.innerHTML = `
    <span class="pcal-detail-status status-${esc(a.status)}">● ${esc(statusLabels[a.status] || a.status)}</span>
    <div class="pcal-detail-name">${esc(a.patient_first_name)} ${esc(a.patient_last_name)}</div>

    <div class="pcal-detail-when">
      <strong>${esc(dateStr)}</strong>
      <span class="pcal-detail-when-meta">${esc(a.appointment_time)} – ${esc(endTime)} · ${esc(a.duration_minutes || 30)} ${t('lbl_min')}</span>
    </div>

    <dl class="pcal-detail-grid">
      ${practDisplay ? `<dt>${t('form_practitioner')}</dt><dd>${esc(practDisplay)}</dd>` : ''}
      ${a.appointment_type ? `<dt>${t('form_type')}</dt><dd>${esc(normalizeAppointmentType(a.appointment_type))}</dd>` : ''}
      ${a.patient_email ? `<dt>${t('form_email_p')}</dt><dd><a href="mailto:${esc(a.patient_email)}">${esc(a.patient_email)}</a></dd>` : ''}
      ${a.patient_phone ? `<dt>${t('form_phone_p')}</dt><dd><a href="tel:${esc(a.patient_phone)}">${esc(a.patient_phone)}</a></dd>` : ''}
    </dl>

    ${a.notes ? `
      <div class="pcal-detail-section-title">${t('form_notes')}</div>
      <div class="pcal-detail-notes">${esc(a.notes)}</div>
    ` : ''}

    <div class="pcal-detail-section-title">${t('form_status_change')}</div>
    <div class="pcal-detail-actions" id="detail-status-buttons"></div>

    <div class="pcal-detail-actions" style="margin-top:.75rem;">
      <button type="button" class="btn btn-primary btn-sm" id="btn-detail-edit">${esc(translate('btn_edit', 'Bearbeiten'))}</button>
    </div>
  `;

  renderDetailStatusButtons(a.status);

  body.querySelector('#btn-detail-edit')?.addEventListener('click', () => {
    closeDetail();
    openModal(a.id);
  });

  drawer.classList.add('is-open');
  drawer.setAttribute('aria-hidden', 'false');
  backdrop.hidden = false;
  // allow transition
  requestAnimationFrame(() => backdrop.classList.add('is-open'));

  // mark selected in current view
  document.querySelectorAll('.pcal-chip, .pcal-time-block').forEach(el => {
    el.classList.toggle('is-selected', el.dataset.id === id);
  });
}

function renderDetailStatusButtons(current) {
  const container = document.getElementById('detail-status-buttons');
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
    btn.addEventListener('click', () => applyStatusFromDetail(btn.dataset.status));
  });
}

async function applyStatusFromDetail(newStatus) {
  if (!cal.selectedAptId) return;
  try {
    if (newStatus === 'cancelled') {
      await API.delete(`/api/appointments/${cal.selectedAptId}`);
    } else {
      await API.put(`/api/appointments/${cal.selectedAptId}`, { status: newStatus });
    }
    const id = cal.selectedAptId;
    await loadAppointments();
    const refreshed = cal.appointments.find(x => x.id === id);
    renderAll();
    if (refreshed) openDetail(id);
    else closeDetail();
  } catch (err) {
    const body = document.getElementById('detail-body');
    if (body) {
      const a = document.createElement('div');
      a.className = 'alert alert-danger';
      a.style.marginBottom = '1rem';
      a.textContent = err.message;
      body.prepend(a);
    }
  }
}

function closeDetail() {
  const drawer = document.getElementById('pcal-detail');
  const backdrop = document.getElementById('pcal-detail-backdrop');
  drawer.classList.remove('is-open');
  drawer.setAttribute('aria-hidden', 'true');
  backdrop.classList.remove('is-open');
  setTimeout(() => { backdrop.hidden = true; }, 220);
  cal.selectedAptId = null;
  document.querySelectorAll('.pcal-chip.is-selected, .pcal-time-block.is-selected').forEach(el => {
    el.classList.remove('is-selected');
  });
}

function computeEndTime(start, durationMin) {
  if (!start) return '';
  const [h, m] = start.split(':').map(Number);
  const total = h * 60 + m + (Number(durationMin) || 30);
  const eh = Math.floor(total / 60) % 24;
  const em = total % 60;
  return `${p2(eh)}:${p2(em)}`;
}

// ── Modal (create / edit) ─────────────────────────────────

function openModal(id, prefill) {
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

    const presetDate = (prefill && prefill.date) || cal.selectedDate;
    const presetTime = (prefill && prefill.time) || '';
    if (presetDate) setField(form, 'appointment_date', presetDate);
    if (presetTime) setField(form, 'appointment_time', presetTime);

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
    practitioner_id:    form.elements['practitioner_id'].value,
    appointment_date:   form.elements['appointment_date'].value,
    appointment_time:   form.elements['appointment_time'].value,
    duration_minutes:   Number(form.elements['duration_minutes'].value),
    appointment_type:   form.elements['appointment_type'].value || null,
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

// ── Listeners ─────────────────────────────────────────────

function setupListeners() {
  // Prev / next / today
  document.getElementById('btn-prev')?.addEventListener('click', async () => {
    if (cal.view === 'day') {
      const d = fromIso(cal.selectedDate);
      d.setDate(d.getDate() - 1);
      cal.selectedDate = iso(d);
      cal.weekStart = isoMondayOf(d);
      const needsReload = d.getMonth() !== cal.month || d.getFullYear() !== cal.year;
      if (needsReload) { cal.year = d.getFullYear(); cal.month = d.getMonth(); await loadAppointments(); }
    } else if (cal.view === 'week') {
      const d = fromIso(cal.weekStart);
      d.setDate(d.getDate() - 7);
      cal.weekStart = iso(d);
      cal.year = d.getFullYear(); cal.month = d.getMonth();
      await loadAppointments();
    } else {
      cal.month--;
      if (cal.month < 0) { cal.month = 11; cal.year--; }
      cal.selectedDate = iso(new Date(cal.year, cal.month, 1));
      await loadAppointments();
    }
    renderAll();
  });

  document.getElementById('btn-next')?.addEventListener('click', async () => {
    if (cal.view === 'day') {
      const d = fromIso(cal.selectedDate);
      d.setDate(d.getDate() + 1);
      cal.selectedDate = iso(d);
      cal.weekStart = isoMondayOf(d);
      const needsReload = d.getMonth() !== cal.month || d.getFullYear() !== cal.year;
      if (needsReload) { cal.year = d.getFullYear(); cal.month = d.getMonth(); await loadAppointments(); }
    } else if (cal.view === 'week') {
      const d = fromIso(cal.weekStart);
      d.setDate(d.getDate() + 7);
      cal.weekStart = iso(d);
      cal.year = d.getFullYear(); cal.month = d.getMonth();
      await loadAppointments();
    } else {
      cal.month++;
      if (cal.month > 11) { cal.month = 0; cal.year++; }
      cal.selectedDate = iso(new Date(cal.year, cal.month, 1));
      await loadAppointments();
    }
    renderAll();
  });

  document.getElementById('btn-today')?.addEventListener('click', async () => {
    const now = new Date();
    cal.year = now.getFullYear();
    cal.month = now.getMonth();
    cal.selectedDate = iso(now);
    cal.weekStart = isoMondayOf(now);
    await loadAppointments();
    renderAll();
  });

  // View tabs
  document.querySelectorAll('.pcal-view-tab').forEach(btn => {
    btn.addEventListener('click', () => switchView(btn.dataset.view));
  });

  // Filters
  document.getElementById('filter-practitioner')?.addEventListener('change', async e => {
    cal.filterPractitionerId = e.target.value;
    await loadAppointments(); renderAll();
  });

  document.getElementById('filter-archive')?.addEventListener('change', async e => {
    cal.filterArchive = e.target.value;
    await loadAppointments(); renderAll();
  });

  document.getElementById('filter-type')?.addEventListener('change', e => {
    cal.filterType = e.target.value;
    renderAll();
  });

  // Filter panel toggle (mobile)
  document.getElementById('btn-toggle-filters')?.addEventListener('click', () => {
    document.getElementById('pcal-filters').classList.toggle('is-open');
  });
  document.getElementById('btn-close-filters')?.addEventListener('click', () => {
    document.getElementById('pcal-filters').classList.remove('is-open');
  });

  // New appointment
  document.getElementById('btn-new-apt')?.addEventListener('click', () => openModal(null));

  // Detail drawer
  document.getElementById('btn-close-detail')?.addEventListener('click', closeDetail);
  document.getElementById('pcal-detail-backdrop')?.addEventListener('click', closeDetail);

  // Modal
  document.getElementById('btn-close-modal')?.addEventListener('click', closeModal);
  document.getElementById('btn-cancel-modal')?.addEventListener('click', closeModal);
  document.getElementById('modal-appointment')?.addEventListener('click', e => {
    if (e.target === document.getElementById('modal-appointment')) closeModal();
  });

  // Keyboard: Esc closes drawer / modal
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    const modal = document.getElementById('modal-appointment');
    if (modal && !modal.classList.contains('hidden')) { closeModal(); return; }
    const drawer = document.getElementById('pcal-detail');
    if (drawer && drawer.classList.contains('is-open')) { closeDetail(); return; }
    const filters = document.getElementById('pcal-filters');
    if (filters && filters.classList.contains('is-open')) { filters.classList.remove('is-open'); }
  });

  document.getElementById('btn-logout')?.addEventListener('click', async () => {
    try { await API.post('/api/auth/logout'); } finally {
      window.location.href = '/login.html';
    }
  });
}

// ── Translation helper (with fallback) ────────────────────

function translate(key, fallback) {
  if (typeof window.dT !== 'function') return fallback;
  const v = window.dT(key);
  return (v === key || v == null) ? fallback : v;
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
