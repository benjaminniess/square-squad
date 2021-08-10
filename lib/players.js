const Player = require('./player')

class Players {
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

  getPlayer(socketID) {
    if (!socketID) {
      return false
    }

    if (!this.players[socketID]) {
      return false
    }

    return this.players[socketID]
  }

  initPlayer(socketID, playerName, playerColor) {
    let newPlayer = new Player(socketID)
    newPlayer.resetData({
      nickName: playerName,
      color: playerColor
    })

    this.players[socketID] = newPlayer

    return newPlayer
  }

  updatePlayer(socketID, playerData) {
    this.players[socketID].resetData(playerData)
  }
}

module.exports = new Players().getInstance()
