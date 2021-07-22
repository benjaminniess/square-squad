import Vue from 'vue'
import App from './App'
import Vuex from 'vuex'
import VueGtag from 'vue-gtag'
import VueRouter from 'vue-router'
import Home from './components/Home.vue'
import AboutUs from './components/AboutUs.vue'
import Room from './components/Room.vue'
import Rooms from './components/Rooms.vue'
import Page404 from './components/Page404.vue'
import { io } from 'socket.io-client'

const homeUrl =
  process.env.NODE_ENV === 'development' ? 'http://localhost:8080' : ''

/**
 * Async call to the /env url in order to get dynammic vars
 */
function loadEnvData() {
  return new Promise((resolve, reject) => {
    const xmlhttp = new XMLHttpRequest()
    xmlhttp.open('GET', homeUrl + '/env', true)
    xmlhttp.onload = function (e) {
      if (xmlhttp.status !== 200 || xmlhttp.readyState !== 4) {
        reject('loading error.')
      } else {
        resolve(JSON.parse(xmlhttp.responseText))
      }
    }
    xmlhttp.send(null)
  })
}
loadEnvData()
  .then((result) => {
    bootVueApp(result)
  })
  .catch((message) => {
    alert(message)
  })

/**
 * Run the Vue app once everyting is loaded
 *
 * @param object envData
 */
function bootVueApp(envData) {
  const socket = io(homeUrl, { transports: ['websocket'] })
  const packageJson = require('../../package.json')
  Vue.config.productionTip = false

  // Enable analytics if set
  if (envData.ga_id) {
    Vue.use(VueGtag, {
      config: {
        id: envData.ga_id,
        params: {
          send_page_view: false
        }
      }
    })
  }

  Vue.use(Vuex)
  Vue.use(VueRouter)

  Vue.prototype.$globalEnv = {
    version: packageJson.version,
    homeUrl,
  }

  const store = new Vuex.Store({
    state: {
      socket,
      playerData: null,
      gameID: 'panic-attack',
      gameStatus: 'waiting',
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
      updateGameStatus(state, status) {
        state.gameStatus = status
      },
      updateGameOption(state, gameOptions) {
        state.gameOptions[gameOptions['key']] = gameOptions['value']
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
        path: '/about-us',
        component: AboutUs
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
}
