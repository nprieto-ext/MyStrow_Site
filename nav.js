/* MyStrow — barre de navigation centralisée (toutes les pages, toutes les langues).
   Injecte le CSS + le header. Doit être chargé AVANT mobile-nav.js (qui lit la nav). */
(function () {
  "use strict";

  var CSS =
    "header{position:sticky;top:0;z-index:100;background:transparent;border-bottom:none;transition:background .35s,backdrop-filter .35s;}" +
    "header.scrolled{background:rgba(6,6,5,0.88);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);}" +
    "header nav{display:flex;align-items:center;height:68px;padding:0 40px;max-width:1280px;margin:0 auto;gap:32px;}" +
    ".nav-logo{display:flex;align-items:center;text-decoration:none;flex-shrink:0;font-family:'Bebas Neue',sans-serif;font-size:22px;color:var(--text);letter-spacing:1px;}" +
    ".nav-logo em{color:var(--accent);font-style:normal;}" +
    ".nav-center{display:flex;gap:32px;align-items:center;flex:1;justify-content:center;}" +
    ".nav-center>a,.nav-dropdown-wrap>a{color:rgba(255,255,255,0.75);font-size:12px;font-weight:600;text-decoration:none;letter-spacing:.8px;text-transform:uppercase;transition:color .18s;}" +
    ".nav-center>a:hover,.nav-dropdown-wrap>a:hover{color:#fff;}" +
    ".nav-dropdown-wrap{position:relative;}" +
    ".nav-dropdown-wrap>a{display:flex;align-items:center;gap:5px;}" +
    ".nav-chevron{font-size:9px;opacity:.5;transition:transform .22s,opacity .22s;display:inline-block;}" +
    ".nav-dropdown-wrap:hover>a .nav-chevron{transform:rotate(180deg);opacity:1;}" +
    ".nav-mega{position:absolute;top:100%;left:50%;transform:translateX(-50%) translateY(-8px);width:700px;padding:10px;background:#0c0b08;border:1px solid rgba(226,206,22,0.16);border-radius:14px;display:grid;grid-template-columns:repeat(3,1fr);gap:4px;opacity:0;pointer-events:none;transition:opacity .2s ease,transform .2s ease;z-index:300;box-shadow:0 24px 64px rgba(0,0,0,0.7),0 1px 0 rgba(226,206,22,0.06) inset;}" +
    ".nav-mega::before{content:'';position:absolute;top:-16px;left:0;right:0;height:16px;}" +
    ".nav-mega::after{content:'';position:absolute;top:-5px;left:50%;transform:translateX(-50%) rotate(45deg);width:9px;height:9px;background:#0c0b08;border-left:1px solid rgba(226,206,22,0.16);border-top:1px solid rgba(226,206,22,0.16);}" +
    ".nav-dropdown-wrap:hover .nav-mega{opacity:1;pointer-events:auto;transform:translateX(-50%) translateY(10px);}" +
    ".mega-item{display:flex;align-items:flex-start;gap:11px;padding:13px 14px;border-radius:9px;text-decoration:none;color:var(--text);transition:background .15s;text-transform:none;letter-spacing:0;}" +
    ".mega-item:hover{background:rgba(226,206,22,0.06);}" +
    ".mega-icon{font-size:20px;flex-shrink:0;margin-top:1px;line-height:1;}" +
    ".mega-title{font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:13px;letter-spacing:.3px;color:var(--text);margin-bottom:3px;line-height:1.2;}" +
    ".mega-desc{font-size:11px;color:var(--muted);line-height:1.45;}" +
    ".nav-right{display:flex;gap:14px;align-items:center;flex-shrink:0;margin-left:auto;}" +
    ".nav-signin{color:rgba(255,255,255,0.75);font-size:13px;font-weight:500;text-decoration:none;transition:color .18s;}" +
    ".nav-signin:hover{color:#fff;}" +
    ".btn-nav-cta{padding:9px 22px;border-radius:999px;border:1.5px solid var(--accent);background:var(--accent);color:#0c0b00;font-size:13px;font-weight:700;letter-spacing:.3px;text-decoration:none;white-space:nowrap;cursor:pointer;transition:opacity .18s;}" +
    ".btn-nav-cta:hover{opacity:.85;}" +
    ".lang-selector{position:relative;display:inline-flex;}" +
    ".lang-selector-btn{display:flex;align-items:center;gap:6px;background:transparent;border:1px solid rgba(255,255,255,0.15);border-radius:6px;padding:5px 10px;color:var(--muted);font-size:11px;font-weight:700;letter-spacing:1px;cursor:pointer;transition:all .18s;white-space:nowrap;font-family:inherit;}" +
    ".lang-selector-btn:hover,.lang-selector:focus-within .lang-selector-btn{border-color:var(--accent);color:var(--accent);}" +
    ".lang-chevron{font-size:9px;opacity:.5;margin-left:2px;transition:transform .18s;display:inline-block;}" +
    ".lang-selector:hover .lang-chevron,.lang-selector:focus-within .lang-chevron{transform:rotate(180deg);opacity:.8;}" +
    ".lang-dropdown{display:none;position:absolute;top:calc(100% + 7px);right:0;background:#141414;border:1px solid #2a2a2a;border-radius:8px;padding:6px 0;min-width:110px;z-index:999;box-shadow:0 8px 24px rgba(0,0,0,.5);}" +
    ".lang-selector:hover .lang-dropdown,.lang-selector:focus-within .lang-dropdown{display:block;}" +
    ".lang-dropdown a,.lang-dropdown span{display:flex;align-items:center;gap:8px;padding:7px 14px;font-size:12px;font-weight:600;color:var(--muted);text-decoration:none;letter-spacing:1px;transition:color .15s,background .15s;white-space:nowrap;}" +
    ".lang-dropdown a:hover{color:var(--accent);background:rgba(255,215,0,.05);}" +
    ".lang-dropdown span{color:var(--accent);cursor:default;}" +
    "@media(max-width:680px){header nav{padding:0 14px;gap:8px;}.nav-desktop{display:none!important;}.btn-nav-cta{display:none;}}";

  var IG = "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z";
  var TT = "M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.34 6.34 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.2 8.2 0 004.79 1.53V6.75a4.85 4.85 0 01-1.02-.06z";
  var YT = "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z";
  var DC = "M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.012.121.072.237.158.325a19.882 19.882 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z";
  function soc(href, label, hov, path) {
    return '<a href="' + href + '" target="_blank" rel="noopener noreferrer" aria-label="' + label + '" style="display:flex;align-items:center;color:#888;transition:color .18s" onmouseover="this.style.color=\'' + hov + '\'" onmouseout="this.style.color=\'#888\'"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="' + path + '"/></svg></a>';
  }
  var SOCIALS =
    soc("https://www.instagram.com/niko_mystrow_dmx/", "Instagram", "#E1306C", IG) +
    soc("https://www.tiktok.com/@niko_mystrow", "TikTok", "#fff", TT) +
    soc("https://www.youtube.com/@MyStrow-x7t", "YouTube", "#FF0000", YT) +
    soc("https://discord.gg/SZWNgGRc7K", "Discord", "#5865F2", DC);

  var L = {
    fr: {
      feat: "Fonctionnalités", featHref: "index.html#fonctionnalites",
      mega: [
        ["⚡", "Logiciel Lumière DMX", "PC + Node DMX. Contrôle total de votre scène en temps réel.", "logiciel-lumiere-dmx-ia.html"],
        ["🎹", "Matériel compatible", "AKAI APC mini mk2 recommandé, plus d'autres contrôleurs et interfaces DMX.", "controleur-akai-apc-mini.html"],
        ["✨", "IA Lumière", "L'IA prend le contrôle de toute la scène ou vous aide à programmer vos shows.", "ia-lumiere.html"],
        ["🎬", "Programmation Lumière", "Timeline visuelle, keyframes, clips éditables. Composez vos shows à l'avance.", "programmation-lumiere.html"],
        ["🎵", "Player audio & vidéo", "Playlist et projections gérées depuis la même interface. Tout en un.", "player-audio-video.html"],
        ["🗺️", "Plan de scène interactif", "Visualisez et contrôlez vos groupes de projecteurs d'un clic ou d'un fader.", "plan-de-scene.html"]
      ],
      top: [["Tarifs", "tarifs.html"], ["Matériel", "controleur-akai-apc-mini.html"], ["Shop", "shop.html"], ["FAQ", "index.html#faq"], ["Tutoriels", "blog.html"]],
      signin: "Connexion", dl: "Télécharger ↓", dlHref: "telecharger.html"
    },
    en: {
      feat: "Features", featHref: "index.html#features",
      mega: [
        ["⚡", "DMX Lighting Software", "PC + DMX Node. Full control of your stage in real time.", "dmx-lighting-software.html"],
        ["🎹", "Compatible hardware", "Built for the AKAI. Every pad, every fader has its direct mapping.", "akai-apc-mini-controller.html"],
        ["✨", "AI Lighting", "AI takes control of the whole stage or helps you program your shows.", "ai-lighting.html"],
        ["🎬", "Light Programming", "Visual timeline, keyframes, editable clips. Compose your shows in advance.", "light-programming.html"],
        ["🎵", "Audio & Video Player", "Playlist and projections managed from the same interface.", "audio-video-player.html"],
        ["🗺️", "Interactive Stage Plot", "Visualize and control your fixture groups with a click or a fader.", "stage-plot.html"]
      ],
      top: [["Pricing", "index.html#pricing"], ["Hardware", "akai-apc-mini-controller.html"], ["FAQ", "index.html#faq"]],
      signin: "Sign in", dl: "Download ↓", dlHref: "download.html"
    },
    de: {
      feat: "Funktionen", featHref: "index.html#features",
      mega: [
        ["⚡", "DMX-Beleuchtungssoftware", "PC + DMX-Node. Volle Kontrolle über Ihre Bühne in Echtzeit.", "dmx-lighting-software.html"],
        ["🎹", "Kompatible Hardware", "Entwickelt für das AKAI. Jedes Pad, jeder Fader direkt zugeordnet.", "akai-apc-mini-controller.html"],
        ["✨", "KI-Beleuchtung", "KI übernimmt die Bühne oder hilft Ihnen, Shows zu programmieren.", "ai-lighting.html"],
        ["🎬", "Lichtprogrammierung", "Visuelle Timeline, Keyframes, editierbare Clips. Shows im Voraus komponieren.", "light-programming.html"],
        ["🎵", "Audio- & Video-Player", "Playlist und Projektionen aus einer einzigen Oberfläche verwaltet.", "audio-video-player.html"],
        ["🗺️", "Interaktiver Bühnenplan", "Scheinwerfergruppen mit einem Klick oder Fader visualisieren und steuern.", "stage-plot.html"]
      ],
      top: [["Preise", "index.html#pricing"], ["Hardware", "akai-apc-mini-controller.html"], ["FAQ", "index.html#faq"]],
      signin: "Anmelden", dl: "Herunterladen ↓", dlHref: "download.html"
    },
    es: {
      feat: "Funciones", featHref: "index.html#features",
      mega: [
        ["⚡", "Software de iluminación DMX", "PC + Nodo DMX. Control total de tu escenario en tiempo real.", "dmx-lighting-software.html"],
        ["🎹", "Hardware compatible", "Diseñado para el AKAI. Cada pad y cada fader con su asignación directa.", "akai-apc-mini-controller.html"],
        ["✨", "Iluminación con IA", "La IA controla el escenario completo o te ayuda a programar tus shows.", "ai-lighting.html"],
        ["🎬", "Programación de luces", "Timeline visual, keyframes, clips editables. Compón tus shows con antelación.", "light-programming.html"],
        ["🎵", "Audio & Video Player", "Lista de reproducción y proyecciones gestionadas desde la misma interfaz.", "audio-video-player.html"],
        ["🗺️", "Plano de escena interactivo", "Visualiza y controla tus grupos de focos con un clic o un fader.", "stage-plot.html"]
      ],
      top: [["Precios", "index.html#pricing"], ["Material", "akai-apc-mini-controller.html"], ["FAQ", "index.html#faq"]],
      signin: "Iniciar sesión", dl: "Descargar ↓", dlHref: "download.html"
    },
    pt: {
      feat: "Funcionalidades", featHref: "index.html#features",
      mega: [
        ["⚡", "Software de iluminação DMX", "Nó DMX. Controlo total do seu palco em tempo real.", "dmx-lighting-software.html"],
        ["🎹", "Controlador AKAI APC mini", "Desenvolvido para o AKAI. Cada pad e cada fader com mapeamento direto.", "akai-apc-mini-controller.html"],
        ["✨", "Iluminação com IA", "A IA controla todo o palco ou ajuda-o a programar os seus espetáculos.", "ai-lighting.html"],
        ["🎬", "Programação de luzes", "Timeline visual, keyframes, clips editáveis. Componha os seus espetáculos antecipadamente.", "light-programming.html"],
        ["🎵", "Leitor de Áudio & Vídeo", "Lista de reprodução e projeções geridas a partir da mesma interface.", "audio-video-player.html"],
        ["🗺️", "Planta de palco interativa", "Visualize e controle os seus grupos de projetores com um clique ou fader.", "stage-plot.html"]
      ],
      top: [["Preços", "index.html#pricing"], ["Material", "akai-apc-mini-controller.html"], ["FAQ", "index.html#faq"]],
      signin: "Entrar", dl: "Transferir ↓", dlHref: "download.html"
    }
  };

  var ORDER = ["fr", "en", "de", "es", "pt"];
  var FLAG = { fr: "🇫🇷", en: "🇬🇧", de: "🇩🇪", es: "🇪🇸", pt: "🇵🇹" };

  var mm = location.pathname.match(/\/(en|de|es|pt)\//);
  var loc = mm ? mm[1] : "fr";
  var cfg = L[loc] || L.fr;

  function esc(s) { return s; }

  // Mega items
  var mega = cfg.mega.map(function (m) {
    return '<a class="mega-item" href="' + m[3] + '"><div class="mega-icon">' + m[0] + '</div><div><div class="mega-title">' + m[1] + '</div><div class="mega-desc">' + m[2] + '</div></div></a>';
  }).join("");

  // Top links
  var top = cfg.top.map(function (t) { return '<a href="' + t[1] + '">' + t[0] + '</a>'; }).join("");

  // Lang dropdown
  function langHref(target) {
    if (loc === "fr") return target === "fr" ? null : target + "/index.html";
    if (target === "fr") return "../index.html";
    return target === loc ? null : "../" + target + "/index.html";
  }
  var langItems = ORDER.map(function (t) {
    var h = langHref(t);
    return h === null ? "<span>" + FLAG[t] + "</span>" : '<a href="' + h + '">' + FLAG[t] + "</a>";
  }).join("");

  var HEADER =
    '<header><nav aria-label="Navigation">' +
      '<a href="index.html" class="nav-logo" aria-label="MyStrow">MY<em>STROW</em></a>' +
      '<div class="nav-center nav-desktop">' +
        '<div class="nav-dropdown-wrap"><a href="' + cfg.featHref + '">' + cfg.feat + ' <span class="nav-chevron">▾</span></a>' +
          '<div class="nav-mega">' + mega + '</div>' +
        '</div>' + top +
      '</div>' +
      '<div class="nav-right">' + SOCIALS +
        '<div class="lang-selector" tabindex="0">' +
          '<button class="lang-selector-btn" aria-label="Language">' +
            '<svg style="width:13px;height:13px;opacity:.6;flex-shrink:0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>' +
            loc.toUpperCase() + ' <span class="lang-chevron">&#9660;</span>' +
          '</button>' +
          '<div class="lang-dropdown">' + langItems + '</div>' +
        '</div>' +
        '<a href="https://mystrow.fr/compte" class="nav-signin nav-desktop" target="_blank" rel="noopener noreferrer">' + cfg.signin + '</a>' +
        '<a href="' + cfg.dlHref + '" class="btn-nav-cta">' + cfg.dl + '</a>' +
      '</div>' +
    '</nav></header>';

  function inject() {
    if (document.getElementById("mst-nav-css")) return;
    if (document.querySelector("header")) return;   // page possède déjà sa barre (ex. index)
    var st = document.createElement("style");
    st.id = "mst-nav-css";
    st.textContent = CSS;
    document.head.appendChild(st);
    document.body.insertAdjacentHTML("afterbegin", HEADER);
    var hdr = document.querySelector("header");
    if (hdr) {
      var onScroll = function () { hdr.classList.toggle("scrolled", window.scrollY > 20); };
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
    }
  }

  if (document.body) inject();
  else document.addEventListener("DOMContentLoaded", inject);
})();
