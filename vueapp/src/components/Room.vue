<template>
  <div class="super-wrapper">
    <div class="particles-js" id="particles-js">
      <canvas
        class="particles-js-canvas-el"
        width="1905"
        height="525"
        style="width: 100%; height: 100%;"
      ></canvas>
    </div>
    <LobbySection v-show="status == 'waiting'"></LobbySection>
    <GameSection v-show="status == 'playing'"></GameSection>
    <RankSection v-show="status == 'end-round'"></RankSection>
  </div>
</template>

<script>
import LobbySection from './LobbySection'
import GameSection from './GameSection'
import RankSection from './RankSection'
import Logo from './common/Logo'

export default {
  name: 'App',
  components: {
    LobbySection,
    GameSection,
    RankSection,
    Logo
  },
  mounted() {
    this.$store.state.socket.emit('room-join', {
      roomSlug: this.$route.params.id
    })
    this.$store.state.socket.on('refresh-players', (data) => {
      console.log(data)
    })
  },
  destroyed() {
    // Not to have double listener next time the component is mounted
    this.$store.state.socket.off('refresh-players')
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
        bonusFrequency: document.getElementById('bonus-frequency').value
      })
    }
  },
  computed: {
    status() {
      return this.$store.state.status
    }
  }
}
</script>

<style></style>
