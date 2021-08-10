const crypto = require('crypto')
const Rooms = require('./rooms')
const Players = require('./players')

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

  static getRooms() {
    return Rooms.getRooms()
  }

  static getRoomsData() {
    return Rooms.getRoomsData()
  }

  static getRoom(roomSlug) {
    return Rooms.getRoom(roomSlug)
  }

  static deleteRoom(roomSlug) {
    return Rooms.deleteRoom(roomSlug)
  }

  static deleteEmptyRooms() {
    return Rooms.deleteEmptyRooms()
  }

  static getPlayers() {
    return Players.getPlayers()
  }

  static getPlayer(socketID) {
    return Players.getPlayer(socketID)
  }

  static initPlayer(socketID, playerName, playerColor) {
    return Players.initPlayer(socketID, playerName, playerColor)
  }

  static updatePlayer(socketID, playerData) {
    return Players.updatePlayer(socketID, playerData)
  }

  static createRoom(roomName) {
    return Rooms.createRoom(roomName)
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
