(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupMenu() {
        var button = document.querySelector("[data-menu-toggle]");
        var panel = document.querySelector("[data-mobile-panel]");
        if (!button || !panel) {
            return;
        }
        button.addEventListener("click", function () {
            panel.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var slider = document.querySelector("[data-hero-slider]");
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
        var index = 0;
        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === index);
            });
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
            });
        });
        setInterval(function () {
            show(index + 1);
        }, 5200);
    }

    function setupSearchForms() {
        var forms = document.querySelectorAll("[data-site-search]");
        forms.forEach(function (form) {
            form.addEventListener("submit", function (event) {
                var input = form.querySelector("input[name='q']");
                var query = input ? input.value.trim() : "";
                if (!query) {
                    event.preventDefault();
                    window.location.href = "./search.html";
                }
            });
        });
    }

    function setupFilters() {
        var panel = document.querySelector("[data-filter-panel]");
        var list = document.querySelector("[data-movie-list]");
        if (!panel || !list) {
            return;
        }
        var input = panel.querySelector("[data-filter-input]");
        var yearFilter = panel.querySelector("[data-year-filter]");
        var resetButton = panel.querySelector("[data-reset-filter]");
        var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));
        var emptyState = document.querySelector("[data-empty-state]");
        var searchTitle = document.querySelector("[data-search-title]");
        var queryInput = panel.querySelector("[data-query-input]");
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get("q") || "";
        if (queryInput && initialQuery) {
            queryInput.value = initialQuery;
        }
        if (searchTitle && initialQuery) {
            searchTitle.textContent = "搜索影片：" + initialQuery;
        }
        if (yearFilter && yearFilter.options.length <= 1) {
            var years = [];
            cards.forEach(function (card) {
                var year = card.getAttribute("data-year");
                if (year && years.indexOf(year) === -1) {
                    years.push(year);
                }
            });
            years.sort(function (a, b) {
                return Number(b) - Number(a);
            }).slice(0, 25).forEach(function (year) {
                var option = document.createElement("option");
                option.value = year;
                option.textContent = year;
                yearFilter.appendChild(option);
            });
        }
        function apply() {
            var term = input ? input.value.trim().toLowerCase() : "";
            var year = yearFilter ? yearFilter.value : "";
            var visible = 0;
            cards.forEach(function (card) {
                var haystack = (card.getAttribute("data-search") || "").toLowerCase();
                var cardYear = card.getAttribute("data-year") || "";
                var matched = (!term || haystack.indexOf(term) !== -1) && (!year || cardYear === year);
                card.style.display = matched ? "" : "none";
                if (matched) {
                    visible += 1;
                }
            });
            if (emptyState) {
                emptyState.classList.toggle("is-visible", visible === 0);
            }
        }
        if (input) {
            input.addEventListener("input", apply);
        }
        if (yearFilter) {
            yearFilter.addEventListener("change", apply);
        }
        if (resetButton) {
            resetButton.addEventListener("click", function () {
                if (input) {
                    input.value = "";
                }
                if (yearFilter) {
                    yearFilter.value = "";
                }
                if (searchTitle) {
                    searchTitle.textContent = "搜索影片";
                }
                apply();
            });
        }
        apply();
    }

    window.initVideoPlayer = function (videoId, sourceUrl) {
        var video = document.getElementById(videoId);
        if (!video) {
            return;
        }
        var shell = video.closest("[data-player-shell]");
        var overlay = shell ? shell.querySelector("[data-play-overlay]") : null;
        var loaded = false;
        var hlsInstance = null;

        function attach() {
            if (loaded) {
                return;
            }
            loaded = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = sourceUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(sourceUrl);
                hlsInstance.attachMedia(video);
            } else {
                video.src = sourceUrl;
            }
            video.controls = true;
        }

        function start() {
            attach();
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
            var playAction = video.play();
            if (playAction && typeof playAction.catch === "function") {
                playAction.catch(function () {});
            }
        }

        if (overlay) {
            overlay.addEventListener("click", start);
        }
        video.addEventListener("click", function () {
            if (video.paused) {
                start();
            }
        });
        video.addEventListener("ended", function () {
            if (overlay) {
                overlay.classList.remove("is-hidden");
            }
        });
        window.addEventListener("beforeunload", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };

    ready(function () {
        setupMenu();
        setupHero();
        setupSearchForms();
        setupFilters();
    });
})();
