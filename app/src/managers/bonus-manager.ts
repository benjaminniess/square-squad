import {Container} from "typedi";
import {RandomContentGenerator} from "../services/RandomContentGenerator";

export {}
const Speed = require('../entities/bonus/speed')
const ScoreChanger = require('../entities/bonus/score-changer')
const Invincible = require('../entities/bonus/invincible')
const _ = require('lodash')

class BonusManager {
  private readonly randomContentGenerator: RandomContentGenerator

  private bonusList: any[]
  private game: any
  private frequency: number
  private lastBonusTime: any

  constructor(game: any) {
    this.bonusList = []
    this.game = game
    this.frequency = 5
    this.lastBonusTime = null
    this.randomContentGenerator = Container.get(RandomContentGenerator)

  }

  getBonus() {
    return this.bonusList
  }

  getGame() {
    return this.game
  }

  getFrequency() {
    return this.frequency
  }

  resetBonus() {
    this.bonusList = []
  }

  setFrequency(frequency: number) {
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

    if (this.randomContentGenerator.getRandomInt(1, 2500 / this.getFrequency()) === 1) {
      this.initBonus()
      this.lastBonusTime = process.hrtime()[0]
    }
  }

  initBonus(params: any = {}) {
    let bonusID = this.randomContentGenerator.getRandomInt(1, 4)

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
    let activeBonus: any[] = []

    _.forEach(this.getBonus(), (bonus: any, bonusKey: string) => {
      if (!bonus.isTriggered()) {
        activeBonus.push(bonus)
      }
    })

    return activeBonus
  }
}

module.exports = BonusManager
