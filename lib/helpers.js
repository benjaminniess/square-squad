const Room = require('../lib/room')
const Player = require('./player')
const crypto = require('crypto')

class Helpers {
  /**
   * Slugify a string with spaces or accents
   *
   * @param {string} str
   * @returns
   */
  static stringToSlug(str) {
    str = str.replace(/^\s+|\s+$/g, '') // trim
    str = str.toLowerCase()

    // remove accents, swap ñ for n, etc
    var from = 'àáäâèéëêìíïîòóöôùúüûñç·/_,:;'
    var to = 'aaaaeeeeiiiioooouuuunc------'
    for (var i = 0, l = from.length; i < l; i++) {
      str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i))
    }

    str = str
      .replace(/[^a-z0-9 -]/g, '') // remove invalid chars
      .replace(/\s+/g, '-') // collapse whitespace and replace by -
      .replace(/-+/g, '-') // collapse dashes

    return str
  }

  static getSessionStore() {
    return globalSessionStore
  }

  static getRooms() {
    return globalRooms
  }

  static getRoom(roomSlug) {
    if (typeof globalRooms[roomSlug] !== 'undefined') {
      return globalRooms[roomSlug]
    } else {
      return null
    }
  }

  static deleteRoom(roomSlug) {
    if (typeof globalRooms[roomSlug] !== 'undefined') {
      delete globalRooms[roomSlug]
    }
  }

  static getPlayers() {
    return globalPlayers
  }

  static getPlayer(sessionID) {
    if (!sessionID) {
      return false
    } else {
      if (globalPlayers[sessionID]) {
        return globalPlayers[sessionID]
      } else {
        globalPlayers[sessionID] = new Player(sessionID)
        return globalPlayers[sessionID]
      }
    }
  }

  static getPlayerFromSessionID(sessionID) {
    return this.getSessionStore().findSession(sessionID)
  }

  static getPlayerFromSocketID(socketID) {
    return this.getSessionStore().findSessionFromSocketID(socketID)
  }

  static updatePlayer(sessionID, playerData) {
    globalSessionStore.saveSession(sessionID, playerData)
  }

  static createRoom(roomName) {
    let roomSlug = this.stringToSlug(roomName)
    if (typeof globalRooms[roomSlug] !== 'undefined' || roomName === '') {
      return null
    }

    globalRooms[roomSlug] = new Room(roomSlug, roomName)

    return roomSlug
  }

  static getRandomID() {
    return crypto.randomBytes(8).toString('hex')
  }

  static getRandomInt(min, max) {
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min)) + min
  }
}

module.exports = Helpers
