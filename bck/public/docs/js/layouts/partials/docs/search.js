(function () {
  var overlay       = document.getElementById('search-overlay');
  var input         = document.getElementById('flexsearch');
  var suggestions   = document.getElementById('suggestions');
  var openBtn       = document.getElementById('topbar-search-open');
  var versionSelect = document.getElementById('search-version-select');
  var langSelect    = document.getElementById('search-lang-select');
  var allBtn        = document.getElementById('search-all-btn');

  if (!overlay || !input || !suggestions) return;

  var MAX_RESULTS = 8;
  var allMode     = false;

  var currentVersion = overlay.dataset.version || '';
  var currentLang    = overlay.dataset.lang    || '';

  // ── Manifest-driven dropdowns ─────────────────────────────────────
  var manifest = (function () {
    var items    = window.__NTI_VERSION_ITEMS__ || [];
    var versions = items.map(function (v) { return v.value; });
    var langs    = {};
    items.forEach(function (v) {
      langs[v.value] = (v.langs || []).map(function (l) { return l.value; });
    });
    return { versions: versions, langs: langs };
  })();

  function populateVersions() {
    versionSelect.innerHTML = '';
    (manifest.versions || []).forEach(function (v) {
      var opt = document.createElement('option');
      opt.value = v;
      opt.textContent = v.replace(/_/g, '.');
      if (v === currentVersion) opt.selected = true;
      versionSelect.appendChild(opt);
    });
  }

  function populateLangs(ver) {
    langSelect.innerHTML = '';
    var langs = (manifest.langs && manifest.langs[ver]) || [];
    langs.forEach(function (l) {
      var opt = document.createElement('option');
      opt.value = l;
      opt.textContent = l.toUpperCase();
      if (l === currentLang) opt.selected = true;
      langSelect.appendChild(opt);
    });
  }

  populateVersions();
  populateLangs(currentVersion);

  versionSelect.addEventListener('change', function () {
    populateLangs(this.value);
    renderResults(input.value.trim());
  });

  langSelect.addEventListener('change', function () {
    renderResults(input.value.trim());
  });

  // ── All button ────────────────────────────────────────────────────
  allBtn.addEventListener('click', function () {
    allMode = !allMode;
    allBtn.classList.toggle('search-modal__all-btn--active', allMode);
    allBtn.setAttribute('aria-pressed', String(allMode));
    versionSelect.disabled = allMode;
    langSelect.disabled    = allMode;
    renderResults(input.value.trim());
  });

  // ── Open / close ──────────────────────────────────────────────────
  function open() {
    overlay.classList.add('search-overlay--open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(function () { input.focus(); });
  }

  function close() {
    overlay.classList.remove('search-overlay--open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    input.value = '';
    suggestions.innerHTML = '';
  }

  if (openBtn) openBtn.addEventListener('click', open);

  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) close();
  });

  document.addEventListener('keydown', function (e) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      overlay.classList.contains('search-overlay--open') ? close() : open();
    }
    if (e.key === 'Escape') close();
  });

  // ── Search ────────────────────────────────────────────────────────
  input.addEventListener('input', function () {
    renderResults(this.value.trim());
  });

  function matchesScope(href) {
    if (allMode) return true;
    var ver  = versionSelect.value;
    var lang = langSelect.value;
    return href.indexOf('/docs/' + ver + '/' + lang + '/') === 0;
  }

  function renderResults(q) {
    suggestions.innerHTML = '';
    if (!q || !window.__searchIndex) return;

    var raw  = window.__searchIndex.search(q, { limit: MAX_RESULTS * 3, enrich: true });
    var seen = new Map();

    for (var i = 0; i < raw.length; i++) {
      for (var j = 0; j < raw[i].result.length; j++) {
        var doc = raw[i].result[j].doc;
        if (!doc || !doc.href) continue;
        if (!seen.has(doc.href) && matchesScope(doc.href)) {
          seen.set(doc.href, doc);
        }
        if (seen.size >= MAX_RESULTS) break;
      }
      if (seen.size >= MAX_RESULTS) break;
    }

    if (seen.size === 0) {
      var msg = document.createElement('div');
      msg.className = 'search-modal__no-results';
      msg.textContent = 'No results for "' + q + '"';
      suggestions.appendChild(msg);
      return;
    }

    seen.forEach(function (doc) {
      var entry = document.createElement('a');
      entry.setAttribute('href', doc.href);
      entry.className = 'search-modal__result';
      entry.setAttribute('role', 'option');

      var title = document.createElement('span');
      title.className = 'search-modal__result-title';
      title.textContent = doc.title;

      var desc = document.createElement('span');
      desc.className = 'search-modal__result-desc';
      desc.textContent = doc.description || '';

      entry.appendChild(title);
      entry.appendChild(desc);
      suggestions.appendChild(entry);
    });
  }

  // ── Arrow-key navigation ──────────────────────────────────────────
  document.addEventListener('keydown', function (e) {
    if (!overlay.classList.contains('search-overlay--open')) return;
    var items = Array.from(suggestions.querySelectorAll('.search-modal__result'));
    if (!items.length) return;

    var idx = items.indexOf(document.activeElement);
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      items[idx + 1 < items.length ? idx + 1 : 0].focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      items[idx > 0 ? idx - 1 : items.length - 1].focus();
    }
  });
})();
