export {Player}

class Player {
  private readonly playerData: PlayerDto

  constructor(playerData: PlayerDto) {
    this.playerData = playerData
  }

  getSocketID(): string {
    return this.playerData.socketID
  }

  getColor(): string {
    return this.playerData.color
  }

  getNickname(): string {
    return this.playerData.nickName
  }
}
