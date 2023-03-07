import {Container} from "typedi";
import {RandomContentGenerator} from "../../services/RandomContentGenerator";

export {}
const {canvasWidth, squareSize} = require('../../config/main')
const Matter = require('matter-js')
const Obstacle = require('../obstacle')
const _ = require('lodash')

class SimpleHole extends Obstacle {
  private readonly randomContentGenerator: RandomContentGenerator

  constructor(
    params = {
      slug: ''
    }
  ) {
    params.slug = 'simple-hole'
    super(params)
    this.randomContentGenerator = Container.get(RandomContentGenerator)

    this.init()
  }

  init() {
    let direction = this.randomContentGenerator.getRandomInt(1, 5)
    let holeSize = this.randomContentGenerator.getRandomInt(squareSize * 3, squareSize * 8)
    let obstacleWidth = this.randomContentGenerator.getRandomInt(squareSize, squareSize * 4)
    let obstacleSpeed = (this.getLevel() * this.getSpeedMultiplicator()) / 3

    let obstacleSpot = this.randomContentGenerator.getRandomInt(
      squareSize,
      canvasWidth - squareSize
    )

    let obstacle = {}
    let obstacleParts = []
    switch (direction) {
      case 1:
        obstacle = {
          x: canvasWidth + obstacleWidth / 2,
          y: obstacleSpot / 2,
          width: obstacleWidth,
          height: obstacleSpot,
          direction: 'left',
          speed: obstacleSpeed,
          vector: {x: -obstacleSpeed, y: 0}
        }

        obstacleParts.push(obstacle)

        obstacle = {
          x: canvasWidth + obstacleWidth / 2,
          y: obstacleSpot + canvasWidth / 2 + holeSize,
          width: obstacleWidth,
          height: canvasWidth,
          direction: 'left',
          speed: obstacleSpeed,
          vector: {x: -obstacleSpeed, y: 0}
        }

        obstacleParts.push(obstacle)
        break
      case 2:
        obstacle = {
          x: -obstacleWidth / 2,
          y: obstacleSpot / 2,
          width: obstacleWidth,
          height: obstacleSpot,
          direction: 'right',
          speed: obstacleSpeed,
          vector: {x: obstacleSpeed, y: 0}
        }

        obstacleParts.push(obstacle)

        obstacle = {
          x: -obstacleWidth / 2,
          y: obstacleSpot + canvasWidth / 2 + holeSize,
          width: obstacleWidth,
          height: canvasWidth,
          direction: 'right',
          speed: obstacleSpeed,
          vector: {x: obstacleSpeed, y: 0}
        }

        obstacleParts.push(obstacle)

        break
      case 3:
        obstacle = {
          x: obstacleSpot / 2,
          y: -obstacleWidth,
          width: obstacleSpot,
          height: obstacleWidth,
          direction: 'bottom',
          speed: obstacleSpeed,
          vector: {x: 0, y: obstacleSpeed}
        }

        obstacleParts.push(obstacle)

        obstacle = {
          x: obstacleSpot + holeSize + canvasWidth / 2,
          y: -obstacleWidth,
          width: canvasWidth,
          height: obstacleWidth,
          direction: 'bottom',
          speed: obstacleSpeed,
          vector: {x: 0, y: obstacleSpeed}
        }

        obstacleParts.push(obstacle)
        break
      case 4:
        obstacle = {
          x: obstacleSpot / 2,
          y: canvasWidth + obstacleWidth / 2,
          width: obstacleSpot,
          height: obstacleWidth,
          direction: 'top',
          speed: obstacleSpeed,
          vector: {x: 0, y: -obstacleSpeed}
        }

        obstacleParts.push(obstacle)

        obstacle = {
          x: obstacleSpot + holeSize + canvasWidth / 2,
          y: canvasWidth + obstacleWidth / 2,
          width: canvasWidth,
          height: obstacleWidth,
          direction: 'top',
          speed: obstacleSpeed,
          vector: {x: 0, y: -obstacleSpeed}
        }

        obstacleParts.push(obstacle)
        break
    }

    _.forEach(obstacleParts, (obstaclePart: any) => {
      let body = Matter.Bodies.rectangle(
        obstaclePart.x,
        obstaclePart.y,
        obstaclePart.width,
        obstaclePart.height,
        {
          frictionAir: 0,
          collisionFilter: {group: 2},
          isSensor: true,
          direction: obstaclePart.direction
        }
      )

      Matter.Body.setVelocity(body, obstaclePart.vector)
      Matter.Body.set(body, {
        direction: obstaclePart.direction,
        customType: 'obstacle',
        customSubType: this.getSlug()
      })

      Matter.Composite.add(this.getComposite(), body)
    })
  }

  loop() {
    _.forEach(this.getBodies(), (obstacle: any) => {
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

module.exports = SimpleHole
