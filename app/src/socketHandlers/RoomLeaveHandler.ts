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
    socket.rooms.forEach((roomSlug: string) => {
      if (socket.id !== roomSlug) {
        socket.leave(roomSlug)

        try {
          this.roomsRepository.findOrFailBySlug(roomSlug).then(room => {
            if (room.leader.socketId === socket.id) {
              this.roomsRepository.maybeResetLeader(room)
            } else {
              this.playersRepository.findOrFailBySocketID(socket.id).then(player => {
                this.roomsRepository.removePlayerFromRoom(player, room)
              }).catch(error => {
                return
              })

            }
          })
        } catch (exception: any) {
          return
        }
      }
    })
  }
}
