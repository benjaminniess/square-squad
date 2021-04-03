'use strict'

const helpers = require('../lib/helpers')

class Room {
  constructor(slug, name) {
    this.name = name
    this.slug = slug
  }

  getName() {
    return this.name
  }

  getSlug() {
    return this.slug
  }

  getPlayers() {
    return Array.from(io.sockets.adapter.rooms.get(this.getSlug()))
  }

  refreshPlayers(disconnectedPlayerSocketID = null) {
    let socketClients = this.getPlayers()
    let sessionsInRoom = []
    let countPlayers = socketClients.length
    socketClients.map((socketID, i) => {
      helpers.getPlayerFromSocketID(socketID).then((sessionInRoom) => {
        // If a player is about to disconnect, don't show it in the room
        if (disconnectedPlayerSocketID !== socketID) {
          sessionsInRoom.push(sessionInRoom)
        }

        if (countPlayers === i + 1) {
          io.in(this.getSlug()).emit('refreshPlayers', sessionsInRoom)
        }
      })
    })
  }
}

module.exports = Room
