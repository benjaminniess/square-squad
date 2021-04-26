'use strict'

const Matter = require('matter-js')

const Composite = Matter.Composite

class PlayersManager {
  constructor(compositeObj) {
    this.compositeObj = compositeObj
    this.playersData = {}
    this.playersMoves = {}
  }

  getComposite() {
    return this.compositeObj
  }

  initPlayer(playerSession) {
    this.playersData[playerSession.id] = {
      x: -100,
      y: canvasWidth / 2,
      nickname: playerSession.nickname,
      alive: true,
      speedMultiplicator: 1,
      score: 0,
      color: playerSession.color,
    }
  }
}

module.exports = PlayersManager
