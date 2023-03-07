import {RandomContentGenerator} from "../../services/RandomContentGenerator";
import {Container} from "typedi";

export {}
const {canvasWidth, squareSize} = require('../../config/main')
const Matter = require('matter-js')
const Obstacle = require('../obstacle')
const _ = require('lodash')

class SpaceInvaders extends Obstacle {
  private readonly randomContentGenerator: RandomContentGenerator

  constructor(
    params = {
      slug: ''
    }
  ) {
    params.slug = 'space-invader'
    super(params)
    this.randomContentGenerator = Container.get(RandomContentGenerator)

    this.init()
  }

  init() {
    let obstacleWidth = squareSize * 2
    let obstacleSpeed = this.getLevel() * this.getSpeedMultiplicator()
    let obstacle = {}
    let invaderRequiredWidth = obstacleWidth * 2.2
    let obstacleParts = []

    let rowCount = this.randomContentGenerator.getRandomInt(1, 4)
    for (let o = 0; o < rowCount; o++) {
      let countInvaders = this.randomContentGenerator.getRandomInt(3, 6)
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
          vector: {x: 0, y: obstacleSpeed / 4}
        }

        obstacleParts.push(obstacle)
      }
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
          isSensor: true
        }
      )

      Matter.Body.setVelocity(body, obstaclePart.vector)
      Matter.Body.set(body, {
        customType: 'obstacle',
        customSubType: this.getSlug()
      })

      Matter.Composite.add(this.getComposite(), body)
    })
  }

  loop() {
    _.forEach(this.getBodies(), (obstacle: any) => {
      if (obstacle.position.y > canvasWidth) {
        this.getEventEmmitter().emit('obstaclePartOver', obstacle)
      }
    })
  }
}

module.exports = SpaceInvaders
