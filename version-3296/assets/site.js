function createMoviePlayer(streamUrl) {
  var box = document.querySelector("[data-movie-player]");
  if (!box) {
    return;
  }

  var video = box.querySelector("video");
  var startButton = box.querySelector("[data-player-start]");
  var attached = false;
  var hlsInstance = null;

  function attachStream() {
    if (attached || !video || !streamUrl) {
      return;
    }

    attached = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
      return;
    }

    if (typeof Hls !== "undefined" && Hls.isSupported()) {
      hlsInstance = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(streamUrl);
      hlsInstance.attachMedia(video);
      return;
    }

    video.src = streamUrl;
  }

  function beginPlay() {
    attachStream();

    if (startButton) {
      startButton.hidden = true;
    }

    var playAction = video.play();

    if (playAction && typeof playAction.catch === "function") {
      playAction.catch(function () {
        if (startButton) {
          startButton.hidden = false;
        }
      });
    }
  }

  if (startButton) {
    startButton.addEventListener("click", beginPlay);
  }

  video.addEventListener("click", function () {
    if (!attached || video.paused) {
      beginPlay();
    } else {
      video.pause();
    }
  });

  video.addEventListener("play", function () {
    if (startButton) {
      startButton.hidden = true;
    }
  });

  video.addEventListener("pause", function () {
    if (video.currentTime === 0 && startButton) {
      startButton.hidden = false;
    }
  });

  window.addEventListener("beforeunload", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}

(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
    } else {
      document.addEventListener("DOMContentLoaded", callback);
    }
  }

  function setupMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");

    if (!button || !nav) {
      return;
    }

    button.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");

    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var index = 0;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
  }

  function setupFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));

    panels.forEach(function (panel) {
      var input = panel.querySelector("[data-filter-input]");
      var category = panel.querySelector("[data-filter-select]");
      var year = panel.querySelector("[data-filter-year]");
      var scope = panel.parentElement || document;
      var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-card]"));

      function apply() {
        var keyword = input ? input.value.trim().toLowerCase() : "";
        var categoryValue = category ? category.value : "";
        var yearValue = year ? year.value : "";

        cards.forEach(function (card) {
          var text = card.getAttribute("data-search") || "";
          var cardCategory = card.getAttribute("data-category") || "";
          var cardYear = card.getAttribute("data-year") || "";
          var matched = true;

          if (keyword && text.indexOf(keyword) === -1) {
            matched = false;
          }

          if (categoryValue && cardCategory !== categoryValue) {
            matched = false;
          }

          if (yearValue && cardYear !== yearValue) {
            matched = false;
          }

          card.classList.toggle("is-hidden", !matched);
        });
      }

      if (input) {
        input.addEventListener("input", apply);
      }

      if (category) {
        category.addEventListener("change", apply);
      }

      if (year) {
        year.addEventListener("change", apply);
      }
    });
  }

  function createSearchCard(item) {
    var tags = item.tags.slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");

    return "<article class=\"movie-card\">" +
      "<a class=\"movie-poster\" href=\"./" + escapeHtml(item.file) + "\" aria-label=\"" + escapeHtml(item.title) + "\">" +
      "<img src=\"" + escapeHtml(item.cover) + "\" alt=\"" + escapeHtml(item.title) + "\" loading=\"lazy\">" +
      "<span class=\"poster-shine\"></span>" +
      "</a>" +
      "<div class=\"movie-card-body\">" +
      "<div class=\"movie-meta-line\"><span>" + escapeHtml(item.year) + "</span><span>" + escapeHtml(item.region) + "</span><span>" + escapeHtml(item.type) + "</span></div>" +
      "<h3><a href=\"./" + escapeHtml(item.file) + "\">" + escapeHtml(item.title) + "</a></h3>" +
      "<p>" + escapeHtml(item.oneLine) + "</p>" +
      "<div class=\"movie-tags\">" + tags + "</div>" +
      "</div>" +
      "</article>";
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function setupSearchPage() {
    var results = document.querySelector("[data-search-results]");
    var title = document.querySelector("[data-search-title]");
    var input = document.querySelector("[data-search-page-input]");

    if (!results || typeof SEARCH_INDEX === "undefined") {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var query = (params.get("q") || "").trim();

    if (input) {
      input.value = query;
    }

    if (!query) {
      return;
    }

    var words = query.toLowerCase().split(/\s+/).filter(Boolean);
    var matched = SEARCH_INDEX.filter(function (item) {
      var text = item.searchText;
      return words.every(function (word) {
        return text.indexOf(word) !== -1;
      });
    }).slice(0, 120);

    if (title) {
      title.textContent = "与“" + query + "”相关的影片";
    }

    if (matched.length) {
      results.innerHTML = matched.map(createSearchCard).join("");
    } else {
      results.innerHTML = "<div class=\"empty-state\"><h2>没有找到匹配影片</h2><p>可以换一个片名、标签或年份继续搜索。</p></div>";
    }
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupSearchPage();
  });
})();
