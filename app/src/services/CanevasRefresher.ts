import {Container, Inject, Service} from "typedi";
import {Server} from "socket.io";
import {RoomsRepository} from "../repositories/RoomsRepository";

const _ = require('lodash')

@Service()
export class CanevasRefresher {
  private lockedRefresh: boolean = false;
  private io: Server;
  private roomsRepository: RoomsRepository

  constructor(@Inject() roomsRepository: RoomsRepository) {
    this.roomsRepository = roomsRepository
    this.io = Container.get('io')

    setInterval(() => {
      if (this.lockedRefresh) {
        return
      }

      this.lockedRefresh = true
      this.roomsRepository.findAll().then((rooms) => {
        rooms.map(room => {
          let roomGame = room.game
          let status = room.game?.status

          if (roomGame && (status === 'playing' || status === 'starting')) {
            // TODO: refresh game data
            //this.io.to(room.slug).emit('refresh-canvas', roomGame.refreshData())
          }
        })
      })

      this.lockedRefresh = false
    }, 10)
  }

}
