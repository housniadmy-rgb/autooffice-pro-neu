// ── Init ──────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', async () => {
  const ok = await checkAuth();
  if (!ok) return;

  await loadUserInfo();
  await loadProfile();
  await loadSubscription();
  await loadArchiveSetting();
  setupListeners();
});

async function loadUserInfo() {
  try {
    const user = await API.get('/api/auth/me');
    const el = document.getElementById('user-name');
    if (el) el.textContent = `${user.first_name} ${user.last_name}`;

    const bookingInput = document.getElementById('booking-link-input');
    if (bookingInput) bookingInput.value = `${window.location.origin}/booking.html?p=${user.practice_id}`;
  } catch {}
}

async function loadProfile() {
  const t = window.dT || ((k) => k);
  try {
    const practice = await API.get('/api/practices');
    const fields = ['name', 'phone', 'email', 'website', 'address', 'zip', 'city', 'description', 'opening_hours'];
    fields.forEach(f => {
      const el = document.getElementById(`inp-${f.replace('_', '-')}`);
      if (el) el.value = practice[f] || '';
    });
  } catch (err) {
    showProfileAlert(t('err_load_profile') + ': ' + err.message, 'danger');
  }
}

async function loadSubscription() {
  const t = window.dT || ((k) => k);
  try {
    const sub = await API.get('/api/practices/subscription');

    const langSelect = document.getElementById('lang-select');
    if (langSelect && sub.language) langSelect.value = sub.language;

    const container = document.getElementById('subscription-info');
    if (!container) return;

    const pkgLabel = sub.package === 'UNLIMITED' ? 'UNLIMITED' : 'BASIC';
    const pkgClass = sub.package === 'UNLIMITED' ? 'badge-unlimited' : 'badge-basic';

    let trialHtml = '';
    if (sub.trial_end_date) {
      if (sub.trial_days_left > 0) {
        trialHtml = `
          <div class="alert alert-info" style="margin-top:1rem;">
            ${t('msg_trial_active').replace('{date}', formatDate(sub.trial_end_date)).replace('{days}', sub.trial_days_left)}
          </div>`;
      } else {
        trialHtml = `
          <div class="alert alert-danger" style="margin-top:1rem;">
            ${t('msg_trial_expired_settings').replace('{date}', formatDate(sub.trial_end_date))}
          </div>`;
      }
    }

    let statusHtml = '';
    if (sub.account_status === 'paused') {
      statusHtml = `
        <div class="alert alert-danger" style="margin-top:1rem;">
          ${t('msg_account_paused')}
        </div>`;
    }

    const pkgFeatures = sub.package === 'UNLIMITED'
      ? `<li>${t('lbl_pkg_unlimited_apts')}</li><li>${t('lbl_pkg_unlimited_pract')}</li><li>${t('lbl_pkg_invoices')}</li><li>${t('lbl_pkg_online_booking')}</li>`
      : `<li>${t('lbl_pkg_basic_apts')}</li><li>${t('lbl_pkg_basic_pract')}</li><li>${t('lbl_pkg_invoices')}</li><li>${t('lbl_pkg_online_booking')}</li>`;

    container.innerHTML = `
      <div style="display:flex;align-items:flex-start;gap:1.5rem;flex-wrap:wrap;">
        <div>
          <div style="margin-bottom:.5rem;">
            ${t('lbl_current_package')}: <span class="badge ${pkgClass}" style="font-size:.9375rem;padding:.3rem .875rem;">${pkgLabel}</span>
          </div>
          <ul class="package-features" style="margin-top:.5rem;">${pkgFeatures}</ul>
        </div>
        <div style="flex:1;min-width:200px;">
          ${sub.package !== 'UNLIMITED' ? `
            <p style="font-size:.9375rem;color:var(--text-secondary);margin-bottom:.75rem;">
              ${t('msg_upgrade_hint')}
            </p>
            <a href="/subscription.html" class="btn btn-primary btn-sm">${t('btn_upgrade_package')}</a>
          ` : `<p style="font-size:.9375rem;color:var(--secondary);">${t('msg_already_unlimited')}</p>`}
        </div>
      </div>
      ${trialHtml}
      ${statusHtml}
    `;
  } catch (err) {
    console.error('Abonnement-Info konnte nicht geladen werden:', err.message);
  }
}

