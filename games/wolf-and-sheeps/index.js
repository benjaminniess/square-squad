'use strict'

const MasterGame = require(__base + '/games/master-game')

class Wolf_And_Sheep extends MasterGame {
  constructor() {
    this.slug = 'wolf-and-sheep'
    this.wolf = null
  }

  initPlayer(playerSession) {
    this.playersData[playerSession.playerID] = {
      x: helpers.getRandomInt(50, 600),
      y: 200,
      name: playerSession.nickName,
      isColliding: false,
      isCatchable: true,
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

    firstfor: for (const [playerIDA, playerPosA] of Object.entries(
      this.playersData,
    )) {
      for (const [playerIDB, playerPosB] of Object.entries(this.playersData)) {
        if (
          playerIDA !== playerIDB &&
          playerPosA.x < playerPosB.x + squareSize &&
          playerPosA.x + squareSize > playerPosB.x &&
          playerPosA.y < playerPosB.y + squareSize &&
          squareSize + playerPosA.y > playerPosB.y
        ) {
          if (!playerPosA.isColliding && !playerPosB.isColliding) {
            if (currentWolf === playerIDA && this.isCatchable(playerIDB)) {
              this.setWolf(playerIDB)
              this.setCatchable(playerIDA, false)
              playerPosA.isColliding = true
              playerPosB.isColliding = true
              break firstfor
            } else if (
              currentWolf === playerIDB &&
              this.isCatchable(playerIDA)
            ) {
              this.setWolf(playerIDA)
              playerPosA.isColliding = true
              playerPosB.isColliding = true
              break firstfor
            }
          }
        } else {
          playerPosA.isColliding = false
          playerPosB.isColliding = false
        }
      }
    }
    for (const [playerID, moves] of Object.entries(this.playersMoves)) {
      if (moves.top) {
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
      if (moves.down) {
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

      this.playersData[playerID].isWolf =
        currentWolf && currentWolf === playerID ? true : false
    }

    return this.playersData
  }

  setCatchable(playerID, catchable = true) {
    this.playersData[playerID].isCatchable = catchable
    if (!catchable) {
      let currentClass = this
      let notCatchableTimer = setInterval(function () {
        clearInterval(notCatchableTimer)
        currentClass.setCatchable(playerID, true)
      }, 1000)
    }
  }

  isCatchable(playerID) {
    return this.playersData[playerID].isCatchable
  }
}

module.exports = Wolf_And_Sheep
