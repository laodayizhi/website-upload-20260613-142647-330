(function () {
    function all(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function one(selector, root) {
        return (root || document).querySelector(selector);
    }

    function normalize(value) {
        return (value || '').toString().trim().toLowerCase();
    }

    function setupMenu() {
        var button = one('.menu-toggle');
        var nav = one('.mobile-nav');

        if (!button || !nav) {
            return;
        }

        button.addEventListener('click', function () {
            var opened = nav.classList.toggle('open');
            button.setAttribute('aria-expanded', opened ? 'true' : 'false');
        });
    }

    function setupHero() {
        var slider = one('.hero-slider');

        if (!slider) {
            return;
        }

        var slides = all('.hero-slide', slider);
        var dots = all('.hero-dot', slider);
        var prev = one('.hero-prev', slider);
        var next = one('.hero-next', slider);
        var current = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, position) {
                slide.classList.toggle('active', position === current);
            });

            dots.forEach(function (dot, position) {
                dot.classList.toggle('active', position === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                start();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(parseInt(dot.getAttribute('data-go-slide'), 10) || 0);
                start();
            });
        });

        slider.addEventListener('mouseenter', stop);
        slider.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function setupFilters() {
        var input = one('.page-filter');
        var year = one('.year-filter');
        var region = one('.region-filter');
        var cards = all('.filter-results .movie-card');
        var empty = one('.empty-state');

        if (!cards.length || !input) {
            return;
        }

        var params = new URLSearchParams(window.location.search);
        var query = params.get('q');

        if (query) {
            input.value = query;
        }

        function matches(card) {
            var keyword = normalize(input.value);
            var selectedYear = year ? normalize(year.value) : '';
            var selectedRegion = region ? normalize(region.value) : '';
            var haystack = normalize([
                card.getAttribute('data-title'),
                card.getAttribute('data-tags'),
                card.getAttribute('data-year'),
                card.getAttribute('data-region'),
                card.getAttribute('data-genre')
            ].join(' '));
            var cardYear = normalize(card.getAttribute('data-year'));
            var cardRegion = normalize(card.getAttribute('data-region'));

            if (keyword && haystack.indexOf(keyword) === -1) {
                return false;
            }

            if (selectedYear && cardYear !== selectedYear) {
                return false;
            }

            if (selectedRegion && cardRegion.indexOf(selectedRegion) === -1) {
                return false;
            }

            return true;
        }

        function apply() {
            var visible = 0;

            cards.forEach(function (card) {
                var ok = matches(card);
                card.hidden = !ok;

                if (ok) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.hidden = visible !== 0;
            }
        }

        input.addEventListener('input', apply);

        if (year) {
            year.addEventListener('change', apply);
        }

        if (region) {
            region.addEventListener('change', apply);
        }

        apply();
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupMenu();
        setupHero();
        setupFilters();
    });
}());
