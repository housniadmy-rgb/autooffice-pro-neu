/* eslint-disable */
// Profile-Menü oben rechts:
//  • macht den Benutzernamen klickbar
//  • zeigt Dropdown: Mein Konto / Passwort ändern / Abmelden
//  • öffnet ein Modal zum Ändern des Passworts (PUT /api/auth/password)
//
// Hängt sich an bestehende #user-name + #btn-logout Elemente.
// Funktioniert auf allen authentifizierten Seiten (dashboard, settings, …).

(function () {
  if (window.__profileMenuInit) return;
  window.__profileMenuInit = true;

  function t(key, fallback) {
    if (typeof window.dT === 'function') {
      var val = window.dT(key);
      if (val && val !== key) return val;
    }
    return fallback;
  }

  function esc(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function L_MY_ACCOUNT()   { return t('menu_my_account', 'Mein Konto'); }
  function L_CHANGE_PW()    { return t('section_password', 'Passwort ändern'); }
  function L_LOGOUT()       { return t('btn_logout', 'Abmelden'); }
  function L_CURRENT_PW()   { return t('form_current_pw', 'Aktuelles Passwort'); }
  function L_NEW_PW()       { return t('form_new_pw', 'Neues Passwort'); }
  function L_CONFIRM_PW()   { return t('form_confirm_pw', 'Neues Passwort bestätigen'); }
  function L_SAVE()         { return t('btn_change_pw', 'Passwort ändern'); }
  function L_CANCEL()       { return t('btn_cancel', 'Abbrechen'); }
  function L_NO_MATCH()     { return t('err_passwords_nomatch', 'Die neuen Passwörter stimmen nicht überein.'); }
  function L_TOO_SHORT()    { return t('err_password_short', 'Das neue Passwort muss mindestens 8 Zeichen lang sein.'); }
  function L_SAVED()        { return t('msg_password_saved', 'Passwort wurde erfolgreich geändert.'); }
  function L_CLOSE()        { return t('btn_close', 'Schließen'); }

  function initials(name) {
    var parts = (name || '').trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return '?';
    var first = parts[0][0] || '';
    var last = parts.length > 1 ? parts[parts.length - 1][0] : '';
    return (first + last).toUpperCase() || '?';
  }

  function buildTrigger(displayName) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'profile-menu-trigger';
    btn.className = 'profile-menu-trigger';
    btn.setAttribute('aria-haspopup', 'true');
    btn.setAttribute('aria-expanded', 'false');
    // Wichtig: das innere Namen-Span trägt id="user-name", damit bestehender Code
    // wie document.getElementById('user-name').textContent = '...' weiter funktioniert.
    btn.innerHTML =
      '<span class="profile-avatar" aria-hidden="true">' + esc(initials(displayName)) + '</span>' +
      '<span class="profile-name" id="user-name">' + esc(displayName) + '</span>' +
      '<span class="profile-caret" aria-hidden="true">▾</span>';
    return btn;
  }

  function buildDropdown() {
    var dd = document.createElement('div');
    dd.id = 'profile-dropdown';
    dd.className = 'profile-dropdown';
    dd.setAttribute('role', 'menu');
    dd.innerHTML = ''
      + '<a class="profile-dropdown-item" role="menuitem" href="/settings.html" data-pm-action="account">'
      +   '<span class="profile-item-icon" aria-hidden="true">👤</span>'
      +   '<span data-pm-label="my_account">' + esc(L_MY_ACCOUNT()) + '</span>'
      + '</a>'
      + '<button type="button" class="profile-dropdown-item" role="menuitem" data-pm-action="change-password">'
      +   '<span class="profile-item-icon" aria-hidden="true">🔑</span>'
      +   '<span data-pm-label="change_pw">' + esc(L_CHANGE_PW()) + '</span>'
      + '</button>'
      + '<div class="profile-dropdown-divider" role="separator"></div>'
      + '<button type="button" class="profile-dropdown-item" role="menuitem" data-pm-action="logout">'
      +   '<span class="profile-item-icon" aria-hidden="true">↩</span>'
      +   '<span data-pm-label="logout">' + esc(L_LOGOUT()) + '</span>'
      + '</button>';
    return dd;
  }

  function buildModal() {
    var backdrop = document.createElement('div');
    backdrop.id = 'change-pw-modal';
    backdrop.className = 'modal-backdrop hidden';
    backdrop.setAttribute('role', 'dialog');
    backdrop.setAttribute('aria-modal', 'true');
    backdrop.setAttribute('aria-labelledby', 'change-pw-title');
    backdrop.innerHTML = ''
      + '<div class="modal">'
      +   '<div class="modal-header">'
      +     '<h2 id="change-pw-title">' + esc(L_CHANGE_PW()) + '</h2>'
      +     '<button type="button" class="modal-close" aria-label="' + esc(L_CLOSE()) + '" data-pm-action="close-modal">×</button>'
      +   '</div>'
      +   '<div id="change-pw-alert"></div>'
      +   '<form id="change-pw-form" autocomplete="off">'
      +     '<div class="form-group">'
      +       '<label class="form-label" for="cpw-current">' + esc(L_CURRENT_PW()) + '</label>'
      +       '<input type="password" id="cpw-current" name="current_password" class="form-control" required autocomplete="current-password">'
      +     '</div>'
      +     '<div class="form-group">'
      +       '<label class="form-label" for="cpw-new">' + esc(L_NEW_PW()) + '</label>'
      +       '<input type="password" id="cpw-new" name="new_password" class="form-control" required minlength="8" autocomplete="new-password">'
      +     '</div>'
      +     '<div class="form-group">'
      +       '<label class="form-label" for="cpw-confirm">' + esc(L_CONFIRM_PW()) + '</label>'
      +       '<input type="password" id="cpw-confirm" name="confirm_password" class="form-control" required minlength="8" autocomplete="new-password">'
      +     '</div>'
      +     '<div class="modal-footer">'
      +       '<button type="button" class="btn btn-secondary" data-pm-action="close-modal">' + esc(L_CANCEL()) + '</button>'
      +       '<button type="submit" id="cpw-submit" class="btn btn-primary">' + esc(L_SAVE()) + '</button>'
      +     '</div>'
      +   '</form>'
      + '</div>';
    return backdrop;
  }

  function showAlert(msg, type) {
    var box = document.getElementById('change-pw-alert');
    if (box) box.innerHTML = '<div class="alert alert-' + type + '">' + esc(msg) + '</div>';
  }

  var lastFocus = null;

  function openModal() {
    closeDropdown();
    var modal = document.getElementById('change-pw-modal');
    if (!modal) return;
    lastFocus = document.activeElement;
    modal.classList.remove('hidden');
    var form = document.getElementById('change-pw-form');
    if (form) form.reset();
    var alertBox = document.getElementById('change-pw-alert');
    if (alertBox) alertBox.innerHTML = '';
    setTimeout(function () {
      var first = document.getElementById('cpw-current');
      if (first) first.focus();
    }, 0);
  }

  function closeModal() {
    var modal = document.getElementById('change-pw-modal');
    if (!modal) return;
    modal.classList.add('hidden');
    if (lastFocus && typeof lastFocus.focus === 'function') {
      try { lastFocus.focus(); } catch (e) {}
    }
  }

  function openDropdown() {
    var dd = document.getElementById('profile-dropdown');
    var trig = document.getElementById('profile-menu-trigger');
    if (!dd || !trig) return;
    dd.classList.add('open');
    trig.setAttribute('aria-expanded', 'true');
  }

  function closeDropdown() {
    var dd = document.getElementById('profile-dropdown');
    var trig = document.getElementById('profile-menu-trigger');
    if (dd) dd.classList.remove('open');
    if (trig) trig.setAttribute('aria-expanded', 'false');
  }

  function toggleDropdown() {
    var dd = document.getElementById('profile-dropdown');
    if (!dd) return;
    if (dd.classList.contains('open')) closeDropdown();
    else openDropdown();
  }

  async function doLogout() {
    closeDropdown();
    try {
      if (window.API && typeof window.API.post === 'function') {
        await window.API.post('/api/auth/logout');
      } else {
        await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
      }
    } catch (e) {}
    window.location.href = '/login.html';
  }

  async function submitChange(e) {
    e.preventDefault();
    var form = e.target;
    var btn = document.getElementById('cpw-submit');
    if (btn) btn.disabled = true;
    var alertBox = document.getElementById('change-pw-alert');
    if (alertBox) alertBox.innerHTML = '';

    var current = form.elements['current_password'].value;
    var nw      = form.elements['new_password'].value;
    var conf    = form.elements['confirm_password'].value;

    if (nw.length < 8) {
      showAlert(L_TOO_SHORT(), 'danger');
      if (btn) btn.disabled = false;
      return;
    }
    if (nw !== conf) {
      showAlert(L_NO_MATCH(), 'danger');
      if (btn) btn.disabled = false;
      return;
    }

    try {
      if (window.API && typeof window.API.put === 'function') {
        await window.API.put('/api/auth/password', { current_password: current, new_password: nw });
      } else {
        var res = await fetch('/api/auth/password', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ current_password: current, new_password: nw }),
        });
        var json = await res.json().catch(function () { return {}; });
        if (!res.ok) throw new Error(json.error || 'Fehler');
      }
      form.reset();
      showAlert(L_SAVED(), 'success');
      setTimeout(closeModal, 1500);
    } catch (err) {
      showAlert((err && err.message) || 'Fehler', 'danger');
    } finally {
      if (btn) btn.disabled = false;
    }
  }

  function refreshLabels() {
    var byKey = function (k, txt) {
      document.querySelectorAll('[data-pm-label="' + k + '"]').forEach(function (el) { el.textContent = txt; });
    };
    byKey('my_account', L_MY_ACCOUNT());
    byKey('change_pw', L_CHANGE_PW());
    byKey('logout', L_LOGOUT());
    var title = document.getElementById('change-pw-title');
    if (title) title.textContent = L_CHANGE_PW();
  }

  function install() {
    var nameEl = document.getElementById('user-name');
    if (!nameEl) return;

    var displayName = (nameEl.textContent || '').trim() || '...';
    // ID am Original-Element entfernen, damit unser neues Span sie übernehmen kann.
    nameEl.removeAttribute('id');

    var trigger = buildTrigger(displayName);
    var dropdown = buildDropdown();

    var wrapper = document.createElement('div');
    wrapper.className = 'profile-menu';
    wrapper.appendChild(trigger);
    wrapper.appendChild(dropdown);

    nameEl.replaceWith(wrapper);

    // Vorhandenen "Abmelden"-Knopf nur ausblenden, nicht entfernen.
    // (Manche Seiten hängen Listener direkt per getElementById('btn-logout') ohne ?.)
    var oldLogoutBtn = document.getElementById('btn-logout');
    if (oldLogoutBtn) {
      oldLogoutBtn.style.display = 'none';
      oldLogoutBtn.setAttribute('aria-hidden', 'true');
      oldLogoutBtn.tabIndex = -1;
    }

    if (!document.getElementById('change-pw-modal')) {
      document.body.appendChild(buildModal());
    }

    trigger.addEventListener('click', function (e) {
      e.stopPropagation();
      toggleDropdown();
    });

    dropdown.addEventListener('click', function (e) {
      var target = e.target.closest('[data-pm-action]');
      if (!target) return;
      var action = target.getAttribute('data-pm-action');
      if (action === 'logout') {
        e.preventDefault();
        doLogout();
      } else if (action === 'change-password') {
        e.preventDefault();
        openModal();
      } else if (action === 'account') {
        closeDropdown();
      }
    });

    document.addEventListener('click', function (e) {
      if (!wrapper.contains(e.target)) closeDropdown();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        closeDropdown();
        var m = document.getElementById('change-pw-modal');
        if (m && !m.classList.contains('hidden')) closeModal();
      }
    });

    var modal = document.getElementById('change-pw-modal');
    if (modal) {
      modal.addEventListener('click', function (e) {
        if (e.target === modal) closeModal();
        var t = e.target.closest('[data-pm-action="close-modal"]');
        if (t) closeModal();
      });
      var form = document.getElementById('change-pw-form');
      if (form) form.addEventListener('submit', submitChange);
    }

    // Wenn der Anzeigename erst nach einem fetch gesetzt wird, beobachten und übernehmen.
    var nameSpan = trigger.querySelector('.profile-name');
    var avatar = trigger.querySelector('.profile-avatar');

    function syncAvatar() {
      if (avatar && nameSpan) avatar.textContent = initials(nameSpan.textContent || '');
    }

    function setName(newName) {
      if (!newName) return;
      if (nameSpan) nameSpan.textContent = newName;
      syncAvatar();
    }

    // Wenn Anwendungscode den Namen per nameSpan.textContent = ... aktualisiert,
    // synchronisieren wir die Initialen automatisch.
    if (nameSpan && typeof MutationObserver === 'function') {
      var mo = new MutationObserver(syncAvatar);
      mo.observe(nameSpan, { childList: true, characterData: true, subtree: true });
    }

    // Falls dashboard.js o.ä. den Namen erst später lädt, holen wir ihn proaktiv nach.
    function pollFromApi() {
      if (!window.API || typeof window.API.get !== 'function') return;
      if (displayName !== '...' && displayName !== '') return;
      window.API.get('/api/auth/me').then(function (u) {
        if (u && (u.first_name || u.last_name)) {
          setName(((u.first_name || '') + ' ' + (u.last_name || '')).trim());
        }
      }).catch(function () {});
    }
    pollFromApi();

    // Auf nachträgliche Updates eines (entfernten) #user-name reagieren wäre overkill –
    // stattdessen exponieren wir setName, sodass Seiten den Namen direkt setzen könnten.
    window.profileMenuSetName = setName;
    window.profileMenuRefreshLabels = refreshLabels;

    // Sprache kann nach dem Render umschalten – Labels neu setzen, wenn dT verfügbar wird.
    if (typeof window.dT !== 'function') {
      var tries = 0;
      var iv = setInterval(function () {
        tries++;
        if (typeof window.dT === 'function') {
          refreshLabels();
          clearInterval(iv);
        } else if (tries > 20) {
          clearInterval(iv);
        }
      }, 100);
    } else {
      refreshLabels();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', install);
  } else {
    install();
  }
})();
