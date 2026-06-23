// ── State ─────────────────────────────────────────────────

const wl = {
  all: [],
  filter: '',
};

// ── Init ──────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', async () => {
  const ok = await checkAuth();
  if (!ok) return;

  await loadUserInfo();
  await loadWaitlist();
  setupListeners();
});

async function loadUserInfo() {
  try {
    const user = await API.get('/api/auth/me');
    const el = document.getElementById('user-name');
    if (el) el.textContent = `${user.first_name} ${user.last_name}`;

    const linkEl = document.getElementById('waitlist-link');
    if (linkEl) linkEl.href = `${window.location.origin}/waitlist.html?p=${user.practice_id}`;
  } catch {}
}

async function loadWaitlist() {
  try {
    const data = await API.get('/api/waitlist');
    wl.all = data;
    renderStats();
    renderTable();
  } catch (err) {
    console.error('Warteliste laden:', err.message);
  }
}

// ── Render ────────────────────────────────────────────────

function renderStats() {
  document.getElementById('count-waiting').textContent = wl.all.filter(e => e.status === 'waiting').length;
  document.getElementById('count-offered').textContent = wl.all.filter(e => e.status === 'offered').length;
  document.getElementById('count-booked').textContent = wl.all.filter(e => e.status === 'booked').length;
}

function renderTable() {
  const tbody = document.getElementById('waitlist-tbody');
  if (!tbody) return;

  const filtered = wl.filter ? wl.all.filter(e => e.status === wl.filter) : wl.all;

  if (filtered.length === 0) {
    const t2 = window.dT || ((k) => k);
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:var(--text-secondary);padding:2rem;">${t2('no_data')}</td></tr>`;
    return;
  }

  const t = window.dT || ((k) => k);
  const lang = window.dLang ? window.dLang() : 'de';
  const LANG_LOCALE_MAP = { de:'de-DE', en:'en-GB', fr:'fr-FR', es:'es-ES', pt:'pt-BR', ar:'ar-SA', ru:'ru-RU', zh:'zh-CN', hi:'hi-IN', th:'th-TH', tr:'tr-TR', id:'id-ID' };
  const locale = LANG_LOCALE_MAP[lang] || 'de-DE';

  tbody.innerHTML = filtered.map(e => {
    const date = e.created_at
      ? new Date(e.created_at).toLocaleDateString(locale, { day: '2-digit', month: '2-digit', year: 'numeric' })
      : '–';
    const statusBadgeHtml = {
      waiting:  `<span class="badge badge-pending">${t('status_waiting')}</span>`,
      offered:  `<span class="badge badge-scheduled">${t('status_offered')}</span>`,
      booked:   `<span class="badge badge-paid">${t('status_booked')}</span>`,
      cancelled: `<span class="badge badge-cancelled">${t('status_cancelled')}</span>`,
    }[e.status] || `<span class="badge">${esc(e.status)}</span>`;

    const deleteBtn = e.status !== 'booked'
      ? `<button class="btn btn-sm" style="color:var(--danger);background:none;border:1px solid var(--danger);" onclick="deleteEntry('${esc(e.id)}')">${t('btn_delete')}</button>`
      : '';

    return `<tr>
      <td style="white-space:nowrap;">${esc(date)}</td>
      <td>${esc(e.patient_first_name)} ${esc(e.patient_last_name)}</td>
      <td>${esc(e.patient_email)}</td>
      <td>${esc(e.patient_phone || '–')}</td>
      <td style="max-width:160px;font-size:.875rem;">${esc(e.preferred_period || '–')}</td>
      <td>${statusBadgeHtml}</td>
      <td style="text-align:right;">${deleteBtn}</td>
    </tr>`;
  }).join('');
}

// ── Actions ───────────────────────────────────────────────

async function deleteEntry(id) {
  const t = window.dT || ((k) => k);
  if (!confirm(t('confirm_delete_waitlist'))) return;
  try {
    await API.delete(`/api/waitlist/${id}`);
    await loadWaitlist();
  } catch (err) {
    alert(err.message);
  }
}

// ── Listeners ─────────────────────────────────────────────

function setupListeners() {
  document.querySelectorAll('.filter-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      wl.filter = btn.dataset.filter;
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
