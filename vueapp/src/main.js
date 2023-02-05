import {createApp} from 'vue'
import {createPinia} from 'pinia'
import App from './App.vue'
import VueGtag from 'vue-gtag'
import Home from './components/Home.vue'
import AboutUs from './components/AboutUs.vue'
import Room from './components/Room.vue'
import Rooms from './components/Rooms.vue'
import Page404 from './components/Page404.vue'
import * as packageJson from '../../package.json'
import {io} from 'socket.io-client'
import {createRouter, createWebHashHistory} from 'vue-router'
import {useSocketStore} from "./stores/SocketStore.js";

const homeUrl =
  process.env.NODE_ENV === 'development' ? 'http://localhost:8080' : ''

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
  const router = createRouter({
    history: createWebHashHistory(),
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
        path: "/:catchAll(.*)",
        component: Page404
      }
    ]
  })

  const pinia = createPinia()
  const socket = io(homeUrl, {transports: ['websocket']})
  const app = createApp(App)
  
  app.config.globalProperties.version = packageJson.version
  app.config.globalProperties.homeUrl = homeUrl

  // Enable analytics if set
  if (envData.ga_id) {
    app.use(VueGtag, {
      config: {
        id: envData.ga_id,
        params: {
          send_page_view: false
        }
      }
    })
  }

  app.use(pinia)
  const socketStore = useSocketStore()
  socketStore.initSocket(socket)

  app.use(router)
  app.mount('#app')
}
