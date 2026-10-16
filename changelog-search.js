/*
 * Recherche dans le journal des mises à jour (nouveautes + {en,de,es,pt}/whats-new).
 *
 * Filtre en direct les lignes <li> des <article class="cl-item"> : une ligne
 * reste si elle contient TOUS les mots tapés, sans tenir compte des accents ni
 * des majuscules. Le titre de version compte : « 3.2.1 » affiche toute la
 * version. Les mots trouvés sont surlignés. ?q=… dans l'URL pré-remplit le champ.
 *
 * Textes localisés portés par le HTML de chaque page (data-one / data-many).
 */
(function () {
  var input = document.getElementById('cl-q');
  if (!input) return;
  var count = document.getElementById('cl-count');
  var empty = document.getElementById('cl-empty');
  var articles = Array.prototype.slice.call(document.querySelectorAll('.cl-item'));

  function norm(s) {
    return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  }

  // Lignes indexées une fois : texte normalisé + HTML d'origine (pour effacer
  // le surlignage sans reconstruire la page).
  var rows = [];
  articles.forEach(function (art) {
    var head = art.querySelector('h2');
    var time = art.querySelector('time');
    var headTxt = norm((head ? head.textContent : '') + ' ' + (time ? time.textContent : ''));
    art.querySelectorAll('li').forEach(function (li) {
      rows.push({ art: art, li: li, html: li.innerHTML,
                  txt: norm(li.textContent) + ' ' + headTxt });
    });
  });

  // Surligne `terms` dans les nœuds texte de `el` (correspondance sans accents)
  function highlight(el, terms) {
    var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
    var nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(function (node) {
      var src = node.nodeValue;
      // Chaîne normalisée + position d'origine de chaque caractère
      var flat = '', map = [];
      for (var i = 0; i < src.length; i++) {
        var n = norm(src[i]);
        for (var k = 0; k < n.length; k++) { flat += n[k]; map.push(i); }
      }
      var marks = [];
      terms.forEach(function (t) {
        var from = 0, at;
        while ((at = flat.indexOf(t, from)) !== -1) {
          marks.push([map[at], map[at + t.length - 1] + 1]);
          from = at + t.length;
        }
      });
      if (!marks.length) return;
      marks.sort(function (a, b) { return a[0] - b[0]; });
      var merged = [marks[0]];
      for (var m = 1; m < marks.length; m++) {
        var last = merged[merged.length - 1];
        if (marks[m][0] <= last[1]) last[1] = Math.max(last[1], marks[m][1]);
        else merged.push(marks[m]);
      }
      var frag = document.createDocumentFragment(), pos = 0;
      merged.forEach(function (r) {
        if (r[0] > pos) frag.appendChild(document.createTextNode(src.slice(pos, r[0])));
        var mk = document.createElement('mark');
        mk.textContent = src.slice(r[0], r[1]);
        frag.appendChild(mk);
        pos = r[1];
      });
      if (pos < src.length) frag.appendChild(document.createTextNode(src.slice(pos)));
      node.parentNode.replaceChild(frag, node);
    });
  }

  function apply() {
    var q = input.value.trim();
    var terms = norm(q).split(/\s+/).filter(Boolean);
    var shown = 0;
    var artHas = new Map();
    rows.forEach(function (r) {
      r.li.innerHTML = r.html;
      var ok = terms.every(function (t) { return r.txt.indexOf(t) !== -1; });
      r.li.hidden = !ok;
      if (ok) {
        shown++;
        artHas.set(r.art, true);
        if (terms.length) highlight(r.li, terms);
      }
    });
    articles.forEach(function (a) { a.hidden = !artHas.get(a); });

    if (terms.length) {
      count.textContent = (shown === 1 ? count.dataset.one : count.dataset.many)
        .replace('{n}', shown);
    } else {
      count.textContent = '';
    }
    empty.hidden = !(terms.length && shown === 0);

    // ?q= dans l'URL : une recherche se partage par simple lien
    try {
      var url = new URL(location.href);
      if (q) url.searchParams.set('q', q); else url.searchParams.delete('q');
      history.replaceState(null, '', url);
    } catch (e) {}
  }

  input.addEventListener('input', apply);
  input.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && input.value) { input.value = ''; apply(); }
  });

  try {
    var q0 = new URL(location.href).searchParams.get('q');
    if (q0) { input.value = q0; apply(); }
  } catch (e) {}
})();
