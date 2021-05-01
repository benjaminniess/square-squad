'use strict'

const Speed = require('./bonus/speed')
const ScoreChanger = require('./bonus/score-changer')

class BonusManager {
  constructor(game) {
    this.bonusList = []
    this.game = game
  }

  getBonus() {
    return this.bonusList
  }

  getGame() {
    return this.game
  }

  resetBonus() {
    this.bonusList = []
  }

  maybeInitBonus() {
    if (helpers.getRandomInt(1, 500) === 1) {
      this.initBonus()
    }
  }

  initBonus(params = {}) {
    let bonusID = helpers.getRandomInt(1, 3)

    params.game = this.getGame()

    switch (bonusID) {
      case 1:
        this.bonusList.push(new Speed(params))
      case 2:
        this.bonusList.push(new ScoreChanger(params))
        break
      default:
        break
    }
  }

  getActiveBonus() {
    let activeBonus = []

    _.forEach(this.getBonus(), (bonus, bonusKey) => {
      if (!bonus.isTriggered()) {
        activeBonus.push(bonus)
      }
    })

    return activeBonus
  }
}

module.exports = BonusManager
