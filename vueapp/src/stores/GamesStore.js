import {defineStore} from "pinia";

export const useGameStore = defineStore('game', {
  state: () => {
    return {
      gameID: 'panic-attack',
      gameStatus: 'waiting',
      gameOptions: {
        roundsNumber: 3,
        obstaclesSpeed: 10,
        bonusFrequency: 5
      }
    }
  },
  actions: {
    updateGameStatus(status) {
      this.gameStatus = status
    },
    updateGameOption(gameOptions) {
      this.gameOptions[gameOptions['key']] = gameOptions['value']
    }
  },
})
