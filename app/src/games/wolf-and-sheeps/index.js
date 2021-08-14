const { squareSize } = require('../../config/main')
const Matter = require('matter-js')
const MasterGame = require('../master-game')
const _ = require('lodash')

class Wolf_And_Sheep extends MasterGame {
  constructor(room) {
    super(room)
    this.speed = 4
    this.slug = 'wolf-and-sheeps'
    this.type = 'timed'
    this.wolf = null
    this.eventSubscriptions()
  }

  eventSubscriptions() {
    this.getEventEmmitter().on('initRound', () => {
      let playersData = this.getPlayersManager().getPlayersData()
      _.shuffle(_.keys(playersData))
      this.setWolf(Object.keys(playersData)[0])
    })

    Matter.Events.on(this.getEngine(), 'collisionStart', (event) => {
      if (
        !event.pairs[0].bodyA.gamePlayerID ||
        !event.pairs[0].bodyB.gamePlayerID
      ) {
        return
      }

      let currentWolf = this.getWolf()
      if (
        event.pairs[0].bodyA.gamePlayerID === currentWolf &&
        this.isCatchable(event.pairs[0].bodyB.gamePlayerID)
      ) {
        this.setCatchable(event.pairs[0].bodyA.gamePlayerID, false)
        this.setWolf(event.pairs[0].bodyB.gamePlayerID)
      } else if (
        event.pairs[0].bodyB.gamePlayerID === currentWolf &&
        this.isCatchable(event.pairs[0].bodyA.gamePlayerID)
      ) {
        this.setCatchable(event.pairs[0].bodyB.gamePlayerID, false)
        this.setWolf(event.pairs[0].bodyA.gamePlayerID)
      }

      //this.getPlayersManager().killPlayer(player.gamePlayerID)
      //this.getRoom().refreshPlayers()
    })
  }

  refreshData() {
    //console.log(this.getDebugMatterTree())

    let bonusManager = this.getBonusManager()
    let bonusList = bonusManager.getActiveBonus()
    let playersManager = this.getPlayersManager()
    let playersData = playersManager.getPlayersData()

    let updatedBonus = []

    if (this.getStatus() === 'playing') {
      if (bonusList.length < bonusManager.getFrequency()) {
        bonusManager.maybeInitBonus()
      }

      _.forEach(playersManager.getPlayersMoves(), (moves, playerID) => {
        let playerData = playersData[playerID]

        playersData[playerID].isWolf = playerID === this.getWolf()

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
      debugBodies: this.getDebugBodies(),
      bonusList: updatedBonus
    }
  }

  getWolf() {
    return this.wolf
  }

  setWolf(playerID) {
    this.wolf = playerID
  }

  setCatchable(playerID, catchable = true) {
    let playersManager = this.getPlayersManager()
    playersManager.uptadePlayerSingleData(playerID, 'catchable', catchable)
    if (!catchable) {
      let currentClass = this
      let notCatchableTimer = setInterval(function () {
        clearInterval(notCatchableTimer)
        playersManager.uptadePlayerSingleData(playerID, 'catchable', true)
      }, 1000)
    }
  }

  isCatchable(playerID) {
    return this.getPlayersManager().getPlayerData(playerID).catchable
  }
}

module.exports = Wolf_And_Sheep
