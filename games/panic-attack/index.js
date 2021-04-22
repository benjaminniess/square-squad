'use strict'

const BonusManager = require(__base + '/lib/bonus-manager')

const ObstaclesManager = require(__base + '/lib/obstacles-manager')

const MasterGame = require(__base + '/games/master-game')

class Panick_Attack extends MasterGame {
  constructor(room) {
    super(room)
    this.speed = 4
    this.slug = 'panic-attack'
    this.obstacles = []
    this.score = null
    this.type = 'battle-royale'
    this.totalRounds = 3
  }

  initGame() {
    this.obstaclesManager = new ObstaclesManager()
    this.bonusManager = new BonusManager(this)
    this.roundNumber = 0
    this.initRound()
    this.resetRanking()
    this.setStatus('starting')
  }

  initRound() {
    this.roundNumber++
    this.score = 0
    this.lastRoundRanking = []
    this.getObstaclesManager().resetObstacles()
    this.getBonusManager().resetBonus()
  }

  renewPlayers() {
    _.forEach(this.playersData, (moves, playerID) => {
      this.playersData[playerID].alive = true
      this.resetTouches(playerID)
    })
  }

  getPlayersData() {
    return this.playersData
  }

  getObstaclesManager() {
    return this.obstaclesManager
  }

  getBonusManager() {
    return this.bonusManager
  }

  killPlayer(playerID) {
    this.playersData[playerID].alive = false
    this.playersData[playerID].score = this.getScore() - 1
    this.addRoundScore({
      playerID: playerID,
      score: this.playersData[playerID].score,
      nickname: this.playersData[playerID].nickname,
    })
  }

  getRoundNumber() {
    return this.roundNumber
  }

  getTotalRounds() {
    return this.totalRounds
  }

  getScore() {
    return this.score
  }

  increaseScore() {
    this.score++
  }

  refreshData() {
    let obstacleManager = this.getObstaclesManager()
    let obstacles = obstacleManager.getObstacles()

    let bonusManager = this.getBonusManager()
    let bonusList = bonusManager.getActiveBonus()

    let increasePoints = false

    let updatedObstacles = []
    let updatedBonus = []

    if (this.getStatus() === 'playing') {
      if (obstacles.length === 0) {
        obstacleManager.initObstacle()
        if (this.getScore() > 2 && helpers.getRandomInt(1, 3) === 2) {
          obstacleManager.initObstacle({ speedMultiplicator: 0.5 })
        }
        this.increaseScore()
        increasePoints = this.getScore()
        this.obstaclesManager.setLevel(increasePoints)
        this.getRoom().refreshPlayers()
      } else {
        obstacleManager.updateObstacles()
      }

      if (bonusList.length === 0) {
        bonusManager.maybeInitBonus()
      }
    }

    _.forEach(this.playersMoves, (moves, playerID) => {
      let playerData = this.playersData[playerID]
      if (playerData.alive) {
        if (moves.top) {
          this.playersData[playerID].y +=
            this.speed * this.playersData[playerID].speedMultiplicator
          if (this.playersData[playerID].y > canvasWidth - squareSize) {
            this.playersData[playerID].y = canvasWidth - squareSize
          }
        }
        if (moves.right) {
          this.playersData[playerID].x +=
            this.speed * this.playersData[playerID].speedMultiplicator
          if (this.playersData[playerID].x > canvasWidth - squareSize) {
            this.playersData[playerID].x = canvasWidth - squareSize
          }
        }
        if (moves.down) {
          this.playersData[playerID].y -=
            this.speed * this.playersData[playerID].speedMultiplicator
          if (this.playersData[playerID].y < 0) {
            this.playersData[playerID].y = 0
          }
        }
        if (moves.left) {
          this.playersData[playerID].x -=
            this.speed * this.playersData[playerID].speedMultiplicator
          if (this.playersData[playerID].x < 0) {
            this.playersData[playerID].x = 0
          }
        }

        _.forEach(this.playersMoves, (movesB, playerBID) => {
          let playerBdata = this.playersData[playerBID]
          if (
            playerID !== playerBID &&
            playerData.x < playerBdata.x + squareSize &&
            playerData.x + squareSize > playerBdata.x &&
            playerData.y < playerBdata.y + squareSize &&
            squareSize + playerData.y > playerBdata.y
          ) {
            if (moves.down && playerData.y < playerBdata.y + squareSize) {
              this.playersData[playerBID].y -=
                this.speed * this.playersData[playerID].speedMultiplicator
              if (this.playersData[playerBID].y < 0) {
                this.playersData[playerBID].y = 0
                this.playersData[playerID].y = squareSize
              }
            } else if (moves.top && playerData.y > playerBdata.y - squareSize) {
              this.playersData[playerBID].y +=
                this.speed * this.playersData[playerID].speedMultiplicator
              if (this.playersData[playerBID].y > canvasWidth - squareSize) {
                this.playersData[playerBID].y = canvasWidth - squareSize
                this.playersData[playerID].y =
                  canvasWidth - squareSize - squareSize
              }
            }
            if (moves.left && playerData.x < playerBdata.x + squareSize) {
              this.playersData[playerBID].x -=
                this.speed * this.playersData[playerID].speedMultiplicator
              if (this.playersData[playerBID].x < 0) {
                this.playersData[playerBID].x = 0
                this.playersData[playerID].x = squareSize
              }
            } else if (
              moves.right &&
              playerData.x > playerBdata.x - squareSize
            ) {
              this.playersData[playerBID].x +=
                this.speed * this.playersData[playerID].speedMultiplicator
              if (this.playersData[playerBID].x > canvasWidth - squareSize) {
                this.playersData[playerBID].x = canvasWidth - squareSize
                this.playersData[playerID].x =
                  canvasWidth - squareSize - squareSize
              }
            }
          }
        })

        updatedObstacles = obstacleManager.getObstaclesParts()

        updatedObstacles.map((obstacle) => {
          if (
            playerData.x < obstacle.x + obstacle.width &&
            playerData.x + squareSize > obstacle.x &&
            playerData.y < obstacle.y + obstacle.height &&
            squareSize + playerData.y > obstacle.y
          ) {
            this.killPlayer(playerID)
            this.getRoom().refreshPlayers()
          }
        })

        bonusList.map((bonus) => {
          let bonusData = bonus.getData()
          if (
            playerData.x < bonusData.x + bonusData.width &&
            playerData.x + squareSize > bonusData.x &&
            playerData.y < bonusData.y + bonusData.height &&
            squareSize + playerData.y > bonusData.y
          ) {
            bonus.trigger(playerID)
          } else {
            updatedBonus.push(bonusData)
          }
        })
      }
    })

    return {
      players: this.playersData,
      obstacles: updatedObstacles,
      bonusList: updatedBonus,
      score: increasePoints > 0 ? increasePoints - 1 : null,
    }
  }
}

module.exports = Panick_Attack
