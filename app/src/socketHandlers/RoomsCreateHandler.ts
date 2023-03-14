import {Container, Inject, Service} from "typedi";
import {Server} from "socket.io";
import {Socket} from "socket.io-client";
import {PlayersRepository} from "../repositories/PlayersRepository";
import {RoomsRepository} from "../repositories/RoomsRepository";
import {Room} from "../entity/Room";

const validator = require('validator')

@Service()
export class RoomsCreateHandler {
  io: Server
  playersRepository: PlayersRepository
  roomsRepository: RoomsRepository

  constructor(@Inject() roomsRepository: RoomsRepository, @Inject() playersRepository: PlayersRepository) {
    this.io = Container.get('io')
    this.playersRepository = playersRepository
    this.roomsRepository = roomsRepository
  }

  public handle(socket: Socket | any, data: any): void {
    if (!data.roomName || data.roomName ! instanceof String || data.roomName.length <= 0) {
      this.io.to(socket.id).emit('create-room-result', {
        success: false,
        error: 'room-name-is-empty'
      })
      return;
    }

    const roomName = validator.blacklist(data.roomName, "<>\\/'")
    if (!roomName || roomName.length <= 0) {
      this.io.to(socket.id).emit('create-room-result', {
        success: false,
        error: 'room-name-is-incorrect'
      })
      return
    }

    this.playersRepository.findOrFailBySocketID(socket.id).then(player => {
      this.roomsRepository.create(roomName).then((room: Room) => {
        this.io.to(socket.id).emit('create-room-result', {
          success: true,
          data: {roomSlug: room.slug}
        })

        this.roomsRepository.addPlayerToRoom(player, room).then(() => {
          this.roomsRepository.setLeader(room, player)
        })

      }).catch(error => {
        this.io.to(socket.id).emit('create-room-result', {
          success: false,
          error: 'name-is-already-taken'
        })
        return
      })
    }).catch(error => {
      this.io.to(socket.id).emit('create-room-result', {
        success: false,
        error: 'player-not-logged'
      })
      return
    })
  }
}
