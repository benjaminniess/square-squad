import {Container, Inject, Service} from "typedi";
import {Socket} from "socket.io-client";
import {PlayersRepository} from "../repositories/PlayersRepository";
import {SocketDatabaseSynchronizer} from "../services/SocketDatabaseSynchronizer";
import {RoomsRepository} from "../repositories/RoomsRepository";
import {Server} from "socket.io";

@Service()
export class DisconnectingHandler {
  io: Server
  playersRepository: PlayersRepository
  roomsRepository: RoomsRepository
  socketDatabaseSynchronizer: SocketDatabaseSynchronizer

  constructor(
    @Inject() socketDatabaseSynchronizer: SocketDatabaseSynchronizer,
    @Inject() playersRepository: PlayersRepository,
    @Inject() roomsRepository: RoomsRepository
  ) {
    this.playersRepository = playersRepository
    this.roomsRepository = roomsRepository
    this.socketDatabaseSynchronizer = socketDatabaseSynchronizer
    this.io = Container.get('io')
  }

  public handle(socket: Socket | any): void {
    this.playersRepository.findOrFailBySocketID(socket.id).then(currentPlayer => {
      currentPlayer.room.then(room => {

        if (!room) {
          return
        }

        this.roomsRepository.removePlayerFromRoom(currentPlayer, room).then(() => {
          this.roomsRepository.resetLeader(room).then(() => {
            room.players.then(players => {
              room.leader
                .then(leader => {
                  this.io.in(room.slug).emit('refresh-players', {admin: leader?.socketId, players: players})
                })
                .then(() => {
                  this.socketDatabaseSynchronizer.deleteGhostPlayersFromDatabase().then(() => {
                    this.socketDatabaseSynchronizer.deleteGhostRoomsFromDatabase()
                  })
                })
            })
          })
        })
      })
    }).catch(error => {
      return
    })
  }
}
