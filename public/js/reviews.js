// ── State ─────────────────────────────────────────────────

const rev = {
  all: [],
  filterVisible: null,
  practiceId: null,
};

// ── Init ──────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', async () => {
  const ok = await checkAuth();
  if (!ok) return;

  await loadUserInfo();
  await loadReviews();
  setupListeners();
});

async function loadUserInfo() {
  try {
    const user = await API.get('/api/auth/me');
    const el = document.getElementById('user-name');
    if (el) el.textContent = `${user.first_name} ${user.last_name}`;
    rev.practiceId = user.practice_id;
    const linkEl = document.getElementById('review-link');
    if (linkEl) linkEl.href = `${window.location.origin}/review.html?p=${user.practice_id}`;
  } catch {}
}

async function loadReviews() {
  try {
    const data = await API.get('/api/reviews');
    rev.all = data;
    renderStats();
    renderTable();
  } catch (err) {
    console.error('Bewertungen laden:', err.message);
  }
}

// ── Render ────────────────────────────────────────────────

function renderStats() {
  const total = rev.all.length;
  const visible = rev.all.filter(r => r.visible === 1).length;
  const pending = rev.all.filter(r => r.visible === 0).length;

  document.getElementById('count-total').textContent = total;
  document.getElementById('count-visible').textContent = visible;
  document.getElementById('count-pending').textContent = pending;

  if (total === 0) {
    document.getElementById('avg-stars').textContent = '☆☆☆☆☆';
    document.getElementById('avg-score').textContent = '–';
    return;
  }

  const avg = rev.all.reduce((sum, r) => sum + r.rating, 0) / total;
  const full = Math.round(avg);
  document.getElementById('avg-stars').textContent = '★'.repeat(full) + '☆'.repeat(5 - full);
  const t = window.dT || ((k) => k);
  const reviewWord = t('page_reviews');
  document.getElementById('avg-score').textContent = `${avg.toFixed(1)} / 5 (${total} ${reviewWord})`;
}

function renderTable() {
  const tbody = document.getElementById('reviews-tbody');
  if (!tbody) return;

  const filtered = rev.filterVisible === null
    ? rev.all
    : rev.all.filter(r => r.visible === rev.filterVisible);

  if (filtered.length === 0) {
    const t2 = window.dT || ((k) => k);
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:var(--text-secondary);padding:2rem;">${t2('no_data')}</td></tr>`;
    return;
  }

  const t = window.dT || ((k) => k);
  const lang = window.dLang ? window.dLang() : 'de';
  const LANG_LOCALE_MAP = { de:'de-DE', en:'en-GB', fr:'fr-FR', es:'es-ES', pt:'pt-BR', ar:'ar-SA', ru:'ru-RU', zh:'zh-CN', hi:'hi-IN', th:'th-TH', tr:'tr-TR', id:'id-ID' };
  const locale = LANG_LOCALE_MAP[lang] || 'de-DE';

  tbody.innerHTML = filtered.map(r => {
    const date = r.created_at
      ? new Date(r.created_at).toLocaleDateString(locale, { day: '2-digit', month: '2-digit', year: 'numeric' })
      : '–';
    const stars = '★'.repeat(r.rating) + '☆'.repeat(5 - r.rating);
    const author = r.author_name || t('lbl_anonym') || 'Anonym';
    const comment = r.comment || '–';
    const statusLabel = r.visible === 1
      ? `<span class="badge badge-paid">${t('status_visible')}</span>`
      : `<span class="badge badge-draft">${t('status_pending')}</span>`;

    const approveBtn = r.visible === 0
      ? `<button class="btn btn-secondary btn-sm" onclick="approveReview('${esc(r.id)}')">${t('btn_approve')}</button>`
      : '';
    const hideBtn = r.visible === 1
      ? `<button class="btn btn-secondary btn-sm" onclick="hideReview('${esc(r.id)}')">${t('btn_hide')}</button>`
      : '';
    const deleteBtn = `<button class="btn btn-sm" style="color:var(--danger);background:none;border:1px solid var(--danger);" onclick="deleteReview('${esc(r.id)}')">${t('btn_delete')}</button>`;

    return `<tr>
      <td style="white-space:nowrap;">${esc(date)}</td>
      <td>${esc(author)}</td>
      <td style="color:var(--warning);letter-spacing:.05em;">${stars}</td>
      <td style="max-width:300px;">${esc(comment)}</td>
      <td>${statusLabel}</td>
      <td style="text-align:right;white-space:nowrap;display:flex;gap:.5rem;justify-content:flex-end;">
        ${approveBtn}${hideBtn}${deleteBtn}
      </td>
    </tr>`;
  }).join('');
}

// ── Actions ───────────────────────────────────────────────

async function approveReview(id) {
  try {
    await API.put(`/api/reviews/${id}/approve`, {});
    await loadReviews();
  } catch (err) {
    alert(err.message);
  }
}

async function hideReview(id) {
  try {
    await API.put(`/api/reviews/${id}/hide`, {});
    await loadReviews();
  } catch (err) {
    alert(err.message);
  }
}

async function deleteReview(id) {
  const t = window.dT || ((k) => k);
  if (!confirm(t('confirm_delete_review'))) return;
  try {
    await API.delete(`/api/reviews/${id}`);
    await loadReviews();
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
      const f = btn.dataset.filter;
      rev.filterVisible = f === '' ? null : parseInt(f);
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
