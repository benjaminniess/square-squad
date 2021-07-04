<template>
  <section class="room-section lobby-section" id="section-lobby">
    <div class="wrapper">
      <Logo />
      <h3 class="rooms-list__title">Room: {{ room.roomName }}</h3>

      <ul v-if="players" class="players-list players no-score">
        <li
          v-for="(player, player_key) in players"
          :key="player_key"
          :style="{ color: player.color }"
        >
          {{ player.nickname }}
          <span v-if="player.isAdmin">[Admin]</span>
          <span v-if="player.id == currentPlayer">[You]</span>
        </li>
      </ul>

      <div
        v-if="isAdmin == true"
        id="admin-section"
        style="visibility: visible;"
      >
        <h4>Rounds number</h4>
        <p>
          <input
            id="rounds-number"
            v-model="roundsNumber"
            type="number"
            value="3"
            min="1"
            max="100"
          />
        </p>
        <h4>Obstacles speed</h4>
        <p>
          Slow
          <input
            id="obstacles-speed"
            v-model="obstaclesSpeed"
            type="range"
            min="1"
            max="30"
            value="10"
          />
          fast
        </p>
        <h4>Bonus frequency</h4>
        <p>
          No bonus
          <input
            id="bonus-frequency"
            v-model="bonusFrequency"
            type="range"
            min="1"
            max="10"
            value="5"
          />
          Too many bonus
        </p>
        <a class="btn" @click="startGame">play</a>
      </div>
      <a class="btn" @click="back">back</a>
    </div>
  </section>
</template>

<script>
import Logo from './common/Logo'
export default {
  name: 'LobbySection',
  components: {
    Logo
  },
  data() {
    return {
      roundsNumber: 3,
      obstaclesSpeed: 15,
      bonusFrequency: 5
    }
  },
  props: {
    players: [],
    room: {}
  },
  computed: {
    isAdmin() {
      let isAdmin = false
      this.players.map((player) => {
        if (player.id === this.currentPlayer && player.isAdmin) {
          isAdmin = true
        }
      })

      return isAdmin
    },
    currentPlayer() {
      return this.$store.state.socket.id
    }
  },
  methods: {
    startGame() {
      this.$parent.startGame()
    },
    back() {
      this.$router.push('/rooms')
    },
    startGame() {
      if (typeof gtag !== 'undefined') {
        gtag('event', 'Start Game')
      }

      this.$store.state.socket.emit('start-game', {
        roomSlug: this.room.roomSlug,
        roundsNumber: this.roundsNumber,
        obstaclesSpeed: this.obstaclesSpeed,
        bonusFrequency: this.bonusFrequency
      })
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
