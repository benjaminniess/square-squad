import {Service} from "typedi";
import {Room} from "../entity/Room";
import {Panick_Attack} from "../games/panic-attack";
import {Wolf_And_Sheep} from "../games/wolf-and-sheeps";
import {GameInterface} from "../games/GameInterface";


export {GameInstancesRepository}

const _ = require('lodash')

@Service()
class GameInstancesRepository {
  private gameInstances: GameInterface[] = []

  constructor() {
  }

  findAll(): GameInterface[] {
    return this.gameInstances
  }

  addForRoom(room: Room, gameParameters: NewGameInstanceDto): void {
    switch (gameParameters.gameType) {
      case GameType.Panick_Attack:
        this.gameInstances.push(new Panick_Attack(room))
        break
      default:
        this.gameInstances.push(new Wolf_And_Sheep(room))
        break
    }
  }

  removeForRoom(room: Room): void {
    this.gameInstances = this.gameInstances.filter(function (value, index, arr) {
      return value.getRoom().slug !== room.slug;
    });
  }
}
