import {Container, Inject, Service} from "typedi";
import {Server} from "socket.io";
import {Socket} from "socket.io-client";
import {PlayersRepository} from "../repositories/PlayersRepository";
import {RoomsRepository} from "../repositories/RoomsRepository";
import {SocketDatabaseSynchronizer} from "../services/SocketDatabaseSynchronizer";

@Service()
export class RoomsRefreshHandler {
  io: Server
  playersRepository: PlayersRepository
  roomsRepository: RoomsRepository
  socketDatabaseSynchronizer: SocketDatabaseSynchronizer

  constructor(
    @Inject() socketDatabaseSynchronizer: SocketDatabaseSynchronizer,
    @Inject() roomsRepository: RoomsRepository,
    @Inject() playersRepository: PlayersRepository
  ) {
    this.io = Container.get('io')
    this.playersRepository = playersRepository
    this.roomsRepository = roomsRepository
    this.socketDatabaseSynchronizer = socketDatabaseSynchronizer
  }

  public handle(socket: Socket | any): void {
    this.playersRepository.findOrFailBySocketID(socket.id).then(player => {
      this.socketDatabaseSynchronizer.deleteGhostPlayersFromDatabase().then(() => {
        this.socketDatabaseSynchronizer.deleteGhostRoomsFromDatabase().then(() => {
          this.roomsRepository.findAll().then(rooms => {
            this.io.to(socket.id).emit('refresh-rooms-result', {
              success: true,
              data: rooms
            })
          })
        })
      })
    }).catch(error => {
      this.io.to(socket.id).emit('refresh-rooms-result', {
        success: false,
        error: 'player-not-logged'
      })
      return
    })
  }
}
