'use strict'

const Obstacle = require(__base + '/lib/obstacle')
const Matter = require('matter-js')

class Ball extends Obstacle {
  constructor(params) {
    params.slug = 'ball'
    super(params)

    this.init()
  }

  init() {
    let speedReducer = 0.3
    let startPosition = this.getParams().count ? this.getParams().count : 1
    let obstacleSpeed =
      this.getLevel() * this.getSpeedMultiplicator() * speedReducer
    let radius = 20
    let angle = ((10 - helpers.getRandomInt(1, 21)) / 10) * obstacleSpeed
    let obstacle = {}

    switch (startPosition) {
      // Bottom
      case 1:
        obstacle = {
          x: canvasWidth / 2 + radius / 2,
          y: canvasWidth + radius / 2 - radius - 1,
          vector: {
            x: angle,
            y: -obstacleSpeed,
          },
        }
        break
      // Top
      case 2:
        obstacle = {
          x: canvasWidth / 2 + radius / 2,
          y: -radius / 2 + radius + 1,
          vector: {
            x: angle,
            y: obstacleSpeed,
          },
        }
        break
      // Right
      case 3:
        obstacle = {
          x: canvasWidth + radius / 2 - radius - 1,
          y: canvasWidth / 2 + radius / 2,
          vector: {
            x: -obstacleSpeed,
            y: angle,
          },
        }
        break
      case 4:
        obstacle = {
          x: -radius / 2 + radius + 1,
          y: canvasWidth / 2 + radius / 2,
          vector: {
            x: obstacleSpeed,
            y: angle,
          },
        }
        break
    }

    obstacle.radius = radius
    obstacle.speed = obstacleSpeed

    let body = Matter.Bodies.circle(obstacle.x, obstacle.y, obstacle.radius, {
      frictionAir: 0,
      frictionStatic: 0,
      friction: 0,
      restitution: 1,
    })

    Matter.Body.setVelocity(body, obstacle.vector)
    Matter.Body.set(body, {
      enableCustomCollisionManagement: true,
      countCollisions: 0,
      customType: 'obstacle',
      customSubType: this.getSlug(),
    })

    Matter.Composite.add(this.getComposite(), body)
  }

  onCollisionStart(obstaclePart, bodyB) {
    if (
      bodyB.customType &&
      bodyB.customType === 'obstacle' &&
      bodyB.customSubType &&
      bodyB.customSubType === 'ball'
    ) {
      this.getEventEmmitter().emit('obstaclePartOver', obstaclePart)
      return
    }

    if (bodyB.customType && bodyB.customType === 'player') {
      this.getEventEmmitter().emit('obstaclePartOver', obstaclePart)
      return
    }

    obstaclePart.countCollisions++
    if (obstaclePart.countCollisions > 1) {
      this.getEventEmmitter().emit('obstaclePartOver', obstaclePart)
    }
  }
}

module.exports = Ball
