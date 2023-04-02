import {PlayerInputsState} from './dto/PlayerInputsState'
import {PlayerInputs} from "./enums/PlayerInputs";
import {CoordinateDto} from "../../dto/game-instance/CoordinateDto";
import {PlayerVectorizedInput} from "./dto/PlayerVectorizedInput";
import {Service} from "typedi";

@Service()
export class PlayersInputManager {
  private readonly playersInputs: Array<PlayerInputsState> = []

  public findAllPlayersInputs(): Array<PlayerInputsState> {
    return this.playersInputs
  }

  public findPlayerInputs(playerID: string) {
    return this.findAllPlayersInputs()[this.getPlayerIndex(playerID)]
  }

  public getPlayersVectorizedMoveRequests() {
    let playersMovesRequests: Array<PlayerVectorizedInput> = []
    this.playersInputs.map((playerInputRequest: PlayerInputsState) => {
      let playerMoveVector: CoordinateDto = {x: 0, y: 0}
      if (playerInputRequest.up) {
        playerMoveVector.y = 1
      }

      if (playerInputRequest.right) {
        playerMoveVector.x = 1
      }
      if (playerInputRequest.down) {
        playerMoveVector.y = -1
      }
      if (playerInputRequest.left) {
        playerMoveVector.x = -1
      }

      if (playerMoveVector.x !== 0 && playerMoveVector.y !== 0) {
        playerMoveVector.x = playerMoveVector.x * 0.7
        playerMoveVector.y = playerMoveVector.y * 0.7
      }
      playersMovesRequests.push({
        socketID: playerInputRequest.socketID,
        moveVector: playerMoveVector
      })
    })

    return playersMovesRequests
  }

  public initPlayer(socketID: string) {
    this.playersInputs.push({
      socketID: socketID,
      up: false,
      down: false,
      left: false,
      right: false
    })
  }

  public setPlayerButtonState(playerID: string, button: PlayerInputs, state: boolean) {
    const arrayKey = this.getPlayerIndex(playerID)

    this.playersInputs[arrayKey][button] = state
  }

  public resetPlayerInputs(playerID: string) {
    const arrayKey = this.getPlayerIndex(playerID)

    this.playersInputs[arrayKey] = {
      socketID: playerID,
      up: false,
      down: false,
      right: false,
      left: false
    }
  }

  public removePlayer(playerID: string) {
    delete this.playersInputs[this.getPlayerIndex(playerID)]
  }

  private getPlayerIndex(socketID: string): number {
    const index = this.playersInputs.findIndex(playerData => playerData?.socketID === socketID)
    if (!Number.isInteger(index) || index < 0) {
      throw new Error("player-does-not-exist")
    }

    return index
  }
}
