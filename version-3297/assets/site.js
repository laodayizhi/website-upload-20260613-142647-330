document.addEventListener("DOMContentLoaded", function () {
  var body = document.body;
  var header = document.querySelector(".site-header");
  var navToggle = document.querySelector(".nav-toggle");

  function updateHeader() {
    if (!header) {
      return;
    }
    if (window.scrollY > 18) {
      header.classList.add("is-scrolled");
    } else {
      header.classList.remove("is-scrolled");
    }
  }

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  if (navToggle) {
    navToggle.addEventListener("click", function () {
      body.classList.toggle("nav-open");
    });
  }

  document.querySelectorAll(".mobile-nav a").forEach(function (link) {
    link.addEventListener("click", function () {
      body.classList.remove("nav-open");
    });
  });

  var hero = document.querySelector("[data-hero]");
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    var current = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        showSlide(dotIndex);
      });
    });

    showSlide(0);
    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }
  }

  document.querySelectorAll("[data-filter-root]").forEach(function (root) {
    var input = root.querySelector("[data-filter-input]");
    var chips = Array.prototype.slice.call(root.querySelectorAll("[data-filter-chip]"));
    var cards = Array.prototype.slice.call(root.querySelectorAll("[data-card]"));
    var empty = root.querySelector("[data-empty]");
    var activeChip = "all";

    function normalize(value) {
      return String(value || "").toLowerCase().trim();
    }

    function applyFilter() {
      var keyword = normalize(input ? input.value : "");
      var visible = 0;

      cards.forEach(function (card) {
        var searchText = normalize(card.getAttribute("data-search"));
        var tagText = normalize(card.getAttribute("data-tags"));
        var chipMatch = activeChip === "all" || tagText.indexOf(activeChip) !== -1;
        var keywordMatch = !keyword || searchText.indexOf(keyword) !== -1;
        var shouldShow = chipMatch && keywordMatch;

        card.classList.toggle("hidden-card", !shouldShow);
        if (shouldShow) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }

    if (input) {
      input.addEventListener("input", applyFilter);
    }

    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        activeChip = normalize(chip.getAttribute("data-filter-chip"));
        chips.forEach(function (item) {
          item.classList.toggle("is-active", item === chip);
        });
        applyFilter();
      });
    });

    applyFilter();
  });
});
