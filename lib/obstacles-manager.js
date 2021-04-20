'use strict'

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

  initRandomObstacle(params = {}) {
    switch (helpers.getRandomInt(1, 3)) {
      case 1:
        this.obstacles.push(new SpaceInvaders(params))
        break
      case 2:
        this.obstacles.push(new SimpleHole(params))
        break
      default:
        break
    }
  }

  getLevel() {
    return this.level
  }

  setLevel(level) {
    this.level = level
  }

  initObstacle(params = {}) {
    this.initRandomObstacle(params)
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
