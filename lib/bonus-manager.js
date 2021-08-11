'use strict'

const helpers = require('../lib/helpers')
const Speed = require('./bonus/speed')
const ScoreChanger = require('./bonus/score-changer')
const Invincible = require('./bonus/invincible')
const _ = require('lodash')

class BonusManager {
  constructor(game) {
    this.bonusList = []
    this.game = game
    this.frequency = 5
    this.lastBonusTime = null
  }

  getBonus() {
    return this.bonusList
  }

  getGame() {
    return this.game
  }

  getFrequency() {
    return parseInt(this.frequency)
  }

  resetBonus() {
    this.bonusList = []
  }

  setFrequency(frequency) {
    this.frequency = frequency
  }

  maybeInitBonus() {
    // Avoid 2 bonus at the same second
    if (this.lastBonusTime && this.lastBonusTime > process.hrtime()[0] - 2) {
      return
    }

    if (this.getFrequency() === 0) {
      return
    }

    if (helpers.getRandomInt(1, 2500 / this.getFrequency()) === 1) {
      this.initBonus()
      this.lastBonusTime = process.hrtime()[0]
    }
  }

  initBonus(params = {}) {
    let bonusID = helpers.getRandomInt(1, 4)

    params.game = this.getGame()

    switch (bonusID) {
      case 1:
        this.bonusList.push(new Speed(params))
        break
      case 2:
        this.bonusList.push(new ScoreChanger(params))
        break
      case 3:
        this.bonusList.push(new Invincible(params))
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
