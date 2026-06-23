document.addEventListener('DOMContentLoaded', async () => {
  const ok = await checkAuth();
  if (!ok) return;

  await loadUserInfo();
  await loadDashboard();
  highlightActiveSidebarLink();
});

async function loadUserInfo() {
  try {
    const user = await API.get('/api/auth/me');
    const nameEl = document.getElementById('user-name');
    if (nameEl) nameEl.textContent = `${user.first_name} ${user.last_name}`;
  } catch (err) {
    console.error(err);
  }
}

async function loadDashboard() {
  try {
    const data = await API.get('/api/dashboard');

    // Sync language cookie from practice profile (first login fix)
    if (data.practice && data.practice.language) {
      const cookieLang = document.cookie.split(';').map(c => c.trim())
        .find(c => c.startsWith('lang='));
      const currentLang = cookieLang ? decodeURIComponent(cookieLang.split('=')[1]) : null;
      if (currentLang !== data.practice.language) {
        document.cookie = `lang=${data.practice.language};path=/;max-age=${365 * 24 * 3600};samesite=lax`;
        window.location.reload();
        return;
      }
    }

    renderPracticeInfo(data.practice);
    renderStats(data.stats, data.limits, data.practice.package);
    renderAutomation(data.automation);
    renderTodayAppointments(data.today_appointments);
  } catch (err) {
    showAlert(dT ? dT('msg_no_apts_today') : 'Dashboard konnte nicht geladen werden: ' + err.message, 'danger');
  }
}

function renderPracticeInfo(practice) {
  const nameEl = document.getElementById('practice-name');
  if (nameEl) nameEl.textContent = practice.name || '';

  const badge = document.getElementById('package-badge');
  if (badge) {
    badge.textContent = practice.package || 'BASIC';
    badge.className = 'badge ' + (practice.package === 'UNLIMITED' ? 'badge-unlimited' : 'badge-basic');
  }

  if (practice.trial_end_date) {
    const end = new Date(practice.trial_end_date);
    const now = new Date();
    const diffDays = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    const t = window.dT || ((k) => k);

    const trialEl = document.getElementById('trial-info');
    if (trialEl) {
      if (diffDays > 0) {
        const tpl = t('msg_trial_days');
        trialEl.textContent = tpl.replace('{date}', formatDate(practice.trial_end_date)).replace('{days}', diffDays);
      } else {
        trialEl.textContent = t('msg_trial_expired');
        trialEl.style.color = 'var(--danger)';
      }
    }

    const bannerContainer = document.getElementById('trial-banner-container');
    if (bannerContainer) {
      if (diffDays > 0 && diffDays <= 5) {
        const msg = t('msg_trial_banner').replace('{days}', diffDays).replace('{date}', formatDate(practice.trial_end_date));
        bannerContainer.innerHTML = `
          <div class="trial-banner">
            ${msg}
            <a href="/subscription.html" class="btn btn-sm btn-secondary" style="white-space:nowrap;">${t('btn_upgrade')}</a>
          </div>`;
      } else if (diffDays <= 0) {
        bannerContainer.innerHTML = `
          <div class="trial-banner expired">
            <strong>${t('msg_trial_banner_exp')}</strong>
            <a href="/subscription.html" class="btn btn-sm btn-danger" style="white-space:nowrap;">${t('btn_activate')}</a>
          </div>`;
      }
    }
  }
}

function renderStats(stats, limits, pkg) {
  setValue('stat-today', stats.today_appointments);

  const monthly = stats.monthly_appointments;
  const monthlyLimit = limits ? limits.monthly_appointments : null;
  setValue('stat-monthly', monthlyLimit !== null ? `${monthly} / ${monthlyLimit}` : monthly);

  const monthlyLabel = document.getElementById('stat-monthly-label');
  if (monthlyLabel && monthlyLimit !== null) {
    const t = window.dT || ((k) => k);
    monthlyLabel.textContent = `${t('stat_monthly')} (Limit: ${monthlyLimit})`;
    if (monthly >= monthlyLimit) {
      document.getElementById('stat-monthly').style.color = 'var(--danger)';
    }
  }

  setValue('stat-revenue', formatCurrency(stats.today_revenue || 0));
  setValue('stat-complaints', stats.open_complaints);

  const practitioners = stats.practitioner_count;
  const practLimit = limits ? limits.practitioners : null;
  setValue('stat-practitioners', practLimit !== null ? `${practitioners} / ${practLimit}` : practitioners);

  const practLabel = document.getElementById('stat-practitioners-label');
  if (practLabel && practLimit !== null) {
    const t = window.dT || ((k) => k);
    practLabel.textContent = `${t('stat_practitioners')} (Limit: ${practLimit})`;
    if (practitioners >= practLimit) {
      document.getElementById('stat-practitioners').style.color = 'var(--danger)';
    }
  }
}

const LANG_LOCALE_MAP = {
  de: 'de-DE', en: 'en-GB', fr: 'fr-FR', es: 'es-ES', pt: 'pt-BR',
  ar: 'ar-SA', ru: 'ru-RU', zh: 'zh-CN', hi: 'hi-IN', th: 'th-TH',
  tr: 'tr-TR', id: 'id-ID',
};

function renderAutomation(auto) {
  if (!auto) return;
  setValue('auto-waitlist', auto.waitlist_waiting);
  setValue('auto-review-mails', auto.pending_review_mails);
  setValue('auto-trials', auto.trials_expiring_soon);

  const cleanupEl = document.getElementById('auto-cleanup');
  if (cleanupEl) {
    if (auto.last_cleanup) {
      const lang = window.dLang ? window.dLang() : 'de';
      const locale = LANG_LOCALE_MAP[lang] || 'de-DE';
      cleanupEl.textContent = new Date(auto.last_cleanup).toLocaleString(locale, { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } else {
      cleanupEl.textContent = window.dT ? dT('loading') : '–';
    }
  }
}

function setValue(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function renderTodayAppointments(appointments) {
  const tbody = document.getElementById('today-appointments');
  if (!tbody) return;

  if (!appointments || appointments.length === 0) {
    const msg = window.dT ? dT('msg_no_apts_today') : 'Keine Termine heute';
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:var(--text-secondary);padding:2rem;">${msg}</td></tr>`;
    return;
  }

  const t = window.dT || ((k) => k);
  const uhrSuffix = t('lbl_uhr');
  tbody.innerHTML = appointments.map((a) => {
    const timeDisplay = uhrSuffix ? `${a.appointment_time} ${uhrSuffix}` : a.appointment_time;
    return `
    <tr>
      <td>${timeDisplay}</td>
      <td>${a.patient_first_name} ${a.patient_last_name}</td>
      <td>${a.appointment_type || '–'}</td>
      <td>${a.practitioner_title ? a.practitioner_title + ' ' : ''}${a.practitioner_first_name || ''} ${a.practitioner_last_name || ''}</td>
      <td>${statusBadge(a.status)}</td>
    </tr>
  `}).join('');
}

function highlightActiveSidebarLink() {
  const path = window.location.pathname;
  document.querySelectorAll('.sidebar-nav a').forEach((link) => {
    link.classList.toggle('active', link.getAttribute('href') === path);
  });
}

document.getElementById('btn-logout')?.addEventListener('click', async () => {
  try {
    await API.post('/api/auth/logout');
    window.location.href = '/login.html';
  } catch {
    window.location.href = '/login.html';
  }
});
