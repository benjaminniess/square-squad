export {}
import EventEmitter from 'events'
const { canvasWidth } = require('../config/main')
const helpers = require('../helpers/helpers')
const Matter = require('matter-js')
const Composite = Matter.Composite

const Press = require('../entities/obstacles/press')
const SimpleHole = require('../entities/obstacles/simple-hole')
const SpaceInvaders = require('../entities/obstacles/space-invaders')
const Ball = require('../entities/obstacles/ball')
const _ = require('lodash')

class ObstaclesManager {
  private obstacles: any[]
  private level: number
  private game: any
  private compositeObj: any
  private eventEmitter: EventEmitter
  private walls: any
  private startLevel: number = 1

  constructor(game: any) {
    this.obstacles = []
    this.level = 0
    this.game = game
    this.compositeObj = Matter.Composite.create({ label: 'obstacles' })
    this.eventEmitter = new EventEmitter()

    this.walls = Composite.create({ label: 'walls' })
    this.initWalls()
  }

  initWalls() {
    let commonProperties = {
      isStatic: true,
      collisionFilter: {
        category: 0x0010,
        mask: 0x1001
      },
      customType: 'wall'
    }

    Matter.Composite.add(this.walls, [
      // Top
      Matter.Bodies.rectangle(
        canvasWidth / 2,
        -5,
        canvasWidth,
        10,
        commonProperties
      ),
      // Left
      Matter.Bodies.rectangle(
        -5,
        canvasWidth / 2,
        10,
        canvasWidth,
        commonProperties
      ),
      // Right
      Matter.Bodies.rectangle(
        canvasWidth + 5,
        canvasWidth / 2,
        10,
        canvasWidth,
        commonProperties
      ),
      // Bottom
      Matter.Bodies.rectangle(
        canvasWidth / 2,
        canvasWidth + 5,
        canvasWidth,
        10,
        commonProperties
      )
    ])
  }

  getGame() {
    return this.game
  }

  getComposite() {
    return this.compositeObj
  }

  getWallsComposite() {
    return this.walls
  }

  getObstacles() {
    return this.obstacles
  }

  getComposites() {
    return Matter.Composite.allComposites(this.getComposite())
  }

  resetObstacles() {
    _.forEach(this.getComposites(), (obstacle: any) => {
      Matter.Composite.remove(this.getComposite(), obstacle, true)
    })

    this.level = 0
    this.obstacles = []
  }

  getObstaclesParts() {
    let parts: any[] = []
    _.forEach(this.getObstacles(), (obstacle: any, key: string) => {
      parts = _.concat(parts, obstacle.getVertices())
    })

    return parts
  }

  getStartLevel() {
    return this.startLevel
  }

  getLevel() {
    return this.level
  }

  getDynamicLevel() {
    return this.getLevel() + this.getStartLevel()
  }

  getEventEmmitter() {
    return this.eventEmitter
  }

  getObstacleFromBodyID(bodyID: string) {
    let matchedObstacle = null
    _.forEach(this.getObstacles(), (obstacle: any) => {
      _.forEach(obstacle.getBodies(), (body: any) => {
        if (body.id === bodyID) {
          matchedObstacle = obstacle
        }
      })
    })

    return matchedObstacle
  }

  setStartLevel(level: number) {
    this.startLevel = level
  }
  setLevel(level: number) {
    this.level = level
  }

  initObstacle(params: any = {}) {
    let obstacleID = helpers.getRandomInt(1, 5)
    if (params.obstacleID) {
      obstacleID = params.obstacleID
    }

    params.level = this.getDynamicLevel()

    let newObstacle: any
    switch (obstacleID) {
      case 1:
        newObstacle = new SpaceInvaders(params)
        break
      case 2:
        newObstacle = new SimpleHole(params)
        break
      case 3:
        newObstacle = new Press(params)
        break
      case 4:
        if (typeof params.count === 'undefined') {
          params.count = 4
        }

        if (params.count > 0) {
          newObstacle = new Ball(params)

          params.count--
          params.obstacleID = obstacleID
          this.initObstacle(params)
        } else {
          return
        }

        break
      default:
        break
    }

    newObstacle
      .getEventEmmitter()
      .on('obstaclePartOver', (obstaclePart: any) => {
        Matter.Composite.remove(newObstacle.getComposite(), obstaclePart)
      })

    this.obstacles.push(newObstacle)

    Matter.Composite.add(this.getComposite(), newObstacle.getComposite())
  }

  updateObstacles() {
    _.forEach(this.getObstacles(), (obstacle: any, obstacleKey: any) => {
      obstacle.loop()
      if (obstacle.isOver()) {
        Matter.Composite.remove(
          this.getComposite(),
          obstacle.getComposite(),
          true
        )

        this.getEventEmmitter().emit('obstacleOver', {})
        delete this.obstacles[obstacleKey]
      }
    })
    this.obstacles = this.obstacles.filter(Boolean)
  }
}

module.exports = ObstaclesManager
