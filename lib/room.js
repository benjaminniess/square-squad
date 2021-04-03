'use strict'
const Player = require('./player')

class Room {
  constructor(slug, name) {
    this.name = name
    this.slug = slug
    this.players = {}
  }

  getName() {
    return this.name
  }

  getSlug() {
    return this.slug
  }

  getPlayers() {
    return this.players
  }

  addPlayer(playerID, nickname) {
    this.players[playerID] = new Player(playerID, nickname)
  }

  removePlayer(playerID) {
    delete this.players[playerID]
  }
}

module.exports = Room
