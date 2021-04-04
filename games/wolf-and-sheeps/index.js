class Wolf_And_Sheep {
  constructor(slug, name) {
    this.speed = 6
    this.ballRadius = 10
    this.playersData = {}
    this.playersMoves = {}
  }

  initPlayer(playerSession) {
    this.playersData[playerSession.socketID] = {
      x: 100,
      y: 200,
      isWolf: false,
      name: playerSession.nickName,
    }

    this.playersMoves[playerSession.socketID] = {
      up: false,
      down: false,
      left: false,
      right: false,
    }
  }

  removePlayer(socketId) {
    delete this.playersData[socketId]
    delete this.playersMoves[socketId]
  }

  updatePlayerButtonState(socketID, button, state) {
    this.playersMoves[socketID][button] = state
  }

  refreshData() {
    for (const [socketID, moves] of Object.entries(this.playersMoves)) {
      if (moves.top) {
        this.playersData[socketID].y += this.speed
        if (this.playersData[socketID].y > canvasWidth - this.ballRadius) {
          this.playersData[socketID].y = canvasWidth - this.ballRadius
        }
      }
      if (moves.right) {
        this.playersData[socketID].x += this.speed
        if (this.playersData[socketID].x > canvasWidth - this.ballRadius) {
          this.playersData[socketID].x = canvasWidth - this.ballRadius
        }
      }
      if (moves.down) {
        this.playersData[socketID].y -= this.speed
        if (this.playersData[socketID].y < this.ballRadius) {
          this.playersData[socketID].y = this.ballRadius
        }
      }
      if (moves.left) {
        this.playersData[socketID].x -= this.speed
        if (this.playersData[socketID].x < this.ballRadius) {
          this.playersData[socketID].x = this.ballRadius
        }
      }
    }

    return this.playersData
  }
}

module.exports = Wolf_And_Sheep
