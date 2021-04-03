'use strict'

const helpers = require('../lib/helpers')

const speed = 6
const ballRadius = 10
const canvasWidth = 700

class Room {
  constructor(slug, name) {
    this.name = name
    this.slug = slug
    this.playersData = {}
    this.playersMoves = {}
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

  updatePlayerButtonState(socketID, button, state) {
    this.playersMoves[socketID][button] = state
  }

  refreshData() {
    for (const [socketID, moves] of Object.entries(this.playersMoves)) {
      if (moves.top) {
        this.playersData[socketID].y += speed
        if (this.playersData[socketID].y > canvasWidth - ballRadius) {
          this.playersData[socketID].y = canvasWidth - ballRadius
        }
      }
      if (moves.right) {
        this.playersData[socketID].x += speed
        if (this.playersData[socketID].x > canvasWidth - ballRadius) {
          this.playersData[socketID].x = canvasWidth - ballRadius
        }
      }
      if (moves.down) {
        this.playersData[socketID].y -= speed
        if (this.playersData[socketID].y < ballRadius) {
          this.playersData[socketID].y = ballRadius
        }
      }
      if (moves.left) {
        this.playersData[socketID].x -= speed
        if (this.playersData[socketID].x < ballRadius) {
          this.playersData[socketID].x = ballRadius
        }
      }
    }

    return this.playersData
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
          if (this.playersData[socketID]) {
            delete this.playersData[socketID]
            delete this.playersMoves[socketID]
          }
        }

        this.playersData[socketID] = {
          x: 100,
          y: 200,
          isWolf: false,
          name: sessionInRoom.nickName,
        }

        this.playersMoves[socketID] = {
          up: false,
          down: false,
          left: false,
          right: false,
        }

        if (countPlayers === i + 1) {
          io.in(this.getSlug()).emit('refreshPlayers', sessionsInRoom)
        }
      })
    })
  }
}

module.exports = Room
