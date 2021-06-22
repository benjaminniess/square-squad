<template>
  <div id="vue-app">
    <LobbySection v-show="status == 'waiting'"></LobbySection>
    <GameSection v-show="status == 'playing'"></GameSection>
    <RankSection v-show="status == 'end-round'"></RankSection>
  </div>
</template>

<script>
import LobbySection from './LobbySection'
import GameSection from './GameSection'
import RankSection from './RankSection'

export default {
  name: 'App',
  components: {
    LobbySection,
    GameSection,
    RankSection,
  },
  methods: {
    startGame() {
      if (typeof gtag !== 'undefined') {
        gtag('event', 'Start Game')
      }

      socket.emit('start-game', {
        roomSlug: this.$store.state.roomSlug,
        roundsNumber: document.getElementById('rounds-number').value,
        obstaclesSpeed: document.getElementById('obstacles-speed').value,
        bonusFrequency: document.getElementById('bonus-frequency').value,
      })
    },
  },
  computed: {
    status() {
      return this.$store.state.status
    },
  },
}
</script>

<style></style>
