// Language switcher – reads current language from cookie and saves on change

(function () {
  function getCookie(name) {
    const match = document.cookie.split(';').map(c => c.trim()).find(c => c.startsWith(name + '='));
    return match ? decodeURIComponent(match.split('=')[1]) : null;
  }

  function initLangSwitcher() {
    const sel = document.getElementById('header-lang-select');
    if (!sel) return;

    // Set current language from cookie or default to 'de'
    const current = getCookie('lang') || 'de';
    sel.value = current;

    sel.addEventListener('change', async () => {
      const lang = sel.value;
      document.cookie = `lang=${lang};path=/;max-age=${365 * 24 * 3600};samesite=lax`;
      try {
        await API.put('/api/practices/language', { language: lang });
      } catch (err) {
        console.warn('[lang-switcher] Could not save language:', err.message);
      }
      window.location.reload();
    });
  }

  // Run after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLangSwitcher);
  } else {
    initLangSwitcher();
  }
})();
