import { H as Hls } from "./hls.js";

document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll(".movie-player").forEach(function (player) {
    var video = player.querySelector("video");
    var overlay = player.querySelector(".player-overlay");
    var errorBox = player.querySelector(".player-error");
    var streamUrl = player.getAttribute("data-stream");
    var hls = null;
    var initialized = false;

    function showError() {
      player.classList.add("has-error");
      if (errorBox) {
        errorBox.textContent = "视频暂时无法播放，请稍后再试";
      }
    }

    function initialize() {
      if (initialized || !video || !streamUrl) {
        return;
      }

      initialized = true;

      if (Hls && Hls.isSupported()) {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        hls.on(Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
            return;
          }
          if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
            return;
          }
          showError();
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
      } else {
        showError();
      }
    }

    function startPlayback() {
      initialize();
      if (!video) {
        return;
      }
      player.classList.add("is-playing");
      video.controls = true;
      var result = video.play();
      if (result && typeof result.catch === "function") {
        result.catch(function () {});
      }
    }

    initialize();

    if (overlay) {
      overlay.addEventListener("click", startPlayback);
    }

    if (video) {
      video.addEventListener("click", function () {
        if (video.paused) {
          startPlayback();
        }
      });
      video.addEventListener("play", function () {
        player.classList.add("is-playing");
      });
      video.addEventListener("pause", function () {
        if (video.currentTime === 0 || video.ended) {
          player.classList.remove("is-playing");
        }
      });
      video.addEventListener("error", function () {
        showError();
      });
    }

    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
        hls = null;
      }
    });
  });
});
