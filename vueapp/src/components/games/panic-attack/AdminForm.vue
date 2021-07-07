<template>
    <div>
        <h4>Rounds number</h4>
        <p>
          <input :value="roundsNumber" @input="updateGameOptions" id="roundsNumber" type="number" min="1" max="100" />
        </p>
        <h4>Obstacles speed</h4>
        <p>
          Slow
          <input
            @input="updateGameOptions"
            :value="obstaclesSpeed"
            id="obstaclesSpeed"
            type="range"
            min="1"
            max="30"
          />
          fast
        </p>
        <h4>Bonus frequency</h4>
        <p>
          No bonus
          <input id="bonusFrequency" @input="updateGameOptions" :value="bonusFrequency" type="range" min="1" max="10" />
          Too many bonus
        </p>
    </div>
</template>

<script>
export default {
  name: 'AdminForm',
  data() {
    return {
      roundsNumber: this.$store.state.gameOptions.roundsNumber,
      obstaclesSpeed: this.$store.state.gameOptions.obstaclesSpeed,
      bonusFrequency: this.$store.state.gameOptions.bonusFrequency
    }
  },
  methods: {
    updateGameOptions(e) {
      this.$store.commit('updateGameOption', { key: e.target.id, value: e.target.value })
    }
  }
}
</script>
