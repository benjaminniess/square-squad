import {defineStore} from "pinia";

export const useGameStore = defineStore('game', {
  state: () => {
    return {
      gameID: 'panic-attack',
      gameStatus: 'waiting',
      gameOptions: {}
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