async function loadArchiveSetting() {
  try {
    const settings = await API.get('/api/practices/settings');
    const sel = document.getElementById('archive-select');
    if (sel && settings.archive_months != null) sel.value = settings.archive_months;
  } catch {}
}

// ── Helpers ───────────────────────────────────────────────

function showProfileAlert(msg, type) {
  document.getElementById('profile-alert').innerHTML = `<div class="alert alert-${type}">${esc(msg)}</div>`;
}

function showPasswordAlert(msg, type) {
  document.getElementById('password-alert').innerHTML = `<div class="alert alert-${type}">${esc(msg)}</div>`;
}

// ── Listeners ─────────────────────────────────────────────

function setupListeners() {
  document.getElementById('profile-form')?.addEventListener('submit', async e => {
    e.preventDefault();
    const t = window.dT || ((k) => k);
    const btn = document.getElementById('btn-save-profile');
    btn.disabled = true;
    document.getElementById('profile-alert').innerHTML = '';

    const form = e.target;
    const data = {
      name:          form.elements['name'].value.trim(),
      phone:         form.elements['phone'].value.trim(),
      email:         form.elements['email'].value.trim(),
      website:       form.elements['website'].value.trim(),
      address:       form.elements['address'].value.trim(),
      zip:           form.elements['zip'].value.trim(),
      city:          form.elements['city'].value.trim(),
      description:   form.elements['description'].value.trim(),
      opening_hours: form.elements['opening_hours'].value.trim(),
    };

    if (!data.name) {
      showProfileAlert(t('err_practice_name_required'), 'danger');
      btn.disabled = false;
      return;
    }

    try {
      await API.put('/api/practices', data);
      showProfileAlert(t('msg_profile_saved'), 'success');
      setTimeout(() => { document.getElementById('profile-alert').innerHTML = ''; }, 3000);
    } catch (err) {
      showProfileAlert(err.message, 'danger');
    } finally {
      btn.disabled = false;
    }
  });

  document.getElementById('password-form')?.addEventListener('submit', async e => {
    e.preventDefault();
    const t = window.dT || ((k) => k);
    const btn = document.getElementById('btn-save-password');
    btn.disabled = true;
    document.getElementById('password-alert').innerHTML = '';

    const form = e.target;
    const current = form.elements['current_password'].value;
    const newPw = form.elements['new_password'].value;
    const confirm = form.elements['confirm_password'].value;

    if (newPw !== confirm) {
      showPasswordAlert(t('err_passwords_nomatch'), 'danger');
      btn.disabled = false;
      return;
    }
    if (newPw.length < 8) {
      showPasswordAlert(t('err_password_short'), 'danger');
      btn.disabled = false;
      return;
    }

    try {
      await API.put('/api/auth/password', { current_password: current, new_password: newPw });
      form.reset();
      showPasswordAlert(t('msg_password_saved'), 'success');
      setTimeout(() => { document.getElementById('password-alert').innerHTML = ''; }, 3000);
    } catch (err) {
      showPasswordAlert(err.message, 'danger');
    } finally {
      btn.disabled = false;
    }
  });

  document.getElementById('btn-save-lang')?.addEventListener('click', async () => {
    const t = window.dT || ((k) => k);
    const sel = document.getElementById('lang-select');
    if (!sel) return;
    const lang = sel.value;
    try {
      await API.put('/api/practices/language', { language: lang });
      document.cookie = `lang=${lang};path=/;max-age=${365*24*3600}`;
      const alertEl = document.getElementById('lang-alert');
      if (alertEl) {
        alertEl.innerHTML = `<div class="alert alert-success">${t('msg_lang_saved')}</div>`;
        setTimeout(() => { alertEl.innerHTML = ''; }, 3000);
      }
    } catch (err) {
      const alertEl = document.getElementById('lang-alert');
      if (alertEl) alertEl.innerHTML = `<div class="alert alert-danger">${esc(err.message)}</div>`;
    }
  });

  document.getElementById('btn-copy-booking')?.addEventListener('click', () => {
    const t = window.dT || ((k) => k);
    const input = document.getElementById('booking-link-input');
    if (!input) return;
    navigator.clipboard.writeText(input.value).then(() => {
      const fb = document.getElementById('copy-feedback');
      fb.textContent = t('msg_copied');
      setTimeout(() => { fb.textContent = ''; }, 2500);
    }).catch(() => {
      input.select();
      document.execCommand('copy');
    });
  });

  document.getElementById('btn-load-activity')?.addEventListener('click', async () => {
    const container = document.getElementById('activity-log-container');
    const tbody = document.getElementById('activity-log-tbody');
    container.style.display = '';
    const t = window.dT || ((k) => k);
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;padding:1rem;color:var(--text-secondary);">${t('loading')}</td></tr>`;

    const ACTION_LABELS = {
      'login': t('action_login'),
      'appointment.created': t('action_apt_created'),
      'appointment.updated': t('action_apt_updated'),
      'appointment.cancelled': t('action_apt_cancelled'),
      'invoice.created': t('action_inv_created'),
    };

    try {
      const entries = await API.get('/api/activity-log?limit=100');
      if (!entries.length) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;padding:1rem;color:var(--text-secondary);">${t('no_data')}</td></tr>`;
        return;
      }
      tbody.innerHTML = entries.map(e => {
        const dt = new Date(e.created_at);
        const sLocale = typeof getLocale === 'function' ? getLocale() : 'de-DE';
        const dateStr = isNaN(dt) ? esc(e.created_at) : `${dt.toLocaleDateString(sLocale)} ${dt.toLocaleTimeString(sLocale, { hour: '2-digit', minute: '2-digit' })}`;
        const actionLabel = ACTION_LABELS[e.action] || esc(e.action);
        let details = '';
        try { details = e.details ? JSON.stringify(JSON.parse(e.details), null, 0).replace(/[{}"]/g, '').replace(/,/g, ', ') : ''; } catch { details = esc(e.details || ''); }
        return `<tr>
          <td style="white-space:nowrap;font-size:.875rem;">${dateStr}</td>
          <td><span class="badge badge-scheduled" style="font-size:.8125rem;">${esc(actionLabel)}</span></td>
          <td style="font-size:.875rem;">${esc(e.user_email || '–')}</td>
          <td style="font-size:.8125rem;color:var(--text-secondary);">${esc(details)}</td>
        </tr>`;
      }).join('');
    } catch (err) {
      tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;padding:1rem;color:var(--danger);">${esc(err.message)}</td></tr>`;
    }
  });

  document.getElementById('btn-save-archive')?.addEventListener('click', async () => {
    const t = window.dT || ((k) => k);
    const sel = document.getElementById('archive-select');
    if (!sel) return;
    try {
      await API.put('/api/practices/settings', { archive_months: sel.value });
      const alertEl = document.getElementById('archive-alert');
      if (alertEl) {
        alertEl.innerHTML = `<div class="alert alert-success">${t('msg_archive_saved')}</div>`;
        setTimeout(() => { alertEl.innerHTML = ''; }, 3000);
      }
    } catch (err) {
      const alertEl = document.getElementById('archive-alert');
      if (alertEl) alertEl.innerHTML = `<div class="alert alert-danger">${esc(err.message)}</div>`;
    }
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
