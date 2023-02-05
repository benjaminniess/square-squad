import {defineStore} from "pinia";

export const usePlayerStore = defineStore('player', {
  state: () => {
    return {
      playerData: {}
    }
  },
  actions: {
    updatePlayerData(playerData) {
      this.playerData = playerData
    },
    isEmpty() {
      return !this.playerData.name || !this.playerData.color
    }
  },
})
