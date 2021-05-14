'use strict'

const Obstacle = require(__base + '/lib/obstacle')
const Matter = require('matter-js')

class Press extends Obstacle {
  constructor(params) {
    super(params)

    this.init()
  }
  init() {
    let direction = helpers.getRandomInt(1, 5)
    let obstacleWidth = helpers.getRandomInt(squareSize, squareSize * 4)
    let obstacleSpeed = this.getLevel() * this.getSpeedMultiplicator()
    let obstacleParts = []

    let obstacle = {}
    switch (direction) {
      case 1:
        obstacle = {
          x: canvasWidth + obstacleWidth / 2,
          y: -canvasWidth / 2,
          width: obstacleWidth,
          height: canvasWidth,
          direction: 'left',
          currentPosition: 'top',
          ahead: true,
          speed: obstacleSpeed,
          vector: { x: -obstacleSpeed, y: obstacleSpeed },
        }

        obstacleParts.push(obstacle)

        obstacle = {
          x: canvasWidth + obstacleWidth / 2,
          y: canvasWidth + canvasWidth / 2,
          width: obstacleWidth,
          height: canvasWidth,
          direction: 'left',
          currentPosition: 'bottom',
          ahead: true,
          speed: obstacleSpeed,
          vector: { x: -obstacleSpeed, y: -obstacleSpeed },
        }

        obstacleParts.push(obstacle)
        break
      case 2:
        obstacle = {
          x: -obstacleWidth / 2,
          y: -canvasWidth / 2,
          width: obstacleWidth,
          height: canvasWidth,
          direction: 'right',
          currentPosition: 'top',
          ahead: true,
          speed: obstacleSpeed,
          vector: { x: obstacleSpeed, y: obstacleSpeed },
        }

        obstacleParts.push(obstacle)

        obstacle = {
          x: -obstacleWidth / 2,
          y: canvasWidth + canvasWidth / 2,
          width: obstacleWidth,
          height: canvasWidth,
          direction: 'right',
          currentPosition: 'bottom',
          ahead: true,
          speed: obstacleSpeed,
          vector: { x: obstacleSpeed, y: -obstacleSpeed },
        }

        obstacleParts.push(obstacle)
        break
      case 3:
        obstacle = {
          x: -canvasWidth / 2,
          y: -obstacleWidth / 2,
          width: canvasWidth,
          height: obstacleWidth,
          direction: 'bottom',
          currentPosition: 'left',
          ahead: true,
          speed: obstacleSpeed,
          vector: { x: obstacleSpeed, y: obstacleSpeed },
        }

        obstacleParts.push(obstacle)

        obstacle = {
          x: canvasWidth + canvasWidth / 2,
          y: -obstacleWidth / 2,
          width: canvasWidth,
          height: obstacleWidth,
          direction: 'bottom',
          currentPosition: 'right',
          ahead: true,
          speed: obstacleSpeed,
          vector: { x: -obstacleSpeed, y: obstacleSpeed },
        }

        obstacleParts.push(obstacle)
        break
      case 4:
        obstacle = {
          x: -canvasWidth / 2,
          y: canvasWidth + obstacleWidth / 2,
          width: canvasWidth,
          height: obstacleWidth,
          direction: 'top',
          currentPosition: 'left',
          ahead: true,
          speed: obstacleSpeed,
          vector: { x: obstacleSpeed, y: -obstacleSpeed },
        }

        obstacleParts.push(obstacle)

        obstacle = {
          x: canvasWidth + canvasWidth / 2,
          y: canvasWidth + obstacleWidth / 2,
          width: canvasWidth,
          height: obstacleWidth,
          direction: 'top',
          currentPosition: 'right',
          ahead: true,
          speed: obstacleSpeed,
          vector: { x: -obstacleSpeed, y: -obstacleSpeed },
        }

        obstacleParts.push(obstacle)
        break
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
          direction: obstaclePart.direction,
          currentPosition: obstaclePart.currentPosition,
          ahead: obstaclePart.ahead,
        },
      )

      Matter.Body.setVelocity(body, obstaclePart.vector)

      Matter.Composite.add(this.getComposite(), body)
    })
  }

  loop() {
    _.forEach(this.getBodies(), (obstacle) => {
      if (
        (obstacle.currentPosition === 'top' &&
          obstacle.ahead &&
          obstacle.position.y > 0) ||
        (obstacle.currentPosition === 'top' &&
          !obstacle.ahead &&
          obstacle.position.y < -canvasWidth / 2) ||
        (obstacle.currentPosition === 'bottom' &&
          obstacle.ahead &&
          obstacle.position.y < canvasWidth) ||
        (obstacle.currentPosition === 'bottom' &&
          !obstacle.ahead &&
          obstacle.position.y > canvasWidth + canvasWidth / 2)
      ) {
        Matter.Body.set(obstacle, 'ahead', !obstacle.ahead)
        Matter.Body.setVelocity(obstacle, {
          x: obstacle.velocity.x,
          y: -obstacle.velocity.y,
        })
      }

      if (
        (obstacle.currentPosition === 'left' &&
          obstacle.ahead &&
          obstacle.position.x > 0) ||
        (obstacle.currentPosition === 'left' &&
          !obstacle.ahead &&
          obstacle.position.x < -canvasWidth / 2) ||
        (obstacle.currentPosition === 'right' &&
          obstacle.ahead &&
          obstacle.position.x < canvasWidth) ||
        (obstacle.currentPosition === 'right' &&
          !obstacle.ahead &&
          obstacle.position.x > canvasWidth + canvasWidth / 2)
      ) {
        Matter.Body.set(obstacle, 'ahead', !obstacle.ahead)
        Matter.Body.setVelocity(obstacle, {
          x: -obstacle.velocity.x,
          y: obstacle.velocity.y,
        })
      }

      switch (obstacle.direction) {
        case 'left':
          if (obstacle.position.x < 0) {
            this.getEventEmmitter().emit('obstaclePartOver', obstacle)
          }
          break
        case 'right':
          if (obstacle.position.x > canvasWidth) {
            this.getEventEmmitter().emit('obstaclePartOver', obstacle)
          }
          break
        case 'bottom':
          if (obstacle.position.y > canvasWidth) {
            this.getEventEmmitter().emit('obstaclePartOver', obstacle)
          }
          break
        case 'top':
          if (obstacle.position.y < 0) {
            this.getEventEmmitter().emit('obstaclePartOver', obstacle)
          }
          break
      }
    })
  }
}

module.exports = Press
