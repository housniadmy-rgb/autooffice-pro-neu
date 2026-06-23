// ── Init ──────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', async () => {
  const ok = await checkAuth();
  if (!ok) return;

  loadUserInfo();
  await Promise.all([loadPractitioners(), loadLogs()]);
  setupListeners();
});

async function loadUserInfo() {
  try {
    const user = await API.get('/api/auth/me');
    const el = document.getElementById('user-name');
    if (el) el.textContent = `${user.first_name} ${user.last_name}`;
  } catch {}
}

async function loadPractitioners() {
  const t = window.dT || ((k) => k);
  try {
    const list = await API.get('/api/practitioners');
    const sel = document.getElementById('sel-practitioner');
    if (!sel) return;
    sel.innerHTML = `<option value="">${t('ph_practitioner')}</option>`;
    list.filter(p => p.active).forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = [p.title, p.first_name, p.last_name].filter(Boolean).join(' ');
      sel.appendChild(opt);
    });
    if (list.filter(p => p.active).length === 0) {
      document.getElementById('log-alert').innerHTML =
        `<div class="alert alert-warning">${t('err_no_practitioners')}</div>`;
    }
  } catch (err) {
    console.error('Behandler laden:', err.message);
  }
}

async function loadLogs() {
  const t = window.dT || ((k) => k);
  try {
    const logs = await API.get('/api/recipes/logs');
    renderLogs(logs);
  } catch (err) {
    showAlert(t('err_recipe_load') + ': ' + err.message, 'danger');
    renderLogs([]);
  }
}

// ── Render ────────────────────────────────────────────────

function renderLogs(logs) {
  const tbody = document.getElementById('log-tbody');
  if (!tbody) return;

  const t = window.dT || ((k) => k);
  if (logs.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:var(--text-secondary);padding:2rem;">${t('no_recipes')}</td></tr>`;
    return;
  }

  const locale = typeof getLocale === 'function' ? getLocale() : 'de-DE';
  tbody.innerHTML = logs.map(log => {
    const dt = log.printed_at
      ? new Date(log.printed_at).toLocaleString(locale, { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' })
      : '–';
    const practitioner = [log.practitioner_first_name, log.practitioner_last_name].filter(Boolean).join(' ');
    return `<tr>
      <td style="white-space:nowrap;">${esc(dt)}</td>
      <td>${esc(practitioner)}</td>
      <td>${esc(log.patient_first_name)} ${esc(log.patient_last_name)}</td>
      <td style="font-size:.875rem;color:var(--text-secondary);">${esc(log.printed_by || '–')}</td>
    </tr>`;
  }).join('');
}

// ── Form submit ───────────────────────────────────────────

document.getElementById('log-form')?.addEventListener('submit', async e => {
  e.preventDefault();
  const t = window.dT || ((k) => k);
  const alertEl = document.getElementById('log-alert');
  alertEl.innerHTML = '';

  const form = e.target;
  const data = {
    practitioner_id:   form.elements['practitioner_id'].value,
    patient_first_name: form.elements['patient_first_name'].value.trim(),
    patient_last_name:  form.elements['patient_last_name'].value.trim(),
  };

  if (!data.practitioner_id || !data.patient_first_name || !data.patient_last_name) {
    alertEl.innerHTML = `<div class="alert alert-danger">${t('err_recipe_required')}</div>`;
    return;
  }

  const btn = document.getElementById('btn-log');
  btn.disabled = true;

  try {
    await API.post('/api/recipes/log', data);
    form.reset();
    document.getElementById('sel-practitioner').value = '';
    await loadLogs();
    alertEl.innerHTML = `<div class="alert alert-success">${t('msg_recipe_logged')}</div>`;
    setTimeout(() => { alertEl.innerHTML = ''; }, 3000);
  } catch (err) {
    alertEl.innerHTML = `<div class="alert alert-danger">${esc(err.message)}</div>`;
  } finally {
    btn.disabled = false;
  }
});

// ── Listeners ─────────────────────────────────────────────

function setupListeners() {
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
