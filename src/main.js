import '@babel/polyfill'
import 'mutationobserver-shim'
import Vue from 'vue';
import './plugins/bootstrap-vue'
import App from './App.vue';
import router from './router';

import VueMaterial from 'vue-material';
import 'vue-material/dist/vue-material.min.css';

import VueSocketIO from 'vue-socket.io';

import { library } from '@fortawesome/fontawesome-svg-core';
import {
  faTrash,
  faCheck,
  faUser,
  faStepForward,
  faStepBackward,
  faPlay,
  faPause,
  faRandom,
  faRedo,
  faVolumeUp,
  faVolumeDown,
  faArrowsAlt,
  faCompressArrowsAlt,
  faHeart,
  faHandPointDown,
  faFrown,
  faLevelUpAlt
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

import VueWait from 'vue-wait'
Vue.use(VueWait);
var baseURL;
var port;
var config;

if (process.env.NODE_ENV === 'production' || !process.env.NODE_ENV) {
  baseURL = "https://spotilize.uc.r.appspot.com";
  port = "";
} else {
  let config = require('../config/settings');
  baseURL = config.baseURL;
  port = config.serverPort;
}
Vue.use(new VueSocketIO({
  connection: baseURL + port,
}));
import Vuesax from 'vuesax'

import 'vuesax/dist/vuesax.css' //Vuesax styles
import 'material-icons/iconfont/material-icons.css';
Vue.use(Vuesax, {
  theme: {
    colors: {
      primary: '#5b3cc4',
      success: 'rgb(23, 201, 100)',
      danger: 'rgb(242, 19, 93)',
      warning: 'rgb(255, 130, 0)',
      dark: 'rgb(36, 33, 69)',
      green: 'rgba(66,185,131, .3)'
    }
  }
})

import Notifications from 'vue-notification'
Vue.use(Notifications)

library.add(faTrash);
library.add(faCheck);
library.add(faUser);
library.add(faStepForward);
library.add(faStepBackward);
library.add(faPlay);
library.add(faPause);
library.add(faRandom);
library.add(faRedo);
library.add(faVolumeUp);
library.add(faVolumeDown);
library.add(faArrowsAlt);
library.add(faCompressArrowsAlt);
library.add(faHeart);
library.add(faFrown);
library.add(faHandPointDown);
library.add(faLevelUpAlt);

Vue.component('font-awesome-icon', FontAwesomeIcon);

Vue.use(VueMaterial);

import NProgress from 'vue-nprogress'
Vue.use(NProgress)
const nprogress = new NProgress({
  parent: "body"
});

Vue.config.productionTip = false

new Vue({
  nprogress,
  router,
  wait: new VueWait(),
  render: h => h(App)
}).$mount('#app')
