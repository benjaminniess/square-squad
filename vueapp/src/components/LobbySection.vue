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
        <AdminForm />
        <a class="btn" @click="startGame">play</a>
      </div>
      <a class="btn" @click="back">back</a>
    </div>
  </section>
</template>

<script>
import Logo from './common/Logo'
import AdminForm from './games/panic-attack/AdminForm.vue'

export default {
  name: 'LobbySection',
  components: {
    Logo,
    AdminForm
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
        ...this.$store.state.gameOptions
      })
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
