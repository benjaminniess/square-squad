'use strict'

const helpers = require('../lib/helpers')

class Player {
  constructor(sessionID) {
    this.sessionID = sessionID
    this.socketID = null
    this.publicID = helpers.getRandomID()
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

    if (data.socketID) {
      this.socketID = data.socketID
    }

    if (data.isSpectatorVal) {
      this.isSpectatorVal = data.isSpectatorVal
    }

    helpers.updatePlayer(this.getSessionID(), {
      sessionID: this.getSessionID(),
      socketID: this.getSocketID(),
      publicID: this.getPublicID(),
      nickName: this.getNickname(),
      color: this.getColor(),
      isSpectatorVal: this.isSpectator(),
    })
  }

  getSessionID() {
    return this.sessionID
  }

  getSocketID() {
    return this.socketID
  }

  getPublicID() {
    return this.publicID
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
