'use strict'

const helpers = require(__base + 'lib/helpers')

class MasterGame {
  constructor() {
    this.speed = 6
    this.duration = 30
    this.playersData = {}
    this.playersMoves = {}
    this.status = 'waiting'
    this.type = 'countdown'
  }

  getSlug() {
    return this.slug
  }

  /**
   * waiting : waiting for players to join the lobby
   * starting : redirecting users to the play screen + launching the countdown
   * playing : game has started
   *
   * @returns
   */
  getStatus() {
    return this.status
  }

  initPlayer(playerSession) {
    this.playersData[playerSession.playerID] = {
      x: helpers.getRandomInt(50, 600),
      y: 200,
      name: playerSession.nickName,
      alive: true,
    }

    this.playersMoves[playerSession.playerID] = {
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
    this.playersMoves[playerID][button] = state
  }

  getDuration() {
    return this.duration
  }

  getType() {
    return this.type
  }

  getBasicData() {
    return {
      squareSize: squareSize,
    }
  }

  countPlayers() {
    return Object.keys(this.playersData).length
  }

  countAlivePlayers() {
    return new Promise((resolve, reject) => {
      let alive = 0
      let countRows = 0
      for (const [playerID, playerData] of Object.entries(this.playersData)) {
        countRows ++
        if ( playerData.alive ) {
          alive ++
        }

        if ( countRows >= Object.keys(this.playersData).length ) {
          resolve(alive)
        }
      }
    })
  }

  setStatus(status) {
    this.status = status
  }

  refreshData() {
    for (const [playerID, moves] of Object.entries(this.playersMoves)) {
      if (moves.down) {
        this.playersData[playerID].y += this.speed
        if (this.playersData[playerID].y > canvasWidth - squareSize) {
          this.playersData[playerID].y = canvasWidth - squareSize
        }
      }
      if (moves.right) {
        this.playersData[playerID].x += this.speed
        if (this.playersData[playerID].x > canvasWidth - squareSize) {
          this.playersData[playerID].x = canvasWidth - squareSize
        }
      }
      if (moves.top) {
        this.playersData[playerID].y -= this.speed
        if (this.playersData[playerID].y < 0) {
          this.playersData[playerID].y = 0
        }
      }
      if (moves.left) {
        this.playersData[playerID].x -= this.speed
        if (this.playersData[playerID].x < 0) {
          this.playersData[playerID].x = 0
        }
      }
    }

    return { players: this.playersData }
  }
}

module.exports = MasterGame
