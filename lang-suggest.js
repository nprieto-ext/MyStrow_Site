/* MyStrow — Suggestion de langue (toutes les pages, toutes les langues).

   Ce script NE REDIRIGE JAMAIS automatiquement : il propose. C'est volontaire.
   Googlebot rend le JS avec navigator.language = "en-US" ; une redirection
   automatique enverrait donc le crawler des pages FR vers les pages EN au
   moment de l'indexation. La banniere, elle, laisse l'URL et le contenu
   intacts : Google voit exactement la page qu'il a demandee.

   La correspondance entre versions linguistiques n'est PAS codee en dur :
   elle est lue dans les <link rel="alternate" hreflang="..."> deja presents
   sur chaque page. Ajouter une page traduite avec ses hreflang suffit donc
   pour que la banniere fonctionne dessus, sans toucher a ce fichier.

   A charger en fin de <body> : <script src="/lang-suggest.js" defer></script> */
(function () {
  'use strict';

  /* Langue explicitement choisie par le visiteur (ou "ici, ca me va"). */
  var KEY = 'mystrow_lang';
  var SUPPORTED = ['fr', 'en', 'de', 'es', 'pt'];

  /* Libelles ecrits dans la langue CIBLE : c'est celle que le visiteur lit. */
  var T = {
    fr: { msg: 'Cette page est disponible en français.', cta: 'Voir en français', close: 'Fermer' },
    en: { msg: 'This page is available in English.', cta: 'View in English', close: 'Close' },
    de: { msg: 'Diese Seite ist auf Deutsch verfügbar.', cta: 'Auf Deutsch ansehen', close: 'Schließen' },
    es: { msg: 'Esta página está disponible en español.', cta: 'Ver en español', close: 'Cerrar' },
    pt: { msg: 'Esta página está disponível em português.', cta: 'Ver em português', close: 'Fechar' }
  };

  function _gtag() {
    if (typeof window.gtag === 'function') window.gtag.apply(null, arguments);
  }

  function _get() {
    try { return window.localStorage.getItem(KEY); } catch (e) { return null; }
  }

  function _set(l) {
    try { window.localStorage.setItem(KEY, l); } catch (e) { /* mode prive */ }
  }

  /* Langue de la page courante : <html lang> fait foi, le chemin depanne. */
  function _pageLang() {
    var h = (document.documentElement.getAttribute('lang') || '').slice(0, 2).toLowerCase();
    if (SUPPORTED.indexOf(h) !== -1) return h;
    var m = location.pathname.match(/^\/(en|de|es|pt)\//);
    return m ? m[1] : 'fr';
  }

  /* Prefixe de langue d'une URL du site (null si ce n'est pas le site). */
  function _langOfUrl(url) {
    var a = document.createElement('a');
    a.href = url;
    if (a.host !== location.host) return null;
    var m = a.pathname.match(/^\/(en|de|es|pt)\//);
    return m ? m[1] : 'fr';
  }

  /* ── Memorisation du choix ────────────────────────────────────────────
     Deux filets, parce que le selecteur de langue existe en deux versions
     (injectee par nav.js et en dur dans les pages d'accueil) :
     1. clic sur un lien porteur de data-lang / hreflang ;
     2. arrivee depuis une autre langue du site (referrer interne).      */
  function _rememberChoices() {
    document.addEventListener('click', function (e) {
      var a = e.target.closest ? e.target.closest('a[data-lang],a[hreflang]') : null;
      if (!a) return;
      var l = (a.getAttribute('data-lang') || a.getAttribute('hreflang') || '').slice(0, 2).toLowerCase();
      if (SUPPORTED.indexOf(l) !== -1) _set(l);
    }, true);

    if (document.referrer) {
      var from = _langOfUrl(document.referrer);
      var here = _pageLang();
      if (from && from !== here) _set(here);
    }
  }

  /* Langue voulue par le visiteur : son choix passe avant son navigateur. */
  function _preferred() {
    var stored = _get();
    if (stored && SUPPORTED.indexOf(stored) !== -1) return stored;
    var list = (navigator.languages && navigator.languages.length)
      ? navigator.languages
      : [navigator.language || navigator.userLanguage || ''];
    for (var i = 0; i < list.length; i++) {
      var l = String(list[i]).slice(0, 2).toLowerCase();
      if (SUPPORTED.indexOf(l) !== -1) return l;
    }
    return null;
  }

  /* Equivalent de la page courante dans la langue demandee, via hreflang. */
  function _alternate(lang) {
    var el = document.querySelector('link[rel="alternate"][hreflang="' + lang + '"]');
    if (!el) return null;
    var href = el.getAttribute('href');
    if (!href) return null;
    var a = document.createElement('a');
    a.href = href;
    /* Certaines pages se listent elles-memes : ne pas proposer un sur-place. */
    if (a.pathname.replace(/\/$/, '') === location.pathname.replace(/\/$/, '')) return null;
    return a.href;
  }

  var CSS =
    '#mst-lang-bar{display:flex;align-items:center;justify-content:center;gap:14px;flex-wrap:wrap;' +
    'padding:10px 18px;background:#0c0b08;border-bottom:1px solid rgba(226,206,22,0.16);' +
    "font-family:'Barlow',system-ui,-apple-system,sans-serif;font-size:13.5px;color:#cfcabd;" +
    'position:relative;z-index:400;}' +
    '#mst-lang-bar .mst-lang-msg{display:flex;align-items:center;gap:9px;}' +
    '#mst-lang-bar .mst-lang-globe{font-size:15px;line-height:1;opacity:.85;}' +
    '#mst-lang-bar a{display:inline-block;padding:5px 15px;border-radius:999px;background:#e2ce16;' +
    'color:#0c0b00;font-weight:700;font-size:12.5px;letter-spacing:.2px;text-decoration:none;' +
    'white-space:nowrap;transition:opacity .18s;}' +
    '#mst-lang-bar a:hover{opacity:.85;}' +
    '#mst-lang-bar button{position:absolute;right:12px;top:50%;transform:translateY(-50%);' +
    'background:transparent;border:0;color:#8a857a;font-size:17px;line-height:1;cursor:pointer;' +
    'padding:6px 8px;font-family:inherit;transition:color .18s;}' +
    '#mst-lang-bar button:hover{color:#fff;}' +
    '@media(max-width:680px){#mst-lang-bar{font-size:12.5px;gap:10px;padding:10px 38px 10px 14px;}' +
    '#mst-lang-bar button{right:4px;}}';

  function _show(lang, href) {
    if (document.getElementById('mst-lang-bar')) return;
    var t = T[lang];
    if (!t) return;

    var st = document.createElement('style');
    st.textContent = CSS;
    document.head.appendChild(st);

    var bar = document.createElement('div');
    bar.id = 'mst-lang-bar';
    bar.setAttribute('lang', lang);
    bar.setAttribute('role', 'complementary');
    bar.innerHTML =
      '<span class="mst-lang-msg"><span class="mst-lang-globe" aria-hidden="true">&#127760;</span>' + t.msg + '</span>' +
      '<a href="' + href + '" hreflang="' + lang + '" data-lang="' + lang + '">' + t.cta + '</a>' +
      '<button type="button" aria-label="' + t.close + '">&#10005;</button>';

    /* Avant le header s'il existe : la banniere defile, le header reste sticky. */
    var y0 = window.pageYOffset;
    var hdr = document.querySelector('header');
    if (hdr && hdr.parentNode) hdr.parentNode.insertBefore(bar, hdr);
    else document.body.insertAdjacentHTML('afterbegin', bar.outerHTML);

    /* Insérer du contenu AU-DESSUS du viewport declenche l'ancrage de
       defilement de Chrome : il compense en descendant d'autant, et la
       banniere naît hors de l'ecran. On ne remet en haut que le visiteur
       qui y etait deja (un lien #ancre garde sa position). */
    if (y0 === 0 && window.pageYOffset !== 0) {
      window.scrollTo(0, 0);
      window.requestAnimationFrame(function () {
        if (window.pageYOffset !== 0) window.scrollTo(0, 0);
      });
    }

    var live = document.getElementById('mst-lang-bar');

    live.querySelector('a').addEventListener('click', function () {
      _set(lang);
      _gtag('event', 'lang_suggest_accept', { from_lang: _pageLang(), to_lang: lang });
    });

    live.querySelector('button').addEventListener('click', function () {
      /* Fermer = "je reste ici" : on grave la langue de la page courante. */
      _set(_pageLang());
      live.parentNode.removeChild(live);
      _gtag('event', 'lang_suggest_dismiss', { from_lang: _pageLang(), to_lang: lang });
    });

    _gtag('event', 'lang_suggest_shown', { from_lang: _pageLang(), to_lang: lang });
  }

  function init() {
    _rememberChoices();

    var here = _pageLang();
    var want = _preferred();
    if (!want || want === here) return;

    var href = _alternate(want);
    if (!href) return;   /* pas de traduction pour cette page : on ne dit rien */

    _show(want, href);
  }

  if (document.body) init();
  else document.addEventListener('DOMContentLoaded', init);
})();
