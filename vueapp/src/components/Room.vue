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
    <SimpleMessage
      v-show="status == 'joining'"
      :messageContent="'Joining room ' + room.roomName + '...'"
    ></SimpleMessage>
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
    <RankSection
      v-bind:room="room"
      v-bind:gameIsOver="gameIsOver"
      v-bind:players="players"
      v-show="status == 'end-round'"
      v-bind:ranking="ranking"
    ></RankSection>
    <Footer />
  </div>
</template>

<script>
import LobbySection from './LobbySection'
import GameSection from './GameSection'
import RankSection from './RankSection'
import Logo from './common/Logo'
import Footer from './common/Footer'
import SimpleMessage from './SimpleMessage'

export default {
  name: 'App',
  components: {
    LobbySection,
    GameSection,
    RankSection,
    Logo,
    Footer,
    SimpleMessage
  },
  data() {
    return {
      players: [],
      room: {},
      gameData: {
        timeLeft: null
      },
      gameIsOver: false,
      ranking: [],
      isAdmin: false
    }
  },
  computed: {
    status() {
      return this.$store.state.gameStatus
    }
  },
  watch: {
    status: function (newStatus, oldStatus) {
      if (this.$gtag) {
        let view = 'default'
        if (newStatus === 'playing') {
          view = '/play'
        } else if (newStatus === 'waiting') {
          view = '/lobby'
        } else if (newStatus === 'end-round') {
          view = '/ranking'
        }

        this.$gtag.pageview(view)
      }
    }
  },
  mounted() {
    if (this.$gtag) {
      this.$gtag.pageview('/lobby')
    }

    // Not "logged"? Go back to home
    if (this.$store.state.playerData === null) {
      this.$router.push('/?redirect_to=' + this.$route.params.id)
    }

    this.$store.state.socket.emit('join-room', this.$route.params.id)

    this.$store.state.socket.on('join-room-result', (result) => {
      if (result.success) {
        this.room = result.data
      } else {
        this.$router.push('/')
      }
    })

    this.$store.state.socket.on('refresh-game-status', (data) => {
      this.$store.commit('updateGameStatus', data.gameStatus)
    })

    this.$store.state.socket.on('refresh-players', (data) => {
      this.players = data
    })

    this.$store.state.socket.on('start-game-result', (result) => {
      if (result.success) {
        this.gameData.currentRound = result.data.currentRound
        this.gameData.totalRounds = result.data.totalRounds
        this.$store.commit('updateGameStatus', 'playing')
        this.gameIsOver = false
      }
    })

    this.$store.state.socket.on('countdown-update', (data) => {
      this.gameData.timeLeft = parseInt(data.timeleft)
    })

    this.$store.state.socket.on('in-game-countdown-update', (data) => {
      this.gameData.timeLeft = parseInt(data.timeleft)

      if (data.timeleft == 0) {
        this.gameData.timeLeft = 'Game over'

        this.ranking = data
        this.$store.commit('updateGameStatus', 'end-round')

        if (data.gameStatus === 'waiting') {
          this.gameIsOver = true
        } else {
          let timeleft = 3
          let socket = this.$store.state.socket
          let gameData = this.gameData
          let room = this.room
          let countdownTimer = setInterval(() => {
            if (timeleft <= 0) {
              clearInterval(countdownTimer)

              socket.emit('start-game', {
                roomSlug: room.roomSlug
              })
              gameData.timeLeft = 'Starting...'
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
    this.$store.state.socket.off('join-room')
    this.$store.state.socket.off('start-game-result')
    this.$store.state.socket.off('countdown-update')
    this.$store.state.socket.off('in-game-countdown-update')

    this.$store.state.socket.emit('leave-room')
  }
}
</script>

<style></style>
