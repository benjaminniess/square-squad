import {Container, Inject, Service} from "typedi";
import {Server} from "socket.io";
import {Socket} from "socket.io-client";
import {PlayersRepository} from "../repositories/PlayersRepository";
import {RoomsRepository} from "../repositories/RoomsRepository";

@Service()
export class RoomLeaveHandler {
  io: Server
  playersRepository: PlayersRepository
  roomsRepository: RoomsRepository

  constructor(@Inject() roomsRepository: RoomsRepository, @Inject() playersRepository: PlayersRepository) {
    this.io = Container.get('io')
    this.playersRepository = playersRepository
    this.roomsRepository = roomsRepository
  }

  public handle(socket: Socket | any): void {
    this.playersRepository.findOrFailBySocketID(socket.id).then(currentPlayer => {
      socket.rooms.forEach((roomSlug: string) => {
        if (socket.id !== roomSlug) {
          socket.leave(roomSlug)

          this.roomsRepository.findBySlug(roomSlug).then(room => {
            this.roomsRepository.removePlayerFromRoom(currentPlayer, room).then(() => {
              this.io.to(socket.id).emit('leave-room-result', {
                success: true,
              })

              room.players.then(players => {
                this.roomsRepository.resetLeader(room).then((leader) => {
                  this.io.in(room.slug).emit('refresh-players', {admin: leader?.socketId, players: players})
                })
              })

            })
          })
        }
      })
    }).catch(error => {
    })
  }
}
