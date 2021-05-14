'use strict'

const Obstacle = require(__base + '/lib/obstacle')
const Matter = require('matter-js')

class SpaceInvaders extends Obstacle {
  constructor(params) {
    super(params)

    this.init()
  }

  init() {
    let obstacleWidth = squareSize * 2
    let obstacleSpeed = this.getLevel() * this.getSpeedMultiplicator()
    let obstacle = {}
    let invaderRequiredWidth = obstacleWidth * 2.2
    let obstacleParts = []

    let rowCount = helpers.getRandomInt(1, 4)
    for (let o = 0; o < rowCount; o++) {
      let countInvaders = helpers.getRandomInt(3, 7)
      let spaceBetween =
        obstacleWidth +
        (canvasWidth - countInvaders * obstacleWidth) / (countInvaders - 1)
      for (let k = 0; k < countInvaders; k++) {
        obstacle = {
          x: k * spaceBetween + obstacleWidth / 2,
          y: -obstacleWidth - o * invaderRequiredWidth * 2 - obstacleWidth / 2,
          width: obstacleWidth,
          height: obstacleWidth,
          speed: obstacleSpeed,
          vector: { x: 0, y: obstacleSpeed / 5 },
        }

        obstacleParts.push(obstacle)
      }
    }

    _.forEach(obstacleParts, (obstaclePart) => {
      let body = Matter.Bodies.rectangle(
        obstaclePart.x,
        obstaclePart.y,
        obstaclePart.width,
        obstaclePart.height,
        {
          frictionAir: 0,
          collisionFilter: { group: 2 },
          isSensor: true,
        },
      )

      Matter.Body.setVelocity(body, obstaclePart.vector)

      Matter.Composite.add(this.getComposite(), body)
    })
  }

  loop() {
    _.forEach(this.getBodies(), (obstacle) => {
      if (obstacle.position.y > canvasWidth) {
        this.getEventEmmitter().emit('obstaclePartOver', obstacle)
      }
    })
  }
}

module.exports = SpaceInvaders
