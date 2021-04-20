'use strict'

const Obstacle = require(__base + '/lib/obstacle')

class SimpleHole extends Obstacle {
  constructor(params) {
    super(params)

    this.init()
  }

  init() {
    let direction = helpers.getRandomInt(1, 5)
    let holeSize = helpers.getRandomInt(squareSize * 2, squareSize * 8)
    let obstacleWidth = helpers.getRandomInt(squareSize, squareSize * 4)
    let obstacleSpeed = (this.getLevel() / 5 + 2) * this.getSpeedMultiplicator()
    let obstacleSpot = helpers.getRandomInt(
      squareSize,
      canvasWidth - squareSize,
    )

    let obstacle = {}
    switch (direction) {
      case 1:
        obstacle = {
          x: canvasWidth,
          y: 0,
          width: obstacleWidth,
          height: obstacleSpot,
          direction: 'left',
          speed: obstacleSpeed,
        }

        this.obstacleParts.push(obstacle)

        obstacle = {
          x: canvasWidth,
          y: obstacleSpot + holeSize,
          width: obstacleWidth,
          height: canvasWidth,
          direction: 'left',
          speed: obstacleSpeed,
        }

        this.obstacleParts.push(obstacle)
        break
      case 2:
        obstacle = {
          x: -obstacleWidth,
          y: 0,
          width: obstacleWidth,
          height: obstacleSpot,
          direction: 'right',
          speed: obstacleSpeed,
        }

        this.obstacleParts.push(obstacle)

        obstacle = {
          x: -obstacleWidth,
          y: obstacleSpot + holeSize,
          width: obstacleWidth,
          height: canvasWidth,
          direction: 'right',
          speed: obstacleSpeed,
        }

        this.obstacleParts.push(obstacle)

        break
      case 3:
        obstacle = {
          x: 0,
          y: -obstacleWidth,
          width: obstacleSpot,
          height: obstacleWidth,
          direction: 'bottom',
          speed: obstacleSpeed,
        }

        this.obstacleParts.push(obstacle)

        obstacle = {
          x: obstacleSpot + holeSize,
          y: -obstacleWidth,
          width: canvasWidth,
          height: obstacleWidth,
          direction: 'bottom',
          speed: obstacleSpeed,
        }

        this.obstacleParts.push(obstacle)
        break
      case 4:
        obstacle = {
          x: 0,
          y: canvasWidth + obstacleWidth,
          width: obstacleSpot,
          height: obstacleWidth,
          direction: 'top',
          speed: obstacleSpeed,
        }

        this.obstacleParts.push(obstacle)

        obstacle = {
          x: obstacleSpot + holeSize,
          y: canvasWidth + obstacleWidth,
          width: canvasWidth,
          height: obstacleWidth,
          direction: 'top',
          speed: obstacleSpeed,
        }

        this.obstacleParts.push(obstacle)
        break
      case 6:
        obstacle = {
          x: canvasWidth,
          y: 0,
          width: obstacleWidth,
          height: obstacleSpot,
          direction: 'left',
          speed: obstacleSpeed,
        }

        this.obstacleParts.push(obstacle)

        obstacle = {
          x: canvasWidth,
          y: obstacleSpot + holeSize,
          width: obstacleWidth,
          height: canvasWidth,
          direction: 'left',
          speed: obstacleSpeed,
        }

        this.obstacleParts.push(obstacle)

        obstacle = {
          x: canvasWidth,
          y: 0,
          width: obstacleWidth,
          height: obstacleSpot,
          direction: 'right',
          speed: obstacleSpeed,
        }

        this.obstacleParts.push(obstacle)

        obstacle = {
          x: canvasWidth,
          y: obstacleSpot + holeSize,
          width: obstacleWidth,
          height: canvasWidth,
          direction: 'right',
          speed: obstacleSpeed,
        }

        this.obstacleParts.push(obstacle)
        break
    }
  }

  loop() {
    let updatedParts = []
    _.forEach(this.getParts(), (obstacle) => {
      switch (obstacle.direction) {
        case 'left':
          obstacle.x -= obstacle.speed
          if (obstacle.x > -obstacle.width) {
            updatedParts.push(obstacle)
          }
          break
        case 'right':
          obstacle.x += obstacle.speed
          if (obstacle.x < canvasWidth) {
            updatedParts.push(obstacle)
          }
          break
        case 'bottom':
          obstacle.y += obstacle.speed
          if (obstacle.y < canvasWidth) {
            updatedParts.push(obstacle)
          }
          break
        case 'top':
          obstacle.y -= obstacle.speed
          if (obstacle.y > -obstacle.height) {
            updatedParts.push(obstacle)
          }
          break
      }
    })

    this.obstacleParts = updatedParts
  }
}

module.exports = SimpleHole
