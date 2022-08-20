import {createStore} from 'vuex'
import VueGtag from 'vue-gtag'
import Home from './components/Home.vue'
import AboutUs from './components/AboutUs.vue'
import Room from './components/Room.vue'
import Rooms from './components/Rooms.vue'
import {createRouter, createWebHistory} from 'vue-router'
import Page404 from './components/Page404.vue'
import {io} from 'socket.io-client'
import '../assets/sass/main.scss'
import {createApp} from 'vue'
import App from "./App.vue";
import packageJson from "../../package.json";

const homeUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:8080' : ''


/**
 * Async call to the /env url in order to get dynamic vars
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
 * Run the Vue app once everything is loaded
 *
 * @param object envData
 */
function bootVueApp(envData) {
  const socket = io(homeUrl, {transports: ['websocket']})

  //Vue.config.productionTip = false


  const store = createStore({
    state: {
      socket,
      playerData: null,
      gameID: 'panic-attack',
      gameStatus: 'joining',
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

  const history = createWebHistory();
  const router = createRouter({
    history,
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
        path: '/:pathMatch(.*)*',
        component: Page404
      }
    ]
  })

  const appInstance = createApp(App)
    .use(store)
    .use(router)

  // Enable analytics if set
  if (envData.ga_id) {
    appInstance.use(VueGtag, {
      config: {
        id: envData.ga_id,
        params: {
          send_page_view: false
        }
      }
    })
  }

  appInstance.config.globalProperties.$globalEnv = {
    version: packageJson.version,
    homeUrl
  }
  
  appInstance.mount('#app')
}
