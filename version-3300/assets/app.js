(function () {
  var toggle = document.querySelector("[data-menu-toggle]");
  var mobileNav = document.querySelector("[data-mobile-nav]");
  if (toggle && mobileNav) {
    toggle.addEventListener("click", function () {
      mobileNav.classList.toggle("open");
    });
  }

  var hero = document.querySelector("[data-hero]");
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === current);
      });
    }

    function restart() {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        showSlide(i);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        showSlide(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        showSlide(current + 1);
        restart();
      });
    }

    restart();
  }

  var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));
  panels.forEach(function (panel) {
    var list = document.querySelector("[data-movie-list]");
    if (!list) {
      return;
    }
    var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));
    var search = panel.querySelector("[data-filter-search]");
    var year = panel.querySelector("[data-filter-year]");
    var type = panel.querySelector("[data-filter-type]");
    var sort = panel.querySelector("[data-sort-year]");
    var tagButtons = Array.prototype.slice.call(document.querySelectorAll("[data-filter-tag]"));
    var activeTag = "";
    var sortDesc = true;

    function apply() {
      var query = search ? search.value.trim().toLowerCase() : "";
      var yearValue = year ? year.value : "";
      var typeValue = type ? type.value : "";
      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-tags")
        ].join(" ").toLowerCase();
        var ok = true;
        if (query && haystack.indexOf(query) === -1) {
          ok = false;
        }
        if (yearValue && card.getAttribute("data-year") !== yearValue) {
          ok = false;
        }
        if (typeValue && card.getAttribute("data-type").indexOf(typeValue) === -1) {
          ok = false;
        }
        if (activeTag && haystack.indexOf(activeTag.toLowerCase()) === -1) {
          ok = false;
        }
        card.classList.toggle("hidden-by-filter", !ok);
      });
    }

    if (search) {
      search.addEventListener("input", apply);
      var params = new URLSearchParams(window.location.search);
      var q = params.get("q");
      if (q) {
        search.value = q;
      }
    }
    if (year) {
      year.addEventListener("change", apply);
    }
    if (type) {
      type.addEventListener("change", apply);
    }
    if (sort) {
      sort.addEventListener("click", function () {
        sortDesc = !sortDesc;
        cards.sort(function (a, b) {
          var ay = parseInt(a.getAttribute("data-year"), 10) || 0;
          var by = parseInt(b.getAttribute("data-year"), 10) || 0;
          return sortDesc ? by - ay : ay - by;
        });
        cards.forEach(function (card) {
          list.appendChild(card);
        });
      });
    }
    tagButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        activeTag = button.getAttribute("data-filter-tag") || "";
        tagButtons.forEach(function (item) {
          item.classList.toggle("active", item === button);
        });
        apply();
      });
    });
    apply();
  });
})();

function initHlsVideo(video, url) {
  if (!video || !url) {
    return;
  }
  if (video.getAttribute("data-loaded") === url) {
    return;
  }
  video.setAttribute("data-loaded", url);
  if (window.Hls && window.Hls.isSupported()) {
    if (video._hls) {
      video._hls.destroy();
    }
    var hls = new window.Hls({
      enableWorker: true,
      lowLatencyMode: true
    });
    video._hls = hls;
    hls.loadSource(url);
    hls.attachMedia(video);
    hls.on(window.Hls.Events.ERROR, function (event, data) {
      if (!data || !data.fatal) {
        return;
      }
      if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
        hls.startLoad();
      } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
        hls.recoverMediaError();
      } else {
        hls.destroy();
      }
    });
  } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
    video.src = url;
  } else {
    video.src = url;
  }
}
