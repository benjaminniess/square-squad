'use strict'

const MasterGame = require(__base + '/games/master-game')

class Panick_Attack extends MasterGame {
  constructor(room) {
    super(room)
    this.speed = 2
    this.slug = 'panic-attack'
    this.type = 'battle-royale'
    this.eventSubscriptions()
  }

  eventSubscriptions() {
    this.getObstaclesManager()
      .getEventEmmitter()
      .on('obstacleOver', (data) => {
        this.getPlayersManager().addPlayersPoints()
        this.syncScores()
        this.getRoom().refreshPlayers()
      })
  }

  refreshData() {
    //console.log(this.getDebugMatterTree())
    let obstacleManager = this.getObstaclesManager()
    let obstacles = obstacleManager.getObstacles()

    let bonusManager = this.getBonusManager()
    let bonusList = bonusManager.getActiveBonus()

    let room = this.getRoom()

    let increasePoints = false

    let updatedObstacles = []
    let updatedBonus = []

    if (this.getStatus() === 'playing') {
      if (
        !process.env.DISABLE_OBSTACLES ||
        process.env.DISABLE_OBSTACLES !== 'true'
      ) {
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

        if (bonusList.length < bonusManager.getFrequency()) {
          bonusManager.maybeInitBonus()
        }
      }
    }

    let playersManager = this.getPlayersManager()
    let playersData = playersManager.getPlayersData()

    let playersMovesRequests = {}
    updatedObstacles = obstacleManager.getObstaclesParts()

    _.forEach(playersManager.getPlayersMoves(), (moves, playerID) => {
      let playerData = playersData[playerID]
      if (playerData.alive) {
        let playerMoveVector = { x: 0, y: 0 }
        if (moves.top) {
          playerMoveVector.y = 1
        }

        if (moves.right) {
          playerMoveVector.x = 1
        }
        if (moves.down) {
          playerMoveVector.y = -1
        }
        if (moves.left) {
          playerMoveVector.x = -1
        }

        if (playerMoveVector.x !== 0 && playerMoveVector.y !== 0) {
          playerMoveVector.x = playerMoveVector.x * 0.7
          playerMoveVector.y = playerMoveVector.y * 0.7
        }

        playersMovesRequests[playerID] = playerMoveVector

        updatedObstacles.map((obstacle) => {
          if (
            playerData.x < obstacle.x + obstacle.width &&
            playerData.x + squareSize > obstacle.x &&
            playerData.y < obstacle.y + obstacle.height &&
            squareSize + playerData.y > obstacle.y
          ) {
            playersManager.killPlayer(playerID)
            room.refreshPlayers()
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

    playersManager.processPlayersRequests(playersMovesRequests)

    return {
      players: playersData,
      obstacles: updatedObstacles,
      bonusList: updatedBonus,
      score: increasePoints > 0 ? increasePoints - 1 : null,
    }
  }
}

module.exports = Panick_Attack
