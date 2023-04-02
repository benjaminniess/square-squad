import {Container, Inject, Service} from "typedi";
import {RoomsRepository} from "../repositories/RoomsRepository";
import {GameInstancesRepository} from "../repositories/GameInstancesRepository";
import {GameStatus} from "../enums/GameStatus";
import {Server} from "socket.io";

@Service()
export class GameInstancesRefresher {
  private lockedRefresh: boolean = false;
  private io: Server;
  private roomsRepository: RoomsRepository
  private gameInstancesRepository: GameInstancesRepository

  constructor(
    @Inject() roomsRepository: RoomsRepository,
    @Inject() gameInstancesRepository: GameInstancesRepository
  ) {
    this.roomsRepository = roomsRepository
    this.gameInstancesRepository = gameInstancesRepository
    this.io = Container.get('io')

    setInterval(() => {
      if (this.lockedRefresh) {
        return
      }

      this.lockedRefresh = true
      this.roomsRepository.findAll().then((rooms) => {
        rooms.map(room => {
          if (this.gameInstancesRepository.findByRoomSlug(room.slug)?.getStatus() !== room.gameStatus) {

          }
          if (room.gameStatus === GameStatus.Ready_to_Start) {
            this.gameInstancesRepository.addForRoom(room).then(() => {
              this.roomsRepository.updateStatus(room, GameStatus.Playing).then(() => {
                this.io.to(room.slug).emit('update-game-status', {status: GameStatus.Playing})
              })
            })
          } else if (room.gameStatus === GameStatus.Playing) {

          } else if (room.gameStatus === GameStatus.End_Round) {
            this.gameInstancesRepository.removeForRoom(room)
          }
        })
      })

      this.lockedRefresh = false
    }, 2000)
  }
}
