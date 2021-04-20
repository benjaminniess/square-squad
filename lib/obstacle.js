'use strict'

class Obstacle {
  constructor(params) {
    this.level = params.level ? params.level : 1
    this.speedMultiplicator = params.speedMultiplicator
      ? params.speedMultiplicator
      : 1

    this.obstacleParts = []
  }

  getParts() {
    return this.obstacleParts
  }

  getLevel() {
    return this.level
  }

  getSpeedMultiplicator() {
    return this.speedMultiplicator
  }

  isOver() {
    return _.size(this.getParts()) === 0
  }

  loop() {}
}

module.exports = Obstacle
