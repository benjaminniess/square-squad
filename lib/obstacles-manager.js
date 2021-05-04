'use strict'

const Matter = require('matter-js')

const Composite = Matter.Composite

const Press = require('./obstacles/press')
const SimpleHole = require('./obstacles/simple-hole')
const SpaceInvaders = require('./obstacles/space-invaders')

const { EventEmitter } = require('events')

class ObstaclesManager {
  constructor(game, compositeObj) {
    this.obstacles = []
    this.level = 0
    this.game = game
    this.compositeObj = compositeObj
    this.eventEmitter = new EventEmitter()
  }

  getGame() {
    return this.game
  }

  getComposite() {
    return this.compositeObj
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

  setStartLevel(level) {
    this.startLevel = level
  }
  setLevel(level) {
    this.level = level
  }

  initObstacle(params = {}) {
    let obstacleID = helpers.getRandomInt(1, 4)
    params.level = this.getDynamicLevel()

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
        this.getEventEmmitter().emit('obstacleOver', {})
        delete this.obstacles[obstacleKey]
        this.obstacles = this.obstacles.filter(Boolean)
      }
    })

    return updatedObstacles
  }
}

module.exports = ObstaclesManager
