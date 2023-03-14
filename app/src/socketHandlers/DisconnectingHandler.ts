import {Inject, Service} from "typedi";
import {Socket} from "socket.io-client";
import {PlayersRepository} from "../repositories/PlayersRepository";
import {RoomsRepository} from "../repositories/RoomsRepository";

@Service()
export class DisconnectingHandler {
  playersRepository: PlayersRepository
  roomsRepository: RoomsRepository

  constructor(@Inject() roomsRepository: RoomsRepository, @Inject() playersRepository: PlayersRepository) {
    this.playersRepository = playersRepository
    this.roomsRepository = roomsRepository
  }

  public handle(socket: Socket | any): void {
    socket.rooms.forEach((roomSlug: string) => {
      this.roomsRepository.findBySlug(roomSlug).then(room => {
        if (room) {
          if (room.leader.socketId === socket.id) {
            this.roomsRepository.maybeResetLeader(room)
          } else {
            this.playersRepository.findOrFailBySocketID(socket.id).then(player => {
              this.roomsRepository.removePlayerFromRoom(player, room)
            }).catch(error => {
              return
            })
          }
        }
      })
    })
  }
}
