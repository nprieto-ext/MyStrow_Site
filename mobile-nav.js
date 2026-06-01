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

    // ── Collect language links from existing lang-dropdown ────────────────
    var langHtml = '';
    var langDropdown = document.querySelector('.lang-dropdown');
    if (langDropdown) {
      var flagMap = {'🇫🇷':'FR','🇬🇧':'EN','🇩🇪':'DE','🇪🇸':'ES','🇵🇹':'PT'};
      var items = langDropdown.querySelectorAll('a, span');
      var langLinks = Array.from(items).map(function(item) {
        var flag = item.textContent.trim();
        var code = flagMap[flag] || flag;
        var label = flag + ' <b style="font-size:11px;letter-spacing:.5px">' + code + '</b>';
        if (item.tagName === 'SPAN') {
          return '<span class="nb-lang-cur">' + label + '</span>';
        }
        return '<a href="' + item.getAttribute('href') + '" class="nb-lang-link">' + label + '</a>';
      });
      if (langLinks.length) {
        langHtml = '<div class="nb-section-label">Langue</div><div class="nb-langs">' + langLinks.join('') + '</div>';
      }
    }

    // ── Social links ──────────────────────────────────────────────────────
    var DISCORD_PATH = 'M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.012.121.072.237.158.325a19.882 19.882 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z';

    var socialsHtml =
      '<div class="nb-section-label">Réseaux</div>' +
      '<div class="nb-socials">' +
        '<a href="https://www.instagram.com/niko_mystrow_dmx/" target="_blank" rel="noopener noreferrer" class="nb-social" aria-label="Instagram">' +
          '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>' +
          '<span>Instagram</span>' +
        '</a>' +
        '<a href="https://www.tiktok.com/@niko_mystrow" target="_blank" rel="noopener noreferrer" class="nb-social" aria-label="TikTok">' +
          '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.34 6.34 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.2 8.2 0 004.79 1.53V6.75a4.85 4.85 0 01-1.02-.06z"/></svg>' +
          '<span>TikTok</span>' +
        '</a>' +
        '<a href="https://www.youtube.com/@MyStrow-x7t" target="_blank" rel="noopener noreferrer" class="nb-social" aria-label="YouTube">' +
          '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>' +
          '<span>YouTube</span>' +
        '</a>' +
        '<a href="https://discord.gg/SZWNgGRc7K" target="_blank" rel="noopener noreferrer" class="nb-social nb-social--discord" aria-label="Discord">' +
          '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="' + DISCORD_PATH + '"/></svg>' +
          '<span>Discord</span>' +
        '</a>' +
      '</div>';

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
        '<div class="nb-foot">' +
          '<a class="nb-dl" id="nb-dl-btn" href="#">Télécharger MyStrow</a>' +
        '</div>' +
        '<div class="nb-extra">' + langHtml + socialsHtml + '</div>' +
      '</div>';

    document.body.appendChild(overlay);

    // ── OS-aware download button ──────────────────────────────────────────
    var dlBtn = overlay.querySelector('#nb-dl-btn');
    if (dlBtn) {
      var isMacMob = /Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent);
      var depth = location.pathname.split('/').filter(function(s) { return s !== ''; }).length;
      var prefix = depth > 1 ? '../' : '';
      if (!isMacMob) {
        dlBtn.textContent = '↓ Télécharger pour Windows';
        dlBtn.href = 'https://us-central1-mystrow-907be.cloudfunctions.net/download_redirect?p=win';
        dlBtn.target = '_blank';
        dlBtn.rel = 'noopener noreferrer';
      } else {
        dlBtn.textContent = '↓ Télécharger pour macOS';
        dlBtn.href = prefix + 'telecharger.html';
      }
    }

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

