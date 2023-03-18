import {Inject, Service} from "typedi";
import {SocketsRepository} from "../repositories/SocketsRepository";
import {RoomsRepository} from "../repositories/RoomsRepository";
import {PlayersRepository} from "../repositories/PlayersRepository";

@Service()
export class SocketDatabaseSynchronizer {
  private playerRepository: PlayersRepository
  private socketsRepository: SocketsRepository
  private roomsRepository: RoomsRepository

  constructor(
    @Inject() socketsRepository: SocketsRepository,
    @Inject() roomsRepository: RoomsRepository,
    @Inject() playersRepository: PlayersRepository,
  ) {
    this.playerRepository = playersRepository
    this.roomsRepository = roomsRepository
    this.socketsRepository = socketsRepository
  }

  async deleteGhostPlayersFromDatabase() {
    const activePlayersSocketIds = this.socketsRepository.findAllPlayers()
    if (!activePlayersSocketIds) {
      return
    }

    const inactivePlayers = await this.playerRepository.findMultipleWhereSocketIdNotIn(activePlayersSocketIds)
    if (!inactivePlayers) {
      return
    }

    inactivePlayers.map(async player => {
      (await this.roomsRepository.findAllByLeader(player)).map(async room => {
        await this.roomsRepository.resetLeader(room)
      })
      await this.playerRepository.delete(player)
    })
  }

  async deleteGhostRoomsFromDatabase() {
    const socketRoomsSlugs = this.socketsRepository.findRoomsSlugs()
    const emptyRooms = await this.roomsRepository.findAllWhereSlugNotIn(socketRoomsSlugs)
    if (!emptyRooms) {
      return
    }

    emptyRooms.map(async room => {
      const players = await room.players
      if (players.length > 0) {
        players.map(async player => {
          await this.playerRepository.deleteRoomAssociation(player)
        })
      }
      await this.roomsRepository.delete(room)
    })
  }
}
