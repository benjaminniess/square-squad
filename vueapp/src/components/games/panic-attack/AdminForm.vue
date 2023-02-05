<template>
  <div>
    <h4>Rounds number</h4>
    <p>
      <input
        id="roundsNumber"
        :value="roundsNumber"
        max="100"
        min="1"
        type="number"
        @input="updateGameOptions"
      />
    </p>
    <h4>Obstacles speed</h4>
    <p>
      Slow
      <input
        id="obstaclesSpeed"
        :value="obstaclesSpeed"
        max="30"
        min="1"
        type="range"
        @input="updateGameOptions"
      />
      fast
    </p>
    <h4>Bonus frequency</h4>
    <p>
      No bonus
      <input
        id="bonusFrequency"
        :value="bonusFrequency"
        max="10"
        min="1"
        type="range"
        @input="updateGameOptions"
      />
      Too many bonus
    </p>
  </div>
</template>

<script>
import {useGameStore} from "../../../stores/GamesStore.js";

export default {
  name: 'AdminForm',
  data() {
    const gameStore = useGameStore()
    return {
      roundsNumber: gameStore.gameOptions.roundsNumber,
      obstaclesSpeed: gameStore.gameOptions.obstaclesSpeed,
      bonusFrequency: gameStore.gameOptions.bonusFrequency
    }
  },
  methods: {
    updateGameOptions(e) {
      const gameStore = useGameStore()
      gameStore.updateGameOption({
        key: e.target.id,
        value: e.target.value
      })
    }
  }
}
</script>
