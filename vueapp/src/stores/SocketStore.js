import {defineStore} from "pinia";

export const useSocketStore = defineStore('socket', {
  state: () => {
    return {
      socket: {}
    }
  },
  actions: {
    initSocket(socket) {
      this.socket = socket
    },
  },
})



