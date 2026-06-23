// ── State ─────────────────────────────────────────────────

function getDayNames() {
  const locale = typeof getLocale === 'function' ? getLocale() : 'de-DE';
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(2024, 0, 1 + i); // 2024-01-01 was Monday
    return new Intl.DateTimeFormat(locale, { weekday: 'long' }).format(d);
  });
}

const pr = {
  list: [],
  isUnlimited: false,
  limit: 3,
  practiceId: null,
  editingId: null,
  availabilityPractId: null,
};

// ── Init ──────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', async () => {
  const ok = await checkAuth();
  if (!ok) return;

  loadUserInfo();
  await Promise.all([loadMe(), loadPackageInfo()]);
  await loadPractitioners();
  renderAll();
  setupListeners();
});

async function loadUserInfo() {
  try {
    const user = await API.get('/api/auth/me');
    const el = document.getElementById('user-name');
    if (el) el.textContent = `${user.first_name} ${user.last_name}`;
  } catch {}
}

async function loadMe() {
  try {
    const me = await API.get('/api/auth/me');
    pr.practiceId = me.practice_id;
    renderBookingLink();
  } catch {}
}

async function loadPackageInfo() {
  try {
    const data = await API.get('/api/dashboard');
    pr.isUnlimited = data.practice.package === 'UNLIMITED';
    pr.limit = (data.limits && data.limits.practitioners) ? data.limits.practitioners : 3;
  } catch {}
}

async function loadPractitioners() {
  const t = window.dT || ((k) => k);
  try {
    pr.list = await API.get('/api/practitioners');
    await Promise.all(pr.list.map(async (p) => {
      try {
        const av = await API.get(`/api/practitioners/${p.id}/availability`);
        p._availCount = Array.isArray(av) ? av.length : 0;
      } catch {
        p._availCount = 0;
      }
    }));
  } catch (err) {
    showAlert(t('err_load_practitioners') + ': ' + err.message, 'danger');
  }
}

// ── Helpers ───────────────────────────────────────────────

function activeCount() {
  return pr.list.filter(p => p.active).length;
}

function atLimit() {
  return !pr.isUnlimited && activeCount() >= pr.limit;
}

