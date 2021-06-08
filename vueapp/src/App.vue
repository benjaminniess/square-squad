<template>
  <div id="vue-app">
    <lobby-section v-show="status == 'waiting'"></lobby-section>
    <game-section v-show="status == 'playing'"></game-section>
    <rank-section v-show="status == 'end-round'"></rank-section>
  </div>
</template>

<script>
import LobbySection from './components/LobbySection'

export default {
  name: 'App',
  components: {
    LobbySection,
  },
  methods: {
    startGame() {
      if (typeof gtag !== 'undefined') {
        gtag('event', 'Start Game')
      }

      socket.emit('start-game', {
        roomSlug: store.state.roomSlug,
        roundsNumber: document.getElementById('rounds-number').value,
        obstaclesSpeed: document.getElementById('obstacles-speed').value,
        bonusFrequency: document.getElementById('bonus-frequency').value,
      })
    },
  },
}
</script>

<style></style>
