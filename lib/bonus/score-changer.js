'use strict'

const appRoot = require('app-root-path')
const Bonus = require(appRoot + '/lib/bonus')

class ScoreChanger extends Bonus {
  constructor(params) {
    super(params)
    this.imgX = 100
    this.imgY = 100
  }

  onTrigger() {
    return new Promise((resolve, reject) => {
      let game = this.getGame()
      let playerID = this.getPlayerID()
      game.getPlayersManager().addPoints(playerID, 5)
      game.syncScores()
      game.getRoom().refreshPlayers()

      resolve()
    })
  }
}

module.exports = ScoreChanger
