'use strict'

class Obstacle {
  constructor(params) {
    this.level = params.level ? params.level : 1
    this.obstacleParts = []
  }

  getParts() {
    return this.obstacleParts
  }

  getLevel() {
    return this.level
  }

  isOver() {
    return _.size(this.getParts()) === 0
  }

  loop() {}
}

module.exports = Obstacle
