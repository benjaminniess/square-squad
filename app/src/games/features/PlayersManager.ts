import {FullPlayerDto} from "./dto/FullPlayerDto";
import {Service} from "typedi";

@Service()
export class PlayersManager {
  private readonly playersData: Array<FullPlayerDto>

  constructor() {
    this.playersData = []
  }

  public getPlayersData(): Array<FullPlayerDto> {
    return this.playersData
  }

  public initPlayer(playerSession: PlayerDto) {
    this.playersData.push({
      socketID: playerSession.socketID,
      nickName: playerSession.nickName,
      alive: true,
      color: playerSession.color,
      custom: {},
      x: null,
      y: null
    })
  }

  public getPlayerData(socketID: string): FullPlayerDto {
    return this.getPlayersData()[this.getPlayerIndex(socketID)]
  }

  public setPlayerData(playerData: FullPlayerDto) {
    this.playersData[this.getPlayerIndex(playerData.socketID)] = playerData
  }

  public setPlayerSingleData(socketID: string, property: string, value: any) {
    const index = this.getPlayerIndex(socketID)
    this.playersData[index][property] = value
  }

  public countAlivePlayers(): number {
    return this.playersData.filter(playerData => playerData.alive === true).length
  }

  public killPlayer(socketID: string) {
    this.setPlayerSingleData(socketID, 'alive', false)
  }

  public renewPlayers() {
    this.playersData.map(playerData => playerData.alive = true)
  }

  public removePlayer(socketID: string) {
    delete this.playersData[this.getPlayerIndex(socketID)]
  }

  private getPlayerIndex(socketID: string): number {
    const index = this.playersData.findIndex(playerData => playerData?.socketID === socketID)
    if (!Number.isInteger(index) || index < 0) {
      throw new Error("player-does-not-exist")
    }

    return index
  }
}
