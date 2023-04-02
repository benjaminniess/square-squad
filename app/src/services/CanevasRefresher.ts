import {Container, Inject, Service} from "typedi";
import {Server} from "socket.io";
import {RoomsRepository} from "../repositories/RoomsRepository";
import {GameInstancesRepository} from "../repositories/GameInstancesRepository";

@Service()
export class CanevasRefresher {
  private lockedRefresh: boolean = false;
  private io: Server;
  private roomsRepository: RoomsRepository
  private gameInstancesRepository: GameInstancesRepository

  constructor(@Inject() roomsRepository: RoomsRepository, @Inject() gameInstancesRepository: GameInstancesRepository) {
    this.roomsRepository = roomsRepository
    this.gameInstancesRepository = gameInstancesRepository
    this.io = Container.get('io')

    setInterval(async () => {
      if (this.lockedRefresh) {
        return
      }

      this.lockedRefresh = true
      await Promise.all(
        this.gameInstancesRepository.findAll().map(async gameInstance => {
          this.io.to(gameInstance.getRoom().slug).emit('refresh-canvas', gameInstance.refreshData())

          gameInstance.refreshData()
        })
      )

      this.lockedRefresh = false
    }, 20)
  }
}
