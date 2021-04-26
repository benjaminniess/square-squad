'use strict'

const MasterGame = require(__base + '/games/master-game')

class Panick_Attack extends MasterGame {
  constructor(room) {
    super(room)
    this.speed = 4
    this.slug = 'panic-attack'
    this.type = 'battle-royale'
    this.totalRounds = 3
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

    let playersData = this.getPlayersManager().getPlayersData()
    _.forEach(this.getPlayersManager().getPlayersMoves(), (moves, playerID) => {
      let playerData = playersData[playerID]
      if (playerData.alive) {
        if (moves.top) {
          playersData[playerID].y +=
            this.speed * playersData[playerID].speedMultiplicator
          if (playersData[playerID].y > canvasWidth - squareSize) {
            playersData[playerID].y = canvasWidth - squareSize
          }
        }
        if (moves.right) {
          playersData[playerID].x +=
            this.speed * playersData[playerID].speedMultiplicator
          if (playersData[playerID].x > canvasWidth - squareSize) {
            playersData[playerID].x = canvasWidth - squareSize
          }
        }
        if (moves.down) {
          playersData[playerID].y -=
            this.speed * playersData[playerID].speedMultiplicator
          if (playersData[playerID].y < 0) {
            playersData[playerID].y = 0
          }
        }
        if (moves.left) {
          playersData[playerID].x -=
            this.speed * playersData[playerID].speedMultiplicator
          if (playersData[playerID].x < 0) {
            playersData[playerID].x = 0
          }
        }

        _.forEach(this.playersMoves, (movesB, playerBID) => {
          let playerBdata = playersData[playerBID]
          if (
            playerID !== playerBID &&
            playerData.x < playerBdata.x + squareSize &&
            playerData.x + squareSize > playerBdata.x &&
            playerData.y < playerBdata.y + squareSize &&
            squareSize + playerData.y > playerBdata.y
          ) {
            if (moves.down && playerData.y < playerBdata.y + squareSize) {
              playersData[playerBID].y -=
                this.speed * playersData[playerID].speedMultiplicator
              if (playersData[playerBID].y < 0) {
                playersData[playerBID].y = 0
                playersData[playerID].y = squareSize
              }
            } else if (moves.top && playerData.y > playerBdata.y - squareSize) {
              playersData[playerBID].y +=
                this.speed * playersData[playerID].speedMultiplicator
              if (playersData[playerBID].y > canvasWidth - squareSize) {
                playersData[playerBID].y = canvasWidth - squareSize
                playersData[playerID].y = canvasWidth - squareSize - squareSize
              }
            }
            if (moves.left && playerData.x < playerBdata.x + squareSize) {
              playersData[playerBID].x -=
                this.speed * playersData[playerID].speedMultiplicator
              if (playersData[playerBID].x < 0) {
                playersData[playerBID].x = 0
                playersData[playerID].x = squareSize
              }
            } else if (
              moves.right &&
              playerData.x > playerBdata.x - squareSize
            ) {
              playersData[playerBID].x +=
                this.speed * playersData[playerID].speedMultiplicator
              if (playersData[playerBID].x > canvasWidth - squareSize) {
                playersData[playerBID].x = canvasWidth - squareSize
                playersData[playerID].x = canvasWidth - squareSize - squareSize
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
            this.getPlayersManager().killPlayer(playerID)
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

    this.getPlayersManager().setPlayersData(playersData)

    return {
      players: playersData,
      obstacles: updatedObstacles,
      bonusList: updatedBonus,
      score: increasePoints > 0 ? increasePoints - 1 : null,
    }
  }
}

module.exports = Panick_Attack
