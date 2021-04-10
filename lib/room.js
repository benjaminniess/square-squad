'use strict'

const helpers = require('../lib/helpers')
const fs = require('fs')
const { resolve } = require('path')

class Room {
  constructor(slug, name) {
    this.name = name
    this.slug = slug
    this.adminPlayer = null
    this.gameStatus = 'waiting'
    this.setGame('panic-attack')
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

  /**
   * waiting : waiting for players to join the lobby
   * starting : redirecting users to the play screen + launching the countdown
   * playing : game has started
   *
   * @returns
   */
  getGameStatus() {
    return this.gameStatus
  }

  getPlayers() {
    return Array.from(io.sockets.adapter.rooms.get(this.getSlug()))
  }

  getAdminPlayer() {
    return this.adminPlayer
  }

  getLobbyURL() {
    return '/rooms/' + this.getSlug()
  }

  getPlayURL() {
    return '/rooms/' + this.getSlug() + '/play'
  }

  setGameStatus(status) {
    this.gameStatus = status
  }

  setAdminPlayer(playerID) {
    this.adminPlayer = playerID
  }

  /**
   * Auto elect a new admin when the previous one is leaving
   */
  resetAdminPlayer() {
    let socketClients = this.getPlayers()
    socketClients.map((socketID, i) => {
      helpers.getPlayerFromSocketID(socketID).then((sessionInRoom) => {
        if (this.getAdminPlayer() !== sessionInRoom.playerID) {
          this.setAdminPlayer(sessionInRoom.playerID)
        }
      })
    })
  }

  refreshPlayers(disconnectedPlayerSocketID = null) {
    return new Promise((resolve, reject) => {
      let socketClients = this.getPlayers()
      let sessionsInRoom = []
      let countPlayers = socketClients.length

      socketClients.map((socketID, i) => {
        helpers.getPlayerFromSocketID(socketID).then((sessionInRoom) => {
          // If a player is about to disconnect, don't show it in the room
          if (disconnectedPlayerSocketID !== socketID) {
            if (this.getAdminPlayer() === sessionInRoom.playerID) {
              sessionInRoom.isAdmin = true
            } else {
              sessionInRoom.isAdmin = false
            }

            if (!sessionInRoom.isSpectator) {
              sessionsInRoom.push(sessionInRoom)
              this.getGame().initPlayer(sessionInRoom)
            }
          } else {
            this.getGame().removePlayer(sessionInRoom.playerID)
          }

          if (countPlayers === i + 1) {
            resolve(sessionsInRoom)
          }
        })
      })
    })
  }
}

module.exports = Room
