// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import Vuex from 'vuex'

Vue.config.productionTip = false

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    status: 'waiting',
    roomName: null,
    roomSlug: null,
    players: {},
    isAdmin: false,
    currentPlayer: null,
  },
  mutations: {
    roomJoined(state, roomData) {
      state.players = roomData.players
      state.currentPlayer = roomData.currentPlayer
      state.isAdmin = roomData.isAdmin
      state.status = roomData.status
      state.roomName = roomData.roomName
      state.roomSlug = roomData.roomSlug
    },
    refreshPlayers(state, refreshedPlayers) {
      state.players = refreshedPlayers
      refreshedPlayers.map((player) => {
        if (player.isAdmin && player.id === state.currentPlayer) {
          state.isAdmin = true
        }
      })
    },
    setGameStatus(state, gameStatus) {
      if (gameStatus === 'playing') {
        particles.style.display = 'none'
      } else {
        particles.style.display = 'block'
      }
      state.status = gameStatus
    },
  },
})

/* eslint-disable no-new */
new Vue({
  el: '#app',
  store: store,
  components: { App },
  template: '<App/>',
})
