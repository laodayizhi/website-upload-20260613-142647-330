(function () {
  var toggle = document.querySelector('.nav-toggle');
  var panel = document.querySelector('.mobile-panel');

  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      var expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!expanded));
      panel.hidden = expanded;
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var currentSlide = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    currentSlide = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === currentSlide);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === currentSlide);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      showSlide(currentSlide + 1);
    }, 5200);
  }

  var filterInput = document.querySelector('[data-filter-input]');
  var filterCards = Array.prototype.slice.call(document.querySelectorAll('[data-filter-card]'));
  var filterStatus = document.querySelector('[data-filter-status]');
  var emptyResult = document.querySelector('[data-empty-result]');

  function applyFilter() {
    if (!filterInput || !filterCards.length) {
      return;
    }

    var value = filterInput.value.trim().toLowerCase();
    var visible = 0;

    filterCards.forEach(function (card) {
      var text = card.getAttribute('data-search-text') || '';
      var matched = !value || text.indexOf(value) !== -1;
      card.style.display = matched ? '' : 'none';
      if (matched) {
        visible += 1;
      }
    });

    if (filterStatus) {
      filterStatus.textContent = value ? '已筛选出相关影片' : '';
    }

    if (emptyResult) {
      emptyResult.classList.toggle('show', visible === 0);
    }
  }

  if (filterInput) {
    filterInput.addEventListener('input', applyFilter);
    applyFilter();
  }
})();
