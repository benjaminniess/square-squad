'use strict'

const Matter = require('matter-js')

const Composite = Matter.Composite

class PlayersManager {
  constructor(game, compositeObj) {
    this.compositeObj = compositeObj
    this.playersData = {}
    this.playersMoves = {}
    this.game = game
  }

  getGame() {
    return this.game
  }

  getComposite() {
    return this.compositeObj
  }

  getPlayersData() {
    return this.playersData
  }

  getPlayersMoves() {
    return this.playersMoves
  }

  setPlayersData(playersData) {
    this.playersData = playersData
  }

  initPlayer(playerSession) {
    this.playersData[playerSession.id] = {
      x: -100,
      y: canvasWidth / 2,
      nickname: playerSession.nickname,
      alive: true,
      speedMultiplicator: 1,
      score: 0,
      color: playerSession.color,
    }

    this.resetPlayersPositions()
    this.resetTouches(playerSession.id)
  }

  killPlayer(playerID) {
    this.playersData[playerID].alive = false
    this.playersData[playerID].score = this.getGame().getScore() - 1
    this.getGame().addRoundScore({
      playerID: playerID,
      score: this.playersData[playerID].score,
      nickname: this.playersData[playerID].nickname,
    })
  }

  renewPlayers() {
    _.forEach(this.playersData, (moves, playerID) => {
      this.playersData[playerID].alive = true
      this.resetTouches(playerID)
    })
  }

  resetPlayersPositions() {
    let existingPlayers = _.size(this.playersData)
    let i = 0
    let playerRequiredWidth = squareSize * 1.3
    _.forEach(this.playersData, (playerData, playerID) => {
      this.playersData[playerID].x =
        canvasWidth / 2 +
        i * playerRequiredWidth -
        (playerRequiredWidth * existingPlayers) / 2
      i++
    })
  }

  resetTouches(playerID) {
    this.playersMoves[playerID] = {
      up: false,
      down: false,
      left: false,
      right: false,
    }
  }

  removePlayer(playerID) {
    delete this.playersData[playerID]
    delete this.playersMoves[playerID]
  }

  updatePlayerButtonState(playerID, button, state) {
    if (this.playersMoves[playerID]) {
      this.playersMoves[playerID][button] = state
    }
  }

  getPlayerData(playerID) {
    return this.getPlayersData()[playerID]
  }

  setPlayerData(playerID, playerData) {
    this.playersData[playerID] = playerData
  }

  getPlayersData() {
    return this.playersData
  }

  countPlayers() {
    return _.size(this.playersData)
  }

  countAlivePlayers() {
    let alive = 0
    _.forEach(this.playersData, (playerData, playerID) => {
      if (playerData.alive) {
        alive++
      }
    })

    return alive
  }
}

module.exports = PlayersManager
