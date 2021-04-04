'use strict'

const helpers = require('../lib/helpers')
const fs = require('fs')

class Room {
  constructor(slug, name) {
    this.name = name
    this.slug = slug

    this.setGame('wolf-and-sheeps')
  }

  getName() {
    return this.name
  }

  getSlug() {
    return this.slug
  }

  getGame() {
    return this.game
  }

  setGame(gameID) {
    fs.readFile(__base + '/games/' + gameID + '/infos.json', (err, data) => {
      if (err) {
        throw err
      }

      this.gameInfos = JSON.parse(data)
      this.gameInfos.id = gameID
    })

    let gameClass = require(__base + '/games/' + gameID)
    this.game = new gameClass()
  }

  getGameInfos() {
    return this.gameInfos
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

          this.getGame().initPlayer(sessionInRoom)
        } else {
          this.getGame().removePlayer(socketID)
        }

        if (countPlayers === i + 1) {
          io.in(this.getSlug()).emit('refreshPlayers', sessionsInRoom)
        }
      })
    })
  }
}

module.exports = Room
