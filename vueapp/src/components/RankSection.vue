<template>
  <section id="section-ranking" class="room-section ranking-section">
    <div class="wrapper">
      <Logo/>
      <div class="text-center">
        <h3 class="rooms-list__title">Room: {{ room.roomName }}</h3>
      </div>
      <table id="winner-announcement" class="winner-annoucement">
        <tbody>
        <tr v-if="winner">
          <td>Winner</td>
          <td>
              <span class="user-name" v-bind:style="{ color: winner.color }"
              ><span>{{ winner.nickname }}</span></span
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
      <ul id="round-rank-list" class="players-list">
        <li
          v-for="rank in formatedRanking()"
          :key="rank.id"
          v-bind:style="{ color: rank.color }"
        >
          {{ rank.nickname }} ({{ rank.score }} points)
        </li>
      </ul>
      <h3>Global ranking</h3>
      <ul id="rank-list" class="players-list">
        <li
          v-for="rank in formatedRanking('ranking')"
          :key="rank.id"
          v-bind:style="{ color: rank.color }"
        >
          {{ rank.nickname }} ({{ rank.score }} points)
        </li>
      </ul>
      <button v-if="gameIsOver" id="back-button" class="btn" @click="back">
        Back
      </button>
    </div>
  </section>
</template>

<script>
import Logo from './common/Logo.vue'
import Footer from './common/Footer.vue'
import {useGameStore} from "../stores/GamesStore.js";

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
      const gameStore = useGameStore()
      gameStore.updateGameStatus('waiting')
    }
  },
  props: {
    room: {},
    ranking: Array,
    players: {},
    gameIsOver: false
  },
  components: {
    Logo,
    Footer
  }
}
</script>
