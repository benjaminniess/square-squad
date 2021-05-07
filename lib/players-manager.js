'use strict'

const Matter = require('matter-js')

class PlayersManager {
  constructor(game) {
    this.compositeObj = Matter.Composite.create({ label: 'players' })
    this.playersData = {}
    this.playersMoves = {}
    this.game = game
    this.speed = game.getSpeed()
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

  getPlayersPhysicalData() {
    return Matter.Composite.allBodies(this.compositeObj)
  }

  getPlayersMoves() {
    return this.playersMoves
  }

  processPlayersRequests(playersMoves) {
    _.forEach(this.getPlayersPhysicalData(), (compositePlayer) => {
      if (playersMoves[compositePlayer.gamePlayerID]) {
        Matter.Body.applyForce(compositePlayer, compositePlayer.position, {
          x:
            ((playersMoves[compositePlayer.gamePlayerID].x * this.speed) /
              1700) *
            this.playersData[compositePlayer.gamePlayerID].speedMultiplicator,
          y:
            ((playersMoves[compositePlayer.gamePlayerID].y * this.speed) /
              1700) *
            this.playersData[compositePlayer.gamePlayerID].speedMultiplicator,
        })

        this.playersData[compositePlayer.gamePlayerID].x =
          compositePlayer.position.x
        this.playersData[compositePlayer.gamePlayerID].y =
          compositePlayer.position.y
      }
    })
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
  }

  addPoints(playerID, countPoints) {
    this.playersData[playerID].score += countPoints
  }

  addPlayersPoints(countPoints = 1, aliveOnly = true) {
    _.forEach(this.playersData, (playerData, playerID) => {
      if (aliveOnly) {
        if (playerData.alive) {
          this.addPoints(playerID, countPoints)
        }
      } else {
        this.addPoints(playerID, countPoints)
      }
    })
  }

  renewPlayers() {
    _.forEach(this.playersData, (moves, playerID) => {
      this.playersData[playerID].alive = true
      this.resetTouches(playerID)
    })
  }

  resetPlayersPositions() {
    Matter.Composite.clear(this.compositeObj)
    let existingPlayers = _.size(this.playersData)
    let i = 0
    let playerRequiredWidth = squareSize * 1.3
    _.forEach(_.shuffle(_.keys(this.playersData)), (playerID) => {
      let playerData = this.playersData[playerID]
      this.playersData[playerID].x =
        canvasWidth / 2 +
        i * playerRequiredWidth -
        (playerRequiredWidth * existingPlayers) / 2

      let body = Matter.Bodies.rectangle(
        playerData.x,
        playerData.y,
        squareSize,
        squareSize,
        {
          inertia: Infinity,
          restitution: 2,
          frictionAir: 0.25,
        },
      )
      Matter.Body.set(body, 'gamePlayerID', playerID)

      Matter.Composite.add(this.compositeObj, body)
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
