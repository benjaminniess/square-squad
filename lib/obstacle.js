'use strict'

const { EventEmitter } = require('events')
const Matter = require('matter-js')
const Composite = Matter.Composite

class Obstacle {
  constructor(params) {
    this.level = params.level ? params.level : 1
    this.speedMultiplicator = params.speedMultiplicator
      ? params.speedMultiplicator
      : 1

    this.bodies = []
    this.eventEmitter = new EventEmitter()
    this.compositeObj = Matter.Composite.create()
  }

  getBodies() {
    return Composite.allBodies(this.getComposite())
  }

  getVertices() {
    let vertices = []

    _.forEach(this.getBodies(), (matterBody) => {
      let bodyVertices = []
      _.forEach(matterBody.vertices, (vertice) => {
        bodyVertices.push({ x: vertice.x, y: vertice.y })
      })

      vertices.push(bodyVertices)
    })

    return vertices
  }

  getEventEmmitter() {
    return this.eventEmitter
  }

  getComposite() {
    return this.compositeObj
  }

  getLevel() {
    return this.level
  }

  getSpeedMultiplicator() {
    return this.speedMultiplicator
  }

  isOver() {
    return _.size(this.getBodies()) === 0
  }

  loop() {}
}

module.exports = Obstacle
