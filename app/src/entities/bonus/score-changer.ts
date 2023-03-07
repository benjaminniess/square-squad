import {Container} from "typedi";
import {RandomContentGenerator} from "../../services/RandomContentGenerator";

export {}
const Bonus = require('../../entities/bonus')

/**
 * Affect the global score of the player from -10 to +10
 */
class ScoreChanger extends Bonus {
  private readonly randomContentGenerator: RandomContentGenerator

  constructor(params: any) {
    super(params)
    this.initChangerType()
    this.randomContentGenerator = Container.get(RandomContentGenerator)
  }

  initChangerType() {
    const randomType = this.getTypes()[
      this.getTypeFromNumber(this.getRandomInt())
      ]

    this.imgX = randomType.imgX
    this.imgY = randomType.imgY
    this.scoreChange = randomType.scoreChange
  }

  getRandomInt() {
    return this.randomContentGenerator.getRandomInt(1, 50)
  }

  /**
   * Get the list of available score change types from m10 (-10) to p10 (+10)
   *
   * @returns
   */
  getTypes() {
    return {
      p3: {
        imgX: 300,
        imgY: 100,
        scoreChange: 3
      },
      p5: {
        imgX: 100,
        imgY: 100,
        scoreChange: 5
      },
      p10: {
        imgX: 200,
        imgY: 300,
        scoreChange: 10
      },
      m3: {
        imgX: 200,
        imgY: 100,
        scoreChange: -3
      },
      m5: {
        imgX: 0,
        imgY: 300,
        scoreChange: -5
      },
      m10: {
        imgX: 0,
        imgY: 200,
        scoreChange: -10
      }
    }
  }

  /**
   * Returns a type key (p3 for +3, m5 for -5 etc ) from a number that goes from 1 to 50
   *
   * @param {int} result
   * @returns {string} the key of the result
   */
  getTypeFromNumber(result: number) {
    if (result <= 10) {
      return 'p3'
    }

    if (result <= 20) {
      return 'm3'
    }

    if (result <= 30) {
      return 'p5'
    }

    if (result <= 40) {
      return 'm5'
    }

    if (result <= 45) {
      return 'p10'
    }

    return 'm10'
  }

  getExtraData() {
    return {
      scoreChange: this.scoreChange
    }
  }

  onTrigger() {
    return new Promise((resolve, reject) => {
      let game = this.getGame()
      let playerID = this.getPlayerID()
      game
        .getPlayersManager()
        .addPoints(playerID, this.getExtraData().scoreChange)
      game.syncScores()
      game.getRoom().refreshPlayers()

      resolve(true)
    })
  }
}

module.exports = ScoreChanger
