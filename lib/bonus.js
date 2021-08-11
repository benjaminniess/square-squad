'use strict'

const { canvasWidth, bonusSize } = require('../lib/config/main')
const { EventEmitter } = require('events')

class Bonus {
  constructor(params) {
    this.game = params.game
    this.init()
    this.isTriggeredState = false
  }

  init() {
    this.x = helpers.getRandomInt(1, canvasWidth - bonusSize)
    this.y = helpers.getRandomInt(1, canvasWidth - bonusSize)
    this.eventEmitter = new EventEmitter()
    this.width = bonusSize
    this.height = bonusSize
  }

  getGame() {
    return this.game
  }

  getDuration() {
    return 3000
  }

  getEventEmmitter() {
    return this.eventEmitter
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
    let playersManager = this.getGame().getPlayersManager()

    if (this.getDuration() > 1000) {
      setTimeout(function () {
        playersManager.uptadePlayerSingleData(playerID, 'bonusBlinking', true)
      }, this.getDuration() - 1000)
    }
    return this.onTrigger()
  }

  getData() {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
      imgX: this.imgX,
      imgY: this.imgY
    }
  }

  onTrigger() {}
}

module.exports = Bonus
