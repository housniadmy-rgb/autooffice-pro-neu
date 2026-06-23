/* Hamburger menu – dashboard pages (sidebar) and public pages */
(function () {
  'use strict';

  var DASH_ITEMS = [
    { icon: '📊', key: 'nav_dashboard',              href: '/dashboard.html' },
    { icon: '📅', key: 'nav_calendar',               href: '/appointments.html' },
    { icon: '🧾', key: 'nav_invoices',               href: '/invoices.html' },
    { icon: '📄', key: 'nav_recipes',                href: '/recipes.html' },
    { icon: '⭐', key: 'nav_reviews',                href: '/reviews.html' },
    { icon: '🧑', key: 'nav_patients',               href: '/patients.html' },
    { icon: '👤', key: 'nav_practitioners',           href: '/practitioners.html' },
    { icon: '📋', key: 'nav_waitlist',               href: '/waitlist-admin.html' },
    { icon: '🤖', key: 'nav_ai',                     href: '/ai-praxismanager.html' },
    { icon: '⚙️', key: 'nav_settings',               href: '/settings.html' },
  ];

  var FALLBACK = {
    nav_dashboard: 'Übersicht', nav_calendar: 'Kalender', nav_invoices: 'Rechnungen',
    nav_recipes: 'Rezepte', nav_reviews: 'Bewertungen', nav_patients: 'Patienten',
    nav_practitioners: 'Behandler', nav_waitlist: 'Warteliste',
    nav_ai: 'AI Praxismanager', nav_settings: 'Einstellungen',
  };

  function t(key) {
    if (typeof window.dT === 'function') return window.dT(key) || FALLBACK[key] || key;
    if (typeof window.pT === 'function') return window.pT(key) || FALLBACK[key] || key;
    return FALLBACK[key] || key;
  }

  function currentPath() { return window.location.pathname; }

  function isActive(href) {
    var p = currentPath();
    return p === href || p.endsWith(href);
  }

  function inject() {
    if (document.getElementById('hamburger-btn')) return;

    var container = document.querySelector('.site-header .container');
    if (!container) return;

    var isDashboard = !!document.querySelector('.sidebar');
    var isRTL = document.documentElement.dir === 'rtl';
    var navItems = [];

    if (isDashboard) {
      DASH_ITEMS.forEach(function (item) {
        navItems.push({ icon: item.icon, label: t(item.key), href: item.href });
      });
    } else {
      /* Public page: mirror nav <a> links, skip lang-switcher and placeholder hrefs */
      var navEl = container.querySelector('.nav');
      if (navEl) {
        Array.from(navEl.querySelectorAll('a')).forEach(function (a) {
          if (a.closest('.lang-switcher')) return;
          var href = a.getAttribute('href');
          if (!href || href === '#') return;
          navItems.push({ icon: '', label: (a.textContent || '').trim(), href: href });
          a.classList.add('nav-hide-mobile');
        });
      }
      if (navItems.length === 0) return;
    }

    /* ── Hamburger button ── */
    var btn = document.createElement('button');
    btn.id = 'hamburger-btn';
    btn.className = 'hamburger-btn';
    btn.setAttribute('aria-label', 'Menu');
    btn.setAttribute('aria-expanded', 'false');
    btn.innerHTML = '<span></span><span></span><span></span>';

    if (isRTL) {
      container.appendChild(btn);
    } else {
      container.insertBefore(btn, container.firstChild);
    }

    /* ── Overlay ── */
    var overlay = document.createElement('div');
    overlay.id = 'mobile-overlay';
    overlay.className = 'mobile-overlay';
    overlay.setAttribute('aria-hidden', 'true');
    document.body.appendChild(overlay);

    /* ── Drawer ── */
    var drawer = document.createElement('aside');
    drawer.id = 'mobile-drawer';
    drawer.className = 'mobile-drawer';
    drawer.setAttribute('role', 'navigation');
    drawer.setAttribute('aria-label', 'Mobile menu');
    drawer.setAttribute('aria-hidden', 'true');

    var dHeader = document.createElement('div');
    dHeader.className = 'mobile-drawer-header';
    var logoSpan = document.createElement('span');
    logoSpan.className = 'logo';
    logoSpan.style.fontSize = '1.1rem';
    logoSpan.textContent = 'PraxisOnline24';
    var closeBtn = document.createElement('button');
    closeBtn.id = 'mobile-drawer-close';
    closeBtn.className = 'mobile-drawer-close';
    closeBtn.setAttribute('aria-label', 'Close menu');
    closeBtn.textContent = '✕';
    dHeader.appendChild(logoSpan);
    dHeader.appendChild(closeBtn);
    drawer.appendChild(dHeader);

    var ul = document.createElement('ul');
    ul.className = 'sidebar-nav';

    navItems.forEach(function (item) {
      var li = document.createElement('li');
      var a = document.createElement('a');
      a.href = item.href;
      if (isActive(item.href)) a.classList.add('active');

      if (item.icon) {
        var icon = document.createElement('span');
        icon.className = 'nav-icon';
        icon.textContent = item.icon;
        a.appendChild(icon);
        a.appendChild(document.createTextNode(' '));
      }

      var label = document.createElement('span');
      label.textContent = item.label;
      a.appendChild(label);
      a.addEventListener('click', close);
      li.appendChild(a);
      ul.appendChild(li);
    });

    if (isDashboard) {
      var ceoLi = document.createElement('li');
      ceoLi.id = 'drawer-ceo-item';
      ceoLi.style.display = 'none';
      ceoLi.style.borderTop = '1px solid var(--border)';
      ceoLi.style.marginTop = '.5rem';
      ceoLi.style.paddingTop = '.5rem';
      var ceoA = document.createElement('a');
      ceoA.href = '/ceo-dashboard.html';
      ceoA.style.fontWeight = '600';
      if (isActive('/ceo-dashboard.html')) ceoA.classList.add('active');
      var ceoIcon = document.createElement('span');
      ceoIcon.className = 'nav-icon';
      ceoIcon.textContent = '👑';
      ceoA.appendChild(ceoIcon);
      ceoA.appendChild(document.createTextNode(' '));
      var ceoLabel = document.createElement('span');
      ceoLabel.textContent = 'CEO Dashboard';
      ceoA.appendChild(ceoLabel);
      ceoA.addEventListener('click', close);
      ceoLi.appendChild(ceoA);
      ul.appendChild(ceoLi);
    }

    drawer.appendChild(ul);
    document.body.appendChild(drawer);

    if (isDashboard) {
      fetch('/api/owner/check')
        .then(function (r) { return r.json(); })
        .then(function (d) {
          if (!d.isOwner) return;
          var drawerItem = document.getElementById('drawer-ceo-item');
          if (drawerItem) drawerItem.style.display = '';
          var sidebarItem = document.getElementById('nav-ceo-item');
          if (sidebarItem) sidebarItem.style.display = '';
        })
        .catch(function () {});
    }

    btn.addEventListener('click', open);
    closeBtn.addEventListener('click', close);
    overlay.addEventListener('click', close);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') close();
    });
  }

  function open() {
    var drawer = document.getElementById('mobile-drawer');
    var overlay = document.getElementById('mobile-overlay');
    var btn = document.getElementById('hamburger-btn');
    if (!drawer) return;
    drawer.classList.add('open');
    overlay.classList.add('open');
    if (btn) { btn.classList.add('open'); btn.setAttribute('aria-expanded', 'true'); }
    drawer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    var drawer = document.getElementById('mobile-drawer');
    var overlay = document.getElementById('mobile-overlay');
    var btn = document.getElementById('hamburger-btn');
    if (!drawer) return;
    drawer.classList.remove('open');
    overlay.classList.remove('open');
    if (btn) { btn.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); }
    drawer.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }
})();
