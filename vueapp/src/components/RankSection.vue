<template>
  <section class="room-section ranking-section" id="section-ranking">
    <div class="wrapper">
      <Logo />
      <div class="text-center">
        <h3 class="rooms-list__title">Room: {{ room.roomName }}</h3>
      </div>
      <table class="winner-annoucement" id="winner-announcement">
        <tbody>
          <tr v-if="winner">
            <td>Winner</td>
            <td>
              <span class="user-name" v-bind:style="{ color: winner.color }"
                ><span>{{ winner.nickName }}</span></span
              >
            </td>
          </tr>
          <tr v-if="winner">
            <td>Point(s)</td>
            <td>
              <p class="user-score">{{ winner.score }} pts</p>
            </td>
          </tr>
        </tbody>
      </table>
      <h3>Round results</h3>
      <ul class="players-list" id="round-rank-list">
        <li
          v-for="rank in formatedRanking()"
          :key="rank.id"
          v-bind:style="{ color: rank.color }"
        >
          {{ rank.nickName }} ({{ rank.score }} points)
        </li>
      </ul>
      <h3>Global ranking</h3>
      <ul class="players-list" id="rank-list">
        <li
          v-for="rank in formatedRanking('ranking')"
          :key="rank.id"
          v-bind:style="{ color: rank.color }"
        >
          {{ rank.nickName }} ({{ rank.score }} points)
        </li>
      </ul>
      <button v-if="gameIsOver" class="btn" id="back-button" @click="back">
        Back
      </button>
    </div>
  </section>
</template>

<script>
import Logo from './common/Logo'
import Footer from './common/Footer'
export default {
  name: 'RankSection',
  computed: {
    winner() {
      if (!this.ranking.roundWinner) {
        return null
      }

      return {
        ...this.players.find((player) => {
          return player.id === this.ranking.roundWinner.playerID
        }),
        score: this.ranking.roundWinner.score
      }
    }
  },
  methods: {
    formatedRanking(type = 'roundRanking') {
      if (!this.ranking[type]) {
        return null
      }

      let finalRanking = []
      this.ranking[type].map((rank) => {
        finalRanking.push({
          ...this.players.find((player) => {
            return player.id === rank.playerID
          }),
          score: rank.score
        })
      })

      return finalRanking
    },
    back() {
      this.$store.commit('updateGameStatus', 'waiting')
    }
  },
  props: {
    room: {},
    ranking: [],
    players: {},
    gameIsOver: false
  },
  components: {
    Logo,
    Footer
  }
}
</script>
