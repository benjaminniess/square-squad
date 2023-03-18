import {Container} from "typedi";
import {Player} from './Player'
import {MasterGame} from '../games/master-game'
import {PlayersRepository} from "../repositories/PlayersRepository";
import {Server} from "socket.io";

export {Room}

const _ = require('lodash')

const games = {
  panicAttack: require('../games/panic-attack'),
  wolfAndSheeps: require('../games/wolf-and-sheeps')
}

class Room {
  private name: string
  private slug: string
  private io: Server
  private adminPlayer?: string
  private game: any
  private players: Player[] = []
  private playersRepository: PlayersRepository

  constructor(roomData: RoomDto) {
    this.name = roomData.name
    this.slug = roomData.socketSlug
    this.io = Container.get('io')
    this.setGame('panic-attack')
    this.playersRepository = Container.get(PlayersRepository)
  }

  getName(): string {
    return this.name
  }

  getSlug(): string {
    return this.slug
  }

  getGame(): MasterGame {
    return this.game
  }

  getBasicData(): LightRoomDto {
    return {
      slug: this.getSlug(),
      name: this.getName(),
      url: this.getLobbyURL()
    }
  }

  setGame(gameID: string) {
    switch (gameID) {
      case 'panic-attack':
        this.game = new games.panicAttack(this)
        break
      case 'wolfs-and-sheeps':
        this.game = new games.wolfAndSheeps(this)
        break
    }
  }

  addPlayer(player: Player) {
    this.players.push(player)
  }

  removePlayer(player: Player) {
    this.players = this.players.filter((playerElement: Player) => {
      return player.getSocketID() === playerElement.getSocketID()
    })
  }

  getPlayersEntities(): Player[] {
    return this.players
  }

  getPlayers() {
    let players = this.io.sockets.adapter.rooms.get(this.getSlug())
    return players ? _.toArray(players) : []
  }

  getAdminPlayer() {
    return this.adminPlayer
  }

  getLobbyURL(): string {
    return '/rooms/' + this.getSlug()
  }

  setAdminPlayer(playerID: string): void {
    this.adminPlayer = playerID
  }

  /**
   * Auto elect a new admin when the previous one is leaving
   */
  resetLeader() {
    let socketClients = this.getPlayers()

    socketClients.map((socketID: string) => {
      if (this.getAdminPlayer() !== socketID) {
        this.setAdminPlayer(socketID)
      }
    })
  }

  refreshPlayers(disconnectedPlayerSocketID: string | null = null) {
    let game = this.getGame()

    let globalRanking = game.getRanking()
    let currentRoundRanking = game.getLastRoundRanking()
    let socketClients = this.getPlayers()
    let sessionsInRoom: any[] = []
    let playersData = game.getPlayersManager().getPlayersData()

    _.forEach(socketClients, (socketID: string) => {
      let playerObj
      try {
        playerObj = this.playersRepository.findOrFailBySocketID(socketID)
      } catch (exception) {
        return
      }

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
        alive: playersData[socketID] && playersData[socketID].alive,
        isAdmin: false
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
    this.io.in(this.getSlug()).emit('refresh-players', sessionsInRoom)

    return sessionsInRoom
  }
}
