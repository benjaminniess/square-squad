'use strict'

const Obstacle = require(__base + '/lib/obstacle')

class SpaceInvaders extends Obstacle {
  constructor(params) {
    super(params)

    this.init()
  }

  init() {
    let obstacleWidth = squareSize * 2
    let obstacleSpeed = (this.getLevel() / 5 + 2) * this.getSpeedMultiplicator()
    let obstacle = {}
    let invaderRequiredWidth = obstacleWidth * 2.2

    let rowCount = helpers.getRandomInt(1, 4)
    for (let o = 0; o < rowCount; o++) {
      let countInvaders = helpers.getRandomInt(3, 7)
      let spaceBetween =
        obstacleWidth +
        (canvasWidth - countInvaders * obstacleWidth) / (countInvaders - 1)
      for (let k = 0; k < countInvaders; k++) {
        obstacle = {
          x: k * spaceBetween,
          y: -obstacleWidth - o * invaderRequiredWidth * 2,
          width: obstacleWidth,
          height: obstacleWidth,
          speed: obstacleSpeed,
        }

        this.obstacleParts.push(obstacle)
      }
    }
  }

  loop() {
    let updatedParts = []
    _.forEach(this.getParts(), (obstacle) => {
      obstacle.y += obstacle.speed / 5
      if (obstacle.y < canvasWidth) {
        updatedParts.push(obstacle)
      }
    })

    this.obstacleParts = updatedParts
  }
}

module.exports = SpaceInvaders
