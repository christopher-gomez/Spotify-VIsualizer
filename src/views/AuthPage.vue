<template>
  <div id="auth">
    <div id='container'>
    <canvas id='canvas'></canvas>
    <div class='overlay'>
    <div v-if="success==='successful'" class='success'>
        <h1>Spotify Link Successful!</h1>
        <hr>
        <p>Only a couple more steps before you can begin rocking out to sweet visuals!</p>
        <ol>
          <li>Right click the extension icon on your Chrome toolbar</li>
          <li>Go down to "This Can Read and Change Site Data" and select "On spotilize.uc.r.appspot.com"</li>
          <li>Now go ahead and left click that extension icon!</li>
        </ol>
        <small>(Forget the app URL! You'll click that extension icon everytime you want to use the app from now on, otherwise the visualizer wont function properly. Trust me!)</small><br><br>
    </div>
    <div v-else-if="success==='false'" class='fail'>
        <h1>Uh oh!</h1>
        <hr>
        <p>Something went wrong linking your Spotify Account</p><font-awesome-icon icon='frown' size="3x"/> <br><br><p>Please go back and try again</p>
    </div>
    <div v-else-if="success==='basic'" class='fail'>
      <h1>Uh Oh!</h1>
      <hr>
      <p>I'm sorry, this app only works with Spotify Premium. Consider upgrading your account!</p>
      <br><p>(The benefits are worth it)</p>
    </div>
    </div>
    </div>
  </div>
</template>

<script>
import Particle from '@/util/Capsule.js';
import SpotifyService from '@/services/SpotifyService';

export default {
  name: 'Auth',
  data () {
    return {
      success: Boolean,
      code: null,
      NUM_PARTICLES: 100,
			particles: [],
			height: null,
			width: null,
			ratio: null,
      ctx: null,
      canvas: HTMLElement,
    }
  },
  mounted() {
    /*window.onbeforeunload = function () {
      window.opener.checkToken();
    }*/
    if(this.$route.query.code) {
      this.code = this.$route.query.code;
      this.exchange();
    }
    if(this.$route.query.error) {
      this.success = 'false';
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
      this.height = window.innerHeight/this.ratio;
      this.width = window.innerWidth/this.ratio;

			//scale the canvas
			if(this.canvas !== null && this.canvas !== undefined) {
				this.canvas.setAttribute('height', this.height);
				this.canvas.setAttribute('width', this.width);
				this.ctx = this.canvas.getContext('2d');
        this.ctx.globalCompositeOperation = 'lighter';
        this.setup();
      }
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
		random (min, max = undefined) {
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
		},
    async exchange() {
      var code = this.code;
      const response = await SpotifyService.exchange({code});
      if(response.data.success === true) {
        const re2 = await SpotifyService.getProfile(response.data.access_token);
        if(re2.data.success === true) {
          if(re2.data.profileType === "premium") {
            this.success = 'successful';
            localStorage.setItem('access_token', response.data.access_token);
            localStorage.setItem('refresh_token', response.data.refresh_token);
          } else {
            this.success = 'basic';
          }
        } else {
          this.success = 'false';
        }
      } else {
        this.success = 'false';
      }
    },
    cont() {
      this.$router.replace({name: 'visualizer'});
    }
  }
}
</script>

<style scoped>
#auth {
  margin: 0 auto;
	height: 100%;
  width: 100%;
	color: white;
	background: #13242f;
}
#container {
  position: relative;
}
#container canvas, .overlay {
  position: absolute;
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
.md-button {
  background-color:#42b983;
  color:black;
  border:none;
}
.fail {
  color: white;
  text-align:center;
}
.success {
  color: white;
  text-align:center;
}
#container {
  position: relative;
}
#container canvas, .overlay {
  position: absolute;
}
canvas {
  z-index: 0;
  left:0;
  right: 0;
}
.overlay {
  z-index: 2;
  margin: 15% auto;
  width: 100%;
}
#container .overlay footer {
  position: fixed;
  left:0;
  right:0;
  margin: 0 auto;
  bottom: 0;
}
#auth:before {
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
#auth:after {
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

