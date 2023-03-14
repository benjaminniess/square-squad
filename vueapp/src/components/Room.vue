<template>
  <div class="super-wrapper">
    <div id="particles-js" class="particles-js">
      <canvas
        class="particles-js-canvas-el"
        height="525"
        style="width: 100%; height: 100%;"
        width="1905"
      ></canvas>
    </div>
    <LobbySection
      v-show="status == 'waiting'"
      v-bind:isAdmin="isAdmin"
      v-bind:players="players"
      v-bind:room="room"
    ></LobbySection>
    <GameSection
      v-show="status == 'playing'"
      v-bind:gameData="gameData"
      v-bind:isAdmin="isAdmin"
      v-bind:players="players"
      v-bind:room="room"
    ></GameSection>
    <RankSection
      v-show="status == 'end-round'"
      v-bind:gameIsOver="gameIsOver"
      v-bind:players="players"
      v-bind:ranking="ranking"
      v-bind:room="room"
    ></RankSection>
    <Footer/>
  </div>
</template>

<script>
import LobbySection from './LobbySection.vue'
import GameSection from './GameSection.vue'
import RankSection from './RankSection.vue'
import Logo from './common/Logo.vue'
import Footer from './common/Footer.vue'
import {useGameStore} from "../stores/GamesStore.js";
import {useSocketStore} from "../stores/SocketStore.js";
import {usePlayerStore} from "../stores/PlayerStore.js";

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
      gameIsOver: false,
      ranking: [],
      isAdmin: false
    }
  },
  computed: {

    status() {
      const gameStore = useGameStore()

      return gameStore.gameStatus
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
    const socketStore = useSocketStore()
    const playerStore = usePlayerStore()
    const gameStore = useGameStore()

    if (this.$gtag) {
      this.$gtag.pageview('/lobby')
    }

    // Not "logged"? Go back to home
    if (playerStore.isEmpty()) {
      this.$router.push('/?redirect_to=' + this.$route.params.id)
    }

    socketStore.socket.emit('join-room', {
      roomSlug: this.$route.params.id
    })

    socketStore.socket.on('join-room-result', (result) => {
      if (result.success) {
        this.room = result.data
      } else {
        this.$router.push('/404?code=' + result.error)
      }
    })

    socketStore.socket.on('refresh-players', (data) => {
      this.players = data
    })

    socketStore.socket.on('start-game-result', (result) => {
      if (result.success) {
        this.gameData.currentRound = result.data.currentRound
        this.gameData.totalRounds = result.data.totalRounds
        gameStore.updateGameStatus('playing')
        this.gameIsOver = false
      }
    })

    socketStore.socket.on('countdown-update', (data) => {
      this.gameData.timeLeft = parseInt(data.timeleft)
    })

    socketStore.socket.on('in-game-countdown-update', (data) => {
      this.gameData.timeLeft = parseInt(data.timeleft)

      if (data.timeleft == 0) {
        this.gameData.timeLeft = 'Game over'

        this.ranking = data
        gameStore.updateGameStatus('end-round')

        if (data.gameStatus === 'waiting') {
          this.gameIsOver = true
        } else {
          let timeleft = 3
          let socket = socketStore.socket
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
    const socketStore = useSocketStore();

    // Not to have double listener next time the component is mounted
    socketStore.socket.off('refresh-players')
    socketStore.socket.off('join-roomed')
    socketStore.socket.off('start-game-result')
    socketStore.socket.off('countdown-update')
    socketStore.socket.off('in-game-countdown-update')

    socketStore.socket.emit('leave-room')
  }
}
</script>

<style></style>
