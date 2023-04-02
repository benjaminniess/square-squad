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
          <span v-if="player.socketID === admin">[Admin]</span>
          <span v-if="player.socketID === currentPlayer">[You]</span>
        </li>
      </ul>

      <div
        v-if="isAdmin === true"
        id="admin-section"
        style="visibility: visible;"
      >
        <div class="game-choose-section">
          <p>
            <input id="game-type-sample" v-model="gameType" name="gameType" type="radio" value="sample">&nbsp;
            <label for="game-type-sample">Sample</label>
          </p>

          <p>
            <input id="game-type-panic-attack" v-model="gameType" name="gameType" type="radio" value="panic-attack">&nbsp;
            <label for="game-type-panic-attack">Panic Attack</label>
          </p>

          <p>
            <input id="game-type-wolf-and-sheeps" v-model="gameType" name="gameType" type="radio" value="wolf-and-sheeps">&nbsp;
            <label for="game-type-wolf-and-sheeps">Wolf and sheeps</label>
          </p>

        </div>

        <PanicAttackAdminForm v-if="gameType === 'panic-attack'"/>
        <SampleAdminForm v-if="gameType === 'sample'"/>
        <WolfAndSheepsAdminForm v-if="gameType === 'wolf-and-sheeps'"/>
        <a id="play-btn" class="btn" @click="startGame">play</a>
      </div>
      <a id="back-btn" class="btn" @click="back">back</a>
    </div>
  </section>
</template>

<script>
import Logo from './common/Logo.vue'
import PanicAttackAdminForm from './games/panic-attack/AdminForm.vue'
import SampleAdminForm from './games/sample/AdminForm.vue'
import WolfAndSheepsAdminForm from './games/wolf-and-sheeps/AdminForm.vue'
import {useSocketStore} from "../stores/SocketStore.js";
import {useGameStore} from "../stores/GamesStore.js";


export default {
  name: 'LobbySection',
  components: {
    Logo,
    SampleAdminForm,
    PanicAttackAdminForm,
    WolfAndSheepsAdminForm
  },
  data() {
    return {
      gameType: 'sample',
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
        gameType: this.gameType,
        parameters: gameStore.gameOptions
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
