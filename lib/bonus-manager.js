'use strict'

const Speed = require('./bonus/speed')

class BonusManager {
  constructor() {
    this.bonusList = []
  }

  getBonus() {
    return this.bonusList
  }

  initBonus(params = {}) {
    let bonusID = helpers.getRandomInt(1, 2)

    switch (bonusID) {
      case 1:
        this.bonusList.push(new Speed(params))
        break
      default:
        break
    }
  }

  updateBonus() {
    let updatedBonus = []

    _.forEach(this.getBonus(), (bonus, bonusKey) => {
      updatedBonus.push(bonus.getData())
    })

    console.log(updatedBonus)
    return updatedBonus
  }
}

module.exports = BonusManager
