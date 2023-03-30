import {Inject, Service} from "typedi";
import {RoomsRepository} from "../repositories/RoomsRepository";
import {GameInstancesRepository} from "../repositories/GameInstancesRepository";

@Service()
export class GameInstancesRefresher {
  private lockedRefresh: boolean = false;
  private roomsRepository: RoomsRepository
  private gameInstancesRepository: GameInstancesRepository

  constructor(
    @Inject() roomsRepository: RoomsRepository,
    @Inject() gameInstancesRepository: GameInstancesRepository
  ) {
    this.roomsRepository = roomsRepository
    this.gameInstancesRepository = gameInstancesRepository

    setInterval(() => {
      if (this.lockedRefresh) {
        return
      }

      this.lockedRefresh = true
      this.roomsRepository.findAll().then((rooms) => {
        rooms.map(room => {
          if (room.gameStatus === GameStatus.Ready_to_Start) {
            this.gameInstancesRepository.addForRoom(room, {gameType: GameType.Panick_Attack})
          } else if (room.gameStatus === GameStatus.End_Round) {
            this.gameInstancesRepository.removeForRoom(room)
          }
        })
      })

      this.lockedRefresh = false
    }, 2000)
  }

}
