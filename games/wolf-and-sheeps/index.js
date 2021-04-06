class Wolf_And_Sheep {
  constructor(slug, name) {
    this.speed = 6
    this.ballRadius = 10
    this.playersData = {}
    this.playersMoves = {}
    this.wolf = null
  }

  initPlayer(playerSession) {
    this.playersData[playerSession.playerID] = {
      x: 100,
      y: 200,
      name: playerSession.nickName,
    }

    this.playersMoves[playerSession.playerID] = {
      up: false,
      down: false,
      left: false,
      right: false,
    }

    this.resetWolf()
  }

  removePlayer(playerID) {
    delete this.playersData[playerID]
    delete this.playersMoves[playerID]

    let wolf = this.getWolf()
    if (wolf && wolf.playerID === playerID) {
      this.resetWolf()
    }
  }

  updatePlayerButtonState(playerID, button, state) {
    this.playersMoves[playerID][button] = state
  }

  getWolf() {
    return this.wolf
  }

  setWolf(wolf) {
    this.wolf = wolf
  }

  resetWolf() {
    let wolf = this.getWolf()
    if (!wolf) {
      for (const [playerID, moves] of Object.entries(this.playersMoves)) {
        this.setWolf(playerID)
      }
    }
  }

  refreshData() {
    let currentWolf = this.getWolf()

    for (const [playerID, moves] of Object.entries(this.playersMoves)) {
      if (moves.top) {
        this.playersData[playerID].y += this.speed
        if (this.playersData[playerID].y > canvasWidth - this.ballRadius) {
          this.playersData[playerID].y = canvasWidth - this.ballRadius
        }
      }
      if (moves.right) {
        this.playersData[playerID].x += this.speed
        if (this.playersData[playerID].x > canvasWidth - this.ballRadius) {
          this.playersData[playerID].x = canvasWidth - this.ballRadius
        }
      }
      if (moves.down) {
        this.playersData[playerID].y -= this.speed
        if (this.playersData[playerID].y < this.ballRadius) {
          this.playersData[playerID].y = this.ballRadius
        }
      }
      if (moves.left) {
        this.playersData[playerID].x -= this.speed
        if (this.playersData[playerID].x < this.ballRadius) {
          this.playersData[playerID].x = this.ballRadius
        }
      }

      this.playersData[playerID].isWolf =
        currentWolf && currentWolf === playerID ? true : false
    }

    return this.playersData
  }
}

module.exports = Wolf_And_Sheep
