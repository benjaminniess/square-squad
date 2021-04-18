'use strict'

const helpers = require('../lib/helpers')
const fs = require('fs')
const _ = require('lodash')
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
    this.game = new gameClass(this)
  }

  getGameInfos() {
    return this.gameInfos
  }

  getPlayers() {
    let players = io.sockets.adapter.rooms.get(this.getSlug())
    return players ? _.toArray(players) : false
  }

  getAdminPlayer() {
    return this.adminPlayer
  }

  getLobbyURL() {
    return '/rooms/' + this.getSlug()
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
      let playersInGame = this.getGame().getRanking()

      let socketClients = this.getPlayers()
      let sessionsInRoom = []
      let countPlayers = socketClients.length
      let game = this.getGame()

      socketClients.map((socketID, i) => {
        helpers.getPlayerFromSocketID(socketID).then((sessionInRoom) => {
          let playerObj = helpers.getPlayer(sessionInRoom.sessionID)
          let playerID = playerObj.getPublicID()
          let index = _.findIndex(playersInGame, { playerID: playerID })

          let sessionToAdd = {
            id: playerObj.getPublicID(),
            nickname: playerObj.getNickname(),
            color: playerObj.getColor(),
            score: index === -1 ? 0 : playersInGame[index].score,
          }

          // If a player is about to disconnect, don't show it in the room
          if (disconnectedPlayerSocketID !== socketID) {
            if (this.getAdminPlayer() === playerObj.getPublicID()) {
              sessionToAdd.isAdmin = true
            } else {
              sessionToAdd.isAdmin = false
            }

            if (!playerObj.isSpectator()) {
              sessionsInRoom.push(sessionToAdd)
              if (game.getStatus() !== 'playing') {
                game.initPlayer(sessionToAdd)
              }
            }
          } else {
            game.removePlayer(playerObj.getPublicID())
          }

          if (countPlayers === i + 1) {
            io.in(this.getSlug()).emit('refreshPlayers', sessionsInRoom)
            resolve(sessionsInRoom)
          }
        })
      })
    })
  }
}

module.exports = Room
