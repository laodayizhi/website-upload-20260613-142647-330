(function () {
  window.initMoviePlayer = function (src) {
    var video = document.getElementById('moviePlayer');
    var layer = document.getElementById('playLayer');
    var hlsInstance = null;
    var ready = false;

    if (!video || !src) {
      return;
    }

    var attach = function () {
      if (ready) {
        return;
      }
      ready = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          maxBufferLength: 30,
          backBufferLength: 30
        });
        hlsInstance.loadSource(src);
        hlsInstance.attachMedia(video);
      } else {
        video.src = src;
      }
    };

    var start = function () {
      attach();
      if (layer) {
        layer.classList.add('is-hidden');
      }
      video.controls = true;
      var playPromise = video.play();
      if (playPromise && playPromise.catch) {
        playPromise.catch(function () {});
      }
    };

    if (layer) {
      layer.addEventListener('click', start);
    }

    video.addEventListener('click', function () {
      if (!ready) {
        start();
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };
})();
