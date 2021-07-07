// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import Vuex from 'vuex'

import VueRouter from 'vue-router'

import Home from './components/Home.vue'
import Room from './components/Room.vue'
import Rooms from './components/Rooms.vue'
import Page404 from './components/Page404.vue'

import { io } from 'socket.io-client'

const homeUrl =
  process.env.NODE_ENV === 'development' ? 'http://localhost:8080' : ''

const socket = io(homeUrl, { transports: ['websocket'] })

const packageJson = require('../../package.json')

Vue.config.productionTip = false

Vue.use(Vuex)
Vue.use(VueRouter)

const store = new Vuex.Store({
  state: {
    version: packageJson.version,
    homeUrl,
    socket,
    playerData: null,
    gameID: 'panic-attack',
    gameOptions: {
      roundsNumber: 3,
      obstaclesSpeed: 10,
      bonusFrequency: 5
    }
  },
  mutations: {
    updatePlayerData(state, playerData) {
      state.playerData = playerData
    },
    updateGameOption(state, gameOptions) {
      state.gameOptions[gameOptions['key']] = gameOptions['value']
    },
    setGameStatus(state, gameStatus) {
      if (gameStatus === 'playing') {
        particles.style.display = 'none'
      } else {
        particles.style.display = 'block'
      }
      state.status = gameStatus
    }
  }
})

const router = new VueRouter({
  mode: 'history',
  routes: [
    {
      path: '/',
      component: Home
    },
    {
      path: '/rooms',
      component: Rooms
    },
    {
      path: '/rooms/:id',
      component: Room
    },
    {
      path: '*',
      component: Page404
    }
  ]
})

new Vue({
  router,
  store,
  render: (h) => h(App)
}).$mount('#app')
