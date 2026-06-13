(function () {
  var form = document.querySelector('[data-search-form]');
  var input = document.querySelector('[data-search-input]');
  var result = document.querySelector('[data-search-results]');
  var status = document.querySelector('[data-search-status]');
  var empty = document.querySelector('[data-search-empty]');
  var items = window.SEARCH_ITEMS || [];
  var params = new URLSearchParams(window.location.search);
  var initial = params.get('q') || '';

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function buildCard(item) {
    var tags = (item.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return [
      '<article class="movie-card">',
      '  <a class="poster-link" href="' + item.url + '">',
      '    <img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
      '    <span class="poster-badge">' + escapeHtml(item.rating) + '</span>',
      '    <span class="poster-play">▶</span>',
      '  </a>',
      '  <div class="movie-card-body">',
      '    <div class="movie-card-meta">',
      '      <span>' + escapeHtml(item.year) + '</span>',
      '      <span>' + escapeHtml(item.region) + '</span>',
      '      <span>' + escapeHtml(item.type) + '</span>',
      '    </div>',
      '    <h3><a href="' + item.url + '">' + escapeHtml(item.title) + '</a></h3>',
      '    <p class="movie-card-desc">' + escapeHtml(item.oneLine || item.genre) + '</p>',
      '    <div class="tag-row">' + tags + '</div>',
      '    <div class="card-bottom">',
      '      <span>' + escapeHtml(item.category) + '</span>',
      '      <span>' + escapeHtml(item.genre) + '</span>',
      '    </div>',
      '  </div>',
      '</article>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function search(query) {
    var keyword = normalize(query);
    var scored = items.map(function (item) {
      var text = normalize([
        item.title,
        item.year,
        item.region,
        item.type,
        item.genre,
        item.category,
        (item.tags || []).join(' '),
        item.oneLine
      ].join(' '));
      var score = 0;

      if (!keyword) {
        score = parseFloat(item.rating || '0');
      } else if (normalize(item.title).indexOf(keyword) !== -1) {
        score = 100;
      } else if (text.indexOf(keyword) !== -1) {
        score = 50;
      }

      return {
        item: item,
        score: score
      };
    }).filter(function (entry) {
      return entry.score > 0;
    }).sort(function (a, b) {
      return b.score - a.score;
    }).slice(0, keyword ? 80 : 48);

    if (result) {
      result.innerHTML = scored.map(function (entry) {
        return buildCard(entry.item);
      }).join('');
    }

    if (status) {
      status.textContent = keyword ? '搜索结果已更新' : '推荐片单';
    }

    if (empty) {
      empty.classList.toggle('show', scored.length === 0);
    }
  }

  if (input) {
    input.value = initial;
    search(initial);
  }

  if (form && input) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var value = input.value.trim();
      var nextUrl = value ? './search.html?q=' + encodeURIComponent(value) : './search.html';
      window.history.replaceState(null, '', nextUrl);
      search(value);
    });

    input.addEventListener('input', function () {
      search(input.value);
    });
  }
})();