function esc(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function fullName(p) {
  return [p.title, p.first_name, p.last_name].filter(Boolean).join(' ');
}

// ── Render ────────────────────────────────────────────────

function renderAll() {
  renderBookingLink();
  renderLimitBanner();
  renderTable();
  updateNewButton();
}

function renderBookingLink() {
  const el = document.getElementById('booking-link');
  if (!el || !pr.practiceId) return;
  el.textContent = `${window.location.origin}/booking.html?p=${pr.practiceId}`;
}

function renderLimitBanner() {
  const t = window.dT || ((k) => k);
  const banner = document.getElementById('limit-banner');
  if (!banner) return;

  if (pr.isUnlimited) { banner.style.display = 'none'; return; }

  const count = activeCount();
  if (count >= pr.limit) {
    banner.style.display = '';
    banner.className = 'limit-bar danger';
    const msg = t('lbl_pract_limit_reached')
      .replace('{count}', count).replace('{limit}', pr.limit);
    banner.innerHTML = `<span>${msg}</span>`;
  } else if (count >= pr.limit - 1) {
    banner.style.display = '';
    banner.className = 'limit-bar warning';
    const msg = t('lbl_pract_limit_warning')
      .replace('{count}', count).replace('{limit}', pr.limit).replace('{free}', pr.limit - count);
    banner.innerHTML = `<span>${msg}</span>`;
  } else {
    banner.style.display = 'none';
  }
}

function updateNewButton() {
  const t = window.dT || ((k) => k);
  const btn = document.getElementById('btn-new-pract');
  if (!btn) return;
  btn.disabled = atLimit();
  btn.title = atLimit() ? t('lbl_pract_limit_reached').replace('{count}', activeCount()).replace('{limit}', pr.limit) : '';
}

function renderTable() {
  const t = window.dT || ((k) => k);
  const tbody = document.getElementById('practitioners-tbody');
  if (!tbody) return;

  if (pr.list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:var(--text-secondary);padding:2rem;">${t('no_practitioners')}</td></tr>`;
    return;
  }

  tbody.innerHTML = pr.list.map(p => {
    const name = esc(fullName(p));
    const specialty = esc(p.specialty || '–');
    const contact = [p.email, p.phone].filter(Boolean).map(esc).join('<br>') || '–';
    const availBadge = p._availCount > 0
      ? `<span style="font-size:.8125rem;color:var(--secondary);">${p._availCount} ${t('lbl_avail_rules')}</span>`
      : `<span style="font-size:.8125rem;color:var(--text-secondary);">${t('lbl_avail_default')}</span>`;
    const statusBadge = p.active
      ? `<span class="badge badge-completed">${t('lbl_active')}</span>`
      : `<span class="badge badge-draft">${t('lbl_inactive')}</span>`;

    const deactivateBtn = p.active
      ? `<button class="btn btn-sm btn-secondary" data-deactivate="${esc(p.id)}">${t('btn_deactivate')}</button>`
      : `<button class="btn btn-sm btn-secondary" data-activate="${esc(p.id)}" ${atLimit() ? `disabled title="${t('lbl_pract_limit_reached').replace('{count}', activeCount()).replace('{limit}', pr.limit)}"` : ''}>${t('btn_reactivate')}</button>`;

    return `<tr>
      <td style="font-weight:500;">${name}</td>
      <td>${specialty}</td>
      <td style="font-size:.875rem;">${contact}</td>
      <td>${availBadge}</td>
      <td>${statusBadge}</td>
      <td style="text-align:right;white-space:nowrap;">
        <button class="btn btn-sm btn-secondary" data-avail="${esc(p.id)}" style="margin-right:.375rem;">${t('btn_times')}</button>
        <button class="btn btn-sm btn-secondary" data-edit="${esc(p.id)}" style="margin-right:.375rem;">${t('btn_edit')}</button>
        ${deactivateBtn}
      </td>
    </tr>`;
  }).join('');

  tbody.querySelectorAll('[data-edit]').forEach(btn =>
    btn.addEventListener('click', () => openModal(btn.dataset.edit))
  );
  tbody.querySelectorAll('[data-deactivate]').forEach(btn =>
    btn.addEventListener('click', () => deactivate(btn.dataset.deactivate))
  );
  tbody.querySelectorAll('[data-activate]').forEach(btn =>
    btn.addEventListener('click', () => activate(btn.dataset.activate))
  );
  tbody.querySelectorAll('[data-avail]').forEach(btn =>
    btn.addEventListener('click', () => openAvailModal(btn.dataset.avail))
  );
}

// ── Modal ─────────────────────────────────────────────────

function openModal(id) {
  const t = window.dT || ((k) => k);
  const modal = document.getElementById('modal-pract');
  const form  = document.getElementById('pract-form');
  const alert = document.getElementById('modal-pract-alert');

  form.reset();
  alert.innerHTML = '';
  pr.editingId = id || null;

  if (id) {
    const p = pr.list.find(x => x.id === id);
    if (!p) return;
    document.getElementById('modal-pract-title').textContent = t('modal_edit_pract');
    form.elements['first_name'].value = p.first_name || '';
    form.elements['last_name'].value  = p.last_name  || '';
    form.elements['title'].value      = p.title      || '';
    form.elements['specialty'].value  = p.specialty  || '';
    form.elements['email'].value      = p.email      || '';
    form.elements['phone'].value      = p.phone      || '';
    form.elements['bio'].value        = p.bio        || '';
  } else {
    document.getElementById('modal-pract-title').textContent = t('modal_new_pract');
  }

  modal.classList.remove('hidden');
}

function closeModal() {
  document.getElementById('modal-pract').classList.add('hidden');
  pr.editingId = null;
}

// ── CRUD ──────────────────────────────────────────────────

document.getElementById('pract-form')?.addEventListener('submit', async e => {
  e.preventDefault();
  const t = window.dT || ((k) => k);
  const alert = document.getElementById('modal-pract-alert');
  alert.innerHTML = '';

  const form = e.target;
  const data = {
    first_name: form.elements['first_name'].value.trim(),
    last_name:  form.elements['last_name'].value.trim(),
    title:      form.elements['title'].value.trim()    || null,
    specialty:  form.elements['specialty'].value.trim() || null,
    email:      form.elements['email'].value.trim()    || null,
    phone:      form.elements['phone'].value.trim()    || null,
    bio:        form.elements['bio'].value.trim()      || null,
  };

  if (!data.first_name || !data.last_name) {
    alert.innerHTML = `<div class="alert alert-danger">${t('err_name_required')}</div>`;
    return;
  }

  if (!pr.editingId && atLimit()) {
    alert.innerHTML = `<div class="alert alert-danger">${t('err_pract_limit')}</div>`;
    return;
  }

  const btn = document.getElementById('btn-save-pract');
  btn.disabled = true;

  try {
    if (pr.editingId) {
      await API.put(`/api/practitioners/${pr.editingId}`, data);
    } else {
      await API.post('/api/practitioners', data);
    }
    closeModal();
    await loadPractitioners();
    renderAll();
  } catch (err) {
    alert.innerHTML = `<div class="alert alert-danger">${esc(err.message)}</div>`;
  } finally {
    btn.disabled = false;
  }
});

async function deactivate(id) {
  const t = window.dT || ((k) => k);
  const p = pr.list.find(x => x.id === id);
  if (!p) return;
  if (!confirm(t('confirm_deactivate').replace('{name}', fullName(p)))) return;

  try {
    await API.delete(`/api/practitioners/${id}`);
    await loadPractitioners();
    renderAll();
  } catch (err) {
    showAlert(err.message, 'danger');
  }
}

async function activate(id) {
  const t = window.dT || ((k) => k);
  if (atLimit()) {
    showAlert(t('err_pract_limit'), 'danger');
    return;
  }

  try {
    await API.put(`/api/practitioners/${id}`, { active: 1 });
    await loadPractitioners();
    renderAll();
  } catch (err) {
    showAlert(err.message, 'danger');
  }
}

// ── Availability Modal ────────────────────────────────────

async function openAvailModal(practId) {
  const t = window.dT || ((k) => k);
  pr.availabilityPractId = practId;
  const p = pr.list.find(x => x.id === practId);
  const title = document.getElementById('modal-avail-title');
  if (title && p) title.textContent = `${t('modal_avail')} – ${fullName(p)}`;

  document.getElementById('modal-avail-alert').innerHTML = '';

  let existing = [];
  try {
    existing = await API.get(`/api/practitioners/${practId}/availability`);
  } catch {}

  const dayNames = getDayNames();
  const grid = document.getElementById('avail-grid');
  grid.innerHTML = dayNames.map((dayName, dow) => {
    const slot = existing.find(s => s.day_of_week === dow);
    const checked = !!slot;
    const start = slot ? slot.start_time : '08:00';
    const end = slot ? slot.end_time : '18:00';
    return `<div class="avail-row" style="display:flex;align-items:center;gap:.75rem;">
      <label style="width:110px;display:flex;align-items:center;gap:.5rem;cursor:pointer;font-size:.9375rem;">
        <input type="checkbox" class="avail-check" data-dow="${dow}" ${checked ? 'checked' : ''}> ${esc(dayName)}
      </label>
      <input type="time" class="form-control avail-start" data-dow="${dow}" value="${esc(start)}" style="width:110px;" ${!checked ? 'disabled' : ''}>
      <span style="color:var(--text-secondary);font-size:.875rem;">–</span>
      <input type="time" class="form-control avail-end" data-dow="${dow}" value="${esc(end)}" style="width:110px;" ${!checked ? 'disabled' : ''}>
    </div>`;
  }).join('');

  grid.querySelectorAll('.avail-check').forEach(cb => {
    cb.addEventListener('change', () => {
      const dow = cb.dataset.dow;
      grid.querySelector(`.avail-start[data-dow="${dow}"]`).disabled = !cb.checked;
      grid.querySelector(`.avail-end[data-dow="${dow}"]`).disabled = !cb.checked;
    });
  });

  document.getElementById('modal-avail').classList.remove('hidden');
}

function closeAvailModal() {
  document.getElementById('modal-avail').classList.add('hidden');
  pr.availabilityPractId = null;
}

// ── Event listeners ───────────────────────────────────────

function setupListeners() {
  document.getElementById('btn-new-pract')?.addEventListener('click', () => {
    if (!atLimit()) openModal(null);
  });

  document.getElementById('btn-close-pract')?.addEventListener('click', closeModal);
  document.getElementById('btn-cancel-pract')?.addEventListener('click', closeModal);

  document.getElementById('modal-pract')?.addEventListener('click', e => {
    if (e.target === document.getElementById('modal-pract')) closeModal();
  });

  document.getElementById('btn-close-avail')?.addEventListener('click', closeAvailModal);
  document.getElementById('btn-cancel-avail')?.addEventListener('click', closeAvailModal);
  document.getElementById('modal-avail')?.addEventListener('click', e => {
    if (e.target === document.getElementById('modal-avail')) closeAvailModal();
  });

  document.getElementById('btn-save-avail')?.addEventListener('click', async () => {
    const t = window.dT || ((k) => k);
    if (!pr.availabilityPractId) return;
    const alert = document.getElementById('modal-avail-alert');
    alert.innerHTML = '';
    const grid = document.getElementById('avail-grid');
    const dayNames = getDayNames();
    const slots = [];

    let valid = true;
    grid.querySelectorAll('.avail-check:checked').forEach(cb => {
      const dow = parseInt(cb.dataset.dow);
      const start = grid.querySelector(`.avail-start[data-dow="${dow}"]`).value;
      const end = grid.querySelector(`.avail-end[data-dow="${dow}"]`).value;
      if (!start || !end || start >= end) {
        alert.innerHTML = `<div class="alert alert-danger">${t('err_invalid_times')} (${esc(dayNames[dow])})</div>`;
        valid = false;
        return;
      }
      slots.push({ day_of_week: dow, start_time: start, end_time: end });
    });

    if (!valid) return;

    const btn = document.getElementById('btn-save-avail');
    btn.disabled = true;
    try {
      await API.put(`/api/practitioners/${pr.availabilityPractId}/availability`, { slots });
      closeAvailModal();
      await loadPractitioners();
      renderAll();
      showAlert(t('msg_avail_saved'), 'success');
    } catch (err) {
      alert.innerHTML = `<div class="alert alert-danger">${esc(err.message)}</div>`;
    } finally {
      btn.disabled = false;
    }
  });

  document.getElementById('btn-copy-link')?.addEventListener('click', async () => {
    const t = window.dT || ((k) => k);
    const link = document.getElementById('booking-link')?.textContent;
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      const btn = document.getElementById('btn-copy-link');
      const orig = btn.textContent;
      btn.textContent = t('msg_copied');
      setTimeout(() => { btn.textContent = orig; }, 2000);
    } catch {
      showAlert(t('err_copy_link'), 'warning');
    }
  });

  document.getElementById('btn-logout')?.addEventListener('click', async () => {
    try { await API.post('/api/auth/logout'); } finally {
      window.location.href = '/login.html';
    }
  });
}
