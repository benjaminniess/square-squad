'use strict'

const Press = require('./obstacles/press')
const SimpleHole = require('./obstacles/simple-hole')
const SpaceInvaders = require('./obstacles/space-invaders')

class ObstaclesManager {
  constructor() {
    this.obstacles = []
    this.level = 0
  }

  getObstacles() {
    return this.obstacles
  }

  resetObstacles() {
    this.obstacles = []
  }

  getObstaclesParts() {
    let parts = []
    _.forEach(this.getObstacles(), (obstacle, key) => {
      parts = _.concat(parts, obstacle.getParts())
    })

    return parts
  }

  getLevel() {
    return this.level
  }

  setLevel(level) {
    this.level = level
  }

  initObstacle(params = {}) {
    let obstacleID = helpers.getRandomInt(1, 4)
    params.level = this.getLevel()

    switch (obstacleID) {
      case 1:
        this.obstacles.push(new SpaceInvaders(params))
        break
      case 2:
        this.obstacles.push(new SimpleHole(params))
        break
      case 3:
        this.obstacles.push(new Press(params))
        break
      default:
        break
    }
  }

  updateObstacles() {
    let updatedObstacles = []

    _.forEach(this.getObstacles(), (obstacle, obstacleKey) => {
      obstacle.loop()
      updatedObstacles = _.merge(this.obstaclesParts, obstacle.getParts())
      if (obstacle.isOver()) {
        delete this.obstacles[obstacleKey]
        this.obstacles = this.obstacles.filter(Boolean)
      }
    })

    return updatedObstacles
  }
}

module.exports = ObstaclesManager
