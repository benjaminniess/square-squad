import {Service} from "typedi";
import {Room} from "../entity/Room";
import {GameInterface} from "../games/GameInterface";
import {GameType} from "../enums/GameType";
import {RoomDto} from "../dto/game-instance/RoomDto";
import {Sample} from "../games/sample";
import {PanicAttack} from "../games/panic-attack";
import {Wolf_And_Sheeps} from "../games/wolf-and-sheeps";

@Service()
export class GameInstancesRepository {
  private gameInstances: GameInterface[] = []

  constructor() {
  }

  public findAll(): GameInterface[] {
    return this.gameInstances
  }

  public findByRoomSlug(roomSlug: string): GameInterface {
    return this.gameInstances.find(i => i.getRoom().slug === roomSlug)
  }

  public async addForRoom(room: Room): Promise<void> {
    const roomDto: RoomDto = {
      slug: room.slug,
      name: room.name,
      players: (await room.players).map(({socketID, nickName, color}) => ({socketID, nickName, color}))
    }

    const gameParameters = JSON.parse(room.gameParameters)
    let instance
    switch (room.gameType) {
      case GameType.PanicAttack:
        instance = new PanicAttack(roomDto, gameParameters)

        break
      case GameType.Wolf_And_Sheeps:
        instance = new Wolf_And_Sheeps(roomDto, gameParameters)

        break
      default:
        instance = new Sample(roomDto, gameParameters)
        break
    }

    this.gameInstances.push(instance)
    instance.start()
  }

  public removeForRoom(room: Room): void {
    this.gameInstances = this.gameInstances.filter(function (value, index, arr) {
      return value.getRoom().slug !== room.slug;
    });
  }
}
