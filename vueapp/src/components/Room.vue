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
    <LobbySection
      v-bind:players="players"
      v-bind:room="room"
      v-bind:isAdmin="isAdmin"
      v-show="status == 'waiting'"
    ></LobbySection>
    <GameSection
      v-bind:players="players"
      v-bind:room="room"
      v-bind:isAdmin="isAdmin"
      v-bind:gameData="gameData"
      v-show="status == 'playing'"
    ></GameSection>
    <RankSection v-show="status == 'end-round'"></RankSection>
    <Footer />
  </div>
</template>

<script>
import LobbySection from './LobbySection'
import GameSection from './GameSection'
import RankSection from './RankSection'
import Logo from './common/Logo'
import Footer from './common/Footer'

export default {
  name: 'App',
  components: {
    LobbySection,
    GameSection,
    RankSection,
    Logo,
    Footer
  },
  data() {
    return {
      players: [],
      room: {},
      gameData: {
        timeLeft: null
      },
      isAdmin: false,
      status: 'waiting'
    }
  },
  mounted() {
    // Not "logged"? Go back to home
    if (this.$store.state.playerData === null) {
      this.$router.push('/')
    }

    this.$store.state.socket.emit('room-join', {
      roomSlug: this.$route.params.id
    })

    this.$store.state.socket.on('room-joined', (room) => {
      this.room = room
    })

    this.$store.state.socket.on('refresh-players', (data) => {
      this.players = data
    })

    this.$store.state.socket.on('game-is-starting', (data) => {
      this.gameData.currentRound = data.currentRound
      this.gameData.totalRounds = data.totalRounds
      this.status = 'playing'
    })

    this.$store.state.socket.on('countdown-update', (data) => {
      this.gameData.timeLeft = parseInt(data.timeleft)
    })

    this.$store.state.socket.on('in-game-countdown-update', (data) => {
      console.log(data)
      this.gameData.timeLeft = parseInt(data.timeleft)

      if (data.timeleft == 0) {
        this.gameData.timeLeft = 'Game over'
        this.status = 'end-round'

        // TODO: get list of users with points

        if (data.gameStatus === 'waiting') {
          backButton.style.display = 'block'
        } else {
          backButton.style.display = 'none'
          let timeleft = 3
          let countdownTimer = setInterval(function () {
            if (timeleft <= 0) {
              clearInterval(countdownTimer)
              if (typeof gtag !== 'undefined') {
                gtag('event', 'Start new round')
              }
              this.$store.state.socket.emit('start-game', {
                roomSlug: roomSlug
              })
              this.gameData.timeLeft = 'Starting...'
            }

            timeleft -= 1
          }, 1000)
        }
      }
    })
  },
  destroyed() {
    // Not to have double listener next time the component is mounted
    this.$store.state.socket.off('refresh-players')
    this.$store.state.socket.off('room-joined')
    this.$store.state.socket.off('game-is-starting')
    this.$store.state.socket.off('countdown-update')
    this.$store.state.socket.off('in-game-countdown-update')

    this.$store.state.socket.emit('room-leave')
  }
}
</script>

<style></style>
