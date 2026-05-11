(function () {
  function init() {
    var nav = document.querySelector('header nav, body > nav');
    if (!nav) return;

    // ── Collect top-level nav links ──────────────────────────────────────
    var seen = {};
    var links = [];

    function addLink(el) {
      var href = (el.getAttribute('href') || '').trim();
      var text = (el.innerText || el.textContent || '').replace(/[▾▿▼↓›»]/g, '').trim();
      if (!text || text.length < 2) return;
      if (/^https?:\/\//.test(href)) return; // skip external
      if (seen[href]) return;
      seen[href] = true;
      links.push({ href: href, text: text });
    }

    // index.html style — .nav-center top-level children
    var center = nav.querySelector('.nav-center');
    if (center) {
      Array.from(center.children).forEach(function (child) {
        if (child.tagName === 'A') { addLink(child); return; }
        // dropdown wrap: take only the trigger <a>
        if (child.querySelector) {
          var trigger = child.querySelector('a');
          if (trigger) addLink(trigger);
        }
      });
    }

    // other pages — .nav-links / ul.nav-links
    if (!center) {
      var nl = nav.querySelector('.nav-links, ul.nav-links');
      if (nl) {
        nl.querySelectorAll('a').forEach(function (a) {
          // skip links inside mega/sub-menus (more than 1 parent level inside nl)
          if (a.parentElement === nl || (a.parentElement && a.parentElement.parentElement === nl)) {
            addLink(a);
          }
        });
      }
    }

    if (!links.length) return;

    // ── Hamburger button ─────────────────────────────────────────────────
    var burger = document.createElement('button');
    burger.className = 'nb-burger';
    burger.setAttribute('aria-label', 'Menu');
    burger.setAttribute('aria-expanded', 'false');
    burger.innerHTML = '<span></span><span></span><span></span>';

    // Insert before .nav-right if present, otherwise append
    var navRight = nav.querySelector('.nav-right');
    navRight ? nav.insertBefore(burger, navRight) : nav.appendChild(burger);

    // ── Overlay ──────────────────────────────────────────────────────────
    var page = location.pathname.split('/').pop() || 'index.html';
    var linksHtml = links.map(function (l) {
      var active = (l.href === page) ? ' nb-active' : '';
      return '<a href="' + l.href + '" class="nb-link' + active + '">' + l.text + '</a>';
    }).join('');

    var overlay = document.createElement('div');
    overlay.className = 'nb-overlay';
    overlay.innerHTML =
      '<div class="nb-panel">' +
        '<div class="nb-head">' +
          '<a href="index.html" class="nb-logo">MY<em>STROW</em></a>' +
          '<button class="nb-close" aria-label="Fermer">' +
            '<svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">' +
              '<line x1="2" y1="2" x2="16" y2="16"/><line x1="16" y1="2" x2="2" y2="16"/>' +
            '</svg>' +
          '</button>' +
        '</div>' +
        '<nav class="nb-links">' + linksHtml + '</nav>' +
      '</div>';

    document.body.appendChild(overlay);

    function open() {
      overlay.classList.add('nb-open');
      // Bloquer le scroll sur <html> (pas <body>) — iOS Safari fixe position: fixed sur body
      document.documentElement.style.overflow = 'hidden';
      burger.setAttribute('aria-expanded', 'true');
    }
    function close() {
      overlay.classList.remove('nb-open');
      document.documentElement.style.overflow = '';
      burger.setAttribute('aria-expanded', 'false');
    }

    burger.addEventListener('click', function () {
      overlay.classList.contains('nb-open') ? close() : open();
    });
    overlay.querySelector('.nb-close').addEventListener('click', close);
    overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });
    overlay.querySelectorAll('.nb-link, .nb-dl').forEach(function (a) {
      a.addEventListener('click', close);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
