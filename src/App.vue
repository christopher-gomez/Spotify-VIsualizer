<template>
  <div id="app" :class="{show: isShowing}">
    <notifications group="track" class="notif"/>
    <Hamburger class="controls" :class="{show: isShowing && landing===false}"></Hamburger>
    <router-view/>
    <div class="controls-wrapper" v-if="landing === false">
      <Controls
        :token="token"
        :artist="artist"
        :album="album"
        :track="track"
        :paused="paused"
        class="controls"
        :class="{show: isShowing}"
      ></Controls>
    </div>
  </div>
</template>

<script>
import SpotifyService from "@/services/SpotifyService.js";
import Controls from "@/components/Controls";
import Hamburger from "@/components/Menu";
import screenfull from "screenfull";
import NprogressContainer from 'vue-nprogress/src/NprogressContainer'

export default {
  name: "App",
  components: {
    Controls,
    Hamburger,
    NprogressContainer
  },
  data() {
    return {
      ext: null,
      landing: true,
      player: null,
      playerId: "",
      token: "",
      artist: "",
      album: "",
      prevTrack: "",
      track: "",
      trackId: "",
      paused: true,
      refreshIntervalSet: false,
      refreshInterval: 0,
      mouseMoveSet: false,
      menu: false,
      isShowing: true,
      timedelay: 1,
      _delay: 0,
      notifyCount: 0
    };
  },
  created() {
    if(!localStorage.capsule_colors) {
      var co = [
        '#F44336',
        '#E91E63',
        '#9C27B0',
        '#673AB7',
        '#3F51B5',
        '#2196F3',
        '#03A9F4',
        '#00BCD4',
        '#009688',
        '#4CAF50',
        '#8BC34A',
        '#CDDC39',
        '#FFEB3B',
        '#FFC107',
        '#FF9800',
        '#FF5722',
        '#795548',
        '#9E9E9E',
        '#607D8B',
        ];
        var colors = [];
        for(var i = 0; i < co.length;i++) {
          var color = co[i];
          color = color.replace('#','');
          colors.push(color);
        }
        localStorage.setItem('capsule_colors', JSON.stringify(colors));
    }

    if(!localStorage.capsule_bg)
    {
      localStorage.setItem('capsule_bg', 'Dark');
    }

    if (localStorage.access_token) {
      if (chrome.runtime) {
        chrome.runtime.sendMessage(
          "jidcihllhnmbjbnoijfepopdpkpgeobe",
          "version",
          response => {
            if (!response) {
              this.$router.replace({ name: "home" });
            } else if (response.version) {
              this.$router.replace({ name: "visualizer" });
            }
          }
        );
      } else {
        this.$router.replace({ name: "home" });
      }
    }
  },
  mounted() {},
  sockets: {
    paused: function() {
      this.$notify({
        group: "track",
        title: this.track + " - PAUSED",
        text: this.artist
      });
    },
    played: function() {
      this.$notify({
        group: "track",
        title: this.track,
        text: this.artist
      });
    }
  },
  watch: {
    $route(to, from) {
      if (to.path === "/") {
        this.terminateVis();
      } else if (to.path === "/success") {
        return;
      } else if (to.path === "/visualizer") {
        this.initVis();
      } 
    }
  },
  methods: {
    initVis() {
      this.landing = false;
      this.refreshToken();
      if (this.token === "") {
        this.getToken();
      }
      if (this.refreshIntervalSet === false) {
        this.createRefreshInterval();
        this.refreshIntervalSet = true;
      }
      if (this.mouseMoveSet === false) {
        this._delay = setInterval(this.delayCheck, 500);
        addEventListener("mousemove", this.mouseMove, false);
        addEventListener("scroll", this.scroll, false);
        this.mouseMoveSet = true;
      }
      this.webPlayer();
    },
    terminateVis() {
      this.landing = true;
      if (this.refreshIntervalSet === true) {
        clearInterval(this.refreshInterval);
        this.refreshIntervalSet = false;
      }
      if (this.mouseMoveSet === true) {
        clearInterval(this._delay);
        removeEventListener("mousemove", this.mouseMove, false);
        removeEventListener("scroll", this.scroll, false);
        this.mouseMoveSet = false;
      }
      if (this.player !== null) {
        this.player.disconnect();
        this.player = null;
      }
    },
    async webPlayer() {
      if (this.player === null) {
        let webPlayerSDK = document.createElement("script");
        webPlayerSDK.setAttribute(
          "src",
          "https://sdk.scdn.co/spotify-player.js"
        );
        document.head.appendChild(webPlayerSDK);
        window.onSpotifyWebPlaybackSDKReady = () => {
          var id;
          this.player = new Spotify.Player({
            name: "Spotilize",
            getOAuthToken: cb => {
              this.getToken();
              cb(this.token);
            }
          });

          // Error handling
          this.player.addListener("initialization_error", ({ message }) => {
            console.error(message);
          });
          this.player.addListener("authentication_error", ({ message }) => {
            console.error(message);
          });
          this.player.addListener("account_error", ({ message }) => {
            console.error(message);
          });
          this.player.addListener("playback_error", ({ message }) => {
            console.error(message);
          });

          // Playback status updates
          this.player.addListener("player_state_changed", state => {
            this.stateChanged(state);
          });

          // Ready
          this.player.addListener("ready", ({ device_id }) => {
            const iframe = document.querySelector(
              'iframe[src="https://sdk.scdn.co/embedded/index.html"]'
            );

            if (iframe) {
              iframe.style.display = "block";
              iframe.style.position = "absolute";
              iframe.style.top = "-1000px";
              iframe.style.left = "-1000px";
            }
            console.log("Ready with Device ID", device_id);
            localStorage.setItem("device_id", device_id);
            this.songLoaded = true;
            this.playerId = device_id;
            this.$socket.emit("ready", {
              player_id: this.playerId,
              token: this.token
            });
          });

          // Not Ready
          this.player.addListener("not_ready", ({ device_id }) => {
            localStorage.removeItem("device_id");
            this.songLoaded = false;
            console.log("Device ID has gone offline", device_id);
          });

          // Connect to the player!
          this.player.connect().then(success => {
            if (success) {
              console.log("Webplayback SDK successfully connected to Spotify");
            }
          });
        };
      }
      this.$socket.emit("ready", {
        player_id: this.playerId,
        access_token: this.token
      });
    },
    getToken() {
      if (localStorage.access_token) {
        this.token = localStorage.access_token;
        this.tokenExists = true;
      } else {
        this.tokenExists = false;
      }
    },
    async refreshToken() {
      let refresh = localStorage.refresh_token;
      const response = await SpotifyService.refreshToken(refresh);
      if (response.data.success === true) {
        let t_token = response.data.access_token;
        localStorage.setItem("access_token", t_token);
        this.token = t_token;
        this.$socket.emit("tokenRefreshed", { token: this.token });
      }
    },
    async createRefreshInterval() {
      this.refreshInterval = setInterval(() => {
        this.refreshToken();
      }, 600000);
    },
    mouseMove() {
      this.isShowing = true;
      this.timedelay = 1;
      clearInterval(this._delay);
      this._delay = setInterval(this.delayCheck, 500);
    },
    scroll() {
      this.isShowing = true;
      this.timedelay = 1;
      clearInterval(this._delay);
      this._delay = setInterval(this.delayCheck, 500);
    },
    toggleMenu() {
      console.log("menu toggled");
      if (this.menu === false) {
        this.menu = true;
      } else {
        this.menu = false;
      }
    },
    delayCheck() {
      if (this.paused === true) {
        this.isShowing = true;
        return;
      }
      if (this.timedelay === 6) {
        this.isShowing = false;
        this.timedelay = 1;
      }
      this.timedelay += 1;
    },
    stateChanged(state) {
      if (this.notifyCount >= 2) {
        this.notifyCount = 0;
      }
      this.prevTrack = this.track;
      this.track = state.track_window.current_track.name;
      this.paused = state.paused;
      this.artist =
        state.track_window.current_track.artists[0].name +
        " | " +
        state.track_window.current_track.album.name;
      this.notifyCount += 1;
      if (
        this.paused !== true &&
        this.notifyCount < 2 &&
        this.track !== this.prevTrack
      ) {
        this.$notify({
          group: "track",
          title: this.track,
          text: this.artist
        });
        this.trackId = state.track_window.current_track.id;
      }
      this.$socket.emit("stateChanged", { state: state });
    }
  }
};
</script>

<style lang="scss">
@import "~@/assets/scss/vendors/bootstrap-vue/index";
@import "~@/plugins/boot.scss";

html {
  height: 100%;
  overflow: hidden;
}
body {
  height: 100%;
  overflow: hidden;
}
#app {
  font-family: "Nunito", sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  height: 100%;
  width: 100%;
  cursor: none;
}
.notif {
  font-size: 40px;
  margin-top: 20px;
}
.controls-wrapper {
  position: absolute;
  bottom: 30px;
  width: 100%;
}

.controls {
  margin: 0 auto;
  pointer-events: none;
  z-index: 1;
  opacity: 0;
  transition: opacity 0.25s linear;
}
.show {
  opacity: 1;
  pointer-events: all;
  z-index: 1;
  cursor: auto !important;
}
</style>
