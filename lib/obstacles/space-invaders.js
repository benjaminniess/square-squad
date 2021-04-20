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
    let obstacleRows = [1, 3, 4, 5, 3, 1]
    let obstacle = {}

    _.forEach(obstacleRows, (countInvaders, rowCount) => {
      let i = 0
      let invaderRequiredWidth = obstacleWidth * 2.2
      for (let y = 0; y < countInvaders; y++) {
        obstacle = {
          x:
            obstacleWidth / 2 +
            canvasWidth / 2 +
            y * invaderRequiredWidth -
            (invaderRequiredWidth * countInvaders) / 2,
          y: -obstacleWidth - rowCount * invaderRequiredWidth * 2,
          width: obstacleWidth,
          height: obstacleWidth,
          speed: obstacleSpeed,
        }

        this.obstacleParts.push(obstacle)
      }
    })
  }

  loop() {
    let updatedParts = []
    _.forEach(this.getParts(), (obstacle) => {
      obstacle.y += obstacle.speed
      if (obstacle.y < canvasWidth) {
        updatedParts.push(obstacle)
      }
    })

    this.obstacleParts = updatedParts
  }
}

module.exports = SpaceInvaders
