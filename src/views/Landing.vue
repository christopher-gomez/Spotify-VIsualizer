<template>
  <div id='landing'>
    <div id='container'>
      <canvas id='canvas'></canvas>
      <div class='overlay'>
        <h1>Spotilize</h1>
        <hr>
        <div id='extCheck'></div>
        <div v-if='isChrome === true'>
          <div v-if='ext === true'>
            <Link />
          </div>
          <div v-else>
            <md-button class="md-raised chr" @click='install()'>Add to Chrome</md-button>
          </div>
        </div>
        <footer>A Spotify visualizer made with <font-awesome-icon icon=heart style='color:red' /> by <a
            :href="'https://www.linkedin.com/in/christopher-gomez-8489a7186/'" target="_blank">Christopher Gomez</a>
        </footer>
      </div>
    </div>
  </div>
</template>

<script>
import Link from '@/components/Link';
import Particle from '@/util/Capsule.js';

export default {
  name: "Landing",
  components: {
    Link
  },
  data() {
    return {
      ext: false,
      NUM_PARTICLES: 100,
      particles: [],
      height: null,
      width: null,
      ratio: null,
      ctx: null,
      canvas: HTMLElement,
      requestid: null,
      isChrome: false
    }
  },
  mounted() {
    this.isChrome = navigator.userAgent.indexOf("Chrome") != -1
    if (this.isChrome === true) {
      if (chrome.runtime) {
        chrome.runtime.sendMessage('jidcihllhnmbjbnoijfepopdpkpgeobe', 'version', (response) => {
          if (!response) {
            document.getElementById('extCheck').innerHTML = "<p>To use this app you need to download the Chrome Extension first</p>";
            this.ext = false;
          } else if (response.version) {
            document.getElementById('extCheck').innerHTML = "<p style='font-size:1.3em'>Link your Spotify Account to  begin using Spotilize</p>"
            this.ext = true;
          }
        });
      } else {
        document.getElementById('extCheck').innerHTML = "<p>To use this app you need to download the Chrome Extension first</p>";
        this.ext = false;
      }
    } else {
      document.getElementById('extCheck').innerHTML = "<p>I'm sorry!<br>Due to the nature of the technology used in this app, it is only accesible on Google Chrome.</p>";
    }
    this.canvas = document.getElementById('canvas');
    this.sizeCanvas();
  },
  beforeDestroy() {
    this.NUM_PARTICLES = 250;
    this.particles = [];
    this.bands = null;
    this.ctx = null;
    this.canvas = null;
    window.cancelAnimationFrame(this.requestid);
  },
  methods: {
    sizeCanvas() {
      this.ratio = window.devicePixelRatio;
      this.height = window.innerHeight / this.ratio;
      this.width = window.innerWidth / this.ratio;

      //scale the canvas
      if (this.canvas !== null && this.canvas !== undefined) {
        this.canvas.setAttribute('height', this.height);
        this.canvas.setAttribute('width', this.width);
        this.ctx = this.canvas.getContext('2d');
        this.ctx.globalCompositeOperation = 'lighter';
        this.setup();
      }
    },
    install() {
      window.location = 'https://chrome.google.com/webstore/detail/spotilize/jidcihllhnmbjbnoijfepopdpkpgeobe';
    },
    setup() {
      var i, j, particle, x, y;
      for (i = 0; i <= this.NUM_PARTICLES; i++) {
        x = this.random(this.width);
        y = this.random(this.height);
        particle = new Particle(x, y, JSON.parse(localStorage.capsule_colors));
        particle.energy = this.random(particle.band / 256);
        this.particles.push(particle);
      }
      this.requestid = requestAnimationFrame(this.draw);
    },
    draw() {
      this.ctx.clearRect(0, 0, this.width * this.ratio, this.height * this.ratio);
      this.update();
      this.requestid = requestAnimationFrame(this.draw);
    },
    update() {
      let particle;
      for (let j = 0; j < this.particles.length; j++) {
        particle = this.particles[j];
        // recycle particles
        if (particle.y < -particle.size * particle.level * particle.scale) {
          //particle.reset();
          particle.x = this.random(this.width);
          particle.y = this.height + (particle.size * particle.scale * particle.level);
        }
        particle.move();
        particle.draw(this.ctx);
      }
    },
    random(min, max = undefined) {
      if (this.isArray(min))
        return min[~~(Math.random() * min.length)];
      if (!this.isNumber(max))
        max = min || 1, min = 0;
      return min + Math.random() * (max - min);
    },
    isArray(object) {
      return Object.prototype.toString.call(object) == '[object Array]';
    },
    isNumber(object) {
      return typeof object == 'number';
    }
  }
};
</script>

<style scoped>
#landing {
  margin: 0 auto;
  height: 100%;
  width: 100%;
  color: white;
  background: #13242f;
}

.chr {
  background-color: #0266C8;
  margin-top: 1em;
  color: white;
}

#container {
  position: relative;
}

#container canvas,
.overlay {
  position: absolute;
}

canvas {
  z-index: 0;
  left: 0;
  right: 0;
}

hr {
  display: block;
  height: 1px;
  border: 0;
  border-top: 1px solid #ccc;
  margin: 1em auto;
  padding: 0;
  width: 25%;
}

.overlay {
  z-index: 2;
  margin: 15% auto;
  width: 100%;
}

#container .overlay footer {
  position: fixed;
  left: 0;
  right: 0;
  margin: 0 auto;
  bottom: 0;
}

#landing:before {
  background-size: 100%;
  background-image: url('data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4gPHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHJhZGlhbEdyYWRpZW50IGlkPSJncmFkIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgY3g9IjUwJSIgY3k9IiIgcj0iOTUlIj48c3RvcCBvZmZzZXQ9IjIwJSIgc3RvcC1jb2xvcj0iIzAwMDAwMCIgc3RvcC1vcGFjaXR5PSIwLjAiLz48c3RvcCBvZmZzZXQ9Ijk1JSIgc3RvcC1jb2xvcj0iIzAwMDAwMCIvPjwvcmFkaWFsR3JhZGllbnQ+PC9kZWZzPjxyZWN0IHg9IjAiIHk9IjAiIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JhZCkiIC8+PC9zdmc+IA==');
  background-image: -moz-radial-gradient(center, ellipse cover, rgba(0, 0, 0, 0) 20%, #000000 95%);
  background-image: -webkit-radial-gradient(center, ellipse cover, rgba(0, 0, 0, 0) 20%, #000000 95%);
  background-image: radial-gradient(ellipse cover at center, rgba(0, 0, 0, 0) 20%, #000000 95%);
  position: absolute;
  content: "";
  z-index: 0;
  opacity: 0.9;
  height: 100%;
  width: 100%;
  left: 0;
  top: 0;
}

#landing:after {
  background: url("https://s.cdpn.io/1715/noise-1.png");
  position: absolute;
  content: "";
  z-index: 0;
  opacity: 0.8;
  height: 100%;
  width: 100%;
  left: 0;
  top: 0;
}
</style>
