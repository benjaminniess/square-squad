<template>
  <section class="room-section play-section" id="section-play">
    <div class="play-section__wrapper">
      <aside class="play-section__aside">
        <Logo />
        <div class="play-section__infos">
          <h3 class="rooms-list__title">Room: {{ room.roomName }}</h3>
          <h4 id="round-number">
            Round {{ gameData.currentRound }}/{{ gameData.totalRounds }}
          </h4>
          <ul v-if="players" class="players-list players">
            <li
              v-for="(player, player_key) in players"
              :key="player_key"
              :style="{ color: player.color }"
            >
              {{ player.nickname }}
              <!--<span v-if="player.isAdmin">[Admin]</span>-->
              <span v-if="player.id == currentPlayer">[You]</span>
              <span v-if="player.alive !== true">[Dead]</span>
              <span>[{{ player.score }}]</span>
            </li>
          </ul>
          <h1 id="points-text">
            0
          </h1>
        </div>
      </aside>
      <div class="play-section__canvas">
        <h1
          v-if="gameData.timeLeft > 0"
          class="play-section__countdown"
          style="opacity: 1;"
          id="countdown-text"
        >
          {{ gameData.timeLeft }}
        </h1>
        <canvas id="gameCanvas" width="700" height="700"></canvas>
      </div>
    </div>
  </section>
</template>

<script>
import Logo from './common/Logo'
import Footer from './common/Footer'
export default {
  name: 'GameSection',
  computed: {
    currentPlayer() {
      return this.$store.state.socket.id
    }
  },
  props: {
    players: [],
    room: {},
    gameData: {}
  },
  components: {
    Logo,
    Footer
  },
  methods: {}
}
</script>
