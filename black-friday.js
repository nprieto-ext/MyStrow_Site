/* Black Friday 2026 : Pack MyStrow 1 an à 159 € au lieu de 199 € (-40 €).
   Du jeudi 26/11/2026 00:00 au vendredi 27/11/2026 23:59 (heure de Paris).
   En dehors de cette fenêtre, le script ne fait RIEN : la page reste à 199 €.
   Côté Stripe : même Payment Link (reconnu par le webhook → expédition MCF auto),
   avec le code BLACKFRIDAY pré-rempli (coupon -40 €, limité au produit Pack 1 an,
   expire au même instant, 20 utilisations max). */
(function () {
  var DEBUT = Date.UTC(2026, 10, 25, 23, 0, 0);   // 26/11 00:00 Paris
  var FIN   = Date.UTC(2026, 10, 27, 23, 0, 0);   // 28/11 00:00 Paris
  var now = Date.now(), apercu = false;
  try { apercu = /[?&]bf=1/.test(location.search); } catch (e) {}
  if (apercu) now = DEBUT + 1000;
  var fin = apercu ? Date.now() + 48 * 3600 * 1000 : FIN;   // aperçu : décompte réaliste de 48 h   // aperçu hors période : ?bf=1
  if (now < DEBUT || now >= FIN) return;

  var PROMO = 'BLACKFRIDAY', PRIX = 159, AVANT = 199;
  var lang = (document.documentElement.lang || 'fr').slice(0, 2);
  var L = {
    fr: { bar: 'BLACK FRIDAY · Pack MyStrow 1 an à <b>159 €</b> au lieu de 199 € · 48 h seulement', cta: 'J\'en profite', left: 'Fin dans', timer: "L'offre Black Friday se termine dans", uh: 'heures', um: 'min', us: 'sec', badge: 'Black Friday −40 €' },
    en: { bar: 'BLACK FRIDAY · MyStrow Pack 1 year for <b>€159</b> instead of €199 · 48 hours only', cta: 'Get it', left: 'Ends in', timer: 'The Black Friday deal ends in', uh: 'hours', um: 'min', us: 'sec', badge: 'Black Friday −€40' },
    de: { bar: 'BLACK FRIDAY · MyStrow Pack 1 Jahr für <b>159 €</b> statt 199 € · nur 48 Stunden', cta: 'Zum Angebot', left: 'Endet in', timer: 'Das Black-Friday-Angebot endet in', uh: 'Std.', um: 'Min.', us: 'Sek.', badge: 'Black Friday −40 €' },
    es: { bar: 'BLACK FRIDAY · Pack MyStrow 1 año a <b>159 €</b> en lugar de 199 € · solo 48 horas', cta: 'Aprovechar', left: 'Termina en', timer: 'La oferta Black Friday termina en', uh: 'horas', um: 'min', us: 'seg', badge: 'Black Friday −40 €' },
    pt: { bar: 'BLACK FRIDAY · Pack MyStrow 1 ano por <b>159 €</b> em vez de 199 € · só 48 horas', cta: 'Aproveitar', left: 'Termina em', timer: 'A oferta Black Friday termina em', uh: 'horas', um: 'min', us: 'seg', badge: 'Black Friday −40 €' },
    it: { bar: 'BLACK FRIDAY · Pack MyStrow 1 anno a <b>159 €</b> invece di 199 € · solo 48 ore', cta: 'Approfitta', left: 'Finisce tra', timer: "L'offerta Black Friday finisce tra", uh: 'ore', um: 'min', us: 'sec', badge: 'Black Friday −40 €' }
  }[lang] || null;
  if (!L) return;
  var shopUrl = { fr: '/shop', en: '/en/shop', de: '/de/shop', es: '/es/shop', pt: '/pt/shop', it: '/shop' }[lang];

  /* 1. Pack 1 an sur /shop : prix barré + code pré-rempli. */
  var opt = document.querySelector('.pk-opt[data-plan="pack_1a"]');
  if (opt) {
    var href = opt.dataset.href || '';
    opt.dataset.href = href + (href.indexOf('?') < 0 ? '?' : '&') + 'prefilled_promo_code=' + PROMO;
    opt.dataset.price = String(PRIX);
    var p = opt.querySelector('.pk-opt-price');
    if (p) p.innerHTML = '<s class="bf-old">' + AVANT + '€</s>' + p.innerHTML.replace(String(AVANT), String(PRIX));
    var b = opt.querySelector('.pk-opt-badge');
    if (b) { b.textContent = L.badge; b.classList.add('bf-badge'); }
  }

  /* 2. Bandeau en haut de page avec compte à rebours. */
  var css = document.createElement('style');
  css.textContent =
    '.bf-bar{position:relative;z-index:60;display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:6px 14px;padding:10px 16px;background:#0c0b00;border-bottom:2px solid #E2CE16;color:#fff;font:600 14px/1.3 Inter,system-ui,sans-serif;text-align:center}' +
    '.bf-bar b{color:#E2CE16}' +
    '.bf-bar .bf-t{font-variant-numeric:tabular-nums;color:#E2CE16;font-weight:800}' +
    '.bf-bar a{background:#E2CE16;color:#0c0b00;font-weight:800;text-decoration:none;padding:5px 12px;border-radius:20px;white-space:nowrap}' +
    '.bf-old{font-size:.55em;opacity:.55;margin-right:6px;font-weight:600}' +
    '.pk-opt-badge.bf-badge{background:#ff3b3b;color:#fff}' +
    '.bf-timer{border:2px solid #E2CE16;border-radius:14px;padding:14px 16px;background:linear-gradient(135deg,rgba(226,206,22,.12),rgba(255,59,59,.08));text-align:center}' +
    '.bf-timer-l{font:700 12px/1.3 Inter,system-ui,sans-serif;letter-spacing:1.5px;text-transform:uppercase;color:#E2CE16;margin-bottom:10px}' +
    '.bf-timer-r{display:flex;justify-content:center;gap:10px}' +
    '.bf-timer-r div{min-width:74px;background:#0c0b00;border:1px solid rgba(226,206,22,.35);border-radius:10px;padding:8px 6px}' +
    '.bf-timer-r b{display:block;font:800 38px/1 "Barlow Condensed",sans-serif;color:#fff;font-variant-numeric:tabular-nums}' +
    '.bf-timer-r span{font:600 11px/1.4 Inter,system-ui,sans-serif;color:#aaa;text-transform:uppercase;letter-spacing:1px}' +
    '@media (max-width:420px){.bf-timer-r div{min-width:62px}.bf-timer-r b{font-size:30px}}';
  document.head.appendChild(css);

  var bar = document.createElement('div');
  bar.className = 'bf-bar';
  bar.setAttribute('role', 'region');
  bar.setAttribute('aria-label', 'Black Friday');
  var onShop = !!opt;
  bar.innerHTML = '<span>' + L.bar + '</span><span>' + L.left + ' <span class="bf-t"></span></span>' +
    (onShop ? '' : '<a href="' + shopUrl + '">' + L.cta + ' →</a>');
  document.body.insertBefore(bar, document.body.firstChild);

  /* 3. Gros minuteur dans la fiche du pack, sous les options. */
  var big = null, opts = document.querySelector('.pk-opts');
  if (opts) {
    big = document.createElement('div');
    big.className = 'bf-timer';
    big.innerHTML = '<div class="bf-timer-l">' + L.timer + '</div><div class="bf-timer-r">' +
      '<div><b class="bf-h">0</b><span>' + L.uh + '</span></div>' +
      '<div><b class="bf-m">00</b><span>' + L.um + '</span></div>' +
      '<div><b class="bf-s">00</b><span>' + L.us + '</span></div></div>';
    opts.parentNode.insertBefore(big, opts.nextSibling);
  }

  var t = bar.querySelector('.bf-t');
  function z(n) { return (n < 10 ? '0' : '') + n; }
  function tick() {
    var s = Math.max(0, Math.floor((fin - Date.now()) / 1000));
    if (s === 0) { if (!apercu) location.reload(); return; }   // fin de la promo : la page repasse à 199 €
    var h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), x = s % 60;
    t.textContent = h + ' h ' + z(m) + ' min ' + z(x) + ' s';
    if (big) {
      big.querySelector('.bf-h').textContent = h;
      big.querySelector('.bf-m').textContent = z(m);
      big.querySelector('.bf-s').textContent = z(x);
    }
  }
  tick();
  setInterval(tick, 1000);
})();
