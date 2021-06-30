'use strict'

class Player {
  constructor(socketID) {
    this.socketID = socketID
    this.nickName = null
    this.color = null
    this.isSpectatorVal = false
  }

  resetData(data) {
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

module.exports = Player
