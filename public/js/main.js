const API = {
  async request(method, url, data) {
    const opts = {
      method,
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      credentials: 'include',
    };
    if (data) opts.body = JSON.stringify(data);
    const res = await fetch(url, opts);
    const json = await res.json().catch(() => ({}));
    if (res.status === 402 && json.account_status === 'paused') {
      showPausedBanner();
      throw new Error(json.error || 'Konto pausiert');
    }
    if (!res.ok) throw new Error(json.error || 'Fehler beim Server');
    return json;
  },
  get: (url) => API.request('GET', url),
  post: (url, data) => API.request('POST', url, data),
  put: (url, data) => API.request('PUT', url, data),
  delete: (url) => API.request('DELETE', url),
};

function showAlert(msg, type = 'info', container) {
  const el = document.createElement('div');
  el.className = `alert alert-${type}`;
  el.textContent = msg;
  const target = container || document.querySelector('main') || document.body;
  target.prepend(el);
  setTimeout(() => el.remove(), 5000);
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return `${d}.${m}.${y}`;
}

const MAIN_LOCALE_MAP = { de:'de-DE', en:'en-GB', fr:'fr-FR', es:'es-ES', pt:'pt-BR', ar:'ar-SA', ru:'ru-RU', zh:'zh-CN', hi:'hi-IN', th:'th-TH', tr:'tr-TR', id:'id-ID' };

function getLocale() {
  const lang = window.dLang ? window.dLang() : (document.cookie.split(';').map(c=>c.trim()).find(c=>c.startsWith('lang='))?.split('=')[1] || 'de');
  return MAIN_LOCALE_MAP[lang] || 'de-DE';
}

function formatCurrency(amount) {
  return new Intl.NumberFormat(getLocale(), { style: 'currency', currency: 'EUR' }).format(amount);
}

function statusBadge(status) {
  const t = window.dT || ((k) => k);
  const labels = {
    scheduled: t('status_scheduled') || 'Geplant',
    completed: t('status_completed') || 'Abgeschlossen',
    cancelled: t('status_cancel') || 'Abgesagt',
    noshow: t('status_noshow') || 'Nicht erschienen',
    archived: t('status_archived') || 'Archiviert',
    draft: 'Entwurf',
    paid: 'Bezahlt',
    pending: 'Ausstehend',
    waiting: 'Wartend',
  };
  return `<span class="badge badge-${status}">${labels[status] || status}</span>`;
}

async function checkAuth() {
  try {
    await API.get('/api/auth/me');
    return true;
  } catch {
    window.location.href = '/login.html';
    return false;
  }
}

function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

function showPausedBanner() {
  if (document.getElementById('paused-banner')) return;
  const banner = document.createElement('div');
  banner.id = 'paused-banner';
  banner.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:9999;background:#d93025;color:#fff;text-align:center;padding:.875rem 1rem;font-size:.9375rem;font-weight:500;';
  banner.innerHTML = 'Ihr Konto ist pausiert. <a href="/subscription.html" style="color:#fff;text-decoration:underline;">Jetzt erneuern</a>';
  document.body.prepend(banner);
}

const APPOINTMENT_TYPES = [
  'Ersttermin', 'Folgetermin', 'Vorsorge', 'Beratung',
  'Impfung', 'Überweisung', 'Sonstiges',
];

const TYPE_MIGRATION = {
  'Erstuntersuchung':    'Ersttermin',
  'Nachuntersuchung':    'Folgetermin',
  'Beratungsgespräch':   'Beratung',
  'Vorsorgeuntersuchung':'Vorsorge',
};

function normalizeAppointmentType(type) {
  if (!type) return '';
  return TYPE_MIGRATION[type] || type;
}

window.API = API;
window.showAlert = showAlert;
window.formatDate = formatDate;
window.formatCurrency = formatCurrency;
window.statusBadge = statusBadge;
window.checkAuth = checkAuth;
window.getQueryParam = getQueryParam;
window.showPausedBanner = showPausedBanner;
window.APPOINTMENT_TYPES = APPOINTMENT_TYPES;
window.normalizeAppointmentType = normalizeAppointmentType;
