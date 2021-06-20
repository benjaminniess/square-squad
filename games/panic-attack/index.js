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

    Matter.Events.on(this.getEngine(), 'collisionStart', (event) => {
      if (event.pairs[0].bodyA.enableCustomCollisionManagement === true) {
        let targetObstacle = this.getObstaclesManager().getObstacleFromBodyID(
          event.pairs[0].bodyA.id
        )

        if (targetObstacle) {
          targetObstacle.onCollisionStart(
            event.pairs[0].bodyA,
            event.pairs[0].bodyB
          )
        }
      }

      if (event.pairs[0].bodyB.enableCustomCollisionManagement === true) {
        let targetObstacle = this.getObstaclesManager().getObstacleFromBodyID(
          event.pairs[0].bodyB.id
        )

        if (targetObstacle) {
          targetObstacle.onCollisionStart(
            event.pairs[0].bodyB,
            event.pairs[0].bodyA
          )
        }
      }

      let player
      let otherBody
      if (event.pairs[0].bodyA.gamePlayerID) {
        player = event.pairs[0].bodyA
        otherBody = event.pairs[0].bodyB
      } else if (event.pairs[0].bodyB.gamePlayerID) {
        player = event.pairs[0].bodyB
        otherBody = event.pairs[0].bodyA
      } else {
        return
      }

      if (otherBody.customType !== 'obstacle') {
        return
      }

      this.getPlayersManager().killPlayer(player.gamePlayerID)
      this.getRoom().refreshPlayers()
    })

    Matter.Events.on(this.getEngine(), 'collisionEnd', (event) => {
      if (event.pairs[0].bodyA.enableCustomCollisionManagement === true) {
        let targetObstacle = this.getObstaclesManager().getObstacleFromBodyID(
          event.pairs[0].bodyA.id
        )

        if (targetObstacle) {
          targetObstacle.onCollisionEnd(
            event.pairs[0].bodyA,
            event.pairs[0].bodyB
          )
        }
      }

      if (event.pairs[0].bodyB.enableCustomCollisionManagement === true) {
        let targetObstacle = this.getObstaclesManager().getObstacleFromBodyID(
          event.pairs[0].bodyB.id
        )

        if (targetObstacle) {
          targetObstacle.onCollisionEnd(
            event.pairs[0].bodyB,
            event.pairs[0].bodyA
          )
        }
      }
    })
  }

  refreshData() {
    //console.log(this.getDebugMatterTree())
    let obstacleManager = this.getObstaclesManager()
    let obstacles = obstacleManager.getObstacles()
    let bonusManager = this.getBonusManager()
    let bonusList = bonusManager.getActiveBonus()
    let playersManager = this.getPlayersManager()
    let playersData = playersManager.getPlayersData()

    let increasePoints = false

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

      _.forEach(playersManager.getPlayersMoves(), (moves, playerID) => {
        let playerData = playersData[playerID]

        bonusList.map((bonus) => {
          let bonusData = bonus.getData()
          if (
            playerData.x - squareSize / 2 < bonusData.x + bonusData.width &&
            playerData.x - squareSize / 2 + squareSize > bonusData.x &&
            playerData.y - squareSize / 2 < bonusData.y + bonusData.height &&
            squareSize + playerData.y - squareSize / 2 > bonusData.y
          ) {
            playersManager.uptadePlayerSingleData(playerID, 'bonus', bonusData)
            bonus.trigger(playerID).then(() => {
              playersManager.uptadePlayerSingleData(playerID, 'bonus', null)
            })
          } else {
            updatedBonus.push(bonusData)
          }
        })
      })

      playersManager.processPlayersRequests()
    }

    return {
      players: playersData,
      obstacles: obstacleManager.getObstaclesParts(),
      debugBodies: this.getDebugBodies(),
      bonusList: updatedBonus,
      score: increasePoints > 0 ? increasePoints - 1 : null
    }
  }
}

module.exports = Panick_Attack
