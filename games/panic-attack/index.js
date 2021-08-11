'use strict'

const helpers = require('../../lib/helpers')
const { squareSize } = require('../../lib/config/main')
const Matter = require('matter-js')
const MasterGame = require('../master-game')
const _ = require('lodash')

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
      _.forEach(event.pairs, (collisionPair) => {
        if (collisionPair.bodyA.enableCustomCollisionManagement === true) {
          let targetObstacle = this.getObstaclesManager().getObstacleFromBodyID(
            collisionPair.bodyA.id
          )

          if (targetObstacle) {
            targetObstacle.onCollisionStart(
              collisionPair.bodyA,
              collisionPair.bodyB
            )
          }
        }

        if (collisionPair.bodyB.enableCustomCollisionManagement === true) {
          let targetObstacle = this.getObstaclesManager().getObstacleFromBodyID(
            collisionPair.bodyB.id
          )

          if (targetObstacle) {
            targetObstacle.onCollisionStart(
              collisionPair.bodyB,
              collisionPair.bodyA
            )
          }
        }

        let player
        let otherBody
        if (collisionPair.bodyA.gamePlayerID) {
          player = collisionPair.bodyA
          otherBody = collisionPair.bodyB
        } else if (collisionPair.bodyB.gamePlayerID) {
          player = collisionPair.bodyB
          otherBody = collisionPair.bodyA
        } else {
          return
        }

        if (otherBody.customType !== 'obstacle') {
          return
        }

        Matter.Composite.remove(
          this.getPlayersManager().getComposite(),
          player,
          true
        )

        this.getPlayersManager().killPlayer(player.gamePlayerID)
        this.getRoom().refreshPlayers()
      })

      Matter.Events.on(this.getEngine(), 'collisionEnd', (event) => {
        _.forEach(event.pairs, (collisionPair) => {
          if (collisionPair.bodyA.enableCustomCollisionManagement === true) {
            let targetObstacle = this.getObstaclesManager().getObstacleFromBodyID(
              collisionPair.bodyA.id
            )

            if (targetObstacle) {
              targetObstacle.onCollisionEnd(
                collisionPair.bodyA,
                collisionPair.bodyB
              )
            }
          }

          if (collisionPair.bodyB.enableCustomCollisionManagement === true) {
            let targetObstacle = this.getObstaclesManager().getObstacleFromBodyID(
              collisionPair.bodyB.id
            )

            if (targetObstacle) {
              targetObstacle.onCollisionEnd(
                collisionPair.bodyB,
                collisionPair.bodyA
              )
            }
          }
        })
      })
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
