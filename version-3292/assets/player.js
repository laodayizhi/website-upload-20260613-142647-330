(function () {
  var video = document.querySelector('[data-player-video]');
  var button = document.querySelector('[data-player-start]');
  var url = window.PAGE_VIDEO_URL;
  var hlsInstance = null;
  var attached = false;

  function startPlayback() {
    if (!video) {
      return;
    }

    var promise = video.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {
        if (button) {
          button.classList.remove('is-hidden');
        }
      });
    }
  }

  function attachSource() {
    if (!video || !url || attached) {
      return;
    }

    attached = true;

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(url);
      hlsInstance.attachMedia(video);
      hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
        startPlayback();
      });
    } else {
      video.src = url;
      video.addEventListener('loadedmetadata', startPlayback, { once: true });
    }
  }

  function playVideo() {
    if (!video || !url) {
      return;
    }

    if (button) {
      button.classList.add('is-hidden');
    }

    attachSource();
    startPlayback();
  }

  if (button) {
    button.addEventListener('click', playVideo);
  }

  if (video) {
    video.addEventListener('click', function () {
      if (video.paused) {
        playVideo();
      }
    });
  }

  window.addEventListener('pagehide', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
  });
})();
