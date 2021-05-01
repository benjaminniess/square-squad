'use strict'

const Bonus = require(__base + '/lib/bonus')

class ScoreChanger extends Bonus {
  constructor(params) {
    super(params)
    this.imgX = 100
    this.imgY = 100
  }

  onTrigger() {
    let game = this.getGame()
    let playerID = this.getPlayerID()
    game.getPlayersManager().addPoints(playerID, 5)
  }
}

module.exports = ScoreChanger
