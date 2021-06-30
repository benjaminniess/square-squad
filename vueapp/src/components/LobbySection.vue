<template>
  <section class="room-section lobby-section" id="section-lobby">
    <div class="wrapper">
      <!--<logo></logo>-->
      <h3 class="rooms-list__title">Room: {{ roomName }}</h3>

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
          <input id="rounds-number" type="number" value="3" min="1" max="100" />
        </p>
        <h4>Obstacles speed</h4>
        <p>
          Slow
          <input
            id="obstacles-speed"
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
          <input id="bonus-frequency" type="range" min="1" max="10" value="5" />
          Too many bonus
        </p>
        <a class="btn" @click="startGame">play</a>
      </div>
      <a class="btn" @click="back">back</a>
    </div>
  </section>
</template>

<script>
export default {
  name: 'LobbySection',
  computed: {
    roomName() {
      return this.$store.state.roomName
    },
    players() {
      return this.$store.state.players
    },
    isAdmin() {
      return this.$store.state.isAdmin
    },
    currentPlayer() {
      return this.$store.state.currentPlayer
    }
  },
  methods: {
    startGame() {
      this.$parent.startGame()
    },
    back() {
      this.$router.push('/rooms')
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
