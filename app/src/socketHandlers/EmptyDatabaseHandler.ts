import {Container, Inject, Service} from "typedi";
import {Server} from "socket.io";
import {Socket} from "socket.io-client";
import {PlayersRepository} from "../repositories/PlayersRepository";
import {RoomsRepository} from "../repositories/RoomsRepository";

@Service()
export class EmptyDatabaseHandler {
  io: Server
  playersRepository: PlayersRepository
  roomsRepository: RoomsRepository

  constructor(@Inject() roomsRepository: RoomsRepository, @Inject() playersRepository: PlayersRepository) {
    this.io = Container.get('io')
    this.playersRepository = playersRepository
    this.roomsRepository = roomsRepository
  }

  public handle(socket: Socket | any, data: any): void {
    if (process.env.NODE_ENV !== 'development' && process.env.NODE_ENV !== 'test') {
      return
    }

    this.playersRepository.clear().then(() =>
      this.roomsRepository.clear().then(() => {
        this.io.to(socket.id).emit('empty-database-result', {
          success: true,
        })
      })
    )
  }
}
