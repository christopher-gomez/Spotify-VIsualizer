import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

const router =  new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('./views/Landing.vue')
    },
    {
      path: '/success',
      name: 'success',
      component: () => import('./views/AuthPage.vue')
    },
    {
      path: '/system_settings',
      component: () => import('./views/Profile.vue'),
    },
    {
      path: '/visualizer',
      name: 'visualizer',
      component: () => import('./views/Visualizer.vue'),
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
});

export default router;