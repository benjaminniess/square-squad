import {Room} from "../entity/Room";
import {RefreshedGameInstanceDto} from "../dto/game-instance/RefreshedGameInstanceDto";
import {PlayersManager} from "./features/PlayersManager";
import {PlayersInputManager} from "./features/PlayersInputsManager";
import {GameStatus} from "../enums/GameStatus";

export interface GameInterface {
  getSlug(): string

  getRoom(): Room

  getStatus(): GameStatus

  getPlayersManager(): PlayersManager

  getInputManager(): PlayersInputManager

  start(): void

  refreshData(): RefreshedGameInstanceDto
}
