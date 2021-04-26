'use strict'

const Bonus = require(__base + '/lib/bonus')

class Speed extends Bonus {
  constructor(params) {
    super(params)
    this.imgX = 0
    this.imgY = 0
  }

  onTrigger() {
    let game = this.getGame()
    let playerID = this.getPlayerID()
    let playerData = game.getPlayersManager().getPlayerData(playerID)
    playerData.speedMultiplicator *= 1.5
    game.getPlayersManager().setPlayerData(playerID, playerData)
    let bonusTimer = setInterval(function () {
      clearInterval(bonusTimer)
      playerData.speedMultiplicator = 1
      game.getPlayersManager().setPlayerData(playerID, playerData)
    }, this.getDuration())
  }
}

module.exports = Speed
