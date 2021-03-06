'use strict'

const fs = require('fs')

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

  getBasicData() {
    return {
      slug: this.getSlug(),
      name: this.getName(),
      url: this.getLobbyURL()
    }
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
    return players ? _.toArray(players) : []
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

    socketClients.map((socketID) => {
      if (this.getAdminPlayer() !== socketID) {
        this.setAdminPlayer(socketID)
      }
    })
  }

  refreshPlayers(disconnectedPlayerSocketID = null) {
    let game = this.getGame()

    let globalRanking = game.getRanking()
    let currentRoundRanking = game.getLastRoundRanking()
    let socketClients = this.getPlayers()
    let sessionsInRoom = []
    let playersData = game.getPlayersManager().getPlayersData()

    _.forEach(socketClients, (socketID) => {
      let playerObj = helpers.getPlayer(socketID)
      let globalRankingIndex = _.findIndex(globalRanking, {
        playerID: socketID
      })
      let currentRoundRankingIndex = _.findIndex(currentRoundRanking, {
        playerID: socketID
      })

      let totalScore =
        globalRankingIndex === -1 ? 0 : globalRanking[globalRankingIndex].score

      if (currentRoundRanking[currentRoundRankingIndex]) {
        totalScore += currentRoundRanking[currentRoundRankingIndex].score
      }

      let sessionToAdd = {
        id: socketID,
        nickname: playerObj.getNickname(),
        color: playerObj.getColor(),
        score: totalScore,
        alive: playersData[socketID] && playersData[socketID].alive
      }

      // If a player is about to disconnect, don't show it in the room
      if (disconnectedPlayerSocketID !== socketID) {
        if (this.getAdminPlayer() === socketID) {
          sessionToAdd.isAdmin = true
        } else {
          sessionToAdd.isAdmin = false
        }

        if (!playerObj.isSpectator()) {
          sessionsInRoom.push(sessionToAdd)
          if (game.getStatus() !== 'playing') {
            game.getPlayersManager().initPlayer(sessionToAdd)
          }
        }
      } else {
        game.getPlayersManager().removePlayer(socketID)
      }
    })

    sessionsInRoom = _.orderBy(sessionsInRoom, ['score'], ['desc'])
    io.in(this.getSlug()).emit('refresh-players', sessionsInRoom)

    return sessionsInRoom
  }
}

module.exports = Room
