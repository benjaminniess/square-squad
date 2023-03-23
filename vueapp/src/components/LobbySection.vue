<template>
  <section id="section-lobby" class="room-section lobby-section">
    <div class="wrapper">
      <Logo/>
      <h3 class="rooms-list__title">Room: {{ room.roomName }}</h3>

      <ul v-if="players" class="players-list players no-score">
        <li
          v-for="(player, player_key) in players"
          :key="player_key"
          :style="{ color: player.color }"
        >
          {{ player.nickName }}
          <span v-if="player.socketId == admin">[Admin]</span>
          <span v-if="player.socketId == currentPlayer">[You]</span>
        </li>
      </ul>

      <div
        v-if="isAdmin == true"
        id="admin-section"
        style="visibility: visible;"
      >
        <AdminForm/>
        <a id="play-btn" class="btn" @click="startGame">play</a>
      </div>
      <a id="back-btn" class="btn" @click="back">back</a>
    </div>
  </section>
</template>

<script>
import Logo from './common/Logo.vue'
import AdminForm from './games/panic-attack/AdminForm.vue'
import {useSocketStore} from "../stores/SocketStore.js";
import {useGameStore} from "../stores/GamesStore.js";


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
    players: Object,
    admin: String,
    room: {}
  },
  mounted() {
    const socketStore = useSocketStore()

    socketStore.socket.on('leave-room-result', (result) => {
      this.$router.push('/rooms')
    })
  },
  computed: {
    isAdmin() {
      return this.currentPlayer === this.admin
    },
    currentPlayer() {
      const socketStore = useSocketStore()

      return socketStore.socket.id
    }
  },
  methods: {
    back() {
      const socketStore = useSocketStore()
      socketStore.socket.emit('leave-room', {
        roomSlug: this.room.roomSlug,
      })
    },
    startGame() {
      const socketStore = useSocketStore()
      const gameStore = useGameStore()

      socketStore.socket.emit('start-game', {
        roomSlug: this.room.roomSlug,
        ...gameStore.gameOptions
      })

      if (this.$gtag) {
        this.$gtag.event('startGame', {
          playersCount: this.players.length,
          ...gameStore.gameOptions
        })
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
