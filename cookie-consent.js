/* MyStrow — Cookie Consent (RGPD / GDPR) */
(function () {
  'use strict';
  var KEY = 'mystrow_consent';

  function _gtag() {
    if (typeof window.gtag === 'function') {
      window.gtag.apply(null, arguments);
    }
  }

  function _grantAll() {
    _gtag('consent', 'update', { analytics_storage: 'granted', ad_storage: 'granted' });
  }

  function _denyAll() {
    _gtag('consent', 'update', { analytics_storage: 'denied', ad_storage: 'denied' });
  }

  function _hideBanner() {
    var el = document.getElementById('_mst_cb');
    if (el) { el.style.opacity = '0'; setTimeout(function(){ if(el.parentNode) el.parentNode.removeChild(el); }, 300); }
  }

  function _accept() {
    try { localStorage.setItem(KEY, 'granted'); } catch(e) {}
    _grantAll();
    _hideBanner();
  }

  function _decline() {
    try { localStorage.setItem(KEY, 'denied'); } catch(e) {}
    _denyAll();
    _hideBanner();
  }

  function _privacyUrl() {
    var path = window.location.pathname;
    /* Sous-répertoires /en/ /de/ /es/ /pt/ → remonter d'un niveau */
    if (/^\/(en|de|es|pt)\//.test(path)) return '/confidentialite.html';
    return '/confidentialite.html';
  }

  function _showBanner() {
    if (document.getElementById('_mst_cb')) return;
    var b = document.createElement('div');
    b.id = '_mst_cb';
    b.setAttribute('role', 'dialog');
    b.setAttribute('aria-label', 'Consentement cookies');
    b.innerHTML =
      '<style>' +
      '#_mst_cb{' +
        'position:fixed;bottom:0;left:0;right:0;z-index:99999;' +
        'background:#0d0c09;border-top:1px solid rgba(226,206,22,.22);' +
        'padding:14px 24px;display:flex;align-items:center;gap:16px;' +
        'font-family:Inter,system-ui,sans-serif;font-size:13px;' +
        'color:#999;box-shadow:0 -8px 40px rgba(0,0,0,.7);' +
        'transition:opacity .3s;' +
      '}' +
      '#_mst_cb p{flex:1;line-height:1.55;margin:0;}' +
      '#_mst_cb a{color:#E2CE16;text-decoration:underline;text-underline-offset:3px;}' +
      '#_mst_cb .cc-btns{display:flex;gap:8px;flex-shrink:0;}' +
      '#_mst_cb_ok{background:#E2CE16;color:#0c0b00;border:none;padding:9px 22px;border-radius:7px;font-size:13px;font-weight:700;cursor:pointer;white-space:nowrap;transition:opacity .18s;}' +
      '#_mst_cb_ok:hover{opacity:.85;}' +
      '#_mst_cb_no{background:transparent;color:#777;border:1px solid rgba(255,255,255,.14);padding:9px 16px;border-radius:7px;font-size:13px;cursor:pointer;white-space:nowrap;transition:border-color .18s,color .18s;}' +
      '#_mst_cb_no:hover{border-color:#aaa;color:#ccc;}' +
      '@media(max-width:600px){' +
        '#_mst_cb{flex-direction:column;align-items:stretch;padding:16px;gap:12px;}' +
        '#_mst_cb p{font-size:12px;}' +
        '#_mst_cb .cc-btns{flex-direction:row;}' +
        '#_mst_cb_ok,#_mst_cb_no{flex:1;padding:13px 10px;font-size:14px;text-align:center;}' +
      '}' +
      '</style>' +
      '<p>🍪 Nous utilisons Google Analytics pour mesurer l\'audience du site, dans le respect de votre vie privée.' +
      ' <a href="' + _privacyUrl() + '" target="_blank" rel="noopener noreferrer">Politique de confidentialité</a></p>' +
      '<div class="cc-btns">' +
        '<button id="_mst_cb_no">Refuser</button>' +
        '<button id="_mst_cb_ok">Accepter</button>' +
      '</div>';
    document.body.appendChild(b);
    document.getElementById('_mst_cb_ok').addEventListener('click', _accept);
    document.getElementById('_mst_cb_no').addEventListener('click', _decline);
  }

  /* ── Init ─────────────────────────────────────────────────────── */
  var stored;
  try { stored = localStorage.getItem(KEY); } catch(e) {}

  if (stored === 'granted') {
    _grantAll();
  } else if (stored === 'denied') {
    /* rester en denied — déjà configuré en default */
  } else {
    /* aucun choix → afficher la bannière */
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', _showBanner);
    } else {
      _showBanner();
    }
  }

  window.MyStrowConsent = { accept: _accept, decline: _decline };
})();
