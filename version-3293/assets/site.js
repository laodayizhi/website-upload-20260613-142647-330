(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var nav = document.querySelector('[data-main-nav]');
  if (menuButton && nav) {
    menuButton.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-search-form]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = form.querySelector('input[name="q"]');
      var value = input ? input.value.trim() : '';
      var url = './search.html';
      if (value) {
        url += '?q=' + encodeURIComponent(value);
      }
      window.location.href = url;
    });
  });

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var thumbs = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-thumb]'));
    var active = 0;
    var show = function (index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === active);
      });
      thumbs.forEach(function (thumb, i) {
        thumb.classList.toggle('is-active', i === active);
      });
    };
    thumbs.forEach(function (thumb, i) {
      thumb.addEventListener('click', function () {
        show(i);
      });
    });
    if (slides.length > 1) {
      window.setInterval(function () {
        show(active + 1);
      }, 5600);
    }
  }

  var normalText = function (value) {
    return (value || '').toString().toLowerCase().replace(/\s+/g, '');
  };

  var filterCards = function (scope) {
    var list = scope.querySelector('[data-card-list]') || document.querySelector('[data-card-list]');
    if (!list) {
      return;
    }
    var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));
    var queryInput = scope.querySelector('[data-card-filter]') || document.querySelector('[data-card-filter]');
    var typeSelect = scope.querySelector('[data-type-filter]') || document.querySelector('[data-type-filter]');
    var query = normalText(queryInput ? queryInput.value : '');
    var type = normalText(typeSelect ? typeSelect.value : '');
    cards.forEach(function (card) {
      var text = normalText([
        card.getAttribute('data-title'),
        card.getAttribute('data-year'),
        card.getAttribute('data-region'),
        card.getAttribute('data-type'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-tags'),
        card.textContent
      ].join(' '));
      var cardType = normalText(card.getAttribute('data-type'));
      var matched = (!query || text.indexOf(query) !== -1) && (!type || cardType.indexOf(type) !== -1);
      card.classList.toggle('is-filtered-out', !matched);
    });
  };

  document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
    scope.addEventListener('input', function () {
      filterCards(scope);
    });
    scope.addEventListener('change', function () {
      filterCards(scope);
    });
    filterCards(scope);
  });

  document.querySelectorAll('[data-local-search]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      filterCards(document);
    });
  });

  var params = new URLSearchParams(window.location.search);
  var q = params.get('q');
  if (q) {
    var searchInput = document.querySelector('[data-card-filter]');
    if (searchInput) {
      searchInput.value = q;
      filterCards(document);
    }
  }

  var rankInput = document.querySelector('[data-rank-filter]');
  if (rankInput) {
    rankInput.addEventListener('input', function () {
      var qv = normalText(rankInput.value);
      document.querySelectorAll('[data-rank-list] .rank-item').forEach(function (item) {
        item.classList.toggle('is-filtered-out', qv && normalText(item.textContent).indexOf(qv) === -1);
      });
    });
  }
})();
