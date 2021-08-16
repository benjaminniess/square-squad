export { Player }
class Player {
  private socketID: string
  private nickName: string
  private color: string
  private isSpectatorVal: boolean

  constructor(socketID: string) {
    this.socketID = socketID
    this.nickName = ''
    this.color = ''
    this.isSpectatorVal = false
  }

  resetData(data: any) {
    if (data.nickName) {
      this.nickName = data.nickName
    }

    if (data.color) {
      this.color = data.color
    }

    if (data.isSpectatorVal) {
      this.isSpectatorVal = data.isSpectatorVal
    }
  }

  getSocketID() {
    return this.socketID
  }

  getColor() {
    return this.color
  }

  getNickname() {
    return this.nickName
  }

  isSpectator() {
    return this.isSpectatorVal
  }
}
