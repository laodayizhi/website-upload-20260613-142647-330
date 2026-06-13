(function () {
    function initMoviePlayer(options) {
        var video = document.getElementById(options.videoId);
        var overlay = document.getElementById(options.overlayId);
        var hls = null;
        var ready = false;
        var requested = false;

        if (!video || !overlay || !options.src) {
            return;
        }

        if (options.poster) {
            video.setAttribute('poster', options.poster);
        }

        function attach() {
            if (ready) {
                return;
            }

            ready = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = options.src;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });

                hls.loadSource(options.src);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    if (requested) {
                        video.play().catch(function () {});
                    }
                });
                return;
            }

            video.src = options.src;
        }

        function play() {
            requested = true;
            attach();
            overlay.classList.add('is-hidden');
            video.controls = true;

            var attempt = video.play();

            if (attempt && typeof attempt.catch === 'function') {
                attempt.catch(function () {
                    overlay.classList.remove('is-hidden');
                });
            }
        }

        overlay.addEventListener('click', play);
        video.addEventListener('click', function () {
            if (video.paused) {
                play();
            }
        });
        video.addEventListener('play', function () {
            overlay.classList.add('is-hidden');
        });
        video.addEventListener('ended', function () {
            overlay.classList.remove('is-hidden');
        });
        window.addEventListener('beforeunload', function () {
            if (hls) {
                hls.destroy();
            }
        });
    }

    window.initMoviePlayer = initMoviePlayer;
}());
