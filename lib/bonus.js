'use strict'

class Bonus {
  constructor(params) {
    this.game = params.game
    this.init()
    this.isTriggeredState = false
  }

  init() {
    this.x = helpers.getRandomInt(1, canvasWidth - bonusSize)
    this.y = helpers.getRandomInt(1, canvasWidth - bonusSize)
    this.width = bonusSize
    this.height = bonusSize
  }

  getGame() {
    return this.game
  }

  getDuration() {
    return 3000
  }

  isTriggered() {
    return this.isTriggeredState
  }

  getPlayerID() {
    return this.playerID
  }

  trigger(playerID) {
    this.playerID = playerID
    this.isTriggeredState = true
    return this.onTrigger()
  }

  getData() {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
      imgX: this.imgX,
      imgY: this.imgY,
    }
  }

  onTrigger() {}
}

module.exports = Bonus
