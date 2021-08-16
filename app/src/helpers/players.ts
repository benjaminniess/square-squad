export { Players }
import { Player } from '../entities/player'

class Players {
  private players: any
  private static instance: any

  constructor() {
    if (!Players.instance) {
      Players.instance = this
      this.players = {}
    }
  }

  getInstance() {
    return Players.instance
  }

  getPlayers() {
    return this.players
  }

  getPlayer(socketID: string) {
    if (!socketID) {
      return false
    }

    if (!this.players[socketID]) {
      return false
    }

    return this.players[socketID]
  }

  initPlayer(socketID: string, playerName: string, playerColor: string) {
    let newPlayer = new Player(socketID)
    newPlayer.resetData({
      nickName: playerName,
      color: playerColor
    })

    this.players[socketID] = newPlayer

    return newPlayer
  }

  updatePlayer(socketID: string, playerData: string) {
    if (!this.getPlayer(socketID)) {
      return false
    }

    this.players[socketID].resetData(playerData)
  }
}
